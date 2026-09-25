// 资料层：许可证目录（不同许可证的义务说明）

export interface LicenseDef {
  id: string;
  label: string;
  /** 是否要求署名/版权声明 */
  attributionRequired: boolean;
  /** 是否必须随包附带许可证全文（仅随包分发时生效） */
  bundledTextRequired: boolean;
  /** 商业授权类：必须填写授权来源 */
  commercial: boolean;
  desc: string;
}

export const LICENSES: LicenseDef[] = [
  {id: 'MIT', label: 'MIT', attributionRequired: true, bundledTextRequired: true, commercial: false, desc: '宽松许可，需保留版权声明'},
  {id: 'OFL-1.1', label: 'SIL OFL 1.1（字体）', attributionRequired: true, bundledTextRequired: true, commercial: false, desc: '字体专用许可，可嵌入分发，需保留声明'},
  {id: 'Apache-2.0', label: 'Apache-2.0', attributionRequired: true, bundledTextRequired: true, commercial: false, desc: '需保留 NOTICE 与版权声明'},
  {id: 'CC-BY-4.0', label: 'CC BY 4.0', attributionRequired: true, bundledTextRequired: true, commercial: false, desc: '知识共享署名，须署名并随附许可证条款（全文或链接）'},
  {id: 'CC0-1.0', label: 'CC0 1.0（公有领域）', attributionRequired: false, bundledTextRequired: false, commercial: false, desc: '放弃权利，可自由使用'},
  {id: 'CC-BY-NC-4.0', label: 'CC BY-NC 4.0', attributionRequired: true, bundledTextRequired: false, commercial: false, desc: '仅限非商业用途，商用前需另获授权'},
  {id: 'commercial', label: '商业授权', attributionRequired: false, bundledTextRequired: false, commercial: true, desc: '按购买/订阅条款使用，需留存授权凭证'},
  {id: 'unknown', label: '许可证未知', attributionRequired: true, bundledTextRequired: false, commercial: false, desc: '未确认授权，禁止发布'},
];

export const licenseById = (id: string): LicenseDef | undefined =>
  LICENSES.find(l => l.id === id);
