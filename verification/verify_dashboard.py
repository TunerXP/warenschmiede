
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the file directly since we are in a static environment
        cwd = os.getcwd()
        file_path = f"file://{cwd}/tools/index.html"
        page.goto(file_path)

        # Screenshot the whole page to see all new sections
        # We might need to scroll or take full page screenshot
        page.screenshot(path="verification/dashboard_full.png", full_page=True)

        # Screenshot specific new sections

        # 1. Werkstatt & Fertigung (Winkel-Rechner)
        # Scroll to it
        fabrication = page.locator("#fabrication-heading").first
        fabrication.scroll_into_view_if_needed()
        page.screenshot(path="verification/fabrication_section.png")

        # 2. Büro & Verwaltung (Quittungs-Generator)
        admin = page.locator("#admin-heading").first
        admin.scroll_into_view_if_needed()
        page.screenshot(path="verification/admin_section.png")

        # 3. Lernen & Wissen (Schweiß-Trainer)
        learning = page.locator("#learning-heading").first
        learning.scroll_into_view_if_needed()
        page.screenshot(path="verification/learning_section.png")

        browser.close()

if __name__ == "__main__":
    run()
