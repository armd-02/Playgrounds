# 遊具のある公園マップ

## Webサイト
* https://armd-02.github.io/Playgrounds/

## 目的
* 街で見つけた素敵な場所を地図で共有できる
* 子どもたちの希望に沿った公園を探すことができる
* 公園以外にも、遊具がある場所を探すことができる
* 公園整備状況を地図上で可視化することが出来る

## 利用環境
* Webブラウザ(PC/タブレット)、スマートフォン対応
* Cookie未使用

## Activity投稿先と認証方式

`data/config-user.jsonc` の `google.AppScript` にActivityの読込・投稿先URL、`google.authMode` に書き込み時の認証方式を設定します。

* `basic`: Community Map Makerバックエンドへ、HTTP Basic認証付きのJSON `POST`（追加）または `PUT`（編集）で送信
* `legacy`: 従来のGASへ、saltとSHA-256ハッシュを使う互換方式で送信

GASへ戻す場合は、`AppScript`をGASのWebアプリURLへ変更し、`authMode`を`legacy`にします。Basic認証は入力したパスワードをAuthorizationヘッダーで送るため、公開環境ではHTTPSを使用してください。

Firefoxのローカルネットワークアクセス保護により、フロントエンドとバックエンドを同じ端末で動かす場合でも、ホスト名とIPアドレスを混在させると通信許可が必要になることがあります。開発環境では `http://battle1:5500` と `http://battle1:18080` のように同じホスト名へ揃えます。

## リスト上部のアクションボタン設定

`google.authMode: "basic"` のとき、公園検索・評価検索・調査対象検索は、公園POIの表示ズーム未満でバックエンドの検索APIを使います。現在はズーム12未満がAPI、12以上が従来の表示範囲内POI検索です。境界は `areaFeatureLinker.areaTargets` の `poiView.poiZoom`（端末別の設定を含む）に従います。GAS（`legacy`）では従来の検索を使います。

検索先は `areaSearch.apiUrl`（既定 `activity-search.php`）を `google.AppScript` からの相対URLとして解決し、同じ `app` を渡します。低ズームでは全地域のActivity登録済みOSM IDを検索します。APIには座標・公園全件・親子関係がないため、表示範囲検索や未登録公園の網羅は行いません。一覧の未ロード対象はOSM IDを表示し、選択時にOSM情報を取得して移動・詳細表示します。検索条件はズーム変更後も引き継ぎます。

`data/config-user.jsonc` の `listActions` で、リスト上部に表示するボタンをサイトごとに設定できます。
このサイトでは閲覧者向けの「公園を探す」「評価で絞る」だけを常時表示し、口コミ・情報提供の入口はメインメニューと公園詳細に分けています。

* `use`: ボタン領域全体の表示・非表示
* `items[].use`: 各ボタンの表示・非表示
* `glotLabel` / `glotAriaLabel` / `glotTitle`: `glot-custom.jsonc` または `glot-system.jsonc` の翻訳キー
* `label` / `ariaLabel` / `title`: 翻訳キーを指定しない場合の固定文言
* `icon` / `buttonClass`: アイコンと見た目
* `handler`: クリック時に呼び出す公開メソッド名（例: `areaSearchController.open`）
* `args`: `handler` に渡す引数の配列

ボタンを使わないサイトでは、次のように空の項目も含めて設定します。

```jsonc
"listActions": {
    "use": false,
    "items": []
}
```

同じOSM地物へ複数の情報が投稿されている場合は、`listTable.groupActivitiesByOsmid` を `true` にするとリストを1行にまとめられます。`activityCountLabel` の `{count}` が投稿件数に置き換わり、詳細画面とCSVにはすべての投稿が保持されます。

## ニュースと起動案内の設定

Community Map Maker共通のニュース表示は、`data/config-user.jsonc`の`news.use`で切り替えます。ニュースを使わない場合も`sourceBaseUrl`などの項目は空欄で残します。この公園マップでは`false`に設定しています。

起動案内は`intro.use`で表示・非表示を切り替えます。背景地図の種類や年に関係なく、その日の最初の起動時に1回だけ表示します。表示履歴の保存先は`intro.storageKey`、表示内容は`index.html`の`cMapIntro`でサイトごとに変更できます。

## 敷地と地物の紐づけ

`AreaFeatureLinker` は、親となる敷地と、その内側にある地物・Activityを1敷地1レコードへまとめる汎用クラスです。対象は `data/config-user.jsonc` の `areaFeatureLinker.areaTargets` と `featureTargets` で指定します。公園と遊具だけでなく、建物と店舗などにも同じ仕組みを利用できます。

```jsonc
"areaFeatureLinker": {
    "use": true,
    "areaTargets": ["Buildings"],
    "featureTargets": ["Shops"],
    "mapMode": "allVisibleFeatures"
}
```

紐づけ済みの地物は `areaFeatureLinker.getLinkedFeatures(areaId, "Shops")` で取得できます。検索画面固有のラベル・プリセットは、紐づけ設定とは分離して `areaSearch` に定義します。

`mapMode` に `"allVisibleFeatures"` を指定すると、敷地単位のリストを維持したまま、通常表示では敷地外を含む表示対象POIを地図に描画します。敷地検索のフィルターが有効な間は、検索結果の敷地と紐づく地物だけを描画します。

敷地単位のリスト表示は `data/listtable.jsonc` の `list.views` で設定します。`source` に `areaFeatureLinker` を指定すると、`name`、`linkedFeatures`、`distance` を列として利用できます。`featureList` formatterは紐づく地物の名称またはカテゴリ名を重複なしで連結し、`distance` formatterは現在地（取得できない場合は設定により地図中心）から敷地までの概算距離を表示します。通常表示と検索中のビューは `viewBindings.default`、`viewBindings.areaSearch` でそれぞれ選択できます。画面を敷地単位にしながら従来のPOI単位CSVを維持する場合は、`listTable.exportSource` に `"poi"` を指定します。

従来の `columns.style`、`poiFields`、`actFields` 形式も引き続き利用できます。リストの表示・再生・CSVに関する `listTable` 設定は、リスト定義と同じ `data/listtable.jsonc` にまとめています。

## 今後
* 公園の健康器具も取り扱いたい（大人も楽しむ）

## 主な更新履歴
* 2023/07/16 初版公開
* 2023/08/19 主にバグ取り。詳細画面へのリンクミスなど
* 2023/09/26 十三新発見マップ2023のベースへ入れ替え
             遊具の写真を画面上に表示する機能を追加
* 2023/10/18 WikiMedia Commonsのファイル指定に対応
             「File:笠ノ庄児童遊園.jpg」などと指定
* 2024/03/15 システムのCommunityMapmakerを最新へ更新
             Wikimedia Commonsのコピーライトを追加
             Overpass APIにOSM JPのテストサーバを追加
             サムネイル画像サイズを調整
             編集画面でコメントを表示する機能を追加
* 2024/03/19 アップロード出来ないバグを修正
             アップロード進捗表示の場所を変更
* 2024/03/25 うんてい(monkey_bars.svg)を追加
             artwork.svg のデザインを見直し
* 2024/07/11 Overpass APIサーバエラー時の切り替え処理を強化
             アイコンの微調整、表示ズームレベルの微調整
* 2024/08/31 公園と地物の紐付けをするための処理を改善
             ズームに合わない地物を表示する不具合を改善
             地図の最大傾きを設定可能(maxPitch)とする
             ベースシステムをアップデート
* 2024/12/14 ベースシステムをアップデート
             広域表示だと重くなるので、1ズーム表示を狭く
* 2024/12/15 画像フル表示時の待ち時間中にスピナー表示
* 2024/12/25 UI見直し(横スクロールヒント、アイコン揺れなど)
             マルチポリゴン座標計算を追加（アイコン増える）
             Wikipediaがある公園を少し強調表示
             画像一覧の「Loading ...」がもっと出るように
             Wikimedia Commons画像をサムネイル強制(軽量化)
             遊具の種類をいくつか追加
* 2025/03/08 遊具や公園を表示するズームレベルを調整
             マーカーアイコンに影を追加
             ホイールによるズーム速度を調整
             イメージ一覧を誤って選択出来ないよう修正
* 2025/04/05 Overpass APIのエラー修正（長いクエリ対応）
             Wikimedia Commonsの多重リクエスト修正
             cssファイルの分割、タイルスタイルの修正
             起動時にActivityのOSMを取得するか設定追加他
* 2025/05/24 Overpass APIのサーバを一旦切り替え
* 2025/12/25 Community Mapmakerのベースシステムを更新
             チューニングとバグ取りにより軽量化を実現
             UIの見直し、アイコン表示の軽量化
* 2026/01/03 背景地図に地名や施設名を表示するよう変更
             遊具を追加するメニューが消えるバグを修正
* 2026/04/29 Overpass APIのキャッシュサーバをレンタルサーバーに配置
             キャッシュサーバーの接続先を開発者宅のNASへと設定する
             障害発生時は自動的に他のOverpass APIを利用する仕様は
             変化しないので、処理速度の高速化をある程度は達成
             Wikimedia Commonsのライセンス表記位置をセンタリング
             サーバーからの読み込み中メッセージを画面中央下へ表示
             キャッシュ利用のオン/オフを指定する機能を追加
             その他、リンク先やタイル表示の微調整
* 2026/04/30 スマホでテキスト入力時にウインドウが閉じる不具合修正
* 2026/05/02 キャッシュモードがオフになっていたのを修正
* 2026/06/20 wikimedialib.js新設。APIをキャッシュして無駄を削減
             grid.jsの利用を終了し、リストは自前で実装＆表現向上
             ズームレベルが高い時は、自動販売機を表示するように
             サイドバーを常に表示するように（縦表示には縦バー）
             口コミの項目を見直し、評価や特徴を記録できるように
             リストをCSV形式でダウンロード出来るように
             Google AppScriptに簡易キャッシュとバグ修正
             その他、ファイル名の見直しや統合をいくつか実施
* 2026/06/22 細かいバグを修正(スマホの入力、リスト表示など)
* 2026/09/02 公園リスト上部に「詳細情報無しリスト」を表示
             詳細画面の重複した情報追加ボタンを整理
             ボタンのホバー時の透明度変化を廃止
             「1年以上未確認」の対象を整理
             各モーダルの開始位置を画面上側に統一
             ローディング表示と「もっとズームしてください」を同じモーダルに統合
             公園の表示開始ズームレベルを12に変更
             リスト上部のアクションボタンを設定ファイルから変更可能に
             同じ公園への複数投稿を件数表示付きの1行に集約
             公園検索で同じ公園への全投稿内容を検索対象に集約
             「地域レポート」を平均評価による公園絞り込みに変更
* 2026/09/05 Community Map Maker共通のニュース表示機能と起動案内を取り込み
             ニュース表示と起動案内を設定ファイルで切り替え可能に変更
