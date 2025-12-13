# 웹소설 집필 템플릿

AI와 함께 웹소설을 집필하기 위한 템플릿입니다.

**워크플로우**: [WORKFLOW.md](WORKFLOW.md) 참조

## 폴더 구조

```plaintext
WEBNOVEL/
├── README.md           # 이 파일
├── WORKFLOW.md         # 집필 워크플로우 + 플로우차트
├── TEMPLATE.md         # 작품 기본 정보 (장르, 시놉시스)
├── EPISODES.md         # 부별 줄거리 + 등장요소 목록
│
├── proposals/          # AI 제안 저장소
│   └── _template.md
├── characters/         # 캐릭터 개별 파일
│   └── _template.md
├── objects/            # 사물 개별 파일
│   └── _template.md
├── phenomena/          # 현상 개별 파일
│   └── _template.md
│
└── works/              # 실제 원고
    └── part-NNN.md     # 3자리 0패딩 (001~999)
```
