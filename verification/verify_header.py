
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context()
        # Abort font requests
        context.route('**/*.{woff,woff2,ttf,otf}', lambda route: route.abort())

        page = context.new_page()
        page.goto(f'file://{os.getcwd()}/ki/chat.html', timeout=60000, wait_until='domcontentloaded')

        # Try taking a screenshot again
        page.screenshot(path='verification/viewport_screenshot.png', timeout=60000)

        browser.close()

if __name__ == '__main__':
    run()
