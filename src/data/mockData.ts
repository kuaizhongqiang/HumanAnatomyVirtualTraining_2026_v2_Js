import sample from './sample/human-sample.json';
import type { BodyObj, BodySystem, Gender, HumanBodyData } from './types';

const data = sample as unknown as HumanBodyData;

/** 系统中文名与配色：只用于展示，业务口径以 JSON 的 name 为准 */
const SYSTEM_META: Record<string, { zh: string; color: string }> = {
  MuscularSystem: { zh: '肌（运动）系统', color: '#d9736b' },
  SkeletalSystem: { zh: '骨骼系统', color: '#c9b189' },
  CirculatorySystem: { zh: '循环系统', color: '#d4566a' },
  RespiratorySystem: { zh: '呼吸系统', color: '#6aa9d8' },
  DigestiveSystem: { zh: '消化系统', color: '#d7a45b' },
  LymphaticSystem: { zh: '淋巴系统', color: '#8fbf8a' },
  NervousSystem: { zh: '神经系统', color: '#b08ad6' },
  ReproductiveSystem: { zh: '生殖系统', color: '#dd8fb4' },
  UrinarySystem: { zh: '泌尿系统', color: '#79b6b0' },
};

export function systems(gender: Gender): BodySystem[] {
  return gender === 'male' ? data.maleData.bodySystemDataList : data.femaleData.bodySystemDataList;
}

export function findSystem(gender: Gender, name: string): BodySystem | undefined {
  return systems(gender).find((s) => s.name === name);
}

export function findBodyObj(gender: Gender, id: string): BodyObj | undefined {
  for (const system of systems(gender)) {
    const hit = system.bodyObjDataList.find((o) => o.id === id);
    if (hit) return hit;
  }
  return undefined;
}

export function systemLabel(name: string): string {
  return SYSTEM_META[name]?.zh ?? name;
}

export function systemColor(name: string): string {
  return SYSTEM_META[name]?.color ?? '#8b9bb0';
}

export function objectCount(gender: Gender): number {
  return systems(gender).reduce((sum, s) => sum + s.bodyObjDataList.length, 0);
}
