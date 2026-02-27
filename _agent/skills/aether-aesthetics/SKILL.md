# Skill: Aether Aesthetics

---
name: aether-aesthetics
description: Specjalistyczna wiedza i narzędzia do tworzenia interfejsów klasy Premium dla projektu Aether Agent.
---

To "umiejętność" skupia się na dostarczaniu wizualnego efektu WOW, zgodnie ze standardami określonymi w `GEMINI.md`.

## Główne Zasady (Design Tokens)

### 1. Paleta Kolorystyczna (Modern HSL)
Unikamy kolorów systemowych. Stawiamy na głębokie biele, neonowe akcenty i warstwowe czernie.
*   **Background:** HSL(240, 10%, 4%) - Ultra Deep Grey/Black
*   **Card Background:** HSL(240, 10%, 9%) z opacitiy (Glassmorphism)
*   **Primary Accent:** HSL(270, 70%, 60%) - Lush Purple
*   **Secondary Accent:** HSL(180, 70%, 50%) - Cyber Cyan

### 2. Glassmorphism (Efekt Szklany)
Każdy panel powinien wyglądać jak półprzezroczysta tafle szkła.
*   `backdrop-filter: blur(12px);`
*   `background: rgba(255, 255, 255, 0.03);`
*   `border: 1px solid rgba(255, 255, 255, 0.08);`

### 3. Animacje (Framer Motion)
Interfejs musi "żyć".
*   Hover: Delikatne powiększenie (scale: 1.02) i rozjaśnienie borderu.
*   Layout: Używamy `AnimatePresence` dla płynnego pojawiania się elementów.
*   Micro-interactions: Każdy klikalny element musi mieć feedback wizualny.

## Narzędzia w folderze scripts/
*   `generate_hsl.py`: Skrypt do generowania pasujących par kolorów dla gradientów.

## Najlepsze Praktyki
1.  **Zawsze dodawaj `shadow-2xl`** dla uniesionych paneli.
2.  **Używaj `tracking-widest` i `uppercase`** dla małych nagłówków technicznych.
3.  **Gradienty nie mogą być agresywne** - kierunek 135deg z subtelnym przejściem kolorów.
