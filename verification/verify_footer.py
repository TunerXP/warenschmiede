from playwright.sync_api import sync_playwright
import os

def verify_footer():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Get absolute path to current directory
        cwd = os.getcwd()

        files_to_check = [
            "index.html",
            "ki/index.html",
            "ki/ki-finder.html",
            "leistungen.html"
        ]

        for file in files_to_check:
            print(f"Checking {file}...")
            # Use file:// protocol for static files
            filepath = f"file://{cwd}/{file}"
            print(f"  Navigating to {filepath}")
            page.goto(filepath)

            # Wait for the script to run and update the year
            page.wait_for_timeout(500) # Wait 500ms for JS execution

            # Check for the span with ID copyright-year
            copyright_span = page.locator("#copyright-year")

            if copyright_span.count() > 0:
                text = copyright_span.text_content()
                print(f"  Found copyright-year span: {text}")
                # Get current year
                import datetime
                current_year = str(datetime.datetime.now().year)
                if text == current_year:
                     print(f"  SUCCESS: Year matches current year ({text})")
                else:
                     print(f"  WARNING: Expected {current_year}, got {text}")
            else:
                print(f"  ERROR: Span #copyright-year not found in {file}")

            # Take screenshot of the footer
            # We scroll to bottom
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            page.screenshot(path=f"verification/footer_{file.replace('/', '_')}.png")

        browser.close()

if __name__ == "__main__":
    verify_footer()
