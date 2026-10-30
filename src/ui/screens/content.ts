import type { AppState, Go } from '../app';
import { findBodyObj, objectCount, systemColor, systemLabel, systems } from '../../data/mockData';
import { getLocale, setLocale, systemNameInEnglish, t } from '../i18n';
import { currentTheme, toggleTheme } from '../theme';

interface Msg {
  role: 'user' | 'bot';
  text: string;
}

interface LocalState {
  selectedSystem: string;
  selectedObjId: string | null;
  split: boolean;
  opacity: number;
  chatOpen: boolean;
  messages: Msg[];
}

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (v: string): string => v.replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c);

const systemLabelIn = (locale: string, name: string): string =>
  locale === 'zh' ? systemLabel(name) : systemNameInEnglish(name);

/** 内容页：全幅场景 + 四块悬浮玻璃面板（顶栏 / 系统树 / 详情 / AI 对话） */
export function mountContent(host: HTMLElement, state: AppState, go: Go): void {
  const first = systems(state.gender)[0];
  const local: LocalState = {
    selectedSystem: first.name,
    selectedObjId: first.bodyObjDataList[0]?.id ?? null,
    split: false,
    opacity: 100,
    chatOpen: true,
    messages: [{ role: 'bot', text: t('chat.greet') }],
  };

  const seg = (act: string, value: string, label: string, active: boolean): string =>
    `<button class="seg__item${active ? ' seg__item--active' : ''}" data-act="${act}" data-value="${value}">${esc(label)}</button>`;

  function topbar(): string {
    const locale = getLocale();
    const theme = currentTheme();
    return `
      <header class="panel panel--topbar">
        <div class="topbar__brand">
          <span class="topbar__mark">解</span>
          <div class="topbar__text">
            <h1 class="topbar__title">${esc(t('app.title'))}</h1>
            <p class="topbar__subtitle">${esc(t('app.subtitle'))}</p>
          </div>
        </div>
        <div class="topbar__right">
          <div class="seg" title="${esc(t('top.gender'))}">
            ${seg('gender', 'male', t('top.male'), state.gender === 'male')}
            ${seg('gender', 'female', t('top.female'), state.gender === 'female')}
          </div>
          <div class="seg" title="${esc(t('top.lang'))}">
            ${seg('lang', 'zh', '中', locale === 'zh')}
            ${seg('lang', 'en', 'EN', locale === 'en')}
          </div>
          <button class="btn btn--icon" data-act="theme" title="${esc(t(theme === 'dark' ? 'top.theme.toLight' : 'top.theme.toDark'))}">
            ${theme === 'dark' ? '☀' : '☾'}
          </button>
          <button class="btn btn--icon" data-act="back" title="${esc(t('content.back'))}">↩</button>
          <span class="watermark">${esc(t('watermark.trial'))}</span>
        </div>
      </header>`;
  }

  function stage(): string {
    return `
      <div class="stage">
        <svg class="figure${local.split ? ' figure--split' : ''}" viewBox="0 0 200 400" aria-hidden="true" style="--opacity:${local.opacity / 100}">
          <circle cx="100" cy="50" r="26" />
          <rect x="72" y="82" width="56" height="122" rx="18" />
          <rect x="50" y="94" width="18" height="120" rx="9" />
          <rect x="132" y="94" width="18" height="120" rx="9" />
          <rect x="74" y="208" width="20" height="152" rx="10" />
          <rect x="106" y="208" width="20" height="152" rx="10" />
        </svg>
        <div class="stage__tools">
          <button class="stage__tool" data-act="stage" data-value="rotate">${esc(t('stage.rotate'))}</button>
          <button class="stage__tool" data-act="stage" data-value="reset">${esc(t('stage.reset'))}</button>
          <button class="stage__tool" data-act="stage" data-value="focus">${esc(t('stage.focus'))}</button>
          <button class="stage__tool" data-act="stage" data-value="fullscreen">${esc(t('stage.fullscreen'))}</button>
        </div>
        <div class="stage__badge">${esc(t('stage.badge'))}</div>
        <p class="stage__hint">${esc(t('stage.hint'))}</p>
      </div>`;
  }

  function sidebar(): string {
    const locale = getLocale();
    const items = systems(state.gender)
      .map((system) => {
        const active = system.name === local.selectedSystem;
        const leaves = system.bodyObjDataList
          .map((obj) => {
            const picked = obj.id === local.selectedObjId;
            return `<button class="tree__leaf${picked ? ' tree__leaf--active' : ''}" data-act="obj" data-value="${esc(obj.id)}">
              <span class="tree__leaf-name">${esc(locale === 'zh' ? obj.name : obj.engName)}</span>
              <span class="tree__leaf-id">${esc(obj.id)}</span>
            </button>`;
          })
          .join('');
        return `
          <li class="tree__section${active ? ' tree__section--active' : ''}">
            <button class="tree__head" data-act="system" data-value="${esc(system.name)}" style="color:${active ? '' : 'inherit'}">
              <span class="tree__dot" style="background:${systemColor(system.name)};color:${systemColor(system.name)}"></span>
              <span class="tree__name">${esc(systemLabelIn(locale, system.name))}</span>
              <span class="tree__count">${esc(t('side.count', { n: system.bodyObjDataList.length }))}</span>
            </button>
            ${active ? `<div class="tree__list">${leaves}</div>` : ''}
          </li>`;
      })
      .join('');

    return `
      <aside class="panel panel--sidebar">
        <div class="panel__head">
          <h2 class="panel__title">${esc(t('side.title'))}</h2>
          <span class="panel__hint">${esc(t('side.hint'))}</span>
        </div>
        <ul class="tree">${items}</ul>
        <div class="panel__foot">
          <label class="range">
            <span>${esc(t('side.opacity'))}</span>
            <input class="range__input" type="range" min="0" max="100" value="${local.opacity}" data-act="opacity" />
            <b class="range__value">${local.opacity}%</b>
          </label>
          <button class="btn btn--ghost btn--block${local.split ? ' btn--active' : ''}" data-act="split">${esc(t('side.split'))}</button>
        </div>
      </aside>`;
  }

  function detail(): string {
    const locale = getLocale();
    const obj = local.selectedObjId ? findBodyObj(state.gender, local.selectedObjId) : undefined;
    if (!obj) {
      return `
        <aside class="panel panel--detail">
          <div class="panel__head"><h2 class="panel__title">${esc(t('detail.title'))}</h2></div>
          <p class="detail__empty">${esc(t('detail.empty'))}</p>
        </aside>`;
    }
    const title = locale === 'zh' ? obj.name : obj.engName;
    const sub = locale === 'zh' ? obj.engName : obj.name;
    return `
      <aside class="panel panel--detail">
        <div class="panel__head">
          <h2 class="panel__title">${esc(t('detail.title'))}</h2>
          <span class="tag">${esc(obj.id)}</span>
        </div>
        <h3 class="detail__name">${esc(title)}<small class="detail__name-sub">${esc(sub)}</small></h3>
        <dl class="detail__list">
          <div class="detail__row"><dt class="detail__term">${esc(t('detail.morphology'))}</dt><dd class="detail__desc">${esc(obj.morphology)}</dd></div>
          <div class="detail__row"><dt class="detail__term">${esc(t('detail.position'))}</dt><dd class="detail__desc">${esc(obj.posDesc)}</dd></div>
          <div class="detail__row"><dt class="detail__term">${esc(t('detail.function'))}</dt><dd class="detail__desc">${esc(obj.function)}</dd></div>
        </dl>
        <button class="btn btn--primary btn--block" data-act="ask">${esc(t('detail.ask'))}</button>
      </aside>`;
  }

  function chat(): string {
    if (!local.chatOpen) {
      return `<button class="chat__fab" data-act="chat-toggle" title="${esc(t('chat.title'))}">AI</button>`;
    }
    const messages = local.messages
      .map((msg) => `<div class="chat__msg chat__msg--${msg.role}">${esc(msg.text)}</div>`)
      .join('');
    return `
      <section class="panel panel--chat">
        <div class="chat__head">
          <span>${esc(t('chat.title'))}</span>
          <button class="btn btn--icon" data-act="chat-toggle" title="${esc(t('chat.close'))}">–</button>
        </div>
        <div class="chat__messages">${messages}</div>
        <form class="chat__form" data-act="chat-form">
          <input class="chat__input" type="text" data-act="chat-text" placeholder="${esc(t('chat.placeholder'))}" />
          <button class="btn btn--primary" type="submit">${esc(t('chat.send'))}</button>
        </form>
      </section>`;
  }

  function render(): void {
    const tint = systemColor(local.selectedSystem);
    host.innerHTML = `
      <section class="screen screen--content" style="--tint:${tint}">
        <div class="scene"></div>
        ${stage()}
        ${topbar()}
        ${sidebar()}
        ${detail()}
        ${chat()}
        <div class="toast" data-role="toast"></div>
      </section>`;
  }

  function toast(text: string): void {
    const node = host.querySelector<HTMLElement>('[data-role="toast"]');
    if (!node) return;
    node.textContent = text;
    node.classList.add('toast--visible');
    window.setTimeout(() => node.classList.remove('toast--visible'), 1600);
  }

  function sendChat(): void {
    const input = host.querySelector<HTMLInputElement>('[data-act="chat-text"]');
    const text = input?.value.trim() ?? '';
    if (!text) return;
    local.messages.push({ role: 'user', text });
    local.messages.push({ role: 'bot', text: t('chat.reply') });
    local.chatOpen = true;
    render();
  }

  host.addEventListener('click', (event) => {
    const el = (event.target as HTMLElement).closest<HTMLElement>('[data-act]');
    if (!el) return;
    const { act, value } = el.dataset;

    switch (act) {
      case 'gender': {
        state.gender = value === 'female' ? 'female' : 'male';
        const nextFirst = systems(state.gender)[0];
        local.selectedSystem = nextFirst.name;
        local.selectedObjId = nextFirst.bodyObjDataList[0]?.id ?? null;
        render();
        break;
      }
      case 'lang':
        setLocale(value === 'en' ? 'en' : 'zh');
        if (local.messages[0]?.role === 'bot') local.messages[0] = { role: 'bot', text: t('chat.greet') };
        render();
        break;
      case 'theme':
        toggleTheme();
        render();
        break;
      case 'back':
        go('start');
        break;
      case 'system':
        if (value) {
          local.selectedSystem = value;
          const system = systems(state.gender).find((s) => s.name === value);
          local.selectedObjId = system?.bodyObjDataList[0]?.id ?? null;
          render();
        }
        break;
      case 'obj':
        if (value) {
          local.selectedObjId = value;
          render();
        }
        break;
      case 'split':
        local.split = !local.split;
        render();
        break;
      case 'ask': {
        const obj = local.selectedObjId ? findBodyObj(state.gender, local.selectedObjId) : undefined;
        local.chatOpen = true;
        if (obj) local.messages.push({ role: 'user', text: `${obj.name}：${t('detail.function')}?` });
        render();
        break;
      }
      case 'chat-toggle':
        local.chatOpen = !local.chatOpen;
        render();
        break;
      case 'stage':
        toast(`${t(`stage.${value ?? 'rotate'}`)} · mockup`);
        break;
      default:
        break;
    }
  });

  // 镜面高光跟随指针：只写 CSS 变量
  host.addEventListener('mousemove', (event) => {
    const panel = (event.target as HTMLElement).closest<HTMLElement>('.panel');
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    panel.style.setProperty('--light-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    panel.style.setProperty('--light-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  });

  host.addEventListener('input', (event) => {
    const target = event.target as HTMLElement;
    if (target.dataset.act !== 'opacity') return;
    local.opacity = Number((target as HTMLInputElement).value);
    target.closest('.range')?.querySelector('b')?.replaceChildren(`${local.opacity}%`);
    host.querySelector<HTMLElement>('.figure')?.style.setProperty('--opacity', String(local.opacity / 100));
  });

  host.addEventListener('submit', (event) => {
    event.preventDefault();
    sendChat();
  });

  render();
  console.info(`[content] 就绪：${objectCount(state.gender)} 个采样体素`);
}
