from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the local HTML file
        file_path = os.path.abspath("tpu-wissen.html")
        page.goto(f"file://{file_path}")

        # Verify Title
        print("Page Title:", page.title())

        # Verify Kunden Section Text
        kunden_section = page.locator("#kunden")
        print("Kunden Section Visible:", kunden_section.is_visible())

        # Check specific text updates
        # "Langsam & Dicht" card content
        langsam_text = "Viele Druckdienste setzen auf \"High-Speed\""
        if page.get_by_text(langsam_text).is_visible():
            print("SUCCESS: 'Langsam & Dicht' updated text found.")
        else:
            print("FAILURE: 'Langsam & Dicht' updated text NOT found.")

        # "Aktive Trocknung" card content
        trocknung_text = "Wir trocknen jedes Filament 24 Stunden aktiv vor"
        if page.get_by_text(trocknung_text).is_visible():
            print("SUCCESS: 'Aktive Trocknung' updated text found.")
        else:
            print("FAILURE: 'Aktive Trocknung' updated text NOT found.")

        # Verify Image Grid
        # Look for the grid container
        # Note: CSS classes with colons need escaping in selectors or use partial matching
        image_grid = page.locator(".grid.grid-cols-1.gap-6.mt-8")
        # Using a safer selector

        if image_grid.is_visible():
             print("SUCCESS: Image Grid container found.")
             images = image_grid.locator("img")
             count = images.count()
             print(f"Found {count} images in the grid.")
             if count == 2:
                 print("SUCCESS: Correct number of images in grid.")
             else:
                 print("FAILURE: Incorrect number of images in grid.")
        else:
             print("FAILURE: Image Grid container NOT found.")

        # Verify Maker Section Accordions
        maker_section = page.locator("#maker")

        # Check for new summaries
        summaries = ["Stabilität & Wände", "Geschwindigkeit & Flow", "No-Gos (Vermeiden!)"]
        for summary_text in summaries:
            if page.get_by_text(summary_text, exact=False).is_visible():
                print(f"SUCCESS: Accordion '{summary_text}' found.")
            else:
                print(f"FAILURE: Accordion '{summary_text}' NOT found.")

        # Screenshots
        # Kunden Section
        page.locator("#kunden").screenshot(path="verification/kunden_section.png")
        # Maker Section
        page.locator("#maker").screenshot(path="verification/maker_section.png")

        browser.close()

if __name__ == "__main__":
    run()
