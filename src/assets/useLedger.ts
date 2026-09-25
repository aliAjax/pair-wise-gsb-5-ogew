// 状态层：素材台账的读写操作（每次变更同时落历史快照并持久化）

import {useEffect, useState} from 'react';
import type {Asset, Snapshot, SnapshotAction, Usage} from './types';
import {loadAssets, loadSnapshots, saveAssets, saveSnapshots} from './storage';
import {uid} from './logic';

export function useLedger() {
  const [assets, setAssets] = useState<Asset[]>(loadAssets);
  const [snapshots, setSnapshots] = useState<Snapshot[]>(loadSnapshots);

  useEffect(() => saveAssets(assets), [assets]);
  useEffect(() => saveSnapshots(snapshots), [snapshots]);

  const snap = (asset: Asset, action: SnapshotAction, detail?: string) =>
    setSnapshots(ss => [...ss, {
      id: uid(), assetId: asset.id, assetName: asset.name,
      at: Date.now(), action, detail, data: structuredClone(asset),
    }]);

  const mutate = (id: string, action: SnapshotAction, fn: (a: Asset) => Asset, detail?: string) => {
    const cur = assets.find(a => a.id === id);
    if (!cur) return;
    const next = {...fn(cur), updatedAt: Date.now()};
    setAssets(as => as.map(a => (a.id === id ? next : a)));
    snap(next, action, detail);
  };

  const addAsset = (draft: Omit<Asset, 'id' | 'usages' | 'archived' | 'createdAt' | 'updatedAt'>) => {
    const asset: Asset = {...draft, id: uid(), usages: [], archived: false, createdAt: Date.now(), updatedAt: Date.now()};
    setAssets(as => [...as, asset]);
    snap(asset, 'create');
    return asset.id;
  };

  const updateAsset = (id: string, patch: Partial<Asset>) =>
    mutate(id, 'update', a => ({...a, ...patch, id: a.id, usages: a.usages, archived: a.archived}));

  const addUsage = (id: string, page: string, location: string) =>
    mutate(id, 'add-usage', a => ({
      ...a,
      usages: [...a.usages, {id: uid(), page, location, status: 'pending' as const, createdAt: Date.now()}],
    }), `新增使用位置：${page} / ${location}`);

  const confirmUsage = (id: string, usageId: string) =>
    mutate(id, 'confirm-usage', a => ({
      ...a,
      usages: a.usages.map(u => u.id === usageId ? {...u, status: 'confirmed' as const, confirmedAt: Date.now()} : u),
    }));

  const removeUsage = (id: string, usageId: string) => {
    const target = assets.find(a => a.id === id)?.usages.find(u => u.id === usageId);
    mutate(id, 'remove-usage', a => ({...a, usages: a.usages.filter(u => u.id !== usageId)}),
      target ? `移除使用位置：${target.page} / ${target.location}` : undefined);
  };

  /** 删除 = 归档；调用前需通过 canDelete 校验（使用位置已全部移除） */
  const archiveAsset = (id: string) =>
    mutate(id, 'archive', a => ({...a, archived: true}), '最后一个使用位置已移除，素材归档');

  return {assets, snapshots, addAsset, updateAsset, addUsage, confirmUsage, removeUsage, archiveAsset};
}

export type Ledger = ReturnType<typeof useLedger>;
export type {Usage};
