from lxml import html
from pathlib import Path
path = Path(r"D:\blog\.worktrees\reference-wiki-phase1\public\uploads\galgame-90s-web-archive\togetter.com_li_2668171__4a86ea4a.html")
doc = html.fromstring(path.read_text(encoding='utf-8', errors='ignore'))
for el in doc.xpath('//*[self::article or self::main or self::div or self::section][@class or @id]'):
    text = ' '.join(el.xpath('.//text()'))
    text = ' '.join(text.split())
    if len(text) < 1000:
        continue
    cls = el.get('class','')
    _id = el.get('id','')
    print(len(text), el.tag, 'id='+_id, 'class='+cls[:120])