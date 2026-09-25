import {useEffect,useState} from 'react';
import {AlertTriangle,ChevronDown,FileCode2,Image as ImageIcon,Layers3,ShieldCheck,Sparkles} from 'lucide-react';
import DependencyScan,{Dep,initialDeps} from './DependencyScan';
import AssetLedger from './assets/AssetLedger';
export default function App(){
  const [view,setView]=useState<'deps'|'assets'>('deps');
  const [deps,setDeps]=useState<Dep[]>(()=>{try{return JSON.parse(localStorage.getItem('license-lens')||'')||initialDeps}catch{return initialDeps}});
  useEffect(()=>localStorage.setItem('license-lens',JSON.stringify(deps)),[deps]);
  return <div className="shell">
    <aside>
      <div className="brand"><div className="brand-icon"><ShieldCheck size={18}/></div><div><b>License Lens</b><small>dependency clarity</small></div></div>
      <div className="nav-title">WORKSPACE</div>
      <button className={view==='deps'?'nav active':'nav'} onClick={()=>setView('deps')}><Layers3 size={16}/>依赖总览</button>
      <button className={view==='assets'?'nav active':'nav'} onClick={()=>setView('assets')}><ImageIcon size={16}/>素材台账</button>
      <button className="nav" onClick={()=>setView('deps')}><FileCode2 size={16}/>许可证清单 <span>{deps.length}</span></button>
      <button className="nav" onClick={()=>setView('deps')}><AlertTriangle size={16}/>待处理风险 <span className="red">{deps.filter(d=>d.status==='risk').length}</span></button>
      <div className="aside-bottom">
        <div className="mini-card"><Sparkles size={16}/><div><b>扫描已更新</b><small>刚刚完成 {deps.length} 个依赖的分析</small></div></div>
        <div className="user"><div className="avatar">ZL</div><span>Zen Li</span><ChevronDown size={14}/></div>
      </div>
    </aside>
    {view==='deps'?<DependencyScan deps={deps} setDeps={setDeps}/>:<AssetLedger/>}
  </div>;
}
