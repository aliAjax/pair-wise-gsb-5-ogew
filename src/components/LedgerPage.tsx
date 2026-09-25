// 页面层：素材合规台账主页（列表 / 发布清单 / 历史快照）

import {useMemo, useState} from 'react';
import {AlertTriangle, Check, Download, Image as ImageIcon, Plus, Search, ShieldCheck, Type, Shapes} from 'lucide-react';
import type {Asset, AssetKind} from '../assets/types';
import type {Ledger} from '../assets/useLedger';
import {assetBlockers, buildChecklist, fmtTime, ledgerStats} from '../assets/logic';
import {licenseById} from '../assets/licenses';
import AssetForm, {type AssetDraft} from './AssetForm';
import AssetDetail from './AssetDetail';
import Checklist from './Checklist';
import Snapshots from './Snapshots';
import {DELIVERY_LABEL, KIND_LABEL, LICENSE_COLOR} from './labels';

const KIND_ICON: Record<AssetKind, typeof Type> = {font: Type, image: ImageIcon, icon: Shapes};
type Tab = 'assets' | 'pages' | 'history';
type Filter = 'all' | 'blocked' | 'pending' | 'ok';

export default function LedgerPage({ledger}: {ledger: Ledger}) {
  const {assets, snapshots} = ledger;
  const [tab, setTab] = useState<Tab>('assets');
  const [selected, setSelected] = useState<string>('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);

  const stats = useMemo(() => ledgerStats(assets), [assets]);
  const live = assets.filter(a => !a.archived);

  const filtered = useMemo(() => live.filter(a => {
    const blockers = assetBlockers(a);
    const pending = a.usages.some(u => u.status === 'pending');
    const blocked = blockers.length > 0;
    if (filter === 'blocked' && !blocked) return false;
    if (filter === 'pending' && (blocked || !pending)) return false;
    if (filter === 'ok' && (blocked || pending)) return false;
    return `${a.name}${a.source}`.toLowerCase().includes(query.toLowerCase());
  }), [live, filter, query]);

  const current = assets.find(a => a.id === selected);
  const score = stats.total ? Math.round(stats.clean / stats.total * 100) : 100;

  const submit = (draft: AssetDraft) => {
    if (editing) ledger.updateAsset(editing.id, draft);
    else setSelected(ledger.addAsset(draft));
    setShowForm(false);
    setEditing(null);
  };

  const exportMd = () => {
    const pages = buildChecklist(assets);
    const lines = [
      '# 素材合规发布清单', '',
      `生成时间：${fmtTime(Date.now())}`,
      `在册素材 ${stats.total} 份；待确认位置 ${stats.pendingUsages} 处；可发布页面 ${stats.readyPages} / ${pages.length}`, '',
    ];
    for (const p of pages) {
      lines.push(`## ${p.page} — ${p.ready ? '✅ 可发布' : '⛔ 阻塞'}`);
      lines.push('| 素材 | 类型 | 位置 | 确认状态 | 阻塞原因 |', '|---|---|---|---|---|');
      for (const it of p.items) {
        lines.push(`| ${it.asset.name} | ${KIND_LABEL[it.asset.kind]} | ${it.usage.location} | ${it.usage.status === 'confirmed' ? '已确认' : '待确认'} | ${it.blockers.map(b => b.message).join('；') || '—'} |`);
      }
      lines.push('');
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lines.join('\n')], {type: 'text/markdown'}));
    a.download = 'asset-release-checklist.md';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <main>
      <header>
        <div>
          <div className="crumb">WORKSPACE / <b>ASSET LEDGER</b></div>
          <h1>素材合规台账</h1>
          <p>登记字体、图片与图标的来源、许可证、署名和使用位置，按页面守住发布关。</p>
        </div>
        <div className="head-actions">
          <button className="outline" onClick={exportMd}><Download size={15}/>导出清单</button>
          <button className="primary" onClick={() => {setEditing(null); setShowForm(true);}}><Plus size={16}/>登记素材</button>
        </div>
      </header>

      <section className="hero">
        <div>
          <span className="tag">ASSET LEDGER · AURORA-WEB</span>
          <h2>发布前，素材也要说清来历。</h2>
          <p>共登记 <b>{stats.total} 份素材</b>，<b className="warning">{stats.pendingUsages} 个使用位置待确认</b>，
            <b className="warning"> {stats.blocked} 份素材存在缺口</b>，影响 <b className="warning">{stats.blockedPages} 个页面</b>。</p>
        </div>
        <div className="scan-score">
          <div className="score-ring" style={{borderColor: score === 100 ? '#39b294' : '#ec8c75', borderLeftColor: '#496267'}}>
            <strong>{score}<small>%</small></strong>
          </div>
          <div><span>合规评分</span><b>{stats.blocked ? '待处理' : '良好'}</b><small>已归档 {stats.archived} 份</small></div>
        </div>
      </section>

      <section className="summary">
        <div><span>在册素材</span><b>{stats.total}</b><small>字体 / 图片 / 图标</small></div>
        <div><span>合规就绪</span><b className="teal">{stats.clean}</b><small>资料完备且位置已确认</small></div>
        <div><span>待确认位置</span><b className="orange">{stats.pendingUsages}</b><small>同一素材多页面各自确认</small></div>
        <div><span>阻塞素材</span><b className="red">{stats.blocked}</b><small>挡住对应页面发布</small></div>
      </section>

      <div className="tabs">
        <button className={tab === 'assets' ? 'tab active' : 'tab'} onClick={() => setTab('assets')}>素材台账</button>
        <button className={tab === 'pages' ? 'tab active' : 'tab'} onClick={() => setTab('pages')}>
          发布清单{stats.blockedPages > 0 && <span className="tab-badge">{stats.blockedPages}</span>}
        </button>
        <button className={tab === 'history' ? 'tab active' : 'tab'} onClick={() => setTab('history')}>
          历史快照<span className="tab-count">{snapshots.length}</span>
        </button>
      </div>

      {tab === 'assets' && (
        <section className="workspace">
          <div className="table-pane">
            <div className="pane-head">
              <div><h2>素材清单</h2><p>来源、许可证、署名与分发方式逐项登记</p></div>
              <div className="tools">
                <div className="search"><Search size={15}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索素材"/></div>
                <select value={filter} onChange={e => setFilter(e.target.value as Filter)}>
                  <option value="all">全部状态</option>
                  <option value="blocked">有缺口</option>
                  <option value="pending">待确认位置</option>
                  <option value="ok">已就绪</option>
                </select>
              </div>
            </div>
            <div className="table">
              <div className="tr th ast-tr"><span>素材</span><span>许可证</span><span>分发</span><span>使用位置</span><span>状态</span></div>
              {filtered.map(a => {
                const blockers = assetBlockers(a);
                const pending = a.usages.filter(u => u.status === 'pending').length;
                const blocked = blockers.length > 0;
                const color = LICENSE_COLOR[a.licenseId] || '#888';
                const Icon = KIND_ICON[a.kind];
                return (
                  <button className={(a.id === selected ? 'tr selected ' : 'tr ') + 'ast-tr'} key={a.id} onClick={() => setSelected(a.id)}>
                    <span className="dep-name"><Icon size={13} className="kind-glyph"/> {a.name}</span>
                    <span><i className="license" style={{color, background: color + '18'}}>{licenseById(a.licenseId)?.label ?? '未登记'}</i></span>
                    <span className="muted">{a.delivery ? DELIVERY_LABEL[a.delivery] : '未定'}</span>
                    <span className="muted">{a.usages.length} 处{pending > 0 && <em className="pend"> · {pending} 待确认</em>}</span>
                    {blocked
                      ? <span className="status risk"><AlertTriangle size={13}/>{blockers.length} 个缺口</span>
                      : pending > 0
                        ? <span className="status warn"><AlertTriangle size={13}/>待确认</span>
                        : <span className="status ok"><Check size={13}/>就绪</span>}
                  </button>
                );
              })}
              {filtered.length === 0 && <p className="empty">没有符合条件的素材。</p>}
            </div>
          </div>
          {current
            ? <AssetDetail asset={current} ledger={ledger} onEdit={() => {setEditing(current); setShowForm(true);}} onClose={() => setSelected('')}/>
            : <div className="detail placeholder-detail"><ShieldCheck size={26}/><b>选择一份素材</b><small>查看阻塞原因、逐个确认使用位置</small></div>}
        </section>
      )}

      {tab === 'pages' && <Checklist assets={assets} ledger={ledger} onOpenAsset={id => {setSelected(id); setTab('assets');}}/>}
      {tab === 'history' && <Snapshots snapshots={snapshots}/>}

      {showForm && (
        <AssetForm
          title={editing ? '编辑素材资料' : '登记素材'}
          initial={editing ?? undefined}
          onSubmit={submit}
          onClose={() => {setShowForm(false); setEditing(null);}}
        />
      )}
    </main>
  );
}
