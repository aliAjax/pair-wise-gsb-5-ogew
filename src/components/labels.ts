// 页面层共享的展示常量

import type {AssetKind, Delivery, SnapshotAction} from '../assets/types';

export const KIND_LABEL: Record<AssetKind, string> = {font: '字体', image: '图片', icon: '图标'};

export const DELIVERY_LABEL: Record<Delivery, string> = {external: '外链引用', bundled: '随包分发'};

export const ACTION_LABEL: Record<SnapshotAction, string> = {
  create: '登记',
  update: '更新资料',
  'add-usage': '新增位置',
  'confirm-usage': '确认位置',
  'remove-usage': '移除位置',
  archive: '归档删除',
};

export const LICENSE_COLOR: Record<string, string> = {
  MIT: '#35b995',
  'OFL-1.1': '#35b995',
  'Apache-2.0': '#b18ee4',
  'CC-BY-4.0': '#6d9ee8',
  'CC0-1.0': '#8ea3a6',
  'CC-BY-NC-4.0': '#da9a57',
  commercial: '#b18ee4',
  unknown: '#dc7464',
};
