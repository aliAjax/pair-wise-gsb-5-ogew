// 合规计算：许可证义务、缺口检测、素材状态、发布清单，全部为纯函数
import type { Asset, AssetKind, AssetUsage, DistributionMode } from './types';

export const KIND_LABEL: Record<AssetKind, string> = {
  font: '字体',
  image: '图片',
  icon: '图标',
};

export const DIST_LABEL: Record<DistributionMode, string> = {
  link: '外链引用',
  bundle: '随包分发',
};

export interface LicenseRule {
  attributionRequired: boolean;
  summary: string;
  // 外链 与 随包分发 的义务不同，分别说明
  obligations: Record<DistributionMode, string>;
}

export const LICENSE_RULES: Record<string, LicenseRule> = {
  'OFL-1.1': {
    attributionRequired: false,
    summary: '字体可商用与嵌入，保留许可声明即可',
    obligations: {
      link: '外链加载时保留字体许可声明，注明字体名称与许可',
      bundle: '随包分发需附带 OFL 许可证原文，且不得单独售卖字体文件',
    },
  },
  'CC-BY-4.0': {
    attributionRequired: true,
    summary: '允许商用与修改，但必须署名',
    obligations: {
      link: '在引用页面展示署名文字与许可证链接',
      bundle: '在包内 NOTICE 或关于页附带署名文字与许可证链接',
    },
  },
  'CC-BY-SA-4.0': {
    attributionRequired: true,
    summary: '须署名，且衍生作品以相同许可共享',
    obligations: {
      link: '在引用页面展示署名，并标明衍生作品沿用 CC-BY-SA',
      bundle: '包内附带署名，修改后的素材须以 CC-BY-SA 再发布',
    },
  },
  'CC0-1.0': {
    attributionRequired: false,
    summary: '公有领域贡献，无附加义务',
    obligations: { link: '无附加义务', bundle: '无附加义务' },
  },
  'Apache-2.0': {
    attributionRequired: true,
    summary: '保留版权与许可声明',
    obligations: {
      link: '在页面或文档中保留版权与许可声明',
      bundle: '包内附带 LICENSE 与 NOTICE 文本',
    },
  },
  MIT: {
    attributionRequired: true,
    summary: '保留版权与许可声明',
    obligations: {
      link: '在页面或文档中保留版权与许可声明',
      bundle: '包内附带 MIT 许可证原文',
    },
  },
  ISC: {
    attributionRequired: true,
    summary: '保留版权与许可声明',
    obligations: {
      link: '在页面或文档中保留版权与许可声明',
      bundle: '包内附带 ISC 许可证原文',
    },
  },
  Unsplash: {
    attributionRequired: false,
    summary: '可免费商用，署名非强制',
    obligations: {
      link: '无附加义务（建议署名摄影师）',
      bundle: '不得将图片原样打包转售',
    },
  },
};

export const LICENSE_OPTIONS = [...Object.keys(LICENSE_RULES), '未核实'];

export const licenseRule = (license: string): LicenseRule | null =>
  LICENSE_RULES[license] ?? null;

// 缺口类型：来源 / 许可证 / 署名 / 分发方式
export type GapCode = 'source' | 'license' | 'attribution' | 'distribution';

export const GAP_LABEL: Record<GapCode, string> = {
  source: '缺少来源',
  license: '许可证未核实',
  attribution: '缺少署名',
  distribution: '分发方式未定',
};

// 某个使用位置上的缺口（确认状态单独看，不算缺口）
export function usageGaps(asset: Asset, usage: AssetUsage): GapCode[] {
  const gaps: GapCode[] = [];
  if (!asset.source.trim()) gaps.push('source');
  const rule = licenseRule(asset.license);
  if (!rule) gaps.push('license');
  else if (rule.attributionRequired && !asset.attribution.trim())
    gaps.push('attribution');
  if (!usage.distribution) gaps.push('distribution');
  return gaps;
}

export type AssetStatus = 'ok' | 'pending' | 'gap' | 'idle';

export const STATUS_LABEL: Record<AssetStatus, string> = {
  ok: '合规',
  pending: '待确认',
  gap: '有缺口',
  idle: '未使用',
};

export function assetStatus(asset: Asset): AssetStatus {
  if (asset.usages.length === 0) return 'idle';
  if (asset.usages.some((u) => usageGaps(asset, u).length > 0)) return 'gap';
  if (asset.usages.some((u) => !u.confirmed)) return 'pending';
  return 'ok';
}

export interface ReleaseReason {
  assetId: string;
  label: string;
}

export interface ReleaseItem {
  page: string;
  refs: number;
  blocked: boolean;
  reasons: ReleaseReason[];
}

// 按使用位置（页面）汇总发布清单：任一缺口或未确认都会阻塞对应发布项
export function buildReleaseChecklist(assets: Asset[]): ReleaseItem[] {
  const map = new Map<string, ReleaseItem>();
  for (const asset of assets) {
    for (const usage of asset.usages) {
      let item = map.get(usage.page);
      if (!item) {
        item = { page: usage.page, refs: 0, blocked: false, reasons: [] };
        map.set(usage.page, item);
      }
      item.refs += 1;
      for (const gap of usageGaps(asset, usage))
        item.reasons.push({ assetId: asset.id, label: `${asset.name} · ${GAP_LABEL[gap]}` });
      if (!usage.confirmed)
        item.reasons.push({ assetId: asset.id, label: `${asset.name} · 待确认` });
    }
  }
  return [...map.values()]
    .map((item) => ({ ...item, blocked: item.reasons.length > 0 }))
    .sort(
      (a, b) => Number(b.blocked) - Number(a.blocked) || a.page.localeCompare(b.page),
    );
}
