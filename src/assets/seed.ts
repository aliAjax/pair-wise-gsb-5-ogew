// 资料层：初始素材与历史快照（演示数据）

import type {Asset, Snapshot} from './types';

const T1 = Date.UTC(2026, 8, 18, 2, 12); // 2026-09-18
const T2 = Date.UTC(2026, 8, 19, 6, 40);
const T3 = Date.UTC(2026, 8, 21, 3, 5);
const T4 = Date.UTC(2026, 8, 22, 8, 30);
const T5 = Date.UTC(2026, 8, 23, 1, 15);
const T6 = Date.UTC(2026, 8, 24, 2, 50);

export const seedAssets: Asset[] = [
  {
    id: 'a-font-dm', name: 'DM Sans', kind: 'font',
    source: 'https://fonts.google.com/specimen/DM+Sans',
    licenseId: 'OFL-1.1',
    attribution: 'Copyright 2014-2020 The DM Sans Project Authors, SIL Open Font License 1.1',
    delivery: 'external', licenseBundled: false,
    usages: [
      {id: 'u-dm-1', page: '首页', location: '全局正文字体', status: 'confirmed', createdAt: T1, confirmedAt: T1},
      {id: 'u-dm-2', page: '产品页', location: '标题与数字排版', status: 'confirmed', createdAt: T2, confirmedAt: T2},
    ],
    archived: false, createdAt: T1, updatedAt: T2,
  },
  {
    id: 'a-font-noto', name: 'Noto Sans SC', kind: 'font',
    source: 'https://fonts.google.com/noto/specimen/Noto+Sans+SC',
    licenseId: 'OFL-1.1',
    attribution: 'Copyright 2014-2021 Adobe / Google, Noto Sans SC, SIL Open Font License 1.1',
    delivery: 'external', licenseBundled: false,
    usages: [
      {id: 'u-noto-1', page: '首页', location: '中文回退字体', status: 'confirmed', createdAt: T3, confirmedAt: T3},
    ],
    archived: false, createdAt: T3, updatedAt: T3,
  },
  {
    id: 'a-img-hero', name: 'aurora-hero.png', kind: 'image',
    source: 'https://unsplash.com/photos/aurora-over-mountain-ridge',
    licenseId: 'CC-BY-4.0',
    attribution: '', // 缺口：CC BY 要求署名
    delivery: 'bundled', licenseBundled: false, // 缺口：随包未附许可证
    usages: [
      {id: 'u-hero-1', page: '首页', location: '首屏主视觉横幅', status: 'pending', createdAt: T4},
      {id: 'u-hero-2', page: '关于页', location: '团队介绍横幅', status: 'confirmed', createdAt: T4, confirmedAt: T5},
    ],
    archived: false, createdAt: T4, updatedAt: T4,
  },
  {
    id: 'a-icon-phosphor', name: 'Phosphor Icons', kind: 'icon',
    source: 'https://github.com/phosphor-icons/web',
    licenseId: 'MIT',
    attribution: '', // 缺口：MIT 要求保留版权声明
    delivery: '', // 缺口：分发方式未定
    licenseBundled: false,
    usages: [
      {id: 'u-ph-1', page: '首页', location: '功能区六枚特性图标', status: 'pending', createdAt: T5},
      {id: 'u-ph-2', page: '定价页', location: '方案对比表状态图标', status: 'pending', createdAt: T5},
    ],
    archived: false, createdAt: T5, updatedAt: T5,
  },
  {
    id: 'a-img-legacy', name: 'legacy-illustration.svg', kind: 'image',
    source: '旧设计稿交接，未记录出处', // 登记了但来源不可核验
    licenseId: 'unknown', // 缺口：许可证未知
    attribution: '',
    delivery: 'bundled', licenseBundled: false,
    usages: [
      {id: 'u-leg-1', page: '营销活动页', location: '活动头图插画', status: 'pending', createdAt: T6},
    ],
    archived: false, createdAt: T6, updatedAt: T6,
  },
  {
    id: 'a-font-brand', name: 'BrandDisplay.woff2', kind: 'font',
    source: '', // 缺口：商业授权未登记凭证来源
    licenseId: 'commercial',
    attribution: '',
    delivery: 'external', licenseBundled: false,
    usages: [
      {id: 'u-brand-1', page: '品牌页', location: '品牌主标题', status: 'confirmed', createdAt: T6, confirmedAt: T6},
    ],
    archived: false, createdAt: T6, updatedAt: T6,
  },
  {
    id: 'a-icon-logo', name: 'logo-mark.svg', kind: 'icon',
    source: 'https://www.figma.com/community/logo-mark-kit',
    licenseId: 'CC0-1.0',
    attribution: '',
    delivery: 'bundled', licenseBundled: true,
    usages: [
      {id: 'u-logo-1', page: '首页', location: '导航栏品牌 Logo', status: 'confirmed', createdAt: T3, confirmedAt: T3},
    ],
    archived: false, createdAt: T3, updatedAt: T3,
  },
  {
    id: 'a-img-oldbanner', name: 'old-banner.jpg', kind: 'image',
    source: 'https://unsplash.com/photos/retired-banner',
    licenseId: 'CC0-1.0',
    attribution: '',
    delivery: 'bundled', licenseBundled: true,
    usages: [], // 最后一个使用位置移除后已归档
    archived: true, createdAt: T1, updatedAt: T6,
  },
];

export const seedSnapshots: Snapshot[] = [
  {
    id: 's-1', assetId: 'a-font-dm', assetName: 'DM Sans', at: T1, action: 'create',
    data: structuredClone(seedAssets[0]),
  },
  {
    id: 's-2', assetId: 'a-font-dm', assetName: 'DM Sans', at: T2, action: 'update',
    detail: '补全 OFL 署名文字，登记产品页使用位置',
    data: {
      ...structuredClone(seedAssets[0]),
      attribution: 'Google Fonts',
      usages: [
        {id: 'u-dm-1', page: '首页', location: '全局正文字体', status: 'confirmed', createdAt: T1, confirmedAt: T1},
      ],
      updatedAt: T2,
    },
  },
  {
    id: 's-3', assetId: 'a-img-hero', assetName: 'aurora-hero.png', at: T4, action: 'create',
    data: structuredClone(seedAssets[2]),
  },
  {
    id: 's-4', assetId: 'a-img-oldbanner', assetName: 'old-banner.jpg', at: T6, action: 'archive',
    detail: '下线春季活动横幅，最后一个使用位置已移除',
    data: structuredClone(seedAssets[7]),
  },
];
