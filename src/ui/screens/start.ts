import type { AppState, Go } from '../app';
import { getLocale, setLocale, t } from '../i18n';
import { currentTheme, toggleTheme } from '../theme';

/** 素材路径用相对地址：dev 与 vite（base './'）构建后都能取到；
    媒体根 public/media/ 不入库，本地用 .workflow/scripts/pull-assets.mjs 从上游取 */
const BG = 'media/ui/start/StartBg.png';
const VIDEO = 'media/video/StartVideo.mp4';

/** 与上游对齐：默认 15s 片长，播到 videoDuration - 1.5s 开始收尾 */
const FALLBACK_DURATION_MS = 15000;
const LEAD_MS = 1500;

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (v: string): string => v.replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c);

/**
 * 开始页（照搬上游 1_Start / StartPanel）：
 * 全屏开场视频 → 任意点击跳过 → 遮罩淡入盖住视频 → 0.5s 后出现「进入软件」→ 进加载页。
 * 上游在这屏没给语言/主题入口，我们的多语言与明暗是新增能力，收成右上角小控件。
 */
export function mountStart(host: HTMLElement, state: AppState, go: Go): void {
  const locale = getLocale();
  const theme = currentTheme();
  let revealed = false;
  const timers: number[] = [];

  host.innerHTML = `
    <section class="screen screen--start">
      <div class="start">
      <img class="start__bg" src="${BG}" alt="" aria-hidden="true" />
      <video class="start__video" src="${VIDEO}" autoplay muted playsinline preload="auto" aria-hidden="true"></video>
      <div class="start__cover" data-role="cover"></div>

      <p class="start__tips" data-role="tips">${esc(t('start.tips'))}</p>

      <button class="btn btn--primary start__enter" data-act="enter" hidden>${esc(t('start.enter'))}</button>

      <div class="start__corner">
        <div class="seg">
          <button class="seg__item${locale === 'zh' ? ' seg__item--active' : ''}" data-act="lang" data-value="zh">中</button>
          <button class="seg__item${locale === 'en' ? ' seg__item--active' : ''}" data-act="lang" data-value="en">EN</button>
        </div>
        <button class="btn btn--icon" data-act="theme" title="${esc(t('start.theme'))}">${theme === 'dark' ? '☀' : '☾'}</button>
        <span class="watermark">${esc(t('watermark.trial'))} · v${state.version}</span>
      </div>
      </div>
    </section>`;

  const video = host.querySelector<HTMLVideoElement>('.start__video');
  const cover = host.querySelector<HTMLElement>('[data-role="cover"]');
  const tips = host.querySelector<HTMLElement>('[data-role="tips"]');
  const enter = host.querySelector<HTMLButtonElement>('.start__enter');

  function reveal(): void {
    if (revealed) return;
    revealed = true;
    video?.pause();
    cover?.classList.add('is-on');
    tips?.classList.add('is-hidden');
    // 上游：遮罩淡入 1s，等 0.5s 再显示按钮
    timers.push(window.setTimeout(() => { if (enter) enter.hidden = false; }, 500));
  }

  // 视频播到 videoDuration - 1.5s 收尾
  video?.addEventListener('timeupdate', () => {
    if (!video.duration || !Number.isFinite(video.duration)) return;
    if (video.currentTime >= Math.max(video.duration - LEAD_MS / 1000, 0)) reveal();
  });
  video?.addEventListener('ended', reveal);
  video?.addEventListener('error', reveal);
  void video?.play?.().catch(() => { /* 自动播放被拒：交给兜底计时 */ });

  // 兜底：视频读不到时长或加载失败时，13.5s 后照样放出按钮
  timers.push(window.setTimeout(reveal, FALLBACK_DURATION_MS - LEAD_MS));

  host.addEventListener('click', (event) => {
    const el = (event.target as HTMLElement).closest<HTMLElement>('[data-act]');
    if (!el) {
      reveal(); // 任意位置点击 = 跳过视频（对齐上游整屏 Button）
      return;
    }
    switch (el.dataset.act) {
      case 'enter':
        timers.forEach((id) => window.clearTimeout(id));
        go('loading');
        break;
      case 'lang':
        setLocale(el.dataset.value === 'en' ? 'en' : 'zh');
        if (tips) tips.textContent = t('start.tips');
        if (enter) enter.textContent = t('start.enter');
        break;
      case 'theme': {
        const next = toggleTheme();
        const icon = host.querySelector<HTMLElement>('[data-act="theme"]');
        if (icon) icon.textContent = next === 'dark' ? '☀' : '☾';
        break;
      }
      default:
        break;
    }
  });
}
