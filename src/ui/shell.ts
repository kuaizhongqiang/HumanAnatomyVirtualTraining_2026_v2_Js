import './shell.css';
import { findBodyObj, objectCount, systemColor, systemLabel, systems } from '../data/mockData';
import type { Gender } from '../data/types';
import type { Locale } from './i18n';
import { getLocale, setLocale, systemNameInEnglish, t } from './i18n';
import { currentTheme, ensureTheme, toggleTheme } from './theme';

interface Msg {
  role: 'user' | 'bot';
  text: string;
}

interface State {
  gender: Gender;
  selectedSystem: string;
  selectedObjId: string | null;
  split: boolean;
  opacity: number;
  chatOpen: boolean;
  messages: Msg[];
}

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** 数据里的中文直出到 innerHTML，必须转义 */
function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c);
}

function systemLabelIn(locale: Locale, name: string): string {
  return locale === 'zh' ? systemLabel(name) : systemNameInEnglish(name);
}

export function mountShell(root: HTMLElement): void {
  ensureTheme();

  const initial = systems('male')[0];
  const state: State = {
    gender: 'male',
    selectedSystem: initial.name,
    selectedObjId: initial.bodyObjDataList[0]?.id ?? null,
    split: false,
    opacity: 100,
    chatOpen: true,
    messages: [{ role: 'bot', text: t('chat.greet') }],
  };

  const seg = (name: string, value: string, label: string, active: boolean): string =>
    `<button class="seg-btn${active ? ' is-active' : ''}" data-action="${name}" data-value="${value}">${esc(label)}</button>`;

  function renderTopbar(): string {
    const locale = getLocale();
    const theme = currentTheme();
    return `
      <header class="panel topbar">
        <div class="brand">
          <span class="brand-mark">解</span>
          <div class="brand-text">
            <h1>${esc(t('app.title'))}</h1>
            <p>${esc(t('app.subtitle'))}</p>
          </div>
        </div>
        <div class="topbar-right">
          <div class="seg" title="${esc(t('top.gender'))}">
            ${seg('gender', 'male', t('top.male'), state.gender === 'male')}
            ${seg('gender', 'female', t('top.female'), state.gender === 'female')}
          </div>
          <div class="seg" title="${esc(t('top.lang'))}">
            ${seg('lang', 'zh', '中', locale === 'zh')}
            ${seg('lang', 'en', 'EN', locale === 'en')}
          </div>
          <button class="icon-btn" data-action="theme" title="${esc(t(theme === 'dark' ? 'top.theme.toLight' : 'top.theme.toDark'))}">
            ${theme === 'dark' ? '☀' : '☾'}
          </button>
          <span class="watermark">${esc(t('watermark.trial'))}</span>
        </div>
      </header>`;
  }

  function renderSidebar(): string {
    const locale = getLocale();
    const list = systems(state.gender);
    const items = list
      .map((system) => {
        const active = system.name === state.selectedSystem;
        const objs = system.bodyObjDataList
          .map((obj) => {
            const picked = obj.id === state.selectedObjId;
            return `<button class="obj-item${picked ? ' is-picked' : ''}" data-action="obj" data-value="${esc(obj.id)}">
              <span class="obj-name">${esc(locale === 'zh' ? obj.name : obj.engName)}</span>
              <span class="obj-id">${esc(obj.id)}</span>
            </button>`;
          })
          .join('');
        return `
          <li class="system${active ? ' is-active' : ''}">
            <button class="system-head" data-action="system" data-value="${esc(system.name)}">
              <span class="dot" style="background:${systemColor(system.name)}"></span>
              <span class="system-name">${esc(systemLabelIn(locale, system.name))}</span>
              <span class="system-count">${esc(t('side.count', { n: system.bodyObjDataList.length }))}</span>
            </button>
            ${active ? `<div class="obj-list">${objs}</div>` : ''}
          </li>`;
      })
      .join('');

    return `
      <aside class="panel sidebar">
        <div class="panel-head">
          <h2>${esc(t('side.title'))}</h2>
          <span class="hint">${esc(t('side.hint'))}</span>
        </div>
        <ul class="systems">${items}</ul>
        <div class="sidebar-foot">
          <label class="range-row">
            <span>${esc(t('side.opacity'))}</span>
            <input type="range" min="0" max="100" value="${state.opacity}" data-action="opacity" />
            <b>${state.opacity}%</b>
          </label>
          <button class="ghost-btn${state.split ? ' is-active' : ''}" data-action="split">${esc(t('side.split'))}</button>
        </div>
      </aside>`;
  }

  function renderScene(): string {
    return `
      <div class="stage-tools">
        <button class="tool" data-action="stage" data-value="rotate">${esc(t('stage.rotate'))}</button>
        <button class="tool" data-action="stage" data-value="reset">${esc(t('stage.reset'))}</button>
        <button class="tool" data-action="stage" data-value="focus">${esc(t('stage.focus'))}</button>
        <button class="tool" data-action="stage" data-value="fullscreen">${esc(t('stage.fullscreen'))}</button>
      </div>
      <svg class="figure${state.split ? ' is-split' : ''}" viewBox="0 0 200 400" aria-hidden="true" style="--opacity:${state.opacity / 100}">
        <circle cx="100" cy="50" r="26" />
        <rect x="72" y="82" width="56" height="122" rx="18" />
        <rect x="50" y="94" width="18" height="120" rx="9" />
        <rect x="132" y="94" width="18" height="120" rx="9" />
        <rect x="74" y="208" width="20" height="152" rx="10" />
        <rect x="106" y="208" width="20" height="152" rx="10" />
      </svg>
      <div class="stage-badge">${esc(t('stage.badge'))}</div>
      <p class="stage-hint">${esc(t('stage.hint'))}</p>`;
  }

  function renderDetail(): string {
    const locale = getLocale();
    const obj = state.selectedObjId ? findBodyObj(state.gender, state.selectedObjId) : undefined;
    if (!obj) {
      return `
        <aside class="panel detail">
          <div class="panel-head"><h2>${esc(t('detail.title'))}</h2></div>
          <p class="empty">${esc(t('detail.empty'))}</p>
        </aside>`;
    }
    const title = locale === 'zh' ? obj.name : obj.engName;
    const sub = locale === 'zh' ? obj.engName : obj.name;
    return `
      <aside class="panel detail">
        <div class="panel-head">
          <h2>${esc(t('detail.title'))}</h2>
          <span class="tag">${esc(obj.id)}</span>
        </div>
        <h3 class="detail-name">${esc(title)}<small>${esc(sub)}</small></h3>
        <dl class="detail-fields">
          <div><dt>${esc(t('detail.morphology'))}</dt><dd>${esc(obj.morphology)}</dd></div>
          <div><dt>${esc(t('detail.position'))}</dt><dd>${esc(obj.posDesc)}</dd></div>
          <div><dt>${esc(t('detail.function'))}</dt><dd>${esc(obj.function)}</dd></div>
        </dl>
        <button class="primary-btn" data-action="ask">${esc(t('detail.ask'))}</button>
      </aside>`;
  }

  function renderChat(): string {
    const messages = state.messages
      .map((msg) => `<div class="msg msg-${msg.role}">${esc(msg.text)}</div>`)
      .join('');
    if (!state.chatOpen) {
      return `<button class="chat-fab" data-action="chat-toggle" title="${esc(t('chat.title'))}">AI</button>`;
    }
    return `
      <section class="panel chat">
        <div class="chat-head">
          <strong>${esc(t('chat.title'))}</strong>
          <button class="icon-btn" data-action="chat-toggle" title="close">–</button>
        </div>
        <div class="chat-body">${messages}</div>
        <form class="chat-input" data-action="chat-form">
          <input type="text" data-action="chat-text" placeholder="${esc(t('chat.placeholder'))}" />
          <button class="primary-btn" type="submit">${esc(t('chat.send'))}</button>
        </form>
      </section>`;
  }

  function render(): void {
    // 选中系统的配色作为全局光的染色，让毛玻璃面板出现"被场景照亮"的错觉
    const tint = systemColor(state.selectedSystem);
    root.innerHTML = `
      <div class="app" style="--tint:${tint}">
        <div class="scene">${renderScene()}</div>
        ${renderTopbar()}
        ${renderSidebar()}
        ${renderDetail()}
        ${renderChat()}
        <div class="toast" data-role="toast" hidden></div>
      </div>`;
  }

  function toast(text: string): void {
    const node = root.querySelector<HTMLElement>('[data-role="toast"]');
    if (!node) return;
    node.textContent = text;
    node.hidden = false;
    window.setTimeout(() => {
      node.hidden = true;
    }, 1600);
  }

  function sendChat(): void {
    const input = root.querySelector<HTMLInputElement>('[data-action="chat-text"]');
    const text = input?.value.trim() ?? '';
    if (!text) return;
    state.messages.push({ role: 'user', text });
    state.messages.push({ role: 'bot', text: t('chat.reply') });
    state.chatOpen = true;
    render();
  }

  root.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!target) return;
    const { action, value } = target.dataset;
    if (!action) return;

    switch (action) {
      case 'gender': {
        const gender = value === 'female' ? 'female' : 'male';
        state.gender = gender;
        const first = systems(gender)[0];
        state.selectedSystem = first.name;
        state.selectedObjId = first.bodyObjDataList[0]?.id ?? null;
        render();
        break;
      }
      case 'lang':
        setLocale(value === 'en' ? 'en' : 'zh');
        if (state.messages[0]?.role === 'bot') state.messages[0] = { role: 'bot', text: t('chat.greet') };
        render();
        break;
      case 'theme':
        toggleTheme();
        render();
        break;
      case 'system':
        if (value) {
          state.selectedSystem = value;
          const system = systems(state.gender).find((s) => s.name === value);
          state.selectedObjId = system?.bodyObjDataList[0]?.id ?? null;
          render();
        }
        break;
      case 'obj':
        if (value) {
          state.selectedObjId = value;
          render();
        }
        break;
      case 'split':
        state.split = !state.split;
        render();
        toast(state.split ? 'Explode' : 'Merge');
        break;
      case 'ask': {
        const obj = state.selectedObjId ? findBodyObj(state.gender, state.selectedObjId) : undefined;
        state.chatOpen = true;
        if (obj) state.messages.push({ role: 'user', text: `${obj.name}：${t('detail.function')}?` });
        render();
        break;
      }
      case 'chat-toggle':
        state.chatOpen = !state.chatOpen;
        render();
        break;
      case 'stage':
        toast(`${t(`stage.${value ?? 'rotate'}`)} · mockup`);
        break;
      default:
        break;
    }
  });

  // 镜面高光跟随指针：只改 CSS 变量，不触发重排
  root.addEventListener('mousemove', (event) => {
    const panel = (event.target as HTMLElement).closest<HTMLElement>('.panel');
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    panel.style.setProperty('--light-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    panel.style.setProperty('--light-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  });

  root.addEventListener('input', (event) => {
    const target = event.target as HTMLElement;
    if (target.dataset.action !== 'opacity') return;
    state.opacity = Number((target as HTMLInputElement).value);
    // 拖动过程只改样式，不整树重绘（重绘会打断拖拽）
    target.closest('.range-row')?.querySelector('b')?.replaceChildren(`${state.opacity}%`);
    root.querySelector<HTMLElement>('.figure')?.style.setProperty('--opacity', String(state.opacity / 100));
  });

  root.addEventListener('submit', (event) => {
    event.preventDefault();
    sendChat();
  });

  render();
  console.info(`[mockup] 就绪：${objectCount(state.gender)} 个采样体素`);
}
