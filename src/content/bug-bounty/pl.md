# Program Bug Bounty

> Ostatnia aktualizacja: {{LAST_UPDATED}}

## Wstęp

W {{SITE_NAME}} współpracujemy z badaczami bezpieczeństwa, aby tworzyć bezpieczniejsze środowisko internetowe. Jeśli znalazłeś lukę w zabezpieczeniach w naszej usłudze, skontaktuj się z nami natychmiast.

Ten program działa obecnie jako **Kanał Ujawniania Luk (Vulnerability Disclosure Channel)** skoncentrowany na odpowiedzialnym zgłaszaniu i współpracy, a nie na nagrodach pieniężnych. Cenimy i współpracujemy w sposób przejrzysty z badaczami, którzy etycznie ujawniają luki.

## Zakres (In-Scope)

Badacze mogą testować tylko następujące domeny i usługi:

- Oficjalna strona internetowa {{SITE_NAME}} i jej subdomeny
- Oficjalne aplikacje mobilne {{SITE_NAME}} (jeśli są dostępne)
- Punkty końcowe API obsługiwane bezpośrednio przez {{SITE_NAME}}

Domeny i usługi stron trzecich (bramki płatności, narzędzia analityczne, dostawcy hostingu itp.) niewymienione powyżej nie są objęte tym programem. Jeśli nie masz pewności, czy cel znajduje się w zakresie, skontaktuj się z nami przed rozpoczęciem testów.

## Polityka Nagród

Obecnie program Bug Bounty {{SITE_NAME}} nie oferuje regularnych nagród pieniężnych. Jednak aby okazać naszą wdzięczność za znaczący wkład, stosujemy następujące zasady:

- **Hall of Fame**: Wymienienie nazwisk badaczy, którzy zgłosili ważne luki (jeśli funkcjonuje).
- **Publiczne uznanie**: Zapewnienie publicznego uznania lub listu polecającego za zgodą badacza.
- **Przyszły priorytet**: Zapewnienie możliwości priorytetowego udziału w przypadku przejścia na program płatny w przyszłości.

W przyszłości możemy wprowadzić system nagród pieniężnych (Bounty) w zależności od budżetu i skali usług, o czym poinformujemy na tej stronie, jeśli zostanie wdrożony.

## Kryteria Ważności (Severity)

| Ważność | CVSS | Przykłady |
|---|---|---|
| Critical | 9.0-10.0 | Zdalne wykonanie kodu (RCE), pełny wyciek bazy danych, masowe przejęcie kont |
| High | 7.0-8.9 | SQL Injection, Stored XSS, obejście uwierzytelniania |
| Medium | 4.0-6.9 | Reflected XSS, CSRF przy wrażliwych akcjach, ujawnienie informacji |
| Low | 0.1-3.9 | Brak nagłówków bezpieczeństwa, ujawnienie wersji |

Ważność może zostać dostosowana w oparciu o rzeczywisty wpływ.

## Zgłaszanie Luk

### Kanały Zgłaszania

- **E-mail**: [{{EMAIL}}](mailto:{{EMAIL}})
- **Temat**: `[Security Report] Vulnerability Summary` (Podsumowanie luki)
- **Język**: Prosimy pisać po koreańsku, angielsku lub polsku.

### Format Raportu

Aby pomóc nam w analizie i reprodukcji problemu, prosimy o uwzględnienie następujących informacji:

1. Typ luki i szczegółowy opis.
2. Konkretne kroki do odtworzenia problemu (w tym skrypty lub wiersze poleceń).
3. Dotknięte adresy URL, punkty końcowe API lub komponenty.
4. Kod Proof of Concept (PoC) lub zrzuty ekranu.

### Standardy Jakości Raportu

- Raporty, których nie można odtworzyć lub które nie zawierają wystarczających szczegółów, mogą nie zostać przyjęte.
- Raporty z wyników automatycznych skanerów nie są akceptowane.
- **Duplikaty**: Zduplikowane luki są przypisywane tylko pierwszemu zgłaszającemu. (Na podstawie znacznika czasu odbioru serwera pocztowego)

### Proces

1. **Potwierdzenie Odbioru**: Wyślemy wiadomość e-mail z potwierdzeniem w ciągu 72 godzin od zgłoszenia.
2. **Analiza i Planowanie**: Po zweryfikowaniu luki ocenimy jej wagę i poinformujemy o szacowanym czasie naprawy. Jeśli nie dotrzymamy terminu, wyjaśnimy przyczynę i podamy zaktualizowany harmonogram.
3. **Rozwiązanie i Powiadomienie**: Powiadomimy Cię po zakończeniu łatki. Rozwiązanie może zająć trochę czasu, jeśli wymagane są zmiany strukturalne dla stabilności usługi.
4. **Ujawnienie i Uznanie**: Po rozwiązaniu zdecydujemy o ujawnieniu w porozumieniu z badaczem. Prawidłowe raporty zostaną uznane zgodnie z powyższą „Polityką Nagród”.
5. **Wydanie CVE**: W przypadku znaczących luk, za zgodą zgłaszającego, możemy wystąpić o wydanie numeru CVE.

### Polityka Publicznego Ujawniania (Public Disclosure)

- Zalecamy ujawnienie po zakończeniu łatki i prosimy o wcześniejsze udostępnienie nam szczegółów ujawnienia.
- Jeśli w ciągu **60 dni** od zgłoszenia nie zostaną podjęte odpowiednie działania, zgłaszający ma prawo do ujawnienia szczegółów luki w sposób wzajemnie uzgodniony. (Możemy jednak poprosić o dostosowanie harmonogramu w przypadku złożonych problemów).
- W pilnych przypadkach, gdy obserwuje się aktywne wykorzystywanie luki, możemy uzgodnić z Tobą wcześniejsze ujawnienie.

## Polityka i Wytyczne Testowania

Prosimy o przestrzeganie poniższych wytycznych dotyczących bezpiecznego testowania luk w zabezpieczeniach.

### Dozwolone Działania

- Testowanie luk przy użyciu kont, które posiadasz lub kont testowych, które utworzyłeś.
- **Minimalna Weryfikacja**: Uzyskuj dostęp tylko do minimalnej ilości danych niezbędnych do udowodnienia luki. Jeśli przypadkowo uzyskasz dostęp do poufnych informacji innych osób, natychmiast przerwij i dołącz do raportu tylko zamaskowane informacje.

### Środowisko Testowe

- **Wniosek o Konto Testowe**: Jeśli potrzebujesz konta testowego, możesz o nie poprosić pod adresem [{{EMAIL}}](mailto:{{EMAIL}}).
- **Skanowanie Automatyczne**: Lekkie skanowanie jest dozwolone, ale skanowanie pod dużym obciążeniem, które generuje nadmierną liczbę żądań na sekundę lub wpływa na jakość usługi, wymaga wcześniejszego uzgodnienia.

### Zabronione Działania (Poza Zakresem)

Następujące działania są surowo zabronione i mogą nie być prawnie chronione w przypadku naruszenia:

- Uruchamianie **nadmiernych automatycznych skanów** (na poziomie powodującym obciążenie usługi) bez wcześniejszego uzgodnienia.
- Wszelkie działania celowo wyczerpujące zasoby serwera (CPU, pamięć, dysk, przepustowość sieci).
- Uzyskiwanie dostępu lub modyfikowanie kont, danych lub danych osobowych innych użytkowników.
- Inżynieria społeczna (phishing itp.) lub ataki bezpieczeństwa fizycznego.

### Wyraźnie Poza Zakresem (Out-of-Scope)

- Luki znalezione w usługach lub infrastrukturze stron trzecich.
- Bezpieczeństwo fizyczne, systemy HR, sieci wewnętrzne.
- Już publiczne luki lub zduplikowane raporty.
- Problemy spowodowane wyłącznie wysyłaniem spamu lub wiadomości phishingowych.

### Luki o Niskim Ryzyku (Nieakceptowane)

Następujące elementy są wyłączone z programu, ponieważ stanowią niskie ryzyko bezpieczeństwa lub są zamierzonym zachowaniem:

- CSRF o niskim wpływie, takie jak CSRF wylogowania
- Clickjacking na stronach bez poufnych informacji
- Proste ujawnienie wersji (banner grabbing)
- Brakujące ustawienia bezpieczeństwa bez udowodnionej ścieżki wykorzystania (np. brak nagłówków bezpieczeństwa bez bezpośredniego wpływu, nieskonfigurowane polityki wysyłania e-maili itp.)
- Włączone autouzupełnianie przeglądarki

Jednak nawet powyższe elementy mogą zostać ocenione, jeśli zostaną połączone z innymi lukami w celu udowodnienia rzeczywistego scenariusza ataku.

### Ochrona Badacza (Safe Harbor)

Jeśli badasz i zgłaszasz luki w dobrej wierze i zgodnie z niniejszą polityką, obiecujemy, co następuje **w zakresie dozwolonym przez obowiązujące prawo**:

1. Uznajemy Twoje działania badawcze za autoryzowane badania bezpieczeństwa i nie podejmiemy przeciwko Tobie żadnych cywilnych ani karnych kroków prawnych.
2. Nie zgłosimy Cię dobrowolnie organom ścigania ani nie wniesiemy skargi.
3. Jeśli osoba trzecia podejmie kroki prawne w związku z Twoimi działaniami badawczymi, zapewnimy wsparcie w rozsądnym zakresie, takie jak dostarczenie dokumentacji potwierdzającej, że jesteś badaczem przestrzegającym zasad.

Jednak Safe Harbor nie ma zastosowania w następujących przypadkach:

- Wyraźne naruszenie działań zabronionych w tym dokumencie.
- Nieautoryzowane testowanie systemów lub infrastruktury stron trzecich poza naszą kontrolą.

## Kontakt

Jeśli masz jakiekolwiek pytania dotyczące naszego programu Bug Bounty, skontaktuj się z nami pod adresem [{{EMAIL}}](mailto:{{EMAIL}}).
