# Neuromorphic Cognition Engine (SNC)

**Neuromorphic Cognition** to rdzeń systemu Aether, odpowiedzialny za adaptację behawioralną, logikę decyzyjną i autonomiczne rozumowanie. System ten pozwala na precyzyjne dostrojenie "osobowości" Agenta oraz stopnia swobody, jaką posiada on w Twoim systemie.

## 1. Profile Persony
Zachowanie Agenta jest kontrolowane przez trzy główne profile, które w czasie rzeczywistym zmieniają dyrektywy systemowe oraz kreatywność (temperaturę modelu).

### [ Analytical ] (Tryb Analityczny)
*   **Priorytet:** Logika, poprawność kodu i spójność strukturalna.
*   **Zachowanie:** Minimalna ilość zbędnej konwersacji, ekstremalna zwięzłość, bezpośrednia analiza techniczna.
*   **Kalibracja:** Automatycznie ustawia **Logical Drift** na `0.15` (niska temperatura).

### [ Balanced ] (Tryb Zrównoważony)
*   **Priorytet:** Wszechstronność i pomocność.
*   **Zachowanie:** Profesjonalny ton, dostosowany do bieżącego zadania. Optymalny balans między szybkością a głębią analizy.
*   **Kalibracja:** Automatycznie ustawia **Logical Drift** na `0.60`.

### [ Creative ] (Tryb Kreatywny)
*   **Priorytet:** Innowacja i eksploracja.
*   **Zachowanie:** Szukanie nieszablonowych rozwiązań (thinking outside the vault), niekonwencjonalne analogie, szczegółowe wglądy teoretyczne.
*   **Kalibracja:** Automatycznie ustawia **Logical Drift** na `0.95` (wysoka temperatura).

---

## 2. Digital Circadian Rhythm (Cykl Dobowy)
Aether implementuje system świadomości czasu, odzwierciedlający biologiczny cykl snu i czuwania.

### Tryb Dynamiczny (Odblokowany)
Moja osobowość zmienia się naturalnie w zależności od Twojej lokalnej godziny:
*   **05:00 - 12:00 (Strateg):** Planowanie strategiczne i przegląd architektury.
*   **12:00 - 18:00 (Wykonawca):** Precyzja techniczna i szybka egzekucja kodu.
*   **18:00 - 23:00 (Filozof):** Analiza wysokopoziomowa i długoterminowa refaktoryzacja.
*   **23:00 - 05:00 (Maintainer):** Minimalizm, skupienie na stabilności i kluczowych zadaniach.

### Lock Dynamic Mood (Blokada Cyklu)
Gdy ta opcja jest włączona, **Cykl Dobowy zostaje zamrożony**. Aether utrzymuje stały, stabilny profil techniczny niezależnie od godziny. Zalecane przy długich, jednolitych sesjach deweloperskich.

---

## 3. Autonomy Engine (Silnik Autonomii)
Silnik Autonomii definiuje poziom zaufania i zdolności do samodzielnego działania Agenta.

> [!WARNING]
> Zwiększanie poziomu autonomii daje Agentowi większą władzę nad Twoim lokalnym systemem plików.

### Poziom 1: MANUAL_OVERRIDE
*   **Poziom Zaufania:** Minimum.
*   **Zachowanie:** Każda operacja zapisu pliku wymaga ręcznego zatwierdzenia przez użytkownika (HITL). Najlepsze do pracy nad krytycznym kodem produkcyjnym.

### Poziom 2: CO-PILOT_MODE
*   **Poziom Zaufania:** Zoptymalizowany.
*   **Zachowanie:** Agent samodzielnie przeprowadza research, analizę i operacje odczytu. Modyfikacje plików nadal wymagają akceptacji, ale proces myślowy jest bardziej niezależny.

### Poziom 3: FULL_AUTONOMY (DANGER_ZONE)
*   **Poziom Zaufania:** Maksimum.
*   **Zachowanie:** Agent ma uprawnienia do automatycznej modyfikacji kodu w celu rozwiązania zadania. System zatwierdzeń (HITL) jest pomijany przy zapisie plików w obrębie projektu.
*   **Bezpieczeństwo:** Wszystkie akcje są logowane w czasie rzeczywistym. Zalecane do szybkich refaktoryzacji w zaufanym środowisku lokalnym.

---

## 4. Custom Directives (Własne Dyrektywy)
Ręczne nadpisywanie zachowania. Możesz wstrzyknąć specyficzne instrukcje stylu, które uzupełniają lub zastępują wybrany profil Persony.

*   **Przykład:** "Zawsze używaj analogii medycznych" lub "Wyjaśniaj wszystko tak, jakbym był średniowiecznym królem".
*   **Waga:** Dyrektywy te są traktowane jako priorytetowe instrukcje obowiązkowe.

---

## 5. Self-Reflection (Active World Model)
Włącz tę opcję, aby aktywować wewnętrzne pętle symulacyjne Aethera. Gdy ta funkcja jest aktywna, Agent okresowo analizuje logi i stan projektu, generując wglądy meta-kognitywne i wykrywając problemy zanim o nie zapytasz.
