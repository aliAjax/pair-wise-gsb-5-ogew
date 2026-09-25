// 页面层：历史快照——每次变更留存原文，归档后仍可查回

import {useState} from 'react';
import {ChevronDown, History, Lock} from 'lucide-react';
import type {Snapshot} from '../assets/types';
import {fmtTime} from '../assets/logic';
import {licenseById} from '../assets/licenses';
import {ACTION_LABEL, DELIVERY_LABEL, KIND_LABEL} from './labels';

export default function Snapshots({snapshots}: {snapshots: Snapshot[]}) {
  const [open, setOpen] = useState<string | null>(snapshots[snapshots.length - 1]?.id ?? null);
  const ordered = [...snapshots].sort((a, b) => b.at - a.at);

  return (
    <div className="snap-list">
      <div className="snap-note"><History size={15}/><span>快照只读，记录变更当时的完整素材原文；素材删除后仍可在此查回。</span></div>
      {ordered.map(s => {
        const a = s.data;
        const lic = licenseById(a.licenseId);
        const expanded = open === s.id;
        return (
          <div className={'snap-card ' + (a.archived ? 'archived' : '')} key={s.id}>
            <button className="snap-head" onClick={() => setOpen(expanded ? null : s.id)}>
              <span className="snap-action">{ACTION_LABEL[s.action]}</span>
              <b>{s.assetName}</b>
              <small>{s.detail ?? ''}</small>
              <span className="snap-time">{fmtTime(s.at)}</span>
              <ChevronDown size={14} className={expanded ? 'rot' : ''}/>
            </button>
            {expanded && (
              <div className="snap-body">
                <div className="snap-readonly"><Lock size={12}/>原文快照</div>
                <div className="snap-grid">
                  <div><label>名称</label><b>{a.name}</b></div>
                  <div><label>类型</label><b>{KIND_LABEL[a.kind]}</b></div>
                  <div><label>许可证</label><b>{lic?.label ?? '未登记'}</b></div>
                  <div><label>分发方式</label><b>{a.delivery ? DELIVERY_LABEL[a.delivery] : '未定'}</b></div>
                  <div className="full"><label>来源</label><b>{a.source || '未登记'}</b></div>
                  <div className="full"><label>署名文字</label><b>{a.attribution || '（无）'}</b></div>
                </div>
                <div className="snap-usages">
                  <label>使用位置（{a.usages.length}）</label>
                  {a.usages.length === 0
                    ? <b>无</b>
                    : a.usages.map(u => (
                      <div className="snap-usage" key={u.id}>
                        <span>{u.page}</span><small>{u.location}</small>
                        <em className={u.status}>{u.status === 'confirmed' ? '已确认' : '待确认'}</em>
                      </div>
                    ))}
                </div>
                {a.archived && <div className="snap-archived">该素材已归档删除</div>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
