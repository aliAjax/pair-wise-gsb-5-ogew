// 页面层：按页面聚合的发布清单——任一素材有缺口即阻塞该页面

import {AlertTriangle, Check, MapPin} from 'lucide-react';
import type {Asset} from '../assets/types';
import type {Ledger} from '../assets/useLedger';
import {buildChecklist} from '../assets/logic';
import {KIND_LABEL, LICENSE_COLOR} from './labels';

export default function Checklist({assets, ledger, onOpenAsset}: {
  assets: Asset[];
  ledger: Ledger;
  onOpenAsset: (id: string) => void;
}) {
  const pages = buildChecklist(assets);
  return (
    <div className="page-list">
      {pages.map(p => (
        <div className={'page-card ' + (p.ready ? 'ready' : 'blocked')} key={p.page}>
          <div className="page-head">
            <div className="page-title"><MapPin size={16}/><h2>{p.page}</h2></div>
            {p.ready
              ? <span className="status ok"><Check size={13}/>可发布</span>
              : <span className="status risk"><AlertTriangle size={13}/>阻塞（{p.blockers.length} 个原因）</span>}
          </div>
          <div className="page-items">
            {p.items.map(({asset, usage, blockers}) => (
              <div className="page-item" key={usage.id}>
                <span className="pkg-dot" style={{background: LICENSE_COLOR[asset.licenseId] || '#888'}}/>
                <button className="asset-link" onClick={() => onOpenAsset(asset.id)}>
                  {asset.name} <small>{KIND_LABEL[asset.kind]}</small>
                </button>
                <span className="loc">/ {usage.location}</span>
                {usage.status === 'confirmed'
                  ? <span className="status ok"><Check size={12}/>已确认</span>
                  : <button className="mini-btn" onClick={() => ledger.confirmUsage(asset.id, usage.id)}><Check size={13}/>确认该位置</button>}
                {blockers.length > 0 && (
                  <div className="item-blockers">
                    {blockers.map(b => <span key={b.code + b.message} className="blocker-chip"><AlertTriangle size={11}/>{b.message}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      {pages.length === 0 && <p className="empty">还没有任何使用位置，先去素材台账登记。</p>}
    </div>
  );
}
