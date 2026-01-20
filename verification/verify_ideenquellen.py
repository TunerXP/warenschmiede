from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Test Desktop
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        # Use absolute path
        file_path = os.path.abspath("ideenquellen.html")
        page.goto(f"file://{file_path}")

        # Wait for content to load (static but good practice)
        page.wait_for_load_state("networkidle")

        # Take full page screenshot
        page.screenshot(path="verification/verification_desktop.png", full_page=True)

        # Test Mobile
        page_mobile = browser.new_page(viewport={"width": 375, "height": 667})
        page_mobile.goto(f"file://{file_path}")
        page_mobile.screenshot(path="verification/verification_mobile.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    run()
