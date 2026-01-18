from playwright.sync_api import sync_playwright
import os

def verify_slicer(page):
    filepath = os.path.abspath("slicer-einstellungen.html")
    page.goto(f"file://{filepath}")
    page.wait_for_selector("#materials")
    page.locator("#materials").scroll_into_view_if_needed()
    page.screenshot(path="verification/slicer_materials.png")
    print("Screenshot saved: verification/slicer_materials.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        try:
            verify_slicer(page)
        finally:
            browser.close()
