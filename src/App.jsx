import { useState, useRef, useEffect, useCallback } from "react";
import sabinaPhoto from "./assets/sabina.jpg";
import { createClient } from "@supabase/supabase-js";

// ── Change this to your own password ──
const APP_PASSWORD = "paris2024";

// ── Supabase client (gracefully disabled if env vars not set) ──
const _url  = import.meta.env.VITE_SUPABASE_URL;
const _key  = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = _url && _key ? createClient(_url, _key) : null;

// ── useDB: localStorage cache + Supabase sync ──
// Falls back to localStorage-only when Supabase is not configured.
function useDB(key, def) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s !== null ? JSON.parse(s) : def; }
    catch { return def; }
  });

  // Pull latest value from Supabase on mount
  useEffect(() => {
    if (!supabase) return;
    supabase.from("user_data").select("value").eq("key", key).maybeSingle()
      .then(({ data, error }) => {
        if (!error && data?.value !== undefined && data.value !== null) {
          setVal(data.value);
          try { localStorage.setItem(key, JSON.stringify(data.value)); } catch {}
        }
      });
  }, [key]);

  const set = useCallback(fn => {
    setVal(prev => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      if (supabase) {
        supabase.from("user_data")
          .upsert({ key, value: next, updated_at: new Date().toISOString() }, { onConflict: "key" })
          .then(({ error }) => { if (error) console.error("[Supabase]", error.message); });
      }
      return next;
    });
  }, [key]);

  return [val, set];
}

const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const HCOLORS=["#c9a87c","#7a9070","#b098c0","#7090a8","#a89080","#c8887a","#8cb87a","#c8b87a","#a0b0c8","#c8a0b0"];
const HICONS=["○","□","△","▽","◇","☆","♡","♢","◎","⊙","⊕","◈","⊞","⊟","◉","✦","✧","✤","✱","✳","✎","☼","☽","♪","✐","∞","⊗","◁","▷","⊣","⊢","⋄","◊","❖","✦"];
const ECOLORS=["#c9a87c","#7a9070","#b098c0","#7090a8","#c8887a","#8cb87a","#a89080","#c8b87a"];
const QUOTES=[
  {text:"She is clothed in strength and dignity.",attr:"Proverbs 31:25"},
  {text:"Paris is always a good idea.",attr:"Audrey Hepburn"},
  {text:"You are enough, just as you are.",attr:"Meghan Markle"},
  {text:"The secret of getting ahead is getting started.",attr:"Mark Twain"},
  {text:"Do something today your future self will thank you for.",attr:"Unknown"},
  {text:"She remembered who she was and the game changed.",attr:"Lalah Delia"},
  {text:"Elegance is not about being noticed, it is about being remembered.",attr:"Giorgio Armani"},
  {text:"A little progress each day adds up to big results.",attr:"Unknown"},
  {text:"You did not come this far to only come this far.",attr:"Unknown"},
  {text:"Bloom where you are planted.",attr:"Unknown"},
  {text:"Be yourself; everyone else is already taken.",attr:"Oscar Wilde"},
  {text:"In the middle of every difficulty lies opportunity.",attr:"Albert Einstein"},
];
const PRAISE=["Magnifique, Sabina! ✨","Ooh la la — done!","You're on fire! 🔥","That's our girl! 💫","One step closer to greatness! 🏆","Chef's kiss! 👌","Absolutely radiant work! ✦","Sabina strikes again! ⚡","Pure elegance under pressure! 🥂","The universe approves! 🌙"];
const DEF_CLEAN_TASKS={Mon:["Vacuum living room","Wipe kitchen surfaces","Clean bathroom sink"],Tue:["Mop floors","Clean mirrors","Tidy bedroom"],Wed:["Deep clean oven","Wipe appliances","Change hand towels"],Thu:["Clean toilets","Dust shelves","Wipe skirting boards"],Fri:["Wash bedding","Clean fridge","Take out bins"],Sat:["Deep clean bathroom","Organise pantry","Wipe windows"],Sun:["Rest and reset","Light tidy","Prep for the week ahead"]};
const DEF_HABITS=[{id:1,name:"Morning pages",icon:"✎",color:"#c9a87c",days:Array(7).fill(false)},{id:2,name:"Walk 30 min",icon:"◎",color:"#a89080",days:Array(7).fill(false)},{id:3,name:"Read",icon:"□",color:"#7a9070",days:Array(7).fill(false)},{id:4,name:"Meditate",icon:"○",color:"#b098c0",days:Array(7).fill(false)},{id:5,name:"Drink 2L water",icon:"◇",color:"#7090a8",days:Array(7).fill(false)}];
const DEF_TAGS=["Personal","Work","Fitness","Health","Creative"];
const DEF_CLEANING=Object.fromEntries(DAYS.map(d=>[d,DEF_CLEAN_TASKS[d].map(t=>({text:t,done:false}))]));

const NOW=new Date();
const TODAY=NOW.toISOString().split("T")[0];
const TOMORROW=new Date(NOW.getTime()+86400000).toISOString().split("T")[0];
const TODAY_DAY=DAYS[NOW.getDay()===0?6:NOW.getDay()-1];
const QUOTE=QUOTES[NOW.getDate()%QUOTES.length];
const PRIORITY_ORD={high:0,medium:1,low:2};
const PCOLS={high:"#c05050",medium:"#c9a87c",low:"#7a9070"};
const MK=`${NOW.getFullYear()}-${String(NOW.getMonth()+1).padStart(2,"0")}`;
const fd=s=>{const d=new Date(s+"T00:00:00");return `${DAYS[d.getDay()===0?6:d.getDay()-1]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;};
const dim=(y,m)=>new Date(y,m+1,0).getDate();
const fdm=(y,m)=>{const d=new Date(y,m,1).getDay();return d===0?6:d-1;};
const isoWeekKey=d=>{const dt=new Date(d+"T12:00:00");const day=dt.getDay()||7;const thu=new Date(dt);thu.setDate(dt.getDate()+(4-day));const ys=new Date(thu.getFullYear(),0,1);return`${thu.getFullYear()}-W${String(Math.ceil(((thu-ys)/86400000+1)/7)).padStart(2,"0")}`;};
const weekDatesOf=wk=>{const[y,w]=wk.split("-W").map(Number);const jan4=new Date(y,0,4);const j4d=jan4.getDay()||7;const mon=new Date(jan4.getTime()-(j4d-1)*86400000+(w-1)*7*86400000);return Array.from({length:7},(_,i)=>new Date(mon.getTime()+i*86400000).toISOString().split("T")[0]);};

const POMO_PRESETS=[{label:"15 min",s:900},{label:"20 min",s:1200},{label:"30 min",s:1800},{label:"1 hr",s:3600}];
const fmtPomo=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const POMO_R=42;
const POMO_CIRC=2*Math.PI*POMO_R;

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --cream:#ece6de;--parchment:#e1d8ce;--ivory:#f8f5f1;
  --ink:#1a1410;--ink-light:#675850;
  --gold:#c9a87c;--gold-deep:#a8865a;--gold-pale:#eddcc8;
  --sage:#7a9070;
  --border:rgba(26,20,16,.12);
  --shadow:0 1px 3px rgba(26,20,16,.04),0 6px 22px rgba(26,20,16,.08);
  --shadow-lg:0 4px 14px rgba(26,20,16,.08),0 16px 48px rgba(26,20,16,.14);
  --nav-h:66px;
}
body,#root{background:var(--cream);min-height:100vh;font-family:'DM Sans',sans-serif;color:var(--ink);}

/* ── TOP NAV ── */
.topnav{position:fixed;top:0;left:0;right:0;height:var(--nav-h);background:linear-gradient(90deg,#352e28 0%,#433830 50%,#352e28 100%);border-bottom:2px solid var(--gold);box-shadow:0 4px 28px rgba(20,16,12,.22);display:flex;align-items:center;padding:0 36px;gap:28px;z-index:200;}
.tn-brand{display:flex;flex-direction:column;gap:2px;flex-shrink:0;margin-right:10px;}
.tn-eye{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:9px;color:var(--gold);letter-spacing:.18em;opacity:.85;}
.tn-name{font-family:'Playfair Display',serif;font-size:17px;color:#f0e8dc;font-weight:600;letter-spacing:.02em;}
.tn-divider{width:1px;height:28px;background:rgba(201,168,124,.18);flex-shrink:0;}
.tn-links{display:flex;align-items:center;gap:2px;flex:1;}
.ni{display:flex;align-items:center;gap:7px;padding:7px 14px;border-radius:20px;cursor:pointer;transition:all .18s;color:rgba(240,232,220,.45);font-size:12px;border:1px solid transparent;white-space:nowrap;letter-spacing:.01em;}
.ni:hover{background:rgba(201,168,124,.1);color:#f0e8dc;}
.ni.on{background:rgba(201,168,124,.18);color:var(--gold);border-color:rgba(201,168,124,.22);}
.ni svg{flex-shrink:0;}
.ni-label{display:inline;}
.tn-dt{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:11px;color:rgba(201,168,124,.4);flex-shrink:0;white-space:nowrap;}

/* ── MAIN ── */
.main{padding:calc(var(--nav-h) + 28px) 20px 64px;min-height:100vh;position:relative;z-index:1;}

/* ── DASHBOARD 3-COLUMN GRID ── */
.dash-grid{display:grid;grid-template-columns:280px 1fr 280px;gap:16px;align-items:start;}
.dash-col{display:flex;flex-direction:column;gap:18px;}

/* ── CARDS ── */
.card{background:var(--ivory);border:1px solid var(--border);border-radius:12px;padding:24px;box-shadow:var(--shadow);}
.card-titled{background:var(--ivory);border:1px solid var(--border);border-radius:12px;padding:22px 24px;box-shadow:var(--shadow);}
.ct{font-family:'Playfair Display',serif;font-size:15px;font-weight:600;color:var(--ink);margin-bottom:4px;letter-spacing:.02em;}
.cs{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:12px;color:var(--ink-light);margin-bottom:16px;letter-spacing:.05em;}

/* ── PROFILE CARD (left col) ── */
.profile-card{background:var(--ivory);border:1px solid var(--gold);border-radius:12px;padding:24px;box-shadow:var(--shadow);text-align:left;}
.ph-eye{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:11px;color:var(--gold);letter-spacing:.18em;opacity:.9;margin-bottom:1px;line-height:1.2;}
.ph-title{font-family:'Playfair Display',serif;font-size:28px;font-weight:400;color:var(--ink);line-height:1.15;margin-bottom:10px;margin-top:0;letter-spacing:-.01em;}
.ph-title em{font-style:italic;color:var(--gold-deep);}
.ph-sub{font-family:'Cormorant Garamond',serif;font-size:12px;color:var(--ink-light);margin-top:10px;}
.profile-ring{width:100%;aspect-ratio:1;border-radius:50%;overflow:hidden;border:3px solid var(--gold);box-shadow:0 4px 20px rgba(38,29,18,.14),0 0 0 5px rgba(201,168,124,.1);max-width:140px;margin:0 auto;display:block;}
.profile-ring img{width:100%;height:100%;object-fit:cover;display:block;}

/* ── STAT CARDS (right col) ── */
.sc{background:var(--ivory);border:1px solid var(--border);border-radius:11px;padding:18px 20px;cursor:pointer;transition:all .2s;box-shadow:var(--shadow);position:relative;overflow:hidden;text-align:left;}
.sc::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--c1),var(--c2));}
.sc:hover{transform:translateY(-2px);box-shadow:var(--shadow-lg);}
.sl{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:12px;color:var(--ink-light);margin-bottom:6px;}
.sn{font-family:'Playfair Display',serif;font-size:30px;font-weight:600;line-height:1;}
.ss{font-size:10px;color:var(--ink-light);margin-top:4px;}

/* ── FITNESS RINGS ── */
.ring-wrap{display:flex;align-items:center;gap:18px;}
.ring-legend{display:flex;flex-direction:column;gap:8px;flex:1;}
.ring-legend-row{display:flex;align-items:center;gap:7px;}
.ring-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;}
.ring-lbl{font-family:'DM Sans',sans-serif;font-size:11px;color:var(--ink-light);flex:1;}
.ring-val{font-family:'Cormorant Garamond',serif;font-size:13px;color:var(--ink);font-weight:400;}
.ring-sync{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:12px;color:var(--ink-light);text-align:center;margin-top:10px;}

/* ── QUOTE CARD ── */
.qc{background:var(--ink);border-radius:16px;padding:24px 28px;box-shadow:var(--shadow-lg);position:relative;overflow:hidden;}
.qc::after{content:'"';position:absolute;right:18px;top:-8px;font-family:'Playfair Display',serif;font-size:90px;color:rgba(201,168,124,.08);line-height:1;pointer-events:none;}
.qt{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:16.5px;color:#f0e8dc;line-height:1.75;margin-bottom:10px;}
.qa{font-size:10px;color:rgba(201,168,124,.6);letter-spacing:.12em;font-family:'DM Sans',sans-serif;}

/* ── UPCOMING EVENTS ── */
.ue{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;border:1px solid var(--border);background:var(--parchment);margin-bottom:6px;transition:all .18s;cursor:pointer;border-left-width:3px;}
.ue:hover{opacity:.85;}
.ue-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.ue-name{font-size:12.5px;color:var(--ink);text-align:left;}
.ue-date{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:11px;color:var(--ink-light);margin-top:1px;text-align:left;}
.ue-away{font-size:9px;color:var(--ink-light);background:var(--gold-pale);padding:2px 7px;border-radius:10px;white-space:nowrap;}

/* ── POMODORO TIMER ── */
.pomo-wrap{display:flex;flex-direction:column;align-items:center;gap:14px;}
.pomo-presets{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;}
.pomo-preset{padding:5px 11px;border-radius:20px;border:1px solid var(--border);background:transparent;font-family:'DM Sans',sans-serif;font-size:11px;color:var(--ink-light);cursor:pointer;transition:all .18s;}
.pomo-preset:hover,.pomo-preset.on{background:var(--ink);color:#f0e8dc;border-color:var(--ink);}
.pomo-svg{filter:drop-shadow(0 2px 8px rgba(201,168,124,.18));}
.pomo-btns{display:flex;gap:8px;}
.pomo-btn{padding:8px 22px;border-radius:20px;border:none;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;cursor:pointer;transition:all .18s;letter-spacing:.02em;}
.pomo-btn.start{background:var(--ink);color:#f4ede3;}
.pomo-btn.start:hover{background:var(--gold-deep);}
.pomo-btn.pause{background:var(--parchment);color:var(--ink);border:1px solid var(--border);}
.pomo-btn.pause:hover{background:var(--gold-pale);}
.pomo-btn.stop{background:transparent;color:var(--ink-light);border:1px solid var(--border);}
.pomo-btn.stop:hover{background:#fde8e8;color:#c05050;border-color:#fde8e8;}

/* ── HABITS ── */
.hr{display:flex;align-items:center;padding:4px 6px;border-radius:10px;transition:background .15s;gap:4px;}
.hr:hover{background:rgba(201,168,124,.06);}
.hi{display:flex;align-items:center;gap:9px;width:165px;flex-shrink:0;}
.hib{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;cursor:pointer;transition:transform .15s;}
.hib:hover{transform:scale(1.15);}
.hn{font-size:12.5px;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:110px;cursor:pointer;}
.hd{display:flex;gap:5px;flex:1;}
.hday{width:32px;height:32px;border-radius:8px;border:1.5px solid var(--border);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0;}
.hday:hover{border-color:var(--gold);}
.hday.ck{border-color:transparent;color:white;}
.hday.ck::after{content:"✓";font-size:12px;}
.hst{width:36px;text-align:right;font-family:'Cormorant Garamond',serif;font-size:12px;color:var(--ink-light);font-style:italic;flex-shrink:0;}
.ha{display:flex;gap:2px;opacity:0;transition:opacity .15s;}
.hr:hover .ha{opacity:1;}
.dh{display:flex;align-items:center;margin-bottom:6px;}
.dsp{width:165px;flex-shrink:0;}
.dls{display:flex;gap:5px;}
.dl{width:32px;text-align:center;font-size:9px;color:var(--ink-light);}
.ip-wrap{position:relative;display:inline-block;}
.ip{position:absolute;top:calc(100% + 8px);left:0;z-index:600;background:var(--ivory);border:1px solid var(--border);border-radius:14px;padding:12px;box-shadow:var(--shadow-lg);display:grid;grid-template-columns:repeat(6,1fr);gap:5px;width:228px;}
.io{width:32px;height:32px;border-radius:7px;border:1px solid transparent;background:transparent;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all .15s;}
.io:hover{background:var(--gold-pale);border-color:var(--gold);}
.io.sel{background:var(--gold-pale);border-color:var(--gold-deep);}
.ii{font-size:12.5px;border:none;border-bottom:1.5px solid var(--gold);background:transparent;color:var(--ink);outline:none;width:110px;font-family:'DM Sans',sans-serif;padding:1px 2px;}
.gs{margin-top:28px;padding-top:22px;border-top:1px solid var(--border);}
.gt{font-family:'Playfair Display',serif;font-size:14px;color:var(--ink);margin-bottom:16px;}
.bc{display:flex;align-items:flex-end;gap:8px;height:110px;padding:0 4px;}
.bcol{display:flex;flex-direction:column;align-items:center;gap:5px;flex:1;}
.bar{width:100%;border-radius:6px 6px 0 0;transition:height .45s ease;min-height:3px;}
.bl{font-size:9px;color:var(--ink-light);}
.bv{font-family:'Playfair Display',serif;font-size:11px;color:var(--ink-light);}
.ar{margin-top:18px;padding-top:18px;border-top:1px solid var(--border);}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
.inp{flex:1;min-width:120px;padding:10px 14px;border:1px solid var(--border);border-radius:9px;background:var(--parchment);font-family:'DM Sans',sans-serif;font-size:13px;color:var(--ink);outline:none;transition:border-color .2s;}
.inp:focus{border-color:var(--gold);}
.inp::placeholder{color:rgba(122,98,82,.4);}
.sel{padding:10px 12px;border:1px solid var(--border);border-radius:9px;background:var(--parchment);font-family:'DM Sans',sans-serif;font-size:12px;color:var(--ink);outline:none;cursor:pointer;}
.bp{padding:10px 20px;background:var(--ink);color:#f4ede3;border:none;border-radius:20px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;cursor:pointer;transition:background .2s;white-space:nowrap;letter-spacing:.02em;}
.bp:hover{background:var(--gold-deep);}
.sb2{background:none;border:none;cursor:pointer;padding:3px 7px;border-radius:6px;font-size:12px;transition:all .15s;color:var(--ink-light);line-height:1;}
.sb2:hover{background:var(--gold-pale);color:var(--gold-deep);}
.sb2.d:hover{background:#fde8e8;color:#c05050;}
.tb{display:flex;align-items:center;gap:7px;margin-bottom:16px;flex-wrap:wrap;}
.pb{padding:5px 13px;border-radius:20px;border:1px solid var(--border);background:transparent;font-family:'DM Sans',sans-serif;font-size:11.5px;color:var(--ink-light);cursor:pointer;transition:all .18s;white-space:nowrap;}
.pb:hover,.pb.on{background:var(--ink);color:#f0e8dc;border-color:var(--ink);}
.pb.ton{background:var(--gold-pale);color:var(--gold-deep);border-color:var(--gold);}
.tl{display:flex;flex-direction:column;gap:7px;}
.ti{display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:8px;border:1px solid var(--border);background:var(--parchment);transition:all .18s;}
.ti:hover{border-color:var(--gold);}
.ti.dn{opacity:.4;}
.tc{width:20px;height:20px;border-radius:50%;border:1.5px solid rgba(122,98,82,.3);flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;}
.ti.dn .tc{background:var(--sage);border-color:var(--sage);}
.ti.dn .tc::after{content:"✓";font-size:11px;color:white;}
.tb2{flex:1;min-width:0;}
.tt{font-size:13.5px;color:var(--ink);font-weight:300;cursor:pointer;text-align:left;}
.ti.dn .tt{text-decoration:line-through;}
.tm{display:flex;align-items:center;gap:6px;margin-top:3px;flex-wrap:wrap;}
.tdl{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:11px;color:var(--ink-light);}
.tg{padding:1px 8px;border-radius:10px;font-size:10px;font-weight:500;background:var(--gold-pale);color:var(--gold-deep);border:1px solid rgba(201,168,124,.3);}
.tg.Work{background:#dde8f0;color:#3a6080;}
.tg.Fitness{background:#ddf0e4;color:#3a6a4a;}
.tg.Health{background:#f0dde8;color:#804060;}
.tg.Creative{background:#f0ead8;color:#806030;}
.td{opacity:0;background:none;border:none;color:var(--ink-light);cursor:pointer;font-size:17px;padding:0 3px;transition:all .15s;flex-shrink:0;}
.ti:hover .td{opacity:1;}
.td:hover{color:#c05050;}
.te{opacity:0;background:none;border:none;color:var(--ink-light);cursor:pointer;font-size:13px;padding:0 4px;transition:all .15s;flex-shrink:0;}
.ti:hover .te{opacity:1;}
.te:hover{color:var(--gold-deep);}
.hg{margin-bottom:10px;}
.ht{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--parchment);border:1px solid var(--border);border-radius:10px;cursor:pointer;}
.ht:hover{background:var(--gold-pale);}
.hl{font-family:'Playfair Display',serif;font-size:13px;color:var(--ink);}
.hc{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:12px;color:var(--ink-light);}
.hav{font-size:10px;color:var(--ink-light);transition:transform .2s;}
.hav.op{transform:rotate(180deg);}
.his{padding:8px 0 0;display:flex;flex-direction:column;gap:6px;}
.tr{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:12px;}
.tch{display:flex;align-items:center;gap:5px;padding:4px 11px;border-radius:15px;font-size:11px;font-weight:500;background:var(--gold-pale);color:var(--gold-deep);border:1px solid rgba(201,168,124,.3);}
.tcd{background:none;border:none;cursor:pointer;color:var(--ink-light);font-size:13px;line-height:1;padding:0;}
.tcd:hover{color:#c05050;}
.gmh{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
.gml{font-family:'Playfair Display',serif;font-size:18px;color:var(--ink);}
.mnb{padding:6px 14px;background:transparent;border:1px solid var(--border);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:12px;color:var(--ink-light);cursor:pointer;transition:all .18s;}
.mnb:hover{background:var(--gold-pale);border-color:var(--gold);}
.mnb:disabled{opacity:.3;cursor:not-allowed;}
.gg{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.gc{background:var(--ivory);border:1px solid var(--border);border-radius:14px;padding:22px;position:relative;overflow:hidden;box-shadow:var(--shadow);transition:transform .2s,box-shadow .2s;}
.gc:hover{transform:translateY(-2px);box-shadow:var(--shadow-lg);}
.gac{position:absolute;top:0;left:0;right:0;height:3px;border-radius:14px 14px 0 0;}
.gct{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;}
.gcat{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:11px;color:var(--ink-light);}
.gca{display:flex;gap:2px;opacity:0;transition:opacity .15s;}
.gc:hover .gca{opacity:1;}
.gtit{font-family:'Playfair Display',serif;font-size:16px;color:var(--ink);margin-bottom:14px;line-height:1.35;}
.pb2{height:5px;background:var(--parchment);border-radius:10px;margin-bottom:7px;overflow:hidden;}
.pf{height:100%;border-radius:10px;transition:width .5s ease;}
.pr{display:flex;justify-content:space-between;margin-bottom:14px;}
.pp{font-family:'Playfair Display',serif;font-size:12px;color:var(--ink-light);}
.gd{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:11px;color:var(--ink-light);}
.ms{display:flex;flex-direction:column;gap:5px;}
.mi{display:flex;align-items:center;gap:7px;font-size:12px;color:var(--ink-light);cursor:pointer;padding:2px 0;}
.md2{width:6px;height:6px;border-radius:50%;background:var(--border);flex-shrink:0;transition:background .2s;}
.mi.dm .md2{background:var(--sage);}
.mi.dm span{text-decoration:line-through;opacity:.5;}
.gadd{background:transparent;border:1.5px dashed rgba(38,29,18,.12);border-radius:14px;padding:22px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;color:var(--ink-light);gap:6px;min-height:180px;}
.gadd:hover{border-color:var(--gold);color:var(--gold-deep);background:rgba(201,168,124,.04);}
.gf{background:var(--ivory);border:1.5px solid var(--gold);border-radius:14px;padding:22px;display:flex;flex-direction:column;gap:11px;box-shadow:var(--shadow-lg);}
.gft{font-family:'Playfair Display',serif;font-size:15px;color:var(--ink);}
.fr{display:flex;gap:9px;}
.fg{display:flex;flex-direction:column;flex:1;gap:4px;}
.fl{font-size:11px;color:var(--ink-light);}
.ri{width:100%;accent-color:var(--gold-deep);cursor:pointer;}
.fbr{display:flex;gap:8px;justify-content:flex-end;margin-top:4px;}
.bc2{padding:8px 15px;background:transparent;border:1px solid var(--border);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:12px;color:var(--ink-light);cursor:pointer;}
.bs{padding:8px 18px;background:var(--ink);border:none;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;color:#f4ede3;cursor:pointer;}
.bs:hover{background:var(--gold-deep);}
.cg{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
.cd{background:var(--ivory);border:1px solid var(--border);border-radius:12px;padding:16px;box-shadow:var(--shadow);}
.cd.td2{border-color:var(--gold);background:var(--gold-pale);}
.cdn{font-family:'Playfair Display',serif;font-size:13px;color:var(--ink);margin-bottom:10px;display:flex;align-items:center;gap:6px;text-align:left;}
.tdb{font-size:9px;padding:2px 7px;background:var(--gold);color:white;border-radius:10px;font-family:'DM Sans',sans-serif;font-weight:500;}
.ctk{display:flex;align-items:center;gap:7px;margin-bottom:5px;}
.cck{width:16px;height:16px;border-radius:4px;border:1.5px solid var(--border);flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s;cursor:pointer;}
.ctk.dc .cck{background:var(--sage);border-color:var(--sage);}
.ctk.dc .cck::after{content:"✓";font-size:9px;color:white;}
.ctxt{font-size:12px;color:var(--ink-light);flex:1;text-align:left;}
.ctk.dc .ctxt{text-decoration:line-through;opacity:.5;}
.cdel{opacity:0;background:none;border:none;cursor:pointer;color:var(--ink-light);font-size:13px;padding:0 2px;}
.ctk:hover .cdel{opacity:1;}
.cdel:hover{color:#c05050;}
.car{display:flex;gap:6px;margin-top:10px;padding-top:10px;border-top:1px solid var(--border);}
.cai{flex:1;padding:6px 10px;border:1px solid var(--border);border-radius:7px;background:var(--parchment);font-family:'DM Sans',sans-serif;font-size:11px;color:var(--ink);outline:none;}
.cai:focus{border-color:var(--gold);}
.cab{padding:6px 10px;background:var(--ink);color:#f4ede3;border:none;border-radius:7px;font-size:11px;cursor:pointer;}
.cab:hover{background:var(--gold-deep);}
.cah{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;}
.caml{font-family:'Playfair Display',serif;font-size:22px;color:var(--ink);}
.cnb{padding:8px 16px;background:transparent;border:1px solid var(--border);border-radius:9px;font-family:'DM Sans',sans-serif;font-size:12px;color:var(--ink-light);cursor:pointer;transition:all .18s;}
.cnb:hover{background:var(--gold-pale);border-color:var(--gold);}
.cagd{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:1px;background:var(--border);border-radius:12px;overflow:hidden;border:1px solid var(--border);}
.cadh{background:var(--parchment);padding:10px 0;text-align:center;font-size:10px;letter-spacing:.1em;color:var(--ink-light);font-weight:500;text-transform:uppercase;}
.cac{background:var(--ivory);height:95px;padding:8px;cursor:pointer;transition:background .15s;overflow:hidden;}
.cac:hover{background:var(--gold-pale);}
.cac.om{background:#f7f2ec;opacity:.5;}
.cac.tc2{background:var(--gold-pale);}
.dn2{font-family:'Playfair Display',serif;font-size:13px;color:var(--ink-light);margin-bottom:4px;width:22px;height:22px;display:flex;align-items:center;justify-content:center;}
.cac.tc2 .dn2{background:var(--gold);color:white;border-radius:50%;}
.cep{font-size:10px;padding:2px 6px;border-radius:5px;color:white;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;text-align:left;}
.cep:hover{opacity:.8;}
.cm{font-size:10px;color:var(--ink-light);font-family:'Cormorant Garamond',serif;font-style:italic;}
.mo{position:fixed;inset:0;background:rgba(38,29,18,.45);z-index:800;display:flex;align-items:center;justify-content:center;padding:20px;}
.mod{background:var(--ivory);border-radius:18px;padding:32px;width:100%;max-width:460px;box-shadow:var(--shadow-lg);position:relative;}
.mdt{font-family:'Playfair Display',serif;font-size:20px;color:var(--ink);margin-bottom:20px;}
.mcl{position:absolute;top:18px;right:20px;background:none;border:none;font-size:20px;cursor:pointer;color:var(--ink-light);line-height:1;}
.mcl:hover{color:#c05050;}
.mf{display:flex;flex-direction:column;gap:5px;margin-bottom:14px;}
.mlb{font-size:11px;color:var(--ink-light);letter-spacing:.05em;}
.mi2{padding:10px 14px;border:1px solid var(--border);border-radius:9px;background:var(--parchment);font-family:'DM Sans',sans-serif;font-size:13px;color:var(--ink);outline:none;}
.mi2:focus{border-color:var(--gold);}
.cr{display:flex;gap:8px;flex-wrap:wrap;}
.cs2{width:26px;height:26px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:transform .15s;}
.cs2:hover{transform:scale(1.15);}
.cs2.sel{border-color:var(--ink);}
.mft{display:flex;justify-content:space-between;align-items:center;margin-top:20px;}
.pt{position:fixed;bottom:30px;right:30px;background:var(--ink);color:#f0e8dc;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:16px;padding:14px 24px;border-radius:12px;box-shadow:var(--shadow-lg);border-left:3px solid var(--gold);z-index:999;animation:su .35s ease,fo .4s ease 2.6s forwards;pointer-events:none;}
@keyframes su{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes fo{to{opacity:0;transform:translateY(-8px)}}
.emp{text-align:center;padding:24px 0;font-family:'Cormorant Garamond',serif;font-style:italic;color:var(--ink-light);font-size:13px;}
.bil-tabs{display:flex;gap:4px;margin-bottom:20px;}
.bil-tab{padding:6px 18px;border-radius:20px;border:1px solid var(--border);background:transparent;font-family:'DM Sans',sans-serif;font-size:12px;color:var(--ink-light);cursor:pointer;transition:all .18s;}
.bil-tab.on{background:var(--ink);color:#f0e8dc;border-color:var(--ink);}
.bil-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
.bil-score{font-family:'Playfair Display',serif;font-size:68px;font-weight:600;line-height:1;}
.bil-bar{height:7px;background:var(--parchment);border-radius:8px;overflow:hidden;margin:5px 0 2px;}
.bil-fill{height:100%;border-radius:8px;transition:width .7s ease;}
.bil-row{display:flex;align-items:center;gap:10px;margin-bottom:11px;}
.bil-lbl{font-size:12px;color:var(--ink-light);min-width:90px;flex-shrink:0;}
.bil-pct{font-family:'Playfair Display',serif;font-size:13px;color:var(--ink);margin-left:auto;flex-shrink:0;}
.bil-dots{display:flex;gap:4px;margin-top:6px;}
.bil-d{width:20px;height:20px;border-radius:5px;border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:8px;color:var(--ink-light);flex-shrink:0;}
.bil-d.ck{border-color:transparent;color:white;}
.bil-chart{display:flex;align-items:flex-end;gap:5px;height:72px;margin-top:8px;}
.bil-col{display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;}
.bil-cbar{width:100%;border-radius:4px 4px 0 0;min-height:2px;transition:height .5s ease;}
.bil-clbl{font-size:8px;color:var(--ink-light);}
.bil-cval{font-family:'Playfair Display',serif;font-size:9px;color:var(--ink-light);}
@media(max-width:700px){.bil-grid{grid-template-columns:1fr;}}
.todo-grid{display:grid;grid-template-columns:1fr 270px;gap:18px;align-items:start;}
.todo-main{display:flex;flex-direction:column;gap:18px;}
.todo-side{display:flex;flex-direction:column;gap:18px;position:sticky;top:calc(var(--nav-h) + 36px);}
@media(max-width:900px){.todo-grid{grid-template-columns:1fr;}.todo-side{position:static;}}
.pri{display:inline-flex;align-items:center;padding:1px 7px;border-radius:10px;font-size:9.5px;font-weight:500;letter-spacing:.02em;}
.pri.high{background:#fde8e8;color:#c05050;border:1px solid rgba(192,80,80,.2);}
.pri.medium{background:var(--gold-pale);color:var(--gold-deep);border:1px solid rgba(201,168,124,.3);}
.pri.low{background:#e8f0e8;color:#506840;border:1px solid rgba(80,104,64,.2);}
.dash-toggle{display:flex;gap:4px;margin-bottom:12px;}
.dash-tog{padding:4px 12px;border-radius:16px;border:1px solid var(--border);background:transparent;font-family:'DM Sans',sans-serif;font-size:11px;color:var(--ink-light);cursor:pointer;transition:all .18s;}
.dash-tog.on{background:var(--ink);color:#f0e8dc;border-color:var(--ink);}
.pri-row{display:flex;gap:5px;align-items:center;margin-bottom:8px;}
.pri-lbl{font-size:10.5px;color:var(--ink-light);}
.pri-btn{padding:3px 10px;border-radius:14px;border:1px solid var(--border);background:transparent;font-family:'DM Sans',sans-serif;font-size:10.5px;color:var(--ink-light);cursor:pointer;transition:all .15s;}
.pri-btn.on{color:white;border-color:transparent;}
.adrow{display:flex;align-items:center;gap:8px;margin-bottom:14px;}
.adrow input[type=checkbox]{width:15px;height:15px;accent-color:var(--gold-deep);cursor:pointer;}
.adrow label{font-size:11px;color:var(--ink-light);letter-spacing:.05em;cursor:pointer;}
::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:rgba(201,168,124,.3);border-radius:10px;}

/* ── RESPONSIVE ── */
@media(max-width:1200px){.dash-grid{grid-template-columns:240px 1fr 240px;}}
@media(max-width:960px){
  .dash-grid{grid-template-columns:1fr 1fr;gap:14px;}
  .dash-col:nth-child(2){grid-column:1/-1;}
  .main{padding:calc(var(--nav-h) + 20px) 14px 48px;}
  .topnav{padding:0 16px;gap:10px;}
  .tn-dt{display:none;}
  .gg{grid-template-columns:1fr 1fr;}
}
@media(max-width:700px){
  .dash-grid{grid-template-columns:1fr;gap:12px;}
  .dash-col:nth-child(2){grid-column:1;}
  .main{padding:calc(var(--nav-h) + 12px) 10px 48px;}
  .topnav{padding:0 10px;gap:4px;}
  .tn-brand,.tn-divider{display:none;}
  .tn-links{overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
  .tn-links::-webkit-scrollbar{display:none;}
  .ni-label{display:none;}
  .ni{padding:9px 12px;}
  .cg{grid-template-columns:1fr 1fr;}
  .gg{grid-template-columns:1fr;}
}
@media(max-width:480px){.cg{grid-template-columns:1fr;}.gg{grid-template-columns:1fr;}}
`;

export default function App() {
  const [page,setPage]=useState("dashboard");
  const [habits,setHabits]=useDB("sab_habits",DEF_HABITS);
  const [tags,setTags]=useDB("sab_tags",DEF_TAGS);
  const [todos,setTodos]=useDB("sab_todos",[]);
  const [goals,setGoals]=useDB("sab_goals",{});
  const [cleaning,setCleaning]=useDB("sab_clean",DEF_CLEANING);
  const [events,setEvents]=useDB("sab_events",[]);
  const [newHabit,setNewHabit]=useState("");
  const [editHabit,setEditHabit]=useState(null);
  const [editHName,setEditHName]=useState("");
  const [iconFor,setIconFor]=useState(null);
  const [newTodo,setNewTodo]=useState("");
  const [newTodoTag,setNewTodoTag]=useState("Personal");
  const [newTodoPriority,setNewTodoPriority]=useState("medium");
  const [dashTodoDay,setDashTodoDay]=useState("today");
  const [tFilter,setTFilter]=useState("active");
  const [tagFilter,setTagFilter]=useState("all");
  const [showHist,setShowHist]=useState({});
  const [showTomorrow,setShowTomorrow]=useState(false);
  const [editTodoId,setEditTodoId]=useState(null);
  const [editTodoTxt,setEditTodoTxt]=useState("");
  const [liveDate,setLiveDate]=useState(()=>new Date().toISOString().split("T")[0]);
  const [newTag,setNewTag]=useState("");
  const [vMonth,setVMonth]=useState(MK);
  const [goalForm,setGoalForm]=useState(null);
  const [gDraft,setGDraft]=useState({title:"",category:"",deadline:"",progress:0,milestones:["","","",""]});
  const [cInputs,setCInputs]=useState(Object.fromEntries(DAYS.map(d=>[d,""])));
  const [editC,setEditC]=useState(null);
  const [editCTxt,setEditCTxt]=useState("");
  const [calYear,setCalYear]=useState(NOW.getFullYear());
  const [calMonth,setCalMonth]=useState(NOW.getMonth());
  const [evModal,setEvModal]=useState(null);
  const [evDraft,setEvDraft]=useState({title:"",date:"",time:"",notes:"",color:"#c9a87c",allDay:false});
  const [praise,setPraise]=useState(null);
  const [pomoCount,setPomoCount]=useDB("sab_pomo",0);
  const [habitsWeekKey,setHabitsWeekKey]=useDB("sab_habits_week","");
  const [habitsArchive,setHabitsArchive]=useDB("sab_habits_archive",{});
  const [cleanWeekKey,setCleanWeekKey]=useDB("sab_clean_week","");
  const [cleanArchive,setCleanArchive]=useDB("sab_clean_archive",{});
  const [resetVersion,setResetVersion]=useDB("sab_reset_v",0);
  const [fitMove,setFitMove]=useDB("sab_fitness_move",null);
  const [fitEx,setFitEx]=useDB("sab_fitness_ex",null);
  const [fitStand,setFitStand]=useDB("sab_fitness_stand",null);
  const [fitDate,setFitDate]=useDB("sab_fitness_date","");
  const [bilView,setBilView]=useState("week");

  // Pomodoro timer state
  const [pomoDur,setPomoDur]=useState(1500);
  const [pomoLeft,setPomoLeft]=useState(1500);
  const [pomoActive,setPomoActive]=useState(false);
  const pomoInterval=useRef(null);
  const pomoEndTime=useRef(null);

  const pt=useRef(null);
  const ac=useRef(null);

  useEffect(()=>{const h=()=>setIconFor(null);document.addEventListener("click",h);return()=>document.removeEventListener("click",h);},[]);
  useEffect(()=>()=>clearInterval(pomoInterval.current),[]);
  // Snap pomo time when tab becomes visible again (avoids throttled intervals)
  useEffect(()=>{
    const onVis=()=>{
      if(!document.hidden&&pomoEndTime.current){
        const rem=Math.round((pomoEndTime.current-Date.now())/1000);
        if(rem<=0){clearInterval(pomoInterval.current);setPomoActive(false);setPomoCount(c=>c+1);chime();setPomoLeft(0);pomoEndTime.current=null;}
        else setPomoLeft(rem);
      }
    };
    document.addEventListener("visibilitychange",onVis);
    return()=>document.removeEventListener("visibilitychange",onVis);
  },[]);// eslint-disable-line react-hooks/exhaustive-deps
  useEffect(()=>{const t=setInterval(()=>{const d=new Date().toISOString().split("T")[0];setLiveDate(p=>p!==d?d:p);},30000);return()=>clearInterval(t);},[]);
  // Shadow module-level date constants with live reactive versions
  const TODAY=liveDate;
  const TOMORROW=new Date(new Date(liveDate+"T12:00:00").getTime()+86400000).toISOString().split("T")[0];
  const TODAY_DAY=DAYS[new Date(liveDate+"T12:00:00").getDay()===0?6:new Date(liveDate+"T12:00:00").getDay()-1];

  // Weekly habit reset — archive last week, reset days to false
  useEffect(()=>{
    const wk=isoWeekKey(TODAY);
    if(habitsWeekKey&&habitsWeekKey!==wk){
      setHabitsArchive(a=>({...a,[habitsWeekKey]:habits.map(h=>({id:h.id,name:h.name,days:[...h.days]}))}));
      setHabits(h=>h.map(hab=>({...hab,days:Array(7).fill(false)})));
    }
    if(!habitsWeekKey||habitsWeekKey!==wk)setHabitsWeekKey(wk);
  },[TODAY]);// eslint-disable-line react-hooks/exhaustive-deps

  // Weekly cleaning reset — archive last week, uncheck all tasks
  useEffect(()=>{
    const wk=isoWeekKey(TODAY);
    if(cleanWeekKey&&cleanWeekKey!==wk){
      setCleanArchive(a=>({...a,[cleanWeekKey]:JSON.parse(JSON.stringify(cleaning))}));
      setCleaning(c=>Object.fromEntries(Object.entries(c).map(([d,ts])=>[d,ts.map(t=>({...t,done:false}))])));
    }
    if(!cleanWeekKey||cleanWeekKey!==wk)setCleanWeekKey(wk);
  },[TODAY]);// eslint-disable-line react-hooks/exhaustive-deps

  // Pomodoro controls
  const pomoStart=()=>{
    if(pomoActive||pomoLeft===0)return;
    pomoBegin();
    pomoEndTime.current=Date.now()+pomoLeft*1000;
    setPomoActive(true);
    pomoInterval.current=setInterval(()=>{
      const rem=Math.round((pomoEndTime.current-Date.now())/1000);
      if(rem<=0){clearInterval(pomoInterval.current);setPomoActive(false);setPomoCount(c=>c+1);chime();setPomoLeft(0);pomoEndTime.current=null;}
      else setPomoLeft(rem);
    },500);
  };
  const pomoPause=()=>{clearInterval(pomoInterval.current);setPomoActive(false);pomoEnd();pomoEndTime.current=null;};
  const pomoStop=()=>{clearInterval(pomoInterval.current);setPomoActive(false);setPomoLeft(pomoDur);pomoEnd();pomoEndTime.current=null;};
  const pomoSelect=s=>{clearInterval(pomoInterval.current);setPomoActive(false);setPomoDur(s);setPomoLeft(s);};

  const pomoProg=pomoDur>0?pomoLeft/pomoDur:0;
  const pomoDash=POMO_CIRC*pomoProg;
  const pomoColor=pomoProg>0.5?"#c9a87c":pomoProg>0.25?"#c8887a":"#c05050";

  const chime=()=>{try{if(!ac.current)ac.current=new(window.AudioContext||window.webkitAudioContext)();const ctx=ac.current;[523.25,659.25,783.99].forEach((freq,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type="sine";o.frequency.value=freq;g.gain.setValueAtTime(0,ctx.currentTime+i*.18);g.gain.linearRampToValueAtTime(.18,ctx.currentTime+i*.18+.05);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+i*.18+.5);o.start(ctx.currentTime+i*.18);o.stop(ctx.currentTime+i*.18+.5);});}catch(e){}};
  const pomoBegin=()=>{try{if(!ac.current)ac.current=new(window.AudioContext||window.webkitAudioContext)();const ctx=ac.current;[440,554.37,659.25].forEach((freq,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type="sine";o.frequency.value=freq;g.gain.setValueAtTime(0,ctx.currentTime+i*.14);g.gain.linearRampToValueAtTime(.15,ctx.currentTime+i*.14+.04);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+i*.14+.35);o.start(ctx.currentTime+i*.14);o.stop(ctx.currentTime+i*.14+.35);});}catch(e){}};
  const pomoEnd=()=>{try{if(!ac.current)ac.current=new(window.AudioContext||window.webkitAudioContext)();const ctx=ac.current;[659.25,523.25,392].forEach((freq,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type="sine";o.frequency.value=freq;g.gain.setValueAtTime(0,ctx.currentTime+i*.16);g.gain.linearRampToValueAtTime(.13,ctx.currentTime+i*.16+.04);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+i*.16+.4);o.start(ctx.currentTime+i*.16);o.stop(ctx.currentTime+i*.16+.4);});}catch(e){}};
  const shout=()=>{setPraise(PRAISE[Math.floor(Math.random()*PRAISE.length)]);clearTimeout(pt.current);pt.current=setTimeout(()=>setPraise(null),3000);chime();};

  const toggleDay=(id,i)=>setHabits(h=>h.map(hab=>{if(hab.id!==id)return hab;const was=hab.days[i];if(!was)chime();return{...hab,days:hab.days.map((d,j)=>j===i?!d:d)};}));
  const delHabit=id=>setHabits(h=>h.filter(hab=>hab.id!==id));
  const addHabit=()=>{if(!newHabit.trim())return;const idx=habits.length%HCOLORS.length;setHabits(h=>[...h,{id:Date.now(),name:newHabit,icon:HICONS[idx],color:HCOLORS[idx],days:Array(7).fill(false)}]);setNewHabit("");};
  const startEH=h=>{setEditHabit(h.id);setEditHName(h.name);};
  const saveEH=id=>{if(editHName.trim())setHabits(h=>h.map(hab=>hab.id===id?{...hab,name:editHName}:hab));setEditHabit(null);};
  const setIcon=(id,icon)=>{setHabits(h=>h.map(hab=>hab.id===id?{...hab,icon}:hab));setIconFor(null);};
  const streak=days=>days.filter(Boolean).length;

  const byPri=arr=>[...arr].sort((a,b)=>(PRIORITY_ORD[a.priority??"medium"])-(PRIORITY_ORD[b.priority??"medium"]));
  const addTodoFor=date=>{if(!newTodo.trim())return;setTodos(t=>[...t,{id:Date.now(),text:newTodo,done:false,tag:newTodoTag,date,priority:newTodoPriority}]);setNewTodo("");};
  const addTodo=()=>addTodoFor(TODAY);
  const addTodoDash=()=>addTodoFor(dashTodoDay==="today"?TODAY:TOMORROW);
  const toggleTodo=id=>setTodos(t=>t.map(td=>{if(td.id!==id)return td;if(!td.done)shout();return{...td,done:!td.done};}));
  const delTodo=id=>setTodos(t=>t.filter(td=>td.id!==id));
  const startEditTodo=todo=>{setEditTodoId(todo.id);setEditTodoTxt(todo.text);};
  const saveEditTodo=()=>{if(editTodoTxt.trim())setTodos(t=>t.map(td=>td.id===editTodoId?{...td,text:editTodoTxt}:td));setEditTodoId(null);};
  const addTag=()=>{if(!newTag.trim()||tags.includes(newTag.trim()))return;setTags(t=>[...t,newTag.trim()]);setNewTag("");};
  const delTag=tag=>{setTags(t=>t.filter(x=>x!==tag));if(tagFilter===tag)setTagFilter("all");};

  const todayTodos=todos.filter(t=>t.date===TODAY);
  const tomorrowTodos=todos.filter(t=>t.date===TOMORROW);
  const filtTodos=byPri(todayTodos.filter(t=>{const s=tFilter==="all"||(tFilter==="active"?!t.done:t.done);const tg=tagFilter==="all"||t.tag===tagFilter;return s&&tg;}));
  const pastDates=[...new Set(todos.filter(t=>t.date!==TODAY&&t.date!==TOMORROW).map(t=>t.date))].sort((a,b)=>b.localeCompare(a));

  const vmDate=new Date(vMonth+"-02");
  const vmLabel=`${MONTHS[vmDate.getMonth()]} ${vmDate.getFullYear()}`;
  const mGoals=goals[vMonth]||[];
  const pmG=()=>{const d=new Date(vMonth+"-02");d.setMonth(d.getMonth()-1);setVMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`);};
  const nmG=()=>{const d=new Date(vMonth+"-02");d.setMonth(d.getMonth()+1);const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;if(k<=MK)setVMonth(k);};
  const openAddG=()=>{setGDraft({title:"",category:"",deadline:"",progress:0,milestones:["","","",""]});setGoalForm({mode:"add"});};
  const openEditG=g=>{setGDraft({title:g.title,category:g.category,deadline:g.deadline,progress:g.progress,milestones:[...g.milestones.map(m=>m.text),...Array(4)].slice(0,4).map(m=>m||"")});setGoalForm({mode:"edit",id:g.id});};
  const saveGoal=()=>{if(!gDraft.title.trim())return;const ms=gDraft.milestones.filter(m=>m.trim()).map(m=>({text:m,done:false}));if(goalForm.mode==="add"){const ex=goals[vMonth]||[];setGoals(p=>({...p,[vMonth]:[...ex,{id:Date.now(),...gDraft,progress:Number(gDraft.progress),milestones:ms,color:HCOLORS[ex.length%HCOLORS.length]}]}));}else{setGoals(p=>({...p,[vMonth]:(p[vMonth]||[]).map(g=>g.id===goalForm.id?{...g,...gDraft,progress:Number(gDraft.progress),milestones:ms}:g)}));}setGoalForm(null);};
  const delGoal=id=>setGoals(p=>({...p,[vMonth]:(p[vMonth]||[]).filter(g=>g.id!==id)}));
  const toggleMs=(gid,mi)=>setGoals(p=>({...p,[vMonth]:(p[vMonth]||[]).map(g=>g.id===gid?{...g,milestones:g.milestones.map((m,i)=>i===mi?{...m,done:!m.done}:m)}:g)}));

  const toggleClean=(day,idx)=>setCleaning(c=>({...c,[day]:c[day].map((t,i)=>i===idx?{...t,done:!t.done}:t)}));
  const delClean=(day,idx)=>setCleaning(c=>({...c,[day]:c[day].filter((_,i)=>i!==idx)}));
  const addClean=day=>{if(!cInputs[day].trim())return;setCleaning(c=>({...c,[day]:[...c[day],{text:cInputs[day],done:false}]}));setCInputs(ci=>({...ci,[day]:""}));};
  const startEC=(day,idx,text)=>{setEditC({day,idx});setEditCTxt(text);};
  const saveEC=()=>{if(!editC)return;const{day,idx}=editC;if(editCTxt.trim())setCleaning(c=>({...c,[day]:c[day].map((t,i)=>i===idx?{...t,text:editCTxt}:t)}));setEditC(null);};

  const calDays=dim(calYear,calMonth);
  const calFirst=fdm(calYear,calMonth);
  const calLabel=`${MONTHS[calMonth]} ${calYear}`;
  const prevCal=()=>{if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1);};
  const nextCal=()=>{if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1);};
  const evOn=ds=>events.filter(e=>e.date===ds);
  const openAddEv=ds=>{setEvDraft({title:"",date:ds,time:"",notes:"",color:"#c9a87c",allDay:false});setEvModal({mode:"add"});};
  const openEditEv=(e,ev)=>{ev.stopPropagation();setEvDraft({title:e.title,date:e.date,time:e.time||"",notes:e.notes||"",color:e.color||"#c9a87c",allDay:e.allDay||false});setEvModal({mode:"edit",id:e.id});};
  const saveEv=()=>{if(!evDraft.title.trim())return;if(evModal.mode==="add")setEvents(ev=>[...ev,{id:Date.now(),...evDraft}]);else setEvents(ev=>ev.map(e=>e.id===evModal.id?{...e,...evDraft}:e));setEvModal(null);};
  const delEv=id=>{setEvents(ev=>ev.filter(e=>e.id!==id));setEvModal(null);};

  // Dashboard computed values
  const habitsToday=habits.filter(h=>h.days[0]).length;
  const todosDone=todos.filter(t=>t.done&&t.date===TODAY).length;
  const allGoals=Object.values(goals).flat();
  const avgProg=allGoals.length?Math.round(allGoals.reduce((a,g)=>a+g.progress,0)/allGoals.length):0;
  const upcoming=events.filter(e=>e.date>=TODAY).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,3).map(e=>({...e,away:Math.round((new Date(e.date+"T00:00:00")-new Date(TODAY+"T00:00:00"))/864e5)}));
  const graphData=DAYS.map((d,i)=>({day:d,count:habits.filter(h=>h.days[i]).length}));
  const maxBar=Math.max(...graphData.map(d=>d.count),1);

  // Bilan computed values
  const bilWeekKey=isoWeekKey(TODAY);
  const bilWeekDates=weekDatesOf(bilWeekKey);
  const bilWeekTodos=todos.filter(t=>bilWeekDates.includes(t.date));
  const bilWeekDone=bilWeekTodos.filter(t=>t.done).length;
  const bilWeekTotal=bilWeekTodos.length;
  const bilTodoPct=bilWeekTotal?Math.round(bilWeekDone/bilWeekTotal*100):0;
  const bilHabitDone=habits.reduce((s,h)=>s+h.days.filter(Boolean).length,0);
  const bilHabitTotal=habits.length*7;
  const bilHabitPct=bilHabitTotal?Math.round(bilHabitDone/bilHabitTotal*100):0;
  const bilCleanDone=DAYS.reduce((s,d)=>s+(cleaning[d]||[]).filter(t=>t.done).length,0);
  const bilCleanTotal=DAYS.reduce((s,d)=>s+(cleaning[d]||[]).length,0);
  const bilCleanPct=bilCleanTotal?Math.round(bilCleanDone/bilCleanTotal*100):0;
  const bilMonthGoals=goals[MK]||[];
  const bilGoalPct=bilMonthGoals.length?Math.round(bilMonthGoals.reduce((s,g)=>s+g.progress,0)/bilMonthGoals.length):0;
  const bilWeekScore=Math.round([bilTodoPct,bilHabitPct,bilCleanPct,bilGoalPct].filter((_,i)=>[bilWeekTotal>0,bilHabitTotal>0,bilCleanTotal>0,bilMonthGoals.length>0][i]).reduce((s,v,_,a)=>s+v/a.length,0)||0);
  const bilVerdict=bilWeekScore>=90?"Semaine parfaite, Sabina ✦":bilWeekScore>=70?"Belle semaine — keep going ✦":bilWeekScore>=50?"Good progress this week ✦":"Every step counts — keep going ✦";
  const last8Weeks=Array.from({length:8},(_,i)=>{const d=new Date(TODAY+"T12:00:00");d.setDate(d.getDate()-7*i);return isoWeekKey(d.toISOString().split("T")[0]);}).reverse();
  const weeklyChart=last8Weeks.map(wk=>{const dates=weekDatesOf(wk);const wt=todos.filter(t=>dates.includes(t.date));const done=wt.filter(t=>t.done).length;const total=wt.length;return{label:wk.replace(/\d{4}-/,""),done,total,pct:total?Math.round(done/total*100):0};});
  const maxChartPct=Math.max(...weeklyChart.map(w=>w.pct),1);

  // Daily progress
  const todayDayIndex=DAYS.indexOf(TODAY_DAY);
  const habitsDoneToday=habits.filter(h=>h.days[todayDayIndex]).length;
  const habitsTotal=habits.length;
  const todosDoneToday=todos.filter(t=>t.done&&t.date===TODAY).length;
  const todosTotalToday=todos.filter(t=>t.date===TODAY).length;
  const cleaningTodayArr=cleaning[TODAY_DAY]||[];
  const cleaningDoneToday=cleaningTodayArr.filter(t=>t.done).length;
  const cleaningTotalToday=cleaningTodayArr.length;
  const monthGoalsArr=goals[MK]||[];
  const monthGoalsAvgPct=monthGoalsArr.length?Math.round(monthGoalsArr.reduce((s,g)=>s+g.progress,0)/monthGoalsArr.length):0;
  const goalWeightV=monthGoalsArr.length>0?1:0;
  const goalDoneV=monthGoalsArr.length>0?monthGoalsAvgPct/100:0;
  const dayTotal=habitsTotal+todosTotalToday+cleaningTotalToday+goalWeightV;
  const dayDoneRaw=habitsDoneToday+todosDoneToday+cleaningDoneToday+goalDoneV;
  const dayDone=Math.round(dayDoneRaw);
  const dayPct=dayTotal>0?Math.round((dayDoneRaw/dayTotal)*100):0;
  // Fitness rings
  const todayFit=fitMove!=null;
  const moveGoal=300,exGoal=30,standGoal=6;
  const standHrs=fitStand?Math.round((fitStand/12)*10)/10:null;
  const movePct=todayFit?Math.min((fitMove||0)/moveGoal,1):0;
  const exPct=todayFit?Math.min((fitEx||0)/exGoal,1):0;
  const standPct=todayFit?Math.min((fitStand||0)/12/standGoal,1):0;
  const RING_CX=60,RING_CY=60;
  const RINGS=[
    {r:50,color:"#c9a87c",label:"Move",val:fitMove,goal:moveGoal,unit:"cal",pct:movePct},
    {r:37,color:"#7a9070",label:"Exercise",val:fitEx,goal:exGoal,unit:"min",pct:exPct},
    {r:24,color:"#b098c0",label:"Stand",val:standHrs,goal:standGoal,unit:"hrs",pct:standPct},
  ];

  const S=({s=15,w=1.75,children})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
  const NAV=[
    {id:"dashboard",label:"Dashboard",icon:<S><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></S>},
    {id:"habits",label:"Habits",icon:<S><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></S>},
    {id:"todos",label:"To-Do",icon:<S><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><polyline points="4 6 5 7 7 5"/><polyline points="4 12 5 13 7 11"/><polyline points="4 18 5 19 7 17"/></S>},
    {id:"goals",label:"Goals",icon:<S><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></S>},
    {id:"calendar",label:"Calendar",icon:<S><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></S>},
    {id:"cleaning",label:"Rituel",icon:<S><path d="M3 9h11v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><path d="M8 9V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/><line x1="16" y1="4" x2="20" y2="2"/><line x1="16" y1="6" x2="21" y2="6"/><line x1="16" y1="8" x2="20" y2="10"/></S>},
    {id:"bilan",label:"Bilan",icon:<S><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></S>},
  ];

  // ── PASSWORD GATE ──
  const [unlocked,setUnlocked]=useState(()=>sessionStorage.getItem("sab_auth")==="1");
  const [pwInput,setPwInput]=useState("");
  const [pwErr,setPwErr]=useState(false);
  const checkPw=()=>{
    if(pwInput===APP_PASSWORD){sessionStorage.setItem("sab_auth","1");setUnlocked(true);}
    else{setPwErr(true);setPwInput("");setTimeout(()=>setPwErr(false),1800);}
  };

  if(!unlocked) return (
    <>
      <style>{CSS}</style>
      <svg viewBox="0 0 200 380" style={{position:"fixed",bottom:0,right:"5vw",height:"72vh",pointerEvents:"none",zIndex:0,fill:"#261d12",opacity:0.045}} aria-hidden="true">
        <polygon points="99,5 101,5 102,26 98,26"/><polygon points="86,54 114,54 102,26 98,26"/><rect x="83" y="51" width="34" height="6"/><polygon points="72,116 128,116 114,57 86,57"/><rect x="70" y="113" width="60" height="6"/><polygon points="52,174 148,174 128,119 72,119"/><rect x="49" y="171" width="102" height="7"/><polygon points="52,178 80,178 68,380 5,380"/><polygon points="120,178 148,178 195,380 132,380"/>
      </svg>
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--cream)",padding:24}}>
        <div style={{background:"var(--ivory)",border:"1px solid var(--gold)",borderRadius:20,padding:"40px 44px",boxShadow:"0 8px 40px rgba(38,29,18,.13)",textAlign:"center",maxWidth:360,width:"100%"}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--gold)",letterSpacing:".18em",marginBottom:6}}>Welcome back</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:400,color:"var(--ink)",marginBottom:6}}>Bonjour, <em style={{fontStyle:"italic",color:"var(--gold-deep)"}}>Sabina</em></div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:13,color:"var(--ink-light)",marginBottom:28}}>Your personal space awaits</div>
          <input
            type="password"
            placeholder="Enter your password"
            value={pwInput}
            onChange={e=>{setPwInput(e.target.value);setPwErr(false);}}
            onKeyDown={e=>e.key==="Enter"&&checkPw()}
            autoFocus
            style={{width:"100%",padding:"12px 16px",border:`1.5px solid ${pwErr?"#c05050":"var(--border)"}`,borderRadius:10,background:"var(--parchment)",fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"var(--ink)",outline:"none",marginBottom:12,transition:"border-color .2s",textAlign:"center",letterSpacing:".1em"}}
          />
          {pwErr&&<div style={{fontSize:11,color:"#c05050",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",marginBottom:10}}>Incorrect password — try again</div>}
          <button onClick={checkPw} style={{width:"100%",padding:"12px",background:"var(--ink)",color:"#f4ede3",border:"none",borderRadius:10,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,cursor:"pointer",transition:"background .2s"}}>
            Enter ✦
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      {praise&&<div className="pt">{praise}</div>}

      {/* Eiffel Tower background */}
      <svg viewBox="0 0 200 380" style={{position:"fixed",bottom:0,right:"5vw",height:"72vh",pointerEvents:"none",zIndex:0,fill:"#261d12",opacity:0.055}} aria-hidden="true">
        <polygon points="99,5 101,5 102,26 98,26"/>
        <polygon points="86,54 114,54 102,26 98,26"/>
        <rect x="83" y="51" width="34" height="6"/>
        <polygon points="72,116 128,116 114,57 86,57"/>
        <rect x="70" y="113" width="60" height="6"/>
        <polygon points="52,174 148,174 128,119 72,119"/>
        <rect x="49" y="171" width="102" height="7"/>
        <polygon points="52,178 80,178 68,380 5,380"/>
        <polygon points="120,178 148,178 195,380 132,380"/>
      </svg>

      {/* Event modal */}
      {evModal&&(
        <div className="mo" onClick={()=>setEvModal(null)}>
          <div className="mod" onClick={e=>e.stopPropagation()}>
            <button className="mcl" onClick={()=>setEvModal(null)}>×</button>
            <div className="mdt">{evModal.mode==="add"?"New Event":"Edit Event"}</div>
            <div className="mf"><div className="mlb">TITLE</div><input className="mi2" placeholder="What's happening?" value={evDraft.title} onChange={e=>setEvDraft(d=>({...d,title:e.target.value}))}/></div>
            <div className="fr">
              <div className="mf" style={{flex:1}}><div className="mlb">DATE</div><input className="mi2" type="date" value={evDraft.date} onChange={e=>setEvDraft(d=>({...d,date:e.target.value}))}/></div>
              {!evDraft.allDay&&<div className="mf" style={{flex:1}}><div className="mlb">TIME</div><input className="mi2" type="time" value={evDraft.time} onChange={e=>setEvDraft(d=>({...d,time:e.target.value}))}/></div>}
            </div>
            <div className="adrow">
              <input type="checkbox" id="evAllDay" checked={evDraft.allDay} onChange={e=>setEvDraft(d=>({...d,allDay:e.target.checked,time:e.target.checked?"":d.time}))}/>
              <label htmlFor="evAllDay">ALL DAY EVENT</label>
            </div>
            <div className="mf"><div className="mlb">NOTES</div><input className="mi2" placeholder="Details…" value={evDraft.notes} onChange={e=>setEvDraft(d=>({...d,notes:e.target.value}))}/></div>
            <div className="mf"><div className="mlb">COLOUR</div><div className="cr">{ECOLORS.map(c=><div key={c} className={`cs2 ${evDraft.color===c?"sel":""}`} style={{background:c}} onClick={()=>setEvDraft(d=>({...d,color:c}))}/>)}</div></div>
            <div className="mft">
              {evModal.mode==="edit"?<button className="bc2" style={{color:"#c05050",borderColor:"#fde8e8"}} onClick={()=>delEv(evModal.id)}>Delete</button>:<div/>}
              <div style={{display:"flex",gap:8}}><button className="bc2" onClick={()=>setEvModal(null)}>Cancel</button><button className="bs" onClick={saveEv}>Save ✦</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Top nav */}
      <nav className="topnav">
        <div className="tn-brand">
          <span className="tn-eye">Welcome back</span>
          <span className="tn-name">Sabina ✦</span>
        </div>
        <div className="tn-divider"/>
        <div className="tn-links">
          {NAV.map(n=>(
            <div key={n.id} className={`ni ${page===n.id?"on":""}`} onClick={()=>setPage(n.id)}>
              {n.icon}
              <span className="ni-label">{n.label}</span>
            </div>
          ))}
        </div>
        <div className="tn-dt">{NOW.getDate()} {MONTHS[NOW.getMonth()]} {NOW.getFullYear()}</div>
      </nav>

      <main className="main">

        {/* ── DASHBOARD ── */}
        {page==="dashboard"&&(
          <div className="dash-grid">

            {/* ── LEFT COLUMN ── */}
            <div className="dash-col">

              {/* Profile card */}
              <div className="profile-card">
                <div className="ph-eye">Your personal space</div>
                <h1 className="ph-title">Bonjour, <em>Sabina</em></h1>
                <div style={{display:"flex",justifyContent:"center",margin:"12px 0"}}>
                  <div className="profile-ring">
                    <img src={sabinaPhoto} alt="Sabina"/>
                  </div>
                </div>
                <p className="ph-sub">{NOW.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
              </div>

              {/* Pomodoro timer */}
              <div className="card">
                <div className="ct" style={{textAlign:"center",marginBottom:2}}>Focus Timer</div>
                <div className="cs" style={{textAlign:"center"}}>Pomodoro</div>
                <div className="pomo-wrap">
                  <div className="pomo-presets">
                    {POMO_PRESETS.map(p=>(
                      <button key={p.s} className={`pomo-preset ${pomoDur===p.s&&!pomoActive?"on":""}`} onClick={()=>pomoSelect(p.s)}>{p.label}</button>
                    ))}
                  </div>
                  <svg width="140" height="140" viewBox="0 0 110 110" className="pomo-svg">
                    <circle cx="55" cy="55" r={POMO_R} fill="none" stroke="var(--parchment)" strokeWidth="7"/>
                    <circle cx="55" cy="55" r={POMO_R} fill="none" stroke={pomoActive?pomoColor:"var(--gold)"} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${pomoDash} ${POMO_CIRC}`} style={{transform:"rotate(-90deg)",transformOrigin:"55px 55px",transition:"stroke-dasharray .9s linear, stroke .5s"}}/>
                    <text x="55" y="50" textAnchor="middle" fontFamily="Playfair Display, serif" fontSize="18" fontWeight="600" fill="var(--ink)">{fmtPomo(pomoLeft)}</text>
                    <text x="55" y="65" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="9" fontStyle="italic" fill="var(--ink-light)">{pomoActive?"focus":"ready"}</text>
                  </svg>
                  <div className="pomo-btns">
                    {!pomoActive
                      ? <button className="pomo-btn start" onClick={pomoStart}>{pomoLeft<pomoDur&&pomoLeft>0?"Resume":"Start"}</button>
                      : <button className="pomo-btn pause" onClick={pomoPause}>Pause</button>
                    }
                    <button className="pomo-btn stop" onClick={pomoStop}>Stop</button>
                  </div>
                </div>
              </div>

            </div>{/* end left col */}

            {/* ── MIDDLE COLUMN ── */}
            <div className="dash-col">

              {/* Progress tracker */}
              <div className="card">
                <div className="ct" style={{textAlign:"left"}}>Today's Progress</div>
                <div className="cs" style={{textAlign:"left"}}>Habits · To-Do · Rituel · Goals</div>
                <div style={{display:"flex",alignItems:"center",gap:22,marginBottom:18}}>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:50,fontWeight:600,lineHeight:1,color:dayPct===100?"var(--sage)":dayPct>=60?"var(--gold-deep)":"var(--ink-light)"}}>
                    {dayPct}<span style={{fontSize:20,color:"var(--ink-light)"}}>%</span>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{height:10,background:"var(--parchment)",borderRadius:10,overflow:"hidden",marginBottom:7}}>
                      <div style={{height:"100%",width:`${dayPct}%`,background:dayPct===100?"var(--sage)":"linear-gradient(90deg,#c9a87c,#a8865a)",borderRadius:10,transition:"width .6s ease"}}/>
                    </div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink-light)",textAlign:"left"}}>{dayDone} of {dayTotal} tasks completed</div>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:9}}>
                  {[
                    {label:"Habits",done:habitsDoneToday,total:habitsTotal,color:"#c9a87c"},
                    {label:"To-Do List",done:todosDoneToday,total:todosTotalToday,color:"#7a9070"},
                    {label:"Rituel",done:cleaningDoneToday,total:cleaningTotalToday,color:"#7090a8"},
                  ].map(row=>(
                    <div key={row.label} style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:7,height:7,borderRadius:"50%",background:row.color,flexShrink:0}}/>
                      <div style={{fontSize:12,color:"var(--ink)",flex:1,textAlign:"left"}}>{row.label}</div>
                      <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink-light)",minWidth:32,textAlign:"right"}}>{row.isPct?`${row.done}%`:`${row.done}/${row.total}`}</div>
                      <div style={{width:70,height:4,background:"var(--parchment)",borderRadius:4,overflow:"hidden",flexShrink:0}}>
                        <div style={{height:"100%",width:row.total>0?`${Math.round(row.done/row.total*100)}%`:"0%",background:row.color,borderRadius:4,transition:"width .5s"}}/>
                      </div>
                    </div>
                  ))}
                </div>
                {dayPct===100&&<div style={{marginTop:16,textAlign:"center",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:14,color:"var(--sage)"}}>Parfait day, Sabina ✦</div>}
              </div>

              {/* Today's / Tomorrow's priorities */}
              <div className="card">
                <div className="ct">{dashTodoDay==="today"?"Today's":"Tomorrow's"} priorities</div>
                <div className="cs">Active tasks for {dashTodoDay}</div>
                <div className="dash-toggle">
                  <button className={`dash-tog ${dashTodoDay==="today"?"on":""}`} onClick={()=>setDashTodoDay("today")}>Today</button>
                  <button className={`dash-tog ${dashTodoDay==="tomorrow"?"on":""}`} onClick={()=>setDashTodoDay("tomorrow")}>Tomorrow</button>
                </div>
                <div className="tl">
                  {byPri(todos.filter(t=>!t.done&&t.date===(dashTodoDay==="today"?TODAY:TOMORROW))).slice(0,5).map(todo=>(
                    <div key={todo.id} className="ti">
                      <div className="tc" onClick={()=>toggleTodo(todo.id)}/>
                      <div className="tb2">
                        <div className="tt">{todo.text}</div>
                        <div className="tm">
                          {todo.priority==="high"&&<span className="pri high">high</span>}
                          <span className={`tg ${todo.tag}`}>{todo.tag}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {todos.filter(t=>!t.done&&t.date===(dashTodoDay==="today"?TODAY:TOMORROW)).length===0&&<div className="emp">All caught up ✦</div>}
                </div>
                <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid var(--border)"}}>
                  <div className="pri-row">
                    <span className="pri-lbl">Priority:</span>
                    {["high","medium","low"].map(p=>(
                      <button key={p} className={`pri-btn ${newTodoPriority===p?"on":""}`} style={newTodoPriority===p?{background:PCOLS[p]}:{}} onClick={()=>setNewTodoPriority(p)}>{p}</button>
                    ))}
                  </div>
                  <div className="row">
                    <input className="inp" placeholder={`Add ${dashTodoDay} task…`} value={newTodo} onChange={e=>setNewTodo(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTodoDash()}/>
                    <select className="sel" value={newTodoTag} onChange={e=>setNewTodoTag(e.target.value)}>{tags.map(tag=><option key={tag}>{tag}</option>)}</select>
                    <button className="bp" onClick={addTodoDash}>+ Add</button>
                  </div>
                </div>
              </div>

              {/* 4 stat cards in 2×2 grid */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div className="sc" style={{"--c1":"#c9a87c","--c2":"#a8865a"}} onClick={()=>setPage("habits")}>
                  <div className="sl">Habits today</div>
                  <div className="sn" style={{color:"#c9a87c",fontSize:26}}>{habitsToday}<span style={{fontSize:13,color:"var(--ink-light)"}}>/{habits.length}</span></div>
                  <div className="ss">Habit Tracker →</div>
                </div>
                <div className="sc" style={{"--c1":"#7a9070","--c2":"#5a7050"}} onClick={()=>setPage("todos")}>
                  <div className="sl">Tasks done</div>
                  <div className="sn" style={{color:"#7a9070",fontSize:26}}>{todosDone}<span style={{fontSize:13,color:"var(--ink-light)"}}>/{todayTodos.length}</span></div>
                  <div className="ss">To-Do Lists →</div>
                </div>
                <div className="sc" style={{"--c1":"#b098c0","--c2":"#907098"}} onClick={()=>setPage("goals")}>
                  <div className="sl">Avg goal</div>
                  <div className="sn" style={{color:"#b098c0",fontSize:26}}>{avgProg}<span style={{fontSize:13,color:"var(--ink-light)"}}>%</span></div>
                  <div className="ss">Monthly Goals →</div>
                </div>
                <div className="sc" style={{"--c1":"#7090a8","--c2":"#507090"}} onClick={()=>setPage("calendar")}>
                  <div className="sl">Events ahead</div>
                  <div className="sn" style={{color:"#7090a8",fontSize:26}}>{upcoming.length}</div>
                  <div className="ss">Calendar →</div>
                </div>
              </div>

            </div>{/* end middle col */}

            {/* ── RIGHT COLUMN ── */}
            <div className="dash-col">

              {/* Quote */}
              <div className="qc">
                <div className="qt">"{QUOTE.text}"</div>
                <div className="qa">— {QUOTE.attr}</div>
              </div>

              {/* Activity Rings */}
              <div className="card">
                <div className="ct">Activity Rings</div>
                <div className="cs">Move · Exercise · Stand</div>
                <div className="ring-wrap">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    {RINGS.map(ring=>{
                      const circ=2*Math.PI*ring.r;
                      const filled=circ*ring.pct;
                      return (
                        <g key={ring.label}>
                          {/* Track */}
                          <circle cx={RING_CX} cy={RING_CY} r={ring.r} fill="none"
                            stroke={ring.color+"28"} strokeWidth="10"/>
                          {/* Progress */}
                          <circle cx={RING_CX} cy={RING_CY} r={ring.r} fill="none"
                            stroke={ring.color} strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={`${filled} ${circ}`}
                            transform={`rotate(-90 ${RING_CX} ${RING_CY})`}
                            style={{transition:"stroke-dasharray .6s ease"}}/>
                        </g>
                      );
                    })}
                  </svg>
                  <div className="ring-legend">
                    {RINGS.map(ring=>(
                      <div key={ring.label} className="ring-legend-row">
                        <div className="ring-dot" style={{background:ring.color}}/>
                        <span className="ring-lbl">{ring.label}</span>
                        <span className="ring-val">
                          {todayFit&&ring.val!=null?`${Math.round(ring.val*10)/10}/${ring.goal}${ring.unit}`:"—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {!todayFit&&<div className="ring-sync">Awaiting today's sync ✦</div>}
              </div>

              {/* Upcoming events */}
              <div className="card">
                <div className="ct">Upcoming Events</div>
                <div className="cs">Next 3 dates</div>
                {upcoming.length===0&&<div className="emp">No upcoming events ✦</div>}
                {upcoming.map(e=>(
                  <div key={e.id} className="ue" style={{borderLeftColor:e.color}} onClick={ev=>openEditEv(e,ev)}>
                    <div className="ue-dot" style={{background:e.color}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div className="ue-name">{e.title}</div>
                      <div className="ue-date">{fd(e.date)}{e.allDay?" · All day":e.time?` · ${e.time}`:""}</div>
                    </div>
                    <div className="ue-away">{e.away===0?"Today":e.away===1?"Tomorrow":`${e.away}d`}</div>
                  </div>
                ))}
              </div>

              {/* Today's cleaning */}
              <div className="card">
                <div className="ct">Rituel de Maison</div>
                <div className="cs">Tasks for {TODAY_DAY}</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {cleaningTodayArr.map((task,i)=>(
                    <div key={i} className={`ctk ${task.done?"dc":""}`}>
                      <div className="cck" onClick={()=>toggleClean(TODAY_DAY,i)}/>
                      <span className="ctxt">{task.text}</span>
                    </div>
                  ))}
                  {cleaningTodayArr.length===0&&<div className="emp">No cleaning tasks today ✦</div>}
                </div>
              </div>

            </div>{/* end right col */}

          </div>
        )}

        {/* ── HABITS ── */}
        {page==="habits"&&<>
          <div style={{marginBottom:32}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:13,color:"var(--gold)",letterSpacing:".12em",marginBottom:6}}>This week</div><h1 style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:400,color:"var(--ink)"}}>Habit <em style={{fontStyle:"italic",color:"var(--gold-deep)"}}>Tracker</em></h1><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"var(--ink-light)",marginTop:6}}>Click an icon to change it · click a name to rename · hover for actions</p></div>
          <div className="card"><div className="ct">Weekly check-in</div><div className="cs">Tick each day you complete a habit</div>
            <div className="dh"><div className="dsp"/><div className="dls">{DAYS.map((d,i)=><div key={i} className="dl">{d}</div>)}</div></div>
            <div style={{display:"flex",flexDirection:"column",gap:2}}>
              {habits.map(hab=>(
                <div key={hab.id} className="hr">
                  <div className="hi">
                    <div className="ip-wrap" onClick={e=>e.stopPropagation()}>
                      <div className="hib" style={{background:hab.color+"22"}} onClick={()=>setIconFor(iconFor===hab.id?null:hab.id)}>{hab.icon}</div>
                      {iconFor===hab.id&&<div className="ip">{HICONS.map(ico=><div key={ico} className={`io ${hab.icon===ico?"sel":""}`} onClick={()=>setIcon(hab.id,ico)}>{ico}</div>)}</div>}
                    </div>
                    {editHabit===hab.id?<input className="ii" autoFocus value={editHName} onChange={e=>setEditHName(e.target.value)} onBlur={()=>saveEH(hab.id)} onKeyDown={e=>e.key==="Enter"&&saveEH(hab.id)}/>:<span className="hn" onClick={()=>startEH(hab)}>{hab.name}</span>}
                  </div>
                  <div className="hd">{hab.days.map((ck,i)=><div key={i} className={`hday ${ck?"ck":""}`} style={ck?{background:hab.color}:{}} onClick={()=>toggleDay(hab.id,i)}/>)}</div>
                  <div className="hst">{streak(hab.days)}/7</div>
                  <div className="ha"><button className="sb2" onClick={()=>startEH(hab)}>✏️</button><button className="sb2 d" onClick={()=>delHabit(hab.id)}>×</button></div>
                </div>
              ))}
              {habits.length===0&&<div className="emp">No habits yet ✦</div>}
            </div>
            <div className="ar"><div className="row"><input className="inp" placeholder="New habit…" value={newHabit} onChange={e=>setNewHabit(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addHabit()}/><button className="bp" onClick={addHabit}>+ Add habit</button></div></div>
            <div className="gs"><div className="gt">Habits completed per day this week</div>
              <div className="bc">{graphData.map((d,i)=><div key={i} className="bcol"><div className="bv">{d.count>0?d.count:""}</div><div className="bar" style={{height:`${(d.count/maxBar)*90}px`,background:d.count>0?"linear-gradient(to top,#a8865a,#c9a87c)":"var(--parchment)"}}/><div className="bl">{d.day}</div></div>)}</div>
            </div>
          </div>
        </>}

        {/* ── TO-DO LISTS ── */}
        {page==="todos"&&<>
          <div style={{marginBottom:32}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:13,color:"var(--gold)",letterSpacing:".12em",marginBottom:6}}>Stay organised</div><h1 style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:400,color:"var(--ink)"}}>To-Do <em style={{fontStyle:"italic",color:"var(--gold-deep)"}}>Lists</em></h1><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"var(--ink-light)",marginTop:6}}>Click a task to complete · hover and click ✎ to edit ✦</p></div>
          <div className="todo-grid">
            <div className="todo-main">

              {/* Today */}
              <div className="card"><div className="ct">Today · {NOW.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}</div><div className="cs">Your tasks for today</div>
                <div className="tb">
                  {["all","active","done"].map(f=><button key={f} className={`pb ${tFilter===f?"on":""}`} onClick={()=>setTFilter(f)}>{f==="all"?"All":f==="active"?"To Do":"Completed"}</button>)}
                  <div style={{width:1,height:18,background:"var(--border)",margin:"0 2px"}}/>
                  <button className={`pb ${tagFilter==="all"?"on":""}`} onClick={()=>setTagFilter("all")}>All tags</button>
                  {tags.map(tag=><button key={tag} className={`pb ${tagFilter===tag?"ton":""}`} onClick={()=>setTagFilter(tag)}>{tag}</button>)}
                </div>
                <div className="tl">
                  {filtTodos.map(todo=>(
                    <div key={todo.id} className={`ti ${todo.done?"dn":""}`}>
                      <div className="tc" onClick={()=>toggleTodo(todo.id)}/>
                      <div className="tb2">
                        {editTodoId===todo.id?<input className="inp" autoFocus value={editTodoTxt} onChange={e=>setEditTodoTxt(e.target.value)} onBlur={saveEditTodo} onKeyDown={e=>e.key==="Enter"&&saveEditTodo()} style={{fontSize:13,padding:"4px 8px",height:"auto"}}/>:<div className="tt" onClick={()=>toggleTodo(todo.id)}>{todo.text}</div>}
                        <div className="tm">{todo.priority==="high"&&!todo.done&&<span className="pri high">high</span>}{todo.priority==="low"&&<span className="pri low">low</span>}<span className={`tg ${todo.tag}`}>{todo.tag}</span></div>
                      </div>
                      <button className="te" onClick={()=>startEditTodo(todo)}>✎</button>
                      <button className="td" onClick={()=>delTodo(todo.id)}>×</button>
                    </div>
                  ))}
                  {filtTodos.length===0&&<div className="emp">Nothing here ✦</div>}
                </div>
                <div className="ar">
                  <div className="pri-row"><span className="pri-lbl">Priority:</span>{["high","medium","low"].map(p=>(<button key={p} className={`pri-btn ${newTodoPriority===p?"on":""}`} style={newTodoPriority===p?{background:PCOLS[p]}:{}} onClick={()=>setNewTodoPriority(p)}>{p}</button>))}</div>
                  <div className="row"><input className="inp" placeholder="New task for today…" value={newTodo} onChange={e=>setNewTodo(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTodo()}/><select className="sel" value={newTodoTag} onChange={e=>setNewTodoTag(e.target.value)}>{tags.map(tag=><option key={tag}>{tag}</option>)}</select><button className="bp" onClick={addTodo}>+ Add</button></div>
                </div>
              </div>

              {/* Tomorrow — collapsible */}
              <div className="card" style={{padding:0,overflow:"hidden"}}>
                <div className="ht" style={{padding:"14px 20px",margin:0,borderRadius:16}} onClick={()=>setShowTomorrow(s=>!s)}>
                  <div><div className="hl">Tomorrow · {new Date(TOMORROW+"T00:00:00").toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}</div><div className="hc" style={{marginTop:2}}>Plan ahead</div></div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}><span className="hc">{tomorrowTodos.length} {tomorrowTodos.length===1?"task":"tasks"}</span><span className={`hav ${showTomorrow?"op":""}`}>▼</span></div>
                </div>
                {showTomorrow&&<div style={{padding:"0 20px 20px"}}>
                  <div className="tl" style={{marginBottom:14}}>
                    {byPri(tomorrowTodos).map(todo=>(
                      <div key={todo.id} className={`ti ${todo.done?"dn":""}`}>
                        <div className="tc" onClick={()=>toggleTodo(todo.id)}/>
                        <div className="tb2">
                          {editTodoId===todo.id?<input className="inp" autoFocus value={editTodoTxt} onChange={e=>setEditTodoTxt(e.target.value)} onBlur={saveEditTodo} onKeyDown={e=>e.key==="Enter"&&saveEditTodo()} style={{fontSize:13,padding:"4px 8px",height:"auto"}}/>:<div className="tt" onClick={()=>toggleTodo(todo.id)}>{todo.text}</div>}
                          <div className="tm">{todo.priority==="high"&&!todo.done&&<span className="pri high">high</span>}{todo.priority==="low"&&<span className="pri low">low</span>}<span className={`tg ${todo.tag}`}>{todo.tag}</span></div>
                        </div>
                        <button className="te" onClick={()=>startEditTodo(todo)}>✎</button>
                        <button className="td" onClick={()=>delTodo(todo.id)}>×</button>
                      </div>
                    ))}
                    {tomorrowTodos.length===0&&<div className="emp">Nothing planned yet ✦</div>}
                  </div>
                  <div className="pri-row"><span className="pri-lbl">Priority:</span>{["high","medium","low"].map(p=>(<button key={p} className={`pri-btn ${newTodoPriority===p?"on":""}`} style={newTodoPriority===p?{background:PCOLS[p]}:{}} onClick={()=>setNewTodoPriority(p)}>{p}</button>))}</div>
                  <div className="row"><input className="inp" placeholder="New task for tomorrow…" value={newTodo} onChange={e=>setNewTodo(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){if(!newTodo.trim())return;setTodos(t=>[...t,{id:Date.now(),text:newTodo,done:false,tag:newTodoTag,date:TOMORROW,priority:newTodoPriority}]);setNewTodo("")}}}/><select className="sel" value={newTodoTag} onChange={e=>setNewTodoTag(e.target.value)}>{tags.map(tag=><option key={tag}>{tag}</option>)}</select><button className="bp" onClick={()=>{if(!newTodo.trim())return;setTodos(t=>[...t,{id:Date.now(),text:newTodo,done:false,tag:newTodoTag,date:TOMORROW,priority:newTodoPriority}]);setNewTodo("");}}>+ Add</button></div>
                </div>}
              </div>

              {/* Previous lists */}
              {pastDates.length>0&&<div className="card"><div className="ct">Previous lists</div><div className="cs">Your to-do history</div>
                {pastDates.map(date=>{const items=todos.filter(t=>t.date===date);const open=showHist[date];return(<div key={date} className="hg"><div className="ht" onClick={()=>setShowHist(h=>({...h,[date]:!h[date]}))}>
                  <span className="hl">{fd(date)}</span><div style={{display:"flex",alignItems:"center",gap:10}}><span className="hc">{items.filter(t=>t.done).length}/{items.length} done</span><span className={`hav ${open?"op":""}`}>▼</span></div></div>
                  {open&&<div className="his">{items.map(todo=><div key={todo.id} className={`ti ${todo.done?"dn":""}`}><div className="tc"/><div className="tb2"><div className="tt">{todo.text}</div><div className="tm"><span className={`tg ${todo.tag}`}>{todo.tag}</span></div></div><button className="td" onClick={()=>delTodo(todo.id)}>×</button></div>)}</div>}
                </div>);})}
              </div>}

            </div>{/* end todo-main */}

            {/* Right sidebar */}
            <div className="todo-side">
              <div className="card"><div className="ct">My Tags</div><div className="cs">Organise your tasks</div>
                <div className="tr">{tags.map(tag=><div key={tag} className="tch">{tag}<button className="tcd" onClick={()=>delTag(tag)}>×</button></div>)}</div>
                <div className="row" style={{marginTop:4}}><input className="inp" placeholder="New tag…" value={newTag} onChange={e=>setNewTag(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTag()}/><button className="bp" onClick={addTag}>+ Add</button></div>
              </div>
            </div>

          </div>
        </>}

        {/* ── BILAN ── */}
        {page==="bilan"&&<>
          <div style={{marginBottom:32}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:13,color:"var(--gold)",letterSpacing:".12em",marginBottom:6}}>Your personal review</div><h1 style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:400,color:"var(--ink)"}}>Bilan <em style={{fontStyle:"italic",color:"var(--gold-deep)"}}>✦</em></h1><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"var(--ink-light)",marginTop:6}}>A weekly and monthly look at your progress, habits, and achievements</p></div>
          <div className="bil-tabs">
            {[["week","This Week"],["month","This Month"],["trends","Trends"]].map(([v,l])=><button key={v} className={`bil-tab ${bilView===v?"on":""}`} onClick={()=>setBilView(v)}>{l}</button>)}
          </div>

          {bilView==="week"&&<>
            {/* Week score hero */}
            <div className="card" style={{background:"linear-gradient(135deg,#352e28 0%,#433830 60%,#352e28 100%)",borderColor:"rgba(201,168,124,.2)",marginBottom:18}}>
              <div style={{display:"flex",alignItems:"center",gap:28}}>
                <div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"rgba(201,168,124,.6)",letterSpacing:".12em",marginBottom:4}}>Week {bilWeekKey.split("-W")[1]} · {bilWeekDates[0]} → {bilWeekDates[6]}</div>
                  <div className="bil-score" style={{color:bilWeekScore>=70?"var(--gold)":bilWeekScore>=50?"#f0e8dc":"rgba(240,232,220,.5)"}}>{bilWeekScore}<span style={{fontSize:20,fontWeight:400,color:"rgba(240,232,220,.4)"}}>%</span></div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:14,color:"rgba(240,232,220,.7)",marginTop:6}}>{bilVerdict}</div>
                </div>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:10}}>
                  {[
                    {label:"To-Do",pct:bilTodoPct,color:"#7a9070",sub:`${bilWeekDone}/${bilWeekTotal} tasks`},
                    {label:"Habits",pct:bilHabitPct,color:"#c9a87c",sub:`${bilHabitDone}/${bilHabitTotal} day-checks`},
                    {label:"Rituel",pct:bilCleanPct,color:"#7090a8",sub:`${bilCleanDone}/${bilCleanTotal} tasks`},
                    {label:"Goals",pct:bilGoalPct,color:"#b098c0",sub:`${bilMonthGoals.length} active this month`},
                  ].map(r=>(
                    <div key={r.label}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontSize:11,color:"rgba(240,232,220,.55)"}}>{r.label}</span>
                        <span style={{fontFamily:"'Playfair Display',serif",fontSize:11,color:"rgba(240,232,220,.7)"}}>{r.pct}%</span>
                      </div>
                      <div className="bil-bar" style={{background:"rgba(255,255,255,.1)"}}><div className="bil-fill" style={{width:`${r.pct}%`,background:r.color}}/></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bil-grid">
              {/* Habits grid */}
              <div className="card"><div className="ct">Habits this week</div><div className="cs">Your 7-day tracker</div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                  {DAYS.map(d=><div key={d} style={{width:20,textAlign:"center",fontSize:9,color:"var(--ink-light)",flex:1}}>{d}</div>)}
                </div>
                {habits.length===0&&<div className="emp">No habits yet ✦</div>}
                {habits.map(hab=>(
                  <div key={hab.id} style={{marginBottom:8}}>
                    <div style={{fontSize:11.5,color:"var(--ink)",marginBottom:3,display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13}}>{hab.icon}</span>{hab.name}</div>
                    <div className="bil-dots">{hab.days.map((ck,i)=><div key={i} className={`bil-d ${ck?"ck":""}`} style={{flex:1,background:ck?hab.color:undefined}}>{ ck ? "✓" : ""}</div>)}</div>
                  </div>
                ))}
                <div style={{marginTop:14,paddingTop:12,borderTop:"1px solid var(--border)",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink-light)",textAlign:"center"}}>{bilHabitDone} checks out of {bilHabitTotal} possible this week</div>
              </div>

              {/* Right side stack */}
              <div style={{display:"flex",flexDirection:"column",gap:18}}>
                {/* To-Do this week */}
                <div className="card"><div className="ct">To-Do this week</div><div className="cs">Tasks completed</div>
                  <div style={{display:"flex",alignItems:"baseline",gap:8,margin:"8px 0 4px"}}><span style={{fontFamily:"'Playfair Display',serif",fontSize:42,fontWeight:600,lineHeight:1,color:"var(--sage)"}}>{bilWeekDone}</span><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:"var(--ink-light)"}}>/ {bilWeekTotal} tasks</span></div>
                  <div className="bil-bar"><div className="bil-fill" style={{width:`${bilTodoPct}%`,background:"#7a9070"}}/></div>
                  {bilWeekDates.map(d=>{const dt=todos.filter(t=>t.date===d);const dn=dt.filter(t=>t.done).length;if(dt.length===0)return null;return(<div key={d} style={{display:"flex",alignItems:"center",gap:8,marginTop:6,fontSize:11}}><span style={{color:"var(--ink-light)",minWidth:32}}>{fd(d).split(",")[0]}</span><div style={{flex:1,height:4,background:"var(--parchment)",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:dt.length?`${Math.round(dn/dt.length*100)}%`:"0%",background:"#7a9070",borderRadius:4}}/></div><span style={{color:"var(--ink-light)",minWidth:30,textAlign:"right"}}>{dn}/{dt.length}</span></div>);} )}
                </div>

                {/* Focus & Cleaning */}
                <div className="card">
                  <div style={{display:"flex",gap:18}}>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink-light)",marginBottom:4}}>Focus sessions</div>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:600,color:"var(--gold)"}}>{pomoCount}</div>
                      <div style={{fontSize:10,color:"var(--ink-light)",marginTop:2}}>total completed</div>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink-light)",marginBottom:4}}>Rituel de Maison</div>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:600,color:"#7090a8"}}>{bilCleanPct}<span style={{fontSize:16,fontWeight:400}}>%</span></div>
                      <div style={{fontSize:10,color:"var(--ink-light)",marginTop:2}}>{bilCleanDone}/{bilCleanTotal} tasks done</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>}

          {bilView==="month"&&<>
            <div className="bil-grid">
              {/* Goals this month */}
              <div className="card"><div className="ct">Goals · {MONTHS[NOW.getMonth()]} {NOW.getFullYear()}</div><div className="cs">{bilMonthGoals.length} active goals</div>
                {bilMonthGoals.length===0&&<div className="emp">No goals set for this month ✦</div>}
                {bilMonthGoals.map(g=>(
                  <div key={g.id} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:13,color:"var(--ink)",fontWeight:300}}>{g.title}</span><span style={{fontFamily:"'Playfair Display',serif",fontSize:13,color:g.color}}>{g.progress}%</span></div>
                    <div className="bil-bar"><div className="bil-fill" style={{width:`${g.progress}%`,background:g.color}}/></div>
                    {g.category&&<div style={{fontSize:10,color:"var(--ink-light)",marginTop:2}}>{g.category}{g.deadline?` · ${g.deadline}`:""}</div>}
                  </div>
                ))}
                {bilMonthGoals.length>0&&<div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink-light)"}}>Average progress</span>
                  <span style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:"var(--gold)"}}>{bilGoalPct}%</span>
                </div>}
              </div>

              {/* Monthly todos */}
              <div className="card"><div className="ct">To-Do · {MONTHS[NOW.getMonth()]}</div><div className="cs">Tasks completed this month</div>
                {(()=>{const monthPfx=`${NOW.getFullYear()}-${String(NOW.getMonth()+1).padStart(2,"0")}`;const mt=todos.filter(t=>t.date.startsWith(monthPfx));const md=mt.filter(t=>t.done).length;const pct=mt.length?Math.round(md/mt.length*100):0;return(<>
                  <div style={{display:"flex",alignItems:"baseline",gap:8,margin:"8px 0 4px"}}><span style={{fontFamily:"'Playfair Display',serif",fontSize:42,fontWeight:600,lineHeight:1,color:"var(--sage)"}}>{md}</span><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:"var(--ink-light)"}}>/ {mt.length} tasks</span></div>
                  <div className="bil-bar"><div className="bil-fill" style={{width:`${pct}%`,background:"#7a9070"}}/></div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink-light)",marginTop:8}}>{pct}% completion rate this month</div>
                </>);})()}
                <div style={{marginTop:16,paddingTop:14,borderTop:"1px solid var(--border)"}}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--ink-light)",marginBottom:8}}>By priority</div>
                  {["high","medium","low"].map(p=>{const monthPfx=`${NOW.getFullYear()}-${String(NOW.getMonth()+1).padStart(2,"0")}`;const pt=todos.filter(t=>t.date.startsWith(monthPfx)&&(t.priority??"medium")===p);const pd=pt.filter(t=>t.done).length;if(pt.length===0)return null;return(<div key={p} className="bil-row"><span className={`pri ${p}`}>{p}</span><div style={{flex:1}}><div className="bil-bar"><div className="bil-fill" style={{width:pt.length?`${Math.round(pd/pt.length*100)}%`:"0%",background:PCOLS[p]}}/></div></div><span className="bil-pct">{pd}/{pt.length}</span></div>);} )}
                </div>
              </div>
            </div>
          </>}

          {bilView==="trends"&&<>
            <div className="card">
              <div className="ct">To-Do completion · last 8 weeks</div>
              <div className="cs">How many tasks you completed each week</div>
              <div className="bil-chart">
                {weeklyChart.map((w,i)=>(
                  <div key={i} className="bil-col">
                    <div className="bil-cval">{w.total>0?`${w.pct}%`:""}</div>
                    <div className="bil-cbar" style={{height:`${w.total>0?(w.pct/maxChartPct)*60:2}px`,background:w.pct>=70?"linear-gradient(to top,#5a7050,#7a9070)":w.pct>=40?"linear-gradient(to top,#a8865a,#c9a87c)":"var(--parchment)"}}/>
                    <div className="bil-clbl">{w.label}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:18,marginTop:16,paddingTop:14,borderTop:"1px solid var(--border)"}}>
                {(()=>{const avg=Math.round(weeklyChart.filter(w=>w.total>0).reduce((s,w)=>s+w.pct,0)/(weeklyChart.filter(w=>w.total>0).length||1));const best=weeklyChart.reduce((b,w)=>w.pct>b.pct?w:b,{pct:0,label:"-"});const totalDone=todos.filter(t=>t.done).length;return(<>
                  <div style={{flex:1,textAlign:"center"}}><div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:600,color:"var(--gold)"}}>{avg}%</div><div style={{fontSize:10,color:"var(--ink-light)"}}>8-week avg</div></div>
                  <div style={{flex:1,textAlign:"center"}}><div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:600,color:"var(--sage)"}}>{best.pct}%</div><div style={{fontSize:10,color:"var(--ink-light)"}}>best week ({best.label})</div></div>
                  <div style={{flex:1,textAlign:"center"}}><div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:600,color:"#7090a8"}}>{totalDone}</div><div style={{fontSize:10,color:"var(--ink-light)"}}>total tasks done ever</div></div>
                  <div style={{flex:1,textAlign:"center"}}><div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:600,color:"#b098c0"}}>{pomoCount}</div><div style={{fontSize:10,color:"var(--ink-light)"}}>focus sessions ever</div></div>
                </>);})()}
              </div>
            </div>

            {/* Goals across all months */}
            <div className="card" style={{marginTop:18}}>
              <div className="ct">Goals · all time</div>
              <div className="cs">Progress across every month</div>
              {Object.keys(goals).length===0&&<div className="emp">No goals yet ✦</div>}
              {Object.entries(goals).sort(([a],[b])=>b.localeCompare(a)).slice(0,6).map(([mk,mgoals])=>{const avg=mgoals.length?Math.round(mgoals.reduce((s,g)=>s+g.progress,0)/mgoals.length):0;const[yr,mo]=mk.split("-");return(<div key={mk} className="bil-row" style={{marginBottom:13}}><span className="bil-lbl">{MONTHS[parseInt(mo)-1].slice(0,3)} {yr}</span><div style={{flex:1}}><div className="bil-bar"><div className="bil-fill" style={{width:`${avg}%`,background:"linear-gradient(90deg,#9078b0,#b098c0)"}}/></div></div><span className="bil-pct">{avg}%</span></div>);} )}
            </div>
          </>}
        </>}

        {/* ── GOALS ── */}
        {page==="goals"&&<>
          <div style={{marginBottom:32}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:13,color:"var(--gold)",letterSpacing:".12em",marginBottom:6}}>Vision and ambition</div><h1 style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:400,color:"var(--ink)"}}>Monthly <em style={{fontStyle:"italic",color:"var(--gold-deep)"}}>Goals</em></h1><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"var(--ink-light)",marginTop:6}}>Set, edit and track goals month by month</p></div>
          <div className="card">
            <div className="gmh"><div className="gml">{vmLabel}</div><div style={{display:"flex",gap:8}}><button className="mnb" onClick={pmG}>← Prev</button><button className="mnb" onClick={()=>setVMonth(MK)}>This month</button><button className="mnb" onClick={nmG} disabled={vMonth>=MK}>Next →</button></div></div>
            <div className="gg">
              {mGoals.map(goal=><div key={goal.id} className="gc"><div className="gac" style={{background:goal.color}}/>
                <div className="gct"><div className="gcat">{goal.category}</div><div className="gca"><button className="sb2" onClick={()=>openEditG(goal)}>✏️</button><button className="sb2 d" onClick={()=>delGoal(goal.id)}>×</button></div></div>
                <div className="gtit">{goal.title}</div>
                <div className="pb2"><div className="pf" style={{width:`${goal.progress}%`,background:goal.color}}/></div>
                <div className="pr"><span className="pp">{goal.progress}% complete</span>{goal.deadline&&<span className="gd">→ {goal.deadline}</span>}</div>
                <div className="ms">{goal.milestones.map((m,i)=><div key={i} className={`mi ${m.done?"dm":""}`} onClick={()=>toggleMs(goal.id,i)}><div className="md2" style={m.done?{background:goal.color}:{}}/><span>{m.text}</span></div>)}</div>
              </div>)}
              {goalForm?(<div className="gf"><div className="gft">{goalForm.mode==="add"?`New goal · ${vmLabel}`:`Edit goal · ${vmLabel}`}</div>
                <div className="fg"><div className="fl">GOAL TITLE</div><input className="inp" placeholder="What do you want to achieve?" value={gDraft.title} onChange={e=>setGDraft(g=>({...g,title:e.target.value}))}/></div>
                <div className="fr"><div className="fg"><div className="fl">CATEGORY</div><input className="inp" placeholder="e.g. Health" value={gDraft.category} onChange={e=>setGDraft(g=>({...g,category:e.target.value}))}/></div><div className="fg"><div className="fl">DEADLINE</div><input className="inp" placeholder="e.g. End of month" value={gDraft.deadline} onChange={e=>setGDraft(g=>({...g,deadline:e.target.value}))}/></div></div>
                <div className="fg"><div className="fl">PROGRESS: {gDraft.progress}%</div><input type="range" min="0" max="100" value={gDraft.progress} className="ri" onChange={e=>setGDraft(g=>({...g,progress:e.target.value}))}/></div>
                <div className="fl">MILESTONES</div>
                {gDraft.milestones.map((m,i)=><input key={i} className="inp" placeholder={`Milestone ${i+1}…`} value={m} onChange={e=>setGDraft(g=>({...g,milestones:g.milestones.map((x,j)=>j===i?e.target.value:x)}))}/>)}
                <div className="fbr"><button className="bc2" onClick={()=>setGoalForm(null)}>Cancel</button><button className="bs" onClick={saveGoal}>Save goal ✦</button></div>
              </div>):(<div className="gadd" onClick={openAddG}><div style={{fontSize:28}}>+</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:14}}>Add a goal for {vmLabel}</div></div>)}
            </div>
            {mGoals.length===0&&!goalForm&&<div className="emp" style={{marginTop:12}}>No goals for {vmLabel} yet ✦</div>}
          </div>
        </>}

        {/* ── CALENDAR ── */}
        {page==="calendar"&&<>
          <div style={{marginBottom:32}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:13,color:"var(--gold)",letterSpacing:".12em",marginBottom:6}}>Your schedule</div><h1 style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:400,color:"var(--ink)"}}>My <em style={{fontStyle:"italic",color:"var(--gold-deep)"}}>Calendar</em></h1><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"var(--ink-light)",marginTop:6}}>Click any day to add an event · click an event to edit or delete</p></div>
          <div className="card">
            <div className="cah"><div className="caml">{calLabel}</div><div style={{display:"flex",gap:8}}><button className="cnb" onClick={prevCal}>← Prev</button><button className="cnb" onClick={()=>{setCalMonth(NOW.getMonth());setCalYear(NOW.getFullYear());}}>Today</button><button className="cnb" onClick={nextCal}>Next →</button></div></div>
            <div className="cagd">
              {DAYS.map(d=><div key={d} className="cadh">{d}</div>)}
              {Array.from({length:calFirst}).map((_,i)=><div key={`e${i}`} className="cac om"/>)}
              {Array.from({length:calDays}).map((_,i)=>{const day=i+1;const ds=`${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;const de=evOn(ds);const isT=ds===TODAY;return(
                <div key={day} className={`cac ${isT?"tc2":""}`} onClick={()=>openAddEv(ds)}>
                  <div className="dn2">{day}</div>
                  {de.slice(0,2).map(e=><div key={e.id} className="cep" style={{background:e.color}} onClick={ev=>openEditEv(e,ev)}>{e.allDay?"All day":e.time?`${e.time} `:""}{e.title}</div>)}
                  {de.length>2&&<div className="cm">+{de.length-2} more</div>}
                </div>
              );})}
            </div>
          </div>
        </>}

        {/* ── CLEANING SCHEDULE ── */}
        {page==="cleaning"&&<>
          <div style={{marginBottom:32}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:13,color:"var(--gold)",letterSpacing:".12em",marginBottom:6}}>Une maison propre, un esprit clair</div><h1 style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:400,color:"var(--ink)"}}>Rituel de <em style={{fontStyle:"italic",color:"var(--gold-deep)"}}>Maison</em></h1><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"var(--ink-light)",marginTop:6}}>Add, edit or remove tasks for any day · today is highlighted</p></div>
          <div className="card"><div className="ct">Routine hebdomadaire</div><div className="cs">Today is {TODAY_DAY} ✦</div>
            <div className="cg">
              {DAYS.map(day=>(
                <div key={day} className={`cd ${day===TODAY_DAY?"td2":""}`}>
                  <div className="cdn">{day}{day===TODAY_DAY&&<span className="tdb">TODAY</span>}</div>
                  {(cleaning[day]||[]).map((task,ti)=>(
                    <div key={ti} className={`ctk ${task.done?"dc":""}`}>
                      <div className="cck" onClick={()=>toggleClean(day,ti)}/>
                      {editC&&editC.day===day&&editC.idx===ti?<input className="inp" style={{fontSize:11,padding:"2px 6px",flex:1}} autoFocus value={editCTxt} onChange={e=>setEditCTxt(e.target.value)} onBlur={saveEC} onKeyDown={e=>e.key==="Enter"&&saveEC()}/>:<span className="ctxt">{task.text}</span>}
                      <button className="sb2" style={{fontSize:11,padding:"1px 4px",opacity:.7}} onClick={()=>startEC(day,ti,task.text)}>✏️</button>
                      <button className="cdel" onClick={()=>delClean(day,ti)}>×</button>
                    </div>
                  ))}
                  <div className="car"><input className="cai" placeholder="Add task…" value={cInputs[day]||""} onChange={e=>setCInputs(ci=>({...ci,[day]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addClean(day)}/><button className="cab" onClick={()=>addClean(day)}>+</button></div>
                </div>
              ))}
            </div>
          </div>
        </>}

      </main>
    </>
  );
}
