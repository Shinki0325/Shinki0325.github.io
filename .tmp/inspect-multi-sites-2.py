from lxml import html
from pathlib import Path
files = [
 r"www.bilibili.com_opus_810264516919034071_from_search_spm_id_from_333.337.0.0__51bf94f1.html",
 r"news.denfaminicogamer.jp_interview_250325e__9c9db57f.html",
 r"p-shirokuma.hatenadiary.com_entry_20060830_p1__manual20260630.html",
 r"setoalpha.hatenablog.com_entry_2019_08_12_024509__manual20260630.html"
]
root = Path(r"D:\blog\.worktrees\reference-wiki-phase1\public\uploads\galgame-90s-web-archive")
for name in files:
    path = root / name
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