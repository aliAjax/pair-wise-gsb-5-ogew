// 页面层：素材详情面板（阻塞项、使用位置逐条确认、删除守卫）

import {useState} from 'react';
import {AlertTriangle, Check, FileCode2, Info, Pencil, Plus, Trash2, X} from 'lucide-react';
import type {Asset} from '../assets/types';
import type {Ledger} from '../assets/useLedger';
import {assetBlockers, canDelete} from '../assets/logic';
import {licenseById} from '../assets/licenses';
import {DELIVERY_LABEL, KIND_LABEL, LICENSE_COLOR} from './labels';

interface Props {
  asset: Asset;
  ledger: Ledger;
  onEdit: () => void;
  onClose: () => void;
}

export default function AssetDetail({asset, ledger, onEdit, onClose}: Props) {
  const [page, setPage] = useState('');
  const [location, setLocation] = useState('');
  const blockers = assetBlockers(asset);
  const del = canDelete(asset);
  const lic = licenseById(asset.licenseId);
  const color = LICENSE_COLOR[asset.licenseId] || '#888';

  const addUsage = () => {
    if (!page.trim() || !location.trim()) return;
    ledger.addUsage(asset.id, page.trim(), location.trim());
    setPage('');
    setLocation('');
  };

  return (
    <div className="detail">
      <div className="detail-head">
        <div className="detail-icon" style={{background: color + '1c', color}}><FileCode2 size={20}/></div>
        <div>
          <span>{KIND_LABEL[asset.kind]} · {asset.archived ? '已归档' : '在册'}</span>
          <h2>{asset.name}</h2>
        </div>
        {!asset.archived && <button className="icon-btn" title="编辑资料" onClick={onEdit}><Pencil size={15}/></button>}
        <button className="close" onClick={onClose}><X size={16}/></button>
      </div>

      <div className="detail-grid">
        <div><label>许可证</label><b>{lic?.label ?? '未登记'}</b></div>
        <div><label>分发方式</label><b>{asset.delivery ? DELIVERY_LABEL[asset.delivery] : '未定'}</b></div>
        <div><label>来源</label><b className="ellipsis" title={asset.source}>{asset.source || '未登记'}</b></div>
      </div>
      <div className="attr-line">
        <label>署名文字</label>
        <b>{asset.attribution || (lic?.attributionRequired ? '缺失——该许可证要求署名' : '（无需署名）')}</b>
      </div>

      {blockers.length > 0 ? (
        <div className="finding risk">
          <div className="finding-icon"><AlertTriangle size={16}/></div>
          <div>
            <b>{blockers.length} 个缺口阻塞发布</b>
            {blockers.map(b => <p key={b.code + b.message}>· {b.message}</p>)}
          </div>
        </div>
      ) : (
        <div className="finding ok">
          <div className="finding-icon"><Check size={16}/></div>
          <div><b>资料完备</b><p>来源、许可证{lic?.attributionRequired ? '、署名' : ''}与分发方式均已登记。</p></div>
        </div>
      )}

      <div className="usage-section">
        <div className="usage-head">
          <div><Info size={15}/><span>使用位置（{asset.usages.length}）</span></div>
          <small>同一素材被多个页面引用时，需逐条确认</small>
        </div>
        {asset.usages.length === 0 && <p className="empty">暂无使用位置{asset.archived ? '，素材已归档' : ''}</p>}
        {asset.usages.map(u => (
          <div className="usage-row" key={u.id}>
            <span className={'dot ' + (u.status === 'confirmed' ? 'ok' : 'pending')}/>
            <div className="usage-main">
              <b>{u.page}</b>
              <small>{u.location}</small>
            </div>
            {u.status === 'confirmed'
              ? <span className="status ok"><Check size={13}/>已确认</span>
              : <button className="mini-btn" onClick={() => ledger.confirmUsage(asset.id, u.id)}><Check size={13}/>确认</button>}
            {!asset.archived && (
              <button className="icon-btn danger" title="移除该位置" onClick={() => ledger.removeUsage(asset.id, u.id)}><Trash2 size={14}/></button>
            )}
          </div>
        ))}
        {!asset.archived && (
          <div className="usage-add">
            <input value={page} onChange={e => setPage(e.target.value)} placeholder="页面，如 首页"/>
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="位置，如 首屏横幅"/>
            <button className="mini-btn primary" onClick={addUsage}><Plus size={13}/>添加</button>
          </div>
        )}
      </div>

      {!asset.archived && (
        <div className="delete-zone">
          <button className="danger-btn" disabled={!del.ok} onClick={() => ledger.archiveAsset(asset.id)}>
            <Trash2 size={14}/>删除素材与署名
          </button>
          {!del.ok && <small>{del.reason}</small>}
          {del.ok && <small>最后一个使用位置已移除，可删除；历史快照仍可查回原文。</small>}
        </div>
      )}
    </div>
  );
}
