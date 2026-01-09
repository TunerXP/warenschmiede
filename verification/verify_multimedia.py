
from playwright.sync_api import sync_playwright

def verify_multimedia_features():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the chat page
        page.goto("http://localhost:8080/ki/chat.html")

        # 1. Verify Senior Persona
        print("Verifying Senior Persona...")
        # Reload to reset state
        page.reload()
        # Click on Senior persona card
        page.locator("div.persona-card").filter(has_text="Senior").click()
        # Check for 'Sprechen & Übersetzen' button
        try:
            # Wait for options to appear - Increased timeout to 30s because greeting is long
            page.wait_for_selector("button:has-text('Sprechen & Übersetzen')", timeout=30000)
            print("SUCCESS: Senior 'Sprechen & Übersetzen' button found.")

            # Click the button to see the response
            page.click("button:has-text('Sprechen & Übersetzen')")
            # Verify the response text
            page.wait_for_selector("div.message.host:has-text('Tippen ist mühsam')", timeout=30000)
            print("SUCCESS: Senior response text found.")

            # Take screenshot for Senior
            page.screenshot(path="verification/senior_verification.png")
        except Exception as e:
            print(f"ERROR: Senior verification failed: {e}")

        # 2. Verify Adult Persona
        print("\nVerifying Adult Persona...")
        page.reload()
        page.locator("div.persona-card").filter(has_text="Beruf & Alltag").click()
        try:
            # Increased timeout
            page.wait_for_selector("button:has-text('KI kann sehen? (Vision)')", timeout=30000)
            print("SUCCESS: Adult 'KI kann sehen? (Vision)' button found.")

            page.click("button:has-text('KI kann sehen? (Vision)')")
            page.wait_for_selector("div.message.host:has-text('Das wissen die wenigsten: Du kannst der KI Fotos zeigen!')", timeout=30000)
            print("SUCCESS: Adult response text found.")

            page.screenshot(path="verification/adult_verification.png")
        except Exception as e:
            print(f"ERROR: Adult verification failed: {e}")

        # 3. Verify Youth Persona
        print("\nVerifying Youth Persona...")
        page.reload()
        page.locator("div.persona-card").filter(has_text="Jugend & Schule").click()
        try:
            # Increased timeout
            page.wait_for_selector("button:has-text('Bilder generieren')", timeout=30000)
            print("SUCCESS: Youth 'Bilder generieren' button found.")

            page.click("button:has-text('Bilder generieren')")
            page.wait_for_selector("div.message.host:has-text('Vergiss Google Bilder')", timeout=30000)
            print("SUCCESS: Youth response text found.")

            page.screenshot(path="verification/youth_verification.png")
        except Exception as e:
            print(f"ERROR: Youth verification failed: {e}")

        browser.close()

if __name__ == "__main__":
    verify_multimedia_features()
