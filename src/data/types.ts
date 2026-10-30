/** 体素（器官 / 肌肉 / 骨骼等），字段与上游 HumanBodyData.json 一致，禁止改名 */
export interface BodyObj {
  id: string;
  name: string;
  engName: string;
  morphology: string;
  posDesc: string;
  function: string;
}

/** 一个解剖系统 */
export interface BodySystem {
  name: string;
  description: string;
  bodyObjDataList: BodyObj[];
}

/** 单性别数据 */
export interface GenderData {
  sexual: number;
  bodySystemDataList: BodySystem[];
}

/** 顶层：男女两套 */
export interface HumanBodyData {
  maleData: GenderData;
  femaleData: GenderData;
}

export type Gender = 'male' | 'female';
