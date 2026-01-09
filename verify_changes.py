import re

def verify_changes():
    try:
        with open('ki/chat.html', 'r', encoding='utf-8') as f:
            content = f.read()

        # Check for Senior changes
        if "'Sprechen & Übersetzen', value: 'voice_translator'" not in content:
            print("ERROR: Senior option missing")
            return False
        if "voice_translator: {" not in content:
            print("ERROR: Senior topic missing")
            return False
        if "Sie sprechen Deutsch, das Handy spricht Italienisch" not in content:
            print("ERROR: Senior message content missing")
            return False

        # Check for Adult changes
        if "'KI kann sehen? (Vision)', value: 'vision_help'" not in content:
            print("ERROR: Adult option missing")
            return False
        if "vision_help: {" not in content:
            print("ERROR: Adult topic missing")
            return False
        if "Das Feature heißt \"Vision\"" not in content and "Das Feature heißt 'Vision'" not in content:
            print("ERROR: Adult message content missing")
            return False

        # Check for Youth changes
        if "'Bilder generieren', value: 'gen_images'" not in content:
            print("ERROR: Youth option missing")
            return False
        if "gen_images: {" not in content:
            print("ERROR: Youth topic missing")
            return False
        if "Ein Astronaut reitet auf einem T-Rex" not in content:
            print("ERROR: Youth message content missing")
            return False

        print("SUCCESS: All changes verified in ki/chat.html")
        return True

    except Exception as e:
        print(f"ERROR: {e}")
        return False

if __name__ == "__main__":
    verify_changes()
