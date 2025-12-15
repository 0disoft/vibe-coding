# Polityka Bezpieczeństwa

> Ostatnia aktualizacja: {{LAST_UPDATED}}

## Technologie i Zasady Ochrony Danych

Dane użytkowników są bezpiecznie przetwarzane za pomocą środków ochrony stosowanych na wielu warstwach, w tym szyfrowania w spoczynku i TLS podczas przesyłania.

### Ochrona Hasła

**Hasła użytkowników nigdy nie są przechowywane w postaci zwykłego tekstu i są chronione przy użyciu najnowszych technologii haszowania.**

- **Algorytm**: {{ENC_ALGO_PASSWORD}}
- **Powód**: {{ENC_REASON_PASSWORD}}
- Unikalna sól (Salt) jest stosowana do każdego hasła, aby zapobiec atakom typu rainbow table.

### Szyfrowanie Danych

**Informacje wrażliwe są szyfrowane bezpośrednio przed zapisaniem, ze ściśle oddzielonym zarządzaniem kluczami.**

- **Algorytm**: {{ENC_ALGO_DATA}}
- **Powód**: {{ENC_REASON_DATA}}
- **Wyprowadzanie Klucza**: {{ENC_ALGO_KDF}} - {{ENC_REASON_KDF}}
- Używamy Szyfrowania Kopertowego (Envelope Encryption) do ochrony Kluczy Szyfrowania Danych (DEK) za pomocą oddzielnych Kluczy Szyfrowania Klucza (KEK).

### Integralność Danych

**Wysokowydajne funkcje skrótu są używane do weryfikacji, czy krytyczne dane systemowe nie zostały naruszone.**

- **Algorytm**: {{ENC_ALGO_INTEGRITY}}
- **Powód**: {{ENC_REASON_INTEGRITY}}

### Bezpieczeństwo Transportu

**Cała komunikacja między użytkownikami a serwerami jest chroniona przez szyfrowany tunel przy użyciu najnowszych protokołów bezpieczeństwa.**

- **Protokoł**: {{ENC_ALGO_TRANSPORT}}
- **Powód**: {{ENC_REASON_TRANSPORT}}
- HTTPS jest wymuszany dla całej komunikacji, a HSTS jest stosowany, aby rygorystycznie zapobiegać atakom typu downgrade.

## Bezpieczeństwo Administracyjne i Fizyczne

Oprócz środków technicznych, dokładnie zarządzamy bezpieczeństwem w odniesieniu do ludzi i procesów.

- **Kontrola Dostępu Pracowników**: Dostęp do danych jest przyznawany tylko niezbędnemu personelowi w oparciu o „Zasadę Najmniejszych Przywilejów”. Cała historia dostępu jest rejestrowana i audytowana. Dostęp bez uzasadnionej przyczyny jest surowo zabroniony.
- **Bezpieczeństwo Fizyczne**: Cała infrastruktura chmurowa stron trzecich działa w centrach danych, które uzyskały certyfikaty bezpieczeństwa fizycznego, takie jak ISO 27001.

## Bezpieczeństwo Konta i Sesji

- **Ochrona Logowania**: Stosujemy limity prób logowania i mechanizmy opóźniające, aby blokować zautomatyzowane ataki typu brute-force.
- **Zarządzanie Sesją**: Sesje wygasają automatycznie po okresie bezczynności, a powiadomienia są wysyłane w przypadku ważnych zmian na koncie.
- **Uwierzytelnianie Dwuskładnikowe**: Planujemy wprowadzić funkcjonalność 2FA w przyszłości.

## Bezpieczeństwo Aplikacji

Projektujemy z myślą o najlepszych praktykach bezpieczeństwa, takich jak OWASP Top 10, już od etapu rozwoju.

- **Walidacja Danych Wejściowych**: Do zapytań do bazy danych używane są instrukcje przygotowane (Prepared Statements) i ORM, a dane wejściowe użytkownika są walidowane zarówno po stronie serwera, jak i klienta.
- **Obrona przed Atakami**: Tokeny CSRF, atrybuty plików cookie SameSite i CSP (Polityka Bezpieczeństwa Treści) są stosowane w celu łagodzenia przejmowania sesji i ataków polegających na wstrzykiwaniu skryptów.

## Bezpieczeństwo Łańcucha Dostaw Oprogramowania

- **Zarządzanie Zależnościami**: Zewnętrzne biblioteki i pakiety są instalowane wyłącznie z oficjalnych rejestrów, a zweryfikowane wersje są zapewniane za pośrednictwem plików blokady.
- **Sprawdzanie Podatności**: Raporty o podatnościach są regularnie przeglądane, a zależności o wysokim ryzyku są priorytetowo aktualizowane.

## Przechowywanie i Usuwanie Danych

- **Usunięcie Konta**: Po złożeniu wniosku o usunięcie konta, powiązane dane są trwale niszczone po 30-dniowym okresie karencji (w celu odzyskania po przypadkowym usunięciu).
- **Dane Kopia Zapasowa**: Kopie zapasowe zapewniające stabilność systemu są przechowywane przez maksymalnie 90 dni, a następnie bezpiecznie usuwane. Ze względu na ograniczenia techniczne całkowite usunięcie z systemów kopii zapasowych może wymagać dodatkowego czasu.
- **Dane Logowania**: Dzienniki dostępu są przechowywane przez 1 rok w celu długoterminowej analizy zagrożeń bezpieczeństwa i identyfikacji trendów.
- **Wyjątek Przechowywania Prawnego**: Dane wymagane przez prawo do przechowywania przez określony czas mogą być przechowywane oddzielnie przez odpowiedni czas.

## Reagowanie na Incydenty

W przypadku incydentu bezpieczeństwa postępujemy zgodnie z tymi procedurami w celu szybkiej reakcji i minimalizacji szkód:

1. **Wykrywanie i Powstrzymywanie (Natychmiastowe)**: Izolowanie zagrożeń i zapobieganie dalszym szkodom.
2. **Analiza Wpływu**: Ocena zakresu i dotkliwości tak szybko, jak to możliwe, zazwyczaj w ciągu kilku godzin.
3. **Powiadomienie Użytkownika**: W przypadku incydentów mających wpływ na użytkowników (np. wycieki danych), powiadomienie użytkowników tak szybko, jak to możliwe i przestrzeganie terminów prawnych (np. 72 godziny).
4. **Przejrzyste Ujawnienie**: Opublikowanie szczegółowego raportu (przyczyna, działania, środki zapobiegawcze) po rozwiązaniu incydentu.

## Audyty Bezpieczeństwa i Usługi Stron Trzecich

- **Audyty Bezpieczeństwa**: Obecnie jesteśmy w fazie stabilizacji usług i przeprowadzamy regularne wewnętrzne przeglądy kodu i kontrole bezpieczeństwa. Planujemy wprowadzić regularne audyty bezpieczeństwa stron trzecich w miarę skalowania usługi.
- **Infrastruktura Stron Trzecich**: Przestrzegamy zasady nieprzechowywania bezpośrednio niezaszyfrowanych informacji wrażliwych. W przypadku kluczowych funkcji, takich jak płatności i uwierzytelnianie, korzystamy z zaufanych usług ({{THIRD_PARTY_PROVIDERS}} itp.), które uzyskały międzynarodowe certyfikaty bezpieczeństwa (SOC 2, ISO 27001) lub regularnie przechodzą równoważne oceny bezpieczeństwa.

## Zalecenia Dotyczące Bezpieczeństwa dla Użytkowników

Bezpieczeństwo konta to wspólna odpowiedzialność.

- **Silne Hasła**: Używaj unikalnych i złożonych haseł, które nie są używane w innych witrynach.
- **Uważaj na Phishing**: Uważaj na wiadomości podające się za oficjalne e-maile i sprawdzaj adres przed kliknięciem linków.

## Kontakt

Jeśli masz jakiekolwiek pytania dotyczące naszej Polityki Bezpieczeństwa, skontaktuj się z nami pod adresem [{{EMAIL}}](mailto:{{EMAIL}}).

Raporty o podatnościach i polityki ochrony badaczy znajdują się na naszej stronie [Program Bug Bounty](/pl/bug-bounty).
