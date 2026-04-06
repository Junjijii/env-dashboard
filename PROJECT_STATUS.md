# プロジェクトステータス: env-dashboard

## 概要
環境破壊リアルタイムダッシュボード。日本の環境データ＆世界の環境破壊を可視化するWebサイト。

## 現在のバージョン / 状態
開発中 — Phase 2（主要ダッシュボード実装完了）

## 協業ステータス
- lead: Claude Code (surface:5)
- executor: Codex (surface:4)
- phase: implementation completed (PR ready)
- handoff_ready: false
- next_owner: Claude Code
- final_owner: Claude Code
- updated_at: 2026-04-06

## 技術スタック
- Next.js (App Router) + TypeScript + Tailwind CSS
- Recharts（グラフ）
- Vercelデプロイ

## ページ構成

### トップページ (`/`)
両ダッシュボードへの導線 + 主要数値サマリーカード

### 日本の環境データ (`/japan`)
- リアルタイム大気質: AQICN API → 主要都市AQIカード
- 気温推移グラフ: Open-Meteo Archive → 東京年平均気温1950〜2024年
- 現在の気象: Open-Meteo Forecast → リアルタイム気温・湿度・風速

### 世界の環境破壊 (`/global`)
- CO2濃度推移: NOAA Mauna Loa CSV → 1974年〜現在
- 世界気温偏差: NASA POWER API → 主要都市月次気温2000〜2023
- 大気質ランキング: AQICN API → 世界主要都市リアルタイムAQI

## API情報
| API | キー | CORS | 用途 |
|-----|------|------|------|
| AQICN | token=demo | OK | 大気質 |
| Open-Meteo | 不要 | OK | 気象・過去気温 |
| NOAA CO2 CSV | 不要 | OK | CO2濃度 |
| NASA POWER | 不要 | サーバー推奨 | 気温偏差 |

## ファイル構成（設計）
```
src/
├── app/
│   ├── layout.tsx          # 共通レイアウト（ナビ含む）
│   ├── page.tsx            # トップページ
│   ├── japan/page.tsx      # 日本の環境データ
│   └── global/page.tsx     # 世界の環境破壊
├── components/
│   ├── Navigation.tsx      # ヘッダーナビ
│   ├── SummaryCard.tsx     # 数値サマリーカード
│   ├── AqiCityCard.tsx     # 都市別AQIカード
│   ├── Co2Chart.tsx        # CO2推移チャート
│   ├── TempTrendChart.tsx  # 気温推移チャート
│   ├── AqiRanking.tsx      # AQIランキング
│   └── aqi-utils.ts        # AQI表示ヘルパー
└── lib/
    ├── aqicn.ts            # AQICN API
    ├── open-meteo.ts       # Open-Meteo API
    ├── noaa-co2.ts         # NOAA CO2データ取得・パース
    └── nasa-power.ts       # NASA POWER API
```

## 直近の変更
| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-04-06 | 初期セットアップ・設計 | Claude Code |
| 2026-04-06 | Issue #1-#3 実装: API層、6コンポーネント、3ページ、レイアウト/スタイル更新、lint/build確認 | Codex |

## 次にやること
- [x] lib/ API関数作成（4ファイル）
- [x] components/ チャート・カードコンポーネント作成
- [x] 3ページ実装（トップ・日本・世界）
- [ ] AQICN demoトークンを本番用トークンへ差し替え
- [ ] Vercelデプロイ確認

## 現在の問題
- AQICN `token=demo` は都市ごとの差分が不安定で、実運用では専用トークンへの差し替えが必要

## デプロイ / リリース方法
Vercelにデプロイ。`vercel --prod` or GitHub連携
