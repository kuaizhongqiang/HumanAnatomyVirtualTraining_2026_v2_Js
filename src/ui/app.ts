import type { Gender } from '../data/types';
import { mountContent } from './screens/content';
import { mountLoading } from './screens/loading';
import { mountStart } from './screens/start';
import { ensureTheme } from './theme';

/** 三个屏幕，对应上游场景：1_Start / LoadingPanel / 2_Content */
export type ScreenName = 'start' | 'loading' | 'content';

export interface AppState {
  screen: ScreenName;
  gender: Gender;
  version: string;
}

/** 屏幕切换：只换 screen 并重绘，业务状态留在 AppState 里 */
export type Go = (screen: ScreenName) => void;

const VERSION = '0.0.0';

export function mountApp(root: HTMLElement): void {
  ensureTheme();

  // ?screen=start|loading|content 供评审与截图直达某一屏（不落盘）
  const wanted = new URLSearchParams(window.location.search).get('screen');
  const initial: ScreenName = wanted === 'loading' || wanted === 'content' ? wanted : 'start';

  const state: AppState = { screen: initial, gender: 'male', version: VERSION };
  const go: Go = (screen) => {
    state.screen = screen;
    paint();
  };

  function paint(): void {
    root.innerHTML = '<div class="app"></div>';
    const app = root.firstElementChild as HTMLElement;
    switch (state.screen) {
      case 'loading':
        mountLoading(app, go);
        break;
      case 'content':
        mountContent(app, state, go);
        break;
      default:
        mountStart(app, state, go);
    }
  }

  paint();
}
