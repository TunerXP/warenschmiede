
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Load the local file
        page.goto('file://' + os.path.abspath('ki/tools.html'))

        # Take screenshot of the top part (Intro + TOC)
        page.screenshot(path='verification/tools_top.png', full_page=False)

        # Take screenshot of the Wissen section (targeting the section, not the header)
        element = page.locator('section#ki-wissen')
        element.scroll_into_view_if_needed()
        page.screenshot(path='verification/tools_wissen.png')

        # Take screenshot of the Coding section
        element = page.locator('section#ki-coding')
        element.scroll_into_view_if_needed()
        page.screenshot(path='verification/tools_coding.png')

        # Take screenshot of the Bild section
        element = page.locator('section#ki-bild')
        element.scroll_into_view_if_needed()
        page.screenshot(path='verification/tools_bild.png')

        # Take screenshot of the Video section
        element = page.locator('section#ki-video')
        element.scroll_into_view_if_needed()
        page.screenshot(path='verification/tools_video.png')

        browser.close()

if __name__ == '__main__':
    run()
