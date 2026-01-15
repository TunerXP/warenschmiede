from playwright.sync_api import sync_playwright, expect

def verify_druck_tipps():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Open the file
        page.goto("file:///app/druck-tipps.html")

        # 1. Verify Error Cards (Schnellhilfe)
        # Check if at least one error card exists
        error_card = page.locator("details.error-card").first
        expect(error_card).to_be_visible()

        # Click to expand
        summary = error_card.locator("summary")
        summary.click()

        # Check content is visible
        content = error_card.locator(".error-content")
        expect(content).to_be_visible()

        # 2. Verify Temperature Grid
        temp_grid = page.locator(".temp-grid")
        expect(temp_grid).to_be_visible()

        # Check for specific cards
        pla_card = temp_grid.locator(".temp-card", has_text="PLA").first
        expect(pla_card).to_be_visible()
        expect(pla_card).to_contain_text("200°C")

        # 3. Verify Info Panels (Filament/Wartung)
        info_panel = page.locator(".info-panel").first
        expect(info_panel).to_be_visible()

        # Take screenshot of the whole page (or scrolling)
        # We'll take a screenshot of the main content
        main = page.locator("main")
        main.screenshot(path="verification/druck_tipps_redesign.png")

        browser.close()
        print("Verification successful!")

if __name__ == "__main__":
    verify_druck_tipps()
