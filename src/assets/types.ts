// 资料层：素材合规台账的数据结构（不包含任何逻辑）

export type AssetKind = 'font' | 'image' | 'icon';
export type Delivery = 'external' | 'bundled'; // 外链引用 / 随包分发
export type UsageStatus = 'pending' | 'confirmed';

/** 一个素材在某个页面上的使用位置——同一素材多处使用时逐条登记、各自确认 */
export interface Usage {
  id: string;
  page: string; // 页面，如「首页」
  location: string; // 页面内位置，如「首屏主视觉」
  status: UsageStatus;
  createdAt: number;
  confirmedAt?: number;
}

/** 素材（字体 / 图片 / 图标） */
export interface Asset {
  id: string;
  name: string;
  kind: AssetKind;
  source: string; // 来源：出处链接或供应商
  licenseId: string; // 许可证 id（见 licenses.ts），空串表示未选择
  attribution: string; // 署名文字（要求署名的许可证必填）
  delivery: Delivery | ''; // 分发方式：外链 / 随包，空串表示未选择
  licenseBundled: boolean; // 随包分发时，是否已核对包内附带许可证全文
  usages: Usage[];
  archived: boolean; // 删除后进入归档，保留记录供快照查回
  createdAt: number;
  updatedAt: number;
}

export type SnapshotAction =
  | 'create'
  | 'update'
  | 'add-usage'
  | 'confirm-usage'
  | 'remove-usage'
  | 'archive';

/** 历史快照：每次变更留存当时的完整素材原文，只读 */
export interface Snapshot {
  id: string;
  assetId: string;
  assetName: string;
  at: number;
  action: SnapshotAction;
  detail?: string;
  data: Asset;
}

/** 阻塞项：来源 / 许可证 / 署名 / 分发方式等缺口 */
export interface Blocker {
  code: 'source' | 'license' | 'commercial' | 'delivery' | 'attribution' | 'bundledText' | 'usage';
  message: string;
}
