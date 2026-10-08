# 遊具のある公園マップ

OpenStreetMap（OSM）の公園・遊具・設備データを使って、**遊びたい公園を探し、現地の情報をみんなで補完できる地図**です。

公園の場所だけでなく、すべり台、ブランコ、砂場などの遊具や、ベンチ・給水設備・自動販売機なども表示します。公園ごとの口コミ・評価・写真を追加し、「小さい子と遊ぶ」「たくさん遊ぶ」「ゆっくり過ごす」などの条件から公園を探すこともできます。

## Webサイト
* https://playgrounds.openacrossbase.net/

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
- 訪問済み・お気に入り・自分用メモをブラウザに保存
- 地図位置・選択対象の共有URLをコピー
- 公園・地物の詳細からGoogleマップで経路を検索
- 「未調査」「1年以上未確認」「写真なし」「情報が少ない」公園の抽出
- Wikimedia Commonsの写真、Wikipediaなどのオープンデータを活用
- リストのCSVダウンロード
- OSMの遊具・公園設備を低ポリゴン3Dモデルで表示
- PC、タブレット、スマートフォンに対応

## 口コミ・情報提供への参加

メニューの「口コミ・情報提供に参加」と、投稿画面のユーザー名・パスワード欄の下にある「初めての方へ：登録・参加方法」から、日本語・英語の参加案内を開けます。

口コミ・写真の投稿には、コミュニティマップメーカーのユーザー登録が必要です。[ユーザー登録](https://armd-01.sakura.ne.jp/community-mapmaker-backend/register.html?app_key=playgrounds)では参加プロジェクト `playgrounds` が初期選択されます。ユーザーID・メールアドレス・パスワードを登録し、確認メールからメール確認を完了してから、この地図の投稿画面で登録したユーザーIDとパスワードを使います。登録先のフォームは現在日本語です。このプロジェクトに参加済みの方は既存のアカウントを利用でき、別のプロジェクトだけに参加している方は管理者に参加先の追加を依頼してください。

公園・遊具の位置、名前、設備などを追加・修正するには、別途[OpenStreetMapのアカウント](https://www.openstreetmap.org/user/new)が必要です。口コミ・写真だけの投稿にはOSMアカウントは不要で、地図の閲覧だけならどちらの登録も不要です。

## 次の行き先と更新情報

地図に表示する対象を示す「公園・遊具・設備」のインジケーターは、左上のメニューの外側に表示します。読み込み中や案内メッセージの表示中は、同じ場所でその表示へ切り替わります。

一覧上部の「目的」を選ぶと、読み込み済みの場所を目的に合わせて絞り込みます。「表示」では周辺・お気に入り・最近見たを切り替えます。別の候補欄は設けず、写真・口コミの特徴・登録済み設備を同じ一覧に表示します。評価・未訪問などの細かな条件は絞り込み画面で指定できます。未登録の特徴や設備は推測しません。

新着は同じ場所の更新をまとめ、内訳から個々の口コミや地図情報を開けます。お気に入り・訪問済みを分け、各区分では未確認の更新と近い場所を優先します。まとめカードが画面に表示されると、そのカードに含まれる更新全体を既読として記録します。折りたたまれた内訳をすべて開く必要はありません。画面外のカードは未確認のままで、更新日時が変わった項目は再び未確認になります。取得件数に上限があるため、近所の更新をすべて網羅する表示ではありません。

「更新の内訳」は親カードの下に字下げと背景・左側の線でまとめ、先頭を含む全件を表示します。口コミではタイトル・本文・評価・現地確認日・良い点を表示し、同じ公園名の繰り返しを省きます。タイトルや本文が空でも、登録されている評価や良い点を確認できます。表示する内容は口コミの現在の内容で、編集前後の差分ではありません。

未確認の更新がある場合は、起動時や都道府県の移動時に新着モーダルを自動表示します。自動表示は同じ都道府県につき1日1回で、地図移動が終わってから開きます。`changes.ticker.autoOpen: false` で自動表示を無効にできます。更新ボタンの件数は未確認の更新数です。

更新の取得時刻と取得済みの一覧は都道府県ごとに保存します。別の都道府県へ移動しても、移動先の前回取得時刻から更新を確認し、元の都道府県へ戻るとその一覧を復元します。お気に入りの更新確認は地域とは別に1日1回行います。取得に失敗した場合は取得時刻を進めず、以前の一覧を保持します。

一覧上部の目的変更は追加の検索APIを呼びません。目的選択は低ズームでも取得済みデータのみを利用し、絞り込み画面から明示的に検索したときは既存のAPI検索を利用します。更新一覧には取得済みの要約を使い、口コミの内訳を初めて開く際に対象の口コミの詳細を取得します。同じ内訳を開き直す際は取得した内容を使い、取得失敗後は開き直して再試行できます。写真は直接URL、または通常のサムネイル表示で解決済みの画像を利用します。低ズームの検索件数プレビューは `areaSearch.previewCounts: false` で抑止し、検索を実行した後に件数を表示します。

一覧の詳細表示・訪問済み・お気に入りは独立したボタンです。Tabキーで各ボタンへ移動し、EnterキーまたはSpaceキーで操作できます。訪問済み・お気に入りを切り替えた後も操作したボタンへフォーカスを戻し、絞り込みで行が消えた場合は残っている詳細ボタンなどへ移します。

汎用の設定は `data/config-user.jsonc` の `discovery` にあります。`use` で有効化、`presetIds` で目的の選択肢、`featureFacts` で設備タグと表示文言キーを指定できます。内部のクラス・IDは `PlaceDiscoveryController`、`placeDiscovery`、`place-discovery-*` を使用し、施設の種類に依存しません。

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

3D表示は `data/config-user.jsonc` の `feature3d` で設定します。モデル読み込みに失敗した場合や対応するモデルがない場合は、従来のアイコン表示へフォールバックします。お気に入りにした地物には、通常のアイコン表示・3D表示のどちらでも小さなハートを重ね、解除するとハートも消えます。

## 共有・経路検索・自分用メモ

共有URLは `etc.publicUrl` の公開URLに、現在の地図位置や選択対象を付けて作成します。コピー成功時は案内を表示し、自動コピーできない場合は手動コピー用のURLを表示します。

詳細画面の経路アイコン付き「経路を検索」はGoogleマップの経路確認画面を開きます。紐づく公園・敷地がある場合はその代表位置、ない場合は選んだ地物の位置が目的地です。入口の位置を保証するものではありません。出発地と移動手段はGoogleマップ側で選択します。`directions.use` で表示を切り替えられます。

「自分用メモ（非公開）」は、このブラウザのローカルストレージに保存します。口コミとして公開されず、別の端末・ブラウザとは同期しません。みんなに伝える内容は「口コミ・情報を追加（公開）」から投稿します。

## データと技術

このサイトは主に次のデータ・技術を利用しています。

- **OpenStreetMap** — 公園、遊具、公園設備などの地理データ
- **Overpass API** — OSMデータの検索・取得
- **MapLibre GL JS 5.24.0** — Web地図表示
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
- ブラウザの言語設定に応じて日本語・英語で表示（日本語以外は英語）
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

`data/config-user.jsonc` の `activity.url` にActivityの読込・投稿先URL、`activity.authMode` に書き込み時の認証方式を設定します。`activity.local` にはローカル起動時のActivity APIとSchema APIをまとめて設定できます。

- `basic`: Community Map Makerバックエンドへ、HTTP Basic認証付きのJSON `POST`（追加）または `PUT`（編集）で送信
- `legacy`: 従来のGASへ、saltとSHA-256ハッシュを使う互換方式で送信

GASへ戻す場合は、`activity.url` をGASのWebアプリURLへ変更し、`activity.authMode` を `legacy` にします。

Basic認証は入力したパスワードをAuthorizationヘッダーで送るため、公開環境ではHTTPSを使用してください。

Firefoxのローカルネットワークアクセス保護により、フロントエンドとバックエンドを同じ端末で動かす場合でも、ホスト名とIPアドレスを混在させると通信許可が必要になることがあります。開発環境では `http://battle1:5500` と `http://battle1:18080` のように同じホスト名へ揃えます。

## 対象地物の検索（現在は公園）

`data/config-user.jsonc` の `areaSearch` で、検索・評価・調査対象抽出を設定します。現在の設定は公園向けです。対象は `areaFeatureLinker.areaTargets`、評価項目は `areaSearch.attributes`、目的プリセットは `areaSearch.presets` で定義します。寺社・店舗などへ適用するときは、対象の Overpass target と Activity の `app`、評価項目・プリセットを設定し、`data/glot-custom.jsonc` の `areaSearch_*` キーに日本語・英語の表示名を追加します。低ズームの検索では `activity.url` の `app` を引き継ぎ、必要なら `areaSearch.app` で指定できます。

現在は次のようなプリセットを定義しています。

- 小さい子と遊ぶ
- たくさん遊ぶ
- ゆっくり過ごす
- 暑い日に休む
- 行きやすさ重視
- 高評価の公園

「詳しい条件」では訪問状況・評価・特徴・情報の有無を編集し、「適用」で読み込み済みの場所へまとめて反映します。目的とお気に入り表示はリスト側に集約しています。目的の条件を変更すると「カスタム条件」と表示します。条件編集・件数プレビューは検索APIを呼びません。`activity.authMode: "basic"` の場合のみ、「この地図範囲を検索」で検索APIを明示的に呼び出せます。GAS（`legacy`）では読み込み済みの場所を絞り込みます。

検索先は `areaSearch.apiUrl`（既定 `activity-search.php`）を `activity.url` からの相対URLとして解決し、同じ `app` を渡します。

PHP Activity API利用時は、初回表示と地図移動時のActivity一覧を現在の表示範囲の `bbox` で取得します。保存・削除後の再取得も同じ範囲に限定します。座標未登録のActivityはAPI仕様により各範囲の応答へ含まれます。Google Apps Script利用時は従来の取得方法を維持します。

明示的な検索では現在の表示範囲を `bbox` として検索APIへ渡し、その範囲内に座標が保存されたActivityを検索します。日付変更線をまたぐ範囲など、APIの単一 `bbox` で表せない場合は追加検索を表示しません。座標未登録のActivity、Activity未登録の公園、公園と遊具の親子関係はこの検索結果に含まれません。一覧の未ロード対象はOSM IDを表示し、選択時にOSM情報を取得して移動・詳細表示します。検索条件は地図移動・ズーム変更後も引き継ぎますが、検索APIは自動で再呼び出しません。検索範囲が変わった場合は読み込み済みの場所の絞り込みに戻ります。

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

```jsonc
"intro": {
    "use": true,
    "storageKey": "playgrounds-intro-last-shown"
}
```

背景地図の種類や年による表示制限はありません。案内を使用しないサイトでは、項目を残したまま `use` を `false` にします。

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

## 汎用地物3Dライブラリとモデル設定

3D表示は `data/config-user.jsonc` の `feature3d` で設定します。

本体は `lib/mapfeature3d.js` の `MapFeature3D` です。OSMタグの種類を限定せず、案内板、記念碑、彫像、鳥居、灯籠、車止め、マンホール、消火栓、電柱なども、タグとGLB/glTFモデルの対応を設定して表示できます。新しいモデルファイルは別途用意してください。モデルを指定しただけではデータ取得対象は増えないため、このアプリでは `data/overpass-custom.jsonc` と表示カテゴリ・ズーム条件も対象地物に合わせて設定します。

遊具の組み立てモデルは `lib/playgroundmodels3d.js` の `PlaygroundModelFactories` に分離しています。本体は遊具の種類やこのアプリの詳細画面に依存しません。

```jsonc
"feature3d": {
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

任意の地物も、同じ `models` と `rules` を使います。たとえば案内板は `{ "tags": { "tourism": "information", "information": "board" }, "model": "information_board" }` とし、`models.information_board` に用意したモデルの `url` と `size` を設定します。ルール内のタグはAND、値の配列はOR、先に一致したルールを優先します。

他のMapLibreアプリからの利用例:

```javascript
const models3d = new MapFeature3D({
    onSelect: id => openFeatureDetails(id),
    getFeatureLabel: id => featureLabels.get(id) || id,
    getSelectionTitle: () => "Select a feature"
});
await models3d.init(map, feature3dConfig);
models3d.sync(pointFeatures); // GeoJSON Point Featureの配列
```

地物には一意の `id` を指定します。Polygonなどは `{ geojson: feature, lnglat: [lng, lat] }` として代表位置を渡せます。表示する地物の選別は呼び出し元が行います。`hasModel(id)` で3D表示の成否を確認し、通常アイコンと切り替えられます。

独自の組み立てモデルはコンストラクタの `modelFactories: { model_type: (THREE, definition) => object3d }` で登録し、モデル定義の `type` から指定できます。生成関数は同期的にThree.jsのObject3Dを返し、形状のサイズは従来どおり `size * visualScale` 倍になります。GLB/glTFの `size` は最長辺の長さ(m)です。遊具モデルを使うアプリは `modelFactories: PlaygroundModelFactories` を渡します。

新しいモデルを追加する場合は、そのモデルのライセンス条件に従い、各 `SOURCE.md` とクレジット表記も更新してください。

設定処理のテスト:

```bash
node tests/mapfeature3d-config.cjs
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
- **2026/09/13** 設定項目の共通化、低ズーム時の公園検索、リスト操作、読み込み・ズーム案内表示を改善、樹木追加

- **2026/10/07** 起動時の読み込み案内と各画面の英語対応を改善。MapLibre GL JSを5.24.0へ更新し、通常のマウスホイール感度を標準値に調整
- **2026/10/07** リスト最大化時のPOI表示を修正し、敷地内の遊具・設備やトイレ情報の表示を改善
- **2026/10/07** 目的別の絞り込み、周辺・お気に入り・最近見たの切り替え、前回の地図位置と目的の復元を追加
- **2026/10/07** 口コミ・地図情報の更新を場所ごとに集約し、未確認・既読の管理に対応。PHP Activity APIの取得を表示範囲に限定
- **2026/10/07** 地物の分類を設定ベースへ変更し、3D表示を汎用の `MapFeature3D` に変更。遊具モデルの生成処理を分離
- **2026/10/07** 共有URLとページの公開URLを統一し、コピー成功時の案内と手動コピーへの切り替えを追加
- **2026/10/07** 詳細画面に経路アイコン付き「経路を検索」を追加。「自分用メモ（非公開）」と「口コミ・情報を追加（公開）」の違いを日本語・英語で明記
- **2026/10/09** 都道府県ごとの更新取得履歴と一覧の保存、お気に入りの独立した更新確認、取得失敗時の履歴保持に対応。口コミの内訳に全件の内容を表示し、親子の階層と公園名の重複を整理。一覧の詳細・訪問済み・お気に入りを独立したボタンに変更し、キーボード操作を改善
