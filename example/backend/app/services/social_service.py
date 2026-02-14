from PIL import Image, ImageDraw, ImageFont
import io
import os
from pathlib import Path

def get_font(font_type="regular", size=20):
    """Pobiera czcionkę z lokalnego folderu assets lub systemowego."""
    # 1. Sprawdź lokalny folder assets (gwarancja poprawnego wyglądu na serwerze)
    current_file_path = Path(__file__).resolve()
    # Path: backend/app/services/social_service.py -> assets jest w backend/app/assets
    assets_dir = current_file_path.parent.parent / "assets"
    
    font_filename = "consolab.ttf" if font_type == "bold" else "consola.ttf"
    local_font_path = assets_dir / font_filename
    
    if local_font_path.exists():
        try: return ImageFont.truetype(str(local_font_path), size)
        except: pass
    
    # 2. Rezerwowe ścieżki Windows
    if os.name == 'nt':
        win_path = f"C:\\Windows\\Fonts\\{font_filename}"
        if os.path.exists(win_path):
            try: return ImageFont.truetype(win_path, size)
            except: pass

    # 3. Rezerwowe ścieżki Linux
    linux_fonts = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeMonoBold.ttf"
    ] if font_type == "bold" else [
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf",
        "/usr/share/fonts/truetype/freefont/FreeMono.ttf"
    ]
    
    for p in linux_fonts:
        if os.path.exists(p):
            try: return ImageFont.truetype(p, size)
            except: pass

    return ImageFont.load_default()

def generate_social_card(title: str, score: float):
    width, height = 1200, 630
    img = Image.new('RGB', (width, height), color=(10, 10, 10))
    draw = ImageDraw.Draw(img)
    
    # Siatka (Grid) - co 40px (oryginalnie)
    for x in range(0, width, 40): draw.line([(x, 0), (x, height)], fill=(18, 18, 18), width=1)
    for y in range(0, height, 40): draw.line([(0, y), (width, y)], fill=(18, 18, 18), width=1)
        
    accent = (173, 255, 47) # Acid Green
    score_color = accent
    if score > 70: score_color = (255, 69, 0)
    elif score > 30: score_color = (255, 140, 0)
        
    margin = 40
    draw.rectangle([margin, margin, width-margin, height-margin], outline=accent, width=2)
    
    # Powrót do sprawdzonych rozmiarów
    f_head = get_font("regular", 22)
    f_title = get_font("bold", 60)
    f_score = get_font("bold", 90)
    f_foot = get_font("regular", 18)

    # Nagłówek
    draw.text((margin + 30, margin + 30), "[ BIEG_WSTECZNY // STATUS_RAPORTU: ALERT ]", font=f_head, fill=(100, 100, 100))

    # Zawijanie tytułu
    words = title.upper().split()
    lines, current = [], []
    for w in words:
        test = " ".join(current + [w])
        bbox = draw.textbbox((0, 0), test, font=f_title)
        if bbox[2] > width - (margin * 5): # Większy zapas, żeby nie wychodziło za ramkę
            lines.append(" ".join(current)); current = [w]
        else: current.append(w)
    lines.append(" ".join(current))
    
    # Rysowanie tytułu
    y = 160
    for l in lines[:3]:
        draw.text((margin + 30, y), l, font=f_title, fill=(255, 255, 255))
        y += 75

    # Wynik
    draw.text((margin + 30, height - 180), f"SCORE: {int(score)}/100", font=f_score, fill=score_color)

    # Stopka
    draw.text((width - margin - 350, height - margin - 35), "WWW.BIEGWSTECZNY.PL", font=f_foot, fill=accent)
    
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return buf.getvalue()
