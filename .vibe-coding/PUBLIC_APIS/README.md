# Public API 카탈로그

LLM과 바이브코딩할 때 "어떤 Public API를 어떤 방식으로 호출/연동할지"를 빠르게 찾기 위한 문서 모음입니다.

## 운영 원칙

- 비밀정보(키/토큰/개인정보)는 절대 기록하지 않습니다. 필요한 경우 환경변수 이름만 적습니다.
- "정본"은 `providers/<id>/README.md`이고, 여기(`README.md`)는 검색용 인덱스(카탈로그)로 유지합니다.
- 자주 변하는 값(레이트리밋, 요금)은 확정값으로 단정하지 않고, 공식 문서 링크를 함께 적습니다.

## 디렉토리 구조

```plaintext
.vibe-coding/PUBLIC_APIS/
├── README.md                 # 카탈로그 (이 파일)
├── PRIORITY_A.md             # A급 상세 문서 대상 목록
├── _templates/
│   ├── provider.md           # Provider 상세 문서 템플릿
│   ├── endpoint.md           # 엔드포인트 문서 템플릿
│   └── recipes.md            # 레시피(코드 예시) 템플릿
└── providers/
    └── <provider-id>/
        ├── README.md         # Provider 상세 문서 (A/B급만)
        └── recipes.md        # 실제 사용 예시
```

## 분류 체계

### 대분류 (10개)

| # | 대분류 | 포함 내용 |
| --- | --- | --- |
| 1 | 콘텐츠·미디어 | 동물, 아트, 도서, 음악, 애니, 게임, 퀴즈, 뉴스, 사전 |
| 2 | 커뮤니티·메시징 | 소셜, 채팅, SMS, 알림톡, 푸시 |
| 3 | 지도·모빌리티 | 지도, 지오코딩, 경로, 교통, 항공, 철도, 배송 |
| 4 | 커머스·결제·금융 | 결제, 구독, 인보이스, 뱅킹, 주식, 환율 |
| 5 | 공공·통계·연구 | 공공데이터, 통계, 아카이브, 특허, 논문 |
| 6 | 보안·리스크 | 보안평판, 위협인텔, 취약점, 인증/신원확인 |
| 7 | 개발·운영·자동화 | 개발도구, 테스트, 모킹, 문서, 링크카드, 유틸 |
| 8 | 라이프스타일·생활 | 푸드, 레시피, 영양, 건강, 날씨, 이벤트 |
| 9 | 생물·환경 | 생물다양성, 환경, 재해, 기후 |
| 10 | 신기술 | 블록체인, AI/ML (기술이 핵심 기능인 경우) |

### 태그 운영

- **분야** = 대분류 10개 중 1개 (필수)
- **태그** = 하위 분류 (복수 가능, 쉼표 구분)
- 예: `분야=지도·모빌리티`, `태그=항공,스케줄,실시간`

## 컬럼 정의

| 컬럼 | 설명 |
| --- | --- |
| API | Provider 또는 API 이름 |
| 용도 | 한 줄 설명 |
| 인증 | `No`, `apiKey`, `OAuth`, `Bearer` 등 |
| HTTPS | `Yes` / `No` |
| CORS | `Yes` / `No` / `Unknown` |
| 통합 방식 | `브라우저 직호출`, `서버 프록시 권장`, `SDK 권장` |
| 추천도 | 1~9, `-`=미평가 |
| 태그 | 하위 분류 (복수 가능) |

### 추천도 규칙

| 점수 | 의미 |
| --- | --- |
| 9 | 제품 핵심 기능급 |
| 7~8 | 강추 |
| 5~6 | 상황 따라 선택, 대체재 많음 |
| 3~4 | 특수 케이스 아니면 굳이 |
| 1~2 | 비추 (비용/제약 문제) |
| `-` | 미평가 |

### 상세 문서 우선순위

| 등급 | 대상 | 이유 |
| --- | --- | --- |
| A | 결제, OAuth, 메시지 발송, 보안 인텔, **개인정보 직접 처리** | 실수 한 번이 비용/사고로 직결 |
| B | 지도, PDF, 까다로운 공공데이터 | 파라미터/포맷 복잡 |
| C | 단순 GET, 이미지 URL | 상세 문서 불필요 |

> A급 대상 목록은 [PRIORITY_A.md](./PRIORITY_A.md)에서 별도 관리합니다.

## 카탈로그

### 커머스·결제·금융

| API | 용도 | 인증 | HTTPS | CORS | 통합 방식 | 추천도 | 태그 |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| [eBay](https://go.developer.ebay.com/) | 상품, 판매, 구매 연동 | OAuth | Yes | Unknown | 서버 프록시 권장 | 7 | 마켓플레이스 |
| [Alpha Vantage](https://www.alphavantage.co/) | 주식 실시간, 과거 데이터 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 주식 |
| [Financial Modeling Prep](https://financialmodelingprep.com/) | 주식 정보, 재무, 지표 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | 주식, 재무 |
| [Tradier](https://developer.tradier.com) | 미국 주식, 옵션 데이터 | OAuth | Yes | Yes | 서버 프록시 권장 | 7 | 주식, 옵션 |
| [CoinGecko](https://www.coingecko.com/en/api) | 코인 가격, 메타 | apiKey | Yes | Yes | 서버 프록시 권장 | 8 | 암호화폐 |
| [Coinpaprika](https://api.coinpaprika.com/) | 코인 기본 시세 | No | Yes | Yes | 브라우저 직호출 가능 | 7 | 암호화폐, 무인증 |
| [Frankfurter](https://www.frankfurter.app/docs) | 기준 환율, 시계열, 변환 | No | Yes | Yes | 브라우저 직호출 가능 | 8 | 환율, 무인증 |

### 보안·리스크

| API | 용도 | 인증 | HTTPS | CORS | 통합 방식 | 추천도 | 태그 |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| [AbuseIPDB](https://docs.abuseipdb.com/) | IP 평판 조회 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | IP, 폼방어 |
| [Google Safe Browsing](https://developers.google.com/safe-browse/) | URL 안전 검사 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | URL, 링크검증 |
| [VirusTotal](https://docs.virustotal.com/reference/overview) | URL, 파일, 도메인, IP 분석 | apiKey | Yes | Unknown | 서버 프록시 권장 | 9 | 보안핵심 |
| [IP2Proxy](https://www.ip2location.com/web-service/ip2proxy) | 프록시, VPN 감지 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | IP리스크 |
| [SmartIP.io](https://smartip.io) | IP 위치와 위협 인텔리전스 | apiKey | Yes | Yes | 서버 프록시 권장 | 7 | IP리스크 |
| [HaveIBeenPwned](https://haveibeenpwned.com/API/v3) | 침해 기반 노출 여부 조회 | apiKey | Yes | Unknown | 서버 프록시 권장 | 9 | 침해점검 |
| [National Vulnerability Database](https://nvd.nist.gov/vuln/Data-Feeds/JSON-feed-changelog) | CVE 취약점 데이터 | No | Yes | Unknown | 서버 프록시 권장 | 8 | 취약점; |
| [Shodan](https://developer.shodan.io/) | 인터넷 노출 자산 검색 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | 자산분석 |
| [Censys](https://censys.io/api) | 호스트, 인증서, 서비스 검색 | apiKey | Yes | No | 서버 프록시 필수 | 8 | 인증서 |
| [SecurityTrails](https://securitytrails.com/corp/api) | DNS, WHOIS 히스토리 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | 도메인조사 |
| [FraudLabs Pro](https://www.fraudlabspro.com/developer/api/screen-order) | 주문 사기 탐지 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 사기탐지 |
| [ipapi.is](https://ipapi.is/developers.html) | IP, ASN, 호스팅 감지 | No | Yes | Yes | 브라우저 직호출 가능 | 8 | IP리스크, 지역화 |
| [addr.zone](https://addr.zone/) | 프록시, 데이터센터, 악성 IP 탐지 | No | Yes | Yes | 브라우저 직호출 가능 | 8 | IP리스크, 스팸방어 |
| [Veriphone](https://veriphone.io/docs/v2) | 전화번호 유효성, 통신사 | apiKey | Yes | Yes | 서버 프록시 권장 | 7 | 전화검증, 사기방지 |
| [Cloudmersive Validate](https://cloudmersive.com/validate-api) | 이메일, 전화, VAT 등 종합 검증 | apiKey | Yes | Yes | 서버 프록시 권장 | 7 | 범용검증 |

### 커뮤니티·메시징

| API | 용도 | 인증 | HTTPS | CORS | 통합 방식 | 추천도 | 태그 |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| [MailboxValidator](https://www.mailboxvalidator.com/api-email-free) | 이메일 유효성 검사 | apiKey | Yes | No | 서버 프록시 권장 | 7 | 이메일검증 |
| [Mailgun](https://documentation.mailgun.com/en/latest/api_reference.html) | 트랜잭션, 알림 메일 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | 이메일발송 |
| [Open Collective](https://docs.opencollective.com/help/developers/api) | 후원, 재정 데이터 | No | Yes | Unknown | 서버 프록시 권장 | 7 | 후원 |
| [Twitch](https://dev.twitch.tv/docs) | 스트리밍 데이터 | OAuth | Yes | Unknown | 서버 프록시 권장 | 7 | 스트리밍 |
| [Discord](https://discordapp.com/developers/docs/intro) | 봇, 서버 연동 | OAuth | Yes | Unknown | 서버 프록시 권장 | 9 | 커뮤니티 |
| [Slack](https://api.slack.com/) | 팀 메시징, 워크플로우 | OAuth | Yes | Unknown | 서버 프록시 권장 | 9 | 팀도구 |
| [Reddit](https://www.reddit.com/dev/api) | 커뮤니티 데이터, 글 | OAuth | Yes | Unknown | 서버 프록시 권장 | 8 | 커뮤니티 |
| [Telegram Bot](https://core.telegram.org/bots/api) | 텔레그램 봇 | OAuth | Yes | Unknown | 서버 프록시 권장 | 7 | 봇 |
| [HackerNews](https://github.com/HackerNews/API) | 개발자 뉴스 | No | Yes | Unknown | 서버 프록시 권장 | 8 | 뉴스 |
| [Mailjet](https://dev.mailjet.com/email/reference/overview/) | 트랜잭션, 마케팅 메일 발송 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 이메일발송 |
| [Gmail](https://developers.google.com/gmail/api) | 메일 읽기, 라벨, 검색 | OAuth | Yes | Unknown | 서버 프록시 권장 | 8 | 이메일, OAuth |

### 지도·모빌리티

| API | 용도 | 인증 | HTTPS | CORS | 통합 방식 | 추천도 | 태그 |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| [Smartcar](https://smartcar.com/docs/) | 차량 잠금, 주행거리, 위치 연동 | OAuth | Yes | Yes | 서버 프록시 권장 | 8 | 자동차, OAuth |
| [CarsXE API](https://api.carsxe.com/?ref=public-apis-github) | VIN, 사양, 시장 가치, 이미지 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 자동차 |
| [adresse.data.gouv.fr](https://adresse.data.gouv.fr) | 프랑스 주소 DB, 지오코딩 | No | Yes | Unknown | 서버 프록시 권장 | 7 | 지오코딩, 프랑스 |
| [Google Maps](https://developers.google.com/maps/) | 지도, 장소, 라우팅, 지오코딩 | apiKey | Yes | Unknown | 서버 프록시 권장 | 9 | 지도 |
| [Mapbox](https://www.mapbox.com/developers/) | 지도, 타일, 지오코딩, 라우팅 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | 지도, 스타일링 |
| [HERE Maps](https://developer.here.com) | 지도, 지오코딩, 라우팅 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 지도 |
| [GeoJS](https://geojs.io/) | IP 기반 지리위치 | No | Yes | Yes | 브라우저 직호출 가능 | 7 | IP위치 |
| [IPinfo](https://ipinfo.io/) | IP 지리위치, ASN 등 | No | Yes | Unknown | 서버 프록시 권장 | 8 | IP위치 |
| [서울 TOPIS 교통정보](https://topis.seoul.go.kr/refRoom/openRefRoom_4.do) | 서울 교통 소통, 돌발, 전광판 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | 교통, 서울 |
| [서울시 버스 도착정보](http://api.bus.go.kr/contents/sub01/wisOpenApi.html) | 시내버스 실시간 도착 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | 버스, 서울 |
| [서울시 지하철 실시간 도착정보](https://data.seoul.go.kr/dataList/OA-12764/A/1/datasetView.do) | 지하철 실시간 도착 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | 지하철, 서울 |
| [따릉이 실시간 대여정보](https://data.seoul.go.kr/dataList/OA-15493/A/1/datasetView.do) | 대여소별 자전거, 거치대 현황 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 자전거, 서울 |
| [경기도 버스도착정보](https://www.data.go.kr/data/15080346/openapi.do?recommendDataYn=Y) | 경기도 버스 도착 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 버스, 경기 |
| [ODsay 대중교통 API](https://lab.odsay.com/guide/guide) | 전국 대중교통 경로, 요금, 환승 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | 경로, 전국 |
| [카카오모빌리티 길찾기](https://developers.kakaomobility.com/product/api) | 자동차, 도보 길찾기 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | 경로, 국내 |
| [레일포털 KRIC](https://data.kric.go.kr/rips/serviceInfo/openapi/introduce.do) | 전국 철도 공공 데이터 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 철도 |
| [한국환경공단 전기차충전소](https://www.data.go.kr/data/15076352/openapi.do) | 충전소 위치, 충전기 상태 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 전기차, 충전 |
| [French Address Search](https://geo.api.gouv.fr/adresse) | 프랑스 주소 검색 | No | Yes | Unknown | 서버 프록시 권장 | 7 | 주소검색, 프랑스 |
| [Yelp](https://www.yelp.com/developers/documentation/v3) | 지역 비즈니스 검색 | OAuth | Yes | Unknown | 서버 프록시 권장 | 7 | 로컬, 비즈니스 |
| [GraphHopper](https://graphhopper.com/api/1/docs/) | 경로 탐색, 턴바이턴 안내 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 경로, 라우팅 |
| [Navitia](https://api.navitia.io/) | 대중교통 데이터로 검색, 경로 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 대중교통 |
| [Open Charge Map](https://openchargemap.org/site/develop/api) | 전기차 충전소 위치 데이터 | No | Yes | Unknown | 서버 프록시 권장 | 7 | 충전소 |
| [Uber](https://developer.uber.com/products) | 요금 추정, 호출 연동 | OAuth | Yes | Yes | 서버 프록시 권장 | 7 | 라이드헤일링 |
| [ADS-B Exchange](https://www.adsbexchange.com/data/) | 항공기 실시간, 과거 데이터 | No | Yes | Unknown | 서버 프록시 권장 | 7 | 항공 |
| [REST Countries](https://restcountries.com) | 국가 기본 정보 | No | Yes | Yes | 브라우저 직호출 가능 | 8 | 국가 |
| [OpenCage](https://opencagedata.com) | 지오코딩 | apiKey | Yes | Yes | 서버 프록시 권장 | 7 | 지오코딩 |
| [LocationIQ](https://locationiq.org/docs/) | 지오코딩, 대량 지오코딩 | apiKey | Yes | Yes | 서버 프록시 권장 | 7 | 지오코딩 |
| [Postcodes.io](https://postcodes.io) | 영국 우편번호, 지오코딩 | No | Yes | Yes | 브라우저 직호출 가능 | 7 | 우편번호, 영국 |
| [Smarty US Autocomplete](https://smartystreets.com/docs/cloud/us-autocomplete-api) | 미국 주소 자동완성 | apiKey | Yes | Yes | 서버 프록시 권장 | 7 | 주소검증, 미국 |
| [Smarty US Extract](https://www.smarty.com/products/apis/us-extract-api) | 텍스트에서 미국 주소 추출 | apiKey | Yes | Yes | 서버 프록시 권장 | 7 | 주소검증, 미국 |
| [Smarty US Street Address](https://www.smarty.com/docs/cloud/us-street-api) | 미국 주소 검증, 정규화 | apiKey | Yes | Yes | 서버 프록시 권장 | 7 | 주소검증, 미국 |

### 공공·통계·연구

| API | 용도 | 인증 | HTTPS | CORS | 통합 방식 | 추천도 | 태그 |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| [Census.gov](https://www.census.gov/data/developers/data-sets.html) | 미국 인구, 경제 통계 | No | Yes | Unknown | 서버 프록시 권장 | 7 | 통계, 미국 |
| [Data.gov](https://api.data.gov/) | 미국 정부 데이터 API 허브 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 공공데이터 |
| [USAspending.gov](https://api.usaspending.gov/) | 연방 지출 데이터 | No | Yes | Unknown | 서버 프록시 권장 | 7 | 공공지출 |
| [Federal Register](https://www.federalregister.gov/reader-aids/developer-resources) | 정부 관보 데이터 | No | Yes | Unknown | 서버 프록시 권장 | 7 | 규정 |
| [EPA](https://developer.epa.gov/category/apis/) | 환경 데이터 | No | Yes | Unknown | 서버 프록시 권장 | 7 | 환경 |
| [openFDA](https://open.fda.gov) | 의약품, 의료기기, 식품 데이터 | No | Yes | Unknown | 서버 프록시 권장 | 8 | 헬스케어 |
| [USAJOBS](https://developer.usajobs.gov/) | 미국 정부 채용 검색 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 채용 |
| [Adzuna](https://developer.adzuna.com/overview) | 채용 데이터 집계 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 채용 |
| [Jobicy](https://jobicy.com/jobs-rss-feed) | 원격 채용 목록, RSS | No | Yes | Yes | 브라우저 직호출 가능 | 7 | 채용, 원격 |
| [교육부 나이스 학교기본정보](https://www.data.go.kr/data/15122275/openapi.do) | 전국 학교 기본 정보 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 교육, 학교 |
| [아파트 매매 실거래가](https://www.data.go.kr/data/15126469/openapi.do) | 아파트 매매 실거래 상세 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | 부동산 |
| [아파트 전월세 실거래가](https://www.data.go.kr/data/15126474/openapi.do) | 전세, 월세 실거래 상세 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | 부동산 |
| [한국부동산원 부동산통계](https://www.reb.or.kr/r-one/portal/openapi/openApiIntroPage.do) | 시장 동향, 통계 지표 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 부동산, 통계 |
| [NASA](https://api.nasa.gov) | NASA 데이터와 이미지 | No | Yes | Unknown | 서버 프록시 권장 | 8 | 우주, 교육 |
| [SpaceX API](https://github.com/r-spacex/SpaceX-API) | 발사, 로켓, 발사대 데이터 | No | Yes | Unknown | 서버 프록시 권장 | 8 | 우주, 데모 |
| [World Bank](https://datahelpdesk.worldbank.org/knowledgebase/topics/125589) | 국가 지표 데이터 | No | No | Unknown | 서버 프록시 권장 | 7 | 경제지표 |
| [Open Science Framework](https://developer.osf.io) | 연구 자료 저장소 API | No | Yes | Unknown | 서버 프록시 권장 | 7 | 연구, 아카이브 |
| [CORE](https://core.ac.uk/services#api) | 오픈 액세스 논문 데이터 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | 논문, 검색 |
| [Wikipedia](https://www.mediawiki.org/wiki/API:Main_page) | 위키 데이터 조회 | No | Yes | Unknown | 서버 프록시 권장 | 8 | 지식, 백과 |
| [Wikidata](https://www.wikidata.org/w/api.php?action=help) | 구조화 지식 그래프 | No | Yes | Unknown | 서버 프록시 권장 | 8 | 지식, 엔티티 |
| [Archive.org](https://archive.readme.io/docs) | 인터넷 아카이브 | No | Yes | Unknown | 서버 프록시 권장 | 7 | 아카이브 |
| [OpenCorporates](http://api.opencorporates.com/documentation/API-Reference) | 기업, 임원, 엔티티 데이터 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 기업데이터 |
| [USPTO](https://www.uspto.gov/learning-and-resources/open-data-and-mobility) | 미국 특허 오픈 데이터 | No | Yes | Unknown | 서버 프록시 권장 | 7 | 특허 |
| [EPO](https://developers.epo.org/) | 유럽 특허 검색 | OAuth | Yes | Unknown | 서버 프록시 권장 | 7 | 특허 |

### 개발·운영·자동화

| API | 용도 | 인증 | HTTPS | CORS | 통합 방식 | 추천도 | 태그 |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| [Favicon.im](https://favicon.im/domain/example.com) | 사이트 아이콘 가져오기 | No | Yes | No | 서버 프록시 필수 | 7 | 파비콘 |
| [LogoKit](https://docs.logokit.com/) | 브랜드, 주식, 코인 로고 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 로고, UI |
| [Rebrandly](https://developers.rebrandly.com/v1/docs) | 커스텀 도메인 브랜드 링크 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | URL단축 |
| [Beeceptor CRUD APIs](https://beeceptor.com/crud-api/?ref=public-api-lists) | 상태 저장되는 가짜 REST 백엔드 | No | Yes | Yes | 브라우저 직호출 가능 | 8 | 모킹 |
| [JSONPlaceholder](https://jsonplaceholder.typicode.com/) | 샘플 REST 데이터 | No | Yes | Unknown | 서버 프록시 권장 | 8 | 모킹 |
| [RandomUser](https://randomuser.me) | 랜덤 유저 프로필 생성 | No | Yes | Unknown | 서버 프록시 권장 | 8 | 모킹, 더미 |
| [Bitly](http://dev.bitly.com/get_started.html) | 링크 단축, 클릭 분석, 관리 | OAuth | Yes | Unknown | 서버 프록시 권장 | 7 | URL단축, 분석 |
| [Microlink.io](https://microlink.io/docs/api/getting-started/overview) | URL을 구조화 데이터로 변환 | No | Yes | Yes | 브라우저 직호출 가능 | 9 | 링크프리뷰 |
| [LinkPreview](https://www.linkpreview.net) | URL 요약, 미리보기 이미지 | apiKey | Yes | Yes | 서버 프록시 권장 | 7 | 링크카드 |
| [Libraries.io](https://libraries.io/api) | 오픈소스 패키지 메타데이터 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 패키지 |
| [JSONing](https://jsoning.com/api/) | 프로토타이핑용 모의 데이터 | No | Yes | Yes | 브라우저 직호출 가능 | 7 | 모킹 |
| [Dicebear Avatars](https://avatars.dicebear.com/) | 아바타 이미지 생성 | No | Yes | No | 브라우저 img로 사용 | 8 | 아바타 |
| [UPS](https://developer.ups.com/upsdeveloperkit) | 배송, 주소 검증, 트래킹 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 배송 |
| [GitHub REST API](https://docs.github.com/en/rest) | 저장소, 릴리즈, 이슈, 사용자 데이터 | OAuth | Yes | Yes | 서버 프록시 권장 | 9 | 자동화, 개발핵심 |
| [APIs.guru](https://apis.guru/api-doc/) | 공개 API OpenAPI 스펙 탐색 | No | Yes | Unknown | 서버 프록시 권장 | 7 | 스펙탐색 |
| [jsDelivr Data API](https://www.jsdelivr.com/docs/data.jsdelivr.com) | 패키지 메타, 다운로드 통계 | No | Yes | Yes | 브라우저 직호출 가능 | 7 | 패키지, 트렌드 |
| [QuickChart](https://quickchart.io/documentation/) | 차트 이미지, QR 등 이미지 생성 | No | Yes | Yes | 브라우저 직호출 가능 | 8 | 차트, QR |
| [ApiFlash](https://apiflash.com/) | 웹페이지 스크린샷 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 스크린샷 |
| [BrowserCat](https://www.browsercat.com/) | 헤드리스 브라우저 자동화 | apiKey | Yes | Yes | 서버 프록시 권장 | 7 | 브라우저자동화 |
| [RenderPDF.io](https://renderpdf.io/) | HTML 또는 URL을 PDF로 | apiKey | Yes | Yes | 서버 프록시 권장 | 8 | PDF |
| [Trello](https://developer.atlassian.com/cloud/trello/rest/) | 보드, 카드 자동화 | OAuth | Yes | Unknown | 서버 프록시 권장 | 7 | 업무자동화 |
| [CDNJS](https://cdnjs.cloudflare.com/ajax/libs) | CDN 라이브러리 정보 | No | Yes | Unknown | 브라우저 직호출 가능 | 7 | CDN, 패키지 |
| [Google Drive](https://developers.google.com/drive/api) | 파일 목록, 업로드, 공유 | OAuth | Yes | Unknown | 서버 프록시 권장 | 9 | 파일, OAuth |
| [Dropbox](https://www.dropbox.com/developers) | 파일 업로드, 공유 링크 | OAuth | Yes | Unknown | 서버 프록시 권장 | 8 | 파일, OAuth |
| [CircleCI](https://circleci.com/docs/api/v2/index.html) | 빌드, 테스트 자동화 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | CI, 파이프라인 |

### 콘텐츠·미디어

| API | 용도 | 인증 | HTTPS | CORS | 통합 방식 | 추천도 | 태그 |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| [The Cat API](https://thecatapi.com/) | 고양이 이미지, 품종 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | 동물, 키노출주의 |
| [Dog CEO](https://dog.ceo/dog-api/) | 개 품종별 이미지 | No | Yes | Yes | 브라우저 직호출 가능 | 9 | 동물, 데모용 |
| [Petfinder](https://www.petfinder.com/developers/v2/docs/) | 실제 입양 데이터 | OAuth2 | Yes | Yes | 서버 프록시 권장 | 8 | 입양 |
| [AniList](https://anilist.gitbook.io/anilist-apiv2-docs/) | 애니 메타데이터, GraphQL | OAuth | Yes | Unknown | 서버 프록시 권장 | 8 | 애니 |
| [Jikan](https://jikan.moe) | 애니 검색, 목록 UI | No | Yes | Yes | 브라우저 직호출 가능 | 8 | 애니, 무인증 |
| [Open Library Search API](https://openlibrary.org/dev/docs/api/search) | 책 검색, 자동완성 | No | Yes | Unknown | 브라우저 직호출 가능 | 8 | 도서, 검색 |
| [Open Library Covers API](https://openlibrary.org/dev/docs/api/covers) | 책 표지 이미지 | No | Yes | Unknown | 브라우저 직호출 가능 | 8 | 도서, 이미지 |
| [Google Books API](https://developers.google.com/books/) | 책 검색 품질 강화 | apiKey/OAuth2 | Yes | Unknown | 서버 프록시 권장 | 7 | 도서 |
| [TMDb](https://www.themoviedb.org/documentation/api) | 영화, TV, 인물 메타데이터 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | 영화, TV |
| [Open Movie Database](http://www.omdbapi.com/) | 영화 정보 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 영화 |
| [Trakt](https://trakt.tv/b/api-docs) | 시청 기록, 목록, 추천 데이터 | apiKey | Yes | Yes | 서버 프록시 권장 | 8 | 영화, 워치리스트 |
| [YouTube](https://developers.google.com/youtube/) | 검색, 채널, 재생목록 | OAuth | Yes | Unknown | 서버 프록시 권장 | 9 | 영상, OAuth |
| [Shotstack](https://shotstack.io/) | 클라우드 영상 편집 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 영상편집 |
| [국립국어원 우리말샘](https://opendict.korean.go.kr/service/openApiInfo) | 표준국어대사전 기반 조회 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | 사전, 한국어 |
| [iTunes Search](https://affiliate.itunes.apple.com/resources/documentation/itunes-store-web-service-search-api/) | iTunes 검색 | No | Yes | Unknown | 서버 프록시 권장 | 7 | 검색, 음악 |
| [TasteDive](https://tastedive.com/read/api) | 유사 아티스트, 영화, TV 추천 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 추천 |
| [New York Times](https://developer.nytimes.com/) | 기사 검색, 메타데이터 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 뉴스 |
| [The Guardian](http://open-platform.theguardian.com/) | 섹션, 태그 기반 기사 접근 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 뉴스 |
| [NewsAPI](https://newsapi.org/docs) | 여러 매체 헤드라인, 검색 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 뉴스 |
| [OkSurf](https://ok.surf/) | OG 이미지 포함 무료 뉴스 피드 | No | Yes | Yes | 브라우저 직호출 가능 | 8 | 뉴스, 무인증 |
| [Spotify](https://developer.spotify.com/documentation/web-api/) | 음악 카탈로그, 검색, 플레이리스트, 추천 | OAuth | Yes | Unknown | 서버 프록시 권장 | 9 | 음악 |
| [Deezer](https://developers.deezer.com/api) | 음악 검색, 아티스트, 앨범 | OAuth | Yes | Unknown | 서버 프록시 권장 | 7 | 음악 |
| [Discogs](https://www.discogs.com/developers/) | 발매 정보, 크레딧, 레이블 메타데이터 | OAuth | Yes | Unknown | 서버 프록시 권장 | 8 | 음악, 음반 |
| [MusicBrainz](https://musicbrainz.org/doc/MusicBrainz_API) | 오픈 음악 메타데이터 | No | Yes | Unknown | 서버 프록시 권장 | 8 | 음악 |
| [Genius](https://docs.genius.com/) | 가사, 주석, 음악 지식 | OAuth | Yes | Unknown | 서버 프록시 권장 | 8 | 음악, 가사 |
| [LastFm](https://www.last.fm/api) | 아티스트, 차트, 태그 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 음악, 태그 |
| [Freesound](https://freesound.org/docs/api/) | 사운드 샘플 검색 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 사운드 |
| [Lingua Robot](https://www.linguarobot.io) | 정의, 발음, 유의어, 반의어 | apiKey | Yes | Yes | 서버 프록시 권장 | 7 | 사전, 영어 |
| [Merriam-Webster](https://dictionaryapi.com/) | 사전, 유의어, 발음 오디오 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 사전, 영어 |
| [WordsAPI](https://www.wordsapi.com/) | 대규모 단어 정의, 동의어 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 사전, 영어 |
| [IGDB](https://api.igdb.com/) | 게임 DB | apiKey | Yes | Unknown | 서버 프록시 권장 | 9 | 게임 |
| [Steam Web API](https://developer.valvesoftware.com/wiki/Steam_Web_API) | Steam 계정, 게임 데이터 | OAuth | Yes | Unknown | 서버 프록시 권장 | 8 | 게임 |
| [Riot Games](https://developer.riotgames.com/) | 리그 오브 레전드 데이터 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | 게임, e스포츠 |
| [OpenDota](https://docs.opendota.com/) | Dota 2 매치, 플레이어 통계 | No | Yes | Unknown | 서버 프록시 권장 | 7 | 게임 |
| [PandaScore](https://api.pandascore.co) | e스포츠 경기, 결과 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | e스포츠 |
| [Pokéapi](https://pokeapi.co) | 포켓몬 데이터 | No | Yes | Unknown | 서버 프록시 권장 | 8 | 게임, 데모 |
| [Scryfall](https://scryfall.com/docs/api) | 매직 카드 DB | No | Yes | Yes | 브라우저 직호출 가능 | 8 | 카드게임 |
| [Open Trivia DB](https://opentdb.com/api_config.php) | 퀴즈 문제 | No | Yes | Unknown | 서버 프록시 권장 | 7 | 퀴즈 |

### 라이프스타일·생활

| API | 용도 | 인증 | HTTPS | CORS | 통합 방식 | 추천도 | 태그 |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| [Open-Meteo](https://open-meteo.com/) | 글로벌 예보, 히스토리 조회 | No | Yes | Yes | 브라우저 직호출 가능 | 9 | 날씨, 무인증 |
| [Meteorologisk Institutt](https://api.met.no/weatherapi/documentation) | MET Norway 날씨 | No | Yes | Unknown | 서버 프록시 권장 | 8 | 날씨 |
| [National Weather Service API](https://www.weather.gov/documentation/services-web-api) | 미국 공식 날씨 API | No | Yes | Unknown | 서버 프록시 권장 | 8 | 날씨, 미국 |
| [NOAA Climate Data](https://www.ncdc.noaa.gov/cdo-web/) | 날씨, 기후 장기 데이터 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 날씨, 기후 |

| [기상청 API허브](https://apihub.kma.go.kr/) | 관측, 예보, 위성, 레이더 통합 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | 날씨, 국내 |
| [기상청 동네예보](https://www.data.go.kr/data/15000099/openapi.do) | 읍면동 단기 예보 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | 날씨, 국내 |
| [기상청 중기예보](https://www.data.go.kr/data/15059468/openapi.do) | 향후 11일 전망 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 날씨, 중기 |
| [Sunrise and Sunset](https://sunrise-sunset.org/api) | 일출, 일몰 시간 | No | Yes | Unknown | 서버 프록시 권장 | 7 | 일출일몰 |
| [Ticketmaster](http://developer.ticketmaster.com/products-and-docs/apis/getting-started/) | 공연, 스포츠 이벤트 검색 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 이벤트 |
| [Eventbrite](https://www.eventbrite.com/developer/v3/) | 이벤트 검색, 티켓 정보 | OAuth | Yes | Unknown | 서버 프록시 권장 | 7 | 이벤트 |
| [SeatGeek](https://platform.seatgeek.com/) | 이벤트, 공연자, 장소 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 이벤트 |
| [Zestful](https://zestfuldata.com/) | 레시피 재료 파싱 | apiKey | Yes | Yes | 서버 프록시 권장 | 7 | 푸드 |
| [Google Calendar](https://developers.google.com/calendar/api) | 일정 읽기, 생성, 동기화 | OAuth | Yes | Unknown | 서버 프록시 권장 | 8 | 일정, OAuth |
| [OpenHolidays API](https://www.openholidaysapi.org/) | 공휴일, 학교 휴일 | No | Yes | Yes | 브라우저 직호출 가능 | 7 | 휴일, 무인증 |
| [Nager.Date](https://date.nager.at) | 다국가 공휴일 | No | Yes | No | 서버 프록시 권장 | 7 | 휴일 |
| [Abstract Holiday API](https://www.abstractapi.com/holidays-api) | 지역, 종교 휴일 | apiKey | Yes | Yes | 서버 프록시 권장 | 7 | 휴일 |
| [TheMealDB](https://www.themealdb.com/api.php) | 식사 레시피 | apiKey | Yes | Yes | 서버 프록시 권장 | 7 | 푸드, 레시피 |
| [Todoist](https://developer.todoist.com) | 할 일, 프로젝트 자동화 | OAuth | Yes | Unknown | 서버 프록시 권장 | 8 | 업무자동화 |
| [WakaTime](https://wakatime.com/developers) | 코딩 시간 추적 데이터 | No | Yes | Unknown | 서버 프록시 권장 | 7 | 생산성 |

### 생물·환경

| API | 용도 | 인증 | HTTPS | CORS | 통합 방식 | 추천도 | 태그 |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| [에어코리아 실시간 대기오염정보](https://www.data.go.kr/data/15073861/openapi.do) | 시도별 실시간 대기질 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | 대기질, 미세먼지 |
| [GBIF](http://api.gbif.org/v1/) | 전 세계 생물다양성 데이터 | No | Yes | Yes | 브라우저 직호출 가능 | 8 | 생물다양성 |
| [USGS Earthquake Hazards](https://earthquake.usgs.gov/fdsnws/event/1/) | 실시간 지진 데이터 | No | Yes | Unknown | 서버 프록시 권장 | 8 | 지진, 재해 |
| [USGS Water Services](https://waterservices.usgs.gov/) | 수위, 수질, 하천 데이터 | No | Yes | Unknown | 서버 프록시 권장 | 7 | 수질, 환경 |
| [OpenAQ](https://docs.openaq.org/) | 공개 대기질 데이터 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | 대기질 |
| [PVWatts](https://developer.nrel.gov/docs/solar/pvwatts/v6/) | 태양광 발전량 추정 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | 태양광, 에너지 |
| [UK Carbon Intensity](https://carbon-intensity.github.io/api-definitions/#carbon-intensity-api-v1-0-0) | 영국 전력 탄소 집약도 | No | Yes | Unknown | 서버 프록시 권장 | 7 | 탄소, 에너지 |

### 신기술

| API | 용도 | 인증 | HTTPS | CORS | 통합 방식 | 추천도 | 태그 |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| [Dialogflow](https://dialogflow.com) | 자연어 처리 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | NLP, 챗봇 |
| [Wit.ai](https://wit.ai/) | 자연어 처리 | OAuth | Yes | Unknown | 서버 프록시 권장 | 7 | NLP |
| [Detect Language](https://detectlanguage.com/) | 텍스트 언어 감지 | apiKey | Yes | Unknown | 서버 프록시 권장 | 7 | NLP, 언어감지 |
| [Google Cloud Natural Language](https://cloud.google.com/natural-language/docs/) | 감정, 엔티티, 구문 분석 | apiKey | Yes | Unknown | 서버 프록시 권장 | 8 | NLP |
| [Cloudmersive NLP](https://www.cloudmersive.com/nlp-api) | 감정 분석, 욕설 감지 등 | apiKey | Yes | Yes | 서버 프록시 권장 | 7 | NLP |
| [Yomi](https://github.com/ookii-tsuki/yomi) | 일본어 토크나이즈, 형태소 분석 | No | Yes | Yes | 라이브러리로 내장 | 7 | NLP, 일본어 |
