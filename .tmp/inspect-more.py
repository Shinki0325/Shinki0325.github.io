from lxml import html
from pathlib import Path
for name in [r"www.famitsu.com_news_202310_29322123.html__6a9fab1a.html", r"ja.wikipedia.org_wiki_ニフティサーブ__wsl20260630.html", r"togetter.com_li_2571855__wsl20260630.html"]:
    path = Path(r"D:\blog\.worktrees\reference-wiki-phase1\public\uploads\galgame-90s-web-archive") / name
    if not path.exists():
        print('MISSING', name)
        continue
    doc = html.fromstring(path.read_text(encoding='utf-8', errors='ignore'))
    print('FILE', name)
    for el in doc.xpath('//*[self::article or self::main or self::div or self::section][@class or @id]'):
        text = ' '.join(el.xpath('.//text()'))
        text = ' '.join(text.split())
        if len(text) < 1000:
            continue
        cls = el.get('class','')
        _id = el.get('id','')
        print(len(text), el.tag, 'id='+_id, 'class='+cls[:120])
    print('---')