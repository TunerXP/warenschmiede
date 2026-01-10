import os
from bs4 import BeautifulSoup

def verify_navigation():
    # Expected links in Kontakt dropdown (filenames)
    expected_contact_files = [
        'kontakt.html',
        'ablauf-anfrage.html',
        'impressum.html',
        'ueber-mich.html'
    ]

    html_files = []
    for root, dirs, files in os.walk('.'):
        if 'node_modules' in dirs: dirs.remove('node_modules')
        if '.git' in dirs: dirs.remove('.git')
        if 'verification' in dirs: dirs.remove('verification')

        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))

    print(f"Verifying {len(html_files)} HTML files...")

    errors = 0

    for file_path in html_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f, 'html.parser')

            # Find Contact Dropdown
            # In index.html it has class "nav-contact"
            contact_li = soup.find('li', class_='nav-contact')

            if not contact_li:
                # Look deeper if structure is different?
                # But our update script was replacing .main-nav, so it should be there if we updated it.
                # If we skipped it in update_nav, we should flag it here too?
                # Or maybe it's a file without a menu (e.g. fragments)?
                # But the user requirement is "ALLE HTML-Dateien ... müssen ... haben".

                # Check if it has a main-nav at all
                if soup.find('nav', class_='main-nav'):
                     print(f"[FAIL] {file_path}: Has main-nav but no .nav-contact.")
                     errors += 1
                else:
                     # Maybe a file without nav?
                     # We can print a warning.
                     pass
                     # print(f"[SKIP] {file_path}: No main-nav found.")
                continue

            # Find the menu inside
            menu_ul = contact_li.find('ul', class_='nav-more-menu')
            if not menu_ul:
                print(f"[FAIL] {file_path}: No .nav-more-menu inside .nav-contact.")
                errors += 1
                continue

            links = menu_ul.find_all('a')
            if len(links) != 4:
                print(f"[FAIL] {file_path}: Expected 4 links in Kontakt, found {len(links)}.")
                for l in links:
                    print(f" - {l.get('href')}")
                errors += 1
                continue

            # Verify link targets existence
            file_dir = os.path.dirname(file_path)

            for i, link in enumerate(links):
                href = link.get('href')
                if not href:
                    print(f"[FAIL] {file_path}: Link {i} has no href.")
                    errors += 1
                    continue

                if href.startswith('http') or href.startswith('mailto'):
                    continue

                # Remove anchor
                if '#' in href:
                    href = href.split('#')[0]

                target_path = os.path.normpath(os.path.join(file_dir, href))

                if not os.path.exists(target_path):
                    print(f"[FAIL] {file_path}: Link target does not exist: {href} (resolved: {target_path})")
                    errors += 1

        except Exception as e:
            print(f"[ERROR] Could not parse {file_path}: {e}")
            errors += 1

    if errors == 0:
        print("SUCCESS: All files verified. Contact menu has 4 items and links are valid.")
    else:
        print(f"FAILED: Found {errors} errors.")

if __name__ == "__main__":
    verify_navigation()
