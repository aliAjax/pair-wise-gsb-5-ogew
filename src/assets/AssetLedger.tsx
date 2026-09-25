import {useEffect,useMemo,useState} from 'react';
import type {ReactNode} from 'react';
import {AlertTriangle,Check,Download,History,Image as ImageIcon,Info,Link2,Package,Plus,Search,Shapes,Trash2,Type,X} from 'lucide-react';
import type {Asset,AssetKind,AssetSnapshot,DistributionMode} from './types';
import {uid} from './types';
import {DIST_LABEL,GAP_LABEL,KIND_LABEL,LICENSE_OPTIONS,STATUS_LABEL,assetStatus,buildReleaseChecklist,licenseRule,usageGaps} from './compliance';
import {loadAssets,loadSnapshots,saveAssets,saveSnapshots} from './storage';

const KIND_ICON:Record<AssetKind,ReactNode>={font:<Type size={15}/>,image:<ImageIcon size={15}/>,icon:<Shapes size={15}/>};
const STATUS_CLASS:Record<string,string>={ok:'ok',pending:'warn',gap:'risk',idle:'idle'};

export default function AssetLedger(){
  const [assets,setAssets]=useState<Asset[]>(loadAssets);
  const [snapshots,setSnapshots]=useState<AssetSnapshot[]>(loadSnapshots);
  const [selected,setSelected]=useState<string>(()=>loadAssets()[0]?.id??'');
  const [query,setQuery]=useState('');
  const [filter,setFilter]=useState('全部');
  const [showAdd,setShowAdd]=useState(false);
  const [showSnapshots,setShowSnapshots]=useState(false);
  const [name,setName]=useState('');
  const [kind,setKind]=useState<AssetKind>('image');
  const [license,setLicense]=useState('CC-BY-4.0');
  const [source,setSource]=useState('');
  const [attribution,setAttribution]=useState('');
  const [page,setPage]=useState('');
  const [dist,setDist]=useState<DistributionMode|''>('');

  useEffect(()=>saveAssets(assets),[assets]);
  useEffect(()=>saveSnapshots(snapshots),[snapshots]);

  const current=assets.find(a=>a.id===selected);
  const rule=current?licenseRule(current.license):null;
  const release=useMemo(()=>buildReleaseChecklist(assets),[assets]);
  const filtered=useMemo(()=>assets.filter(a=>(filter==='全部'||assetStatus(a)===filter)&&`${a.name}${a.license}${a.source}`.toLowerCase().includes(query.toLowerCase())),[assets,filter,query]);
  const totalUsages=assets.reduce((n,a)=>n+a.usages.length,0);
  const pendingUsages=assets.reduce((n,a)=>n+a.usages.filter(u=>!u.confirmed).length,0);
  const gapAssets=assets.filter(a=>assetStatus(a)==='gap').length;
  const clearUsages=assets.reduce((n,a)=>n+a.usages.filter(u=>u.confirmed&&usageGaps(a,u).length===0).length,0);
  const blocked=release.filter(r=>r.blocked);

  const update=(id:string,fn:(a:Asset)=>Asset)=>setAssets(as=>as.map(a=>a.id===id?fn(a):a));

  const addAsset=()=>{
    if(!name.trim())return;
    const id=uid();
    setAssets(as=>[...as,{id,name:name.trim(),kind,source:source.trim(),license,attribution:attribution.trim(),usages:[],createdAt:Date.now()}]);
    setSelected(id);setName('');setSource('');setAttribution('');setShowAdd(false);
  };

  const removeAsset=(id:string)=>{
    const target=assets.find(a=>a.id===id);
    if(!target||target.usages.length>0)return; // 最后一个使用位置移除后才允许删除
    setSnapshots(ss=>[...ss,{id:uid(),takenAt:Date.now(),asset:target}]);
    const rest=assets.filter(a=>a.id!==id);
    setAssets(rest);
    if(selected===id)setSelected(rest[0]?.id??'');
  };

  const addUsage=()=>{
    if(!current||!page.trim())return;
    update(current.id,a=>({...a,usages:[...a.usages,{id:uid(),page:page.trim(),distribution:dist||null,confirmed:false}]}));
    setPage('');setDist('');
  };

  const exportMd=()=>{
    const lines=['# 素材合规台账','','| 素材 | 类型 | 许可证 | 来源 | 署名 | 状态 |','|---|---|---|---|---|---|'];
    for(const a of assets)lines.push(`| ${a.name} | ${KIND_LABEL[a.kind]} | ${a.license||'未核实'} | ${a.source||'—'} | ${a.attribution?a.attribution.replace(/\|/g,'\\|'):'—'} | ${STATUS_LABEL[assetStatus(a)]} |`);
    lines.push('','## 使用位置','');
    for(const a of assets)for(const u of a.usages){
      const gaps=usageGaps(a,u);
      lines.push(`- ${u.page} ← ${a.name}（${u.distribution?DIST_LABEL[u.distribution]:'分发方式未定'}，${u.confirmed?'已确认':'待确认'}${gaps.length?`，缺口：${gaps.map(g=>GAP_LABEL[g]).join('、')}`:''}）`);
    }
    lines.push('','## 发布清单','');
    for(const r of release)lines.push(`- ${r.page}：${r.blocked?`阻塞（${r.reasons.map(x=>x.label).join('；')}）`:'可发布'}`);
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/markdown'}));
    a.download='asset-ledger.md';a.click();URL.revokeObjectURL(a.href);
  };

  return <main>
    <header>
      <div>
        <div className="crumb">WORKSPACE / <b>ASSET LEDGER</b></div>
        <h1>素材合规台账</h1>
        <p>登记字体、图片、图标的来源与署名，挡住不合规的发布。</p>
      </div>
      <div className="head-actions">
        <button className="outline" onClick={()=>setShowSnapshots(true)}><History size={15}/>历史快照 {snapshots.length>0&&<span className="count">{snapshots.length}</span>}</button>
        <button className="outline" onClick={exportMd}><Download size={15}/>导出台账</button>
        <button className="primary" onClick={()=>setShowAdd(true)}><Plus size={16}/>登记素材</button>
      </div>
    </header>

    <section className="hero">
      <div>
        <span className="tag">PROJECT · AURORA-WEB</span>
        <h2>发布前，先过素材这一关。</h2>
        <p>台账共 <b>{assets.length} 份素材</b>，还有 <b className="warning">{pendingUsages} 个使用位置</b>待确认、<b className="warning">{blocked.length} 个发布项</b>被阻塞。</p>
      </div>
      <div className="scan-score">
        <div className="score-ring"><strong>{totalUsages?Math.round(clearUsages/totalUsages*100):100}<small>%</small></strong></div>
        <div><span>位置合规率</span><b>{blocked.length?'有阻塞':'良好'}</b><small>重开后自动恢复台账</small></div>
      </div>
    </section>

    <section className="summary">
      <div><span>全部素材</span><b>{assets.length}</b><small>字体 / 图片 / 图标</small></div>
      <div><span>使用位置</span><b className="teal">{totalUsages}</b><small>{pendingUsages} 处待确认</small></div>
      <div><span>存在缺口</span><b className="orange">{gapAssets}</b><small>来源 / 署名 / 分发方式</small></div>
      <div><span>发布阻塞</span><b className="red">{blocked.length}</b><small>共 {release.length} 个发布项</small></div>
    </section>

    <section className="release">
      <div className="pane-head">
        <div><h2>发布清单</h2><p>按页面核对素材合规，存在缺口或待确认即阻塞对应发布项</p></div>
      </div>
      <div className="release-list">
        {release.length===0&&<p className="empty">暂无使用位置，登记的素材被页面引用后会出现在这里。</p>}
        {release.map(r=><div className={r.blocked?'release-item blocked':'release-item clear'} key={r.page}>
          <div className="release-page">
            {r.blocked?<AlertTriangle size={15}/>:<Check size={15}/>}
            <b>{r.page}</b><span>{r.refs} 处引用</span>
          </div>
          <div className="release-reasons">
            {r.blocked
              ?r.reasons.map((reason,i)=><button className="reason-chip" key={i} onClick={()=>setSelected(reason.assetId)}>{reason.label}</button>)
              :<span className="ok-chip"><Check size={12}/>可发布</span>}
          </div>
        </div>)}
      </div>
    </section>

    <section className="workspace">
      <div className="table-pane">
        <div className="pane-head">
          <div><h2>素材台账</h2><p>逐份登记来源、许可证与署名</p></div>
          <div className="tools">
            <div className="search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索素材"/></div>
            <select value={filter} onChange={e=>setFilter(e.target.value)}>
              <option value="全部">全部状态</option>
              <option value="ok">合规</option>
              <option value="pending">待确认</option>
              <option value="gap">有缺口</option>
              <option value="idle">未使用</option>
            </select>
          </div>
        </div>
        <div className="table asset-table">
          <div className="tr th"><span>素材名称</span><span>许可证</span><span>位置</span><span>状态</span></div>
          {filtered.map(a=>{
            const st=assetStatus(a);
            return <button className={a.id===selected?'tr selected':'tr'} key={a.id} onClick={()=>setSelected(a.id)}>
              <span className="dep-name"><span className={'kind-ic '+a.kind}>{KIND_ICON[a.kind]}</span>{a.name}</span>
              <span><i className="license">{a.license||'未核实'}</i></span>
              <span className="muted">{a.usages.length} 处</span>
              <span className={'status '+STATUS_CLASS[st]}>{st==='ok'?<Check size={13}/>:st==='idle'?<Info size={13}/>:<AlertTriangle size={13}/>} {STATUS_LABEL[st]}</span>
            </button>;
          })}
          {filtered.length===0&&<p className="empty">没有匹配的素材。</p>}
        </div>
      </div>

      {current&&<div className="detail">
        <div className="detail-head">
          <div className="detail-icon kind-bg">{KIND_ICON[current.kind]}</div>
          <div><span>{KIND_LABEL[current.kind]} · ASSET</span><h2>{current.name}</h2></div>
          <button className="close" onClick={()=>setSelected('')}><X size={16}/></button>
        </div>

        <div className="edit-grid">
          <label>来源
            <input value={current.source} onChange={e=>update(current.id,a=>({...a,source:e.target.value}))} placeholder="获取地址或作者，必填"/>
          </label>
          <label>许可证
            <select value={current.license} onChange={e=>update(current.id,a=>({...a,license:e.target.value}))}>
              {LICENSE_OPTIONS.map(l=><option key={l}>{l}</option>)}
            </select>
          </label>
        </div>

        <div className="attr-edit">
          <div className="attr-head">
            <label>署名文字</label>
            {rule?(rule.attributionRequired?<i className="req">该许可证要求署名</i>:<i className="opt">该许可证不强制署名</i>):<i className="req">先核实许可证</i>}
          </div>
          <textarea rows={2} value={current.attribution} onChange={e=>update(current.id,a=>({...a,attribution:e.target.value}))} placeholder="例如：Photo by Jane Doe / Unsplash，CC-BY-4.0"/>
        </div>

        <div className={rule?'oblig':'oblig missing'}>
          <div><Info size={15}/><span>分发义务 · 外链与随包不同</span></div>
          {rule?<div className="oblig-grid">
            <p><Link2 size={13}/><b>外链引用</b>{rule.obligations.link}</p>
            <p><Package size={13}/><b>随包分发</b>{rule.obligations.bundle}</p>
          </div>:<p className="oblig-warn">许可证未核实，无法评估义务。请先确认素材的许可条款。</p>}
        </div>

        <div className="usages">
          <div className="usages-head"><span>使用位置 · 各自确认</span><small>{current.usages.filter(u=>u.confirmed).length}/{current.usages.length} 已确认</small></div>
          {current.usages.map(u=>{
            const gaps=usageGaps(current,u);
            return <div className="usage" key={u.id}>
              <div className="usage-top">
                <b>{u.page}</b>
                <select value={u.distribution??''} onChange={e=>update(current.id,a=>({...a,usages:a.usages.map(x=>x.id===u.id?{...x,distribution:(e.target.value||null) as DistributionMode|null}:x)}))}>
                  <option value="">分发方式…</option>
                  <option value="link">外链引用</option>
                  <option value="bundle">随包分发</option>
                </select>
                <button className={u.confirmed?'confirm done':'confirm'} onClick={()=>update(current.id,a=>({...a,usages:a.usages.map(x=>x.id===u.id?{...x,confirmed:!x.confirmed}:x)}))}>
                  <Check size={13}/>{u.confirmed?'已确认':'确认'}
                </button>
                <button className="icon-btn" title="移除该使用位置" onClick={()=>update(current.id,a=>({...a,usages:a.usages.filter(x=>x.id!==u.id)}))}><Trash2 size={14}/></button>
              </div>
              {(gaps.length>0||!u.confirmed)&&<div className="usage-gaps">
                {gaps.map(g=><span className="chip gap" key={g}>{GAP_LABEL[g]}</span>)}
                {!u.confirmed&&<span className="chip pend">待确认</span>}
              </div>}
            </div>;
          })}
          {current.usages.length===0&&<p className="empty">暂无使用位置。未被引用的素材可以删除。</p>}
          <div className="usage-add">
            <input value={page} onChange={e=>setPage(e.target.value)} placeholder="页面 / 位置，如 官网首页"/>
            <select value={dist} onChange={e=>setDist(e.target.value as DistributionMode|'')}>
              <option value="">分发方式…</option>
              <option value="link">外链引用</option>
              <option value="bundle">随包分发</option>
            </select>
            <button className="outline" onClick={addUsage}><Plus size={14}/>添加</button>
          </div>
        </div>

        <div className="danger-zone">
          <button className="danger" disabled={current.usages.length>0} onClick={()=>removeAsset(current.id)}>
            <Trash2 size={14}/>删除素材与署名
          </button>
          <p>{current.usages.length>0?`还有 ${current.usages.length} 个使用位置，全部移除后才能删除`:'删除后署名原文将存入历史快照，可随时查回'}</p>
        </div>
      </div>}
    </section>

    {showAdd&&<div className="backdrop" onClick={()=>setShowAdd(false)}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-head"><h2>登记素材</h2><button onClick={()=>setShowAdd(false)}>×</button></div>
        <label>素材名称<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="例如 brand-logo.svg"/></label>
        <label>类型<select value={kind} onChange={e=>setKind(e.target.value as AssetKind)}>
          <option value="font">字体</option><option value="image">图片</option><option value="icon">图标</option>
        </select></label>
        <label>许可证<select value={license} onChange={e=>setLicense(e.target.value)}>
          {LICENSE_OPTIONS.map(l=><option key={l}>{l}</option>)}
        </select></label>
        <label>来源<input value={source} onChange={e=>setSource(e.target.value)} placeholder="获取地址或作者"/></label>
        <label>署名文字<input value={attribution} onChange={e=>setAttribution(e.target.value)} placeholder="可稍后补登记"/></label>
        <button className="primary full" onClick={addAsset}>加入台账</button>
      </div>
    </div>}

    {showSnapshots&&<div className="backdrop" onClick={()=>setShowSnapshots(false)}>
      <div className="modal wide" onClick={e=>e.stopPropagation()}>
        <div className="modal-head"><h2>历史快照</h2><button onClick={()=>setShowSnapshots(false)}>×</button></div>
        {snapshots.length===0&&<p className="empty">暂无快照。素材在最后一个使用位置移除后才能删除，删除时会自动留存快照。</p>}
        {snapshots.slice().reverse().map(s=><div className="snap" key={s.id}>
          <div className="snap-head">
            <span className={'kind-ic '+s.asset.kind}>{KIND_ICON[s.asset.kind]}</span>
            <b>{s.asset.name}</b>
            <small>{KIND_LABEL[s.asset.kind]} · {s.asset.license||'未核实'} · 删除于 {new Date(s.takenAt).toLocaleString()}</small>
          </div>
          <label>署名原文</label>
          <p className="snap-attr">{s.asset.attribution||'（未填写署名）'}</p>
          <label>来源</label>
          <p className="snap-src">{s.asset.source||'（未登记来源）'}</p>
        </div>)}
      </div>
    </div>}
  </main>;
}
