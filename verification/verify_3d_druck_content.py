
import os
from playwright.sync_api import sync_playwright, expect

def verify_3d_druck_content():
    cwd = os.getcwd()
    file_path = os.path.join(cwd, 'leistungen/3d-druck.html')
    url = f'file://{file_path}'

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        print(f"Navigating to {url}")
        page.goto(url)

        # Verify new H1
        print("Checking H1...")
        expect(page.locator("h1")).to_contain_text("Dein 3D-Druck-Service – persönlich & präzise")

        # Verify text in Hero
        print("Checking Hero text...")
        expect(page.locator(".lead")).to_contain_text("Im Gegensatz zu anonymen Online-Portalen")

        # Verify new section "Warum ich ohne Upload-Formular arbeite"
        print("Checking 'Warum ich ohne Upload-Formular arbeite' section...")
        expect(page.locator("h3", has_text="Warum ich ohne Upload-Formular arbeite")).to_be_visible()

        # Verify "So einfach geht's"
        print("Checking 'So einfach geht's' section...")
        expect(page.locator("h2", has_text="So einfach geht's")).to_be_visible()

        # Verify Image
        print("Checking Hero Image...")
        # The user's code: <img src="/assets/images/marco_werkstatt.jpg" alt="Marco in der Warenschmiede" ...>
        # I plan to change the src to /assets/img/marco.jpg.
        # So I will expect the element with alt="Marco in der Warenschmiede" to be visible
        # and checking the src.
        img = page.get_by_alt_text("Marco in der Warenschmiede")
        expect(img).to_be_visible()

        # Check src attribute. Note that browser might resolve it relative to file:// root.
        # But the attribute value itself should match what I put in HTML.
        src = img.get_attribute("src")
        print(f"Image src: {src}")
        if "/assets/img/marco.jpg" not in src and "marco.jpg" not in src:
             print("WARNING: Image src might be incorrect.")

        # Take screenshot
        output_path = os.path.join(cwd, 'verification/3d_druck_verification.png')
        page.screenshot(path=output_path, full_page=True)
        print(f"Screenshot saved to {output_path}")

        browser.close()

if __name__ == "__main__":
    verify_3d_druck_content()
