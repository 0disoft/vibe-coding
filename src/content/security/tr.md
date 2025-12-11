# Güvenlik Politikası

> Son Güncelleme: {{LAST_UPDATED}}

## Veri Koruma Teknolojileri ve İlkeleri

Kullanıcı verileri, dinlenme halindeki şifreleme ve iletim sırasındaki TLS dahil olmak üzere birden fazla katmanda uygulanan koruma önlemleriyle güvenli bir şekilde işlenir.

### Parola Koruması

**Kullanıcı parolaları asla düz metin olarak saklanmaz ve en son karma teknolojileri kullanılarak korunur.**

- **Algoritma**: {{ENC_ALGO_PASSWORD}}
- **Neden**: {{ENC_REASON_PASSWORD}}
- Gökkuşağı tablosu saldırılarını önlemek için her parolaya benzersiz bir Tuz (Salt) uygulanır.

### Veri Şifreleme

**Hassas bilgiler, kesinlikle ayrılmış anahtar yönetimi ile depolamadan hemen önce şifrelenir.**

- **Algoritma**: {{ENC_ALGO_DATA}}
- **Neden**: {{ENC_REASON_DATA}}
- **Anahtar Türetme**: {{ENC_ALGO_KDF}} - {{ENC_REASON_KDF}}
- Veri Şifreleme Anahtarlarını (DEK) ayrı Anahtar Şifreleme Anahtarları (KEK) ile korumak için Zarf Şifreleme (Envelope Encryption) kullanıyoruz.

### Veri Bütünlüğü

**Kritik sistem verilerinin tahrif edilmediğini doğrulamak için yüksek performanslı karma işlevleri kullanılır.**

- **Algoritma**: {{ENC_ALGO_INTEGRITY}}
- **Neden**: {{ENC_REASON_INTEGRITY}}

### Taşıma Güvenliği

**Kullanıcılar ve sunucular arasındaki tüm iletişim, en son güvenlik protokollerini kullanan şifreli bir tünel ile korunur.**

- **Protokol**: {{ENC_ALGO_TRANSPORT}}
- **Neden**: {{ENC_REASON_TRANSPORT}}
- Tüm iletişimler için HTTPS zorunludur ve sürüm düşürme saldırılarını kesinlikle önlemek için HSTS uygulanır.

## İdari ve Fiziksel Güvenlik

Teknik önlemlerin ötesinde, insanlarla ve süreçlerle ilgili güvenliği titizlikle yönetiyoruz.

- **Çalışan Erişim Kontrolü**: Veri erişimi, yalnızca 'En Az Ayrıcalık İlkesi'ne dayalı olarak temel personele verilir. Tüm erişim geçmişi kaydedilir ve denetlenir. Meşru bir neden olmaksızın erişim kesinlikle yasaktır.
- **Fiziksel Güvenlik**: Tüm üçüncü taraf bulut altyapısı, ISO 27001 gibi fiziksel güvenlik sertifikaları almış veri merkezlerinde çalışır.

## Hesap ve Oturum Güvenliği

- **Giriş Koruması**: Otomatik kaba kuvvet saldırılarını engellemek için oturum açma denemesi limitleri ve gecikme mekanizmaları uyguluyoruz.
- **Oturum Yönetimi**: Oturumlar belirli bir işlem yapılmama süresinden sonra otomatik olarak sona erer ve önemli hesap değişiklikleri için bildirimler gönderilir.
- **İki Faktörlü Kimlik Doğrulama**: Gelecekte 2FA işlevini tanıtmayı planlıyoruz.

## Uygulama Güvenliği

Geliştirme aşamasından itibaren OWASP Top 10 gibi en iyi güvenlik uygulamalarını göz önünde bulundurarak tasarlıyoruz.

- **Girdi Doğrulama**: Veritabanı sorguları için Hazırlanmış İfadeler ve ORM'ler kullanılır ve kullanıcı girdisi hem sunucu hem de istemci tarafında doğrulanır.
- **Saldırı Savunması**: CSRF belirteçleri, SameSite çerez nitelikleri ve CSP (İçerik Güvenliği Politikası), oturum ele geçirme ve komut dosyası ekleme saldırılarını azaltmak için uygulanır.

## Yazılım Tedarik Zinciri Güvenliği

- **Bağımlılık Yönetimi**: Harici kütüphaneler ve paketler yalnızca resmi kayıtlardan yüklenir ve doğrulanmış sürümler kilit dosyaları aracılığıyla sağlanır.
- **Güvenlik Açığı Kontrolleri**: Güvenlik açığı raporları düzenli olarak gözden geçirilir ve yüksek riskli bağımlılıklar güncellemeler için önceliklendirilir.

## Veri Saklama ve Silme

- **Hesap Silme**: Hesap silme talebi üzerine, ilgili veriler 30 günlük bir yetkisiz kullanım süresinden (yanlışlıkla silme kurtarma için) sonra kalıcı olarak imha edilir.
- **Yedekleme Verileri**: Sistem kararlılığı için yedekler en fazla 90 gün saklanır ve ardından güvenli bir şekilde silinir. Teknik sınırlamalar nedeniyle, yedekleme sistemlerinden tamamen silinmesi ek süre gerektirebilir.
- **Günlük Verileri**: Erişim günlükleri, uzun vadeli güvenlik tehdidi analizi ve eğilim belirleme için 1 yıl boyunca saklanır.
- **Yasal Saklama İstisnası**: Yasalarca belirli bir süre saklanması gereken veriler, geçerli süre boyunca ayrı olarak saklanabilir.

## Olay Müdahalesi

Bir güvenlik olayı durumunda, hızlı müdahale ve hasarın en aza indirilmesi için şu prosedürleri izliyoruz:

1. **Tespit ve Çevreleme (Derhal)**: Tehditleri izole edin ve daha fazla hasarı önleyin.
2. **Etki Analizi**: Kapsamı ve ciddiyeti mümkün olduğunca çabuk, genellikle saatler içinde değerlendirin.
3. **Kullanıcı Bildirimi**: Kullanıcıları etkileyen olaylar (örneğin veri sızıntıları) için, mümkün olan en kısa sürede kullanıcıları bilgilendirin ve yasal sürelere (örneğin 72 saat) uyun.
4. **Şeffaf İfşa**: Olay çözüldükten sonra ayrıntılı bir rapor (neden, eylemler, önleyici tedbirler) yayınlayın.

## Güvenlik Denetimleri ve Üçüncü Taraf Hizmetleri

- **Güvenlik Denetimleri**: Şu anda hizmet stabilizasyon aşamasındayız ve düzenli dahili kod incelemeleri ve güvenlik kontrolleri yapıyoruz. Hizmet ölçeklendikçe düzenli üçüncü taraf güvenlik denetimleri sunmayı planlıyoruz.
- **Üçüncü Taraf Altyapısı**: Şifrelenmemiş hassas bilgileri doğrudan saklamama ilkesine bağlıyız. Ödemeler ve kimlik doğrulama gibi temel işlevler için, uluslararası kabul görmüş güvenlik sertifikaları (SOC 2, ISO 27001) almış veya düzenli olarak eşdeğer güvenlik değerlendirmelerinden geçen güvenilir hizmetleri ({{THIRD_PARTY_PROVIDERS}}, vb.) kullanıyoruz.

## Kullanıcılar için Güvenlik Önerileri

Hesap güvenliği paylaşılan bir sorumluluktur.

- **Güçlü Parolalar**: Diğer sitelerde kullanılmayan benzersiz ve karmaşık parolalar kullanın.
- **Kimlik Avına Dikkat**: Resmi e-postalar olduğunu iddia eden mesajlara karşı dikkatli olun ve bağlantılara tıklamadan önce adresi kontrol edin.

## İletişim

Güvenlik Politikamız hakkında herhangi bir sorunuz varsa, lütfen [{{EMAIL}}](mailto:{{EMAIL}}) adresinden bizimle iletişime geçin.

Güvenlik açığı raporları ve araştırmacı koruma politikaları için lütfen [Bug Bounty Programı](/tr/bug-bounty) sayfamıza bakın.
