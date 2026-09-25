// 保存：素材台账与历史快照的本地持久化（localStorage）
import type { Asset, AssetSnapshot } from './types';
import { seedAssets } from './data';

const ASSETS_KEY = 'license-lens-assets-v1';
const SNAPSHOTS_KEY = 'license-lens-asset-snapshots-v1';

export function loadAssets(): Asset[] {
  try {
    const raw = localStorage.getItem(ASSETS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Asset[];
    }
  } catch {
    // 数据损坏时回退到种子数据
  }
  return seedAssets;
}

export function saveAssets(assets: Asset[]): void {
  localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
}

export function loadSnapshots(): AssetSnapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as AssetSnapshot[];
    }
  } catch {
    // 忽略损坏的快照数据
  }
  return [];
}

export function saveSnapshots(snapshots: AssetSnapshot[]): void {
  localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snapshots));
}
