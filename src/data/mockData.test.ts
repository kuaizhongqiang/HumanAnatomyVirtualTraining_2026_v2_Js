import { describe, expect, it } from 'vitest';
import { findBodyObj, objectCount, systems } from './mockData';

describe('采样数据', () => {
  it('男女各有九大系统', () => {
    expect(systems('male')).toHaveLength(9);
    expect(systems('female')).toHaveLength(9);
  });

  it('体素字段齐全且 id 唯一', () => {
    const ids = new Set<string>();
    for (const system of systems('male')) {
      expect(system.bodyObjDataList.length).toBeGreaterThan(0);
      for (const obj of system.bodyObjDataList) {
        for (const key of ['id', 'name', 'engName', 'morphology', 'posDesc', 'function'] as const) {
          expect(obj[key], `${obj.id}.${key}`).toBeTruthy();
        }
        expect(ids.has(obj.id), `重复 id: ${obj.id}`).toBe(false);
        ids.add(obj.id);
      }
    }
  });

  it('按 id 能查到体素，且数量与遍历一致', () => {
    const first = systems('male')[0].bodyObjDataList[0];
    expect(findBodyObj('male', first.id)?.name).toBe(first.name);
    expect(findBodyObj('male', 'Not_Exists')).toBeUndefined();
    expect(objectCount('male')).toBeGreaterThan(0);
  });
});
