import random

def generate_aether_gradient():
    """Generuje parę kolorów HSL idealną dla Aether Agent (Purple/Cyan/Blue theme)."""
    
    # Podstawowe bazy (H, S, L)
    bases = [
        (270, 70, 60), # Purple
        (180, 70, 50), # Cyan
        (220, 80, 60), # Blue
        (300, 60, 50)  # Magenta/Pink
    ]
    
    color1 = random.choice(bases)
    # Wybieramy drugi kolor przesunięty o ok 30-40 stopni, aby gradient był harmonijny
    h2 = (color1[0] + random.randint(30, 60)) % 360
    color2 = (h2, color1[1], color1[2])
    
    print(f"Gradient Start:  hsl({color1[0]}, {color1[1]}%, {color1[2]}%)")
    print(f"Gradient End:    hsl({color2[0]}, {color2[1]}%, {color2[2]}%)")
    print(f"CSS Variable:    linear-gradient(135deg, hsl({color1[0]}, {color1[1]}%, {color1[2]}%), hsl({color2[0]}, {color2[1]}%, {color2[2]}%))")

if __name__ == "__main__":
    generate_aether_gradient()
