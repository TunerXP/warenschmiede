from playwright.sync_api import sync_playwright

def verify_download_card():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Navigate to the downloads page served by the local server
        page.goto("http://localhost:8000/downloads.html")

        # Wait for the download card to be visible
        # We can target it by the unique class combination or text
        card_locator = page.locator(".download-card.highlight")
        card_locator.wait_for(state="visible")

        # Take a screenshot of the entire page to see context, or just the card
        # Let's take the card specifically + some margin if possible,
        # but taking the viewport is safer to see placement.
        # We'll set a large viewport to capture enough
        page.set_viewport_size({"width": 1280, "height": 800})

        # Take screenshot of the card element
        card_locator.screenshot(path="verification/download_card.png")

        # Also take full page screenshot for context
        page.screenshot(path="verification/downloads_page_full.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_download_card()
