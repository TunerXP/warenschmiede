
from playwright.sync_api import sync_playwright, expect
import time

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # 1. Verify Index Grid Layout
        print("Checking index.html...")
        page.goto("http://localhost:8080/index.html")

        # Check if the grid section exists and slider is gone
        # The slider had class 'hero-slider-container'
        if page.locator(".hero-slider-container").count() > 0:
            print("ERROR: Slider container still found!")
        else:
            print("OK: Slider container removed.")

        # Check for the new grid section
        # We added a section with classes 'section container' and inline styles
        # And inside it a div with 'grid grid-cols-1 md:grid-cols-3'
        grid = page.locator(".grid.grid-cols-1.md\\:grid-cols-3")
        if grid.count() > 0:
            print("OK: Grid container found.")
            # Check for 3 cards
            cards = grid.locator("article.ws-card")
            count = cards.count()
            print(f"Found {count} cards in grid.")
            if count == 3:
                print("OK: 3 cards present.")
            else:
                print("ERROR: Expected 3 cards.")
        else:
            print("ERROR: Grid container not found!")

        # Take screenshot of Hero Section
        page.screenshot(path="verification/index_hero.png")
        print("Screenshot saved: verification/index_hero.png")


        # 2. Verify Admin Security
        print("\nChecking admin.html...")
        page.goto("http://localhost:8080/admin.html")

        # Check if Login Screen is visible
        login_header = page.locator("h2", has_text="Admin Login")
        if login_header.is_visible():
            print("OK: Login screen visible.")
        else:
            print("ERROR: Login screen not visible!")

        # Check if Main Content is hidden
        # The main container has class 'admin-container' and should be hidden via x-show="auth" (initially false)
        # However, Alpine JS runs on client side.
        # Wait a bit for Alpine to initialize if needed
        time.sleep(1)

        admin_container = page.locator(".admin-container")
        if not admin_container.is_visible():
            print("OK: Admin container is hidden.")
        else:
            print("ERROR: Admin container is visible before login!")

        # Attempt Login
        print("Attempting login...")
        page.fill("input[type='password']", "###Txp123###")
        page.click("button:has-text('Entsperren')")

        # Wait for auth state change
        time.sleep(1)

        if admin_container.is_visible():
            print("OK: Admin container visible after login.")
        else:
            print("ERROR: Admin container still hidden after login!")

        # Take screenshot of Dashboard
        page.screenshot(path="verification/admin_dashboard.png")
        print("Screenshot saved: verification/admin_dashboard.png")

        browser.close()

if __name__ == "__main__":
    verify_changes()
