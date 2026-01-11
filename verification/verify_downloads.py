from playwright.sync_api import sync_playwright, expect
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the local HTML file
        cwd = os.getcwd()
        file_url = f"file://{cwd}/downloads.html"
        print(f"Loading {file_url}")
        page.goto(file_url)

        # Wait for content to load
        page.wait_for_load_state("networkidle")

        # Locate the "Warenschmiede Suite V3" card content
        # We can look for the new text "Profi-Zentrale für deinen Desktop"
        expect(page.get_by_text("Profi-Zentrale für deinen Desktop")).to_be_visible()

        # Verify the list items
        expect(page.get_by_text("Komplett Offline:")).to_be_visible()
        expect(page.get_by_text("Kundenverwaltung:")).to_be_visible()
        expect(page.get_by_text("PDF-Engine:")).to_be_visible()

        # Verify the safety notice
        notice = page.locator("text=100% Virenfrei & Sicher")
        expect(notice).to_be_visible()

        # Take a screenshot of the specific card area + safety notice
        # Locate the card container. The card has class 'download-card highlight' and contains the text.
        card = page.locator(".download-card.highlight").filter(has_text="Warenschmiede Suite V3")

        if card.count() > 0:
            print("Card found, scrolling into view...")
            card.first.scroll_into_view_if_needed()
            # Screenshot the card
            page.screenshot(path="verification/downloads_verification.png")
            print("Screenshot saved to verification/downloads_verification.png")
        else:
            print("Card not found!")
            # Fallback screenshot of whole page
            page.screenshot(path="verification/downloads_verification_full.png")

        browser.close()

if __name__ == "__main__":
    run()
