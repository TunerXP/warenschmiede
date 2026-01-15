import os
from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the local file
        file_path = os.path.abspath("technologien.html")
        page.goto(f"file://{file_path}")

        # 1. Verify Note Box
        print("Verifying Note Box...")
        note_box = page.locator(".note-box")
        expect(note_box).to_be_visible()
        expect(note_box).to_contain_text("Hinweis zu Verfahren & Bildern")
        expect(note_box).to_contain_text("Transparenz: Die Detail-Makroaufnahmen auf dieser Seite sind KI-generierte Visualisierungen.")
        print("Note Box verified.")

        # 2. Verify Footer
        print("Verifying Footer...")
        footer = page.locator("footer.footer")
        expect(footer).to_be_visible()
        expect(footer).to_contain_text("Alle Rechte vorbehalten.")

        # Check copyright year
        year_span = page.locator("#copyright-year")
        expect(year_span).to_have_text("2026")
        print("Footer verified.")

        # Take screenshot of the whole page to see both note box (middle) and footer (bottom)
        # Note box is further up, so maybe scroll to it first and take partial screenshot?
        # Or take full page screenshot.

        # Scroll to note box
        note_box.scroll_into_view_if_needed()
        page.screenshot(path="verification/technologien_note_box.png")

        # Scroll to footer
        footer.scroll_into_view_if_needed()
        page.screenshot(path="verification/technologien_footer.png")

        browser.close()

if __name__ == "__main__":
    run()
