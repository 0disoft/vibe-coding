import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const messagesDir = path.join(process.cwd(), 'messages');
console.log('Resolved messages directory:', messagesDir);

// 18개 언어에 대한 쿠키 정책 번역 데이터 (ko, en은 이미 존재함)
const translations = {
	ja: {
		footer_cookie_policy: 'クッキーポリシー',
		cookie_cat_infrastructure: 'インフラとセキュリティ',
		cookie_cat_payments: '決済とカスタマーサポート',
		cookie_cat_social: 'ソーシャルログインとコミュニティ',
		cookie_cat_desc_infrastructure:
			'サービスの安定性、DDoS保護、キャッシュによるパフォーマンス最適化のために使用されます。',
		cookie_cat_desc_payments:
			'決済処理、取引履歴の照会、カスタマーサポート履歴の管理に必要な範囲で使用されます。',
		cookie_cat_desc_social:
			'ソーシャルアカウント連携やコメント機能を提供するために、プロバイダーの認証・セキュリティクッキーが使用される場合があります。'
	},
	zh: {
		footer_cookie_policy: 'Cookie 政策',
		cookie_cat_infrastructure: '基础设施与安全',
		cookie_cat_payments: '支付与客户支持',
		cookie_cat_social: '社交登录与社区',
		cookie_cat_desc_infrastructure: '用于服务稳定性、DDoS 防护以及通过缓存进行性能优化。',
		cookie_cat_desc_payments: '在支付处理、交易记录查询和客户支持历史管理所需的范围内使用。',
		cookie_cat_desc_social: '可能会使用提供商的认证和安全 Cookie 来提供社交账号关联和评论功能。'
	},
	es: {
		footer_cookie_policy: 'Política de Cookies',
		cookie_cat_infrastructure: 'Infraestructura y Seguridad',
		cookie_cat_payments: 'Pagos y Atención al Cliente',
		cookie_cat_social: 'Inicio de Sesión Social y Comunidad',
		cookie_cat_desc_infrastructure:
			'Se utiliza para la estabilidad del servicio, protección DDoS y optimización del rendimiento mediante caché.',
		cookie_cat_desc_payments:
			'Se utiliza según sea necesario para el procesamiento de pagos, recuperación de historial de transacciones y gestión de soporte.',
		cookie_cat_desc_social:
			'Se pueden utilizar cookies de autenticación y seguridad de proveedores para ofrecer vinculación de cuentas sociales y comentarios.'
	},
	fr: {
		footer_cookie_policy: 'Politique relative aux cookies',
		cookie_cat_infrastructure: 'Infrastructure et Sécurité',
		cookie_cat_payments: 'Paiements et Service Client',
		cookie_cat_social: 'Connexion Sociale et Communauté',
		cookie_cat_desc_infrastructure:
			"Utilisé pour la stabilité du service, la protection DDoS et l'optimisation des performances via la mise en cache.",
		cookie_cat_desc_payments:
			"Utilisé dans la mesure du nécessaire pour le traitement des paiements et la gestion de l'historique du support client.",
		cookie_cat_desc_social:
			"Des cookies d'authentification et de sécurité des fournisseurs peuvent être utilisés pour offrir des fonctionnalités de liaison de compte social."
	},
	de: {
		footer_cookie_policy: 'Cookie-Richtlinie',
		cookie_cat_infrastructure: 'Infrastruktur & Sicherheit',
		cookie_cat_payments: 'Zahlungen & Kundensupport',
		cookie_cat_social: 'Social Login & Community',
		cookie_cat_desc_infrastructure:
			'Verwendet für Dienststabilität, DDoS-Schutz und Leistungsoptimierung durch Caching.',
		cookie_cat_desc_payments:
			'Verwendet im erforderlichen Umfang für Zahlungsabwicklung und Verwaltung des Kundensupport-Verlaufs.',
		cookie_cat_desc_social:
			'Authentifizierungs- undicherheits-Cookies von Anbietern können verwendet werden, um Social-Account-Verknüpfungen anzubieten.'
	},
	it: {
		footer_cookie_policy: 'Cookie Policy',
		cookie_cat_infrastructure: 'Infrastruttura e Sicurezza',
		cookie_cat_payments: 'Pagamenti e Assistenza Clienti',
		cookie_cat_social: 'Social Login e Community',
		cookie_cat_desc_infrastructure:
			'Utilizzato per stabilità del servizio, protezione DDoS e ottimizzazione delle prestazioni tramite caching.',
		cookie_cat_desc_payments:
			"Utilizzato per quanto necessario per l'elaborazione dei pagamenti e la gestione della cronologia dell'assistenza clienti.",
		cookie_cat_desc_social:
			'Possono essere utilizzati cookie di autenticazione e sicurezza dei provider per offrire funzionalità di collegamento account social.'
	},
	pt: {
		footer_cookie_policy: 'Política de Cookies',
		cookie_cat_infrastructure: 'Infraestrutura e Segurança',
		cookie_cat_payments: 'Pagamentos e Suporte ao Cliente',
		cookie_cat_social: 'Login Social e Comunidade',
		cookie_cat_desc_infrastructure:
			'Usado para estabilidade do serviço, proteção DDoS e otimização de desempenho via cache.',
		cookie_cat_desc_payments:
			'Usado conforme necessário para processamento de pagamentos e gestão do histórico de suporte ao cliente.',
		cookie_cat_desc_social:
			'Cookies de autenticação e segurança de provedores podem ser usados para oferecer recursos de vinculação de contas sociais.'
	},
	nl: {
		footer_cookie_policy: 'Cookiebeleid',
		cookie_cat_infrastructure: 'Infrastructuur & Beveiliging',
		cookie_cat_payments: 'Betalingen & Klantenservice',
		cookie_cat_social: 'Social Login & Community',
		cookie_cat_desc_infrastructure:
			'Gebruikt voor servicestabiliteit, DDoS-bescherming en prestatieoptimalisatie via caching.',
		cookie_cat_desc_payments:
			'Gebruikt voor zover nodig voor betalingsverwerking en beheer van klantenservicegeschiedenis.',
		cookie_cat_desc_social:
			'Authenticatie- en beveiligingscookies van providers kunnen worden gebruikt voor sociale accountkoppeling.'
	},
	pl: {
		footer_cookie_policy: 'Polityka Plików Cookie',
		cookie_cat_infrastructure: 'Infrastruktura i Bezpieczeństwo',
		cookie_cat_payments: 'Płatności i Obsługa Klienta',
		cookie_cat_social: 'Logowanie Społecznościowe i Społeczność',
		cookie_cat_desc_infrastructure:
			'Używane dla stabilności usługi, ochrony DDoS i optymalizacji wydajności poprzez buforowanie.',
		cookie_cat_desc_payments:
			'Używane w zakresie niezbędnym do przetwarzania płatności i zarządzania historią obsługi klienta.',
		cookie_cat_desc_social:
			'Pliki cookie uwierzytelniania i bezpieczeństwa dostawców mogą być używane do łączenia kont społecznościowych.'
	},
	ru: {
		footer_cookie_policy: 'Политика использования файлов cookie',
		cookie_cat_infrastructure: 'Инфраструктура и безопасность',
		cookie_cat_payments: 'Платежи и поддержка клиентов',
		cookie_cat_social: 'Социальный вход и сообщество',
		cookie_cat_desc_infrastructure:
			'Используется для стабильности сервиса, защиты от DDoS и оптимизации производительности через кэширование.',
		cookie_cat_desc_payments:
			'Используется по мере необходимости для обработки платежей и управления историей поддержки клиентов.',
		cookie_cat_desc_social:
			'Могут использоваться файлы cookie аутентификации и безопасности провайдеров для привязки социальных аккаунтов.'
	},
	sv: {
		footer_cookie_policy: 'Cookiepolicy',
		cookie_cat_infrastructure: 'Infrastruktur & Säkerhet',
		cookie_cat_payments: 'Betalningar & Kundsupport',
		cookie_cat_social: 'Social Inloggning & Gemenskap',
		cookie_cat_desc_infrastructure:
			'Används för tjänstestabilitet, DDoS-skydd och prestandaoptimering via cachning.',
		cookie_cat_desc_payments:
			'Används vid behov för betalningshantering och hantering av kundsupporthistorik.',
		cookie_cat_desc_social:
			'Autentiserings- och säkerhetscookies från leverantörer kan användas för att erbjuda koppling av sociala konton.'
	},
	tr: {
		footer_cookie_policy: 'Çerez Politikası',
		cookie_cat_infrastructure: 'Altyapı ve Güvenlik',
		cookie_cat_payments: 'Ödemeler ve Müşteri Desteği',
		cookie_cat_social: 'Sosyal Giriş ve Topluluk',
		cookie_cat_desc_infrastructure:
			'Hizmet kararlılığı, DDoS koruması ve önbelleğe alma yoluyla performans optimizasyonu için kullanılır.',
		cookie_cat_desc_payments:
			'Ödeme işleme ve müşteri destek geçmişi yönetimi için gerekli olduğu ölçüde kullanılır.',
		cookie_cat_desc_social:
			'Sosyal hesap bağlama özellikleri sunmak için sağlayıcıların kimlik doğrulama ve güvenlik çerezleri kullanılabilir.'
	},
	ar: {
		footer_cookie_policy: 'سياسة ملفات تعريف الارتباط',
		cookie_cat_infrastructure: 'البنية التحتية والأمان',
		cookie_cat_payments: 'المدفوعات ودعم العملاء',
		cookie_cat_social: 'تسجيل الدخول الاجتماعي والمجتمع',
		cookie_cat_desc_infrastructure:
			'يستخدم لاستقرار الخدمة، والحماية من DDoS، وتحسين الأداء عبر التخزين المؤقت.',
		cookie_cat_desc_payments: 'يستخدم حسب الضرورة لمعالجة المدفوعات وإدارة سجل دعم العملاء.',
		cookie_cat_desc_social:
			'قد يتم استخدام ملفات تعريف الارتباط للمصادقة والأمان من مقدمي الخدمات لربط الحسابات الاجتماعية.'
	},
	hi: {
		footer_cookie_policy: 'कुकी नीति',
		cookie_cat_infrastructure: 'बुनियादी ढांचा और सुरक्षा',
		cookie_cat_payments: 'भुगतान और ग्राहक सहायता',
		cookie_cat_social: 'सोशल लॉगिन और समुदाय',
		cookie_cat_desc_infrastructure:
			'सेवा स्थिरता, DDoS सुरक्षा और कैशिंग के माध्यम से प्रदर्शन अनुकूलन के लिए उपयोग किया जाता है।',
		cookie_cat_desc_payments:
			'भुगतान प्रसंस्करण और ग्राहक सहायता इतिहास प्रबंधन के लिए आवश्यक सीमा तक उपयोग किया जाता है।',
		cookie_cat_desc_social:
			'सोशल अकाउंट लिंकिंग की पेशकश करने के लिए प्रदाताओं से प्रमाणीकरण और सुरक्षा कुकीज़ का उपयोग किया जा सकता है।'
	},
	id: {
		footer_cookie_policy: 'Kebijakan Cookie',
		cookie_cat_infrastructure: 'Infrastruktur & Keamanan',
		cookie_cat_payments: 'Pembayaran & Dukungan Pelanggan',
		cookie_cat_social: 'Login Sosial & Komunitas',
		cookie_cat_desc_infrastructure:
			'Digunakan untuk stabilitas layanan, perlindungan DDoS, dan optimalisasi kinerja melalui caching.',
		cookie_cat_desc_payments:
			'Digunakan sejauh diperlukan untuk pemrosesan pembayaran dan manajemen riwayat dukungan pelanggan.',
		cookie_cat_desc_social:
			'Cookie autentikasi dan keamanan dari penyedia mungkin digunakan untuk menawarkan penautan akun sosial.'
	},
	th: {
		footer_cookie_policy: 'นโยบายคุกกี้',
		cookie_cat_infrastructure: 'โครงสร้างพื้นฐานและความปลอดภัย',
		cookie_cat_payments: 'การชำระเงินและการสนับสนุนลูกค้า',
		cookie_cat_social: 'การเข้าสู่ระบบผ่านโซเชียลและชุมชน',
		cookie_cat_desc_infrastructure:
			'ใช้เพื่อความเสถียรของบริการ การป้องกัน DDoS และการเพิ่มประสิทธิภาพผ่านการแคช',
		cookie_cat_desc_payments: 'ใช้เท่าที่จำเป็นสำหรับการประมวลผลการชำระเงินและการจัดการประวัติการสนับสนุนลูกค้า',
		cookie_cat_desc_social:
			'อาจใช้คุกกี้การตรวจสอบสิทธิ์และความปลอดภัยจากผู้ให้บริการเพื่อเสนอการเชื่อมโยงบัญชีโซเชียล'
	},
	tl: {
		footer_cookie_policy: 'Patakaran sa Cookie',
		cookie_cat_infrastructure: 'Imprastraktura at Seguridad',
		cookie_cat_payments: 'Mga Pagbabayad at Suporta sa Customer',
		cookie_cat_social: 'Social Login at Komunidad',
		cookie_cat_desc_infrastructure:
			'Ginagamit para sa katatagan ng serbisyo, proteksyon sa DDoS, at pag-optimize ng pagganap sa pamamagitan ng caching.',
		cookie_cat_desc_payments:
			'Ginagamit kung kinakailangan para sa pagproseso ng pagbabayad at pamamahala ng kasaysayan ng suporta sa customer.',
		cookie_cat_desc_social:
			'Maaaring gamitin ang mga cookie ng pagpapatunay at seguridad mula sa mga provider para sa pag-link ng social account.'
	},
	vi: {
		footer_cookie_policy: 'Chính sách Cookie',
		cookie_cat_infrastructure: 'Cơ sở hạ tầng & Bảo mật',
		cookie_cat_payments: 'Thanh toán & Hỗ trợ khách hàng',
		cookie_cat_social: 'Đăng nhập xã hội & Cộng đồng',
		cookie_cat_desc_infrastructure:
			'Được sử dụng cho sự ổn định của dịch vụ, bảo vệ DDoS và tối ưu hóa hiệu suất thông qua bộ nhớ đệm.',
		cookie_cat_desc_payments:
			'Được sử dụng khi cần thiết để xử lý thanh toán và quản lý lịch sử hỗ trợ khách hàng.',
		cookie_cat_desc_social:
			'Cookie xác thực và bảo mật từ các nhà cung cấp có thể được sử dụng để cung cấp tính năng liên kết tài khoản xã hội.'
	}
};

async function updateMessages() {
	for (const [lang, messages] of Object.entries(translations)) {
		const filePath = path.join(messagesDir, `${lang}.json`);

		if (fs.existsSync(filePath)) {
			try {
				const content = fs.readFileSync(filePath, 'utf8');
				const json = JSON.parse(content);

				// 번역 병합
				const updatedJson = { ...json, ...messages };

				fs.writeFileSync(filePath, JSON.stringify(updatedJson, null, '\t'), 'utf8');
				console.log(`Updated ${lang}.json`);
			} catch (error) {
				console.error(`Error updating ${lang}.json:`, error);
			}
		} else {
			console.warn(`File not found: ${lang}.json`);
		}
	}
}

updateMessages();
