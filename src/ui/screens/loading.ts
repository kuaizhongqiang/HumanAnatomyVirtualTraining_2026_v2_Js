import type { Go } from '../app';
import { t } from '../i18n';

const BG = 'media/ui/loading/LoadingBg.png';
const TIP_KEYS = ['loading.tip.select', 'loading.tip.view', 'loading.tip.tab'] as const;

/** 两段进度（对齐上游）：加载 0→0.5，收尾过渡 0.5→1 */
const LOAD_MS = 1200;
const TAIL_MS = 1000;

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (v: string): string => v.replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c);

/**
 * 加载页（照搬上游 LoadingPanel）：背景图 + 底部进度条 + 居中的一条随机提示。
 * 上游没有阶段清单、也没有取消按钮，进度靠 StartPanel 的协程写 Slider.value。
 */
export function mountLoading(host: HTMLElement, go: Go): void {
  const tipKey = TIP_KEYS[Math.floor(Math.random() * TIP_KEYS.length)];

  host.innerHTML = `
    <section class="screen screen--loading">
      <div class="loading">
        <img class="loading__bg" src="${BG}" alt="" aria-hidden="true" />

        <div class="loading__tip">
          <p class="loading__tip-text">${esc(t(tipKey))}</p>
        </div>

        <div class="loading__slider" data-role="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <div class="loading__slider-fill" data-role="fill"></div>
        </div>
      </div>
    </section>`;

  const bar = host.querySelector<HTMLElement>('[data-role="bar"]');
  const fill = host.querySelector<HTMLElement>('[data-role="fill"]');
  const started = Date.now();
  let timer = 0;

  function paint(value: number): void {
    if (fill) fill.style.width = `${value}%`;
    if (bar) bar.setAttribute('aria-valuenow', String(Math.round(value)));
  }

  // 用 setInterval 而不是 rAF：切到后台标签页时 rAF 会被暂停，进度会卡住
  timer = window.setInterval(() => {
    const elapsed = Date.now() - started;
    let progress: number;
    if (elapsed <= LOAD_MS) {
      progress = (elapsed / LOAD_MS) * 50; // 0 → 50
    } else if (elapsed <= LOAD_MS + TAIL_MS) {
      progress = 50 + ((elapsed - LOAD_MS) / TAIL_MS) * 50; // 50 → 100
    } else {
      paint(100);
      window.clearInterval(timer);
      window.setTimeout(() => go('content'), 120);
      return;
    }
    paint(progress);
  }, 40);

  // 离开该屏时兜底停表（宿主被替换后 isConnected 为 false）
  const guard = window.setInterval(() => {
    if (!host.isConnected) {
      window.clearInterval(timer);
      window.clearInterval(guard);
    }
  }, 400);
}
