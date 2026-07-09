const names = [
  "宮本依千",
  "右田ひかり",
  "芹沢水結",
  "芹沢 水結",
  "右田 ひかり",
  "宮本 依千",
];

for (const keyword of names) {
  const response = await fetch("https://api.bgm.tv/v0/search/characters", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "ShinkiSakuraBlog/1.0 (local data correction)",
    },
    body: JSON.stringify({ keyword }),
  });
  const text = await response.text();
  console.log(`\n=== ${keyword} ${response.status} ===`);
  console.log(text.slice(0, 1600));
}
