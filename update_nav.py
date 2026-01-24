import os
from bs4 import BeautifulSoup
import copy

ROOT_DIR = "."
MASTER_FILE = "index.html"

def get_master_nav():
    with open(MASTER_FILE, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")
        nav = soup.find("nav", class_="main-nav")
        if not nav:
            raise Exception("Could not find .main-nav in index.html")
        return nav

def adjust_paths(soup_element, depth):
    if depth == 0:
        return

    prefix = "../" * depth

    # Update hrefs
    for a in soup_element.find_all(href=True):
        href = a['href']
        if href.startswith(("http", "https", "mailto:", "tel:", "#", "javascript:")):
            continue

        # Handle absolute paths starting with / (treat as relative to web root)
        if href.startswith("/"):
            # e.g. /index.html -> ../index.html (at depth 1)
            new_href = prefix + href.lstrip("/")
        else:
            # e.g. ki/chat.html -> ../ki/chat.html
            new_href = prefix + href

        a['href'] = new_href

    # Update srcs (images inside nav)
    for img in soup_element.find_all(src=True):
        src = img['src']
        if src.startswith(("http", "https", "data:")):
            continue

        if src.startswith("/"):
            new_src = prefix + src.lstrip("/")
        else:
            new_src = prefix + src

        img['src'] = new_src

def update_file(filepath, master_nav_html):
    # Skip excluded files or directories if needed
    if "node_modules" in filepath:
        return

    print(f"Updating {filepath}...")
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            soup = BeautifulSoup(f, "html.parser")
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return

    old_nav = soup.find("nav", class_="main-nav")
    if not old_nav:
        print(f"Skipping {filepath}: No .main-nav found")
        return

    # Calculate depth
    rel_path = os.path.relpath(filepath, ROOT_DIR)
    # depth is number of separators. e.g. "index.html" -> 0, "dir/file.html" -> 1
    depth = rel_path.count(os.sep)

    # Create a fresh copy of master nav
    # We convert to string and back to ensure complete independence
    new_nav_soup = BeautifulSoup(str(master_nav_html), "html.parser")
    new_nav_tag = new_nav_soup.find("nav")

    adjust_paths(new_nav_tag, depth)

    # Replace
    old_nav.replace_with(new_nav_tag)

    # Write back
    # str(soup) usually returns unformatted HTML if the parser messed it up,
    # but BeautifulSoup(html, "html.parser") usually preserves structure fairly well
    # or we can use soup.prettify() but that adds extra whitespace.
    # We'll use str(soup) to minimize changes.
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(str(soup))

def main():
    print("Starting navigation update...")
    try:
        master_nav = get_master_nav()
    except Exception as e:
        print(f"Failed to load master navigation: {e}")
        return

    for root, dirs, files in os.walk(ROOT_DIR):
        # Exclude hidden dirs
        dirs[:] = [d for d in dirs if not d.startswith('.')]

        for file in files:
            if file.endswith(".html") and file != MASTER_FILE:
                filepath = os.path.join(root, file)
                update_file(filepath, master_nav)
    print("Navigation update complete.")

if __name__ == "__main__":
    main()
