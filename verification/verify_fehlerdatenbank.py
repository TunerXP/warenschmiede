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

        # Verify title
        expect(page).to_have_title("Fehlerdatenbank – typische 3D-Druck-Probleme schnell lösen")

        # Verify hero heading
        expect(page.locator("#error-hero")).to_have_text("Fehlerdatenbank – typische 3D-Druck-Probleme schnell lösen")

        # Verify usage section via text
        expect(page.get_by_role("heading", name="So nutzt du diese Seite")).to_be_visible()

        # Verify errors section
        expect(page.locator("#errors")).to_be_visible()

        # Verify material hints section
        expect(page.locator("#material-hints")).to_be_visible()

        # Verify final CTA section
        expect(page.locator("#final-cta")).to_be_visible()

        # Take full page screenshot
        page.screenshot(path="verification/fehlerdatenbank_full.png", full_page=True)

        # Take screenshot of the card grid
        page.locator(".card-grid").first.screenshot(path="verification/fehlerdatenbank_grid.png")

        browser.close()

if __name__ == "__main__":
    test_fehlerdatenbank()
