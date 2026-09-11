# 遊具のある公園マップ

OpenStreetMap（OSM）の公園・遊具・設備データを使って、**遊びたい公園を探し、現地の情報をみんなで補完できる地図**です。

公園の場所だけでなく、すべり台、ブランコ、砂場などの遊具や、ベンチ・給水設備・自動販売機なども表示します。公園ごとの口コミ・評価・写真を追加し、「小さい子と遊ぶ」「たくさん遊ぶ」「ゆっくり過ごす」などの条件から公園を探すこともできます。

## Webサイト

**https://playgrounds.openacrossbase.net/**

GitHub Pages: https://armd-02.github.io/Playgrounds/

## 主な機能

- OpenStreetMapに登録された公園・遊具・公園設備を地図上に表示
- 公園単位で、その敷地内にある遊具・設備をまとめて表示
- 条件から公園を検索
  - 小さい子と遊ぶ
  - たくさん遊ぶ
  - ゆっくり過ごす
  - 暑い日に休む
  - 行きやすさ重視
  - 高評価の公園 など
- 公園への口コミ・評価・特徴・写真の投稿
- 「未調査」「1年以上未確認」「写真なし」「情報が少ない」公園の抽出
- Wikimedia Commonsの写真、Wikipediaなどのオープンデータを活用
- リストのCSVダウンロード
- OSMの遊具・公園設備を低ポリゴン3Dモデルで表示
- PC、タブレット、スマートフォンに対応

## 3D表示

OSMのタグに応じて、一部の遊具・公園設備を地図記号として3D表示します。

現在の主な対象は次のとおりです。

### 遊具

- `playground=slide` — すべり台
- `playground=swing` — ブランコ
- `playground=sandpit` — 砂場
- `playground=climbingframe` — ジャングルジム・クライミングフレーム
- `playground=structure` — 複合遊具
- `playground=seesaw` — シーソー
- `playground=basketswing` — バスケット型ブランコ
- `playground=horizontal_bar` — 鉄棒
- `playground=springy` — スプリング遊具
- ドーム型遊具など、プロジェクト独自のモデル

### 公園設備

- `amenity=bench` — ベンチ
- `amenity=drinking_water` — 給水設備
- `amenity=vending_machine` — 自動販売機

3Dモデルは実物の形状を再現することを目的としたものではなく、**OSMに登録された地物の種類を分かりやすく表現する地図記号**として利用しています。

モデルごとの出典・ライセンスと設定方法は以下を参照してください。

- [遊具3Dモデル](assets/models/playground/README.md)
- [公園設備3Dモデル](assets/models/poi/README.md)

3D表示は `data/config-user.jsonc` の `playground3d` で設定します。モデル読み込みに失敗した場合や対応するモデルがない場合は、従来のアイコン表示へフォールバックします。

## データと技術

このサイトは主に次のデータ・技術を利用しています。

- **OpenStreetMap** — 公園、遊具、公園設備などの地理データ
- **Overpass API** — OSMデータの検索・取得
- **MapLibre GL JS** — Web地図表示
- **Wikimedia Commons** — 公園・遊具などの写真
- **Wikipedia / Wikidata** — 関連する説明・オープンデータ
- **Community Map Maker** — 本サイトのベースとなる地図アプリケーション

Overpass APIはキャッシュと複数サーバーへの切り替えに対応しており、特定サーバーの障害時にもできるだけ利用を継続できる構成にしています。

## 目的

- 街で見つけた公園や遊び場の情報を共有する
- 子どもや利用者の希望に合った公園を探しやすくする
- 公園以外に設置されている遊具も見つけられるようにする
- OpenStreetMapだけでは表現しにくい、口コミ・評価・写真などの情報を補完する
- 公園や遊具の整備・調査状況を地図上で可視化する
- OpenStreetMapやWikimediaなどのオープンデータを、実際に役立つ形で活用する

## 利用環境

- Webブラウザ（PC / タブレット / スマートフォン）
- Cookie未使用
- 起動案内の表示履歴など、一部のUI状態にはブラウザのローカルストレージを使用

ローカルで確認する場合は、`file://` で直接開くのではなくHTTPサーバー経由で配信してください。

例:

```bash
python3 -m http.server 8000
```

その後、`http://localhost:8000/` を開きます。

## 主な設定ファイル

| ファイル | 内容 |
| --- | --- |
| `data/config-user.jsonc` | サイト固有の地図、検索、3D表示、Activityなどの設定 |
| `data/config-system.jsonc` | Community Map Maker共通設定・背景地図定義 |
| `data/overpass-custom.jsonc` | OSM / Overpass検索対象 |
| `data/category-ja.jsonc` | 日本語カテゴリ定義 |
| `data/category-en.jsonc` | 英語カテゴリ定義 |
| `data/marker.jsonc` | POI・遊具などのマーカー設定 |
| `data/listtable.jsonc` | 公園リスト・CSV出力設定 |
| `data/glot-custom.jsonc` | サイト固有の表示文言・多言語化 |
| `assets/models/playground/` | 遊具3Dモデル |
| `assets/models/poi/` | 公園設備3Dモデル |

## Activity投稿先と認証方式

`data/config-user.jsonc` の `google.AppScript` にActivityの読込・投稿先URL、`google.authMode` に書き込み時の認証方式を設定します。

- `basic`: Community Map Makerバックエンドへ、HTTP Basic認証付きのJSON `POST`（追加）または `PUT`（編集）で送信
- `legacy`: 従来のGASへ、saltとSHA-256ハッシュを使う互換方式で送信

GASへ戻す場合は、`AppScript` をGASのWebアプリURLへ変更し、`authMode` を `legacy` にします。

Basic認証は入力したパスワードをAuthorizationヘッダーで送るため、公開環境ではHTTPSを使用してください。

Firefoxのローカルネットワークアクセス保護により、フロントエンドとバックエンドを同じ端末で動かす場合でも、ホスト名とIPアドレスを混在させると通信許可が必要になることがあります。開発環境では `http://battle1:5500` と `http://battle1:18080` のように同じホスト名へ揃えます。

## 公園検索

`data/config-user.jsonc` の `areaSearch` で、公園検索・評価・調査対象抽出を設定します。

現在は次のようなプリセットを定義しています。

- 小さい子と遊ぶ
- たくさん遊ぶ
- ゆっくり過ごす
- 暑い日に休む
- 行きやすさ重視
- 高評価の公園

`google.authMode: "basic"` のとき、公園POIの表示ズーム未満ではバックエンドの検索APIを利用します。現在はズーム12未満がAPI、12以上が従来の表示範囲内POI検索です。境界は `areaFeatureLinker.areaTargets` の `poiView.poiZoom`（端末別設定を含む）に従います。

検索先は `areaSearch.apiUrl`（既定 `activity-search.php`）を `google.AppScript` からの相対URLとして解決し、同じ `app` を渡します。

低ズームではActivity登録済みOSM IDを検索します。バックエンドAPIには公園全件や親子関係がないため、未登録公園を含む完全な公園検索は、OSMデータが読み込まれた表示範囲内で行います。

## リスト上部のアクションボタン設定

`data/config-user.jsonc` の `listActions` で、リスト上部に表示するボタンをサイトごとに設定できます。

- `use`: ボタン領域全体の表示・非表示
- `items[].use`: 各ボタンの表示・非表示
- `glotLabel` / `glotAriaLabel` / `glotTitle`: 翻訳キー
- `label` / `ariaLabel` / `title`: 固定文言
- `icon` / `buttonClass`: アイコンと見た目
- `handler`: クリック時に呼び出す公開メソッド名
- `args`: `handler` に渡す引数

例:

```jsonc
"listActions": {
    "use": false,
    "items": []
}
```

同じOSM地物へ複数のActivityが投稿されている場合は、`listTable.groupActivitiesByOsmid` を `true` にするとリストを1行にまとめられます。詳細画面とCSVにはすべての投稿を保持します。

## ニュースと起動案内

Community Map Maker共通のニュース表示は `data/config-user.jsonc` の `news.use` で切り替えます。この公園マップでは現在 `false` です。

起動案内は `intro.use` で表示・非表示を切り替えます。その日の最初の起動時に1回だけ表示し、表示履歴の保存先は `intro.storageKey`、表示内容は `index.html` の `cMapIntro` で変更できます。

## 公園と遊具・設備の紐づけ

`AreaFeatureLinker` は、親となる敷地と、その内側にある地物・Activityを1敷地1レコードへまとめる汎用クラスです。

本サイトでは、公園を親として、その内部の遊具・設備を紐づけています。

対象は `data/config-user.jsonc` の `areaFeatureLinker.areaTargets` と `featureTargets` で指定します。

```jsonc
"areaFeatureLinker": {
    "use": true,
    "areaTargets": ["Buildings"],
    "featureTargets": ["Shops"],
    "mapMode": "allVisibleFeatures"
}
```

紐づけ済みの地物は `areaFeatureLinker.getLinkedFeatures(areaId, "Shops")` で取得できます。

`mapMode` に `"allVisibleFeatures"` を指定すると、敷地単位のリストを維持したまま、通常表示では敷地外を含む表示対象POIも地図に描画します。公園検索のフィルター中は、検索結果の公園と紐づく地物を中心に表示します。

敷地単位のリスト表示は `data/listtable.jsonc` の `list.views` で設定します。`source` に `areaFeatureLinker` を指定すると、`name`、`linkedFeatures`、`distance` などを列として利用できます。

## 3Dモデル設定

3D表示は `data/config-user.jsonc` の `playground3d` で設定します。

```jsonc
"playground3d": {
    "use": true,
    "visualScale": 1.0,
    "models": {
        "slide": {
            "url": "./assets/models/playground/leonkin-playground/GLTF/slide.glb",
            "size": 4
        }
    },
    "rules": [
        {
            "tags": { "playground": "slide" },
            "model": "slide"
        }
    ]
}
```

主な設定:

- `use`: 3D表示全体の有効・無効
- `visualScale`: 全モデル共通の表示倍率
- `models`: モデルURL、表示サイズ、組み立てモデル種別など
- `rules`: OSMタグとモデルIDの対応
- `hitArea`: 3Dモデルをクリック・タップしやすくする透明な判定領域

新しいモデルを追加する場合は、そのモデルのライセンス条件に従い、各 `SOURCE.md` とクレジット表記も更新してください。

設定処理のテスト:

```bash
node tests/playground3d-config.cjs
```

## ライセンス

ソースコードは [MIT License](LICENSE) です。

ただし、OpenStreetMap、Wikimedia Commons、3Dモデル、背景地図など、外部由来のデータ・素材にはそれぞれのライセンスが適用されます。3Dモデルについては各モデルディレクトリの `SOURCE.md` およびREADMEを確認してください。

## 今後

- 公園の健康器具など、大人も利用する設備への対応拡充
- 公園の調査・更新状況をより分かりやすく可視化
- OSMデータと現地投稿データを組み合わせた検索・分析機能の強化

## 主な更新履歴

- **2023/07/16** 初版公開
- **2023/09/26** 遊具写真の表示に対応
- **2023/10/18** Wikimedia Commonsのファイル指定に対応
- **2024/03/15** Wikimedia Commonsクレジット、Overpass API切り替えなどを改善
- **2024/08/31** 公園と地物の紐づけ処理を改善、地図の最大傾き設定を追加
- **2024/12/25** UI・マルチポリゴン・Wikipedia表示・Commons画像取得を改善、遊具種類を追加
- **2025/04/05** Overpass API長大クエリ、Wikimedia Commonsリクエスト、CSS・タイルスタイルなどを改善
- **2025/12/25** Community Map Makerのベースシステムを更新し、軽量化とUI改善
- **2026/04/29** Overpass APIキャッシュを導入し、障害時の自動切り替えと読み込み表示を改善
- **2026/06/20** Wikimedia APIキャッシュ、独自リストUI、口コミ評価・特徴、CSV出力などを追加
- **2026/09/02** 公園検索・調査対象リスト・Activity集約・平均評価による絞り込みなどを強化
- **2026/09/05** Community Map Maker共通のニュース表示機能と起動案内を取り込み
- **2026/09/08** OSMの遊具を低ポリゴン3Dモデルで表示する機能を追加
- **2026/09/12** 3Dモデルを拡充し、遊具に加えてベンチ・給水設備・自動販売機などの公園設備にも対応。背景地図スタイルも調整
