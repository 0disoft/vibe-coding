# Hata Ödül Programı (Bug Bounty)

> Son Güncelleme: {{LAST_UPDATED}}

## Giriş

{{SITE_NAME}} olarak, daha güvenli bir internet ortamı yaratmak için güvenlik araştırmacılarıyla işbirliği yapıyoruz. Hizmetimizde bir güvenlik açığı bulduysanız, lütfen hemen bizimle iletişime geçin.

Bu program şu anda parasal ödüllerden ziyade sorumlu raporlama ve işbirliğine odaklanan bir **Güvenlik Açığı İfşa Kanalı** olarak faaliyet göstermektedir. Güvenlik açıklarını etik bir şekilde ifşa eden araştırmacılara değer veriyor ve şeffaf bir şekilde işbirliği yapıyoruz.

## Kapsam (In-Scope)

Araştırmacılar yalnızca aşağıdaki alan adlarını ve hizmetleri test edebilir:

- {{SITE_NAME}} resmi web sitesi ve alt alan adları
- {{SITE_NAME}} resmi mobil uygulamaları (varsa)
- Doğrudan {{SITE_NAME}} tarafından işletilen API uç noktaları

Yukarıda listelenmeyen alan adları ve üçüncü taraf hizmetler (ödeme ağ geçitleri, analiz araçları, barındırma sağlayıcıları vb.) bu program kapsamında değildir. Bir hedefin kapsam dahilinde olup olmadığından emin değilseniz, test etmeden önce lütfen bizimle iletişime geçin.

## Ödül Politikası

Şu anda, {{SITE_NAME}} Hata Ödül Programı düzenli parasal ödüller sunmamaktadır. Ancak, önemli katkılara takdirimizi göstermek için aşağıdakileri uyguluyoruz:

- **Onur Listesi (Hall of Fame)**: Geçerli güvenlik açıklarını bildiren araştırmacıların isimlerini listeleme (faaliyete geçtiğinde).
- **Kamuoyu Önünde Takdir**: Araştırmacının izniyle kamuoyu önünde takdir veya tavsiye mektubu sağlama.
- **Gelecek Önceliği**: Gelecekte ücretli bir programa geçersek öncelikli katılım fırsatları sağlama.

Bütçeye ve hizmet ölçeğine bağlı olarak gelecekte parasal bir ödül sistemi (Bounty) getirebiliriz ve uygulanırsa bu sayfada duyuracağız.

## Önem Derecesi Kriterleri

| Önem Derecesi | CVSS | Örnekler |
|---|---|---|
| Critical (Kritik) | 9.0-10.0 | Uzaktan Kod Yürütme (RCE), Tam Veritabanı Sızıntısı, Toplu Hesap Ele Geçirme |
| High (Yüksek) | 7.0-8.9 | SQL Enjeksiyonu, Depolanmış XSS, Kimlik Doğrulama Atlatma |
| Medium (Orta) | 4.0-6.9 | Yansıtılmış XSS, Hassas İşlem CSRF, Bilgi İfşası |
| Low (Düşük) | 0.1-3.9 | Eksik Güvenlik Başlıkları, Sürüm İfşası |

Önem derecesi gerçek etkiye göre ayarlanabilir.

## Güvenlik Açıklarını Bildirme

### Raporlama Kanalları

- **E-posta**: [{{EMAIL}}](mailto:{{EMAIL}})
- **Konu**: [Security Report] Vulnerability Summary (Güvenlik Açığı Özeti)
- **Dil**: Lütfen Korece, İngilizce veya Türkçe yazın.

### Rapor Formatı

Sorunu analiz etmemize ve yeniden oluşturmamıza yardımcı olmak için lütfen aşağıdakileri ekleyin:

1. Güvenlik açığı türü ve ayrıntılı açıklama.
2. Sorunu yeniden oluşturmak için belirli adımlar (komut dosyaları veya komut satırları dahil).
3. Etkilenen URL'ler, API uç noktaları veya bileşenler.
4. Kavram Kanıtı (PoC) kodu veya ekran görüntüleri.

### Rapor Kalite Standartları

- Yeniden oluşturulamayan veya yeterli ayrıntıdan yoksun raporlar kabul edilmeyebilir.
- Otomatik tarayıcı çıktısı raporları kabul edilmez.
- **Kopyalar**: Yinelenen güvenlik açıkları yalnızca ilk bildirene atfedilir. (E-posta sunucusu alım zaman damgasına göre)

### Süreç

1. **Alım Onayı**: Raporunuzdan sonraki 72 saat içinde bir onay e-postası göndereceğiz.
2. **Analiz ve Planlama**: Güvenlik açığı doğrulandıktan sonra, ciddiyetini değerlendireceğiz ve tahmini düzeltme zaman çizelgesi hakkında sizi bilgilendireceğiz. Son teslim tarihine uyamazsak, nedenini açıklayacağız ve güncel bir program sunacağız.
3. **Çözüm ve Bildirim**: Yama tamamlandığında sizi bilgilendireceğiz. Hizmet kararlılığı için yapısal değişiklikler gerekiyorsa çözüm zaman alabilir.
4. **İfşa ve Tanıma**: Çözüldükten sonra, araştırmacıyla istişare ederek ifşa konusunda karar vereceğiz. Geçerli raporlar, yukarıdaki 'Ödül Politikası' uyarınca tanınacaktır.
5. **CVE Yayını**: Önemli güvenlik açıkları için, bildirenin izniyle bir CVE numarası verilmesini talep edebiliriz.

### Kamuya Açıklama Politikası (Public Disclosure)

- Yama tamamlandıktan sonra açıklamanızı öneririz ve açıklama ayrıntılarını önceden bizimle paylaşmanızı rica ederiz.
- Rapor tarihinden itibaren **60 gün** içinde uygun bir işlem yapılmazsa, bildiren kişi güvenlik açığı ayrıntılarını karşılıklı olarak mutabık kalınan bir şekilde ifşa etme hakkına sahiptir. (Ancak, karmaşık sorunlar için zaman çizelgesi ayarlaması talep edebiliriz.)
- Aktif istismarın gözlemlendiği acil durumlarda, daha erken ifşa için sizinle koordine olabiliriz.

## Test Politikası ve Yönergeleri

Güvenli güvenlik açığı testi için lütfen aşağıdaki yönergelere uyun.

### İzin Verilen Faaliyetler

- Sahibi olduğunuz hesapları veya oluşturduğunuz test hesaplarını kullanarak güvenlik açıklarını test etme.
- **Minimum Doğrulama**: Güvenlik açığını kanıtlamak için gereken minimum verilere erişin. Yanlışlıkla başkalarının hassas bilgilerine erişirseniz, derhal durun ve raporunuza yalnızca maskelenmiş bilgileri ekleyin.

### Test Ortamı

- **Test Hesabı İsteği**: Bir test hesabına ihtiyacınız varsa, [{{EMAIL}}](mailto:{{EMAIL}}) adresinden talep edebilirsiniz.
- **Otomatik Taramalar**: Hafif taramalara izin verilir, ancak saniyede aşırı istek oluşturan veya hizmet kalitesini etkileyen yüksek yüklü taramalar ön koordinasyon gerektirir.

### Yasaklanmış Faaliyetler (Kapsam Dışı)

Aşağıdaki faaliyetler kesinlikle yasaktır ve ihlal edilirse yasal olarak korunmayabilir:

- Ön koordinasyon olmadan **aşırı otomatik taramalar** (hizmet yüküne neden olacak düzeyde) çalıştırma.
- Sunucu kaynaklarını (CPU, bellek, disk, ağ bant genişliği) kasıtlı olarak tüketen herhangi bir faaliyet.
- Diğer kullanıcıların hesaplarına, verilerine veya kişisel bilgilerine erişme veya bunları değiştirme.
- Sosyal mühendislik (kimlik avı vb.) veya fiziksel güvenlik saldırıları.

### Açıkça Kapsam Dışı (Out-of-Scope)

- Üçüncü taraf hizmetlerinde veya altyapısında bulunan güvenlik açıkları.
- Fiziksel güvenlik, İK sistemleri, dahili ağlar.
- Halihazırda kamuya açık güvenlik açıkları veya yinelenen raporlar.
- Yalnızca spam veya kimlik avı e-postaları göndermekten kaynaklanan sorunlar.

### Düşük Riskli Güvenlik Açıkları (Kabul Edilmez)

Aşağıdakiler, düşük güvenlik riski oluşturdukları veya amaçlanan davranış oldukları için programdan hariç tutulmuştur:

- Oturumu kapatma CSRF'si gibi düşük etkili CSRF
- Hassas bilgi içermeyen sayfalarda tıklama hırsızlığı (Clickjacking)
- Basit sürüm ifşası (banner grabbing)
- Kanıtlanmış bir istismar yolu olmayan eksik güvenlik ayarları (ör. doğrudan etkisi olmayan eksik güvenlik başlıkları, yapılandırılmamış e-posta gönderme politikaları vb.)
- Tarayıcı otomatik doldurma etkin

Ancak, yukarıdaki öğeler bile gerçek bir saldırı senaryosunu kanıtlamak için diğer güvenlik açıklarıyla zincirlenirse değerlendirilebilir.

### Araştırmacı Koruması (Safe Harbor)

Güvenlik açıklarını iyi niyetle ve bu politikaya uygun olarak araştırır ve bildirirseniz, **geçerli yasanın izin verdiği ölçüde** aşağıdakileri taahhüt ederiz:

1. Araştırma faaliyetlerinizi yetkili güvenlik araştırması olarak kabul ediyoruz ve size karşı herhangi bir hukuki veya cezai yasal işlem başlatmayacağız.
2. Sizi gönüllü olarak kolluk kuvvetlerine bildirmeyeceğiz veya şikayette bulunmayacağız.
3. Üçüncü bir taraf araştırma faaliyetlerinizle ilgili yasal işlem başlatırsa, uyumlu bir araştırmacı olduğunuzu kanıtlayan belgeler sağlamak gibi makul bir aralıkta destek sağlayacağız.

Ancak, Safe Harbor aşağıdaki durumlarda geçerli değildir:

- Bu belgedeki yasaklanmış faaliyetlerin açık ihlali.
- Kontrolümüz dışındaki üçüncü taraf sistemlerin veya altyapının izinsiz testi.

## İletişim

Hata Ödül Programımızla ilgili herhangi bir sorunuz varsa, lütfen [{{EMAIL}}](mailto:{{EMAIL}}) adresinden bizimle iletişime geçmekten çekinmeyin.
