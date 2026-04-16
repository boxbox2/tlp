const themeKeys = ["love", "career", "wealth", "health", "life", "social", "annual", "turning"];

function allThemes(text) {
  return Object.fromEntries(themeKeys.map((key) => [key, text]));
}

function makeThemes(overrides) {
  return {
    love: overrides.love,
    career: overrides.career,
    wealth: overrides.wealth,
    health: overrides.health,
    life: overrides.life,
    social: overrides.social,
    annual: overrides.annual,
    turning: overrides.turning
  };
}

function suitThemeBuilder(suitLabel, emphasis, caution) {
  return {
    love: `${suitLabel}强调${emphasis}，感情里需要把真实感受说清，同时${caution}。`,
    career: `${suitLabel}对应${emphasis}，工作推进会更看重执行与判断，但${caution}。`,
    wealth: `${suitLabel}把重点放在${emphasis}上，财务选择要兼顾机会与边界，同时${caution}。`,
    health: `${suitLabel}提醒你留意生活节奏中的${emphasis}，先照顾状态，再谈更大的推进，同时${caution}。`,
    life: `${suitLabel}把问题带回${emphasis}这个核心，生活选择里需要先稳住节奏，同时${caution}。`,
    social: `${suitLabel}会放大关系中的${emphasis}，沟通时既要表达，也要${caution}。`,
    annual: `${suitLabel}会把未来一年的重点带到${emphasis}上，你需要留意接下来阶段性的起伏，同时${caution}。`,
    turning: `${suitLabel}把人生转折的重点放在${emphasis}上，这说明你正在靠近一个需要重新定位的阶段，同时${caution}。`
  };
}

const rankDefinitions = {
  ace: {
    label: "首牌",
    upright: ["新机会", "起点", "能量涌现", "愿望成形"],
    reversed: ["迟疑", "准备不足", "机会飘忽", "起步失衡"],
    emphasis: "新的开端与第一步",
    caution: "别只凭一时冲动开始"
  },
  two: {
    label: "二",
    upright: ["权衡", "选择", "平衡", "双向观察"],
    reversed: ["摇摆", "拉扯", "难以决定", "节奏失衡"],
    emphasis: "权衡与配比",
    caution: "别把犹豫拖成停滞"
  },
  three: {
    label: "三",
    upright: ["扩展", "协作", "初步成果", "向外生长"],
    reversed: ["配合受阻", "资源分散", "计划外耗", "扩展过急"],
    emphasis: "协作扩张与向外连接",
    caution: "别在基础未稳时扩得太快"
  },
  four: {
    label: "四",
    upright: ["稳定", "巩固", "停留观察", "结构成形"],
    reversed: ["停滞", "保守过头", "结构松动", "舒适区依赖"],
    emphasis: "稳定与结构",
    caution: "别把稳定变成不动"
  },
  five: {
    label: "五",
    upright: ["摩擦", "挑战", "价值冲突", "局势波动"],
    reversed: ["内耗", "疲惫", "矛盾拖延", "消耗升级"],
    emphasis: "摩擦、损耗与考验",
    caution: "别在混乱里继续硬撑"
  },
  six: {
    label: "六",
    upright: ["回流", "修复", "过渡", "重新协调"],
    reversed: ["回不到原点", "关系不平", "拖着前进", "节奏卡顿"],
    emphasis: "回流、修复与过渡",
    caution: "别用旧方法强行复原"
  },
  seven: {
    label: "七",
    upright: ["评估", "坚持", "试探", "边界意识"],
    reversed: ["防御过强", "信心松动", "误判局势", "边界混乱"],
    emphasis: "评估与试探",
    caution: "别因为不安而过度防御"
  },
  eight: {
    label: "八",
    upright: ["加速", "专注", "推进", "连锁变化"],
    reversed: ["失速", "分心", "推进失衡", "信息紊乱"],
    emphasis: "速度与推进",
    caution: "别让速度快过你的判断"
  },
  nine: {
    label: "九",
    upright: ["临门压力", "坚持到最后", "高度敏感", "成果前夜"],
    reversed: ["警惕过度", "疲态外露", "压力堆积", "防线松动"],
    emphasis: "临门一脚前的压力管理",
    caution: "别把所有重量都压在自己身上"
  },
  ten: {
    label: "十",
    upright: ["阶段完成", "结果显化", "满载", "循环到顶"],
    reversed: ["负担过重", "尾声拖累", "收尾失衡", "循环僵住"],
    emphasis: "阶段结果与收尾",
    caution: "别在该收尾时继续加码"
  },
  page: {
    label: "侍从",
    upright: ["讯息", "学习", "好奇", "轻巧尝试"],
    reversed: ["稚嫩", "信息误读", "准备不足", "表达不稳"],
    emphasis: "新消息与学习姿态",
    caution: "别把灵感误当成熟方案"
  },
  knight: {
    label: "骑士",
    upright: ["行动", "推进", "执行力", "带着目标前进"],
    reversed: ["冒进", "冲过头", "方向偏差", "节奏失控"],
    emphasis: "推进与执行",
    caution: "别让速度盖过准确度"
  },
  queen: {
    label: "王后",
    upright: ["稳定掌握", "成熟判断", "内在力量", "温柔控场"],
    reversed: ["敏感失衡", "过度卷入", "情绪牵引", "控制松动"],
    emphasis: "成熟掌握与内在稳定",
    caution: "别在照顾外部时忽略自己"
  },
  king: {
    label: "国王",
    upright: ["长期掌控", "成熟决断", "稳定输出", "格局感"],
    reversed: ["固执", "控制过强", "决断失准", "权威失衡"],
    emphasis: "长期布局与成熟决断",
    caution: "别把掌控欲当成安全感"
  }
};

const suitDefinitions = {
  wands: {
    label: "权杖",
    themes: (rank) => suitThemeBuilder("权杖", `${rank.emphasis}与行动火力`, rank.caution)
  },
  cups: {
    label: "圣杯",
    themes: (rank) => suitThemeBuilder("圣杯", `${rank.emphasis}与情感流动`, rank.caution)
  },
  swords: {
    label: "宝剑",
    themes: (rank) => suitThemeBuilder("宝剑", `${rank.emphasis}与判断、沟通`, rank.caution)
  },
  pentacles: {
    label: "星币",
    themes: (rank) => suitThemeBuilder("星币", `${rank.emphasis}与现实承载`, rank.caution)
  }
};

function createMinorArcana() {
  return Object.entries(suitDefinitions).flatMap(([suit, suitConfig]) =>
    Object.entries(rankDefinitions).map(([rank, rankConfig]) => ({
      id: `${rank}-of-${suit}`,
      name: `${suitConfig.label}${rankConfig.label}`,
      arcana: "小阿尔卡那",
      suit,
      imageSlug: `${rank}-of-${suit}`,
      upright: rankConfig.upright,
      reversed: rankConfig.reversed,
      themes: suitConfig.themes(rankConfig)
    }))
  );
}

export const majorArcana = [
  {
    id: "fool",
    name: "愚者",
    arcana: "大阿尔卡那",
    suit: null,
    imageSlug: "the-fool",
    upright: ["新的开始", "勇气", "探索", "轻盈冒险"],
    reversed: ["犹豫", "冲动", "准备不足", "方向松散"],
    themes: allThemes("新的起点已经出现，重要的不是一头冲进去，而是带着清醒迈出第一步。")
  },
  {
    id: "magician",
    name: "魔术师",
    arcana: "大阿尔卡那",
    suit: null,
    imageSlug: "the-magician",
    upright: ["主动性", "表达力", "资源整合", "创造"],
    reversed: ["分心", "操之过急", "表面化", "资源错配"],
    themes: allThemes("你手上并不缺工具，关键在于把资源和表达重新对齐，让行动真正落地。")
  },
  {
    id: "high-priestess",
    name: "女祭司",
    arcana: "大阿尔卡那",
    suit: null,
    imageSlug: "the-high-priestess",
    upright: ["直觉", "观察", "沉静", "内在理解"],
    reversed: ["压抑", "过度猜测", "封闭", "信息不透明"],
    themes: allThemes("先慢一点。眼下更重要的是看清隐含的信息和你自己的真实感受，而不是急着定论。")
  },
  {
    id: "empress",
    name: "女皇",
    arcana: "大阿尔卡那",
    suit: null,
    imageSlug: "the-empress",
    upright: ["滋养", "丰盛", "稳定成长", "被接住"],
    reversed: ["过度付出", "停滞", "讨好", "边界模糊"],
    themes: allThemes("这张牌提醒你把注意力放回滋养与稳定成长，先照顾好根系，再谈结果。")
  },
  {
    id: "emperor",
    name: "皇帝",
    arcana: "大阿尔卡那",
    suit: null,
    imageSlug: "the-emperor",
    upright: ["结构", "边界", "稳定", "掌控"],
    reversed: ["僵硬", "压迫", "控制欲", "拒绝变化"],
    themes: allThemes("局面需要更清晰的规则、边界和节奏。先搭结构，方向才会更稳。")
  },
  {
    id: "hierophant",
    name: "教皇",
    arcana: "大阿尔卡那",
    suit: null,
    imageSlug: "the-hierophant",
    upright: ["传统", "经验", "价值观", "有序学习"],
    reversed: ["教条", "形式化", "盲从", "价值失配"],
    themes: allThemes("你需要参考经验和成熟方法，但不是照单全收，而是辨认什么才真正适合你。")
  },
  {
    id: "lovers",
    name: "恋人",
    arcana: "大阿尔卡那",
    suit: null,
    imageSlug: "the-lovers",
    upright: ["契合", "选择", "吸引", "真诚连接"],
    reversed: ["拉扯", "价值分歧", "犹疑", "不一致"],
    themes: allThemes("眼前的核心不是表面的喜不喜欢，而是你的选择是否真的契合内心价值。")
  },
  {
    id: "chariot",
    name: "战车",
    arcana: "大阿尔卡那",
    suit: null,
    imageSlug: "the-chariot",
    upright: ["推进", "决心", "聚焦", "突破"],
    reversed: ["失控", "内耗", "强推", "方向摇摆"],
    themes: allThemes("是可以发力的一张牌，但前提是把散开的注意力重新收束到同一个方向。")
  },
  {
    id: "strength",
    name: "力量",
    arcana: "大阿尔卡那",
    suit: null,
    imageSlug: "strength",
    upright: ["耐心", "柔韧", "内在稳定", "自我信任"],
    reversed: ["疲惫", "勉强支撑", "自我怀疑", "情绪失衡"],
    themes: allThemes("真正有力的不是硬撑，而是稳定、耐心和对自己节奏的信任。")
  },
  {
    id: "hermit",
    name: "隐者",
    arcana: "大阿尔卡那",
    suit: null,
    imageSlug: "the-hermit",
    upright: ["独处思考", "沉淀", "寻找真实", "自省"],
    reversed: ["封闭", "逃避", "过度撤退", "距离感"],
    themes: allThemes("有些答案不会在喧闹里出现。先退半步整理自己，反而更容易看清。")
  },
  {
    id: "wheel",
    name: "命运之轮",
    arcana: "大阿尔卡那",
    suit: null,
    imageSlug: "wheel-of-fortune",
    upright: ["转机", "周期变化", "机会", "流动"],
    reversed: ["反复", "失衡", "错失时机", "节奏打乱"],
    themes: allThemes("一个周期正在转换。别用已经过期的标准，去要求新的局面照旧运行。")
  },
  {
    id: "justice",
    name: "正义",
    arcana: "大阿尔卡那",
    suit: null,
    imageSlug: "justice",
    upright: ["清晰判断", "平衡", "责任", "结果对应"],
    reversed: ["失衡", "偏见", "回避责任", "判断失准"],
    themes: allThemes("这张牌要求你回到事实、责任和边界本身，清晰往往比安慰更有用。")
  },
  {
    id: "hanged-man",
    name: "倒吊人",
    arcana: "大阿尔卡那",
    suit: null,
    imageSlug: "the-hanged-man",
    upright: ["暂停", "换角度", "等待", "松手"],
    reversed: ["停滞拖延", "无效牺牲", "不甘心", "卡住"],
    themes: allThemes("暂时停下来不是退步，而是在为新的视角腾位置。")
  },
  {
    id: "death",
    name: "死神",
    arcana: "大阿尔卡那",
    suit: null,
    imageSlug: "death",
    upright: ["结束", "更新", "代谢", "旧模式退场"],
    reversed: ["放不下", "停留旧局", "害怕变化", "拖延转变"],
    themes: allThemes("旧的模式已经走到尾声，越拖越累，真正的轻松来自愿意更新。")
  },
  {
    id: "temperance",
    name: "节制",
    arcana: "大阿尔卡那",
    suit: null,
    imageSlug: "temperance",
    upright: ["调和", "恢复", "稳定过渡", "柔性平衡"],
    reversed: ["失衡", "极端", "节奏混乱", "过量消耗"],
    themes: allThemes("当下不需要猛冲，而需要把节奏调回适合长期推进的状态。")
  },
  {
    id: "devil",
    name: "恶魔",
    arcana: "大阿尔卡那",
    suit: null,
    imageSlug: "the-devil",
    upright: ["执念", "诱惑", "依赖", "被困住的感觉"],
    reversed: ["松绑", "意识到问题", "抽离", "重新掌控"],
    themes: allThemes("真正需要看见的，是让你反复被困住的习惯、执念或诱因。")
  },
  {
    id: "tower",
    name: "高塔",
    arcana: "大阿尔卡那",
    suit: null,
    imageSlug: "the-tower",
    upright: ["突变", "真相显露", "重建", "旧结构崩解"],
    reversed: ["隐性危机", "延迟爆发", "抗拒改变", "动荡感"],
    themes: allThemes("某些不稳的部分正在暴露。虽然过程不舒服，但它也在逼你重建更真实的结构。")
  },
  {
    id: "star",
    name: "星星",
    arcana: "大阿尔卡那",
    suit: null,
    imageSlug: "the-star",
    upright: ["希望", "疗愈", "愿景", "重新相信"],
    reversed: ["失望", "心灰", "信心不足", "恢复缓慢"],
    themes: allThemes("这是希望重新亮起来的一张牌。它不会一下子解决一切，但会给你更稳的方向感。")
  },
  {
    id: "moon",
    name: "月亮",
    arcana: "大阿尔卡那",
    suit: null,
    imageSlug: "the-moon",
    upright: ["敏感", "迷雾", "情绪波动", "潜意识"],
    reversed: ["逐渐看清", "情绪回落", "误解松动", "真实浮现"],
    themes: allThemes("你现在感受到的模糊和不安是真实的，但它不等于事实本身，需要慢慢澄清。")
  },
  {
    id: "sun",
    name: "太阳",
    arcana: "大阿尔卡那",
    suit: null,
    imageSlug: "the-sun",
    upright: ["清晰", "生命力", "好消息", "坦诚"],
    reversed: ["延迟兑现", "短暂低落", "表现受阻", "热度不足"],
    themes: allThemes("局势会逐渐变亮，关键是保持坦诚和持续行动，而不是因为短暂卡顿就否定整体趋势。")
  },
  {
    id: "judgement",
    name: "审判",
    arcana: "大阿尔卡那",
    suit: null,
    imageSlug: "judgement",
    upright: ["觉醒", "回应召唤", "复盘", "重新决定"],
    reversed: ["迟疑", "旧事缠绕", "不愿面对", "卡在过去"],
    themes: allThemes("现在更像一次诚实的复盘时刻。把过去看明白，下一步才会真正轻下来。")
  },
  {
    id: "world",
    name: "世界",
    arcana: "大阿尔卡那",
    suit: null,
    imageSlug: "the-world",
    upright: ["完成", "整合", "成熟阶段", "圆满"],
    reversed: ["未完成感", "临门一脚", "循环未闭合", "松散"],
    themes: allThemes("你已经比想象中更接近阶段性的完整答案，差的是最后那一下整合与落定。")
  }
];

export const minorArcana = createMinorArcana();

export const tarotDeck = [...majorArcana, ...minorArcana];
