from __future__ import annotations

import copy
import html
import json
import re
from pathlib import Path
from typing import Iterable

from lxml import etree, html as lxml_html

EMIT_TAGS = {"p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "figcaption", "pre", "dd", "dt"}
CONTAINER_TAGS = {"article", "main", "section", "div"}
GOOD_HINTS = ("article", "content", "body", "entry", "post", "main", "text", "tweet")
BAD_HINTS = (
    "comment",
    "related",
    "ranking",
    "popular",
    "share",
    "social",
    "nav",
    "breadcrumb",
    "sidebar",
    "footer",
    "header",
    "recommend",
    "pickup",
    "profile",
    "archive",
    "pager",
)

DOMAIN_SELECTORS: dict[str, list[str]] = {
    "note.com": ['//div[@data-name="body" and contains(@class, "textnote-body")]'],
    "x.com": ['//article[@data-tweet-id]//div[@dir="auto"][1]'],
    "urbanlife.tokyo": ['//div[contains(@class, "p-post__content")]'],
    "minkara.carview.co.jp": ["jsonld:articleBody", '//div[contains(@class, "blogMemo")]'],
    "www.famitsu.com": [
        '//div[contains(@class, "article-body__contents")]',
        '//div[contains(@class, "article-body")]',
    ],
    "news.denfaminicogamer.jp": ['//*[@id="articleBody"]'],
    "ja.wikipedia.org": ['//*[@id="mw-content-text"]'],
    "www.bilibili.com": ['//div[contains(@class, "opus-module-content")]'],
    "togetter.com": ['//article[contains(@class, "single-page")]'],
    "p-shirokuma.hatenadiary.com": ['//*[contains(@class, "entry-content")]'],
    "setoalpha.hatenablog.com": ['//*[contains(@class, "entry-content")]'],
    "eizo22.blog.fc2.com": ['//*[contains(@class, "main-body")][1]'],
    "blog.toppy.net": [
        '//*[contains(@class, "entry-content")]',
        '//*[contains(@class, "post-content")]',
        '//*[contains(@class, "article-body")]',
    ],
    "nlab.itmedia.co.jp": [
        '//*[@id="cmsBody"]',
        '//*[contains(@class, "article-body")]',
        '//*[contains(@class, "cmsBody")]',
    ],
    "gamesdata.info": ["//body"],
}

GENERIC_DROP_XPATHS = [
    ".//script",
    ".//style",
    ".//noscript",
    ".//svg",
    ".//form",
    ".//button",
    ".//header",
    ".//footer",
    ".//nav",
    ".//aside",
    ".//*[@embedded-service]",
    ".//*[@data-embed-service]",
    './/*[contains(@class, "related") or contains(@id, "related")]',
    './/*[contains(@class, "ranking") or contains(@id, "ranking")]',
    './/*[contains(@class, "recommend") or contains(@id, "recommend")]',
    './/*[contains(@class, "share") or contains(@class, "social") or contains(@class, "sns")]',
    './/*[contains(@class, "breadcrumb") or contains(@id, "breadcrumb")]',
]

DOMAIN_DROP_XPATHS: dict[str, list[str]] = {
    "ja.wikipedia.org": [
        ".//table",
        './/*[contains(@class, "mw-editsection")]',
        './/*[contains(@class, "reflist")]',
        './/*[contains(@class, "navbox")]',
        './/*[contains(@class, "infobox")]',
        './/*[contains(@class, "toc")]',
        './/*[contains(@class, "metadata")]',
        './/sup[contains(@class, "reference")]',
    ],
    "togetter.com": [
        './/*[contains(@class, "info_status_box")]',
        './/*[contains(@class, "tweet_action")]',
        './/*[contains(@class, "tweet_info")]',
    ],
    "www.famitsu.com": [
        './/div[contains(@class, "article-body__contents-pr-primary")]',
        './/aside[contains(@class, "article-page-link-container")]',
        './/div[contains(@class, "article-external-link-container")]',
        './/a[contains(@class, "btn")]',
        './/h2[starts-with(@id, "heading-")]/following-sibling::*',
        './/h2[starts-with(@id, "heading-")]',
    ],
}

STOP_MARKERS: dict[str, list[str]] = {
    "note.com": [
        "ダウンロード copy",
        "いいなと思ったら応援しよう！",
        "noteプレミアム",
        "トップ ゲーム",
        "トップ エンタメ",
    ],
    "x.com": [
        "Read 139 replies",
        "New to X?",
        "Relevant people",
        "Don't miss what's happening",
        "ひで on X:",
    ],
    "urbanlife.tokyo": [
        "関連記事",
        "人気記事ランキング",
        "ライフ エリアで探す",
        "東京で「つながる」を見つけるメディア",
    ],
    "minkara.carview.co.jp": [
        "ブログ一覧 |",
        "Posted at",
        "この記事へのコメント",
        "コメントする",
        "コメントへの返答",
        "プロフィール",
    ],
    "www.famitsu.com": [
        "## 『16bitセンセーション ANOTHER LAYER』関連記事",
        "## 『16bitセンセーション ANOTHER LAYER』連動コラム バックナンバーはこちら",
    ],
}


def normalize_text(value: str) -> str:
    normalized = html.unescape(value)
    normalized = normalized.replace("\xa0", " ").replace("\u3000", " ")
    normalized = normalized.replace("\r\n", "\n").replace("\r", "\n")
    normalized = re.sub(r"[ \t]+\n", "\n", normalized)
    normalized = re.sub(r"\n[ \t]+", "\n", normalized)
    normalized = re.sub(r"[ \t]{2,}", " ", normalized)
    normalized = re.sub(r"\n{3,}", "\n\n", normalized)
    return normalized.strip()


def detect_host(document: etree._Element, file_path: Path) -> str:
    candidates = document.xpath(
        '//link[@rel="canonical"]/@href | //meta[@property="og:url"]/@content | //meta[@name="twitter:url"]/@content'
    )
    for candidate in candidates:
        match = re.match(r"https?://([^/]+)/", candidate)
        if match:
            return match.group(1).lower()

    stem = file_path.name
    return stem.split("_", 1)[0].lower()


def iter_json_values(value: object) -> Iterable[dict]:
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from iter_json_values(child)
    elif isinstance(value, list):
        for item in value:
            yield from iter_json_values(item)


def extract_json_ld_article_body(document: etree._Element) -> str | None:
    for raw in document.xpath('//script[@type="application/ld+json"]/text()'):
        snippet = raw.strip()
        if not snippet:
            continue
        try:
            data = json.loads(snippet)
        except json.JSONDecodeError:
            continue

        for node in iter_json_values(data):
            article_body = node.get("articleBody")
            if isinstance(article_body, str):
                text = normalize_text(article_body)
                if len(text) >= 180:
                    return text
    return None


def score_candidate(node: etree._Element) -> float:
    text = normalize_text(" ".join(node.xpath(".//text()")))
    if len(text) < 220:
        return -1.0

    attrs = f"{node.get('id', '')} {node.get('class', '')}".lower()
    link_text = normalize_text(" ".join(node.xpath(".//a//text()")))
    link_density = len(link_text) / max(len(text), 1)
    score = len(text) * max(0.1, 1 - link_density)

    for hint in GOOD_HINTS:
        if hint in attrs:
            score += 500

    for hint in BAD_HINTS:
        if hint in attrs:
            score -= 900

    return score


def choose_fallback_node(document: etree._Element) -> etree._Element:
    best_node = document
    best_score = -1.0

    for node in document.xpath('//*[self::article or self::main or self::section or self::div][@class or @id]'):
        score = score_candidate(node)
        if score > best_score:
            best_score = score
            best_node = node

    return best_node


def remove_matching_nodes(node: etree._Element, xpaths: list[str]) -> None:
    for xpath in xpaths:
        for match in node.xpath(xpath):
            parent = match.getparent()
            if parent is not None:
                parent.remove(match)


def clone_node(node: etree._Element) -> etree._Element:
    return copy.deepcopy(node)


def apply_line_breaks(node: etree._Element) -> None:
    for br in node.xpath(".//br"):
        br.tail = ("\n" + br.tail) if br.tail else "\n"


def has_descendant_emit_tags(node: etree._Element) -> bool:
    for descendant in node.iterdescendants():
        if isinstance(descendant.tag, str) and descendant.tag.lower() in EMIT_TAGS:
            return True
    return False


def extract_lines(node: etree._Element) -> list[str]:
    lines: list[str] = []

    for element in node.iter():
        if not isinstance(element.tag, str):
            continue

        tag = element.tag.lower()
        if tag not in EMIT_TAGS:
            continue
        if tag not in {"h1", "h2", "h3", "h4", "h5", "h6"} and has_descendant_emit_tags(element):
            continue

        text = normalize_text("".join(element.itertext()))
        if not text:
            continue

        if tag.startswith("h") and len(tag) == 2 and tag[1].isdigit():
            lines.append(f"{'#' * int(tag[1])} {text}")
        elif tag == "li":
            lines.append(f"- {text}")
        else:
            lines.append(text)

    if not lines:
        text = normalize_text("".join(node.itertext()))
        return [text] if text else []

    return lines


def trim_after_stop_markers(text: str, host: str) -> str:
    stop_markers = STOP_MARKERS.get(host, [])
    cut_points = [text.find(marker) for marker in stop_markers if text.find(marker) > 0]
    if cut_points:
        text = text[: min(cut_points)].rstrip()
    return text


def extract_selected_node(document: etree._Element, host: str) -> str:
    selectors = DOMAIN_SELECTORS.get(host, [])

    for selector in selectors:
        if selector == "jsonld:articleBody":
            article_body = extract_json_ld_article_body(document)
            if article_body:
                return trim_after_stop_markers(article_body, host)
            continue

        matches = document.xpath(selector)
        if not matches:
            continue

        node = clone_node(matches[0])
        remove_matching_nodes(node, GENERIC_DROP_XPATHS)
        remove_matching_nodes(node, DOMAIN_DROP_XPATHS.get(host, []))
        apply_line_breaks(node)
        lines = extract_lines(node)
        text = normalize_text("\n\n".join(lines))
        text = trim_after_stop_markers(text, host)
        if len(text) >= 120:
            return text

    fallback = clone_node(choose_fallback_node(document))
    remove_matching_nodes(fallback, GENERIC_DROP_XPATHS)
    remove_matching_nodes(fallback, DOMAIN_DROP_XPATHS.get(host, []))
    apply_line_breaks(fallback)
    text = normalize_text("\n\n".join(extract_lines(fallback)))
    return trim_after_stop_markers(text, host)


def extract_text_from_html(raw_html: bytes, file_name: str = "") -> str:
    parser = lxml_html.HTMLParser(encoding="utf-8", recover=True)
    document = lxml_html.fromstring(raw_html, parser=parser)
    host = detect_host(document, Path(file_name or "archive.html"))
    article_body = extract_json_ld_article_body(document)

    if article_body and host == "minkara.carview.co.jp":
        return trim_after_stop_markers(article_body, host)

    return extract_selected_node(document, host)


def extract_text_from_file(file_path: Path | str) -> str:
    path = Path(file_path)
    return extract_text_from_html(path.read_bytes(), path.name)
