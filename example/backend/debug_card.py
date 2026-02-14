
from app.services.social_service import generate_social_card
import os

def test():
    title = "PARADOKS CYFROWEJ PIECZĄTKI - TEST_DŁUGIEGO_TYTUŁU_Z_UNDERSCORE"
    score = 85.5
    try:
        image_data = generate_social_card(title, score)
        with open("debug_test_card.png", "wb") as f:
            f.write(image_data)
        print("Success! Image saved to debug_test_card.png")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test()
