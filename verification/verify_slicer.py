from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1400, 'height': 800}) # Wide viewport to check full width

        # Resolve absolute path to the file
        file_path = os.path.abspath("slicer-einstellungen.html")
        page.goto(f"file://{file_path}")

        # Wait for page to load
        page.wait_for_load_state("networkidle")

        # Take a screenshot of the Hero section
        page.screenshot(path="verification/slicer_hero.png", clip={'x': 0, 'y': 0, 'width': 1400, 'height': 600})

        # Take a screenshot of the Slicer Software Cards (Section 2)
        # Find the section by heading
        software_section = page.locator("section[aria-labelledby='software']")
        software_section.scroll_into_view_if_needed()
        software_section.screenshot(path="verification/slicer_cards.png")

        # Take a screenshot of the "Wichtige Einstellungen" (Section 3) with cards and details
        settings_section = page.locator("section[aria-labelledby='terms']")
        settings_section.scroll_into_view_if_needed()
        settings_section.screenshot(path="verification/slicer_settings.png")

        # Take full page screenshot
        page.screenshot(path="verification/slicer_full.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    run()
