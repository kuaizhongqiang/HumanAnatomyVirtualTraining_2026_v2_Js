export type Locale = 'zh' | 'en';

const DICT: Record<Locale, Record<string, string>> = {
  zh: {
    'app.title': '人体解剖学知识仿真实训软件',
    'app.subtitle': 'Human Anatomy Knowledge Simulation Training Software',
    'top.gender': '性别',
    'top.male': '男',
    'top.female': '女',
    'top.lang': '语言',
    'top.theme': '主题',
    'top.theme.toDark': '切换到深色',
    'top.theme.toLight': '切换到浅色',
    'side.title': '解剖系统',
    'side.count': '{n} 项',
    'side.opacity': '透明度',
    'side.split': '拆分 / 合并',
    'side.reset': '重置视图',
    'side.hint': '点击系统展开体素',
    'stage.badge': '3D 视口 · three.js 待接入',
    'stage.hint': '此区域将由 three.js 渲染人体模型，当前为 UI 占位',
    'stage.rotate': '旋转',
    'stage.reset': '复位',
    'stage.focus': '聚焦',
    'stage.fullscreen': '全屏',
    'detail.title': '体素详情',
    'detail.empty': '左侧选择一个体素查看详情',
    'detail.morphology': '形态',
    'detail.position': '位置',
    'detail.function': '功能',
    'detail.ask': '就这个部位问 AI',
    'chat.title': 'AI 助手',
    'chat.greet': '你好，可以问我某个器官的位置、形态或功能。',
    'chat.reply': '（AI 尚未接入）这里将来返回模型回答，上下文会带上当前选中的体素。',
    'chat.placeholder': '输入问题…',
    'chat.send': '发送',
    'watermark.trial': '试用版',
  },
  en: {
    'app.title': 'Human Anatomy Knowledge Simulation Training',
    'app.subtitle': '人体解剖学知识仿真实训软件',
    'top.gender': 'Sex',
    'top.male': 'Male',
    'top.female': 'Female',
    'top.lang': 'Language',
    'top.theme': 'Theme',
    'top.theme.toDark': 'Switch to dark',
    'top.theme.toLight': 'Switch to light',
    'side.title': 'Systems',
    'side.count': '{n} items',
    'side.opacity': 'Opacity',
    'side.split': 'Explode / Merge',
    'side.reset': 'Reset view',
    'side.hint': 'Click a system to expand its parts',
    'stage.badge': '3D viewport · three.js pending',
    'stage.hint': 'three.js will render the body here; this area is a UI placeholder',
    'stage.rotate': 'Orbit',
    'stage.reset': 'Reset',
    'stage.focus': 'Focus',
    'stage.fullscreen': 'Fullscreen',
    'detail.title': 'Part detail',
    'detail.empty': 'Select a part on the left',
    'detail.morphology': 'Morphology',
    'detail.position': 'Position',
    'detail.function': 'Function',
    'detail.ask': 'Ask AI about this part',
    'chat.title': 'AI assistant',
    'chat.greet': 'Hi. Ask me about the position, morphology or function of a part.',
    'chat.reply': '(AI not wired yet) The model answer will appear here, with the selected part as context.',
    'chat.placeholder': 'Type a question…',
    'chat.send': 'Send',
    'watermark.trial': 'Trial',
  },
};

let current: Locale = 'zh';

export function getLocale(): Locale {
  return current;
}

export function setLocale(locale: Locale): void {
  current = locale;
}

/** 取文案；缺失时回退到键名，便于发现漏词 */
export function t(key: string, vars?: Record<string, string | number>): string {
  const raw = DICT[current][key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

/** 系统名 → 当前语言的短标签（JSON 里只有英文键，中文名在 data 层的映射表） */
export function systemNameInEnglish(name: string): string {
  return name.replace(/System$/, '');
}
