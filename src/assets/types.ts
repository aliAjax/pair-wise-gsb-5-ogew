// 素材台账的类型定义：素材、使用位置、历史快照
export type AssetKind = 'font' | 'image' | 'icon';

// 分发方式：外链引用 与 随包分发 的义务不同；null 表示尚未指定（属于缺口）
export type DistributionMode = 'link' | 'bundle';

export interface AssetUsage {
  id: string;
  page: string; // 使用位置（页面 / 发布单元）
  distribution: DistributionMode | null;
  confirmed: boolean; // 同一素材被多个页面引用时，每个位置各自确认
}

export interface Asset {
  id: string;
  name: string;
  kind: AssetKind;
  source: string; // 来源（获取地址 / 作者），空串 = 缺口
  license: string; // 许可证，'未核实' = 缺口
  attribution: string; // 署名文字，空串在要求署名的许可证下 = 缺口
  usages: AssetUsage[];
  createdAt: number;
}

// 删除素材时留存的历史快照，之后仍能查回署名原文
export interface AssetSnapshot {
  id: string;
  takenAt: number;
  asset: Asset;
}

export const uid = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
