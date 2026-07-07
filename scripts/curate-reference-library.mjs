import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const referencesRoot = "D:/blog/.worktrees/reference-wiki-phase1/src/content/references";

const curatedReferences = {
  "e-login-wikipedia.md": {
    title: "E-LOGIN 条目",
    librarySection: "社会背景",
    summary: "E-LOGIN 这本游戏杂志的定位、栏目环境，以及它在美少女游戏传播中的入口作用。",
    relatedRefs: ["tech-gian-wikipedia", "pc-9801-computer-museum"]
  },
  "leaf-key-interview.md": {
    title: "Leaf、Key 对谈",
    librarySection: "作品与人物",
    summary: "Leaf 与 Key 创作者回看《To Heart》与《鸟之诗》时代脉络的长篇访谈。",
    relatedRefs: ["to-heart-wikipedia", "visual-novel-origins-famitsu", "leaf、key対談-インタビュー-ときメモ-に挑んだ-toheart-鳥の詩-制作秘話、時代を変えたkeyの泣きゲー"]
  },
  "pc-9800-15-million.md": {
    title: "PC-9800 累计销量报道",
    librarySection: "社会背景",
    summary: "PC-9800 系列累计销量突破一千五百万台时的新闻报道与平台规模感。",
    relatedRefs: ["pc-9801-computer-museum", "国民機パソコン、その誕生から引退まで-大塚商会"]
  },
  "pc-9801-computer-museum.md": {
    title: "PC-9801 电脑博物馆",
    librarySection: "社会背景",
    summary: "PC-9801 机型沿革、硬件定位与它在日本个人电脑史中的代表性位置。",
    relatedRefs: ["pc-9800-15-million", "国民機パソコン、その誕生から引退まで-大塚商会"]
  },
  "tech-gian-wikipedia.md": {
    title: "TECH GIAN 条目",
    librarySection: "社会背景",
    summary: "TECH GIAN 这本杂志的基本信息与它在成人游戏传播链路中的位置。",
    relatedRefs: ["e-login-wikipedia", "これまでの歩み-ソフマップ-sofmap"]
  },
  "to-heart-wikipedia.md": {
    title: "《To Heart》条目",
    librarySection: "作品与人物",
    summary: "《To Heart》的作品概况、媒体展开路径，以及它在九十年代末的代表性地位。",
    relatedRefs: ["leaf-key-interview", "visual-novel-origins-famitsu", "同級生-ゲーム-wikipedia"]
  },
  "visual-novel-origins-famitsu.md": {
    title: "视觉小说的诞生与繁盛",
    librarySection: "回忆、讨论与后见视角",
    summary: "Fami 通从后见视角回顾《雫》《痕》《To Heart》与视觉小说类型形成的文章。",
    relatedRefs: ["to-heart-wikipedia", "leaf-key-interview", "雫-痕-、そして-toheart-。ビジュアルノベルの誕生と繚乱-アニメ-16bitセンセーション-another-layer-連動企画第4回-ゲーム・エンタメ最新情報のファミ通-com"]
  },
  "yu-no-wikipedia.md": {
    title: "《YU-NO》条目",
    librarySection: "作品与人物",
    summary: "《这世上尽头之恋少女 YU-NO》的作品信息、版本沿革与历史影响。",
    relatedRefs: ["インターネットを守る翼竜-名作-yu-no-リメイク版をサターン版と比較し徹底レビュー!-ねとらぼ", "to-heart-wikipedia"]
  },
  "1990年代のエロゲー業界漫画-16bitセンセーション-はいかにして生まれた-作者・若木民喜、原案・みつみ美里-and-甘露樹に直撃-ゲーム・エンタメ最新情報のファミ通-com.md": {
    title: "《16bit Sensation》创作访谈",
    librarySection: "回忆、讨论与后见视角",
    summary: "《16bit Sensation》如何回收九十年代美少女游戏记忆，并转译成后来的行业漫画与访谈叙述。",
    relatedRefs: ["visual-novel-origins-famitsu", "雫-痕-、そして-toheart-。ビジュアルノベルの誕生と繚乱-アニメ-16bitセンセーション-another-layer-連動企画第4回-ゲーム・エンタメ最新情報のファミ通-com"]
  },
  "2026春アニメ-地域別の放送状況やアニメ放送枠一覧-26-4-1-小路あかり-akairomosaic.md": {
    title: "2026 年春季动画地域放送表",
    librarySection: "社会背景",
    summary: "不同地区动画档期差异的当代整理，可用来反向理解九十年代地方观看条件的长期结构。",
    relatedRefs: ["アニメ雑記-ひと昔前の地方の放送状況について語るだけ-25-9-25-小路あかり-akairomosaic", "会社情報-txn系列局-株式会社テレビ東京"]
  },
  "90年代、地方民は東京を目指したーーなぜなら-深夜アニメ-があったから-アーバンライフ東京.md": {
    title: "90 年代地方观众为何向东京流动",
    librarySection: "社会背景",
    summary: "九十年代地方观众为了接触深夜动画而向东京流动的文化体验与地域差异。",
    relatedRefs: ["なぜ地方ではアニメが放送されないのかをテレビ局の人に聞いてみた-toppyのくびったけ日記", "地上波でテレ東系列が映らない地域の子ども-kenta-suzuki"]
  },
  "90年代半ばのアキバでのpcゲーム事情-サブカル回顧録.md": {
    title: "90 年代中期秋叶原 PC 游戏见闻",
    librarySection: "回忆、讨论与后见视角",
    summary: "九十年代中期秋叶原 PC 游戏店铺、购买动线与当时玩家接触作品的现场感。",
    relatedRefs: ["pc98回顧録-90年代初頭、美少女ゲー、秋葉原、レンタル屋-秋葉原へよく行くヲタクのブログ~the-way-of-to-トップオタへの道", "オタクメディア入手すら困難な田舎に住んでいるので、俺は秋葉原に買出しに出かけます-シロクマの屑籠"]
  },
  "[galgame翻译见解]语境与翻译中的平衡问题-哔哩哔哩.md": {
    title: "Galgame 翻译里的语境与平衡",
    librarySection: "回忆、讨论与后见视角",
    summary: "围绕 galgame 翻译时语境、词汇选择与理解门槛的讨论性文章。",
    relatedRefs: ["[观点]“galgame”还是“黄油”-哔哩哔哩", "一个galgame玩家的生活——记在投稿1000天纪念日-哔哩哔哩"]
  },
  "[コラム]-昔やっていたゲームの思い出-1990~2003年くらい-大橋ちよ.md": {
    title: "1990 到 2003 年的游戏回忆",
    librarySection: "回忆、讨论与后见视角",
    summary: "围绕 1990 到 2003 年间游戏经历、接触媒介与个人记忆的回顾性专栏。",
    relatedRefs: ["90年代半ばのアキバでのpcゲーム事情-サブカル回顧録", "一个galgame玩家的生活——记在投稿1000天纪念日-哔哩哔哩"]
  },
  "[观点]“galgame”还是“黄油”-哔哩哔哩.md": {
    title: "“Galgame”还是“黄油”",
    librarySection: "回忆、讨论与后见视角",
    summary: "围绕 galgame 与黄油这两个称呼的语义差别、使用场景与社群感受的讨论。",
    relatedRefs: ["[galgame翻译见解]语境与翻译中的平衡问题-哔哩哔哩", "商业黄油的黄金时代结束,只是暂时萎缩,之后会恢复的推论-一-哔哩哔哩"]
  },
  "leaf、key対談-インタビュー-ときメモ-に挑んだ-toheart-鳥の詩-制作秘話、時代を変えたkeyの泣きゲー.md": {
    title: "Leaf、Key 对谈原始归档",
    librarySection: "作品与人物",
    summary: "Leaf、Key 对谈原文的站内归档页，可与精整理版互相对照使用。",
    relatedRefs: ["leaf-key-interview", "to-heart-wikipedia"]
  },
  "pc98回顧録-90年代初頭、美少女ゲー、秋葉原、レンタル屋-秋葉原へよく行くヲタクのブログ~the-way-of-to-トップオタへの道.md": {
    title: "PC98 与秋叶原租赁店回忆",
    librarySection: "回忆、讨论与后见视角",
    summary: "九十年代初头 PC98、美少女游戏、秋叶原与租赁店消费环境的个人回想。",
    relatedRefs: ["90年代半ばのアキバでのpcゲーム事情-サブカル回顧録", "国民機パソコン、その誕生から引退まで-大塚商会"]
  },
  "ps-ソフト歴代売上ランキング.md": {
    title: "PlayStation 软件销量排行",
    librarySection: "社会背景",
    summary: "PlayStation 平台历代软件销量排行，可用来观察主机市场重心与作品竞争环境。",
    relatedRefs: ["ss-ソフト歴代売上ランキング", "pc-9800-15-million"]
  },
  "ss-ソフト歴代売上ランキング.md": {
    title: "土星软件销量排行",
    librarySection: "社会背景",
    summary: "世嘉土星平台历代软件销量排行，可用来观察主机时代的作品热度与市场份额。",
    relatedRefs: ["ps-ソフト歴代売上ランキング", "インターネットを守る翼竜-名作-yu-no-リメイク版をサターン版と比較し徹底レビュー!-ねとらぼ"]
  },
  "これまでの歩み-ソフマップ-sofmap.md": {
    title: "Sofmap 发展史",
    librarySection: "社会背景",
    summary: "Sofmap 的公司沿革与零售扩张，可用来补足当年游戏销售渠道与实体店网络。",
    relatedRefs: ["e-login-wikipedia", "tech-gian-wikipedia", "国民機パソコン、その誕生から引退まで-大塚商会"]
  },
  "なぜ地方ではアニメが放送されないのかをテレビ局の人に聞いてみた-toppyのくびったけ日記.md": {
    title: "地方为何看不到动画",
    librarySection: "社会背景",
    summary: "从电视台运作角度解释地方动画放送缺口、时段分配与区域覆盖限制。",
    relatedRefs: ["地上波でテレ東系列が映らない地域の子ども-kenta-suzuki", "会社情報-txn系列局-株式会社テレビ東京"]
  },
  "ひで-on-x-ほんの一時期だけ、エロゲーがオタクカルチャーの主流に君臨していた時期があるんですよ。-1990年代末~2000年代前半くらいの、ほんの数年の短い期間だけ。-あの時代は一体何だったのか、エロゲーやノベルゲーについて考える上で今改めて問い直されるべきだとは思う。-and-gt;rp-x.md": {
    title: "X 讨论：黄油曾短暂站上主流",
    librarySection: "回忆、讨论与后见视角",
    summary: "围绕“黄油曾在御宅文化中短暂占据主流”这一说法展开的社交媒体讨论串。",
    relatedRefs: ["エロゲーがオタクカルチャーの主流に君臨していた時期があったという話から-to-heart-の偉大さについて話が盛り上がる-togetter", "to-heart-wikipedia"]
  },
  "アニメ雑記-ひと昔前の地方の放送状況について語るだけ-25-9-25-小路あかり-akairomosaic.md": {
    title: "地方动画放送环境杂记",
    librarySection: "社会背景",
    summary: "围绕过去地方动画播出环境、能否同步追番与档期差距的整理性笔记。",
    relatedRefs: ["2026春アニメ-地域別の放送状況やアニメ放送枠一覧-26-4-1-小路あかり-akairomosaic", "なぜ地方ではアニメが放送されないのかをテレビ局の人に聞いてみた-toppyのくびったけ日記"]
  },
  "インターネットを守る翼竜-名作-yu-no-リメイク版をサターン版と比較し徹底レビュー!-ねとらぼ.md": {
    title: "《YU-NO》重制版与土星版对照",
    librarySection: "作品与人物",
    summary: "把《YU-NO》重制版与土星版并置比较，观察版本差异与作品魅力的评论文章。",
    relatedRefs: ["yu-no-wikipedia", "ss-ソフト歴代売上ランキング"]
  },
  "エロゲーがオタクカルチャーの主流に君臨していた時期があったという話から-to-heart-の偉大さについて話が盛り上がる-2ページ目-togetter.md": {
    title: "Togetter：To Heart 讨论串（第 2 页）",
    librarySection: "回忆、讨论与后见视角",
    summary: "围绕《To Heart》为何能成为一代共同记忆而延伸出的社群讨论后半段。",
    relatedRefs: ["エロゲーがオタクカルチャーの主流に君臨していた時期があったという話から-to-heart-の偉大さについて話が盛り上がる-togetter", "to-heart-wikipedia"]
  },
  "エロゲーがオタクカルチャーの主流に君臨していた時期があったという話から-to-heart-の偉大さについて話が盛り上がる-togetter.md": {
    title: "Togetter：To Heart 伟大性讨论",
    librarySection: "回忆、讨论与后见视角",
    summary: "社群如何从“黄油曾是主流”这个话题一路讨论到《To Heart》的代表性与时代位置。",
    relatedRefs: ["ひで-on-x-ほんの一時期だけ、エロゲーがオタクカルチャーの主流に君臨していた時期があるんですよ。-1990年代末~2000年代前半くらいの、ほんの数年の短い期間だけ。-あの時代は一体何だったのか、エロゲーやノベルゲーについて考える上で今改めて問い直されるべきだとは思う。-and-gt;rp-x", "to-heart-wikipedia"]
  },
  "オタクメディア入手すら困難な田舎に住んでいるので、俺は秋葉原に買出しに出かけます-シロクマの屑籠.md": {
    title: "乡下宅为何去秋叶原买媒体",
    librarySection: "社会背景",
    summary: "地方宅因为无法稳定获得动画与游戏媒体，只能前往秋叶原集中采购的消费环境。",
    relatedRefs: ["90年代、地方民は東京を目指したーーなぜなら-深夜アニメ-があったから-アーバンライフ東京", "90年代半ばのアキバでのpcゲーム事情-サブカル回顧録"]
  },
  "カウボーイビバップ-作品紹介-サンライズ.md": {
    title: "《星际牛仔》作品介绍",
    librarySection: "作品与人物",
    summary: "SUNRISE 官方对《星际牛仔》的作品介绍，可作为九十年代末动画语境的旁证材料。",
    relatedRefs: ["会社情報-txn系列局-株式会社テレビ東京", "90年代、地方民は東京を目指したーーなぜなら-深夜アニメ-があったから-アーバンライフ東京"]
  },
  "ニフティサーブ-wikipedia.md": {
    title: "NIFTY-Serve 条目",
    librarySection: "社会背景",
    summary: "日本早期商业网络社区 NIFTY-Serve 的条目信息与它在玩家交流史中的位置。",
    relatedRefs: ["パソコン通信-wikipedia", "ひで-on-x-ほんの一時期だけ、エロゲーがオタクカルチャーの主流に君臨していた時期があるんですよ。-1990年代末~2000年代前半くらいの、ほんの数年の短い期間だけ。-あの時代は一体何だったのか、エロゲーやノベルゲーについて考える上で今改めて問い直されるべきだとは思う。-and-gt;rp-x"]
  },
  "パソコン通信-wikipedia.md": {
    title: "PC 通信条目",
    librarySection: "社会背景",
    summary: "日本 PC 通信这种早期联网方式的基本轮廓，以及它对玩家圈层交流方式的影响。",
    relatedRefs: ["ニフティサーブ-wikipedia", "会社情報-txn系列局-株式会社テレビ東京"]
  },
  "一个galgame玩家的生活——记在投稿1000天纪念日-哔哩哔哩.md": {
    title: "一个 galgame 玩家的日常",
    librarySection: "回忆、讨论与后见视角",
    summary: "从当代玩家视角回看 galgame 日常、接触方式与持续投入状态的自述文章。",
    relatedRefs: ["[galgame翻译见解]语境与翻译中的平衡问题-哔哩哔哩", "商业黄油的黄金时代结束,只是暂时萎缩,之后会恢复的推论-一-哔哩哔哩"]
  },
  "会社情報-txn系列局-株式会社テレビ東京.md": {
    title: "东京电视台 TXN 系列局",
    librarySection: "社会背景",
    summary: "东京电视台 TXN 系列局的官方网络说明，可用来理解哪些地区能看到相关节目。",
    relatedRefs: ["地上波でテレ東系列が映らない地域の子ども-kenta-suzuki", "なぜ地方ではアニメが放送されないのかをテレビ局の人に聞いてみた-toppyのくびったけ日記"]
  },
  "充実したアニメ視聴環境-ノ-ヴのブログ-ノヴのページ-みんカラ.md": {
    title: "地方动画观看环境回忆",
    librarySection: "社会背景",
    summary: "围绕动画观看设备、收视条件与地方观众如何补足观看环境的个人回忆。",
    relatedRefs: ["私のオーディオ・ビデオ遍歴-第3回-~わしらのビデオはビクターじゃ!~-不定期連載-私のオーディオ・ビデオ遍歴", "オタクメディア入手すら困難な田舎に住んでいるので、俺は秋葉原に買出しに出かけます-シロクマの屑籠"]
  },
  "同級生-ゲーム-wikipedia.md": {
    title: "《同级生》条目",
    librarySection: "作品与人物",
    summary: "《同级生》的基础条目信息、作品定位与它在美少女游戏史上的代表性。",
    relatedRefs: ["同級生2-wikipedia", "to-heart-wikipedia"]
  },
  "同級生2-wikipedia.md": {
    title: "《同级生2》条目",
    librarySection: "作品与人物",
    summary: "《同级生2》的作品概况、人物与续作位置，可用来补充系列影响延续。",
    relatedRefs: ["同級生-ゲーム-wikipedia", "to-heart-wikipedia"]
  },
  "商业黄油的黄金时代结束,只是暂时萎缩,之后会恢复的推论-一-哔哩哔哩.md": {
    title: "商业黄油黄金时代的恢复推论",
    librarySection: "回忆、讨论与后见视角",
    summary: "围绕商业黄油黄金时代是否结束、是否还能恢复的一篇长讨论文章。",
    relatedRefs: ["[观点]“galgame”还是“黄油”-哔哩哔哩", "一个galgame玩家的生活——记在投稿1000天纪念日-哔哩哔哩"]
  },
  "国民機パソコン、その誕生から引退まで-大塚商会.md": {
    title: "PC-9800 从诞生到退场",
    librarySection: "社会背景",
    summary: "PC-9800 系列从诞生、普及到退出舞台的通史性回顾文章。",
    relatedRefs: ["pc-9801-computer-museum", "pc-9800-15-million"]
  },
  "地上波でテレ東系列が映らない地域の子ども-kenta-suzuki.md": {
    title: "收不到东京电视台的地方孩子",
    librarySection: "社会背景",
    summary: "从地方成长经验出发，讨论无法收看东京电视台体系节目对观众经验的影响。",
    relatedRefs: ["会社情報-txn系列局-株式会社テレビ東京", "なぜ地方ではアニメが放送されないのかをテレビ局の人に聞いてみた-toppyのくびったけ日記"]
  },
  "我为什么喜欢《泡沫冬景》-哔哩哔哩.md": {
    title: "我为什么喜欢《泡沫冬景》",
    librarySection: "回忆、讨论与后见视角",
    summary: "从玩家个人感受出发，讨论《泡沫冬景》与近年中文视觉小说体验的文章。",
    relatedRefs: ["一个galgame玩家的生活——记在投稿1000天纪念日-哔哩哔哩", "[galgame翻译见解]语境与翻译中的平衡问题-哔哩哔哩"]
  },
  "私のオーディオ・ビデオ遍歴-第3回-~わしらのビデオはビクターじゃ!~-不定期連載-私のオーディオ・ビデオ遍歴.md": {
    title: "录像机与地方视听回忆",
    librarySection: "社会背景",
    summary: "围绕录像机、视听设备与地方媒介接触方式的时代回忆文章。",
    relatedRefs: ["充実したアニメ視聴環境-ノ-ヴのブログ-ノヴのページ-みんカラ", "総務省-東北総合通信局-地上アナログ放送の終了"]
  },
  "総務省-東北総合通信局-地上アナログ放送の終了.md": {
    title: "东日本模拟电视停播说明",
    librarySection: "社会背景",
    summary: "日本总务省关于地上模拟电视停播的官方说明，可作为电视传播制度材料。",
    relatedRefs: ["会社情報-txn系列局-株式会社テレビ東京", "私のオーディオ・ビデオ遍歴-第3回-~わしらのビデオはビクターじゃ!~-不定期連載-私のオーディオ・ビデオ遍歴"]
  },
  "雫-痕-、そして-toheart-。ビジュアルノベルの誕生と繚乱-アニメ-16bitセンセーション-another-layer-連動企画第4回-ゲーム・エンタメ最新情報のファミ通-com.md": {
    title: "Fami 通：视觉小说的诞生与繁盛",
    librarySection: "回忆、讨论与后见视角",
    summary: "Fami 通对视觉小说起点、繁盛期与《To Heart》时代位置的原文归档。",
    relatedRefs: ["visual-novel-origins-famitsu", "to-heart-wikipedia"]
  }
};

const orderedKeys = [
  "title",
  "kind",
  "visibility",
  "librarySection",
  "date",
  "summary",
  "intro",
  "tags",
  "topics",
  "cover",
  "attachments",
  "aliases",
  "draft",
  "sourceType",
  "sourceTitle",
  "sourceUrl",
  "author",
  "publishedAt",
  "publisher",
  "quote",
  "note",
  "relatedRefs",
  "relatedScripts",
  "readingMode",
  "sourceLanguage",
  "translationLanguage",
  "readingBlocks"
];

const reorderData = (data) => {
  const ordered = {};

  for (const key of orderedKeys) {
    if (data[key] !== undefined) {
      ordered[key] = data[key];
    }
  }

  for (const [key, value] of Object.entries(data)) {
    if (!(key in ordered) && value !== undefined) {
      ordered[key] = value;
    }
  }

  return ordered;
};

const files = await fs.readdir(referencesRoot);
let updatedCount = 0;

for (const file of files) {
  const updates = curatedReferences[file];

  if (!updates) {
    continue;
  }

  const filePath = path.join(referencesRoot, file);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = matter(raw);
  const data = {
    ...parsed.data,
    title: updates.title,
    summary: updates.summary,
    librarySection: updates.librarySection,
    relatedRefs: updates.relatedRefs
  };
  const next = matter.stringify(parsed.content.trimStart(), reorderData(data));
  await fs.writeFile(filePath, `${next.trimEnd()}\n`, "utf8");
  updatedCount += 1;
}

console.log(JSON.stringify({ updatedCount }, null, 2));
