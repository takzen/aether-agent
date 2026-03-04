# Przewodnik: Jak wdrażać aktualizacje Aether Agent na serwer Hetzner (Backend)

Ten dokument opisuje proces ręcznej aktualizacji Mózgu Aethera (serwera backendowego) na zewnętrznym serwerze VPS po wypuszczeniu zaktualizowanego kodu na gałąź `main` na platformie GitHub. Pamiętaj, że frontend (Vercel) aktualizuje się w całości automatycznie.

## Zanim zaczniesz
Upewnij się, że z komputera lokalnego wypchnąłeś wszystkie pomyślnie przetestowane zintegrowane zmiany poleceniem `git push origin main`. Wtedy maszyna produkcyjna będzie miała nowości do pobrania.

---

## Krótka instrukcja krok po kroku

### Krok 1: Zaloguj się na serwer VPS przez SSH
W swoim lokalnym terminalu/konsoli (Git Bash, PowerShell) uruchom połączenie z Twoim adresem IP na serwerii Hetzner.
```bash
ssh root@159.69.22.100
```
*(Zostaniesz poproszony o wpisanie hasła lub użyty zostanie automatycznie Twój klucz)*

### Krok 2: Pobierz nowe zmiany z GitHuba
Po udanym logowaniu przejdź do folderu z głównym kodem projektu agenta. Musisz powiedzieć kodowi, aby pobrał najnowsze pliki Pythona wrzucone np. przez branch `main`.
```bash
cd aether-pro
git pull origin main
```
> **Uwaga logistyki (GitHub PAT)**: Jeśli repozytorium jest prywatne, przy wywołaniu polecenia `git` konsola zapyta Cię o nazwę użytkownika (takzen) i wymusi tymczasowe hasło – wygeneruj nowy klucz ze strony GitHub (Classic Token) i wklej!

### Krok 3: Wyłącz i usuń nieaktualny pracujący w tle Mózg (Kontener)
Przechodzimy do gniazda Pythona (backend). Ponieważ Docker przetrzymuje starą instancję Aethera w wirtualnym sejfie i cały czas utrzymuje ją aktywną w tle serwera (na porcie 8000), nie wolno nam wpakować kolejnego – ten stary należy dezaktywować:
```bash
cd backend
docker stop aether
docker rm aether
```
> *Twoja pamięć LLM (`aether.db`) nigdzie nie zniknie! Żyje bezpiecznie poza kasowanym tymczasowym obwodem!*

### Krok 4: Skompiluj nową zaktualizowaną maszynerię
Kod został ściągalny z gita, a miejsce zrobione. Musisz poprosić maszynę linuksa pod spodem o instalację np. nowych bibliotek ze środowiska `uv` i przekompilowanie najnowszego Mózgu ze zaktualizowanym silnikiem na nowy czysty obraz kontenera o tej samej nazwie identyfikatora w środowisku.
```bash
docker build -t aether-backend .
```
*(Może to potrwać kilkanaście sekund).*

### Krok 5: Wskrzeszenie - Uruchom Mózg!
To ostatni etap! Masz już zaktualizowany obwód. Komenda znowu przywołuje Dockera i kładzie go w tło (`-d`). Mówimy maszynie "Zmapuj znów ten port, weź ten nowy obwód `aether-backend` z wszystkimi plikami `.env` oraz mapuj zewnętrzny, fizyczny plik bazy danych, by nasz przyjaciel niczego dziś nie zapomniał z wczoraj. I wznawiaj jego pracę w nieskończoność chyba że zginie":
```bash
docker run -d \
  --name aether \
  -p 8000:8000 \
  --env-file .env \
  -v $(pwd)/aether.db:/app/aether.db \
  --restart unless-stopped \
  aether-backend
```

**Gratulacje!** 
Możesz uderzyć w polecenie `exit` albo po prostu zamknąć terminal, by rozłączyć się z bezpiecznego klienta SSH. Od nowa zainstalowane środowisko produkcyjne samo obsłuży po API Twoją piękną stronę Vercela i poinformuje wszystkich w Internecie. 
Gdy napotkasz tu rzadkie kłopoty w locie z bazą wektorową na porcie lub modułami, posłuż się standardem awaryjnych logów:
```bash
docker logs aether --tail 50
```
