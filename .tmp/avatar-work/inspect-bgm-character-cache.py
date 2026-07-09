import json
from pathlib import Path

for character_id in ["16051", "16052", "611546", "16872", "19932"]:
    path = Path(f".tmp/avatar-work/new-birthday-batch/bgm-subject-cache/character-{character_id}.json")
    if not path.exists():
        continue
    data = json.loads(path.read_text())
    print()
    print(character_id, data.get("name"), data.get("birth_mon"), data.get("birth_day"), data.get("gender"))
    infobox = data.get("infobox")
    print(infobox[:12] if isinstance(infobox, list) else infobox)

for filename in [
    "subject-611546-characters.json",
    "subject-29011-characters.json",
    "subject-540108-characters.json",
]:
    path = Path(".tmp/avatar-work/new-birthday-batch/bgm-subject-cache") / filename
    print()
    print(filename, path.exists())
    if path.exists():
        data = json.loads(path.read_text())
        print(type(data).__name__, len(data) if isinstance(data, list) else data)
        print(json.dumps(data[:3] if isinstance(data, list) else data, ensure_ascii=False)[:2000])
