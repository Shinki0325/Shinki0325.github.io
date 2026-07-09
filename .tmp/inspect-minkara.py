from lxml import html
from pathlib import Path
path = Path(r"D:\blog\.worktrees\reference-wiki-phase1\public\uploads\galgame-90s-web-archive\minkara.carview.co.jp_userid_1329862_blog_24981676__wsl20260630.html")
doc = html.fromstring(path.read_text(encoding='utf-8', errors='ignore'))
for el in doc.xpath('//*[self::article or self::main or self::div or self::section][@class or @id]'):
    text = ' '.join(el.xpath('.//text()'))
    text = ' '.join(text.split())
    if len(text) < 500:
        continue
    cls = el.get('class','')
    _id = el.get('id','')
    print(len(text), el.tag, 'id='+_id, 'class='+cls[:120])