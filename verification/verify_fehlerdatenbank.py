from playwright.sync_api import sync_playwright, expect
import os

def test_fehlerdatenbank():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the file
        cwd = os.getcwd()
        filepath = f"file://{cwd}/fehlerdatenbank.html"
        page.goto(filepath)

        # Ensure directory exists
        os.makedirs("verification", exist_ok=True)

        # Verify title
        expect(page).to_have_title("Fehlerdatenbank – typische 3D-Druck-Probleme schnell lösen")

        # Verify Page Header
        print("Verifying Page Header...")
        header = page.locator(".page-header")
        expect(header).to_be_visible()
        expect(header.locator("h1")).to_have_text("Fehlerdatenbank – Probleme schnell lösen")
        header.screenshot(path="verification/fehlerdatenbank_header.png")

        # Verify usage section via text
        expect(page.get_by_role("heading", name="So nutzt du diese Seite")).to_be_visible()

        # Verify errors section
        expect(page.locator("h2#errors")).to_be_visible()

        # Verify help section
        expect(page.locator("h2#help")).to_be_visible()

        # Take full page screenshot
        page.screenshot(path="verification/fehlerdatenbank_full.png", full_page=True)

        # Take screenshot of the card grid
        print("Taking screenshot of card grid...")
        grid = page.locator(".card-grid").first
        if grid.count() > 0:
            grid.scroll_into_view_if_needed()
            grid.screenshot(path="verification/fehlerdatenbank_grid.png")

        print("Verification complete!")
        browser.close()

if __name__ == "__main__":
    test_fehlerdatenbank()
