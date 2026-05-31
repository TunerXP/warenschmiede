import os
import re


def verify_navigation():
    # Expected links in Kontakt dropdown (root-relative paths)
    expected_contact_files = [
        '/kontakt/kontakt.html',
        '/kontakt/ablauf-anfrage.html',
        '/kontakt/impressum.html',
        '/kontakt/ueber-mich.html'
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
                html = f.read()

            # Find Contact Dropdown. In the maintained navigation it has class "nav-contact".
            if 'class="main-nav"' in html and 'nav-contact' not in html:
                print(f"[FAIL] {file_path}: Has main-nav but no .nav-contact.")
                errors += 1
                continue

            if 'nav-contact' not in html:
                continue

            contact_start = html.find('nav-contact')
            menu_start = html.find('nav-more-menu', contact_start)
            if menu_start == -1:
                print(f"[FAIL] {file_path}: No .nav-more-menu inside .nav-contact.")
                errors += 1
                continue

            menu_end = html.find('</ul>', menu_start)
            if menu_end == -1:
                print(f"[FAIL] {file_path}: Contact menu is missing a closing </ul>.")
                errors += 1
                continue

            contact_menu = html[menu_start:menu_end]
            links = re.findall(r'<a\b[^>]*\shref="([^"]+)"', contact_menu)
            if len(links) != 4:
                print(f"[FAIL] {file_path}: Expected 4 links in Kontakt, found {len(links)}.")
                for href in links:
                    print(f" - {href}")
                errors += 1
                continue

            for expected in expected_contact_files:
                if expected not in links:
                    print(f"[FAIL] {file_path}: Missing Kontakt link target: {expected}")
                    errors += 1

            # Verify link targets existence.
            file_dir = os.path.dirname(file_path)
            for i, href in enumerate(links):
                if not href:
                    print(f"[FAIL] {file_path}: Link {i} has no href.")
                    errors += 1
                    continue

                if href.startswith('http') or href.startswith('mailto'):
                    continue

                # Remove anchor/query.
                href_without_anchor = href.split('#', 1)[0].split('?', 1)[0]

                if href_without_anchor.startswith('/'):
                    target_path = os.path.normpath('.' + href_without_anchor)
                else:
                    target_path = os.path.normpath(os.path.join(file_dir, href_without_anchor))

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

    return errors


if __name__ == "__main__":
    raise SystemExit(1 if verify_navigation() else 0)
