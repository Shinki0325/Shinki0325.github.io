from lxml import html
from pathlib import Path
files = [
 r"www.bilibili.com_opus_960241593770115119__manual20260630.html",
 r"news.denfaminicogamer.jp_interview_231116a__wsl20260630.html",
 r"p-shirokuma.hatenadiary.com_entry_2025_02_24_231129__manual20260630.html",
 r"eizo22.blog.fc2.com_blog-entry-270.html__wsl20260630.html"
]
root = Path(r"D:\blog\.worktrees\reference-wiki-phase1\public\uploads\galgame-90s-web-archive")
for name in files:
    path = root / name
    if not path.exists():
        print('MISSING', name)
        continue
    doc = html.fromstring(path.read_text(encoding='utf-8', errors='ignore'))
    print('FILE', name)
    for el in doc.xpath('//*[self::article or self::main or self::div or self::section][@class or @id]'):
        text = ' '.join(el.xpath('.//text()'))
        text = ' '.join(text.split())
        if len(text) < 800:
            continue
        cls = el.get('class','')
        _id = el.get('id','')
        print(len(text), el.tag, 'id='+_id, 'class='+cls[:120])
    print('---')