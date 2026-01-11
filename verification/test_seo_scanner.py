
from playwright.sync_api import sync_playwright
import os

def run():
    # Use absolute path for local file access
    file_path = os.path.abspath('tools/seo-scanner.html')
    url = f'file://{file_path}'

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)

        # Click the start scan button
        page.click('#startScan')

        # Wait a bit for some rows to appear (the table body starts empty)
        page.wait_for_selector('#resultsBody tr td strong')

        # Take a screenshot
        page.screenshot(path='verification/seo_scanner_test.png', full_page=True)
        browser.close()

if __name__ == '__main__':
    run()
