from lxml import html
from pathlib import Path
path = Path(r"D:\blog\.worktrees\reference-wiki-phase1\public\uploads\galgame-90s-web-archive\urbanlife.tokyo_post_33057__wsl20260630.html")
doc = html.fromstring(path.read_text(encoding='utf-8', errors='ignore'))
for xp in ['//div[contains(@class,"p-post__content")][1]','//div[contains(@class,"p-post")][1]']:
    els = doc.xpath(xp)
    if els:
        text = ' '.join(' '.join(els[0].xpath('.//text()')).split())
        print('XPATH', xp)
        print(text[:1500])
        print('\n---\n')