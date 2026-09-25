// 页面层：素材登记 / 编辑弹窗

import {useState} from 'react';
import type {Asset, AssetKind, Delivery} from '../assets/types';
import {LICENSES, licenseById} from '../assets/licenses';
import {KIND_LABEL} from './labels';

export interface AssetDraft {
  name: string;
  kind: AssetKind;
  source: string;
  licenseId: string;
  attribution: string;
  delivery: Delivery | '';
  licenseBundled: boolean;
}

interface Props {
  title: string;
  initial?: Asset;
  onSubmit: (draft: AssetDraft) => void;
  onClose: () => void;
}

export default function AssetForm({title, initial, onSubmit, onClose}: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [kind, setKind] = useState<AssetKind>(initial?.kind ?? 'image');
  const [source, setSource] = useState(initial?.source ?? '');
  const [licenseId, setLicenseId] = useState(initial?.licenseId ?? '');
  const [attribution, setAttribution] = useState(initial?.attribution ?? '');
  const [delivery, setDelivery] = useState<Delivery | ''>(initial?.delivery ?? '');
  const [licenseBundled, setLicenseBundled] = useState(initial?.licenseBundled ?? false);

  const lic = licenseById(licenseId);
  const submit = () => {
    if (!name.trim()) return;
    onSubmit({name: name.trim(), kind, source: source.trim(), licenseId, attribution: attribution.trim(), delivery, licenseBundled});
  };

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><h2>{title}</h2><button onClick={onClose}>×</button></div>
        <label>素材名称
          <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="例如 aurora-hero.png"/>
        </label>
        <label>素材类型
          <select value={kind} onChange={e => setKind(e.target.value as AssetKind)}>
            {(Object.keys(KIND_LABEL) as AssetKind[]).map(k => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
          </select>
        </label>
        <label>来源（出处链接或供应商）
          <input value={source} onChange={e => setSource(e.target.value)} placeholder="https://… 或授权渠道"/>
        </label>
        <label>许可证
          <select value={licenseId} onChange={e => setLicenseId(e.target.value)}>
            <option value="">未选择</option>
            {LICENSES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </label>
        {lic && <p className="hint">{lic.desc}{lic.attributionRequired ? '；要求署名' : '；可不署名'}{lic.bundledTextRequired ? '；随包需附许可证全文' : ''}</p>}
        <label>署名文字{lic?.attributionRequired ? '（该许可证要求署名）' : '（可选）'}
          <input value={attribution} onChange={e => setAttribution(e.target.value)} placeholder="Copyright … / Designed by …"/>
        </label>
        <label>分发方式
          <select value={delivery} onChange={e => setDelivery(e.target.value as Delivery | '')}>
            <option value="">未选择</option>
            <option value="external">外链引用（不随包，须登记可访问来源）</option>
            <option value="bundled">随包分发（打包进产物，义务更严格）</option>
          </select>
        </label>
        {delivery === 'bundled' && lic?.bundledTextRequired && (
          <label className="check">
            <input type="checkbox" checked={licenseBundled} onChange={e => setLicenseBundled(e.target.checked)}/>
            已确认包内附带 {lic.label} 许可证条款（全文或链接）
          </label>
        )}
        <button className="primary full" onClick={submit}>{initial ? '保存修改' : '登记素材'}</button>
      </div>
    </div>
  );
}
