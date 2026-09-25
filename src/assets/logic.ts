// 计算层：纯函数，由素材数据推导阻塞项、页面发布清单与统计

import type {Asset, Blocker, Usage} from './types';
import {licenseById} from './licenses';

/** 素材级阻塞项：来源 / 许可证 / 署名 / 分发方式的缺口 */
export function assetBlockers(a: Asset): Blocker[] {
  const out: Blocker[] = [];
  const lic = licenseById(a.licenseId);
  const noSource = !a.source.trim();
  const known = a.licenseId !== 'unknown'; // 许可证未知时，具体义务无从判断，只保留未知阻塞

  if (noSource) {
    if (lic?.commercial) out.push({code: 'source', message: '缺少来源：商业授权须登记购买凭证或授权渠道'});
    else if (a.delivery === 'external') out.push({code: 'source', message: '缺少来源：外链素材必须登记可访问的出处地址'});
    else out.push({code: 'source', message: '缺少来源：未登记出处链接或供应商'});
  }
  if (!a.licenseId) {
    out.push({code: 'license', message: '缺少许可证：未登记授权类型'});
  } else if (!known) {
    out.push({code: 'license', message: '许可证未知：授权状态未确认，禁止发布'});
  }
  if (lic?.commercial && noSource) {
    out.push({code: 'commercial', message: '商业授权缺少凭证：无法核验授权范围'});
  }
  if (!a.delivery) {
    out.push({code: 'delivery', message: '分发方式未定：需明确外链引用或随包分发'});
  }
  if (known && lic?.attributionRequired && !a.attribution.trim()) {
    out.push({code: 'attribution', message: `缺少署名文字：${lic.label} 要求署名`});
  }
  if (known && a.delivery === 'bundled' && lic?.bundledTextRequired && !a.licenseBundled) {
    out.push({code: 'bundledText', message: `随包分发未附许可证条款：${lic.label} 要求随包附带全文或许可链接`});
  }
  return out;
}

/** 使用位置级阻塞：未确认 */
export function usageBlockers(u: Usage): Blocker[] {
  return u.status === 'pending'
    ? [{code: 'usage', message: '该使用位置尚未确认'}]
    : [];
}

export interface PageItem {
  asset: Asset;
  usage: Usage;
  blockers: Blocker[];
}

export interface PageChecklist {
  page: string;
  items: PageItem[];
  blockers: Blocker[]; // 页面级去重后的阻塞原因
  ready: boolean;
}

/** 按页面聚合发布清单：任一素材有缺口即阻塞该页面 */
export function buildChecklist(assets: Asset[]): PageChecklist[] {
  const map = new Map<string, PageItem[]>();
  for (const a of assets) {
    if (a.archived) continue;
    const ab = assetBlockers(a);
    for (const u of a.usages) {
      const blockers = [...ab, ...usageBlockers(u)];
      const list = map.get(u.page) ?? [];
      list.push({asset: a, usage: u, blockers});
      map.set(u.page, list);
    }
  }
  return [...map.entries()]
    .map(([page, items]) => {
      const seen = new Set<string>();
      const blockers: Blocker[] = [];
      for (const it of items) {
        for (const b of it.blockers) {
          if (!seen.has(b.message)) {seen.add(b.message); blockers.push(b);}
        }
      }
      return {page, items, blockers, ready: blockers.length === 0};
    })
    .sort((x, y) => Number(x.ready) - Number(y.ready) || x.page.localeCompare(y.page, 'zh'));
}

export interface LedgerStats {
  total: number;
  clean: number; // 无阻塞且使用位置全部确认
  blocked: number;
  pendingUsages: number;
  archived: number;
  readyPages: number;
  blockedPages: number;
}

export function ledgerStats(assets: Asset[]): LedgerStats {
  const live = assets.filter(a => !a.archived);
  const blockedSet = new Set<string>();
  let pendingUsages = 0;
  for (const a of live) {
    if (assetBlockers(a).length > 0) blockedSet.add(a.id);
    for (const u of a.usages) if (u.status === 'pending') {pendingUsages++; blockedSet.add(a.id);}
  }
  const pages = buildChecklist(assets);
  return {
    total: live.length,
    clean: live.length - blockedSet.size,
    blocked: blockedSet.size,
    pendingUsages,
    archived: assets.length - live.length,
    readyPages: pages.filter(p => p.ready).length,
    blockedPages: pages.filter(p => !p.ready).length,
  };
}

/** 删除校验：最后一个使用位置移除后才允许删除 */
export function canDelete(a: Asset): {ok: boolean; reason?: string} {
  if (a.archived) return {ok: false, reason: '素材已归档'};
  if (a.usages.length > 0) return {ok: false, reason: `仍有 ${a.usages.length} 个使用位置，需全部移除后才能删除`};
  return {ok: true};
}

export const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const fmtTime = (t: number) => {
  const d = new Date(t);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
