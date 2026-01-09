
from playwright.sync_api import sync_playwright, expect

def verify_chat(page):
    print("Verifying Chat...")
    page.goto("http://localhost:8080/ki/chat.html")

    # Select Skeptiker persona
    page.click("text=Skeptiker")

    # Wait for greeting and click "Lokale KI (Datenschutz)"
    # The greeting takes some time to type out.
    # We wait for the option to appear.
    page.wait_for_selector("button:has-text('Lokale KI (Datenschutz)')", timeout=20000)
    page.click("button:has-text('Lokale KI (Datenschutz)')")

    # Verify the first message of the new flow
    # "Dann schauen Sie sich unbedingt **LM Studio** an."
    # Note: ** is converted to <strong>.
    expect(page.locator("#chat-body")).to_contain_text("Dann schauen Sie sich unbedingt")
    expect(page.locator("#chat-body")).to_contain_text("LM Studio")

    page.screenshot(path="verification/chat_step1.png")

    # Click "Brauche ich einen Super-Computer?"
    page.wait_for_selector("button:has-text('Brauche ich einen Super-Computer?')")
    page.click("button:has-text('Brauche ich einen Super-Computer?')")

    # Verify response
    expect(page.locator("#chat-body")).to_contain_text("Jein. Ein normaler Gaming-PC")

    page.screenshot(path="verification/chat_step2.png")

    # Click "Okay, wo finde ich das?"
    page.wait_for_selector("button:has-text('Okay, wo finde ich das?')")
    page.click("button:has-text('Okay, wo finde ich das?')")

    # Verify final link
    expect(page.locator("#chat-body")).to_contain_text("LM Studio Website")

    page.screenshot(path="verification/chat_final.png")
    print("Chat verified.")

def verify_tools(page):
    print("Verifying Tools...")
    page.goto("http://localhost:8080/ki/tools.html")

    # Check if LM Studio card exists
    expect(page.locator("#tool-lmstudio")).to_be_visible()
    expect(page.locator("text=Führe KI-Modelle (LLMs) komplett offline")).to_be_visible()

    # Scroll to it for screenshot
    page.locator("#tool-lmstudio").scroll_into_view_if_needed()
    page.screenshot(path="verification/tools_lmstudio.png")
    print("Tools verified.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_chat(page)
            verify_tools(page)
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/failure.png")
            raise e
        finally:
            browser.close()
