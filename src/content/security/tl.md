# Polisiya sa Seguridad

> Huling Na-update: {{LAST_UPDATED}}

## Mga Teknolohiya at Prinsipyo sa Proteksyon ng Data

Ang data ng user ay ligtas na pinoproseso gamit ang mga hakbang sa proteksyon na inilalapat sa maraming layer, kabilang ang pag-encrypt habang nakatabi (at rest) at TLS habang ipinapadala (in transit).

### Proteksyon ng Password

**Ang mga password ng user ay hindi kailanman iniimbak sa plain text at pinoprotektahan gamit ang pinakabagong teknolohiya sa hashing.**

- **Algorithm**: {{ENC_ALGO_PASSWORD}}
- **Dahilan**: {{ENC_REASON_PASSWORD}}
- Isang natatanging Salt ang inilalapat sa bawat password upang maiwasan ang mga rainbow table attack.

### Pag-encrypt ng Data

**Ang sensitibong impormasyon ay ine-encrypt kaagad bago itago, na may mahigpit na nakahiwalay na pamamahala ng key.**

- **Algorithm**: {{ENC_ALGO_DATA}}
- **Dahilan**: {{ENC_REASON_DATA}}
- **Pag-derive ng Key**: {{ENC_ALGO_KDF}} - {{ENC_REASON_KDF}}
- Gumagamit kami ng Envelope Encryption upang protektahan ang Data Encryption Keys (DEK) gamit ang magkahiwalay na Key Encryption Keys (KEK).

### Integridad ng Data

**Ang mga high-performance hash function ay ginagamit upang i-verify na ang kritikal na data ng system ay hindi binago.**

- **Algorithm**: {{ENC_ALGO_INTEGRITY}}
- **Dahilan**: {{ENC_REASON_INTEGRITY}}

### Seguridad sa Transportasyon

**Ang lahat ng komunikasyon sa pagitan ng mga user at server ay pinoprotektahan ng isang naka-encrypt na tunnel gamit ang pinakabagong mga protocol ng seguridad.**

- **Protocol**: {{ENC_ALGO_TRANSPORT}}
- **Dahilan**: {{ENC_REASON_TRANSPORT}}
- Ipinatutupad ang HTTPS para sa lahat ng komunikasyon, at inilalapat ang HSTS upang mahigpit na maiwasan ang mga downgrade attack.

## Administratibo at Pisikal na Seguridad

Higit pa sa mga teknikal na hakbang, masusi naming pinamamahalaan ang seguridad patungkol sa mga tao at proseso.

- **Kontrol sa Pag-access ng Empleyado**: Ang pag-access sa data ay ibinibigay lamang sa mahahalagang tauhan batay sa 'Prinsipyo ng Pinakamababang Pribilehiyo' (Principle of Least Privilege). Ang lahat ng kasaysayan ng pag-access ay nire-record at ina-audit. Ang pag-access nang walang lehitimong dahilan ay mahigpit na ipinagbabawal.
- **Pisikal na Seguridad**: Ang lahat ng third-party cloud infrastructure ay gumagana sa mga data center na nakakuha ng mga pisikal na sertipikasyon ng seguridad tulad ng ISO 27001.

## Seguridad ng Account at Session

- **Proteksyon sa Pag-login**: Naglalapat kami ng mga limitasyon sa pagtatangkang mag-login at mga mekanismo ng pagkaantala upang harangan ang mga automated brute-force attack.
- **Pamamahala ng Session**: Ang mga session ay awtomatikong mag-e-expire pagkatapos ng isang panahon ng kawalan ng aktibidad, at ipinapadala ang mga abiso para sa mahahalagang pagbabago sa account.
- **Two-Factor Authentication**: Plano naming ipakilala ang 2FA functionality sa hinaharap.

## Seguridad ng Application

Nagdidisenyo kami nang isinasaisip ang mga pinakamahusay na kasanayan sa seguridad tulad ng OWASP Top 10 mula sa yugto ng pag-develop.

- **Pag-validate ng Input**: Ang mga Prepared Statements at ORM ay ginagamit para sa mga query sa database, at ang input ng user ay vina-validate sa parehong server at client side.
- **Depensa sa Pag-atake**: Ang mga CSRF token, SameSite cookie attribute, at CSP (Content Security Policy) ay inilalapat upang mabawasan ang session hijacking at script injection attacks.

## Seguridad sa Supply Chain ng Software

- **Pamamahala ng Dependency**: Ang mga panlabas na library at package ay ini-install lamang mula sa mga opisyal na registry, at tinitiyak ang mga na-verify na bersyon sa pamamagitan ng mga lock file.
- **Pagsusuri sa Kahinaan**: Ang mga ulat sa kahinaan ay regular na sinusuri, at ang mga dependency na may mataas na peligro ay binibigyang priyoridad para sa mga update.

## Pagpapanatili at Pagbubura ng Data

- **Pagbubura ng Account**: Sa kahilingan para sa pagbubura ng account, ang mga kaugnay na data ay permanenteng sisirain pagkatapos ng 30-araw na palugit (para sa pagbawi mula sa hindi sinasadyang pagbubura).
- **Data ng Backup**: Ang mga backup para sa katatagan ng system ay pinapanatili nang maximum na 90 araw at pagkatapos ay ligtas na binubura. Dahil sa mga teknikal na limitasyon, ang kumpletong pagbubura mula sa mga backup system ay maaaring mangailangan ng karagdagang oras.
- **Data ng Log**: Ang mga access log ay pinapanatili sa loob ng 1 taon para sa pangmatagalang pagsusuri ng banta sa seguridad at pagtukoy ng trend.
- **Pagbubukod sa Legal na Pagpapanatili**: Ang data na kinakailangan ng batas na panatilihin para sa isang tiyak na panahon ay maaaring iimbak nang hiwalay para sa naaangkop na tagal.

## Pagtugon sa Insidente

Kung sakaling magkaroon ng insidente sa seguridad, sinusunod namin ang mga pamamaraang ito para sa mabilis na pagtugon at pagliit ng pinsala:

1. **Pagtuklas at Pagpigil (Agad)**: Ihiwalay ang mga banta at pigilan ang karagdagang pinsala.
2. **Pagsusuri sa Epekto**: Tayahin ang saklaw at kalubhaan sa lalong madaling panahon, karaniwang sa loob ng ilang oras.
3. **Abiso sa User**: Para sa mga insidenteng nakakaapekto sa mga user (hal., pagtagas ng data), abisuhan ang mga user sa lalong madaling panahon at sumunod sa mga legal na deadline (hal., 72 oras).
4. **Transparent na Pagbubunyag**: Mag-publish ng detalyadong ulat (sanhi, mga aksyon, mga hakbang sa pag-iwas) pagkatapos malutas ang insidente.

## Mga Audit sa Seguridad at Serbisyo ng Third-Party

- **Mga Audit sa Seguridad**: Kasalukuyan kaming nasa yugto ng pagpapatatag ng serbisyo at nagsasagawa ng mga regular na internal code review at pagsusuri sa seguridad. Plano naming ipakilala ang mga regular na audit sa seguridad ng third-party habang lumalaki ang serbisyo.
- **Imprastraktura ng Third-Party**: Sumusunod kami sa prinsipyo ng hindi direktang pag-iimbak ng hindi naka-encrypt na sensitibong impormasyon. Para sa mga pangunahing function tulad ng mga pagbabayad at pagpapatotoo, gumagamit kami ng mga pinagkakatiwalaang serbisyo ({{THIRD_PARTY_PROVIDERS}}, atbp.) na nakakuha ng mga internasyonal na kinikilalang sertipikasyon ng seguridad (SOC 2, ISO 27001) o sumasailalim sa mga katumbas na pagsusuri sa seguridad nang regular.

## Mga Rekomendasyon sa Seguridad para sa Mga User

Ang seguridad ng account ay isang nakabahaging responsibilidad.

- **Malalakas na Password**: Gumamit ng mga natatangi at kumplikadong password na hindi ginagamit sa ibang mga site.
- **Mag-ingat sa Phishing**: Mag-ingat sa mga mensaheng nagsasabing opisyal na email at suriin ang address bago mag-click sa mga link.

## Makipag-ugnayan

Kung mayroon kang anumang mga katanungan tungkol sa aming Polisiya sa Seguridad, mangyaring makipag-ugnayan sa amin sa [{{EMAIL}}](mailto:{{EMAIL}}).

Para sa mga ulat ng kahinaan at mga patakaran sa proteksyon ng mananaliksik, mangyaring sumangguni sa aming pahina ng [Bug Bounty Program](/tl/bug-bounty).
