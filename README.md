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
