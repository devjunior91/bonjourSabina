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
const HABIT_ICON_SVGS={
  run:(c)=>`<path d="M6 5C6 14 10 18 19 18" stroke="${c}" stroke-width="2" stroke-linecap="round"/><circle cx="7" cy="6" r="2" fill="${c}"/><circle cx="18" cy="17" r="2" fill="${c}"/>`,
  book:(c)=>`<path d="M4 6C6 5 8 5 10 6V18C8 17 6 17 4 18V6Z" fill="${c}"/><path d="M20 6C18 5 16 5 14 6V18C16 17 18 17 20 18V6Z" fill="${c}"/>`,
  workout:(c)=>`<path d="M6 10V14M18 10V14M4 12H20" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`,
  person:(c)=>`<circle cx="12" cy="10" r="4" stroke="${c}" stroke-width="2"/><path d="M8 18C9.5 16 14.5 16 16 18" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`,
  sleep:(c)=>`<rect x="4" y="10" width="16" height="6" rx="2" fill="${c}"/><rect x="4" y="8" width="6" height="3" rx="1" fill="${c}"/>`,
  leaf:(c)=>`<circle cx="12" cy="7" r="2" fill="${c}"/><path d="M7 18C8.5 14 15.5 14 17 18" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`,
  water:(c)=>`<path d="M12 3C12 3 7 10 7 13C7 16 9 18 12 18C15 18 17 16 17 13C17 10 12 3 12 3Z" fill="${c}"/>`,
  clock:(c)=>`<circle cx="12" cy="12" r="8" stroke="${c}" stroke-width="2"/><path d="M12 8V12L15 15" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`,
  heart:(c)=>`<path d="M12 21C12 21 4 14 4 9C4 6.5 6 4 9 4C10.5 4 12 5.5 12 5.5C12 5.5 13.5 4 15 4C18 4 20 6.5 20 9C20 14 12 21 12 21Z" fill="${c}"/>`,
  meditation:(c)=>`<circle cx="12" cy="13" r="5" stroke="${c}" stroke-width="2"/><path d="M12 8V5" stroke="${c}" stroke-width="2" stroke-linecap="round"/><path d="M9 6L15 6" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`,
  journal:(c)=>`<path d="M6 4H18V20H6V4Z" stroke="${c}" stroke-width="2"/><path d="M9 9H15M9 13H15M9 17H12" stroke="${c}" stroke-width="1.5" stroke-linecap="round"/>`,
  balance:(c)=>`<path d="M4 12H20" stroke="${c}" stroke-width="2" stroke-linecap="round"/><path d="M6 10V14" stroke="${c}" stroke-width="2" stroke-linecap="round"/><path d="M18 10V14" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`,
  food:(c)=>`<path d="M6 4V10C6 12 8 14 12 14C16 14 18 12 18 10V4" stroke="${c}" stroke-width="2" stroke-linecap="round"/><path d="M12 14V20" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`,
  star:(c)=>`<path d="M12 3L14.5 8.5L21 9.3L16.5 13.7L17.8 20L12 16.9L6.2 20L7.5 13.7L3 9.3L9.5 8.5L12 3Z" fill="${c}"/>`,
};
const HABIT_ICON_LIST=["run","book","workout","person","sleep","leaf","water","clock","heart","meditation","journal","balance","food","star"];
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
const DEF_HABITS=[
  {id:1,name:"Morning pages",icon:"journal",color:"#c9a87c",days:Array(7).fill(false)},
  {id:2,name:"Walk 30 min",icon:"run",color:"#a89080",days:Array(7).fill(false)},
  {id:3,name:"Read",icon:"book",color:"#7a9070",days:Array(7).fill(false)},
  {id:4,name:"Meditate",icon:"meditation",color:"#b098c0",days:Array(7).fill(false)},
  {id:5,name:"Drink 2L water",icon:"water",color:"#7090a8",days:Array(7).fill(false)},
];
const DEF_TAGS=["Personal","Work","Fitness","Health","Creative"];
const DEF_CLEANING=Object.fromEntries(DAYS.map(d=>[d,DEF_CLEAN_TASKS[d].map(t=>({text:t,done:false}))]));
const DEF_PACK={
  trip:{destination:"London",from:"22 Apr 2026",nights:7},
  categories:[
    {id:"clothing",label:"Clothing",icon:"👗",items:[
      {id:1,text:"7 × tops / blouses",done:false},{id:2,text:"3 × jeans / trousers",done:false},
      {id:3,text:"1 × smart outfit",done:false},{id:4,text:"1–2 × going-out outfits",done:false},
      {id:5,text:"Pyjamas",done:false},{id:6,text:"7 × underwear",done:false},
      {id:7,text:"7 × socks",done:false},{id:8,text:"Warm jumper / cardigan",done:false},
      {id:9,text:"Coat / jacket",done:false},
    ]},
    {id:"fitness",label:"Fitness",icon:"🏋️",items:[
      {id:20,text:"3 × gym / workout sets",done:false},{id:21,text:"3 × sports bras",done:false},
      {id:22,text:"Running / gym trainers",done:false},{id:23,text:"Water bottle",done:false},
    ]},
    {id:"shoes",label:"Shoes & Accessories",icon:"👟",items:[
      {id:30,text:"Everyday trainers / flats",done:false},{id:31,text:"Smart / going-out shoes",done:false},
      {id:32,text:"Handbag",done:false},{id:33,text:"Sunglasses",done:false},
    ]},
    {id:"toiletries",label:"Toiletries & Beauty",icon:"🧴",items:[
      {id:40,text:"Shampoo & conditioner",done:false},{id:41,text:"Body wash",done:false},
      {id:42,text:"Face wash & moisturiser",done:false},{id:43,text:"SPF",done:false},
      {id:44,text:"Makeup bag",done:false},{id:45,text:"Perfume",done:false},
      {id:46,text:"Deodorant",done:false},{id:47,text:"Toothbrush & toothpaste",done:false},
      {id:48,text:"Razor",done:false},{id:49,text:"Hair tools (straightener etc.)",done:false},
      {id:50,text:"Cotton pads / skincare extras",done:false},
    ]},
    {id:"electronics",label:"Electronics",icon:"💻",items:[
      {id:60,text:"Phone & charger",done:false},{id:61,text:"Laptop & charger",done:false},
      {id:62,text:"Apple Watch & charger",done:false},{id:63,text:"AirPods / earphones",done:false},
      {id:64,text:"Power bank",done:false},{id:65,text:"Plug adaptor (if needed)",done:false},
    ]},
    {id:"health",label:"Health & Meds",icon:"💊",items:[
      {id:70,text:"Regular medication",done:false},{id:71,text:"Vitamins",done:false},
      {id:72,text:"Paracetamol / ibuprofen",done:false},{id:73,text:"Plasters",done:false},
    ]},
    {id:"documents",label:"Documents & Finance",icon:"📄",items:[
      {id:80,text:"Passport / ID card",done:false},{id:81,text:"Bank cards & cash",done:false},
      {id:82,text:"Travel insurance details",done:false},
    ]},
    {id:"misc",label:"Miscellaneous",icon:"🎒",items:[
      {id:90,text:"Umbrella (it's London!)",done:false},{id:91,text:"Book / Kindle",done:false},
      {id:92,text:"Reusable shopping bag",done:false},{id:93,text:"Snacks for travel",done:false},
    ]},
  ]
};

const NOW=new Date();
const _ld=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const TODAY=_ld(NOW);
const _tmr=new Date(NOW);_tmr.setDate(NOW.getDate()+1);
const TOMORROW=_ld(_tmr);
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
  --cream:#ece6de;--parchment:#e1d8ce;--ivory:#ffffff;
  --ink:#1a1410;--ink-light:#675850;
  --gold:#c9a87c;--gold-deep:#a8865a;--gold-pale:#eddcc8;
  --sage:#7a9070;
  --border:rgba(26,20,16,.12);
  --shadow:0 1px 3px rgba(26,20,16,.04),0 6px 22px rgba(26,20,16,.08);
  --shadow-lg:0 4px 14px rgba(26,20,16,.08),0 16px 48px rgba(26,20,16,.14);
  --sidebar-w:220px;
}
body,#root{background:var(--cream);min-height:100vh;font-family:'DM Sans',sans-serif;color:var(--ink);}
.sidebar{position:fixed;left:0;top:0;bottom:0;width:var(--sidebar-w);background:#faf7f3;border-right:1px solid rgba(26,20,16,.08);display:flex;flex-direction:column;z-index:200;overflow-y:auto;}
.sb-brand{padding:26px 20px 16px;margin-bottom:0;}
.sb-eye{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:9px;color:var(--ink-light);letter-spacing:.16em;margin-bottom:3px;opacity:.6;}
.sb-name{font-family:'Playfair Display',serif;font-size:17px;color:var(--ink);font-weight:600;letter-spacing:.01em;}
.sb-section{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:rgba(26,20,16,.35);padding:12px 20px 5px;font-family:'DM Sans',sans-serif;font-weight:500;}
.sb-nav{display:flex;flex-direction:column;gap:1px;padding:0 10px;flex:1;}
.ni{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;cursor:pointer;transition:all .15s;color:rgba(26,20,16,.48);font-size:12.5px;white-space:nowrap;letter-spacing:.01em;}
.ni:hover{background:rgba(26,20,16,.04);color:var(--ink);}
.ni.on{background:#ede8e1;color:var(--ink);}
.ni svg{flex-shrink:0;}
.sb-date{padding:14px 20px;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:10.5px;color:rgba(26,20,16,.3);border-top:1px solid rgba(26,20,16,.07);}

/* ── MAIN ── */
.main{margin-left:var(--sidebar-w);padding:28px 0 64px;min-height:100vh;position:relative;z-index:1;width:calc(100% - var(--sidebar-w));box-sizing:border-box;overflow-x:hidden;}

/* ── DASHBOARD ── */
.dash-grid{display:grid;grid-template-columns:1fr 340px;gap:20px;align-items:start;}
.dash-col{display:flex;flex-direction:column;gap:16px;}
.dh-row{display:flex;align-items:center;gap:10px;padding:8px 12px;background:#E4E1DC;border-radius:10px;}
.dh-icon{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}
.dh-name{font-size:12px;color:var(--ink);flex:1;}
.dh-streak{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:11px;color:var(--ink-light);white-space:nowrap;}
.dh-dots{display:flex;gap:3px;}
.dh-dot{width:7px;height:7px;border-radius:50%;background:var(--border);}
.dh-dot.on{background:var(--sage);}
.goals-mini{display:flex;flex-direction:column;gap:10px;}
.gm-row{display:flex;flex-direction:column;gap:4px;}
.gm-top{display:flex;justify-content:space-between;align-items:baseline;}
.gm-name{font-size:12px;color:var(--ink);}
.gm-pct{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:11px;color:var(--ink-light);}
.gm-bar{height:4px;background:var(--parchment);border-radius:2px;overflow:hidden;}
.gm-fill{height:100%;border-radius:2px;transition:width .5s;}

/* Page header */
.dash-page-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:28px;}
.dash-page-title{font-family:'Playfair Display',serif;font-size:36px;font-weight:400;color:var(--ink);line-height:1.1;}
.dash-page-title em{font-style:italic;color:var(--gold-deep);}
.dash-page-date{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:13px;color:var(--ink-light);margin-top:4px;}
.dash-search{display:flex;align-items:center;gap:10px;}
.dash-search-bar{display:flex;align-items:center;gap:8px;background:var(--ivory);border:1px solid var(--border);border-radius:20px;padding:8px 16px;font-family:'DM Sans',sans-serif;font-size:12px;color:var(--ink-light);width:200px;}
.dash-icon-btn{width:34px;height:34px;border-radius:50%;background:var(--ivory);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--ink-light);}

/* Top row */
.dash-top-row{display:grid;grid-template-columns:1fr 320px;gap:16px;margin-bottom:16px;align-items:stretch;}

/* Progress card */
.prog-card{background:var(--ivory);border:1px solid var(--border);border-radius:12px;padding:22px 26px;box-shadow:var(--shadow);display:flex;gap:24px;align-items:center;}
.prog-ring-col{flex-shrink:0;display:flex;align-items:center;justify-content:center;}
.prog-center{flex:1;min-width:0;display:flex;flex-direction:column;}
.prog-bullets{flex-shrink:0;display:flex;flex-direction:column;gap:10px;justify-content:center;width:152px;}
.prog-bullet-row{display:grid;grid-template-columns:10px 1fr auto;align-items:center;gap:6px;}

/* Quote card - light */
.qc-light{background:#f0ebe3;border:1px solid var(--border);border-radius:12px;padding:24px;box-shadow:var(--shadow);position:relative;display:flex;flex-direction:column;justify-content:center;}
.qc-mark{font-family:'Playfair Display',serif;font-size:48px;color:var(--gold);line-height:1;margin-bottom:8px;opacity:.6;}
.qc-light-text{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:18px;color:var(--ink);line-height:1.6;}
.qc-light-dash{width:24px;height:1.5px;background:var(--ink-light);margin-top:14px;opacity:.4;}

/* Combined activity + mid section */
.dash-combined-row{display:grid;grid-template-columns:1fr 320px;gap:12px;margin-bottom:16px;align-items:start;}
.dash-left-col{display:flex;flex-direction:column;gap:12px;}
.dash-act-sub{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
.dash-mid-sub{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start;}
.dash-mid-card{background:var(--ivory);border:1px solid var(--border);border-radius:12px;padding:24px;box-shadow:var(--shadow);height:260px;display:flex;flex-direction:column;}
.dash-right-col{display:flex;flex-direction:column;gap:12px;}
/* Activity row (kept for compat) */
.dash-activity-row{display:grid;grid-template-columns:1fr 1fr 1fr 320px;gap:12px;margin-bottom:16px;align-items:start;}
.act-card{background:var(--ivory);border:1px solid var(--border);border-radius:12px;padding:10px 14px 0;box-shadow:var(--shadow);overflow:hidden;position:relative;}
.act-label{font-size:10px;color:var(--ink-light);letter-spacing:.08em;margin-bottom:4px;text-transform:uppercase;}
.act-icon{font-size:14px;margin-bottom:2px;}
.act-val{font-family:'Playfair Display',serif;font-size:22px;font-weight:600;color:var(--ink);line-height:1;}
.act-goal{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:10px;color:var(--ink-light);margin-top:1px;margin-bottom:2px;}
.act-wave{position:absolute;bottom:0;left:0;right:0;opacity:.32;}

/* Mini calendar */
.cal-widget{background:var(--ivory);border:1px solid var(--border);border-radius:12px;padding:16px 18px;box-shadow:var(--shadow);}
.cal-w-hd{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px;}
.cal-w-title{font-family:'Playfair Display',serif;font-size:14px;color:var(--ink);}
.cal-w-link{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:11px;color:var(--gold-deep);cursor:pointer;background:none;border:none;padding:0;}
.cal-week-row{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:10px;}
.cal-week-day{text-align:center;font-size:9px;color:var(--ink-light);letter-spacing:.06em;padding-bottom:4px;}
.cal-week-date{text-align:center;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;font-size:12px;color:var(--ink);cursor:pointer;margin:0 auto;}
.cal-week-date.today{background:var(--ink);color:white;}
.cal-today-hd{font-size:10px;color:var(--ink-light);letter-spacing:.06em;margin-bottom:8px;padding-top:8px;border-top:1px solid var(--border);}
.cal-ev-row{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
.cal-ev-time{font-family:'Cormorant Garamond',serif;font-size:11px;color:var(--ink-light);min-width:36px;}
.cal-ev-name{font-size:11px;color:var(--ink);flex:1;}
.cal-ev-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}

/* Mid row */
.dash-mid-row{display:grid;grid-template-columns:1fr 1fr 320px;gap:12px;margin-bottom:16px;align-items:start;}

/* Streak card */
.streak-big{font-family:'Playfair Display',serif;font-size:52px;font-weight:600;color:var(--ink);line-height:1;display:flex;align-items:baseline;gap:8px;}
.streak-unit{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:16px;color:var(--ink-light);}
.streak-bars-row{display:flex;align-items:flex-end;gap:4px;height:46px;margin-top:10px;}
.streak-b{flex:1;border-radius:3px 3px 0 0;min-height:8px;transition:height .4s;}

/* Bottom row: Upcoming + Goals */
.dash-bottom-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:stretch;}
.dash-bottom-card{background:var(--ivory);border:1px solid var(--border);border-radius:12px;padding:24px;box-shadow:var(--shadow);display:flex;flex-direction:column;}
.upcoming-item{display:flex;gap:14px;align-items:flex-start;margin-bottom:12px;}
.upcoming-date-block{display:flex;flex-direction:column;align-items:center;background:var(--parchment);border-radius:8px;padding:6px 12px;min-width:50px;flex-shrink:0;}
.upcoming-month{font-size:9px;color:var(--ink-light);letter-spacing:.1em;text-transform:uppercase;}
.upcoming-day{font-family:'Playfair Display',serif;font-size:22px;font-weight:600;color:var(--ink);line-height:1;}
.upcoming-detail{flex:1;}
.upcoming-title{font-size:13px;color:var(--ink);margin-bottom:4px;}
.goals-2col{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.goal-mini-card{background:var(--parchment);border-radius:10px;padding:14px;}
.goal-mini-name{font-size:12px;color:var(--ink);margin-bottom:2px;}
.goal-mini-pct{font-family:'Playfair Display',serif;font-size:16px;font-weight:600;color:var(--ink);}
.goal-mini-bar{height:4px;background:rgba(0,0,0,.08);border-radius:2px;margin-top:8px;overflow:hidden;}
.goal-mini-fill{height:100%;border-radius:2px;transition:width .5s;}

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
.ring-legend{display:flex;flex-direction:column;gap:12px;flex:1;}
.ring-legend-row{display:flex;align-items:center;gap:7px;}
.ring-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
.ring-lbl{font-family:'DM Sans',sans-serif;font-size:12px;color:var(--ink-light);flex:1;}
.ring-val{font-family:'Cormorant Garamond',serif;font-size:14px;color:var(--ink);font-weight:400;}
.ring-sync{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:12px;color:var(--ink-light);text-align:center;margin-top:10px;}

/* ── QUOTE CARD ── */
.qc{background:#7D5A44;border-radius:16px;padding:16px 20px;box-shadow:var(--shadow-lg);position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;}
.qc::after{content:'"';position:absolute;right:14px;top:-8px;font-family:'Playfair Display',serif;font-size:80px;color:rgba(245,241,234,.08);line-height:1;pointer-events:none;}
.qt{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:14px;color:#F5F1EA;line-height:1.7;margin-bottom:8px;}
.qa{font-size:9px;color:#D7C9B8;letter-spacing:.12em;font-family:'DM Sans',sans-serif;}

/* ── UPCOMING EVENTS ── */
.ue{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:8px;border:1px solid var(--border);background:var(--parchment);margin-bottom:5px;transition:all .18s;cursor:pointer;border-left-width:3px;}
.ue:hover{opacity:.85;}
.ue-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.ue-name{font-size:12.5px;color:var(--ink);text-align:left;}
.ue-date{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:11px;color:var(--ink-light);margin-top:1px;text-align:left;}
.ue-away{font-size:9px;color:var(--ink-light);background:var(--gold-pale);padding:2px 7px;border-radius:10px;white-space:nowrap;}

/* ── POMODORO TIMER ── */
.pomo-wrap{display:flex;flex-direction:column;align-items:center;gap:8px;}
.pomo-presets{display:flex;gap:5px;flex-wrap:wrap;justify-content:center;}
.pomo-preset{padding:3px 9px;border-radius:20px;border:1px solid var(--border);background:transparent;font-family:'DM Sans',sans-serif;font-size:10px;color:var(--ink-light);cursor:pointer;transition:all .18s;}
.pomo-preset:hover,.pomo-preset.on{background:var(--ink);color:#f0e8dc;border-color:var(--ink);}
.pomo-svg{filter:drop-shadow(0 2px 8px rgba(201,168,124,.18));}
.pomo-btns{display:flex;gap:8px;}
.pomo-btn{padding:6px 18px;border-radius:20px;border:none;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;cursor:pointer;transition:all .18s;letter-spacing:.02em;}
.pomo-btn.start{background:var(--ink);color:#f4ede3;}
.pomo-btn.start:hover{background:var(--gold-deep);}
.pomo-btn.pause{background:var(--parchment);color:var(--ink);border:1px solid var(--border);}
.pomo-btn.pause:hover{background:var(--gold-pale);}
.pomo-btn.stop{background:transparent;color:var(--ink-light);border:1px solid var(--border);}
.pomo-btn.stop:hover{background:#fde8e8;color:#c05050;border-color:#fde8e8;}

/* Habits page redesign */
.hab-wrap{margin:-28px 0 -64px;min-height:calc(100vh - 56px);}
.hab-top{padding:24px 24px 0;}
.hab-hd-row{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;}
.hab-nav{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid var(--border);border-radius:20px;padding:4px 10px;box-shadow:var(--shadow);}
.hab-nav-arrow{background:none;border:none;cursor:pointer;color:var(--ink);font-size:16px;padding:2px 4px;border-radius:4px;line-height:1;transition:background .12s;}
.hab-nav-arrow:hover{background:var(--parchment);}
.hab-nav-arrow:disabled{opacity:.3;cursor:default;}
.hab-nav-lbl{font-family:'DM Sans',sans-serif;font-size:12px;color:var(--ink);white-space:nowrap;min-width:130px;text-align:center;}
.hab-stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;}
.hab-stat{background:#fff;border:1px solid var(--border);border-radius:14px;padding:16px 18px;box-shadow:var(--shadow);display:flex;gap:14px;align-items:flex-start;}
.hab-stat-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.hab-stat-val{font-family:'Playfair Display',serif;font-size:28px;font-weight:600;color:var(--ink);line-height:1.1;}
.hab-stat-lbl{font-size:10px;font-weight:600;color:var(--ink-light);letter-spacing:.06em;text-transform:uppercase;margin-bottom:2px;}
.hab-stat-sub{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:11px;color:var(--ink-light);margin-top:2px;}
.hab-body{display:grid;grid-template-columns:1fr 280px;align-items:start;}
.hab-main{padding:0 24px 64px;}
.hab-side{padding:14px 20px 64px;border-left:1px solid rgba(26,20,16,.08);background:#faf7f3;display:flex;flex-direction:column;gap:16px;min-height:calc(100vh - 280px);}
.hab-card{background:#fff;border:1px solid var(--border);border-radius:14px;overflow:hidden;box-shadow:var(--shadow);}
.hab-card-hd{padding:14px 18px 10px;border-bottom:1px solid rgba(26,20,16,.06);}
.hab-card-ttl{font-family:'Playfair Display',serif;font-size:14px;color:var(--ink);}
.hab-card-sub{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:11px;color:var(--ink-light);margin-top:1px;}
/* Grid header */
.hab-grid-hd{display:grid;grid-template-columns:160px repeat(7,1fr) 60px 36px;gap:4px;padding:8px 18px;border-bottom:1px solid rgba(26,20,16,.04);}
.hab-grid-dl{font-size:10px;font-weight:600;color:var(--ink-light);text-align:center;letter-spacing:.04em;}
/* Habit row */
.hab-row{display:grid;grid-template-columns:160px repeat(7,1fr) 60px 36px;gap:4px;padding:8px 18px;align-items:center;border-bottom:1px solid rgba(26,20,16,.03);transition:background .12s;}
.hab-row:hover{background:#fafafa;}
.hab-row:last-of-type{border-bottom:none;}
.hab-ri{display:flex;align-items:center;gap:8px;min-width:0;}
.hab-icon-btn{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:opacity .12s;}
.hab-icon-btn:hover{opacity:.8;}
.hab-rname{font-size:12.5px;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.hab-check{width:28px;height:28px;border-radius:7px;border:1.5px solid var(--border);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;margin:0 auto;}
.hab-check.ck{border:none;}
.hab-week-ct{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:12px;color:var(--ink-light);text-align:center;}
/* Icon picker */
.hab-ip{position:absolute;top:calc(100% + 6px);left:0;z-index:600;background:#fff;border:1px solid var(--border);border-radius:14px;padding:12px;box-shadow:0 8px 32px rgba(0,0,0,.12);display:grid;grid-template-columns:repeat(7,1fr);gap:5px;width:252px;}
.hab-ip-ico{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1.5px solid transparent;transition:all .12s;}
.hab-ip-ico:hover{background:var(--parchment);}
.hab-ip-ico.sel{border-color:var(--gold);}
/* Add habit row */
.hab-add-row{padding:12px 18px;display:flex;gap:8px;border-top:1px solid rgba(26,20,16,.06);}
/* Streaks side card */
.streak-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(26,20,16,.04);}
.streak-row:last-child{border-bottom:none;}
.streak-icon{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.streak-name{font-size:12px;color:var(--ink);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.streak-days{font-family:'Playfair Display',serif;font-size:14px;color:var(--ink);font-weight:500;}
.streak-days-lbl{font-size:9px;color:var(--ink-light);}
/* Donut chart */
.donut-wrap{position:relative;width:80px;height:80px;flex-shrink:0;}
.donut-val{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:18px;font-weight:600;color:var(--ink);}
/* Notification */
.notif-panel{position:absolute;right:0;top:calc(100% + 8px);width:280px;background:#fff;border:1px solid var(--border);border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,.13);z-index:500;overflow:hidden;}
.notif-hd{padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.notif-item{padding:10px 16px;border-bottom:1px solid rgba(26,20,16,.04);font-size:12px;color:var(--ink);line-height:1.4;}
.notif-item.unread{background:#fdf9f5;}
.notif-badge{position:absolute;top:-3px;right:-3px;width:16px;height:16px;background:#d93535;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;color:#fff;font-weight:600;}
@media(max-width:900px){.hab-body{grid-template-columns:1fr;}.hab-side{display:none;}.hab-stat-row{grid-template-columns:repeat(2,1fr);}}

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
.pb{padding:5px 13px;border-radius:20px;border:1px solid var(--border);background:#ffffff;font-family:'DM Sans',sans-serif;font-size:11.5px;color:var(--ink-light);cursor:pointer;transition:all .18s;white-space:nowrap;box-shadow:0 1px 3px rgba(26,20,16,.06);}
.pb:hover,.pb.on{background:var(--ink);color:#f0e8dc;border-color:var(--ink);}
.pb.ton{background:var(--gold-pale);color:var(--gold-deep);border-color:var(--gold);}
.tl{display:flex;flex-direction:column;gap:7px;}
.ti{display:flex;align-items:center;gap:9px;padding:7px 10px;border-radius:8px;border:1px solid rgba(26,20,16,.06);background:#E4E1DC;transition:all .18s;}
.todo-task-card{background:#ffffff;border:1px solid var(--border);border-radius:12px;padding:14px 16px;box-shadow:var(--shadow);}
.todo-task-card .ti{background:#ffffff;border-color:rgba(26,20,16,.07);}
.todo-task-card .ti:hover{background:#fafafa;}
.ti:hover{border-color:var(--gold);}
.ti.dn{opacity:.4;}
.tc{width:15px;height:15px;border-radius:50%;border:1.5px solid rgba(122,98,82,.3);flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;}
.ti.dn .tc{background:var(--sage);border-color:var(--sage);}
.ti.dn .tc::after{content:"✓";font-size:9px;color:white;}
.tb2{flex:1;min-width:0;}
.tt{font-size:11.5px;color:var(--ink);font-weight:300;cursor:pointer;text-align:left;}
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
.pack-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.pack-cat{background:var(--ivory);border:1px solid var(--border);border-radius:16px;padding:18px 20px;display:flex;flex-direction:column;gap:0;}
.pack-cat-hd{display:flex;align-items:center;gap:9px;margin-bottom:12px;}
.pack-cat-icon{font-size:16px;line-height:1;}
.pack-cat-lbl{font-family:'Playfair Display',serif;font-size:14px;color:var(--ink);font-weight:400;}
.pack-cat-count{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:11px;color:var(--ink-light);margin-left:auto;}
.pack-item{display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid rgba(38,29,18,.05);}
.pack-item:last-child{border-bottom:none;}
.pack-check{width:14px;height:14px;border-radius:3px;border:1.5px solid rgba(122,98,82,.35);flex-shrink:0;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;}
.pack-check.done{background:var(--sage);border-color:var(--sage);}
.pack-check.done::after{content:"✓";font-size:8px;color:white;}
.pack-txt{font-family:'DM Sans',sans-serif;font-size:12px;color:var(--ink-light);flex:1;}
.pack-txt.done{text-decoration:line-through;opacity:.45;}
.pack-del{opacity:0;background:none;border:none;cursor:pointer;font-size:13px;color:var(--ink-light);line-height:1;padding:0 2px;transition:opacity .15s;}
.pack-item:hover .pack-del{opacity:1;}
.pack-add{display:flex;gap:6px;margin-top:10px;}
.pack-prog{height:4px;border-radius:2px;background:var(--parchment);margin-bottom:14px;overflow:hidden;}
.pack-prog-fill{height:100%;border-radius:2px;background:var(--sage);transition:width .4s;}
.pack-trip-hd{display:flex;align-items:center;gap:18px;background:var(--ivory);border:1px solid var(--border);border-radius:16px;padding:20px 26px;margin-bottom:24px;}
.pack-trip-dest{font-family:'Playfair Display',serif;font-size:26px;font-weight:400;color:var(--ink);}
.pack-trip-meta{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:14px;color:var(--ink-light);margin-top:2px;}
.pack-total{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:13px;color:var(--ink-light);margin-left:auto;text-align:right;}
@media(max-width:900px){.pack-grid{grid-template-columns:repeat(2,1fr);}}
@media(max-width:600px){.pack-grid{grid-template-columns:1fr;}}
/* ── GRATITUDE ── */
.grat-wrap{margin:-28px 0 -64px;min-height:calc(100vh - 56px);}
.grat-top{padding:24px 24px 0;}
.grat-hd-row{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px;}
.grat-body{display:grid;grid-template-columns:1fr 280px;gap:20px;padding:0 24px 64px;align-items:start;}
.grat-card{background:#fff;border:1px solid var(--border);border-radius:16px;padding:20px 22px;box-shadow:var(--shadow);}
.grat-prog-dots{display:flex;align-items:center;gap:0;margin:16px 0 12px;position:relative;}
.grat-dot-line{position:absolute;top:50%;left:0;right:0;height:2px;background:var(--parchment);z-index:0;transform:translateY(-50%);}
.grat-dot-fill{position:absolute;top:50%;left:0;height:2px;background:var(--gold);z-index:1;transform:translateY(-50%);transition:width .5s;}
.grat-dot{width:20px;height:20px;border-radius:50%;border:2px solid var(--parchment);background:#fff;z-index:2;flex-shrink:0;transition:all .3s;cursor:default;}
.grat-dot.ck{background:var(--gold);border-color:var(--gold);}
.grat-dots-row{display:flex;justify-content:space-between;width:100%;position:relative;}
.grat-input-card{background:#fff;border:1px solid var(--border);border-radius:16px;padding:22px;box-shadow:var(--shadow);}
.grat-input-hd{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;}
.grat-inp{width:100%;border:1px solid var(--border);border-radius:12px;padding:14px 16px;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--ink);outline:none;background:#faf8f5;resize:none;min-height:52px;transition:border-color .2s;box-sizing:border-box;}
.grat-inp:focus{border-color:var(--gold);}
.grat-inp::placeholder{color:rgba(26,20,16,.35);font-family:'Cormorant Garamond',serif;font-style:italic;font-size:14px;}
.grat-add-btn{display:flex;align-items:center;gap:6px;padding:"10px 20px";background:var(--ink);color:#f4ede3;border:none;border-radius:20px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;cursor:pointer;transition:background .2s;white-space:nowrap;}
.grat-add-btn:hover{background:var(--gold-deep);}
.grat-list-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.grat-item{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid rgba(26,20,16,.05);position:relative;}
.grat-item:last-child{border-bottom:none;}
.grat-num{width:24px;height:24px;border-radius:50%;background:var(--parchment);display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:11px;color:var(--ink-light);flex-shrink:0;}
.grat-num.base{background:var(--gold-pale);color:var(--gold-deep);}
.grat-text{flex:1;font-size:13px;color:var(--ink);line-height:1.4;text-align:left;}
.grat-edit-inp{flex:1;border:none;border-bottom:1.5px solid var(--gold);background:transparent;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--ink);outline:none;padding:2px 0;text-align:left;}
.grat-time-inp{border:none;border-bottom:1.5px solid var(--gold);background:transparent;font-family:'DM Sans',sans-serif;font-size:11px;color:var(--ink);outline:none;width:68px;cursor:pointer;}
.grat-nav-row{display:flex;align-items:center;gap:10px;padding:12px 24px 8px;}
.grat-nav-btn{background:#fff;border:1px solid var(--border);border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;color:var(--ink);transition:all .15s;line-height:1;padding:0;}
.grat-nav-btn:disabled{opacity:.3;cursor:default;}
.grat-nav-btn:hover:not(:disabled){background:var(--parchment);}
.grat-nav-lbl{flex:1;text-align:center;font-family:'Playfair Display',serif;font-size:15px;color:var(--ink);}
.grat-time{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:11px;color:var(--ink-light);flex-shrink:0;min-width:36px;text-align:right;}
.grat-dot-menu{width:26px;height:26px;border-radius:6px;border:none;background:none;cursor:pointer;color:var(--ink-light);font-size:16px;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .15s;}
.grat-item:hover .grat-dot-menu{opacity:1;}
.grat-dot-menu:hover{background:var(--parchment);}
.grat-imenu{position:absolute;right:0;top:36px;background:#fff;border:1px solid var(--border);border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,.12);z-index:200;min-width:120px;overflow:hidden;}
.grat-imenu-item{padding:9px 14px;font-size:12px;color:var(--ink);cursor:pointer;transition:background .1s;white-space:nowrap;}
.grat-imenu-item:hover{background:var(--parchment);}
.grat-imenu-item.del{color:#d93535;}
/* Streak bar chart */
.grat-streak-bars{display:flex;align-items:flex-end;gap:5px;height:52px;}
.grat-sbar-col{display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;}
.grat-sbar{width:100%;border-radius:4px 4px 0 0;min-height:3px;transition:height .4s;}
.grat-sbar-lbl{font-size:9px;color:var(--ink-light);}
/* Week stats table */
.grat-stat-row-tbl{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid rgba(26,20,16,.05);}
.grat-stat-row-tbl:last-child{border-bottom:none;}
.grat-stat-lbl{font-size:12.5px;color:var(--ink);}
.grat-stat-val{font-family:'Playfair Display',serif;font-size:13px;color:var(--ink);font-weight:500;}
/* Reminder toggle */
.grat-rem-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(26,20,16,.05);}
.grat-rem-row:last-of-type{border-bottom:none;}
.grat-toggle{width:40px;height:22px;border-radius:11px;cursor:pointer;border:none;padding:2px;transition:background .2s;flex-shrink:0;display:flex;align-items:center;}
.grat-toggle.on{background:var(--ink);justify-content:flex-end;}
.grat-toggle.off{background:var(--border);justify-content:flex-start;}
.grat-toggle-knob{width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);}
@media(max-width:900px){.grat-body{grid-template-columns:1fr;}}
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
.todo-side{display:flex;flex-direction:column;gap:18px;position:sticky;top:36px;}
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

/* ── TODO LAYOUT ── */
.todo-wrap{margin:-28px 0 -64px;min-height:calc(100vh - 56px);}
.todo-top{padding:24px 24px 0;}
.todo-prog-full{background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px 22px;margin-top:16px;box-shadow:var(--shadow);display:flex;align-items:center;gap:20px;flex-wrap:wrap;}
.todo-navrow{display:flex;align-items:center;gap:10px;padding:14px 24px 10px;}
.tdnav{background:#fff;border:1px solid var(--border);border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:20px;color:var(--ink);transition:all .15s;line-height:1;padding:0;}
.tdnav:disabled{opacity:.3;cursor:default;}
.tdnav:hover:not(:disabled){background:var(--parchment);}
.tdnlbl{flex:1;text-align:center;font-family:'Playfair Display',serif;font-size:15px;color:var(--ink);}
.tdnback{background:var(--ink);color:#f4ede3;border:none;border-radius:20px;padding:5px 14px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;cursor:pointer;}
.todo-fbar{padding:0 24px 14px;display:flex;align-items:center;gap:5px;flex-wrap:wrap;}
.todo-body{display:grid;grid-template-columns:1fr 260px;align-items:start;}
.todo-main{padding:0 24px 64px;}
.todo-side{padding:0 18px 64px;display:flex;flex-direction:column;gap:14px;}
.todo-card{background:#fff;border:1px solid var(--border);border-radius:14px;overflow:hidden;box-shadow:var(--shadow);}
.todo-chd{display:flex;align-items:center;padding:14px 18px;border-bottom:1px solid rgba(26,20,16,.06);}
.todo-cpri{width:90px;font-size:10px;font-weight:600;color:var(--ink-light);letter-spacing:.06em;text-transform:uppercase;text-align:center;flex-shrink:0;}
.tr2{display:flex;align-items:center;gap:10px;padding:11px 18px;border-bottom:1px solid rgba(26,20,16,.04);position:relative;transition:background .12s;}
.tr2:hover{background:#fafafa;}
.tr2-ck{width:18px;height:18px;border-radius:50%;border:1.5px solid var(--border);flex-shrink:0;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;}
.tr2-ck.done{background:var(--sage);border-color:var(--sage);}
.tr2-body{flex:1;min-width:0;text-align:left;}
.tr2-txt{font-size:13px;color:var(--ink);line-height:1.4;text-align:left;}
.tr2-txt.done{text-decoration:line-through;color:var(--ink-light);opacity:.7;}
.tr2-tg{display:inline-block;font-size:10px;color:var(--ink-light);background:var(--parchment);border-radius:5px;padding:1px 7px;margin-top:3px;}
.tr2-pri{width:90px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.tr2-edit{width:26px;height:26px;border-radius:6px;border:none;background:none;cursor:pointer;color:var(--ink-light);display:flex;align-items:center;justify-content:center;flex-shrink:0;opacity:0;transition:opacity .15s,background .15s;}
.tr2:hover .tr2-edit{opacity:1;}
.tr2-edit:hover{background:var(--parchment);color:var(--gold-deep);}
.tr2-dot{width:28px;height:28px;border-radius:6px;border:none;background:none;cursor:pointer;color:var(--ink-light);font-size:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;}
.tr2-dot:hover{background:var(--parchment);color:var(--ink);}
.tmenu{position:absolute;right:4px;top:40px;background:#fff;border:1px solid var(--border);border-radius:10px;box-shadow:0 4px 24px rgba(0,0,0,.13);z-index:150;min-width:178px;overflow:hidden;}
.tmenu.up{top:auto;bottom:40px;}
.tmi{display:flex;align-items:center;gap:8px;padding:9px 14px;font-size:12.5px;color:var(--ink);cursor:pointer;transition:background .1s;white-space:nowrap;}
.tmi:hover{background:var(--parchment);}
.tmi.del{color:#d93535;}
.todo-add{display:flex;align-items:center;gap:6px;padding:12px 18px;color:var(--ink-light);font-size:12.5px;cursor:pointer;border-top:1px solid rgba(26,20,16,.06);transition:background .12s;}
.todo-add:hover{background:#fafafa;color:var(--ink);}
.side-card{background:#fff;border:1px solid var(--border);border-radius:14px;padding:16px;box-shadow:var(--shadow);}
.side-ttl{font-family:'Playfair Display',serif;font-size:13px;color:var(--ink);margin-bottom:10px;}
.mov{position:fixed;inset:0;background:rgba(26,20,16,.4);z-index:300;display:flex;align-items:center;justify-content:center;}
.mbox{background:#fff;border-radius:18px;padding:28px;width:440px;max-width:92vw;box-shadow:0 24px 64px rgba(0,0,0,.18);}
.mlbl{font-size:11px;font-weight:600;color:var(--ink-light);letter-spacing:.06em;text-transform:uppercase;margin-bottom:5px;display:block;}
.minp{width:100%;border:1px solid var(--border);border-radius:10px;padding:10px 14px;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--ink);outline:none;box-sizing:border-box;background:#fff;}
.minp:focus{border-color:var(--gold);}
.msel{width:100%;border:1px solid var(--border);border-radius:10px;padding:10px 14px;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--ink);outline:none;background:#fff;box-sizing:border-box;}
.mpri{flex:1;padding:8px 4px;border:1.5px solid var(--border);border-radius:8px;background:#fff;font-family:'DM Sans',sans-serif;font-size:11px;cursor:pointer;text-align:center;transition:all .15s;text-transform:capitalize;}
/* Priority flag */
.pflag{display:flex;align-items:center;gap:4px;flex-shrink:0;min-width:68px;}
.pflag span{font-size:10px;font-weight:500;letter-spacing:.02em;}
/* Sidebar quick add */
.sb-quickadd{padding:12px 14px;border-top:1px solid rgba(26,20,16,.07);}
.sb-qa-label{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:rgba(26,20,16,.35);margin-bottom:5px;font-family:'DM Sans',sans-serif;font-weight:500;}
.sb-qa-sub{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:10px;color:rgba(26,20,16,.4);margin-bottom:6px;}
.sb-qa-row{display:flex;gap:5px;}
.sb-qa-inp{flex:1;padding:6px 9px;border:1px solid rgba(26,20,16,.1);border-radius:8px;background:rgba(26,20,16,.03);font-family:'DM Sans',sans-serif;font-size:10.5px;color:var(--ink);outline:none;transition:border-color .15s;}
.sb-qa-inp:focus{border-color:var(--gold);}
.sb-qa-inp::placeholder{color:rgba(26,20,16,.3);font-family:'Cormorant Garamond',serif;font-style:italic;}
.sb-qa-btn{width:25px;height:25px;border-radius:7px;background:var(--ink);border:none;color:white;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s;}
.sb-qa-btn:hover{background:var(--gold-deep);}
@media(max-width:900px){.todo-body{grid-template-columns:1fr;}.todo-side{display:none;}}

/* ── RESPONSIVE ── */
@media(max-width:960px){
  .gg{grid-template-columns:1fr 1fr;}
}
@media(max-width:700px){
  .cg{grid-template-columns:1fr 1fr;}
  .gg{grid-template-columns:1fr;}
}
@media(max-width:480px){.cg{grid-template-columns:1fr;}.gg{grid-template-columns:1fr;}}

/* ── RESPONSIVE ── */
@media(max-width:900px){
  .sidebar{transform:translateX(-100%);transition:transform .25s;}
  .main{margin-left:0;padding:16px 10px 80px;}
  .dash-top-row{grid-template-columns:1fr;}
  .dash-combined-row{grid-template-columns:1fr;}
  .dash-right-col{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .dash-act-sub{grid-template-columns:1fr 1fr 1fr;}
  .dash-mid-sub{grid-template-columns:1fr 1fr;}
  .dash-mid-card{height:auto;min-height:200px;}
  .dash-bottom-row{grid-template-columns:1fr;}
  .prog-card{flex-wrap:wrap;gap:16px;}
  .prog-center{min-width:180px;}
  .prog-bullets{min-width:unset;}
}
@media(max-width:600px){
  .dash-act-sub{grid-template-columns:1fr 1fr;}
  .dash-right-col{grid-template-columns:1fr;}
  .dash-mid-sub{grid-template-columns:1fr;}
  .dash-mid-card{height:auto;}
  .prog-card{flex-direction:column;align-items:flex-start;}
  .prog-bullets{flex-direction:row;flex-wrap:wrap;gap:8px;min-width:unset;}
  .dash-page-header{flex-direction:column;gap:12px;}
  .dash-search{display:none;}
  .streak-big{font-size:36px;}
}
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
  const [liveDate,setLiveDate]=useState(()=>_ld(new Date()));
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
  const [todoView,setTodoView]=useState("today");
  const [showMonths,setShowMonths]=useState({});
  const [habitViewWeek,setHabitViewWeek]=useState(0); // 0=this week, 1=last week, etc.
  const [notifications,setNotifications]=useDB("sab_notifs",[]);
  const [showNotifs,setShowNotifs]=useState(false);
  const [gratitude,setGratitude]=useDB("sab_gratitude",{});
  const [gratReminders,setGratReminders]=useDB("sab_grat_rem",{morning:true,morningTime:"08:00",evening:true,eveningTime:"21:00"});
  const [gratInput,setGratInput]=useState("");
  const [gratMenuId,setGratMenuId]=useState(null);
  const [gratViewOffset,setGratViewOffset]=useState(0);
  const [gratEditId,setGratEditId]=useState(null);
  const [gratEditText,setGratEditText]=useState("");
  const [editingReminder,setEditingReminder]=useState(null);
  const [notifDismissed,setNotifDismissed]=useState(false);
  const [viewDayOffset,setViewDayOffset]=useState(0);
  const [showTaskMenu,setShowTaskMenu]=useState(null);
  const [editModal,setEditModal]=useState(null);
  const [showNewModal,setShowNewModal]=useState(false);
  const [newModalText,setNewModalText]=useState("");
  const [newModalPri,setNewModalPri]=useState("medium");
  const [newModalTag,setNewModalTag]=useState("Personal");

  // Pomodoro timer state
  const [pomoDur,setPomoDur]=useState(1500);
  const [pomoLeft,setPomoLeft]=useState(1500);
  const [pomoActive,setPomoActive]=useState(false);
  const pomoInterval=useRef(null);
  const pomoEndTime=useRef(null);

  const pt=useRef(null);
  const ac=useRef(null);

  useEffect(()=>{const h=()=>setIconFor(null);document.addEventListener("click",h);return()=>document.removeEventListener("click",h);},[]);
  useEffect(()=>{const h=()=>setShowTaskMenu(null);document.addEventListener("click",h);return()=>document.removeEventListener("click",h);},[]);
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
  // Refresh fitness data at 8am, 1pm, 6pm, 9pm
  useEffect(()=>{
    if(!supabase)return;
    const SYNC_TIMES=[[8,0],[10,30],[13,30],[17,30],[21,0]];
    const refresh=()=>{
      [["sab_fitness_move",setFitMove],["sab_fitness_ex",setFitEx],["sab_fitness_stand",setFitStand],["sab_fitness_date",setFitDate]].forEach(([key,setter])=>{
        supabase.from("user_data").select("value").eq("key",key).maybeSingle()
          .then(({data,error})=>{if(!error&&data?.value!==undefined&&data.value!==null){setter(data.value);try{localStorage.setItem(key,JSON.stringify(data.value));}catch{}}});
      });
    };
    const t=setInterval(()=>{
      const now=new Date();
      if(SYNC_TIMES.some(([h,m])=>now.getHours()===h&&now.getMinutes()===m))refresh();
    },60*1000);
    return()=>clearInterval(t);
  },[]);
  // Shadow module-level date constants with live reactive versions
  const TODAY=liveDate;
  const TOMORROW=(()=>{const d=new Date(liveDate+"T12:00:00");d.setDate(d.getDate()+1);return _ld(d);})();
  const TODAY_DAY=DAYS[new Date(liveDate+"T12:00:00").getDay()===0?6:new Date(liveDate+"T12:00:00").getDay()-1];
  const todayDayIndex=DAYS.indexOf(TODAY_DAY);

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

  // Habit notification check — if after 8pm and habits unchecked, add notification
  useEffect(()=>{
    const check=()=>{
      const hr=new Date().getHours();
      if(hr<20)return;
      const unchecked=habits.filter(h=>!h.days[todayDayIndex]);
      if(unchecked.length===0)return;
      const today=TODAY;
      setNotifications(ns=>{
        const already=ns.some(n=>n.date===today&&n.type==="habit");
        if(already)return ns;
        return[...ns,{id:Date.now(),type:"habit",date:today,text:`You have ${unchecked.length} habit${unchecked.length>1?"s":""} not yet completed today.`,read:false}];
      });
    };
    check();
    const t=setInterval(check,60000);
    return()=>clearInterval(t);
  },[habits,TODAY,todayDayIndex]);// eslint-disable-line react-hooks/exhaustive-deps

  // Gratitude reminder notifications
  useEffect(()=>{
    const check=()=>{
      const now=new Date();
      const hr=now.getHours();const mn=now.getMinutes();
      const today=TODAY;
      const todayCount=(gratitude[today]||[]).length;
      if(gratReminders.morning){
        const[mh,mm]=gratReminders.morningTime.split(":").map(Number);
        if(hr===mh&&mn===mm){
          setNotifications(ns=>{
            if(ns.some(n=>n.date===today&&n.type==="grat-morning"))return ns;
            return[...ns,{id:Date.now(),type:"grat-morning",date:today,text:"Good morning! Take a moment for your gratitude reflection ✦",read:false}];
          });
        }
      }
      if(gratReminders.evening){
        const[eh,em]=gratReminders.eveningTime.split(":").map(Number);
        if(hr===eh&&mn===em&&todayCount<5){
          setNotifications(ns=>{
            if(ns.some(n=>n.date===today&&n.type==="grat-evening"))return ns;
            return[...ns,{id:Date.now(),type:"grat-evening",date:today,text:`You've logged ${todayCount}/5 gratitude entries today — take a quiet moment to reflect ✦`,read:false}];
          });
        }
      }
    };
    check();
    const t=setInterval(check,60000);
    return()=>clearInterval(t);
  },[gratReminders,gratitude,TODAY]);// eslint-disable-line react-hooks/exhaustive-deps

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

  const chime=()=>{try{if(!ac.current)ac.current=new(window.AudioContext||window.webkitAudioContext)();const ctx=ac.current;if(ctx.state==="suspended")ctx.resume();[523.25,659.25,783.99].forEach((freq,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type="sine";o.frequency.value=freq;g.gain.setValueAtTime(0,ctx.currentTime+i*.18);g.gain.linearRampToValueAtTime(.18,ctx.currentTime+i*.18+.05);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+i*.18+.5);o.start(ctx.currentTime+i*.18);o.stop(ctx.currentTime+i*.18+.5);});}catch(e){}};
  // Soft crystal-bowl tone for gratitude — warm triangle waves, slow bloom, long resonant decay
  const gratChime=()=>{try{if(!ac.current)ac.current=new(window.AudioContext||window.webkitAudioContext)();const ctx=ac.current;if(ctx.state==="suspended")ctx.resume();[[396,0],[528,0.22],[0,0]].slice(0,2).forEach(([freq,delay])=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type="triangle";o.frequency.value=freq;g.gain.setValueAtTime(0,ctx.currentTime+delay);g.gain.linearRampToValueAtTime(.09,ctx.currentTime+delay+.18);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+delay+2.2);o.start(ctx.currentTime+delay);o.stop(ctx.currentTime+delay+2.2);});}catch(e){}};
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
  const gratWeekEntries=bilWeekDates.reduce((s,d)=>s+(gratitude[d]||[]).length,0);
  const gratWeekAvg=gratWeekEntries>0?(gratWeekEntries/7).toFixed(1):"0.0";
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
  // Gratitude computed — must be before dayTotal
  const GRAT_TARGET=5;
  const todayGrat=gratitude[TODAY]||[];
  const gratDoneRaw=Math.min(todayGrat.length/GRAT_TARGET,1);
  const gratStreak=(()=>{
    let s=0;
    for(let i=0;i<365;i++){
      const d=new Date(TODAY+"T12:00:00");d.setDate(d.getDate()-i);
      const k=_ld(d);
      if((gratitude[k]||[]).length>=GRAT_TARGET)s++;else break;
    }
    return s;
  })();
  const longestGratStreak=(()=>{
    const dates=Object.keys(gratitude).filter(d=>(gratitude[d]||[]).length>=GRAT_TARGET).sort();
    if(!dates.length)return 0;
    let max=1,cur=1;
    for(let i=1;i<dates.length;i++){
      const diff=(new Date(dates[i]+"T12:00:00")-new Date(dates[i-1]+"T12:00:00"))/86400000;
      if(diff===1){cur++;if(cur>max)max=cur;}else cur=1;
    }
    return max;
  })();
  const gratTotal=Object.values(gratitude).reduce((s,arr)=>s+arr.length,0);
  const addGrat=()=>{
    if(!gratInput.trim())return;
    const now=new Date();
    const time=now.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
    setGratitude(g=>({...g,[TODAY]:[...(g[TODAY]||[]),{id:Date.now(),text:gratInput.trim(),time}]}));
    setGratInput("");
    gratChime();
  };
  const delGrat=(date,id)=>setGratitude(g=>({...g,[date]:(g[date]||[]).filter(e=>e.id!==id)}));
  const dayTotal=habitsTotal+todosTotalToday+cleaningTotalToday+goalWeightV+1;
  const dayDoneRaw=habitsDoneToday+todosDoneToday+cleaningDoneToday+goalDoneV+gratDoneRaw;
  const dayDone=Math.round(dayDoneRaw);
  const dayPct=dayTotal>0?Math.round((dayDoneRaw/dayTotal)*100):0;

  // Recent Wins — computed after all dependencies are defined
  const recentWins=(()=>{
    const wins=[];
    if(dayTotal>0&&dayPct>=50) wins.push({type:"productive",title:"Productive Day",text:`Completed ${dayPct}% of today's tasks`});
    habits.forEach(h=>{const s=streak(h.days);if(s>=3)wins.push({type:"streak",title:"Streak",text:`${h.name} — ${s} days in a row`});});
    allGoals.forEach(g=>{
      g.milestones.filter(m=>m.done).slice(0,1).forEach(m=>wins.push({type:"milestone",title:"New Milestone",text:`${m.text} in "${g.title}"`}));
      if(g.progress>=50&&g.progress<100) wins.push({type:"goal",title:"Goal Progress",text:`${g.title} is now ${g.progress}% complete`});
    });
    if(cleaningTodayArr.length>0&&cleaningTodayArr.every(t=>t.done)) wins.push({type:"rituel",title:"Rituel Complete",text:`All ${TODAY_DAY} rituel tasks done ✦`});
    return wins.slice(0,4);
  })();

  // Fitness rings
  const todayFit=fitMove!=null;
  const moveGoal=300,exGoal=30,standGoal=6;
  const standHrs=fitStand?Math.round((fitStand/12)*10)/10:null;
  const movePct=todayFit?Math.min((fitMove||0)/moveGoal,1):0;
  const exPct=todayFit?Math.min((fitEx||0)/exGoal,1):0;
  const standPct=todayFit?Math.min((fitStand||0)/12/standGoal,1):0;
  const RING_CX=60,RING_CY=60;
  const RINGS=[
    {r:50,color:"#B2967D",label:"Move",val:fitMove,goal:moveGoal,unit:"cal",pct:movePct},
    {r:37,color:"#D7C9B8",label:"Exercise",val:fitEx,goal:exGoal,unit:"min",pct:exPct},
    {r:24,color:"#7D5A44",label:"Stand",val:standHrs,goal:standGoal,unit:"hrs",pct:standPct},
  ];

  // Habits page stats
  const habitWeekDays = habitViewWeek===0
    ? habits
    : (() => {
        const d=new Date(TODAY+"T12:00:00");
        d.setDate(d.getDate()-7*habitViewWeek);
        const wk=isoWeekKey(_ld(d));
        const arch=habitsArchive[wk];
        if(!arch)return habits.map(h=>({...h,days:Array(7).fill(false)}));
        return habits.map(h=>{const a=arch.find(a=>a.id===h.id);return{...h,days:a?a.days:Array(7).fill(false)};});
      })();
  const habitWeekTotal=habitWeekDays.reduce((s,h)=>s+h.days.filter(Boolean).length,0);
  const habitWeekPossible=habitWeekDays.length*7;
  const habitWeekPct=habitWeekPossible?Math.round(habitWeekTotal/habitWeekPossible*100):0;
  const habitBestDay=(()=>{
    const counts=DAYS.map((d,i)=>habitWeekDays.reduce((s,h)=>s+(h.days[i]?1:0),0));
    const max=Math.max(...counts);
    if(max===0)return"—";
    return DAYS[counts.indexOf(max)];
  })();
  // Cross-week streaks
  const fullHabitStreak=(habId)=>{
    const hab=habits.find(h=>h.id===habId);
    if(!hab)return 0;
    let s=0;
    const todayIdx=DAYS.indexOf(TODAY_DAY);
    let di=todayIdx;
    while(di>=0&&hab.days[di]){s++;di--;}
    if(di>=0)return s;
    let wo=1;
    while(wo<=26){
      const dd=new Date(TODAY+"T12:00:00");dd.setDate(dd.getDate()-7*wo);
      const wk=isoWeekKey(_ld(dd));
      const arch=habitsArchive[wk];
      if(!arch)break;
      const ah=arch.find(h=>h.id===habId);
      if(!ah)break;
      let pi=6;
      while(pi>=0&&ah.days[pi]){s++;pi--;}
      if(pi>=0)break;
      wo++;
    }
    return s;
  };
  const longestStreaks=[...habits].map(h=>({...h,str:fullHabitStreak(h.id)})).sort((a,b)=>b.str-a.str).slice(0,5);
  const overallCurrentStreak=longestStreaks.length?longestStreaks[0].str:0;
  // Completion rate categories (for current view week)
  const habitDoneCount=habitWeekDays.reduce((s,h)=>s+h.days.filter(Boolean).length,0);
  const habitMissCount=habitWeekDays.reduce((s,h)=>s+h.days.filter(v=>!v).length,0);
  const habitDonePct=habitWeekPossible?Math.round(habitDoneCount/habitWeekPossible*100):0;
  const habitMissPct=habitWeekPossible?Math.round(habitMissCount/habitWeekPossible*100):0;
  const habitPartPct=Math.max(0,100-habitDonePct-habitMissPct);
  // Week label for navigation
  const habitViewWeekLabel=(()=>{
    if(habitViewWeek===0)return"This week";
    const d=new Date(TODAY+"T12:00:00");d.setDate(d.getDate()-7*habitViewWeek);
    const mon=new Date(d);mon.setDate(d.getDate()-((d.getDay()||7)-1));
    const sun=new Date(mon);sun.setDate(mon.getDate()+6);
    return`${mon.getDate()} ${MONTHS[mon.getMonth()]} – ${sun.getDate()} ${MONTHS[sun.getMonth()]}`;
  })();
  // Insight text
  const habitInsight=(()=>{
    if(habits.length===0)return"Add your first habit to get started!";
    const best=longestStreaks[0];
    const pct=habitWeekPct;
    if(pct>=80)return`You're crushing it this week — ${pct}% completion! Keep that momentum going.`;
    if(pct>=50)return`Good progress at ${pct}%! ${best&&best.str>=3?`${best.name} is on a ${best.str}-day streak.`:"Consistency is key — keep going!"}`;
    return`${best&&best.str>=2?`${best.name} has a ${best.str}-day streak — don't break it!`:"Every habit checked is a win. Start small and build momentum."}`;
  })();
  const unreadNotifs=notifications.filter(n=>!n.read).length;

  // Habit icon renderer — available across all pages
  const HI=(id,color,size=18)=>{
    const fn=HABIT_ICON_SVGS[id];
    if(fn)return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" dangerouslySetInnerHTML={{__html:fn(color||"#888")}}/>;
    return <span style={{fontSize:size*0.75,lineHeight:1}}>{id}</span>;
  };

  const S=({s=15,w=1.75,children})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
  const NAV=[
    {id:"dashboard",label:"Dashboard",icon:<S><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></S>},
    {id:"habits",label:"Habits",icon:<S><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></S>},
    {id:"todos",label:"To-Do",icon:<S><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><polyline points="4 6 5 7 7 5"/><polyline points="4 12 5 13 7 11"/><polyline points="4 18 5 19 7 17"/></S>},
    {id:"goals",label:"Goals",icon:<S><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></S>},
    {id:"calendar",label:"Calendar",icon:<S><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></S>},
    {id:"cleaning",label:"Rituel",icon:<S><path d="M3 9h11v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><path d="M8 9V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/><line x1="16" y1="4" x2="20" y2="2"/><line x1="16" y1="6" x2="21" y2="6"/><line x1="16" y1="8" x2="20" y2="10"/></S>},
    {id:"bilan",label:"Bilan",icon:<S><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></S>},
    {id:"gratitude",label:"Gratitude",icon:<S><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></S>},
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

      <aside className="sidebar">
        <div className="sb-brand">
          <div className="sb-eye">Welcome back</div>
          <div className="sb-name">Sabina ✦</div>
        </div>
        <div className="sb-section">Menu</div>
        <div className="sb-nav">
          {NAV.map(n=>(
            <div key={n.id} className={`ni ${page===n.id?"on":""}`} onClick={()=>setPage(n.id)}>
              {n.icon}
              <span>{n.label}</span>
            </div>
          ))}
        </div>
        <div className="sb-quickadd">
          <div className="sb-qa-label">Quick Add</div>
          <div className="sb-qa-sub">Add a task quickly</div>
          <div className="sb-qa-row">
            <input className="sb-qa-inp" placeholder="What needs to be done?" value={newTodo} onChange={e=>setNewTodo(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTodo()}/>
            <button className="sb-qa-btn" onClick={addTodo}>+</button>
          </div>
        </div>
        <div className="sb-date">{NOW.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}</div>
      </aside>

      <main className="main">

        {/* ── HABITS ── */}
        {page==="habits"&&(()=>{
  const viewHabs=habitWeekDays;
  return(
  <div className="hab-wrap">
    {/* Header */}
    <div className="hab-top">
      <div className="hab-hd-row">
        <div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:400,color:"var(--ink)"}}>Habits</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:13,color:"var(--ink-light)",marginTop:3}}>Small daily steps, big life changes.</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div className="hab-nav">
            <button className="hab-nav-arrow" onClick={()=>setHabitViewWeek(w=>w+1)}>‹</button>
            <span className="hab-nav-lbl">{habitViewWeekLabel}</span>
            <button className="hab-nav-arrow" disabled={habitViewWeek===0} onClick={()=>setHabitViewWeek(w=>w-1)}>›</button>
          </div>
          <button onClick={()=>{if(!newHabit.trim())return;const idx=habits.length%HCOLORS.length;setHabits(h=>[...h,{id:Date.now(),name:newHabit,icon:HABIT_ICON_LIST[idx%HABIT_ICON_LIST.length],color:HCOLORS[idx],days:Array(7).fill(false)}]);setNewHabit("");}} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 16px",background:"var(--ink)",color:"#f4ede3",border:"none",borderRadius:20,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap"}}>+ New habit</button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="hab-stat-row">
        {[
          {lbl:"Overall completion",val:`${habitWeekPct}%`,sub:`${habitWeekTotal} of ${habitWeekPossible} completed`,icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 21C12 21 4 14 4 9C4 6.5 6 4 9 4C10.5 4 12 5.5 12 5.5C12 5.5 13.5 4 15 4C18 4 20 6.5 20 9C20 14 12 21 12 21Z" fill="#C47C6A"/></svg>,bg:"#fdf1ee"},
          {lbl:"Current streak",val:`${overallCurrentStreak}`,sub:overallCurrentStreak>0?"Keep it going! 🔥":"Start your streak today",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 5C6 14 10 18 19 18" stroke="#B89576" strokeWidth="2" strokeLinecap="round"/><circle cx="7" cy="6" r="2" fill="#B89576"/><circle cx="18" cy="17" r="2" fill="#B89576"/></svg>,bg:"#fdf7f0"},
          {lbl:"Best day",val:habitBestDay,sub:`Most habits completed`,icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3L14.5 8.5L21 9.3L16.5 13.7L17.8 20L12 16.9L6.2 20L7.5 13.7L3 9.3L9.5 8.5L12 3Z" fill="#C9A87C"/></svg>,bg:"#fdf9f0"},
          {lbl:"Total this week",val:`${habitWeekTotal}`,sub:habitViewWeek===0&&habitWeekTotal>0?`+${Math.max(0,habitWeekTotal-(habitsArchive[Object.keys(habitsArchive).sort().slice(-1)[0]]||[]).reduce((s,h)=>s+h.days.filter(Boolean).length,0))} from last week`:"habit completions",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="5" stroke="#7FA37A" strokeWidth="2"/><path d="M12 8V5" stroke="#7FA37A" strokeWidth="2" strokeLinecap="round"/></svg>,bg:"#eef5ee"},
        ].map(s=>(
          <div key={s.lbl} className="hab-stat">
            <div className="hab-stat-icon" style={{background:s.bg}}>{s.icon}</div>
            <div>
              <div className="hab-stat-lbl">{s.lbl}</div>
              <div className="hab-stat-val">{s.val}</div>
              <div className="hab-stat-sub">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Body */}
    <div className="hab-body">
      {/* Main: weekly grid */}
      <div className="hab-main">
        <div className="hab-card">
          <div className="hab-card-hd">
            <div className="hab-card-ttl">Weekly check-in</div>
            <div className="hab-card-sub">Tick each day you complete a habit</div>
          </div>
          {/* Column headers */}
          <div className="hab-grid-hd">
            <div/>
            {DAYS.map(d=><div key={d} className="hab-grid-dl" style={d===TODAY_DAY&&habitViewWeek===0?{color:"var(--gold-deep)"}:{}}>{d}</div>)}
            <div className="hab-grid-dl">Week</div>
            <div/>
          </div>
          {/* Habit rows */}
          {viewHabs.length===0&&<div className="emp" style={{padding:"20px 18px"}}>No habits yet ✦</div>}
          {viewHabs.map(hab=>{
            const wkCount=hab.days.filter(Boolean).length;
            return(
              <div key={hab.id} className="hab-row">
                {/* Name + icon */}
                <div className="hab-ri">
                  <div className="ip-wrap" style={{position:"relative"}} onClick={e=>e.stopPropagation()}>
                    <div className="hab-icon-btn" style={{background:hab.color+"22"}} onClick={()=>setIconFor(iconFor===hab.id?null:hab.id)}>
                      {HI(hab.icon,hab.color,16)}
                    </div>
                    {iconFor===hab.id&&(
                      <div className="hab-ip">
                        {HABIT_ICON_LIST.map(ico=>(
                          <div key={ico} className={`hab-ip-ico ${hab.icon===ico?"sel":""}`} style={{background:hab.color+"15"}} onClick={()=>{setHabits(h=>h.map(hh=>hh.id===hab.id?{...hh,icon:ico}:hh));setIconFor(null);}}>
                            {HI(ico,hab.color,14)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {editHabit===hab.id
                    ?<input className="ii" autoFocus value={editHName} onChange={e=>setEditHName(e.target.value)} onBlur={()=>saveEH(hab.id)} onKeyDown={e=>e.key==="Enter"&&saveEH(hab.id)} style={{fontSize:12,flex:1,minWidth:0}}/>
                    :<span className="hab-rname" onClick={()=>startEH(hab)}>{hab.name}</span>
                  }
                </div>
                {/* Day checkboxes */}
                {hab.days.map((ck,i)=>(
                  <div key={i} className={`hab-check ${ck?"ck":""}`}
                    style={ck?{background:hab.color}:{}}
                    onClick={()=>habitViewWeek===0&&toggleDay(hab.id,i)}>
                    {ck&&<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                ))}
                {/* Week count */}
                <div className="hab-week-ct">{wkCount}/7</div>
                {/* Actions */}
                <div style={{display:"flex",gap:2,opacity:0}} className="ha">
                  <button className="sb2" onClick={()=>startEH(hab)}>✏️</button>
                  <button className="sb2 d" onClick={()=>delHabit(hab.id)}>×</button>
                </div>
              </div>
            );
          })}
          {/* Add habit */}
          {habitViewWeek===0&&(
            <div className="hab-add-row">
              <input className="inp" style={{flex:1,fontSize:12}} placeholder="Add a new habit…" value={newHabit} onChange={e=>setNewHabit(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addHabit()}/>
              <button className="bp" onClick={addHabit} style={{fontSize:12,padding:"7px 14px"}}>+ Add habit</button>
            </div>
          )}
        </div>

        {/* Bar chart */}
        {habitViewWeek===0&&(
          <div className="hab-card" style={{marginTop:16,padding:"16px 18px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <div>
                <div className="hab-card-ttl" style={{fontSize:13}}>Habits completed per day</div>
                <div className="hab-card-sub">This week</div>
              </div>
            </div>
            <div className="bc" style={{gap:12}}>
              {graphData.map((d,i)=>(
                <div key={i} className="bcol">
                  <div className="bv" style={{fontSize:11}}>{d.count>0?d.count:""}</div>
                  <div className="bar" style={{height:`${(d.count/maxBar)*80}px`,background:d.count>0?`linear-gradient(to top,${HCOLORS[i%HCOLORS.length]},${HCOLORS[(i+1)%HCOLORS.length]})`:"var(--parchment)",borderRadius:"4px 4px 0 0",minHeight:4}}/>
                  <div className="bl" style={{fontSize:10,color:d.day===TODAY_DAY?"var(--gold-deep)":"var(--ink-light)",fontWeight:d.day===TODAY_DAY?600:400}}>{d.day}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:16,paddingTop:14,borderTop:"1px solid var(--border)",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink-light)"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 21C12 21 4 14 4 9C4 6.5 6 4 9 4C10.5 4 12 5.5 12 5.5C12 5.5 13.5 4 15 4C18 4 20 6.5 20 9C20 14 12 21 12 21Z" fill="#C47C6A"/></svg>
              Consistency is progress. You're building a beautiful routine. Keep going!
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{marginLeft:"auto"}}><path d="M12 21C12 21 4 14 4 9C4 6.5 6 4 9 4C10.5 4 12 5.5 12 5.5C12 5.5 13.5 4 15 4C18 4 20 6.5 20 9C20 14 12 21 12 21Z" stroke="#C47C6A" strokeWidth="1.5" fill="none"/></svg>
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <div className="hab-side">
        {/* Longest streaks */}
        <div className="side-card">
          <div className="side-ttl" style={{marginBottom:12}}>Longest Streaks</div>
          {longestStreaks.length===0&&<div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--ink-light)"}}>Complete habits to build streaks ✦</div>}
          {longestStreaks.map((h,i)=>(
            <div key={h.id} className="streak-row">
              <div className="streak-icon" style={{background:h.color+"22"}}>
                {HI(h.icon,h.color,16)}
              </div>
              <div className="streak-name">{h.name}</div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div className="streak-days">{h.str}</div>
                <div className="streak-days-lbl">days</div>
              </div>
            </div>
          ))}
          {longestStreaks.length>0&&<button onClick={()=>setPage("habits")} style={{background:"none",border:"none",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--gold-deep)",cursor:"pointer",marginTop:8,width:"100%",textAlign:"right"}}>View all habits →</button>}
        </div>

        {/* Completion rate donut */}
        <div className="side-card">
          <div className="side-ttl" style={{marginBottom:12}}>Habit completion rate</div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div className="donut-wrap">
              {(()=>{
                const r=32,cir=2*Math.PI*r;
                const done=habitDonePct/100*cir;
                const part=habitPartPct/100*cir;
                const miss=habitMissPct/100*cir;
                return(
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r={r} fill="none" stroke="#e8e2db" strokeWidth="10"/>
                    <circle cx="40" cy="40" r={r} fill="none" stroke="#7a9070" strokeWidth="10"
                      strokeDasharray={`${done} ${cir-done}`} strokeDashoffset={cir*0.25} strokeLinecap="butt" transform="rotate(-90 40 40)"/>
                    <circle cx="40" cy="40" r={r} fill="none" stroke="#c9a87c" strokeWidth="10"
                      strokeDasharray={`${part} ${cir-part}`} strokeDashoffset={cir*0.25-done} strokeLinecap="butt" transform="rotate(-90 40 40)"/>
                  </svg>
                );
              })()}
              <div className="donut-val">{habitDonePct}%</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:7,flex:1}}>
              {[{label:"Completed",pct:habitDonePct,c:"#7a9070"},{label:"Partially",pct:habitPartPct,c:"#c9a87c"},{label:"Missed",pct:habitMissPct,c:"#d4cdc6"}].map(r=>(
                <div key={r.label} style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:r.c,flexShrink:0}}/>
                  <span style={{fontSize:11,color:"var(--ink)",flex:1}}>{r.label}</span>
                  <span style={{fontSize:11,fontWeight:600,color:"var(--ink)"}}>{r.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* This week's insight */}
        <div className="side-card">
          <div className="side-ttl" style={{marginBottom:10}}>This week's insight</div>
          <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:12}}>
            <div style={{width:28,height:28,borderRadius:8,background:"#f0f0e8",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 5C6 14 10 18 19 18" stroke="#B89576" strokeWidth="2" strokeLinecap="round"/><circle cx="7" cy="6" r="2" fill="#B89576"/><circle cx="18" cy="17" r="2" fill="#B89576"/></svg>
            </div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink)",lineHeight:1.5}}>{habitInsight}</div>
          </div>
          {longestStreaks[0]&&longestStreaks[0].str>=3&&(
            <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <div style={{width:28,height:28,borderRadius:8,background:"#fdf7f0",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3C12 3 7 10 7 13C7 16 9 18 12 18C15 18 17 16 17 13C17 10 12 3 12 3Z" fill="#c9870a"/></svg>
              </div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink)",lineHeight:1.5}}>
                Try stacking '{longestStreaks[0].name}' with your morning routine to make it stick.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
})()}

        {/* ── DASHBOARD ── */}
        {page==="dashboard"&&(
<div style={{padding:"0 8px"}}>
  {/* Page header */}
  <div className="dash-page-header">
    <div>
      <div className="dash-page-title">Bonjour, <em>Sabina</em></div>
      <div className="dash-page-date">{NOW.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
    </div>
    <div className="dash-search">
      <div className="dash-search-bar">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        Search anything…
        <span style={{marginLeft:"auto",fontSize:10,color:"var(--border)",border:"1px solid var(--border)",borderRadius:4,padding:"1px 5px"}}>⌘K</span>
      </div>
      <div className="dash-icon-btn" style={{position:"relative"}} onClick={e=>{e.stopPropagation();setShowNotifs(s=>!s);if(!showNotifs)setNotifications(ns=>ns.map(n=>({...n,read:true})));}} >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        {unreadNotifs>0&&<div className="notif-badge">{unreadNotifs}</div>}
        {showNotifs&&(
          <div className="notif-panel" onClick={e=>e.stopPropagation()}>
            <div className="notif-hd">
              <span style={{fontFamily:"'Playfair Display',serif",fontSize:13,color:"var(--ink)"}}>Notifications</span>
              {notifications.length>0&&<button style={{background:"none",border:"none",fontSize:10,color:"var(--ink-light)",cursor:"pointer"}} onClick={()=>setNotifications([])}>Clear all</button>}
            </div>
            {notifications.length===0&&<div style={{padding:"16px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink-light)"}}>No notifications yet ✦</div>}
            {[...notifications].reverse().slice(0,5).map(n=>(
              <div key={n.id} className={`notif-item ${n.read?"":"unread"}`}>
                <div style={{fontWeight:n.read?400:500,marginBottom:2}}>{n.text}</div>
                <div style={{fontSize:10,color:"var(--ink-light)"}}>{n.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="dash-icon-btn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></div>
    </div>
  </div>

  {/* Top row: Progress card + Quote */}
  <div className="dash-top-row">
    <div className="prog-card">
      {/* 1 — Photo with circular progress ring */}
      <div className="prog-ring-col">
        {(()=>{
          const R=46,C=2*Math.PI*R;
          const rc=dayPct===100?"var(--sage)":dayPct>=60?"#c9a87c":"var(--ink-light)";
          return(
            <svg width="120" height="120" viewBox="0 0 120 120" style={{filter:"drop-shadow(0 2px 10px rgba(201,168,124,.18))"}}>
              <circle cx="60" cy="60" r={R} fill="none" stroke="var(--parchment)" strokeWidth="6"/>
              <circle cx="60" cy="60" r={R} fill="none" stroke={rc} strokeWidth="6"
                strokeDasharray={C} strokeDashoffset={C*(1-dayPct/100)}
                strokeLinecap="round" transform="rotate(-90 60 60)" style={{transition:"stroke-dashoffset .6s"}}/>
              <clipPath id="ppClip"><circle cx="60" cy="60" r="36"/></clipPath>
              <image href={sabinaPhoto} x="24" y="24" width="72" height="72" clipPath="url(#ppClip)" preserveAspectRatio="xMidYMid slice"/>
            </svg>
          );
        })()}
      </div>
      {/* 2 — Big % number + bar */}
      <div className="prog-center">
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink-light)",letterSpacing:".06em",marginBottom:2}}>Today's Progress</div>
        <div style={{display:"flex",alignItems:"baseline",gap:4,margin:"2px 0 4px"}}>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:52,fontWeight:600,lineHeight:1,color:dayPct===100?"var(--sage)":dayPct>=60?"var(--gold-deep)":"var(--ink)"}}>{dayPct}</span>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:"var(--ink-light)",fontWeight:400}}>%</span>
        </div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink-light)",marginBottom:12}}>{dayDone} of {dayTotal} tasks completed</div>
        <div style={{height:6,background:"var(--parchment)",borderRadius:4,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${dayPct}%`,background:dayPct===100?"var(--sage)":"linear-gradient(90deg,#c9a87c,#a8865a)",borderRadius:4,transition:"width .6s"}}/>
        </div>
      </div>
      {/* 3 — Category bullets */}
      <div className="prog-bullets">
        {[
          {label:"Habits",done:habitsDoneToday,total:habitsTotal,color:"#c9a87c"},
          {label:"To-Do List",done:todosDoneToday,total:todosTotalToday,color:"#7a9070"},
          {label:"Ritual",done:cleaningDoneToday,total:cleaningTotalToday,color:"#7090a8"},
        ].map(row=>(
          <div key={row.label} className="prog-bullet-row">
            <div style={{width:7,height:7,borderRadius:"50%",background:row.color}}/>
            <div style={{fontSize:11,color:"var(--ink)"}}>{row.label}</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:12,color:"var(--ink-light)"}}>{row.done}/{row.total}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Quote - light */}
    <div className="qc-light">
      <div className="qc-mark">"</div>
      <div className="qc-light-text">{QUOTE.text}</div>
      <div className="qc-light-dash"/>
    </div>
  </div>

  {/* Activity row + Calendar */}
  {/* Combined activity + mid section — shared 320px right column */}
  <div className="dash-combined-row">
    {/* Left: activity cards + priorities/habits */}
    <div className="dash-left-col">
      {/* Activity row: Move | Exercise | Stand */}
      <div className="dash-act-sub">
        {[
          {icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C8.3 22 5.5 19.2 5.5 15.6C5.5 12.7 7.2 10.6 9.1 8.7C10.4 7.4 11.4 5.9 11.6 3.8C11.7 3.1 12.6 2.8 13.1 3.3C15.3 5.5 18.5 9.1 18.5 14.8C18.5 19 15.6 22 12 22Z" fill="#B89576"/><path d="M12.1 19.4C10.3 19.4 9 18.1 9 16.4C9 15.1 9.8 14.1 10.7 13.2C11.3 12.6 11.8 11.9 11.9 10.9C12 10.4 12.6 10.2 13 10.6C14 11.7 15.2 13.3 15.2 15.8C15.2 17.9 13.8 19.4 12.1 19.4Z" fill="#F4EFE8"/></svg>,label:"Move",val:todayFit&&fitMove!=null?Math.round(fitMove):null,goal:moveGoal,unit:"cal",color:"#B89576",wave:"M0,20 C15,8 30,30 45,18 C60,6 75,28 90,16 C105,4 120,22 135,14 C150,6 165,24 180,16 L180,50 L0,50Z"},
          {icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.5 8V16" stroke="#A9B39F" strokeWidth="2" strokeLinecap="round"/><path d="M17.5 8V16" stroke="#A9B39F" strokeWidth="2" strokeLinecap="round"/><path d="M4 10V14" stroke="#A9B39F" strokeWidth="2" strokeLinecap="round"/><path d="M20 10V14" stroke="#A9B39F" strokeWidth="2" strokeLinecap="round"/><path d="M7.5 12H16.5" stroke="#A9B39F" strokeWidth="2" strokeLinecap="round"/></svg>,label:"Exercise",val:todayFit&&fitEx!=null?Math.round(fitEx):null,goal:exGoal,unit:"min",color:"#A9B39F",wave:"M0,25 C20,12 35,32 55,20 C75,8 90,30 110,18 C130,6 145,28 165,18 C175,14 178,20 180,18 L180,50 L0,50Z"},
          {icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="5" r="2" fill="#9BAFC7"/><path d="M12 8V15" stroke="#9BAFC7" strokeWidth="2" strokeLinecap="round"/><path d="M8.5 10.5H15.5" stroke="#9BAFC7" strokeWidth="2" strokeLinecap="round"/><path d="M10 21L12 15L14 21" stroke="#9BAFC7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,label:"Stand",val:todayFit&&standHrs!=null?standHrs:null,goal:standGoal,unit:"hrs",color:"#9BAFC7",wave:"M0,18 C25,10 40,28 60,16 C80,4 95,26 115,14 C135,2 150,24 170,14 C176,11 178,16 180,14 L180,50 L0,50Z"},
        ].map(s=>(
          <div key={s.label} className="act-card">
            <div className="act-label">{s.label}</div>
            <div className="act-icon">{s.icon}</div>
            <div className="act-val">{s.val!=null?s.val:"—"}</div>
            <div className="act-goal">/{s.goal}{s.unit}</div>
            <svg className="act-wave" viewBox="0 0 180 50" preserveAspectRatio="none" height="22">
              <path d={s.wave} fill={s.color}/>
            </svg>
          </div>
        ))}
      </div>

      {/* Today's priorities — full width */}
      <div className="card" style={{display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:4}}>
          <div className="ct" style={{marginBottom:0}}>Today's priorities</div>
          <button onClick={()=>setPage("todos")} style={{background:"none",border:"none",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--gold-deep)",cursor:"pointer"}}>View all</button>
        </div>
        <div className="cs" style={{marginBottom:10}}>{todos.filter(t=>!t.done&&t.date===TODAY).length} tasks</div>
        {/* Top 3 always visible, rest scrollable */}
        <div className="tl" style={{marginBottom:10}}>
          {byPri(todos.filter(t=>!t.done&&t.date===TODAY)).slice(0,3).map(todo=>(
            <div key={todo.id} className="ti">
              <div className="tc" onClick={()=>toggleTodo(todo.id)}/>
              <div className="tb2">
                <div className="tt">{todo.text}</div>
                <div className="tm"><span className={`tg ${todo.tag}`}>{todo.tag}</span></div>
              </div>
            </div>
          ))}
          {todos.filter(t=>!t.done&&t.date===TODAY).length===0&&<div className="emp">All caught up ✦</div>}
        </div>
        {/* Overflow: items 4+ scrollable */}
        {byPri(todos.filter(t=>!t.done&&t.date===TODAY)).length>3&&(
          <div className="tl" style={{maxHeight:100,overflowY:"auto",marginBottom:10}}>
            {byPri(todos.filter(t=>!t.done&&t.date===TODAY)).slice(3).map(todo=>(
              <div key={todo.id} className="ti">
                <div className="tc" onClick={()=>toggleTodo(todo.id)}/>
                <div className="tb2">
                  <div className="tt">{todo.text}</div>
                  <div className="tm"><span className={`tg ${todo.tag}`}>{todo.tag}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{borderTop:"1px solid var(--border)",paddingTop:10,marginTop:"auto"}}>
          <div className="row">
            <input className="inp" style={{fontSize:12}} placeholder="+ Add new task" value={newTodo} onChange={e=>setNewTodo(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTodoDash()}/>
            <button className="bp" onClick={addTodoDash}>Add</button>
          </div>
        </div>
      </div>

      {/* Habits — full width below priorities */}
      <div className="card">
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:4}}>
          <div className="ct" style={{marginBottom:0}}>Habits</div>
          <button onClick={()=>setPage("habits")} style={{background:"none",border:"none",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--gold-deep)",cursor:"pointer"}}>View all</button>
        </div>
        <div className="cs" style={{marginBottom:12}}>This week</div>
        <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:180,overflowY:"auto"}}>
          {habits.map(hab=>(
            <div key={hab.id} className="dh-row">
              <div className="dh-icon" style={{background:hab.color+"22"}}>{HI(hab.icon,hab.color,16)}</div>
              <div className="dh-name">{hab.name}</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--ink-light)",marginRight:6}}>{streak(hab.days)} days</div>
              <div className="dh-dots">
                {hab.days.map((done,i)=><div key={i} className={`dh-dot${done?" on":""}`}/>)}
              </div>
            </div>
          ))}
          {habits.length===0&&<div className="emp">No habits yet ✦</div>}
        </div>
      </div>
    </div>

    {/* Right column: Focus Timer + Rituel */}
    <div className="dash-right-col">
      {/* Pomodoro timer */}
      <div className="act-card" style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,padding:"12px 14px"}}>
        <div className="act-label" style={{alignSelf:"flex-start"}}>Focus Timer</div>
        <div className="pomo-presets" style={{gap:3,justifyContent:"center"}}>
          {POMO_PRESETS.map(p=>(
            <button key={p.s} className={`pomo-preset${pomoDur===p.s?" on":""}`} onClick={()=>pomoSelect(p.s)}>{p.label}</button>
          ))}
        </div>
        <svg width="76" height="76" viewBox="0 0 110 110" className="pomo-svg" style={{margin:"2px 0"}}>
          <circle cx="55" cy="55" r={POMO_R} fill="none" stroke="var(--parchment)" strokeWidth="7"/>
          <circle cx="55" cy="55" r={POMO_R} fill="none" stroke={pomoColor} strokeWidth="7"
            strokeDasharray={POMO_CIRC} strokeDashoffset={POMO_CIRC-pomoDash}
            strokeLinecap="round" transform="rotate(-90 55 55)"/>
          <text x="55" y="51" textAnchor="middle" fontFamily="DM Sans" fontSize="14" fontWeight="500" fill="var(--ink)">{fmtPomo(pomoLeft)}</text>
          <text x="55" y="64" textAnchor="middle" fontFamily="Cormorant Garamond" fontSize="9" fill="var(--ink-light)" fontStyle="italic">{pomoActive?"focus ✦":"ready"}</text>
        </svg>
        <div style={{display:"flex",gap:5}}>
          {!pomoActive
            ?<button className="pomo-btn start" style={{padding:"5px 14px",fontSize:10}} onClick={pomoStart}>▶ Start</button>
            :<button className="pomo-btn pause" style={{padding:"5px 14px",fontSize:10}} onClick={pomoPause}>⏸ Pause</button>
          }
          <button className="pomo-btn stop" style={{padding:"5px 10px",fontSize:10}} onClick={pomoStop}>↺</button>
        </div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:10,color:"var(--ink-light)"}}>{pomoCount} sessions completed</div>
      </div>

      {/* Rituel */}
      <div className="card">
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:4}}>
          <div className="ct" style={{marginBottom:0}}>Rituel</div>
          <button onClick={()=>setPage("cleaning")} style={{background:"none",border:"none",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--gold-deep)",cursor:"pointer"}}>View all</button>
        </div>
        <div className="cs" style={{marginBottom:10}}>{TODAY_DAY}'s tasks</div>
        <div style={{maxHeight:160,overflowY:"auto",display:"flex",flexDirection:"column",gap:6}}>
          {cleaningTodayArr.map((task,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,paddingBottom:6,borderBottom:"1px solid var(--border)"}}>
              <div onClick={()=>toggleClean(TODAY_DAY,i)} style={{width:14,height:14,borderRadius:"50%",border:`1.5px solid ${task.done?"#7090a8":"rgba(122,98,82,.3)"}`,background:task.done?"#7090a8":"transparent",cursor:"pointer",flexShrink:0,transition:"all .15s"}}/>
              <span style={{fontSize:11.5,color:task.done?"var(--ink-light)":"var(--ink)",textDecoration:task.done?"line-through":"none",fontFamily:"'DM Sans',sans-serif",lineHeight:1.3}}>{task.text}</span>
            </div>
          ))}
          {cleaningTodayArr.length===0&&<div className="emp">Rest day ✦</div>}
        </div>
      </div>

      {/* Recent Wins */}
      <div className="card">
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:12}}>
          <div className="ct" style={{marginBottom:0}}>Recent Wins</div>
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--gold-deep)"}}>auto</span>
        </div>
        <div style={{maxHeight:180,overflowY:"auto",display:"flex",flexDirection:"column",gap:8}}>
          {recentWins.length===0?(
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink-light)",textAlign:"center",padding:"16px 0"}}>Complete tasks to unlock wins ✦</div>
          ):recentWins.map((w,i)=>{
            const icons={
              milestone:<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#F3EAE1"/><path d="M12 4.5L13.7 9.2L18.7 9.4L14.8 12.5L16.2 17.3L12 14.6L7.8 17.3L9.2 12.5L5.3 9.4L10.3 9.2L12 4.5Z" fill="#B89576"/></svg>,
              streak:<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#F3EAE1"/><path d="M12.2 21C8.9 21 6.4 18.5 6.4 15.2C6.4 12.7 7.7 10.9 9.3 9.3C10.5 8.1 11.3 6.7 11.5 4.7C11.6 4 12.5 3.7 13 4.2C15 6.2 17.6 9.3 17.6 14.4C17.6 18.3 15.2 21 12.2 21Z" fill="#B89576"/><path d="M12.2 18.6C10.7 18.6 9.6 17.5 9.6 16.1C9.6 15 10.2 14.2 11 13.4C11.5 12.9 11.9 12.2 12 11.4C12.1 10.9 12.7 10.7 13 11.1C13.9 12.1 14.8 13.3 14.8 15.4C14.8 17.3 13.6 18.6 12.2 18.6Z" fill="#FDFBF8"/></svg>,
              gratitude:<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#F7EDEA"/><path d="M12 18.5C11.8 18.5 11.6 18.4 11.4 18.3C8.2 16.1 6 14.2 6 11.3C6 9.5 7.4 8.1 9.1 8.1C10.1 8.1 11.1 8.6 11.7 9.4C12.3 8.6 13.3 8.1 14.3 8.1C16 8.1 17.4 9.5 17.4 11.3C17.4 14.2 15.2 16.1 12 18.3Z" fill="#C99A8C"/></svg>,
              productive:<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#EEF3EA"/><path d="M7 12.2L10.4 15.6L17.4 8.4" stroke="#A9B39F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              rituel:<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#EEF3F8"/><path d="M8 17.5H16" stroke="#9BAFC7" strokeWidth="2" strokeLinecap="round"/><path d="M10 7H14L15 17H9L10 7Z" fill="#9BAFC7"/><path d="M9.5 7H14.5" stroke="#FDFBF8" strokeWidth="1.4" strokeLinecap="round"/></svg>,
              goal:<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#F3EAE1"/><circle cx="12" cy="12" r="5.5" stroke="#A88B6F" strokeWidth="2"/><circle cx="12" cy="12" r="2" fill="#A88B6F"/><path d="M15.5 8.5L18 6" stroke="#A88B6F" strokeWidth="2" strokeLinecap="round"/></svg>,
            };
            return(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 10px",background:"#ffffff",borderRadius:10,border:"1px solid rgba(26,20,16,.06)"}}>
                <div style={{flexShrink:0,marginTop:1}}>{icons[w.type]||icons.productive}</div>
                <div>
                  <div style={{fontSize:10,fontWeight:500,color:"var(--ink-light)",letterSpacing:".06em",textTransform:"uppercase",marginBottom:2}}>{w.title}</div>
                  <div style={{fontSize:11.5,color:"var(--ink)",fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{w.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>

  {/* Bottom row: Upcoming + Goals — equal height */}
  <div className="dash-bottom-row">
    {/* Upcoming */}
    <div className="dash-bottom-card">
      <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:12}}>
        <div className="ct" style={{marginBottom:0}}>Upcoming</div>
        <button onClick={()=>setPage("calendar")} style={{background:"none",border:"none",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--gold-deep)",cursor:"pointer"}}>View all</button>
      </div>
      {upcoming.length===0&&<div className="emp">No upcoming events ✦</div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {upcoming.slice(0,2).map(e=>{
          const d=new Date(e.date+"T00:00:00");
          return(
            <div key={e.id} onClick={ev=>openEditEv(e,ev)} style={{cursor:"pointer",background:"var(--parchment)",borderRadius:10,padding:"12px 14px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <div style={{background:"var(--ivory)",borderRadius:6,padding:"4px 8px",textAlign:"center",flexShrink:0}}>
                  <div style={{fontSize:8,color:"var(--ink-light)",letterSpacing:".1em",textTransform:"uppercase"}}>{MONTHS[d.getMonth()].slice(0,3)}</div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:600,color:"var(--ink)",lineHeight:1}}>{d.getDate()}</div>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,color:"var(--ink)",fontWeight:500,lineHeight:1.3,marginBottom:4}}>{e.title}</div>
                  <span className={`tg ${e.tag||""}`}>{e.tag||"Event"}</span>
                </div>
              </div>
              {!e.allDay&&e.time&&<div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--ink-light)"}}>{e.time}</div>}
            </div>
          );
        })}
      </div>
    </div>

    {/* Goals */}
    <div className="dash-bottom-card">
      <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:12}}>
        <div className="ct" style={{marginBottom:0}}>Goals</div>
        <button onClick={()=>setPage("goals")} style={{background:"none",border:"none",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--gold-deep)",cursor:"pointer"}}>View all</button>
      </div>
      {allGoals.length===0&&<div className="emp">No goals yet ✦</div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {allGoals.slice(0,2).map(g=>{
          const msDone=g.milestones.filter(m=>m.done).length;
          const msTotal=g.milestones.length;
          return(
            <div key={g.id} style={{background:"var(--parchment)",borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontSize:11.5,color:"var(--ink)",fontWeight:500,marginBottom:6,lineHeight:1.3}}>{g.title}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:600,color:g.color||"var(--gold-deep)",lineHeight:1,marginBottom:4}}>{g.progress}%</div>
              <div style={{height:4,background:"rgba(0,0,0,.08)",borderRadius:2,overflow:"hidden",marginBottom:6}}>
                <div style={{height:"100%",width:`${g.progress}%`,background:g.color||"var(--gold)",borderRadius:2,transition:"width .5s"}}/>
              </div>
              {msTotal>0&&<div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:10,color:"var(--ink-light)"}}>{msDone}/{msTotal} milestones</div>}
            </div>
          );
        })}
      </div>
    </div>
  </div>

</div>
)}

        {/* ── TO-DO LISTS ── */}
        {page==="todos"&&(()=>{
          // Helpers
          const addDays=(dateStr,n)=>{const d=new Date(dateStr+"T12:00:00");d.setDate(d.getDate()+n);return _ld(d);};
          const viewDate=addDays(TODAY,viewDayOffset);
          const VIEW_LBL=viewDayOffset===0?"Today":viewDayOffset===1?"Tomorrow":new Date(viewDate+"T00:00:00").toLocaleDateString("en-GB",{weekday:"long"});
          const VIEW_FULL=new Date(viewDate+"T00:00:00").toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"});
          // Priority flag
          const pflag=(p)=>{
            const cfg={high:{c:"#d93535",l:"High"},medium:{c:"#c9870a",l:"Medium"},low:{c:"#9a9a9a",l:"Low"}};
            const {c,l}=cfg[p||"medium"];
            return(<div className="pflag"><svg width="10" height="12" viewBox="0 0 10 12" fill="none"><line x1="1" y1="0" x2="1" y2="12" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><path d="M1 1.5 L9.5 4.5 L1 7.5Z" fill={c}/></svg><span style={{color:c}}>{l}</span></div>);
          };
          // Data
          const pastTodos=todos.filter(t=>t.date<TODAY);
          const pastMonths=[...new Set(pastTodos.map(t=>t.date.slice(0,7)))].sort((a,b)=>b.localeCompare(a));
          const tTotal=todos.filter(t=>t.date===viewDate).length;
          const tDone=todos.filter(t=>t.done&&t.date===viewDate).length;
          const pct=tTotal?Math.round(tDone/tTotal*100):0;
          const viewTodos=byPri(todos.filter(t=>{
            const md=t.date===viewDate;
            const mf=tFilter==="all"||(tFilter==="active"?!t.done:t.done);
            const mt=tagFilter==="all"||t.tag===tagFilter;
            return md&&mf&&mt;
          }));
          // Modal add
          const handleModalAdd=()=>{
            if(!newModalText.trim())return;
            setTodos(ts=>[...ts,{id:Date.now(),text:newModalText,done:false,tag:newModalTag,date:viewDate,priority:newModalPri}]);
            setNewModalText("");setNewModalPri("medium");setShowNewModal(false);
          };
          return(
        <div className="todo-wrap">


          {/* ── New Task Modal ── */}
          {showNewModal&&(
            <div className="mov" onClick={()=>setShowNewModal(false)}>
              <div className="mbox" onClick={e=>e.stopPropagation()}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"var(--ink)",marginBottom:3}}>Add Task</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--gold-deep)",marginBottom:20}}>Adding to {VIEW_LBL} · {new Date(viewDate+"T00:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"long"})}</div>
                <label className="mlbl">Task</label>
                <input className="minp" style={{marginBottom:14}} placeholder="What needs to be done?" value={newModalText} onChange={e=>setNewModalText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleModalAdd()} autoFocus/>
                <label className="mlbl">Priority</label>
                <div style={{display:"flex",gap:6,marginTop:5,marginBottom:14}}>
                  {[["high","#d93535"],["medium","#c9870a"],["low","#9a9a9a"]].map(([p,c])=>(
                    <button key={p} className="mpri" style={newModalPri===p?{background:c,color:"#fff",borderColor:c}:{}} onClick={()=>setNewModalPri(p)}>{p}</button>
                  ))}
                </div>
                <label className="mlbl">Tag</label>
                <select className="msel" style={{marginBottom:22}} value={newModalTag} onChange={e=>setNewModalTag(e.target.value)}>
                  {tags.map(tag=><option key={tag}>{tag}</option>)}
                </select>
                <div style={{display:"flex",gap:8}}>
                  <button style={{flex:1,padding:"10px",border:"1px solid var(--border)",borderRadius:10,background:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer",color:"var(--ink)"}} onClick={()=>setShowNewModal(false)}>Cancel</button>
                  <button style={{flex:2,padding:"10px",border:"none",borderRadius:10,background:"var(--ink)",color:"#f4ede3",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,cursor:"pointer"}} onClick={handleModalAdd}>Add Task</button>
                </div>
              </div>
            </div>
          )}

          {/* ── Edit Task Modal ── */}
          {editModal&&(
            <div className="mov" onClick={()=>setEditModal(null)}>
              <div className="mbox" onClick={e=>e.stopPropagation()}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"var(--ink)",marginBottom:20}}>Edit Task</div>
                <label className="mlbl">Task</label>
                <input className="minp" style={{marginBottom:14}} value={editModal.text} onChange={e=>setEditModal(m=>({...m,text:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&(()=>{if(!editModal.text.trim())return;setTodos(ts=>ts.map(t=>t.id===editModal.id?{...t,...editModal}:t));setEditModal(null);})()} autoFocus/>
                <label className="mlbl">Priority</label>
                <div style={{display:"flex",gap:6,marginTop:5,marginBottom:14}}>
                  {[["high","#d93535"],["medium","#c9870a"],["low","#9a9a9a"]].map(([p,c])=>(
                    <button key={p} className="mpri" style={editModal.priority===p?{background:c,color:"#fff",borderColor:c}:{}} onClick={()=>setEditModal(m=>({...m,priority:p}))}>{p}</button>
                  ))}
                </div>
                <label className="mlbl">Tag</label>
                <select className="msel" style={{marginBottom:22}} value={editModal.tag} onChange={e=>setEditModal(m=>({...m,tag:e.target.value}))}>
                  {tags.map(tag=><option key={tag}>{tag}</option>)}
                </select>
                <div style={{display:"flex",gap:8}}>
                  <button style={{flex:1,padding:"10px",border:"1px solid var(--border)",borderRadius:10,background:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer",color:"var(--ink)"}} onClick={()=>setEditModal(null)}>Cancel</button>
                  <button style={{flex:2,padding:"10px",border:"none",borderRadius:10,background:"var(--ink)",color:"#f4ede3",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,cursor:"pointer"}} onClick={()=>{if(!editModal.text.trim())return;setTodos(ts=>ts.map(t=>t.id===editModal.id?{...t,...editModal}:t));setEditModal(null);}}>Save changes</button>
                </div>
              </div>
            </div>
          )}

          {/* ── Header ── */}
          <div className="todo-top">
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:0}}>
              <div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:400,color:"var(--ink)"}}>To-Do <em style={{fontStyle:"italic",color:"var(--gold-deep)"}}>Lists</em></div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:13,color:"var(--ink-light)",marginTop:3}}>Stay organised, focus on what matters.</div>
              </div>
              <button onClick={()=>setShowNewModal(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 20px",background:"var(--ink)",color:"#f4ede3",border:"none",borderRadius:20,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap",marginTop:6}}>+ New Task</button>
            </div>
            {/* Progress card — full width */}
            <div className="todo-prog-full">
              <div style={{display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
                <div style={{width:44,height:44,borderRadius:10,background:"#f3ede6",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a87c" strokeWidth="1.75"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,color:"var(--ink)"}}>{VIEW_LBL}</div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--ink-light)"}}>{VIEW_FULL}</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"baseline",gap:4,flexShrink:0}}>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:600,color:"var(--ink)"}}>{tTotal}</span>
                <span style={{fontSize:11,color:"var(--ink-light)"}}>tasks</span>
              </div>
              <div style={{flex:1,minWidth:160}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:11,fontWeight:500,color:"var(--ink-light)"}}>Progress</span>
                  <span style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--ink-light)"}}>{tDone} of {tTotal} done</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{flex:1,height:6,background:"var(--parchment)",borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#c9a87c,#a8865a)",borderRadius:3,transition:"width .5s"}}/>
                  </div>
                  <span style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:600,color:"var(--ink)",flexShrink:0}}>{pct}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Day Navigation ── */}
          <div className="todo-navrow">
            <button className="tdnav" disabled={viewDayOffset===0} onClick={()=>setViewDayOffset(o=>o-1)}>‹</button>
            <div className="tdnlbl">
              <span style={{fontWeight:600}}>{VIEW_LBL}</span>
              <span style={{fontSize:11,color:"var(--ink-light)",marginLeft:8,fontFamily:"'DM Sans',sans-serif"}}>{new Date(viewDate+"T00:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</span>
            </div>
            <button className="tdnav" disabled={viewDayOffset>=6} onClick={()=>setViewDayOffset(o=>o+1)}>›</button>
            {viewDayOffset>0&&<button className="tdnback" onClick={()=>setViewDayOffset(0)}>← Today</button>}
          </div>

          {/* ── Filters ── */}
          <div className="todo-fbar">
            {["all","active","done"].map(f=><button key={f} className={`pb ${tFilter===f?"on":""}`} onClick={()=>setTFilter(f)}>{f==="all"?"All":f==="active"?"To Do":"Completed"}</button>)}
            <div style={{width:1,height:16,background:"var(--border)",margin:"0 3px"}}/>
            <button className={`pb ${tagFilter==="all"?"on":""}`} onClick={()=>setTagFilter("all")}>All tags</button>
            {tags.map(tag=><button key={tag} className={`pb ${tagFilter===tag?"ton":""}`} onClick={()=>setTagFilter(tag)}>{tag}</button>)}
          </div>

          {/* ── Body grid ── */}
          <div className="todo-body">

            {/* Main task list */}
            <div className="todo-main">
              <div className="todo-card">
                {/* Card header with column labels */}
                <div className="todo-chd">
                  <div style={{flex:1,fontFamily:"'Playfair Display',serif",fontSize:15,color:"var(--ink)",display:"flex",alignItems:"center",gap:8}}>
                    {VIEW_LBL}'s Tasks
                    <span style={{background:"var(--parchment)",borderRadius:10,padding:"1px 8px",fontSize:10,color:"var(--ink-light)",fontFamily:"'DM Sans',sans-serif"}}>{viewTodos.length}</span>
                  </div>
                  <div className="todo-cpri">Priority</div>
                  <div style={{width:28}}/>
                </div>

                {/* Task rows */}
                {viewTodos.map((todo,idx)=>{
                  const menuUp=idx>=viewTodos.length-2;
                  return(
                  <div key={todo.id} className="tr2">
                    <div className={`tr2-ck ${todo.done?"done":""}`} onClick={()=>toggleTodo(todo.id)}>
                      {todo.done&&<span style={{fontSize:9,color:"#fff"}}>✓</span>}
                    </div>
                    <div className="tr2-body">
                      <div className={`tr2-txt ${todo.done?"done":""}`} onClick={()=>toggleTodo(todo.id)}>{todo.text}</div>
                      <span className="tr2-tg">{todo.tag}</span>
                    </div>
                    <div className="tr2-pri">{pflag(todo.priority)}</div>
                    <button className="tr2-edit" onClick={e=>{e.stopPropagation();setEditModal({...todo});}} title="Edit task">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button className="tr2-dot" onClick={e=>{e.stopPropagation();setShowTaskMenu(showTaskMenu===todo.id?null:todo.id);}}>⋮</button>
                    {showTaskMenu===todo.id&&(
                      <div className={`tmenu${menuUp?" up":""}`} onClick={e=>e.stopPropagation()}>
                        <div className="tmi" onClick={()=>{setEditModal({...todo});setShowTaskMenu(null);}}>✎ &nbsp;Edit task</div>
                        {viewDayOffset===0&&<div className="tmi" onClick={()=>{setTodos(ts=>ts.map(t=>t.id===todo.id?{...t,date:TOMORROW}:t));setShowTaskMenu(null);}}>→ &nbsp;Move to Tomorrow</div>}
                        {viewDayOffset>0&&<div className="tmi" onClick={()=>{setTodos(ts=>ts.map(t=>t.id===todo.id?{...t,date:TODAY}:t));setShowTaskMenu(null);}}>← &nbsp;Move to Today</div>}
                        <div className="tmi del" onClick={()=>{delTodo(todo.id);setShowTaskMenu(null);}}>✕ &nbsp;Delete</div>
                      </div>
                    )}
                  </div>
                );})}
                {viewTodos.length===0&&<div className="emp" style={{padding:"24px 18px"}}>Nothing planned for {VIEW_LBL.toLowerCase()} ✦</div>}

                {/* Inline add task */}
                <div className="todo-add" onClick={()=>setShowNewModal(true)}>
                  <span style={{fontSize:16,lineHeight:1,marginRight:2}}>+</span> Add Task
                </div>
              </div>

              {/* Previous Lists — only on today view */}
              {viewDayOffset===0&&pastMonths.length>0&&(
                <div style={{marginTop:20}}>
                  <div style={{fontSize:12,fontWeight:500,color:"var(--ink-light)",marginBottom:10}}>Previous Lists</div>
                  {pastMonths.map(month=>{
                    const [yr,mo]=month.split("-");
                    const monthLabel=`${MONTHS[parseInt(mo)-1]} ${yr}`;
                    const monthItems=pastTodos.filter(t=>t.date.startsWith(month));
                    const monthOpen=showMonths[month];
                    const doneCount=monthItems.filter(t=>t.done).length;
                    const monthDates=[...new Set(monthItems.map(t=>t.date))].sort((a,b)=>b.localeCompare(a));
                    return(
                      <div key={month} style={{marginBottom:5}}>
                        <div className="ht" style={{borderRadius:8}} onClick={()=>setShowMonths(s=>({...s,[month]:!s[month]}))}>
                          <span className="hl">{monthLabel}</span>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span className="hc">{doneCount}/{monthItems.length} done</span>
                            <span className={`hav ${monthOpen?"op":""}`}>▼</span>
                          </div>
                        </div>
                        {monthOpen&&monthDates.map(date=>{
                          const dayItems=monthItems.filter(t=>t.date===date);
                          const dayOpen=showHist[date];
                          return(
                            <div key={date} style={{paddingLeft:14,marginTop:3}}>
                              <div className="ht" style={{borderRadius:7,background:"rgba(26,20,16,.02)"}} onClick={()=>setShowHist(h=>({...h,[date]:!h[date]}))}>
                                <span style={{fontSize:12,color:"var(--ink-light)"}}>{fd(date)}</span>
                                <div style={{display:"flex",alignItems:"center",gap:8}}>
                                  <span className="hc">{dayItems.filter(t=>t.done).length}/{dayItems.length}</span>
                                  <span className={`hav ${dayOpen?"op":""}`}>▼</span>
                                </div>
                              </div>
                              {dayOpen&&<div className="his">{dayItems.map(todo=>(
                                <div key={todo.id} className={`ti ${todo.done?"dn":""}`}>
                                  <div className="tc"/>
                                  <div className="tb2"><div className="tt">{todo.text}</div><div className="tm"><span className={`tg ${todo.tag}`}>{todo.tag}</span></div></div>
                                  <button className="td" onClick={()=>delTodo(todo.id)}>×</button>
                                </div>
                              ))}</div>}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Right sidebar ── */}
            <div className="todo-side">
              {/* My Tags */}
              <div className="side-card">
                <div className="side-ttl">My Tags</div>
                <div className="tr">{tags.map(tag=><div key={tag} className="tch">{tag}<button className="tcd" onClick={()=>delTag(tag)}>×</button></div>)}</div>
                <div style={{display:"flex",gap:5,marginTop:10}}>
                  <input className="inp" style={{fontSize:11,flex:1}} placeholder="New tag…" value={newTag} onChange={e=>setNewTag(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTag()}/>
                  <button className="bp" style={{padding:"7px 12px",fontSize:11}} onClick={addTag}>+ Add</button>
                </div>
              </div>
              {/* Completed Today */}
              <div className="side-card">
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <div className="side-ttl" style={{marginBottom:0}}>Completed Today</div>
                  <span style={{background:"var(--parchment)",borderRadius:10,padding:"1px 7px",fontSize:10,color:"var(--ink-light)"}}>{todos.filter(t=>t.done&&t.date===TODAY).length}</span>
                </div>
                {todos.filter(t=>t.done&&t.date===TODAY).length===0&&<div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--ink-light)"}}>No tasks completed yet ✦</div>}
                {todos.filter(t=>t.done&&t.date===TODAY).map(todo=>(
                  <div key={todo.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7,cursor:"pointer"}} onClick={()=>toggleTodo(todo.id)}>
                    <div style={{width:14,height:14,borderRadius:"50%",background:"var(--sage)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span style={{fontSize:8,color:"white"}}>✓</span>
                    </div>
                    <span style={{fontSize:11.5,color:"var(--ink-light)",textDecoration:"line-through",flex:1}}>{todo.text}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
        );})()}

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

        {/* ── GRATITUDE ── */}
        {page==="gratitude"&&(()=>{
          const addDaysG=(s,n)=>{const d=new Date(s+"T12:00:00");d.setDate(d.getDate()+n);return _ld(d);};
          const viewGratDate=addDaysG(TODAY,-gratViewOffset);
          const isToday=gratViewOffset===0;
          const viewGratEntries=gratitude[viewGratDate]||[];
          const viewGratLabel=gratViewOffset===0?"Today":gratViewOffset===1?"Yesterday":new Date(viewGratDate+"T00:00:00").toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"});
          const PROMPTS=["I'm grateful for that moment when…","Something small that made me smile today…","A little thing I almost didn't notice…","Something that could've gone wrong but didn't…","A tiny comfort I appreciated today…"];
          const promptIdx=viewGratEntries.length%PROMPTS.length;
          const weekBarData=DAYS.map((d,i)=>{
            const date=bilWeekDates[i];
            const count=(gratitude[date]||[]).length;
            return{d,count};
          });
          const maxBar=Math.max(...weekBarData.map(b=>b.count),1);
          const saveGratEdit=(date,id)=>{
            if(!gratEditText.trim()){setGratEditId(null);return;}
            setGratitude(g=>({...g,[date]:(g[date]||[]).map(e=>e.id===id?{...e,text:gratEditText.trim()}:e)}));
            setGratEditId(null);setGratEditText("");
          };
          return(
          <div className="grat-wrap">
            {/* Header */}
            <div className="grat-top">
              <div className="grat-hd-row">
                <div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:400,color:"var(--ink)"}}>Gratitude</div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:13,color:"var(--ink-light)",marginTop:3}}>Focus on the good, and watch your life grow.</div>
                </div>
                <button onClick={()=>{setGratViewOffset(0);setTimeout(()=>document.getElementById("grat-input-field")?.focus(),50);}} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 20px",background:"var(--ink)",color:"#f4ede3",border:"none",borderRadius:20,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,cursor:"pointer"}}>+ Add Gratitude</button>
              </div>
            </div>

            {/* Day navigation */}
            <div className="grat-nav-row">
              <button className="grat-nav-btn" onClick={()=>setGratViewOffset(o=>o+1)}>‹</button>
              <div className="grat-nav-lbl">
                <span style={{fontWeight:600}}>{viewGratLabel}</span>
                {gratViewOffset>0&&<span style={{fontSize:11,color:"var(--ink-light)",marginLeft:8,fontFamily:"'DM Sans',sans-serif"}}>{new Date(viewGratDate+"T00:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</span>}
              </div>
              <button className="grat-nav-btn" disabled={gratViewOffset===0} onClick={()=>setGratViewOffset(o=>o-1)}>›</button>
              {gratViewOffset>0&&<button style={{background:"var(--ink)",color:"#f4ede3",border:"none",borderRadius:20,padding:"5px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500,cursor:"pointer"}} onClick={()=>setGratViewOffset(0)}>← Today</button>}
            </div>

            {/* Body */}
            <div className="grat-body">
              {/* LEFT COLUMN */}
              <div style={{display:"flex",flexDirection:"column",gap:16}}>

                {/* Progress card */}
                <div className="grat-card">
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16}}>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,color:"var(--ink)"}}>{viewGratLabel} · {new Date(viewGratDate+"T00:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</div>
                      <div style={{fontSize:11.5,color:"var(--ink-light)",marginTop:2}}>{Math.min(viewGratEntries.length,GRAT_TARGET)} of {GRAT_TARGET} baseline</div>
                      <div style={{position:"relative",display:"flex",alignItems:"center",margin:"18px 0 10px"}}>
                        <div style={{position:"absolute",top:"50%",left:10,right:10,height:2,background:"var(--parchment)",transform:"translateY(-50%)",zIndex:0}}/>
                        <div style={{position:"absolute",top:"50%",left:10,height:2,width:`${viewGratEntries.length>=GRAT_TARGET?100:Math.max(0,((Math.min(viewGratEntries.length,GRAT_TARGET)-1)/(GRAT_TARGET-1))*100)}%`,background:"var(--gold)",transform:"translateY(-50%)",zIndex:1,transition:"width .5s",maxWidth:"calc(100% - 20px)"}}/>
                        <div style={{display:"flex",justifyContent:"space-between",width:"100%",position:"relative",zIndex:2}}>
                          {Array.from({length:GRAT_TARGET},(_,i)=>(
                            <div key={i} style={{width:22,height:22,borderRadius:"50%",background:i<viewGratEntries.length?"var(--gold)":"#fff",border:`2px solid ${i<viewGratEntries.length?"var(--gold)":"var(--parchment)"}`,transition:"all .3s",boxShadow:i<viewGratEntries.length?"0 0 0 3px rgba(201,168,124,.2)":"none"}}/>
                          ))}
                        </div>
                      </div>
                      {viewGratEntries.length>=GRAT_TARGET
                        ?<div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--gold-deep)"}}>Baseline reached. Well done! ✨</div>
                        :<div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink-light)"}}>{isToday?`${GRAT_TARGET-viewGratEntries.length} more to reach today's baseline`:"Baseline not reached this day"}</div>
                      }
                    </div>
                    <div style={{width:220,background:"#faf8f5",borderRadius:12,padding:"16px 18px",flexShrink:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                        <span style={{fontSize:16}}>🌱</span>
                        <span style={{fontFamily:"'Playfair Display',serif",fontSize:13,color:"var(--ink)"}}>Why gratitude?</span>
                      </div>
                      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:"var(--ink-light)",lineHeight:1.6}}>Practising gratitude rewires your brain to notice the positive, improving happiness, sleep, and overall wellbeing.</div>
                    </div>
                  </div>
                </div>

                {/* Input card — only show on today view */}
                {isToday&&(
                  <div className="grat-input-card">
                    <div className="grat-input-hd">
                      <div>
                        <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:"var(--ink)"}}>What are you grateful for?</div>
                        <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink-light)",marginTop:2}}>Take a moment to reflect and add your wins.</div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:600,color:viewGratEntries.length>=GRAT_TARGET?"var(--sage)":"var(--gold-deep)"}}>{Math.min(viewGratEntries.length,GRAT_TARGET)}/{GRAT_TARGET}</div>
                        <div style={{fontSize:10,color:"var(--ink-light)",letterSpacing:".06em"}}>Baseline</div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <input id="grat-input-field" className="grat-inp" style={{minHeight:44}} placeholder={PROMPTS[promptIdx]} value={gratInput} onChange={e=>setGratInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addGrat()}/>
                      <button style={{display:"flex",alignItems:"center",gap:6,padding:"12px 20px",background:"var(--ink)",color:"#f4ede3",border:"none",borderRadius:20,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}} onClick={addGrat}>+ Add</button>
                    </div>
                  </div>
                )}

                {/* Entries list */}
                <div className="grat-card">
                  <div className="grat-list-hd">
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontFamily:"'Playfair Display',serif",fontSize:15,color:"var(--ink)"}}>{isToday?"Today's":"Past"} Gratitude</span>
                      <span style={{background:"var(--parchment)",borderRadius:10,padding:"1px 8px",fontSize:10,color:"var(--ink-light)"}}>{viewGratEntries.length}</span>
                    </div>
                  </div>
                  {viewGratEntries.length===0&&(
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:13,color:"var(--ink-light)",padding:"12px 0"}}>
                      {isToday?"Nothing yet — what small moment are you grateful for? ✦":"No entries logged for this day ✦"}
                    </div>
                  )}
                  {viewGratEntries.map((entry,i)=>(
                    <div key={entry.id} className="grat-item">
                      <div className={`grat-num ${i<GRAT_TARGET?"base":""}`}>{i+1}</div>
                      {gratEditId===entry.id
                        ?<input className="grat-edit-inp" autoFocus value={gratEditText} onChange={e=>setGratEditText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")saveGratEdit(viewGratDate,entry.id);if(e.key==="Escape"){setGratEditId(null);setGratEditText("");}}} onBlur={()=>saveGratEdit(viewGratDate,entry.id)}/>
                        :<div className="grat-text">{entry.text}</div>
                      }
                      <div className="grat-time">{entry.time}</div>
                      <button className="grat-dot-menu" onClick={e=>{e.stopPropagation();setGratMenuId(gratMenuId===entry.id?null:entry.id);setGratEditId(null);}}>⋮</button>
                      {gratMenuId===entry.id&&(
                        <div className="grat-imenu" onClick={e=>e.stopPropagation()}>
                          <div className="grat-imenu-item" onClick={()=>{setGratEditId(entry.id);setGratEditText(entry.text);setGratMenuId(null);}}>✎ &nbsp;Edit</div>
                          <div className="grat-imenu-item del" onClick={()=>{delGrat(viewGratDate,entry.id);setGratMenuId(null);}}>✕ &nbsp;Delete</div>
                        </div>
                      )}
                    </div>
                  ))}
                  {isToday&&viewGratEntries.length>0&&(
                    <div style={{textAlign:"center",paddingTop:14,borderTop:"1px solid rgba(26,20,16,.05)",marginTop:4}}>
                      <button style={{background:"none",border:"none",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:13,color:"var(--gold-deep)",cursor:"pointer"}} onClick={()=>document.getElementById("grat-input-field")?.focus()}>+ Add another</button>
                    </div>
                  )}
                </div>

              </div>

              {/* RIGHT SIDEBAR */}
              <div style={{display:"flex",flexDirection:"column",gap:14}}>

                {/* Current Streak */}
                <div className="side-card">
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
                    <div className="side-ttl" style={{marginBottom:0}}>Current Streak</div>
                    <span style={{fontSize:14}}>🔥</span>
                  </div>
                  <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:12}}>
                    <div>
                      <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                        <span style={{fontFamily:"'Playfair Display',serif",fontSize:42,fontWeight:600,color:"var(--ink)",lineHeight:1}}>{gratStreak}</span>
                        <span style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:14,color:"var(--ink-light)"}}>days</span>
                      </div>
                      <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--ink-light)",marginTop:4}}>{gratStreak>0?"Keep it going!":"Start your streak today"}</div>
                    </div>
                    <div className="grat-streak-bars">
                      {weekBarData.map((b,i)=>(
                        <div key={i} className="grat-sbar-col">
                          <div className="grat-sbar" style={{height:`${Math.max(b.count/maxBar*44,3)}px`,background:b.count>=GRAT_TARGET?"var(--gold)":b.count>0?"var(--gold-pale)":"var(--parchment)",borderRadius:"3px 3px 0 0"}}/>
                          <div className="grat-sbar-lbl">{b.d[0]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* This Week stats */}
                <div className="side-card">
                  <div className="side-ttl" style={{marginBottom:12}}>This Week</div>
                  {[
                    {label:"Gratitude Entries",val:gratWeekEntries},
                    {label:"Daily Average",val:gratWeekAvg},
                    {label:"Longest Streak",val:`${longestGratStreak} days`},
                    {label:"Total Entries",val:gratTotal},
                  ].map(r=>(
                    <div key={r.label} className="grat-stat-row-tbl">
                      <span className="grat-stat-lbl">{r.label}</span>
                      <span className="grat-stat-val">{r.val}</span>
                    </div>
                  ))}
                </div>

                {/* Reminders */}
                <div className="side-card">
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.75"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    <div className="side-ttl" style={{marginBottom:0}}>Gratitude Reminders</div>
                  </div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--ink-light)",marginBottom:14}}>Gentle reminders to pause and reflect.</div>
                  {[
                    {key:"morning",label:"Morning reminder",timeKey:"morningTime"},
                    {key:"evening",label:"Evening reminder",timeKey:"eveningTime"},
                  ].map(rem=>(
                    <div key={rem.key} className="grat-rem-row">
                      <div>
                        <div style={{fontSize:12.5,color:"var(--ink)"}}>{rem.label}</div>
                        {editingReminder===rem.key
                          ?<input type="time" className="grat-time-inp" value={gratReminders[rem.timeKey]} autoFocus
                              onChange={e=>setGratReminders(r=>({...r,[rem.timeKey]:e.target.value}))}
                              onBlur={()=>setEditingReminder(null)}
                              onKeyDown={e=>{if(e.key==="Enter"||e.key==="Escape")setEditingReminder(null);}}/>
                          :<div style={{fontSize:11,color:"var(--gold-deep)",marginTop:2,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={()=>setEditingReminder(rem.key)}>{gratReminders[rem.timeKey]} <span style={{fontSize:9,opacity:.6}}>tap to edit</span></div>
                        }
                      </div>
                      <button className={`grat-toggle ${gratReminders[rem.key]?"on":"off"}`} onClick={()=>setGratReminders(r=>({...r,[rem.key]:!r[rem.key]}))}>
                        <div className="grat-toggle-knob"/>
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
          );
        })()}

      </main>
    </>
  );
}
