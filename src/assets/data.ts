// 素材台账的初始资料（种子数据），首次打开或本地数据缺失时使用
import type { Asset } from './types';

export const seedAssets: Asset[] = [
  {
    id: 'a-inter',
    name: 'Inter',
    kind: 'font',
    source: 'https://fonts.google.com/specimen/Inter',
    license: 'OFL-1.1',
    attribution: '',
    createdAt: 1727000000000,
    usages: [
      { id: 'u-inter-home', page: '官网首页', distribution: 'link', confirmed: true },
      { id: 'u-inter-console', page: '控制台', distribution: 'bundle', confirmed: true },
    ],
  },
  {
    id: 'a-hero',
    name: 'hero-aurora.jpg',
    kind: 'image',
    source: 'https://unsplash.com/photos/aurora-gradient',
    license: 'Unsplash',
    attribution: '',
    createdAt: 1727000100000,
    usages: [
      { id: 'u-hero-home', page: '官网首页', distribution: 'link', confirmed: true },
      { id: 'u-hero-blog', page: '发布博客', distribution: null, confirmed: false },
    ],
  },
  {
    id: 'a-team',
    name: 'team-photo.png',
    kind: 'image',
    source: '',
    license: '未核实',
    attribution: '',
    createdAt: 1727000200000,
    usages: [
      { id: 'u-team-about', page: '关于我们', distribution: 'bundle', confirmed: false },
    ],
  },
  {
    id: 'a-lucide',
    name: 'Lucide Icons',
    kind: 'icon',
    source: 'https://lucide.dev',
    license: 'ISC',
    attribution: 'Lucide Icons — ISC License © Lucide Contributors',
    createdAt: 1727000300000,
    usages: [
      { id: 'u-lucide-console', page: '控制台', distribution: 'bundle', confirmed: true },
      { id: 'u-lucide-pay', page: '结算页', distribution: 'bundle', confirmed: true },
    ],
  },
  {
    id: 'a-paybadges',
    name: 'payment-badges.svg',
    kind: 'icon',
    source: 'https://github.com/activemerchant/payment_icons',
    license: 'CC-BY-4.0',
    attribution: '',
    createdAt: 1727000400000,
    usages: [
      { id: 'u-pay-checkout', page: '结算页', distribution: 'bundle', confirmed: false },
      { id: 'u-pay-landing', page: '营销落地页', distribution: 'link', confirmed: true },
    ],
  },
];
