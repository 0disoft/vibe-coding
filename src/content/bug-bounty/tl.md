# Bug Bounty Program

> Huling Na-update: {{LAST_UPDATED}}

## Panimula

Sa {{SITE_NAME}}, nakikipagtulungan kami sa mga security researcher upang lumikha ng isang mas ligtas na kapaligiran sa internet. Kung nakakita ka ng kahinaan sa seguridad (security vulnerability) sa aming serbisyo, mangyaring makipag-ugnayan kaagad sa amin.

Ang programang ito ay kasalukuyang tumatakbo bilang isang **Vulnerability Disclosure Channel** na nakatuon sa responsableng pag-uulat at pakikipagtulungan sa halip na mga gantimpalang pera. Pinahahalagahan at nakikipagtulungan kami nang malinaw sa mga mananaliksik na etikal na nagsisiwalat ng mga kahinaan.

## Saklaw (In-Scope)

Maaari lang subukan ng mga mananaliksik ang mga sumusunod na domain at serbisyo:

- Opisyal na website ng {{SITE_NAME}} at ang mga subdomain nito
- Opisyal na mobile application ng {{SITE_NAME}} (kapag available)
- Mga API endpoint na direktang pinapatakbo ng {{SITE_NAME}}

Ang mga domain at serbisyo ng third-party (mga payment gateway, analytics tool, hosting provider, atbp.) na hindi nakalista sa itaas ay hindi saklaw ng programang ito. Kung hindi ka sigurado kung ang isang target ay nasa saklaw, mangyaring makipag-ugnayan sa amin bago subukan.

## Patakaran sa Gantimpala

Sa kasalukuyan, ang {{SITE_NAME}} Bug Bounty Program ay hindi nag-aalok ng regular na gantimpalang pera. Gayunpaman, upang ipakita ang aming pagpapahalaga sa mga makabuluhang kontribusyon, pinapatakbo namin ang sumusunod:

- **Hall of Fame**: Paglilista ng mga pangalan ng mga mananaliksik na nag-ulat ng mga valid na kahinaan (kapag gumagana na).
- **Pampublikong Pagkilala**: Pagbibigay ng pampublikong pagkilala o isang liham ng rekomendasyon na may pahintulot ng mananaliksik.
- **Panghinaharap na Prayoridad**: Pagbibigay ng mga pagkakataon sa priyoridad na partisipasyon kung lumipat kami sa isang bayad na programa sa hinaharap.

Maaari kaming magpakilala ng sistemang gantimpalang pera (Bounty) sa hinaharap depende sa badyet at sukat ng serbisyo, at iaanunsyo namin ito sa pahinang ito kapag naipatupad.

## Pamantayan sa Kalubhaan (Severity)

| Kalubhaan | CVSS | Mga Halimbawa |
|---|---|---|
| Critical | 9.0-10.0 | Remote code execution (RCE), buong DB leak, malawakang pagkuha ng account |
| High | 7.0-8.9 | SQL Injection, Stored XSS, pag-bypass sa authentication |
| Medium | 4.0-6.9 | Reflected XSS, CSRF sa sensitibong aksyon, pagsisiwalat ng impormasyon |
| Low | 0.1-3.9 | Nawawalang mga security header, pagsisiwalat ng bersyon |

Maaaring ayusin ang kalubhaan batay sa aktwal na epekto.

## Pag-uulat ng mga Kahinaan

### Mga Channel ng Pag-uulat

- **E-mail**: [{{EMAIL}}](mailto:{{EMAIL}})
- **Paksa**: `[Security Report] Vulnerability Summary` (Buod ng Kahinaan)
- **Wika**: Mangyaring sumulat sa Korean, English, o Tagalog.

### Format ng Ulat

Upang matulungan kaming suriin at kopyahin ang isyu, mangyaring isama ang sumusunod:

1. Uri ng kahinaan at detalyadong paglalarawan.
2. Mga partikular na hakbang upang kopyahin ang isyu (kabilang ang mga script o command line).
3. Mga apektadong URL, API endpoint, o bahagi.
4. Proof of Concept (PoC) code o mga screenshot.

### Mga Pamantayan sa Kalidad ng Ulat

- Ang mga ulat na hindi makokopya o kulang sa sapat na detalye ay maaaring hindi tanggapin.
- Hindi tinatanggap ang mga ulat mula sa output ng automated scanner.
- **Mga Duplicate**: Ang mga duplicate na kahinaan ay ikine-credit lamang sa unang nag-ulat. (Batay sa timestamp ng pagtanggap ng email server)

### Proseso

1. **Kumpirmasyon sa Pagtanggap**: Magpapadala kami ng email ng kumpirmasyon sa loob ng 72 oras pagkatapos ng iyong ulat.
2. **Pagsusuri at Pagpaplano**: Kapag na-verify na ang kahinaan, tatasahin namin ang kalubhaan nito at ipapaalam sa iyo ang tinantyang timeline ng pag-aayos. Kung hindi namin maabot ang deadline, ipapaliwanag namin ang dahilan at magbibigay ng na-update na iskedyul.
3. **Resolusyon at Abiso**: Aabisuhan ka namin kapag natapos na ang patch. Maaaring tumagal ang paglutas kung kinakailangan ang mga pagbabago sa istruktura para sa katatagan ng serbisyo.
4. **Pagsisiwalat at Pagkilala**: Kapag nalutas na, magpapasya kami sa pagsisiwalat sa pamamagitan ng pakikipagsangguni sa mananaliksik. Ang mga wastong ulat ay kikilalanin alinsunod sa 'Patakaran sa Gantimpala' sa itaas.
5. **Pag-isyu ng CVE**: Para sa mga makabuluhang kahinaan, maaari kaming humiling ng pag-isyu ng numero ng CVE nang may pahintulot ng nag-ulat.

### Patakaran sa Pampublikong Pagsisiwalat (Public Disclosure)

- Inirerekomenda namin ang pagsisiwalat pagkatapos makumpleto ang patch at hinihiling namin na ibahagi mo sa amin ang mga detalye ng pagsisiwalat nang maaga.
- Kung walang naaangkop na aksyon na ginawa sa loob ng **60 araw** pagkatapos ng ulat, ang nag-ulat ay may karapatan na ibunyag ang mga detalye ng kahinaan sa paraang napagkasunduan ng isa't isa. (Gayunpaman, maaari kaming humiling ng pagsasaayos ng iskedyul para sa mga kumplikadong isyu.)
- Sa mga agarang kaso kung saan naobserbahan ang aktibong pagsasamantala, maaari kaming makipag-ugnayan sa iyo para sa mas maagang pagsisiwalat.

## Patakaran at Mga Alituntunin sa Pagsubok

Mangyaring sumunod sa mga sumusunod na alituntunin para sa ligtas na pagsubok sa kahinaan.

### Mga Pinahihintulutang Aktibidad

- Pagsubok sa mga kahinaan gamit ang mga account na pagmamay-ari mo o mga test account na ginawa mo.
- **Minimal na Pag-verify**: I-access lamang ang minimum na data na kinakailangan upang patunayan ang kahinaan. Kung hindi mo sinasadyang na-access ang sensitibong impormasyon ng iba, huminto kaagad at isama lamang ang naka-mask na impormasyon sa iyong ulat.

### Kapaligiran sa Pagsubok

- **Request ng Test Account**: Kung kailangan mo ng test account, maaari kang humiling nito sa [{{EMAIL}}](mailto:{{EMAIL}}).
- **Automated Scanning**: Ang magagaang na pag-scan ay pinapayagan, ngunit ang mga pag-scan na may mataas na load na bumubuo ng labis na mga kahilingan bawat segundo o nakakaapekto sa kalidad ng serbisyo ay nangangailangan ng paunang koordinasyon.

### Mga Ipinagbabawal na Aktibidad (Out of Scope)

Ang mga sumusunod na aktibidad ay mahigpit na ipinagbabawal at maaaring hindi legal na protektado kung nilabag:

- Pagpapatakbo ng **labis na automated scan** (sa antas na nagdudulot ng load sa serbisyo) nang walang paunang koordinasyon.
- Anumang aktibidad na sadyang umuubos ng mga mapagkukunan ng server (CPU, memorya, disk, bandwidth ng network).
- Pag-access o pagbabago sa mga account, data, o personal na impormasyon ng ibang mga user.
- Social engineering (phishing, atbp.) o mga pisikal na pag-atake sa seguridad.

### Tahasang Wala sa Saklaw (Out-of-Scope)

- Mga kahinaan na natagpuan sa mga serbisyo o imprastraktura ng third-party.
- Pisikal na seguridad, mga sistema ng HR, mga internal network.
- Mga pampubliko nang kahinaan o duplicate na ulat.
- Mga isyu na dulot lamang ng pagpapadala ng spam o phishing email.

### Mga Kahinaang Mababa ang Panganib (Hindi Tinatanggap)

Ang mga sumusunod ay hindi kasama sa programa dahil nagdudulot ang mga ito ng mababang panganib sa seguridad o nilalayong pag-uugali:

- CSRF na may mababang epekto tulad ng pag-logout sa CSRF
- Clickjacking sa mga page na walang sensitibong impormasyon
- Simpleng pagsisiwalat ng bersyon (banner grabbing)
- Nawawalang mga setting ng seguridad nang walang napatunayang landas ng pagsasamantala (hal., nawawalang mga security header na walang direktang epekto, hindi naka-configure na mga patakaran sa pagpapadala ng email, atbp.)
- Pinagana ang autocomplete ng browser

Gayunpaman, kahit ang mga item sa itaas ay maaaring suriin kung ang mga ito ay naka-chain sa iba pang mga kahinaan upang patunayan ang isang aktwal na senaryo ng pag-atake.

### Proteksyon ng Mananaliksik (Safe Harbor)

Kung sasaliksikin at iulat mo ang mga kahinaan nang may mabuting hangarin at bilang pagsunod sa patakarang ito, ipinapangako namin ang sumusunod **sa lawak na pinahihintulutan ng naaangkop na batas**:

1. Itinuturing namin ang iyong mga aktibidad sa pananaliksik bilang awtorisadong pananaliksik sa seguridad at hindi kami gagawa ng anumang sibil o kriminal na legal na aksyon laban sa iyo.
2. Hindi ka namin kusang-loob na iuulat sa pagpapatupad ng batas o magsasampa ng reklamo.
3. Kung ang isang ikatlong partido ay nagpasimula ng legal na aksyon tungkol sa iyong mga aktibidad sa pananaliksik, magbibigay kami ng suporta sa loob ng isang makatwirang saklaw, tulad ng pagbibigay ng dokumentasyon na nagpapatunay na ikaw ay isang sumusunod na mananaliksik.

Gayunpaman, hindi nalalapat ang Safe Harbor sa mga sumusunod na kaso:

- Malinaw na paglabag sa mga ipinagbabawal na aktibidad sa dokumentong ito.
- Hindi awtorisadong pagsubok ng mga system o imprastraktura ng third-party na labas sa aming kontrol.

## Makipag-ugnayan

Kung mayroon kang anumang mga katanungan tungkol sa aming Bug Bounty Program, mangyaring huwag mag-atubiling makipag-ugnayan sa amin sa [{{EMAIL}}](mailto:{{EMAIL}}).
