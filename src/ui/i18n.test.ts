import { describe, expect, it } from 'vitest';
import { getLocale, setLocale, systemNameInEnglish, t } from './i18n';

describe('i18n', () => {
  it('中英切换生效，且能切回', () => {
    setLocale('en');
    expect(getLocale()).toBe('en');
    expect(t('top.male')).toBe('Male');

    setLocale('zh');
    expect(t('top.male')).toBe('男');
  });

  it('支持 {n} 插值，缺参时保留占位', () => {
    setLocale('zh');
    expect(t('side.count', { n: 9 })).toBe('9 项');
    expect(t('side.count')).toBe('{n} 项');
  });

  it('未定义的键回退为键名（便于发现漏词）', () => {
    expect(t('not.exists')).toBe('not.exists');
  });

  it('英文系统名去掉 System 后缀', () => {
    expect(systemNameInEnglish('MuscularSystem')).toBe('Muscular');
    expect(systemNameInEnglish('UrinarySystem')).toBe('Urinary');
  });
});
