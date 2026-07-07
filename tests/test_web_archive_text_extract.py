import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from scripts.lib.web_archive_text_extract import extract_text_from_file  # type: ignore


ARCHIVE_ROOT = ROOT / "public" / "uploads" / "galgame-90s-web-archive"


class WebArchiveTextExtractTests(unittest.TestCase):
    def test_note_extract_keeps_body_and_drops_site_chrome(self):
        text = extract_text_from_file(
            ARCHIVE_ROOT / "note.com_chiyo_bb_n_n1384603c4f59__wsl20260630.html"
        )

        self.assertIn("突然ですが、好きだったゲームの話をしたいと思います。", text)
        self.assertIn("パソコンっていっても、まだハードディスクって概念すらなく、マウスもありません。", text)
        self.assertNotIn("投稿 ログイン 会員登録", text)
        self.assertNotIn("noteプレミアム", text)

    def test_urbanlife_extract_stops_before_related_articles(self):
        text = extract_text_from_file(ARCHIVE_ROOT / "urbanlife.tokyo_post_33057__wsl20260630.html")

        self.assertIn("都会しか見られないアニメがあった", text)
        self.assertIn("高まる「製作委員会方式」への認知", text)
        self.assertNotIn("関連記事", text)
        self.assertNotIn("人気記事ランキング", text)
        self.assertNotIn("東京 港区の工事現場に謎の謝罪看板", text)

    def test_minkara_extract_uses_article_body_without_comments(self):
        text = extract_text_from_file(
            ARCHIVE_ROOT / "minkara.carview.co.jp_userid_1329862_blog_24981676__wsl20260630.html"
        )

        self.assertIn(
            "９年前までテレ東系列が映らない地域に住んでいたので、アニメに関しては疎くてエヴァを観たのも２１世紀に入ってからでした。",
            text,
        )
        self.assertIn("レンタルが許諾されていないOVAモノとかもセル入荷日と同時に入ったりするので", text)
        self.assertNotIn("コメントする", text)
        self.assertNotIn("コメントへの返答", text)
        self.assertNotIn("プロフィール", text)

    def test_x_extract_keeps_post_and_drops_signup_chrome(self):
        text = extract_text_from_file(
            ARCHIVE_ROOT / "x.com_hide_yuki7777_status_2026131732542689338__7a775d8c.html"
        )

        self.assertIn("ほんの一時期だけ、エロゲーがオタクカルチャーの主流に君臨していた時期があるんですよ。", text)
        self.assertIn("1990年代末～2000年代前半くらいの、ほんの数年の短い期間だけ。", text)
        self.assertNotIn("Sign up now", text)
        self.assertNotIn("Relevant people", text)

    def test_famitsu_extract_stops_before_related_links(self):
        text = extract_text_from_file(
            ARCHIVE_ROOT / "www.famitsu.com_news_202310_29322123.html__6a9fab1a.html"
        )

        self.assertIn("Leafの“ビジュアルノベル”は、汎用の背景CG＋キャラクターの立ち絵の組み合わせ", text)
        self.assertNotIn("## 『16bitセンセーション ANOTHER LAYER』関連記事", text)
        self.assertNotIn("第10回：1980年代、PC（マイコン）向けにさまざまなメーカーが展開していた", text)


if __name__ == "__main__":
    unittest.main()
