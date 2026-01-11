
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the file directly since we don't have a server running
        # We need absolute path for file:// protocol
        cwd = os.getcwd()
        file_path = f"file://{cwd}/tools/seo-scanner.html"

        print(f"Navigating to {file_path}")
        page.goto(file_path)

        # Wait for the page to load
        page.wait_for_selector(".scanner-container")

        # Take initial screenshot of UI structure
        page.screenshot(path="verification/seo_scanner_initial.png")
        print("Initial screenshot taken")

        # Click the scan button
        # Note: Since this is checking file:// urls, the fetch requests will likely fail
        # due to CORS or protocol issues in some environments, but we want to verify UI
        # structure and that the script runs.
        # However, Playwright with file:// can access other local files usually.

        page.click("#startScan")

        # Wait a bit for "loading" state or results
        page.wait_for_timeout(2000)

        # Take screenshot during/after scan
        page.screenshot(path="verification/seo_scanner_scanning.png")
        print("Scanning screenshot taken")

        browser.close()

if __name__ == "__main__":
    run()
