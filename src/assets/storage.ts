// 保存层：localStorage 持久化

import type {Asset, Snapshot} from './types';
import {seedAssets, seedSnapshots} from './seed';

const KEY_ASSETS = 'license-lens-assets';
const KEY_SNAPSHOTS = 'license-lens-asset-snapshots';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

export const loadAssets = (): Asset[] => load(KEY_ASSETS, seedAssets);
export const loadSnapshots = (): Snapshot[] => load(KEY_SNAPSHOTS, seedSnapshots);

export function saveAssets(assets: Asset[]) {
  try {localStorage.setItem(KEY_ASSETS, JSON.stringify(assets));} catch { /* 存储不可用时静默降级 */ }
}

export function saveSnapshots(snaps: Snapshot[]) {
  try {localStorage.setItem(KEY_SNAPSHOTS, JSON.stringify(snaps));} catch { /* 同上 */ }
}
