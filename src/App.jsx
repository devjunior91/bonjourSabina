import { useState, useRef, useEffect, useCallback } from "react";
import sabinaPhoto from "./assets/sabina.jpg";
import tipsBg from "./assets/image.png";
import homePhilImg from "./assets/image2.png";
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
const GOAL_CATS={"Health":{color:"#6F7F55",bg:"#EEF3EA"},"Spiritual":{color:"#9B7BB6",bg:"#F2EDF7"},"Finance":{color:"#B89576",bg:"#F3EAE1"},"Personal":{color:"#C98F8F",bg:"#F7EDEA"},"Career":{color:"#7FA6C6",bg:"#EEF3F8"},"Travel":{color:"#A88B6F",bg:"#F3EAE1"},"Home":{color:"#C47C6A",bg:"#F7ECE8"},"Relationships":{color:"#C98F8F",bg:"#F7EDEA"},"Creativity":{color:"#D29A52",bg:"#FFF4E6"},"Faith":{color:"#7FA37A",bg:"#EEF3EA"},"Study":{color:"#7FA6C6",bg:"#EEF3F8"},"Weight Loss":{color:"#6F7F55",bg:"#EEF3EA"},"Business":{color:"#B89576",bg:"#F3EAE1"},"Self-care":{color:"#C98F8F",bg:"#F7EDEA"}};
const GOAL_ICON_LIST=[
  {id:"health",label:"Health / Fitness",el:<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#EEF3EA"/><path d="M7 10V14" stroke="#6F7F55" strokeWidth="2" strokeLinecap="round"/><path d="M17 10V14" stroke="#6F7F55" strokeWidth="2" strokeLinecap="round"/><path d="M4.5 12H19.5" stroke="#6F7F55" strokeWidth="2" strokeLinecap="round"/><path d="M5.5 10.5V13.5" stroke="#6F7F55" strokeWidth="1.8" strokeLinecap="round"/><path d="M18.5 10.5V13.5" stroke="#6F7F55" strokeWidth="1.8" strokeLinecap="round"/></svg>},
  {id:"spiritual",label:"Spiritual / Learning",el:<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#F2EDF7"/><path d="M5.5 7C7.5 6.2 9.5 6.2 11.5 7.2V18C9.5 17.1 7.5 17.1 5.5 18V7Z" stroke="#9B7BB6" strokeWidth="1.8" strokeLinejoin="round"/><path d="M18.5 7C16.5 6.2 14.5 6.2 12.5 7.2V18C14.5 17.1 16.5 17.1 18.5 18V7Z" stroke="#9B7BB6" strokeWidth="1.8" strokeLinejoin="round"/></svg>},
  {id:"finance",label:"Finance / Savings",el:<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#F3EAE1"/><path d="M13.5 6.5C12.4 6.5 11.5 7.4 11.5 8.5V17" stroke="#B89576" strokeWidth="2" strokeLinecap="round"/><path d="M9 11H15" stroke="#B89576" strokeWidth="2" strokeLinecap="round"/><path d="M9 17H16" stroke="#B89576" strokeWidth="2" strokeLinecap="round"/></svg>},
  {id:"personal",label:"Personal / Growth",el:<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#F7EDEA"/><path d="M12 18.5C11.8 18.5 11.6 18.4 11.4 18.3C8.2 16.1 6 14.2 6 11.3C6 9.5 7.4 8.1 9.1 8.1C10.1 8.1 11.1 8.6 11.7 9.4C12.3 8.6 13.3 8.1 14.3 8.1C16 8.1 17.4 9.5 17.4 11.3C17.4 14.2 15.2 16.1 12 18.3Z" fill="#C98F8F"/></svg>},
  {id:"career",label:"Career",el:<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#EEF3F8"/><rect x="6" y="9" width="12" height="8" rx="2" stroke="#7FA6C6" strokeWidth="1.8"/><path d="M9.5 9V7.5C9.5 6.7 10.2 6 11 6H13C13.8 6 14.5 6.7 14.5 7.5V9" stroke="#7FA6C6" strokeWidth="1.8" strokeLinecap="round"/></svg>},
  {id:"travel",label:"Travel",el:<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#F3EAE1"/><path d="M4.5 13L19 7.5L14.5 19L11.5 14.5L4.5 13Z" stroke="#A88B6F" strokeWidth="1.8" strokeLinejoin="round"/></svg>},
  {id:"home",label:"Home",el:<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#F7ECE8"/><path d="M6 11.5L12 6.5L18 11.5V18H14V14H10V18H6V11.5Z" stroke="#C47C6A" strokeWidth="1.8" strokeLinejoin="round"/></svg>},
  {id:"relationships",label:"Relationships",el:<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#F7EDEA"/><path d="M8.5 10.5C8.5 9.2 9.5 8.2 10.8 8.2C11.5 8.2 12.1 8.6 12.5 9.1C12.9 8.6 13.5 8.2 14.2 8.2C15.5 8.2 16.5 9.2 16.5 10.5C16.5 12.7 14.8 14.1 12.5 15.8C10.2 14.1 8.5 12.7 8.5 10.5Z" fill="#C98F8F"/></svg>},
  {id:"creativity",label:"Creativity",el:<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#FFF4E6"/><path d="M12 5L12.8 9.2L17 10L12.8 10.8L12 15L11.2 10.8L7 10L11.2 9.2L12 5Z" fill="#D29A52"/><path d="M17 14L17.4 15.6L19 16L17.4 16.4L17 18L16.6 16.4L15 16L16.6 15.6L17 14Z" fill="#D29A52"/></svg>},
  {id:"faith",label:"Faith / Prayer",el:<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#EEF3EA"/><path d="M12 5.5C9.7 6.8 8.2 9.2 8.2 12C8.2 14.8 9.7 17.2 12 18.5C14.3 17.2 15.8 14.8 15.8 12C15.8 9.2 14.3 6.8 12 5.5Z" stroke="#7FA37A" strokeWidth="1.8"/><path d="M12 8V16" stroke="#7FA37A" strokeWidth="1.8" strokeLinecap="round"/></svg>},
  {id:"study",label:"Study / Certification",el:<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#EEF3F8"/><path d="M6 8L12 5.5L18 8L12 10.5L6 8Z" stroke="#7FA6C6" strokeWidth="1.8" strokeLinejoin="round"/><path d="M8 10V14C9.2 15 10.5 15.5 12 15.5C13.5 15.5 14.8 15 16 14V10" stroke="#7FA6C6" strokeWidth="1.8" strokeLinecap="round"/></svg>},
  {id:"weightloss",label:"Weight Loss",el:<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#EEF3EA"/><path d="M7.5 17V10C7.5 8.3 8.8 7 10.5 7H13.5C15.2 7 16.5 8.3 16.5 10V17H7.5Z" stroke="#6F7F55" strokeWidth="1.8"/><path d="M10 10.5C10.6 9.9 11.3 9.6 12 9.6C12.7 9.6 13.4 9.9 14 10.5" stroke="#6F7F55" strokeWidth="1.8" strokeLinecap="round"/></svg>},
  {id:"business",label:"Business / Side Hustle",el:<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#F3EAE1"/><path d="M7 17V9" stroke="#B89576" strokeWidth="1.8" strokeLinecap="round"/><path d="M12 17V6" stroke="#B89576" strokeWidth="1.8" strokeLinecap="round"/><path d="M17 17V12" stroke="#B89576" strokeWidth="1.8" strokeLinecap="round"/><path d="M6 17H18" stroke="#B89576" strokeWidth="1.8" strokeLinecap="round"/></svg>},
  {id:"selfcare",label:"Self-care",el:<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#F7EDEA"/><path d="M8 13C8 10.8 9.8 9 12 9C14.2 9 16 10.8 16 13" stroke="#C98F8F" strokeWidth="1.8" strokeLinecap="round"/><path d="M9 16C10 17 14 17 15 16" stroke="#C98F8F" strokeWidth="1.8" strokeLinecap="round"/><circle cx="10" cy="12" r="0.8" fill="#C98F8F"/><circle cx="14" cy="12" r="0.8" fill="#C98F8F"/></svg>},
];
const GOAL_QUOTES=["Small consistent actions create big lasting change.","Progress, not perfection, is the goal.","Every milestone is proof you can go further.","You are closer than you were yesterday.","Discipline is choosing your future self over your present comfort."];
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
.main{margin-left:var(--sidebar-w);padding:28px 0 64px;min-height:100vh;position:relative;z-index:1;width:calc(100% - var(--sidebar-w));box-sizing:border-box;overflow-x:clip;}

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
.hab-side{padding:14px 20px 64px;border-left:1px solid rgba(26,20,16,.08);background:transparent;display:flex;flex-direction:column;gap:16px;min-height:calc(100vh - 280px);}
.hab-card{background:#fff;border:1px solid var(--border);border-radius:14px;overflow:visible;box-shadow:var(--shadow);}
.hab-card-hd{padding:14px 18px 10px;border-bottom:1px solid rgba(26,20,16,.06);}
.hab-card-ttl{font-family:'Playfair Display',serif;font-size:14px;color:var(--ink);}
.hab-card-sub{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:11px;color:var(--ink-light);margin-top:1px;}
/* Grid header */
.hab-grid-hd{display:grid;grid-template-columns:160px repeat(7,1fr) 60px 36px;gap:4px;padding:8px 18px;border-bottom:1px solid rgba(26,20,16,.04);}
.hab-grid-dl{font-size:10px;font-weight:600;color:var(--ink-light);text-align:center;letter-spacing:.04em;}
/* Habit row */
.hab-row{display:grid;grid-template-columns:160px repeat(7,1fr) 60px 28px;gap:4px;padding:8px 18px;align-items:center;border-bottom:1px solid rgba(26,20,16,.03);transition:background .12s;}
.hab-row.dragging{opacity:.4;}
.hab-row.drag-over{border-top:2px solid var(--gold);}
.hab-menu-btn{width:24px;height:24px;border-radius:6px;border:none;background:none;cursor:pointer;color:var(--ink-light);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .15s,background .15s;font-size:14px;line-height:1;padding:0;}
.hab-row:hover .hab-menu-btn{opacity:1;}
.hab-menu-btn:hover{background:var(--parchment);color:var(--ink);}
.hab-menu-popup{position:absolute;right:0;top:calc(100% + 4px);background:#fff;border:1px solid var(--border);border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.12);z-index:700;overflow:hidden;min-width:110px;}
.hab-menu-item{padding:9px 14px;font-family:'DM Sans',sans-serif;font-size:12px;color:var(--ink);cursor:pointer;display:flex;align-items:center;gap:8px;transition:background .1s;}
.hab-menu-item:hover{background:var(--parchment);}
.hab-menu-item.del{color:#c05050;}
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
.hab-ip{position:absolute;top:calc(100% + 6px);left:0;z-index:600;background:#fff;border:1px solid var(--border);border-radius:14px;padding:10px;box-shadow:0 8px 32px rgba(0,0,0,.12);display:grid;grid-template-columns:repeat(7,32px);gap:5px;width:auto;}
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
/* ── Goals redesign ── */
.goal-stats-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:24px;}
.goal-stat-card{background:#fff;border:1px solid var(--border);border-radius:14px;padding:20px;box-shadow:var(--shadow);}
.goal-stat-label{font-size:11px;font-weight:500;color:var(--ink-light);letter-spacing:.05em;margin-bottom:14px;}
.goal-filter-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;gap:12px;}
.goal-tabs{display:flex;gap:4px;background:var(--parchment);border-radius:10px;padding:3px;}
.goal-tab{padding:6px 14px;border:none;background:none;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:12px;color:var(--ink-light);cursor:pointer;transition:all .15s;white-space:nowrap;}
.goal-tab.active{background:#fff;color:var(--ink);font-weight:500;box-shadow:0 1px 3px rgba(0,0,0,.08);}
.goal-card{background:#fff;border:1px solid var(--border);border-radius:14px;padding:0;margin-bottom:16px;box-shadow:var(--shadow);display:flex;}
.goal-card-left{padding:22px 24px;flex:0 0 340px;display:flex;flex-direction:column;gap:0;border-right:1px solid rgba(26,20,16,.06);border-radius:14px 0 0 14px;}
.goal-card-right{flex:1;padding:20px 24px;display:flex;flex-direction:column;border-radius:0 14px 14px 0;overflow:visible;position:relative;}
.goal-icon-wrap{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:12px;overflow:hidden;flex-shrink:0;}
.goal-title-txt{font-family:'Playfair Display',serif;font-size:17px;color:var(--ink);margin-bottom:5px;line-height:1.3;}
.goal-desc-txt{font-size:12px;color:var(--ink-light);line-height:1.5;margin-bottom:16px;flex:1;}
.goal-prog-track{height:6px;background:rgba(26,20,16,.07);border-radius:10px;margin-bottom:6px;overflow:hidden;}
.goal-prog-fill{height:100%;border-radius:10px;transition:width .5s ease;}
.goal-prog-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}
.goal-prog-pct{font-family:'Playfair Display',serif;font-size:13px;color:var(--ink);font-weight:600;}
.goal-target{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--ink-light);margin-top:auto;}
.goal-ms-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.goal-ms-lbl{font-size:11px;font-weight:600;color:var(--ink-light);letter-spacing:.08em;text-transform:uppercase;}
.ms2-row{display:grid;grid-template-columns:20px 1fr 90px 70px;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(26,20,16,.04);}
.ms2-row:last-child{border-bottom:none;}
.ms2-ck{width:18px;height:18px;border-radius:50%;border:1.5px solid rgba(122,98,82,.3);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .18s;flex-shrink:0;}
.ms2-ck.done{border-color:transparent;}
.ms2-txt{font-size:12.5px;color:var(--ink);line-height:1.35;text-align:left;}
.ms2-txt.done{text-decoration:line-through;opacity:.45;}
.ms-badge{display:inline-flex;align-items:center;padding:2px 9px;border-radius:20px;font-size:10px;font-weight:500;white-space:nowrap;cursor:pointer;user-select:none;transition:opacity .15s;}
.ms-badge:hover{opacity:.8;}
.ms-status-wrap{position:relative;display:inline-flex;}
.ms-status-drop{position:absolute;right:0;top:calc(100% + 4px);z-index:300;background:#fff;border:1px solid var(--border);border-radius:10px;padding:4px;box-shadow:0 8px 24px rgba(0,0,0,.12);min-width:120px;}
.ms-status-opt{padding:6px 12px;font-size:11px;color:var(--ink);cursor:pointer;border-radius:6px;transition:background .12s;text-align:left;white-space:nowrap;}
.ms-status-opt:hover{background:var(--parchment);}
.ms-badge.completed{background:#eef3ea;color:#6f7f55;}
.ms-badge.inprogress{background:#f2edf7;color:#9b7bb6;}
.ms-badge.notstarted{background:var(--parchment);color:var(--ink-light);}
.ms2-date{font-size:10px;color:var(--ink-light);text-align:right;}
.goal-cat-tag{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:500;}
.goal-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:0;}
.goal-menu-btn{border:none;background:none;cursor:pointer;color:var(--ink-light);font-size:18px;padding:2px 6px;border-radius:6px;transition:background .15s;line-height:1;}
.goal-menu-btn:hover{background:var(--parchment);}
.goal-dropdown{position:absolute;right:16px;top:44px;z-index:200;background:#fff;border:1px solid var(--border);border-radius:10px;padding:6px;box-shadow:0 8px 24px rgba(0,0,0,.1);min-width:130px;}
.goal-dd-item{padding:7px 12px;font-size:12px;color:var(--ink);cursor:pointer;border-radius:6px;transition:background .12s;}
.goal-dd-item:hover{background:var(--parchment);}
.goal-dd-item.del{color:#c05050;}
.goal-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 24px;color:var(--ink-light);font-family:'Cormorant Garamond',serif;font-style:italic;font-size:15px;text-align:center;}
.goal-modal-ov{position:fixed;inset:0;background:rgba(26,20,16,.45);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;}
.goal-modal-box{background:#fff;border-radius:18px;padding:32px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 80px rgba(0,0,0,.18);}
.goal-icon-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin-top:8px;margin-bottom:16px;}
.goal-icon-opt{border:1.5px solid var(--border);border-radius:10px;padding:6px;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;}
.goal-icon-opt.selected{border-color:var(--gold);background:var(--gold-pale);}
.goal-icon-opt:hover{border-color:var(--gold-deep);}
.ms-input-row{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
.ms-input-num{width:20px;font-size:11px;color:var(--ink-light);flex-shrink:0;text-align:center;}
.recent-wins-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:32px;}
.rw-card{background:#fff;border:1px solid var(--border);border-radius:14px;padding:22px 24px;box-shadow:var(--shadow);}
.tips-card{border-radius:14px;padding:22px 24px;box-shadow:var(--shadow);background-size:cover;background-position:center;position:relative;overflow:hidden;}
.tips-card-overlay{position:absolute;inset:0;background:rgba(250,245,238,.88);border-radius:14px;}
.tips-card-content{position:relative;z-index:1;}
.rw-item{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid rgba(26,20,16,.05);}
.rw-icon{width:32px;height:32px;border-radius:50%;overflow:hidden;flex-shrink:0;}
.rw-text{font-size:13px;color:var(--ink);flex:1;}
.rw-date{font-size:11px;color:var(--ink-light);white-space:nowrap;}
.tip-item{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid rgba(26,20,16,.05);}
.tip-icon{width:28px;height:28px;border-radius:8px;background:var(--parchment);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px;}
.goal-page-footer{text-align:center;padding:32px 0 16px;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:14px;color:var(--ink-light);}
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
.grat-nav-lbl{flex:1;text-align:left;font-family:'Playfair Display',serif;font-size:15px;color:var(--ink);}
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
.pflag{display:flex;align-items:center;gap:4px;flex-shrink:0;}
.pflag span{font-size:10px;font-weight:500;letter-spacing:.02em;}
/* Subtasks */
.subtask-row{display:flex;align-items:center;gap:6px;padding:3px 10px 3px 34px;position:relative;}
.subtask-row::before{content:"";position:absolute;left:21px;top:0;bottom:0;width:1px;background:rgba(26,20,16,.1);}
.subtask-txt{font-size:11px;color:var(--ink);flex:1;cursor:pointer;line-height:1.4;}
.subtask-txt.done{text-decoration:line-through;opacity:.5;}
.subtask-inp{border:none;border-bottom:1px solid var(--gold);outline:none;font-size:11px;font-family:'DM Sans',sans-serif;color:var(--ink);background:transparent;flex:1;padding:1px 0;}
.subtask-del{border:none;background:none;cursor:pointer;color:var(--ink-light);font-size:15px;opacity:0;transition:opacity .15s;padding:0;line-height:1;flex-shrink:0;}
.subtask-row:hover .subtask-del{opacity:1;}
.subtask-ck{width:12px;height:12px;border-radius:50%;border:1.5px solid rgba(122,98,82,.35);flex-shrink:0;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;}
.subtask-ck.done{background:var(--sage);border-color:var(--sage);}
/* Subtask rows on todo list page */
.subtask-row2{display:flex;align-items:center;gap:8px;padding:5px 18px 5px 50px;border-bottom:1px solid rgba(26,20,16,.03);background:#fafafa;}
.subtask-row2:hover .subtask-del{opacity:1;}
.tr2-sub-btn{width:22px;height:22px;border-radius:5px;border:1px solid var(--border);background:none;cursor:pointer;color:var(--ink-light);display:flex;align-items:center;justify-content:center;flex-shrink:0;opacity:0;transition:opacity .15s,background .15s;}
.tr2:hover .tr2-sub-btn{opacity:1;}
.tr2-sub-btn:hover{background:var(--parchment);}
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
.cal-page{display:grid;grid-template-columns:1fr 260px;gap:20px;align-items:start;padding:0 28px;}
.cal-topbar2{display:flex;align-items:center;gap:10px;margin-bottom:20px;flex-wrap:wrap;}
.cal-nav-btn{background:none;border:1px solid var(--border);border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;color:var(--ink-light);line-height:1;}
.cal-nav-btn:hover{background:var(--parchment);}
.cal-cur-label{font-family:'Playfair Display',serif;font-size:17px;color:var(--ink);font-weight:400;min-width:130px;}
.cal-today-btn2{padding:6px 14px;border:1px solid var(--border);border-radius:8px;background:none;font-family:'DM Sans',sans-serif;font-size:12px;color:var(--ink-light);cursor:pointer;}
.cal-today-btn2:hover{background:var(--parchment);}
.cal-view-tgl{display:flex;border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-left:auto;}
.cvt2{padding:7px 18px;background:none;border:none;border-right:1px solid var(--border);font-family:'DM Sans',sans-serif;font-size:12px;color:var(--ink-light);cursor:pointer;}
.cvt2:last-child{border-right:none;}
.cvt2.on{background:var(--ink);color:#f4ede3;}
.cal-add2{display:flex;align-items:center;gap:6px;padding:8px 18px;background:var(--ink);color:#f4ede3;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;white-space:nowrap;}
.cal-add2:hover{background:var(--gold-deep);}
.cal-mth-wrap{border:1px solid var(--border);border-radius:14px;overflow:hidden;background:#fff;}
.cal-mth-hdr{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));background:var(--parchment);border-bottom:1px solid var(--border);}
.cal-mth-dh{padding:10px 6px;font-size:10px;letter-spacing:.1em;color:var(--ink-light);text-align:center;text-transform:uppercase;font-weight:500;}
.cal-mth-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));}
.cal-mth-cell{min-height:110px;border-right:1px solid var(--border);border-bottom:1px solid var(--border);padding:6px;cursor:pointer;transition:background .12s;min-width:0;overflow:hidden;}
.cal-mth-cell:nth-child(7n){border-right:none;}
.cal-mth-cell.om2{background:#faf9f7;opacity:.6;}
.cal-mth-cell.tc3{background:rgba(201,168,124,.05);}
.cal-mth-cell:hover{background:var(--gold-pale);}
.cal-mth-dn{font-size:12px;font-weight:500;color:var(--ink-light);margin-bottom:4px;width:24px;height:24px;display:flex;align-items:center;justify-content:center;border-radius:50%;}
.cal-mth-dn.tn2{background:var(--gold);color:#fff;font-weight:600;}
.cal-mth-ev{font-size:10px;padding:2px 6px;border-radius:5px;color:#fff;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;}
.cal-mth-ev:hover{opacity:.85;}
.cal-wk-wrap{border:1px solid var(--border);border-radius:14px;overflow:hidden;background:#fff;}
.cal-wk-hdr{display:grid;background:var(--parchment);border-bottom:1px solid var(--border);}
.cal-wh-empty2{border-right:1px solid var(--border);}
.cal-wh-cell2{padding:10px 6px;text-align:center;border-right:1px solid var(--border);}
.cal-wh-cell2:last-child{border-right:none;}
.cal-wh-day2{font-size:9px;letter-spacing:.1em;color:var(--ink-light);text-transform:uppercase;font-weight:600;}
.cal-wh-num2{font-family:'Playfair Display',serif;font-size:20px;color:var(--ink);display:block;margin-top:2px;}
.cal-wh-num2.tn3{background:var(--gold);color:#fff;border-radius:50%;width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;}
.cal-tgrid{display:grid;background:var(--ivory);}
.cal-tcol{display:flex;flex-direction:column;border-right:1px solid var(--border);}
.cal-tlbl{height:60px;display:flex;align-items:flex-start;padding:5px 6px 0;justify-content:flex-end;font-size:9px;color:var(--ink-light);letter-spacing:.04em;border-bottom:1px solid rgba(0,0,0,.04);}
.cal-dcol{position:relative;border-right:1px solid var(--border);}
.cal-dcol:last-child{border-right:none;}
.cal-hslot{height:60px;border-bottom:1px solid rgba(0,0,0,.06);cursor:pointer;transition:background .12s;}
.cal-hslot:hover{background:rgba(201,168,124,.07);}
.cal-epill{position:absolute;left:3px;right:3px;border-radius:7px;padding:5px 7px;color:#fff;font-size:11px;cursor:pointer;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.14);z-index:2;}
.cal-epill:hover{opacity:.88;}
.cal-epill-t{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.3;}
.cal-epill-m{font-size:9px;opacity:.9;margin-top:2px;white-space:nowrap;}
.cal-rp{display:flex;flex-direction:column;gap:16px;}
.cal-mc{background:#fff;border:1px solid var(--border);border-radius:14px;padding:16px;box-shadow:var(--shadow);}
.cal-mc-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.cal-mc-mo{font-family:'Playfair Display',serif;font-size:14px;color:var(--ink);}
.cal-mc-nav{background:none;border:none;color:var(--ink-light);cursor:pointer;padding:2px 8px;border-radius:5px;font-size:15px;}
.cal-mc-nav:hover{background:var(--parchment);}
.cal-mc-dh{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px;}
.cal-mc-dhc{font-size:8px;text-align:center;color:var(--ink-light);letter-spacing:.06em;padding:2px 0;}
.cal-mc-dg{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;}
.cal-mc-d{font-size:10px;text-align:center;padding:4px 0;border-radius:50%;cursor:pointer;color:var(--ink-light);transition:background .12s;width:26px;height:26px;display:flex;align-items:center;justify-content:center;margin:auto;}
.cal-mc-d:hover{background:var(--gold-pale);}
.cal-mc-d.tm{background:var(--gold);color:#fff;font-weight:600;}
.cal-mc-d.hev{font-weight:600;color:var(--ink);}
.cal-uc{background:#fff;border:1px solid var(--border);border-radius:14px;padding:16px;box-shadow:var(--shadow);max-height:280px;display:flex;flex-direction:column;}
.cal-uc-scroll{overflow-y:auto;flex:1;}
.cal-uc-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.cal-uc-ttl{font-family:'Playfair Display',serif;font-size:14px;color:var(--ink);}
.cal-uc-va{font-size:11px;color:var(--gold-deep);background:none;border:none;cursor:pointer;}
.cal-uc-item{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer;}
.cal-uc-item:last-child{border-bottom:none;}
.cal-uc-dot{width:8px;height:8px;border-radius:50%;margin-top:5px;flex-shrink:0;}
.cal-uc-nm{font-size:12px;color:var(--ink);font-weight:500;margin-bottom:2px;}
.cal-uc-mt{font-size:10px;color:var(--ink-light);}
.cal-qc{background:var(--parchment);border:1px solid var(--border);border-radius:14px;padding:18px;box-shadow:var(--shadow);}
.cal-qc-lbl{font-family:'Cormorant Garamond',serif;font-size:11px;color:var(--gold);letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px;}
.cal-qc-txt{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:14px;color:var(--ink);line-height:1.65;}
.cal-leg{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:14px;padding:10px 28px;}
.cal-leg-item{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--ink-light);}
.cal-leg-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
@media(max-width:1100px){.cal-page{grid-template-columns:1fr;}.cal-rp{display:none;}}
@media(max-width:700px){.cal-wk-hdr{grid-template-columns:40px repeat(7,1fr)!important;}.cal-tgrid{grid-template-columns:40px repeat(7,1fr)!important;}.cal-tlbl{font-size:8px;padding:4px 3px 0;}.cal-epill-m{display:none;}}
/* ── HOME RESET v2 ── */
.hr-wrap{padding:0 24px 64px;}
.hr-hd-row{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;}
.hr-top-card{background:#fff;border:1px solid var(--border);border-radius:16px;box-shadow:var(--shadow);display:grid;grid-template-columns:1fr 220px 260px;overflow:hidden;margin-bottom:20px;min-height:220px;}
.hr-top-prog{padding:28px 24px;display:flex;flex-direction:column;justify-content:space-between;border-right:1px solid var(--border);}
.hr-top-img-col{overflow:hidden;border-right:1px solid var(--border);}
.hr-top-img-col img{width:100%;height:100%;object-fit:cover;display:block;}
.hr-top-phil-col{padding:24px 22px;display:flex;flex-direction:column;justify-content:space-between;}
.hr-layout{display:grid;grid-template-columns:1fr 300px;gap:20px;align-items:start;}
.hr-left{display:flex;flex-direction:column;gap:0;}
.hr-right{display:flex;flex-direction:column;gap:16px;}
.hr-tasks-card{background:#fff;border:1px solid var(--border);border-radius:16px;box-shadow:var(--shadow);overflow:hidden;}
.hr-day-nav{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid var(--border);}
.hr-day-nav-prev{font-size:13px;color:var(--ink-light);cursor:pointer;display:flex;align-items:center;gap:4px;white-space:nowrap;}
.hr-day-nav-prev:hover{color:var(--ink);}
.hr-day-nav-next{font-size:13px;color:#7F8F68;cursor:pointer;display:flex;align-items:center;gap:4px;white-space:nowrap;}
.hr-day-nav-next:hover{opacity:.75;}
.hr-day-nav-center{text-align:center;flex:1;padding:0 12px;}
.hr-day-nav-date{font-family:'DM Sans',sans-serif;font-size:15px;font-weight:600;color:var(--ink);display:flex;align-items:center;justify-content:center;gap:6px;}
.hr-day-nav-wk{font-size:11px;color:var(--ink-light);margin-top:2px;cursor:pointer;}
.hr-task-row{display:flex;align-items:center;gap:14px;padding:13px 20px;border-bottom:1px solid var(--border);transition:background .12s;}
.hr-task-row:hover{background:#fafaf8;}
.hr-task-chk{width:24px;height:24px;border-radius:50%;border:1.5px solid #c8d0ba;background:transparent;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .2s;}
.hr-task-chk.done{background:#7F8F68;border-color:#7F8F68;}
.hr-task-nm{flex:1;font-size:14px;color:var(--ink);}
.hr-task-nm.done{text-decoration:line-through;color:var(--ink-light);}
.hr-task-badge{font-size:11px;color:#666;background:#f0f0ee;border-radius:20px;padding:3px 10px;white-space:nowrap;flex-shrink:0;}
.hr-task-dur{font-size:12px;color:var(--ink-light);white-space:nowrap;flex-shrink:0;min-width:44px;text-align:right;}
.hr-tasks-lbl{padding:12px 20px 4px;font-size:11px;color:var(--ink-light);font-family:'DM Sans',sans-serif;letter-spacing:.05em;text-transform:uppercase;}
.hr-add-row{display:flex;align-items:center;justify-content:center;padding:14px;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:13px;color:var(--gold-deep);cursor:pointer;transition:background .12s;gap:6px;border-top:1px solid var(--border);}
.hr-add-row:hover{background:#faf9f7;}
.hr-prog-bar-bg{height:5px;border-radius:3px;background:#e8ede4;overflow:hidden;margin:6px 0 0;}
.hr-prog-bar-fill{height:100%;border-radius:3px;background:#A8B29A;transition:width .5s;}
.hr-wk-card{background:#fff;border:1px solid var(--border);border-radius:16px;box-shadow:var(--shadow);padding:20px;}
.hr-wk-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;}
.hr-wk-days{display:flex;justify-content:space-between;margin:12px 0 10px;}
.hr-wk-day{display:flex;flex-direction:column;align-items:center;gap:5px;}
.hr-wk-d-lbl{font-size:9px;color:var(--ink-light);text-transform:uppercase;letter-spacing:.06em;}
.hr-wk-d-circle{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;}
.hr-wk-d-circle.done{background:#7F8F68;color:#fff;}
.hr-wk-d-circle.today{border:2px solid #7F8F68;color:#7F8F68;background:#fff;}
.hr-wk-d-circle.past{background:#ebebea;color:var(--ink-light);}
.hr-wk-d-circle.future{background:#f5f5f3;color:var(--ink-light);}
.hr-up-card{background:#fff;border:1px solid var(--border);border-radius:16px;box-shadow:var(--shadow);overflow:hidden;}
.hr-up-hdr{display:flex;align-items:center;justify-content:space-between;padding:16px 16px 10px;}
.hr-up-item{display:flex;align-items:center;gap:14px;padding:10px 16px;border-top:1px solid var(--border);}
.hr-up-date{width:40px;flex-shrink:0;text-align:center;background:#f5f5f3;border-radius:8px;padding:5px 3px;}
.hr-up-day-abbr{font-size:9px;text-transform:uppercase;color:var(--ink-light);letter-spacing:.05em;font-weight:500;}
.hr-up-day-num{font-size:17px;font-weight:700;color:var(--ink);line-height:1.1;}
.hr-modal{position:fixed;inset:0;background:rgba(26,20,16,.45);z-index:1000;display:flex;align-items:center;justify-content:center;}
.hr-mbox{background:#fff;border-radius:18px;padding:28px;width:400px;max-width:92vw;box-shadow:0 24px 64px rgba(0,0,0,.18);}
@media(max-width:1100px){.hr-top-card{grid-template-columns:1fr 180px 220px;}}
@media(max-width:960px){.hr-layout{grid-template-columns:1fr;}.hr-right{display:none;}}
@media(max-width:700px){.hr-top-card{grid-template-columns:1fr;}.hr-top-img-col,.hr-top-phil-col{display:none;}}
/* ── PROJECT PLANNER ── */
.proj-card{background:#fff;border:1px solid #EAE4DC;border-radius:14px;padding:20px 22px;margin-bottom:12px;cursor:pointer;transition:box-shadow .15s;}
.proj-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.08);}
.proj-prog-bar{height:5px;background:#f0ebe4;border-radius:3px;overflow:hidden;margin-top:10px;}
.proj-prog-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,#B9855E,#d4a882);transition:width .5s;}
.proj-tab{padding:7px 16px;border-radius:20px;border:none;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;cursor:pointer;transition:all .15s;}
.proj-tab.on{background:var(--ink);color:#f4ede3;}
.proj-tab.off{background:#fff;color:var(--ink-light);border:1px solid var(--border);}
.proj-detail-task{display:flex;align-items:center;gap:10px;padding:11px 0;border-bottom:1px solid #f5f0ea;}
.proj-detail-task:last-child{border-bottom:none;}
.proj-pri-badge{padding:3px 10px;border-radius:12px;font-size:10px;font-weight:500;font-family:'DM Sans',sans-serif;}
`;

const MONTHLY_TIPS={
  0:[["✓","Start the year with clarity — write down your top 3 goals."],["✦","Build momentum with small daily actions."],["↺","Review your habits from last year."]],
  1:[["✓","February is for focus — pick one goal to go deep on."],["✦","Celebrate small progress, not just big milestones."],["↺","Check in with your vision board."]],
  2:[["✓","Spring is here — refresh your goals with new energy."],["✦","Get outside, move your body, clear your mind."],["↺","Is your plan aligned with what you truly want?"]],
  3:[["✓","Consistency over intensity — show up every day."],["✦","Track small wins to stay motivated."],["↺","Review and adjust your plan mid-month."]],
  4:[["✓","May brings growth — what new skill will you nurture?"],["✦","Focus on consistency, not perfection."],["↺","Celebrate how far you have come since January."]],
  5:[["✓","Mid-year check-in — are you on track?"],["✦","Rest is part of the journey, not a step back."],["↺","Revisit your year goals and update what needs changing."]],
  6:[["✓","Summer energy — use it to power through hard goals."],["✦","Keep hydrated, rested and intentional."],["↺","Simplify: focus on what matters most."]],
  7:[["✓","August momentum — the year is not over yet."],["✦","Your habits today shape your November."],["↺","What can you accomplish in the next 30 days?"]],
  8:[["✓","Autumn reset — structure brings clarity."],["✦","Batch your tasks and protect deep work time."],["↺","Review your goals before Q4 begins."]],
  9:[["✓","The final quarter — make it count."],["✦","One strong month can change everything."],["↺","What would make this month unforgettable?"]],
  10:[["✓","Stay focused as the year winds down."],["✦","Do not wait for January — start now."],["↺","Reflect on your biggest win of the year so far."]],
  11:[["✓","December — finish strong and celebrate your growth."],["✦","Rest, reflect and plan for a powerful new year."],["↺","Write 3 things you achieved this year that you are proud of."]],
};
export default function App() {
  const [page,setPage]=useState(()=>localStorage.getItem("sab_page")||"dashboard");
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
  const [habMenuId,setHabMenuId]=useState(null);
  const [dragHabId,setDragHabId]=useState(null);
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
  const [showGoalModal,setShowGoalModal]=useState(false);
  const [userPhoto,setUserPhoto]=useState(()=>localStorage.getItem("userPhoto")||null);
  const photoInputRef=useRef(null);
  const handlePhotoChange=e=>{
    const f=e.target.files[0];if(!f)return;
    e.target.value="";
    const r=new FileReader();
    r.onload=ev=>{
      const img=new Image();
      img.onload=()=>{
        const MAX=300;
        const scale=Math.min(MAX/img.width,MAX/img.height,1);
        const w=Math.round(img.width*scale),h=Math.round(img.height*scale);
        const canvas=document.createElement("canvas");
        canvas.width=w;canvas.height=h;
        canvas.getContext("2d").drawImage(img,0,0,w,h);
        const save=(q)=>{const d=canvas.toDataURL("image/jpeg",q);setUserPhoto(d);try{localStorage.setItem("userPhoto",d);}catch(err){if(q>.3)save(q-.2);}};
        save(0.85);
      };
      img.src=ev.target.result;
    };
    r.readAsDataURL(f);
  };
  const [goalModalMode,setGoalModalMode]=useState("add");
  const [goalEditId,setGoalEditId]=useState(null);
  const [gDraft,setGDraft]=useState({title:"",description:"",category:"Health",icon:"health",targetDate:"",milestones:[""]});
  const [goalFilter,setGoalFilter]=useState("all");
  const [goalCat,setGoalCat]=useState("");
  const [goalView,setGoalView]=useState("list");
  const [goalMenuOpen,setGoalMenuOpen]=useState(null);
  const [msDropOpen,setMsDropOpen]=useState(null);
  const [cInputs,setCInputs]=useState(Object.fromEntries(DAYS.map(d=>[d,""])));
  const [editC,setEditC]=useState(null);
  const [editCTxt,setEditCTxt]=useState("");
  const [hrModal,setHrModal]=useState(false);
  const [hrDraft,setHrDraft]=useState({text:"",category:"General",duration:10});
  const [hrDayOffset,setHrDayOffset]=useState(0);
  const [calYear,setCalYear]=useState(NOW.getFullYear());
  const [calMonth,setCalMonth]=useState(NOW.getMonth());
  const [calView,setCalView]=useState("month");
  const [calWkStart,setCalWkStart]=useState("");
  const [calDayDate,setCalDayDate]=useState("");
  const [evModal,setEvModal]=useState(null);
  const [evDraft,setEvDraft]=useState({title:"",date:"",time:"",endTime:"",notes:"",color:"#D4A5A0",allDay:false,category:"personal"});
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
  const [progressPeriod,setProgressPeriod]=useState("month");
  const [hmNavMonth,setHmNavMonth]=useState(0);
  const [actBarGran,setActBarGran]=useState("weekly");
  const [actBarNav,setActBarNav]=useState(0);
  const [rhythmTab,setRhythmTab]=useState("weekday");
  const [todoView,setTodoView]=useState("today");
  const [showMonths,setShowMonths]=useState({});
  const [habitViewWeek,setHabitViewWeek]=useState(0); // 0=this week, 1=last week, etc.
  const [notifications,setNotifications]=useDB("sab_notifs",[]);
  const [showNotifs,setShowNotifs]=useState(false);
  const [showSettingsMenu,setShowSettingsMenu]=useState(false);
  const [minuteTick,setMinuteTick]=useState(0);
  const [gratitude,setGratitude]=useDB("sab_gratitude",{});
  const [gratReminders,setGratReminders]=useDB("sab_grat_rem",{morning:true,morningTime:"08:00",evening:true,eveningTime:"21:00"});
  const [projects,setProjects]=useDB("sab_projects",[]);
  const [selProjId,setSelProjId]=useState(null);
  const [projTab,setProjTab]=useState("active");
  const [projSort,setProjSort]=useState("recent");
  const [showNewProj,setShowNewProj]=useState(false);
  const [newProjTitle,setNewProjTitle]=useState("");
  const [newProjDesc,setNewProjDesc]=useState("");
  const [newProjIcon,setNewProjIcon]=useState("laptop");
  const [newProjPriority,setNewProjPriority]=useState("medium");
  const [newProjDue,setNewProjDue]=useState("");
  const [newProjTaskText,setNewProjTaskText]=useState("");
  const [newProjTaskPri,setNewProjTaskPri]=useState("medium");
  const [newProjTaskDue,setNewProjTaskDue]=useState("");
  const [newProjMilText,setNewProjMilText]=useState("");
  const [projNotesEdit,setProjNotesEdit]=useState(false);
  const [editProjNotes,setEditProjNotes]=useState("");
  const [showEditProj,setShowEditProj]=useState(false);
  const [editProjId,setEditProjId]=useState(null);
  const [editProjTitle,setEditProjTitle]=useState("");
  const [editProjDesc,setEditProjDesc]=useState("");
  const [editProjIcon,setEditProjIcon]=useState("laptop");
  const [editProjPriority,setEditProjPriority]=useState("medium");
  const [editProjDue,setEditProjDue]=useState("");
  const [editProjStart,setEditProjStart]=useState("");
  const [editProjStatus,setEditProjStatus]=useState("active");
  const [newNoteText,setNewNoteText]=useState("");
  const [editNoteId,setEditNoteId]=useState(null);
  const [editNoteText,setEditNoteText]=useState("");
  const [editTaskId,setEditTaskId]=useState(null);
  const [editTaskText,setEditTaskText]=useState("");
  const [editTaskPri,setEditTaskPri]=useState("medium");
  const [editTaskDue,setEditTaskDue]=useState("");
  const [taskMenuId,setTaskMenuId]=useState(null);
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
  const [showDashModal,setShowDashModal]=useState(false);
  const [dashModalText,setDashModalText]=useState("");
  const [dashModalPri,setDashModalPri]=useState("medium");
  const [dashModalTag,setDashModalTag]=useState("Personal");
  const [editSubtask,setEditSubtask]=useState(null);

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
  useEffect(()=>{const h=()=>setHabMenuId(null);document.addEventListener("click",h);return()=>document.removeEventListener("click",h);},[]);
  useEffect(()=>{const h=()=>{setShowSettingsMenu(false);setShowNotifs(false);};document.addEventListener("click",h);return()=>document.removeEventListener("click",h);},[]);
  useEffect(()=>{localStorage.setItem("sab_page",page);},[page]);
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
  useEffect(()=>{const t=setInterval(()=>setMinuteTick(n=>n+1),60000);return()=>clearInterval(t);},[]);
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
  // Fires at 3am on Monday (or later that day if app was closed overnight)
  useEffect(()=>{
    const wk=isoWeekKey(TODAY);
    const now=new Date();
    const isMonday=now.getDay()===1;
    const isPast3am=now.getHours()>=3;
    if(habitsWeekKey&&habitsWeekKey!==wk&&isMonday&&isPast3am){
      setHabitsArchive(a=>({...a,[habitsWeekKey]:habits.map(h=>({id:h.id,name:h.name,days:[...h.days],dayTimes:[...(h.dayTimes||Array(7).fill(null))]}))}));
      setHabits(h=>h.map(hab=>({...hab,days:Array(7).fill(false),dayTimes:Array(7).fill(null)})));
    }
    if(!habitsWeekKey||(habitsWeekKey!==wk&&isMonday&&isPast3am))setHabitsWeekKey(wk);
  },[TODAY,minuteTick]);// eslint-disable-line react-hooks/exhaustive-deps

  // Weekly cleaning reset — archive last week, uncheck all tasks
  // Fires at 3am on Monday (or later that day if app was closed overnight)
  useEffect(()=>{
    const wk=isoWeekKey(TODAY);
    const now=new Date();
    const isMonday=now.getDay()===1;
    const isPast3am=now.getHours()>=3;
    if(cleanWeekKey&&cleanWeekKey!==wk&&isMonday&&isPast3am){
      setCleanArchive(a=>({...a,[cleanWeekKey]:JSON.parse(JSON.stringify(cleaning))}));
      setCleaning(c=>Object.fromEntries(Object.entries(c).map(([d,ts])=>[d,ts.map(t=>({...t,done:false}))])));
    }
    if(!cleanWeekKey||(cleanWeekKey!==wk&&isMonday&&isPast3am))setCleanWeekKey(wk);
  },[TODAY,minuteTick]);// eslint-disable-line react-hooks/exhaustive-deps

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

  // Overdue project task notifications
  useEffect(()=>{
    if(!projects||projects.length===0)return;
    projects.forEach(p=>{
      (p.tasks||[]).forEach(t=>{
        if(!t.done&&t.dueDate&&t.dueDate<TODAY){
          setNotifications(ns=>{
            const key="proj-task-overdue-"+t.id;
            if(ns.some(n=>n.key===key))return ns;
            return[...ns,{id:Date.now(),key,type:"proj-task-overdue",date:TODAY,text:"Overdue task in “"+p.title+"”: "+t.text,read:false}];
          });
        }
      });
    });
  },[projects,TODAY]);// eslint-disable-line react-hooks/exhaustive-deps

  // Streak protection: if no habits checked by 5pm and there's an active streak, alert
  useEffect(()=>{
    const check=()=>{
      const now=new Date();
      if(now.getHours()===17&&now.getMinutes()===0){
        const todayIdx=new Date(TODAY+"T12:00:00").getDay()===0?6:new Date(TODAY+"T12:00:00").getDay()-1;
        const anyDoneToday=habits.some(h=>h.days[todayIdx]);
        const hasStreak=habits.some(h=>h.days.filter(Boolean).length>0);
        if(!anyDoneToday&&hasStreak){
          setNotifications(ns=>{
            if(ns.some(n=>n.date===TODAY&&n.type==="streak-protect"))return ns;
            return[...ns,{id:Date.now(),type:"streak-protect",date:TODAY,text:"⚠️ Don't break your streak! You haven't checked off any habits today.",read:false}];
          });
          try{if(!ac.current)ac.current=new(window.AudioContext||window.webkitAudioContext)();const ctx=ac.current;if(ctx.state==="suspended")ctx.resume();[440,370].forEach((freq,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type="sine";o.frequency.value=freq;g.gain.setValueAtTime(0,ctx.currentTime+i*.22);g.gain.linearRampToValueAtTime(.12,ctx.currentTime+i*.22+.05);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+i*.22+.55);o.start(ctx.currentTime+i*.22);o.stop(ctx.currentTime+i*.22+.55);});}catch(e){}
        }
      }
    };
    check();const t=setInterval(check,60000);return()=>clearInterval(t);
  },[habits,TODAY]);// eslint-disable-line react-hooks/exhaustive-deps

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
  // Gentle 2-note gratitude chime — plays on task addition
  const gratChime=()=>{try{if(!ac.current)ac.current=new(window.AudioContext||window.webkitAudioContext)();const ctx=ac.current;const play=()=>{[[880,0],[1108.73,0.18]].forEach(([freq,delay])=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type="sine";o.frequency.value=freq;g.gain.setValueAtTime(0,ctx.currentTime+delay);g.gain.linearRampToValueAtTime(.12,ctx.currentTime+delay+.05);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+delay+.7);o.start(ctx.currentTime+delay);o.stop(ctx.currentTime+delay+.8);});};if(ctx.state==="suspended")ctx.resume().then(play);else play();}catch(e){}};
  const pomoBegin=()=>{try{if(!ac.current)ac.current=new(window.AudioContext||window.webkitAudioContext)();const ctx=ac.current;[440,554.37,659.25].forEach((freq,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type="sine";o.frequency.value=freq;g.gain.setValueAtTime(0,ctx.currentTime+i*.14);g.gain.linearRampToValueAtTime(.15,ctx.currentTime+i*.14+.04);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+i*.14+.35);o.start(ctx.currentTime+i*.14);o.stop(ctx.currentTime+i*.14+.35);});}catch(e){}};
  const pomoEnd=()=>{try{if(!ac.current)ac.current=new(window.AudioContext||window.webkitAudioContext)();const ctx=ac.current;[659.25,523.25,392].forEach((freq,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type="sine";o.frequency.value=freq;g.gain.setValueAtTime(0,ctx.currentTime+i*.16);g.gain.linearRampToValueAtTime(.13,ctx.currentTime+i*.16+.04);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+i*.16+.4);o.start(ctx.currentTime+i*.16);o.stop(ctx.currentTime+i*.16+.4);});}catch(e){}};
  const shout=()=>{setPraise(PRAISE[Math.floor(Math.random()*PRAISE.length)]);clearTimeout(pt.current);pt.current=setTimeout(()=>setPraise(null),3000);chime();};

  const toggleDay=(id,i)=>setHabits(h=>h.map(hab=>{if(hab.id!==id)return hab;const was=hab.days[i];if(!was)chime();const nowDone=!was;const newDayTimes=(hab.dayTimes||Array(7).fill(null)).map((t,j)=>j===i?(nowDone?new Date().toISOString():null):t);return{...hab,days:hab.days.map((d,j)=>j===i?!d:d),dayTimes:newDayTimes};}));
  const delHabit=id=>setHabits(h=>h.filter(hab=>hab.id!==id));
  const addHabit=()=>{if(!newHabit.trim())return;const idx=habits.length%HCOLORS.length;setHabits(h=>[...h,{id:Date.now(),name:newHabit,icon:HICONS[idx],color:HCOLORS[idx],days:Array(7).fill(false),dayTimes:Array(7).fill(null)}]);setNewHabit("");};
  const startEH=h=>{setEditHabit(h.id);setEditHName(h.name);};
  const saveEH=id=>{if(editHName.trim())setHabits(h=>h.map(hab=>hab.id===id?{...hab,name:editHName}:hab));setEditHabit(null);};
  const setIcon=(id,icon)=>{setHabits(h=>h.map(hab=>hab.id===id?{...hab,icon}:hab));setIconFor(null);};
  const reorderHabit=(fromId,toId)=>{if(fromId===toId)return;setHabits(h=>{const arr=[...h];const fi=arr.findIndex(x=>x.id===fromId);const ti=arr.findIndex(x=>x.id===toId);if(fi<0||ti<0)return arr;const [item]=arr.splice(fi,1);arr.splice(ti,0,item);return arr;});};
  const streak=days=>days.filter(Boolean).length;

  const byPri=arr=>[...arr].sort((a,b)=>(PRIORITY_ORD[a.priority??"medium"])-(PRIORITY_ORD[b.priority??"medium"]));
  const pflag=(p)=>{const cfg={high:{c:"#d93535",l:"High"},medium:{c:"#c9870a",l:"Medium"},low:{c:"#9a9a9a",l:"Low"}};const {c,l}=cfg[p||"medium"];return(<div className="pflag"><svg width="10" height="12" viewBox="0 0 10 12" fill="none"><line x1="1" y1="0" x2="1" y2="12" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><path d="M1 1.5 L9.5 4.5 L1 7.5Z" fill={c}/></svg><span style={{color:c}}>{l}</span></div>);};
  const addSubtask=(todoId)=>{const newSub={id:Date.now(),text:"",done:false};setTodos(ts=>ts.map(td=>td.id===todoId?{...td,subtasks:[...(td.subtasks||[]),newSub]}:td));setEditSubtask({todoId,subId:newSub.id,text:""});};
  const toggleSubtask=(todoId,subId)=>setTodos(ts=>ts.map(td=>td.id===todoId?{...td,subtasks:(td.subtasks||[]).map(s=>s.id===subId?{...s,done:!s.done}:s)}:td));
  const delSubtask=(todoId,subId)=>setTodos(ts=>ts.map(td=>td.id===todoId?{...td,subtasks:(td.subtasks||[]).filter(s=>s.id!==subId)}:td));
  const saveSubtask=(todoId,subId,text)=>{if(!text.trim()){delSubtask(todoId,subId);}else{setTodos(ts=>ts.map(td=>td.id===todoId?{...td,subtasks:(td.subtasks||[]).map(s=>s.id===subId?{...s,text:text.trim()}:s)}:td));}setEditSubtask(null);};
  const addDashTask=()=>{if(!dashModalText.trim())return;setTodos(ts=>[...ts,{id:Date.now(),text:dashModalText,done:false,tag:dashModalTag,date:TODAY,priority:dashModalPri,subtasks:[]}]);setDashModalText("");setDashModalPri("medium");setShowDashModal(false);gratChime();};
  const addTodoFor=date=>{if(!newTodo.trim())return;setTodos(t=>[...t,{id:Date.now(),text:newTodo,done:false,tag:newTodoTag,date,priority:newTodoPriority,subtasks:[]}]);setNewTodo("");gratChime();};
  const addTodo=()=>addTodoFor(TODAY);
  const addTodoDash=()=>addTodoFor(dashTodoDay==="today"?TODAY:TOMORROW);
  const toggleTodo=id=>setTodos(t=>t.map(td=>{if(td.id!==id)return td;if(!td.done)shout();const nowDone=!td.done;return{...td,done:nowDone,doneAt:nowDone?new Date().toISOString():null};}));
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
  const goalPct=g=>{if(!g.milestones||!g.milestones.length)return g.progress||0;return Math.round(g.milestones.filter(m=>m.done).length/g.milestones.length*100);};
  const catMeta=cat=>GOAL_CATS[cat]||{color:"#b09070",bg:"#f4ede3"};
  const goalIconEl=id=>{const ic=GOAL_ICON_LIST.find(i=>i.id===id);return ic?ic.el:<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#f4ede3"/></svg>;};
  const openAddG=()=>{setGDraft({title:"",description:"",category:"Health",icon:"health",targetDate:"",milestones:[""]});setGoalModalMode("add");setGoalEditId(null);setShowGoalModal(true);gratChime();};
  const openEditG=g=>{setGDraft({title:g.title,description:g.description||"",category:g.category||"Health",icon:g.icon||"health",targetDate:g.targetDate||g.deadline||"",milestones:g.milestones.map(m=>m.text||m)});setGoalModalMode("edit");setGoalEditId(g.id);setShowGoalModal(true);};
  const saveGoal=()=>{if(!gDraft.title.trim())return;const ms=gDraft.milestones.filter(m=>(typeof m==="string"?m:m.text||"").trim()).map(m=>{const txt=typeof m==="string"?m:m.text||"";return{id:Date.now()+Math.random(),text:txt.trim(),done:false,doneDate:null};});if(goalModalMode==="add"){const ex=goals[vMonth]||[];setGoals(p=>({...p,[vMonth]:[...ex,{id:Date.now(),title:gDraft.title,description:gDraft.description,category:gDraft.category,icon:gDraft.icon,targetDate:gDraft.targetDate,milestones:ms}]}));}else{setGoals(p=>({...p,[vMonth]:(p[vMonth]||[]).map(g=>g.id===goalEditId?{...g,title:gDraft.title,description:gDraft.description,category:gDraft.category,icon:gDraft.icon,targetDate:gDraft.targetDate,milestones:ms}:g)}));}setShowGoalModal(false);gratChime();};
  const delGoal=id=>{setGoals(p=>({...p,[vMonth]:(p[vMonth]||[]).filter(g=>g.id!==id)}));setGoalMenuOpen(null);};
  const toggleMs=(gid,mi)=>{setGoals(p=>({...p,[vMonth]:(p[vMonth]||[]).map(g=>{if(g.id!==gid)return g;const ms=g.milestones.map((m,i)=>{if(i!==mi)return m;const nowDone=!m.done;if(nowDone)chime();return{...m,done:nowDone,doneDate:nowDone?TODAY:null};});return{...g,milestones:ms};})}));};
  const updateMsStatus=(gid,mi,newStatus)=>{const prevMs=(goals[vMonth]||[]).find(g=>g.id===gid)?.milestones?.[mi];if(newStatus==="completed"&&prevMs&&!prevMs.done)chime();setGoals(p=>({...p,[vMonth]:(p[vMonth]||[]).map(g=>{if(g.id!==gid)return g;const ms=g.milestones.map((m,i)=>{if(i!==mi)return m;return{...m,done:newStatus==="completed",doneDate:newStatus==="completed"?TODAY:null,status:newStatus};});return{...g,milestones:ms};})}));setMsDropOpen(null);};
  const gMsAdd=()=>{if(gDraft.milestones.length<5)setGDraft(d=>({...d,milestones:[...d.milestones,""]}));};
  const gMsDel=i=>setGDraft(d=>({...d,milestones:d.milestones.filter((_,j)=>j!==i)}));
  const gMsChange=(i,v)=>setGDraft(d=>({...d,milestones:d.milestones.map((m,j)=>j===i?v:m)}));

  const toggleClean=(day,idx)=>{
    const task=cleaning[day]?.[idx];
    if(task&&!task.done)chime();
    setCleaning(c=>({...c,[day]:c[day].map((t,i)=>i===idx?{...t,done:!t.done}:t)}));
  };
  const delClean=(day,idx)=>setCleaning(c=>({...c,[day]:c[day].filter((_,i)=>i!==idx)}));
  const addClean=day=>{if(!cInputs[day].trim())return;setCleaning(c=>({...c,[day]:[...c[day],{text:cInputs[day],done:false}]}));setCInputs(ci=>({...ci,[day]:""}));};
  const addHrTask=()=>{if(!hrDraft.text.trim())return;const _vd=new Date(NOW);_vd.setDate(NOW.getDate()+hrDayOffset);const _vDayName=DAYS[_vd.getDay()===0?6:_vd.getDay()-1];setCleaning(c=>({...c,[_vDayName]:[...(c[_vDayName]||[]),{text:hrDraft.text.trim(),done:false,category:hrDraft.category,duration:hrDraft.duration}]}));setHrDraft({text:"",category:"General",duration:10});setHrModal(false);};
  const startEC=(day,idx,text)=>{setEditC({day,idx});setEditCTxt(text);};
  const saveEC=()=>{if(!editC)return;const{day,idx}=editC;if(editCTxt.trim())setCleaning(c=>({...c,[day]:c[day].map((t,i)=>i===idx?{...t,text:editCTxt}:t)}));setEditC(null);};

  const calDays=dim(calYear,calMonth);
  const calFirst=fdm(calYear,calMonth);
  const calLabel=`${MONTHS[calMonth]} ${calYear}`;
  const prevCal=()=>{if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1);};
  const nextCal=()=>{if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1);};
  const evOn=ds=>events.filter(e=>e.date===ds);

  // Calendar helpers — defined inside component to avoid rolldown ordering bugs
  const CAL_CATS=[{id:"focus",label:"Focus",color:"#A89880"},{id:"work",label:"Work",color:"#787878"},{id:"wellness",label:"Wellness",color:"#8FAF8A"},{id:"personal",label:"Personal",color:"#D4A5A0"},{id:"social",label:"Social",color:"#C9A87C"}];
  const CAL_HOURS=[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
  const calCatColor=cat=>(CAL_CATS.find(c=>c.id===cat)||{color:"#A89880"}).color;
  const fmtHour=h=>{if(h===12)return"12 PM";if(h===0)return"12 AM";return h<12?h+" AM":(h-12)+" PM";};
  const toMins=t=>{if(!t)return null;const[h,m]=t.split(":").map(Number);return h*60+m;};
  const evTopPx=t=>{const m=toMins(t);return m===null?null:m-6*60;};
  const evHtPx=(s,e)=>{const sm=toMins(s),em=toMins(e);return sm===null||em===null||em<=sm?60:Math.max(em-sm,30);};
  const fmtShort=t=>{if(!t)return"";const[h,m]=t.split(":").map(Number);const p=h<12?"AM":"PM";const h12=h===0?12:h>12?h-12:h;return h12+(m>0?":"+String(m).padStart(2,"0"):"")+p;};
  const fmtEvTime=t=>{if(!t)return"";const[h,m]=t.split(":").map(Number);const p=h<12?"AM":"PM";const h12=h===0?12:h>12?h-12:h;return h12+":"+String(m).padStart(2,"0")+" "+p;};

  // Calendar view computed (always run — never inside IIFE)
  const effWkStart=calWkStart||TODAY;
  const effDayDate=calDayDate||TODAY;
  const calWkDates=Array.from({length:7},(_,i)=>{const d=new Date(effWkStart+"T00:00:00");d.setDate(d.getDate()+i);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");});
  const calWkLabel=MONTHS[new Date(effWkStart+"T00:00:00").getMonth()]+" "+new Date(effWkStart+"T00:00:00").getFullYear();
  const calDayLabel=new Date(effDayDate+"T00:00:00").toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"});
  const calMiniFirst=fdm(calYear,calMonth);
  const calMiniDays=dim(calYear,calMonth);
  const calUpcoming=(()=>{const r=[];const nowMins=NOW.getHours()*60+NOW.getMinutes();for(let i=0;i<14;i++){const d=new Date(NOW);d.setDate(NOW.getDate()+i);const ds=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");evOn(ds).forEach(e=>{if(i===0){const em=toMins(e.endTime);const sm=toMins(e.time);if(em!==null&&em<nowMins)return;if(em===null&&sm!==null&&sm<nowMins)return;}r.push({...e,_ds:ds});});}return r.slice(0,6);})();
  const prevWk=()=>{const d=new Date(effWkStart+"T00:00:00");d.setDate(d.getDate()-7);setCalWkStart(d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"));};
  const nextWk=()=>{const d=new Date(effWkStart+"T00:00:00");d.setDate(d.getDate()+7);setCalWkStart(d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"));};
  const goToday=()=>{setCalMonth(NOW.getMonth());setCalYear(NOW.getFullYear());setCalWkStart(TODAY);setCalDayDate(TODAY);};
  const prevDayD=()=>{const d=new Date(effDayDate+"T00:00:00");d.setDate(d.getDate()-1);setCalDayDate(d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"));};
  const nextDayD=()=>{const d=new Date(effDayDate+"T00:00:00");d.setDate(d.getDate()+1);setCalDayDate(d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"));};

  const openAddEv=(ds,t)=>{setEvDraft({title:"",date:ds,time:t||"",endTime:"",notes:"",color:"#D4A5A0",allDay:!t,category:"personal"});setEvModal({mode:"add"});};
  const openEditEv=(e,ev)=>{ev.stopPropagation();setEvDraft({title:e.title,date:e.date,time:e.time||"",endTime:e.endTime||"",notes:e.notes||"",color:e.color||CAL_CATS[3].color,allDay:e.allDay||false,category:e.category||"personal"});setEvModal({mode:"edit",id:e.id});};
  const saveEv=()=>{if(!evDraft.title.trim())return;if(evModal.mode==="add")setEvents(ev=>[...ev,{id:Date.now(),...evDraft}]);else setEvents(ev=>ev.map(e=>e.id===evModal.id?{...e,...evDraft}:e));setEvModal(null);};
  const delEv=id=>{setEvents(ev=>ev.filter(e=>e.id!==id));setEvModal(null);};

  // Dashboard computed values
  const habitsToday=habits.filter(h=>h.days[0]).length;
  const todosDone=todos.filter(t=>t.done&&t.date===TODAY).length;
  const allGoals=Object.values(goals).flat();
  const avgProg=allGoals.length?Math.round(allGoals.reduce((a,g)=>a+((g.milestones&&g.milestones.length)?g.milestones.filter(m=>m.done).length/g.milestones.length*100:(g.progress||0)),0)/allGoals.length):0;
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
  const goalMilestoneDoneToday=allGoals.some(g=>(g.milestones||[]).some(m=>m.done&&m.doneDate===TODAY));
  const goalDoneV=monthGoalsArr.length>0?(goalMilestoneDoneToday?1:0):0;
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
  const RW_ICONS={
    progress:<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#F3EAE1"/><path d="M14 6L15.5 11.1L20.8 11.2L16.6 14.3L18.1 19.4L14 16.3L9.9 19.4L11.4 14.3L7.2 11.2L12.5 11.1L14 6Z" fill="#B89576"/></svg>,
    habit:<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#EEF3EA"/><path d="M8 14.2L12 18L20 9.5" stroke="#7F8F68" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    task:<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#EEF3EA"/><rect x="8" y="7" width="12" height="14" rx="2" stroke="#7F8F68" strokeWidth="1.8"/><path d="M11 12L13 14L17 10" stroke="#7F8F68" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M11 17H17" stroke="#7F8F68" strokeWidth="1.8" strokeLinecap="round"/></svg>,
    home:<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#EEF3F8"/><path d="M8 13.5L14 8.5L20 13.5V20H16.5V16.2H11.5V20H8V13.5Z" stroke="#7E9AAF" strokeWidth="1.8" strokeLinejoin="round"/><path d="M11 13.8L13 15.8L17 11.5" stroke="#7E9AAF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    grat:<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#F7EDEA"/><path d="M14 20.5C13.8 20.5 13.5 20.4 13.3 20.2C9.7 17.7 7.5 15.7 7.5 12.5C7.5 10.5 9 9 10.9 9C12.1 9 13.2 9.6 14 10.6C14.8 9.6 15.9 9 17.1 9C19 9 20.5 10.5 20.5 12.5C20.5 15.7 18.3 17.7 14.7 20.2C14.5 20.4 14.2 20.5 14 20.5Z" fill="#C98F8F"/></svg>,
    goal:<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#F3EAE1"/><circle cx="14" cy="14" r="6" stroke="#B89576" strokeWidth="2"/><circle cx="14" cy="14" r="2.2" fill="#B89576"/><path d="M17.5 10.5L21 7" stroke="#B89576" strokeWidth="2" strokeLinecap="round"/></svg>,
    streak:<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#F3EAE1"/><path d="M14.2 23C10.5 23 7.8 20.2 7.8 16.4C7.8 13.7 9.2 11.7 11 9.9C12.2 8.7 13.1 7.2 13.3 5C13.4 4.3 14.3 4 14.8 4.5C17 6.7 20.2 10.5 20.2 15.7C20.2 20.1 17.6 23 14.2 23Z" fill="#B89576"/><path d="M14.2 20.2C12.5 20.2 11.3 19 11.3 17.4C11.3 16.2 12 15.3 12.8 14.5C13.4 13.9 13.8 13.2 13.9 12.2C14 11.7 14.6 11.5 15 11.9C16 13 17 14.4 17 16.7C17 18.8 15.8 20.2 14.2 20.2Z" fill="#FFFDF9"/></svg>,
  };
  const recentWins=(()=>{
    const wins=[];
    if(dayTotal>0){
      if(dayPct===100)wins.push({icon:RW_ICONS.progress,title:"Perfect Day!",text:"Every single task completed today."});
      else if(dayPct>=75)wins.push({icon:RW_ICONS.progress,title:"Outstanding!",text:`${dayPct}% done — you're crushing it.`});
      else if(dayPct>=50)wins.push({icon:RW_ICONS.progress,title:"Great Progress",text:`${dayPct}% of today's tasks complete.`});
      else if(dayPct>0)wins.push({icon:RW_ICONS.progress,title:"Getting Started",text:`${dayPct}% done — keep the momentum!`});
      else wins.push({icon:RW_ICONS.progress,title:"Fresh Start",text:"A brand new day full of possibility."});
    }
    if(habitsTotal>0){
      if(habitsDoneToday===habitsTotal)wins.push({icon:RW_ICONS.habit,title:"All Habits Done!",text:`All ${habitsTotal} habits ticked off today.`});
      else if(habitsDoneToday>0)wins.push({icon:RW_ICONS.habit,title:"Habit Check-In",text:`${habitsDoneToday} of ${habitsTotal} habits completed.`});
    }
    const topStreak=habits.map(h=>({name:h.name,s:streak(h.days)})).filter(x=>x.s>=2).sort((a,b)=>b.s-a.s)[0];
    if(topStreak)wins.push({icon:RW_ICONS.streak,title:"Streak!",text:`${topStreak.name} — ${topStreak.s} days in a row.`});
    if(todosDoneToday>=3)wins.push({icon:RW_ICONS.task,title:"Task Crusher",text:`${todosDoneToday} to-dos crossed off today.`});
    else if(todosDoneToday>0)wins.push({icon:RW_ICONS.task,title:"To-Do Progress",text:`${todosDoneToday} task${todosDoneToday>1?"s":""} done — nice work!`});
    if(cleaningTodayArr.length>0&&cleaningDoneToday===cleaningTotalToday)wins.push({icon:RW_ICONS.home,title:"Home Reset Done",text:`All ${TODAY_DAY} reset tasks complete ✦`});
    else if(cleaningDoneToday>0)wins.push({icon:RW_ICONS.home,title:"Home Reset",text:`${cleaningDoneToday} of ${cleaningTotalToday} reset tasks done.`});
    if(todayGrat.length>=GRAT_TARGET)wins.push({icon:RW_ICONS.grat,title:"Gratitude Complete",text:"Your gratitude journal is full today."});
    else if(todayGrat.length>0)wins.push({icon:RW_ICONS.grat,title:"Grateful Today",text:`${todayGrat.length} gratitude entr${todayGrat.length>1?"ies":"y"} written.`});
    allGoals.forEach(g=>{
      if(g.progress>=100)wins.push({icon:RW_ICONS.goal,title:"Goal Achieved!",text:`"${g.title}" is complete!`});
      else if(g.progress>=75)wins.push({icon:RW_ICONS.goal,title:"Almost There",text:`"${g.title}" is ${g.progress}% done.`});
    });
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
    // If today not yet done, start counting from yesterday so streak doesn't show 0 all morning
    let di=hab.days[todayIdx]?todayIdx:todayIdx-1;
    if(di>=0){
      while(di>=0&&hab.days[di]){s++;di--;}
      if(di>=0)return s;
    }
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
  // Completion rate — day-based: Completed=all habits done, Partial=some done, Missed=none done
  const habitDayStats=DAYS.map((_,i)=>{const total=habitWeekDays.length;const done=habitWeekDays.filter(h=>h.days[i]).length;if(total===0)return"missed";if(done===total)return"completed";if(done===0)return"missed";return"partial";});
  const habitDaysCompleted=habitDayStats.filter(s=>s==="completed").length;
  const habitDaysPartial=habitDayStats.filter(s=>s==="partial").length;
  const habitDaysMissed=habitDayStats.filter(s=>s==="missed").length;
  const habitDonePct=Math.round(habitDaysCompleted/7*100);
  const habitPartPct=Math.round(habitDaysPartial/7*100);
  const habitMissPct=Math.round(habitDaysMissed/7*100);
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
  const PROJ_ICONS={
    laptop:<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="18" fill="#F3E8DE"/><rect x="10" y="11.5" width="16" height="11" rx="1.8" stroke="#B9855E" strokeWidth="2"/><path d="M8.5 26H27.5" stroke="#B9855E" strokeWidth="2" strokeLinecap="round"/></svg>,
    dumbbell:<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="18" fill="#EEF3EA"/><path d="M10 13V23" stroke="#7F8F68" strokeWidth="2.2" strokeLinecap="round"/><path d="M26 13V23" stroke="#7F8F68" strokeWidth="2.2" strokeLinecap="round"/><path d="M7 16V20" stroke="#7F8F68" strokeWidth="2.2" strokeLinecap="round"/><path d="M29 16V20" stroke="#7F8F68" strokeWidth="2.2" strokeLinecap="round"/><path d="M10 18H26" stroke="#7F8F68" strokeWidth="2.2" strokeLinecap="round"/></svg>,
    book:<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="18" fill="#F2EDF7"/><path d="M9 12C12 11 15 11.2 18 13V27C15 25.8 12 25.8 9 27V12Z" stroke="#9B7BB6" strokeWidth="1.8" strokeLinejoin="round"/><path d="M27 12C24 11 21 11.2 18 13V27C21 25.8 24 25.8 27 27V12Z" stroke="#9B7BB6" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
    heart:<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="18" fill="#F7EDEA"/><path d="M18 26C17.7 26 17.5 25.9 17.2 25.7C12.2 22.4 9 19.6 9 15.2C9 12.6 11 10.5 13.5 10.5C15.1 10.5 16.6 11.4 18 13.1C19.4 11.4 20.9 10.5 22.5 10.5C25 10.5 27 12.6 27 15.2C27 19.6 23.8 22.4 18.8 25.7C18.5 25.9 18.3 26 18 26Z" stroke="#C98F8F" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
    home:<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="18" fill="#EEF3F8"/><path d="M9 17.5L18 10.5L27 17.5V27H21.5V21.5H14.5V27H9V17.5Z" stroke="#7E9AAF" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
    briefcase:<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="18" fill="#F3E8DE"/><rect x="8" y="15" width="20" height="13" rx="2.5" stroke="#B9855E" strokeWidth="1.8"/><path d="M13.5 15V13C13.5 11.9 14.4 11 15.5 11H20.5C21.6 11 22.5 11.9 22.5 13V15" stroke="#B9855E" strokeWidth="1.8" strokeLinecap="round"/></svg>,
    plane:<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="18" fill="#EEF3EA"/><path d="M9 19.5L27 12L21 28L17 21L9 19.5Z" stroke="#7F8F68" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
  };
  const PROJ_ICON_KEYS=["laptop","dumbbell","book","heart","home","briefcase","plane"];
  const projPct=p=>{
    const tp=p.tasks.length?p.tasks.filter(t=>t.done).length/p.tasks.length:null;
    const mp=p.milestones.length?p.milestones.filter(m=>m.done).length/p.milestones.length:null;
    if(tp===null&&mp===null)return 0;
    if(tp===null)return Math.round(mp*100);
    if(mp===null)return Math.round(tp*100);
    return Math.round(tp*40+mp*60);
  };
  const addProject=()=>{
    if(!newProjTitle.trim())return;
    setProjects(ps=>[...ps,{id:Date.now(),title:newProjTitle.trim(),description:newProjDesc.trim(),icon:newProjIcon,status:"active",priority:newProjPriority,startDate:TODAY,dueDate:newProjDue,tasks:[],milestones:[],notes:[],attachments:[],createdAt:TODAY}]);
    setNewProjTitle("");setNewProjDesc("");setNewProjIcon("laptop");setNewProjPriority("medium");setNewProjDue("");setShowNewProj(false);
  };
  const toggleProjTask=(projId,taskId)=>setProjects(ps=>ps.map(p=>p.id!==projId?p:{...p,tasks:p.tasks.map(t=>t.id!==taskId?t:{...t,done:!t.done,doneAt:!t.done?new Date().toISOString():null})}));
  const addProjTask=(projId)=>{
    if(!newProjTaskText.trim())return;
    setProjects(ps=>ps.map(p=>p.id!==projId?p:{...p,tasks:[...p.tasks,{id:Date.now(),text:newProjTaskText.trim(),done:false,dueDate:newProjTaskDue,priority:newProjTaskPri,doneAt:null}]}));
    setNewProjTaskText("");setNewProjTaskPri("medium");setNewProjTaskDue("");
  };
  const deleteProjTask=(projId,taskId)=>setProjects(ps=>ps.map(p=>p.id!==projId?p:{...p,tasks:p.tasks.filter(t=>t.id!==taskId)}));
  const updateProjTask=(projId,taskId,changes)=>setProjects(ps=>ps.map(p=>p.id!==projId?p:{...p,tasks:p.tasks.map(t=>t.id!==taskId?t:{...t,...changes})}));
  const toggleProjMil=(projId,milId)=>setProjects(ps=>ps.map(p=>p.id!==projId?p:{...p,milestones:p.milestones.map(m=>m.id!==milId?m:{...m,done:!m.done,doneDate:!m.done?TODAY:null})}));
  const addProjMil=(projId)=>{
    if(!newProjMilText.trim())return;
    setProjects(ps=>ps.map(p=>p.id!==projId?p:{...p,milestones:[...p.milestones,{id:Date.now(),title:newProjMilText.trim(),done:false,doneDate:null,deadline:""}]}));
    setNewProjMilText("");
  };
  const deleteProjMil=(projId,milId)=>setProjects(ps=>ps.map(p=>p.id!==projId?p:{...p,milestones:p.milestones.filter(m=>m.id!==milId)}));
  const saveProjNotes=(projId)=>setProjects(ps=>ps.map(p=>p.id!==projId?p:{...p,notes:editProjNotes}));
  const getProjNotes=(p)=>{if(!p.notes)return[];if(typeof p.notes==="string")return p.notes?[{id:0,text:p.notes,createdAt:p.startDate||TODAY}]:[];return p.notes;};
  const addProjNote=(projId)=>{if(!newNoteText.trim())return;setProjects(ps=>ps.map(p=>p.id!==projId?p:{...p,notes:[...getProjNotes(p),{id:Date.now(),text:newNoteText.trim(),createdAt:TODAY}]}));setNewNoteText("");};
  const deleteProjNote=(projId,noteId)=>setProjects(ps=>ps.map(p=>p.id!==projId?p:{...p,notes:getProjNotes(p).filter(n=>n.id!==noteId)}));
  const saveNoteEdit=(projId)=>{if(!editNoteText.trim())return;setProjects(ps=>ps.map(p=>p.id!==projId?p:{...p,notes:getProjNotes(p).map(n=>n.id===editNoteId?{...n,text:editNoteText.trim()}:n)}));setEditNoteId(null);setEditNoteText("");};
  const saveEditProject=()=>{if(!editProjTitle.trim())return;setProjects(ps=>ps.map(p=>p.id!==editProjId?p:{...p,title:editProjTitle.trim(),description:editProjDesc.trim(),icon:editProjIcon,priority:editProjPriority,dueDate:editProjDue,startDate:editProjStart,status:editProjStatus}));setShowEditProj(false);};
  const openEditProj=(p)=>{setEditProjId(p.id);setEditProjTitle(p.title);setEditProjDesc(p.description||"");setEditProjIcon(p.icon||"laptop");setEditProjPriority(p.priority||"medium");setEditProjDue(p.dueDate||"");setEditProjStart(p.startDate||TODAY);setEditProjStatus(p.status||"active");setShowEditProj(true);};
  const openTaskEdit=(t)=>{setEditTaskId(t.id);setEditTaskText(t.text);setEditTaskPri(t.priority||"medium");setEditTaskDue(t.dueDate||"");setTaskMenuId(null);};
  const saveTaskEdit=(projId)=>{if(!editTaskText.trim())return;setProjects(ps=>ps.map(p=>p.id!==projId?p:{...p,tasks:p.tasks.map(t=>t.id===editTaskId?{...t,text:editTaskText.trim(),priority:editTaskPri,dueDate:editTaskDue}:t)}));setEditTaskId(null);setEditTaskText("");};
  const addProjAttachment=(projId,file)=>{
    if(!file)return;
    if(file.size>8*1024*1024){alert("File is too large (max 8 MB). Try a smaller file.");return;}
    const reader=new FileReader();
    reader.onload=e=>{
      const att={id:Date.now(),name:file.name,size:file.size,type:file.type,data:e.target.result,addedAt:TODAY};
      setProjects(ps=>ps.map(p=>p.id!==projId?p:{...p,attachments:[...(p.attachments||[]),att]}));
    };
    reader.readAsDataURL(file);
  };
  const deleteProjAttachment=(projId,attId)=>setProjects(ps=>ps.map(p=>p.id!==projId?p:{...p,attachments:(p.attachments||[]).filter(a=>a.id!==attId)}));
  const downloadAttachment=(att)=>{
    const a=document.createElement("a");a.href=att.data;a.download=att.name;a.click();
  };
  const fmtBytes=(b)=>b<1024?b+"B":b<1048576?(b/1024).toFixed(1)+"KB":(b/1048576).toFixed(1)+"MB";
  const attIcon=(type)=>{
    if(type.startsWith("image/"))return'<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="#7E9AAF" strokeWidth="1.7"/><circle cx="8.5" cy="8.5" r="1.5" fill="#7E9AAF"/><path d="M21 15l-5-5L5 21" stroke="#7E9AAF" strokeWidth="1.7" strokeLinejoin="round"/></svg>';
    if(type.includes("pdf"))return'<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#C98F8F" strokeWidth="1.7" strokeLinejoin="round"/><path d="M14 2v6h6" stroke="#C98F8F" strokeWidth="1.7" strokeLinejoin="round"/><path d="M9 13h1.5a1 1 0 0 1 0 2H9v-4h1.5a1 1 0 0 1 0 2" stroke="#C98F8F" strokeWidth="1.4" strokeLinecap="round"/></svg>';
    if(type.includes("word")||type.includes("document"))return'<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#7F8F68" strokeWidth="1.7" strokeLinejoin="round"/><path d="M14 2v6h6" stroke="#7F8F68" strokeWidth="1.7" strokeLinejoin="round"/><path d="M8 13l2 6 2-4 2 4 2-6" stroke="#7F8F68" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>';
    if(type.includes("sheet")||type.includes("excel")||type.includes("csv"))return'<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#7F8F68" strokeWidth="1.7" strokeLinejoin="round"/><path d="M14 2v6h6" stroke="#7F8F68" strokeWidth="1.7" strokeLinejoin="round"/><path d="M8 12h8M8 16h8M8 12v8" stroke="#7F8F68" strokeWidth="1.4" strokeLinecap="round"/></svg>';
    return'<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#B9855E" strokeWidth="1.7" strokeLinejoin="round"/><path d="M14 2v6h6" stroke="#B9855E" strokeWidth="1.7" strokeLinejoin="round"/></svg>';
  };
  const NAV=[
    {id:"dashboard",label:"Dashboard",icon:<S><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></S>},
    {id:"calendar",label:"Calendar",icon:<S><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></S>},
    {id:"todos",label:"To-Do",icon:<S><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><polyline points="4 6 5 7 7 5"/><polyline points="4 12 5 13 7 11"/><polyline points="4 18 5 19 7 17"/></S>},
    {id:"habits",label:"Habits",icon:<S><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></S>},
    {id:"cleaning",label:"Home Reset",icon:<S><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/><path d="M19 6l2-1.5M19 9l2 1.5M21 7.5h-2"/></S>},
    {id:"goals",label:"Monthly Goals",icon:<S><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></S>},
    {id:"gratitude",label:"Gratitude",icon:<S><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></S>},
    {id:"projects",label:"Projects",icon:<S><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></S>},
  ];

  // ── HEADER ICONS (bell + settings, reused in every page header) ──
  const headerIcons=(
    <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
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
      <div className="dash-icon-btn" style={{position:"relative"}} onClick={e=>{e.stopPropagation();setShowSettingsMenu(s=>!s);setShowNotifs(false);}}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        {showSettingsMenu&&(
          <div className="notif-panel" onClick={e=>e.stopPropagation()} style={{minWidth:160}}>
            <div className="notif-hd"><span style={{fontFamily:"'Playfair Display',serif",fontSize:13,color:"var(--ink)"}}>Settings</span></div>
            <div className="notif-item" style={{cursor:"pointer",display:"flex",alignItems:"center",gap:10}} onClick={()=>{setPage("bilan");setShowSettingsMenu(false);}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--ink)"}}>My Progress</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

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
            <div className="mf"><div className="mlb">CATEGORY</div><div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:2}}>{CAL_CATS.map(c=><div key={c.id} onClick={()=>setEvDraft(d=>({...d,category:c.id,color:c.color}))} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:20,border:"2px solid "+(evDraft.category===c.id?c.color:"var(--border)"),cursor:"pointer",fontSize:11,background:evDraft.category===c.id?c.color+"22":"transparent",transition:"all .15s"}}><span style={{width:7,height:7,borderRadius:"50%",background:c.color,display:"inline-block"}}/>{c.label}</div>)}</div></div>
            <div className="fr">
              <div className="mf" style={{flex:1}}><div className="mlb">DATE</div><input className="mi2" type="date" value={evDraft.date} onChange={e=>setEvDraft(d=>({...d,date:e.target.value}))}/></div>
              {!evDraft.allDay&&<div className="mf" style={{flex:1}}><div className="mlb">START</div><input className="mi2" type="time" value={evDraft.time} onChange={e=>setEvDraft(d=>({...d,time:e.target.value}))}/></div>}
              {!evDraft.allDay&&<div className="mf" style={{flex:1}}><div className="mlb">END</div><input className="mi2" type="time" value={evDraft.endTime} onChange={e=>setEvDraft(d=>({...d,endTime:e.target.value}))}/></div>}
            </div>
            <div className="adrow">
              <input type="checkbox" id="evAllDay" checked={evDraft.allDay} onChange={e=>setEvDraft(d=>({...d,allDay:e.target.checked,time:e.target.checked?"":d.time,endTime:e.target.checked?"":d.endTime}))}/>
              <label htmlFor="evAllDay">ALL DAY EVENT</label>
            </div>
            <div className="mf"><div className="mlb">NOTES</div><input className="mi2" placeholder="Details…" value={evDraft.notes} onChange={e=>setEvDraft(d=>({...d,notes:e.target.value}))}/></div>
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
          <button onClick={()=>{if(!newHabit.trim())return;const idx=habits.length%HCOLORS.length;setHabits(h=>[...h,{id:Date.now(),name:newHabit,icon:HABIT_ICON_LIST[idx%HABIT_ICON_LIST.length],color:HCOLORS[idx],days:Array(7).fill(false),dayTimes:Array(7).fill(null)}]);setNewHabit("");}} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 16px",background:"var(--ink)",color:"#f4ede3",border:"none",borderRadius:20,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap"}}>+ New habit</button>
          {headerIcons}
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
              <div key={hab.id}
                className={`hab-row${dragHabId===hab.id?" dragging":""}`}
                draggable={habitViewWeek===0}
                onDragStart={()=>setDragHabId(hab.id)}
                onDragEnd={()=>setDragHabId(null)}
                onDragOver={e=>{e.preventDefault();e.currentTarget.classList.add("drag-over");}}
                onDragLeave={e=>e.currentTarget.classList.remove("drag-over")}
                onDrop={e=>{e.preventDefault();e.currentTarget.classList.remove("drag-over");if(dragHabId&&dragHabId!==hab.id)reorderHabit(dragHabId,hab.id);setDragHabId(null);}}>
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
                    :<span className="hab-rname">{hab.name}</span>
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
                {/* ⋮ menu */}
                <div style={{position:"relative"}} onClick={e=>e.stopPropagation()}>
                  <button className="hab-menu-btn" onClick={()=>setHabMenuId(habMenuId===hab.id?null:hab.id)}>⋮</button>
                  {habMenuId===hab.id&&(
                    <div className="hab-menu-popup">
                      <div className="hab-menu-item" onClick={()=>{startEH(hab);setHabMenuId(null);}}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit name
                      </div>
                      <div className="hab-menu-item del" onClick={()=>{delHabit(hab.id);setHabMenuId(null);}}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        Delete
                      </div>
                    </div>
                  )}
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
        <div className="hab-card" style={{padding:"16px 18px"}}>
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
<div style={{padding:"0 24px"}}>
  {/* Dashboard Add Task Modal */}
  {showDashModal&&(
    <div className="mov" onClick={()=>setShowDashModal(false)}>
      <div className="mbox" onClick={e=>e.stopPropagation()}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"var(--ink)",marginBottom:3}}>Add Task</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--gold-deep)",marginBottom:20}}>Adding to Today · {NOW.toLocaleDateString("en-GB",{day:"numeric",month:"long"})}</div>
        <label className="mlbl">Task</label>
        <input className="minp" style={{marginBottom:14}} placeholder="What needs to be done?" value={dashModalText} onChange={e=>setDashModalText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addDashTask()} autoFocus/>
        <label className="mlbl">Priority</label>
        <div style={{display:"flex",gap:6,marginTop:5,marginBottom:14}}>
          {[["high","#d93535"],["medium","#c9870a"],["low","#9a9a9a"]].map(([p,c])=>(
            <button key={p} className="mpri" style={dashModalPri===p?{background:c,color:"#fff",borderColor:c}:{}} onClick={()=>setDashModalPri(p)}>{p}</button>
          ))}
        </div>
        <label className="mlbl">Tag</label>
        <select className="msel" style={{marginBottom:22}} value={dashModalTag} onChange={e=>setDashModalTag(e.target.value)}>
          {tags.map(tag=><option key={tag}>{tag}</option>)}
        </select>
        <div style={{display:"flex",gap:8}}>
          <button style={{flex:1,padding:"10px",border:"1px solid var(--border)",borderRadius:10,background:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer",color:"var(--ink)"}} onClick={()=>setShowDashModal(false)}>Cancel</button>
          <button style={{flex:2,padding:"10px",border:"none",borderRadius:10,background:"var(--ink)",color:"#f4ede3",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,cursor:"pointer"}} onClick={addDashTask}>Add Task</button>
        </div>
      </div>
    </div>
  )}
  {/* Page header */}
  <div className="dash-page-header">
    <div>
      <div className="dash-page-title">Bonjour, <em>Sabina</em> ✦</div>
      <div className="dash-page-date">{NOW.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
    </div>
    <div className="dash-search">
      <div className="dash-search-bar">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        Search anything…
        <span style={{marginLeft:"auto",fontSize:10,color:"var(--border)",border:"1px solid var(--border)",borderRadius:4,padding:"1px 5px"}}>⌘K</span>
      </div>
      {headerIcons}
    </div>
  </div>

  {/* ── DASHBOARD ROWS ── */}
  <div style={{display:"flex",flexDirection:"column",gap:16}}>

  {/* ROW 1: Progress Card + Focus Timer — same height via stretch */}
  <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:16,alignItems:"stretch"}}>

    {/* Progress Card */}
    <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:14,padding:"20px 24px 0",boxShadow:"var(--shadow)",display:"flex",flexDirection:"column"}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:600,color:"var(--ink)",marginBottom:14}}>Today's Progress</div>
      <div style={{display:"flex",gap:20,alignItems:"center",flex:1}}>
        {/* Photo ring */}
        <div style={{position:"relative",flexShrink:0}}>
          {(()=>{const R=46,C=2*Math.PI*R;const rc=dayPct===100?"var(--sage)":dayPct>=60?"#c9a87c":"var(--ink-light)";return(
            <svg width="120" height="120" viewBox="0 0 120 120" style={{filter:"drop-shadow(0 2px 10px rgba(201,168,124,.18))"}}>
              <circle cx="60" cy="60" r={R} fill="none" stroke="var(--parchment)" strokeWidth="6"/>
              <circle cx="60" cy="60" r={R} fill="none" stroke={rc} strokeWidth="6" strokeDasharray={C} strokeDashoffset={C*(1-dayPct/100)} strokeLinecap="round" transform="rotate(-90 60 60)" style={{transition:"stroke-dashoffset .6s"}}/>
              <clipPath id="ppClip"><circle cx="60" cy="60" r="36"/></clipPath>
              <image href={userPhoto||sabinaPhoto} x="24" y="24" width="72" height="72" clipPath="url(#ppClip)" preserveAspectRatio="xMidYMid slice"/>
            </svg>
          );})()}
          <div onClick={()=>photoInputRef.current&&(photoInputRef.current.value="",photoInputRef.current.click())} style={{position:"absolute",bottom:14,right:14,width:22,height:22,borderRadius:"50%",background:"var(--gold)",border:"2px solid #fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,.2)",zIndex:2}}>
            <span style={{color:"#fff",fontSize:16,lineHeight:1,fontWeight:300,marginTop:"-1px"}}>+</span>
          </div>
          <input ref={photoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhotoChange}/>
        </div>
        {/* Big % */}
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:4}}>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:52,fontWeight:600,lineHeight:1,color:dayPct===100?"var(--sage)":dayPct>=60?"#c9a87c":"var(--ink)"}}>{dayPct}</span>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:"var(--ink-light)",fontWeight:400}}>%</span>
          </div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:13,color:"var(--ink-light)"}}>{dayDone} of {dayTotal} tasks completed</div>
        </div>
        {/* Bullets */}
        <div style={{display:"flex",flexDirection:"column",gap:10,justifyContent:"center",minWidth:160,flexShrink:0}}>
          {[
            {label:"Habits",done:habitsDoneToday,total:habitsTotal,color:"#c9a87c"},
            {label:"To-Do List",done:todosDoneToday,total:todosTotalToday,color:"#7a9070"},
            {label:"Home Reset",done:cleaningDoneToday,total:cleaningTotalToday,color:"#7090a8"},
            {label:"Gratitude",done:todayGrat.length,total:GRAT_TARGET,color:"#b0889a"},
          ].map(row=>(
            <div key={row.label} style={{display:"grid",gridTemplateColumns:"10px 1fr auto",alignItems:"center",gap:6}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:row.color,flexShrink:0}}/>
              <div style={{fontSize:11,color:"var(--ink)",fontFamily:"'DM Sans',sans-serif"}}>{row.label}</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:12,color:"var(--ink-light)"}}>{row.done}/{row.total}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Progress bar flush at bottom */}
      <div style={{height:7,background:"var(--parchment)",borderRadius:"0 0 14px 14px",overflow:"hidden",margin:"16px -24px 0"}}>
        <div style={{height:"100%",width:`${dayPct}%`,background:dayPct===100?"var(--sage)":"linear-gradient(90deg,#c9a87c,#a8865a)",transition:"width .6s"}}/>
      </div>
    </div>

    {/* Focus Timer — stretches to match progress card */}
    <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:14,padding:"16px 20px",boxShadow:"var(--shadow)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{alignSelf:"flex-start",fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:600,color:"var(--ink)"}}>Focus Timer</div>
      <div style={{display:"flex",gap:5,width:"100%",justifyContent:"center",flexWrap:"wrap",marginTop:6}}>
        {POMO_PRESETS.map(p=>(
          <button key={p.s} onClick={()=>pomoSelect(p.s)} style={{padding:"4px 12px",borderRadius:20,border:`1px solid ${pomoDur===p.s?"var(--ink)":"var(--border)"}`,background:pomoDur===p.s?"var(--ink)":"#fff",color:pomoDur===p.s?"#f4ede3":"var(--ink)",fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:500,cursor:"pointer",transition:"all .15s"}}>{p.label}</button>
        ))}
      </div>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={POMO_R} fill="none" stroke="var(--parchment)" strokeWidth="7"/>
        <circle cx="55" cy="55" r={POMO_R} fill="none" stroke={pomoColor} strokeWidth="7" strokeDasharray={POMO_CIRC} strokeDashoffset={POMO_CIRC-pomoDash} strokeLinecap="round" transform="rotate(-90 55 55)"/>
        <text x="55" y="51" textAnchor="middle" fontFamily="DM Sans" fontSize="17" fontWeight="600" fill="var(--ink)">{fmtPomo(pomoLeft)}</text>
        <text x="55" y="66" textAnchor="middle" fontFamily="Cormorant Garamond" fontSize="10" fill="var(--ink-light)" fontStyle="italic">{pomoActive?"Focus":"Ready"}</text>
      </svg>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        {!pomoActive
          ?<button onClick={pomoStart} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 20px",background:"var(--ink)",color:"#f4ede3",border:"none",borderRadius:24,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500,cursor:"pointer"}}>▶ Start Focus</button>
          :<button onClick={pomoPause} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 20px",background:"var(--ink)",color:"#f4ede3",border:"none",borderRadius:24,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500,cursor:"pointer"}}>⏸ Pause</button>
        }
        <button onClick={pomoStop} style={{width:34,height:34,borderRadius:"50%",border:"1px solid var(--border)",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:13,color:"var(--ink-light)"}}>↺</button>
      </div>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:10,color:"var(--ink-light)"}}>{pomoCount} sessions completed today</div>
    </div>

  </div>

  {/* ROW 2: Activity Cards + Gratitude (original style) */}
  {(()=>{const gratMonthCount=Object.keys(gratitude).filter(d=>d.startsWith(TODAY.slice(0,7))).reduce((s,d)=>s+(gratitude[d]||[]).length,0);return(
  <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:16,alignItems:"stretch"}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
      {[
        {icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 22C8.3 22 5.5 19.2 5.5 15.6C5.5 12.7 7.2 10.6 9.1 8.7C10.4 7.4 11.4 5.9 11.6 3.8C11.7 3.1 12.6 2.8 13.1 3.3C15.3 5.5 18.5 9.1 18.5 14.8C18.5 19 15.6 22 12 22Z" fill="#B89576"/><path d="M12.1 19.4C10.3 19.4 9 18.1 9 16.4C9 15.1 9.8 14.1 10.7 13.2C11.3 12.6 11.8 11.9 11.9 10.9C12 10.4 12.6 10.2 13 10.6C14 11.7 15.2 13.3 15.2 15.8C15.2 17.9 13.8 19.4 12.1 19.4Z" fill="#F4EFE8"/></svg>,label:"MOVE",val:todayFit&&fitMove!=null?Math.round(fitMove):null,unit:"kcal burned",color:"#B89576",bg:"rgba(184,149,118,.12)",wave:"M0,20 C15,8 30,30 45,18 C60,6 75,28 90,16 C105,4 120,22 135,14 C150,6 165,24 180,16 L180,50 L0,50Z"},
        {icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6.5 8V16" stroke="#A9B39F" strokeWidth="2" strokeLinecap="round"/><path d="M17.5 8V16" stroke="#A9B39F" strokeWidth="2" strokeLinecap="round"/><path d="M4 10V14" stroke="#A9B39F" strokeWidth="2" strokeLinecap="round"/><path d="M20 10V14" stroke="#A9B39F" strokeWidth="2" strokeLinecap="round"/><path d="M7.5 12H16.5" stroke="#A9B39F" strokeWidth="2" strokeLinecap="round"/></svg>,label:"EXERCISE",val:todayFit&&fitEx!=null?Math.round(fitEx):null,unit:"sessions",color:"#A9B39F",bg:"rgba(169,179,159,.12)",wave:"M0,25 C20,12 35,32 55,20 C75,8 90,30 110,18 C130,6 145,28 165,18 C175,14 178,20 180,18 L180,50 L0,50Z"},
        {icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="2" fill="#9BAFC7"/><path d="M12 8V15" stroke="#9BAFC7" strokeWidth="2" strokeLinecap="round"/><path d="M8.5 10.5H15.5" stroke="#9BAFC7" strokeWidth="2" strokeLinecap="round"/><path d="M10 21L12 15L14 21" stroke="#9BAFC7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,label:"STAND",val:todayFit&&standHrs!=null?standHrs:null,unit:"hours",color:"#9BAFC7",bg:"rgba(155,175,199,.12)",wave:"M0,18 C25,10 40,28 60,16 C80,4 95,26 115,14 C135,2 150,24 170,14 C176,11 178,16 180,14 L180,50 L0,50Z"},
      ].map(s=>(
        <div key={s.label} style={{background:"var(--ivory)",border:"1px solid var(--border)",borderRadius:12,padding:"14px 16px 0",boxShadow:"var(--shadow)",overflow:"hidden",position:"relative",minHeight:100}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{s.icon}</div>
            <span style={{fontSize:10,color:"var(--ink-light)",letterSpacing:".08em",fontFamily:"'DM Sans',sans-serif"}}>{s.label}</span>
          </div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:600,color:"var(--ink)",lineHeight:1,marginBottom:2}}>{s.val!=null?s.val:"—"}</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--ink-light)",marginBottom:26}}>{s.unit}</div>
          <svg viewBox="0 0 180 50" preserveAspectRatio="none" height="22" style={{position:"absolute",bottom:0,left:0,right:0,width:"100%",opacity:.32}}><path d={s.wave} fill={s.color}/></svg>
        </div>
      ))}
    </div>
    {/* Gratitude — original style */}
    <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:14,padding:"18px 20px",boxShadow:"var(--shadow)",display:"flex",flexDirection:"column",justifyContent:"center"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b0889a" strokeWidth="1.75"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:600,color:"var(--ink)"}}>Gratitude</div>
      </div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:44,fontWeight:600,color:"var(--ink)",lineHeight:1,marginBottom:4}}>{gratMonthCount}</div>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink-light)",marginBottom:18}}>entries this month</div>
      <button onClick={()=>setPage("gratitude")} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 18px",background:"var(--parchment)",color:"var(--ink)",border:"1px solid var(--border)",borderRadius:20,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,cursor:"pointer",alignSelf:"flex-start"}}>
        New Entry
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button>
    </div>
  </div>
  );})()}

  {/* ROW 3: Full-width Today's Tasks + Habits */}
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,alignItems:"stretch"}}>

    {/* Today's Tasks */}
    <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:14,overflow:"hidden",boxShadow:"var(--shadow)",display:"flex",flexDirection:"column",height:300}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px 12px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:600,color:"var(--ink)"}}>Today's Tasks</div>
          <span style={{background:"var(--parchment)",borderRadius:10,padding:"1px 8px",fontSize:10,color:"var(--ink-light)",fontFamily:"'DM Sans',sans-serif"}}>{todos.filter(t=>t.date===TODAY&&!t.done).length}</span>
        </div>
        <button onClick={()=>setPage("todos")} style={{background:"none",border:"none",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--gold-deep)",cursor:"pointer"}}>View all</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 20px",minHeight:0}}>
        {byPri(todos.filter(t=>t.date===TODAY&&!t.done)).map(todo=>(
          <div key={todo.id} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 0",borderBottom:"1px solid var(--border)"}}>
            <div onClick={()=>toggleTodo(todo.id)} style={{width:18,height:18,borderRadius:"50%",border:"1.5px solid rgba(26,20,16,.2)",background:"transparent",flexShrink:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}/>
            <div style={{flex:1,minWidth:0,fontSize:12,color:"var(--ink)",fontFamily:"'DM Sans',sans-serif",lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{todo.text}</div>
            <span className={`tg ${todo.tag}`} style={{flexShrink:0,fontSize:10}}>{todo.tag}</span>
          </div>
        ))}
        {todos.filter(t=>t.date===TODAY&&!t.done).length===0&&(
          <div style={{textAlign:"center",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:13,color:"var(--ink-light)",padding:"28px 0"}}>
            {todos.filter(t=>t.date===TODAY).length>0?"All done — great work! ✦":"Nothing planned for today ✦"}
          </div>
        )}
      </div>
      <div onClick={()=>setShowDashModal(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"11px 20px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"var(--gold-deep)",borderTop:"1px solid var(--border)",flexShrink:0}}>
        <span style={{fontSize:16,lineHeight:1}}>+</span> Add Task
      </div>
    </div>

    {/* Habits */}
    <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:14,padding:"16px 18px",boxShadow:"var(--shadow)",height:300,overflow:"hidden",display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:600,color:"var(--ink)"}}>Habits</div>
          <span style={{background:"var(--parchment)",borderRadius:10,padding:"2px 8px",fontSize:10,color:"var(--ink-light)",fontFamily:"'DM Sans',sans-serif"}}>This week</span>
        </div>
        <button onClick={()=>setPage("habits")} style={{background:"none",border:"none",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--gold-deep)",cursor:"pointer"}}>View all</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:9,overflowY:"auto",flex:1,minHeight:0}}>
        {habits.slice(0,8).map(hab=>(
          <div key={hab.id} style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:hab.color+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{HI(hab.icon,hab.color,13)}</div>
            <div style={{flex:1,minWidth:0,fontSize:12,color:"var(--ink)",fontFamily:"'DM Sans',sans-serif",fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{hab.name}</div>
            <div style={{display:"flex",gap:3,flexShrink:0}}>
              {hab.days.map((done,i)=>(
                <div key={i} onClick={()=>toggleDay(hab.id,i)} style={{width:10,height:10,borderRadius:"50%",background:done?hab.color:"var(--parchment)",border:`1px solid ${done?hab.color:"var(--border)"}`,cursor:"pointer",transition:"background .2s"}}/>
              ))}
            </div>
          </div>
        ))}
        {habits.length===0&&<div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink-light)"}}>No habits yet ✦</div>}
      </div>
    </div>

  </div>

  {/* ROW 4: Full-width Upcoming | Home Reset | Recent Wins */}
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>

    {/* Upcoming */}
    <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:14,padding:"18px 20px",boxShadow:"var(--shadow)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" style={{color:"var(--ink-light)"}}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:600,color:"var(--ink)"}}>Upcoming</div>
          {upcoming.length>0&&<span style={{background:"var(--parchment)",borderRadius:10,padding:"1px 7px",fontSize:10,color:"var(--ink-light)",fontFamily:"'DM Sans',sans-serif"}}>{upcoming.length}</span>}
        </div>
        <button onClick={()=>setPage("calendar")} style={{background:"none",border:"none",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--gold-deep)",cursor:"pointer"}}>View all</button>
      </div>
      {upcoming.length===0&&<div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink-light)"}}>No upcoming events ✦</div>}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {upcoming.slice(0,3).map(e=>{
          const d=new Date(e.date+"T00:00:00");
          const dotColors={Health:"#c9a87c",Work:"#7090a8",Personal:"#b0889a",Planning:"#7a9070"};
          return(
            <div key={e.id} onClick={ev=>openEditEv(e,ev)} style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:dotColors[e.tag]||"var(--sage)",flexShrink:0,marginTop:5}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,color:"var(--ink)",fontFamily:"'DM Sans',sans-serif",fontWeight:500,marginBottom:2,lineHeight:1.3}}>{e.title}</div>
                <div style={{fontSize:11,color:"var(--ink-light)",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic"}}>{d.toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})}{!e.allDay&&e.time?`, ${e.time}`:""}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Home Reset */}
    <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:14,padding:"18px 20px",boxShadow:"var(--shadow)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:600,color:"var(--ink)"}}>Home Reset</div>
        <button onClick={()=>setPage("cleaning")} style={{background:"none",border:"none",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--gold-deep)",cursor:"pointer"}}>View all</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:10}}>
        {cleaningTodayArr.slice(0,4).map((task,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
            <div onClick={()=>toggleClean(TODAY_DAY,i)} style={{width:16,height:16,borderRadius:"50%",border:`1.5px solid ${task.done?"#7090a8":"rgba(26,20,16,.2)"}`,background:task.done?"#7090a8":"transparent",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
              {task.done&&<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
            </div>
            <span style={{fontSize:12,color:task.done?"var(--ink-light)":"var(--ink)",textDecoration:task.done?"line-through":"none",fontFamily:"'DM Sans',sans-serif",lineHeight:1.3}}>{task.text}</span>
          </div>
        ))}
        {cleaningTodayArr.length===0&&<div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink-light)"}}>Rest day ✦</div>}
        {cleaningTodayArr.length>4&&<div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--ink-light)"}}>+{cleaningTodayArr.length-4} more</div>}
      </div>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--ink-light)",marginBottom:5}}>{cleaningDoneToday} of {cleaningTotalToday} done</div>
      <div style={{height:4,background:"var(--parchment)",borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",width:cleaningTotalToday>0?`${Math.round((cleaningDoneToday/cleaningTotalToday)*100)}%`:"0%",background:"#7090a8",borderRadius:2,transition:"width .5s"}}/>
      </div>
    </div>

    {/* Recent Wins */}
    <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:14,padding:"18px 20px",boxShadow:"var(--shadow)"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c9a87c" strokeWidth="1.75"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:600,color:"var(--ink)"}}>Recent Wins</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {recentWins.length===0?(
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink-light)"}}>Your wins will appear here ✦</div>
        ):recentWins.map((w,i)=>(
          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8}}>
            <span style={{fontSize:14,flexShrink:0,marginTop:1}}>{w.icon}</span>
            <div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:"var(--ink)",marginBottom:1}}>{w.title}</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--ink-light)",lineHeight:1.4}}>{w.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

  </div>

  </div>{/* end dashboard rows */}

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
            setTodos(ts=>[...ts,{id:Date.now(),text:newModalText,done:false,tag:newModalTag,date:viewDate,priority:newModalPri,subtasks:[]}]);
            setNewModalText("");setNewModalPri("medium");setShowNewModal(false);
            gratChime();
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
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6}}>
                <button onClick={()=>setShowNewModal(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 20px",background:"var(--ink)",color:"#f4ede3",border:"none",borderRadius:20,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap"}}>+ New Task</button>
                {headerIcons}
              </div>
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
                  <div key={todo.id}>
                  <div className="tr2">
                    <div className={`tr2-ck ${todo.done?"done":""}`} onClick={()=>toggleTodo(todo.id)}>
                      {todo.done&&<span style={{fontSize:9,color:"#fff"}}>✓</span>}
                    </div>
                    <div className="tr2-body">
                      <div className={`tr2-txt ${todo.done?"done":""}`} onClick={()=>toggleTodo(todo.id)}>{todo.text}</div>
                      <span className="tr2-tg">{todo.tag}</span>
                    </div>
                    <div className="tr2-pri">{pflag(todo.priority)}</div>
                    <button className="tr2-sub-btn" title="Add subtask" onClick={e=>{e.stopPropagation();addSubtask(todo.id);}}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
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
                  {(todo.subtasks||[]).map(sub=>(
                    <div key={sub.id} className="subtask-row2">
                      <div className={`subtask-ck${sub.done?" done":""}`} onClick={()=>toggleSubtask(todo.id,sub.id)}>
                        {sub.done&&<span style={{fontSize:7,color:"#fff",lineHeight:1}}>✓</span>}
                      </div>
                      {editSubtask&&editSubtask.todoId===todo.id&&editSubtask.subId===sub.id
                        ?<input autoFocus className="subtask-inp" style={{flex:1}} value={editSubtask.text} onChange={e=>setEditSubtask(s=>({...s,text:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter")saveSubtask(todo.id,sub.id,editSubtask.text);if(e.key==="Escape"){if(!sub.text)delSubtask(todo.id,sub.id);setEditSubtask(null);}}} onBlur={()=>saveSubtask(todo.id,sub.id,editSubtask.text)}/>
                        :<span className={`subtask-txt${sub.done?" done":""}`} style={{flex:1,fontSize:12}} onClick={()=>!sub.done&&setEditSubtask({todoId:todo.id,subId:sub.id,text:sub.text})}>{sub.text||<em style={{opacity:.5}}>Type subtask…</em>}</span>
                      }
                      <button className="subtask-del" onClick={()=>delSubtask(todo.id,sub.id)}>×</button>
                    </div>
                  ))}
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

        {/* ── MY PROGRESS ── */}
        {page==="bilan"&&(()=>{
          const PERIODS=[["month","Month"],["3months","3 Months"],["6months","6 Months"],["year","Year"]];
          const periodDays=progressPeriod==="month"?30:progressPeriod==="3months"?90:progressPeriod==="6months"?180:365;
          const periodDates=Array.from({length:periodDays},(_,i)=>{const d=new Date(TODAY+"T12:00:00");d.setDate(d.getDate()-(periodDays-1-i));return _ld(d);});

          // Day score 0-1
          const getDayScore=(date)=>{
            const parts=[];
            const dt=todos.filter(t=>t.date===date);
            if(dt.length>0)parts.push(dt.filter(t=>t.done).length/dt.length);
            const wk=isoWeekKey(date);const wkD=weekDatesOf(wk);const dayIdx=wkD.indexOf(date);
            if(dayIdx>=0&&habits.length>0){
              const aw=wk===isoWeekKey(TODAY)?habits:(habitsArchive[wk]||null);
              if(aw&&aw.length>0)parts.push(aw.filter(h=>h.days[dayIdx]).length/aw.length);
            }
            parts.push(Math.min((gratitude[date]||[]).length/GRAT_TARGET,1));
            const projTasksDone=projects.reduce((s,p)=>s+p.tasks.filter(t=>t.done&&t.doneAt&&t.doneAt.startsWith(date)).length,0);
            const projTasksTotal=projects.reduce((s,p)=>s+p.tasks.length,0);
            if(projTasksTotal>0)parts.push(projTasksDone/projTasksTotal);
            return parts.length?parts.reduce((s,v)=>s+v,0)/parts.length:0;
          };

          // GitHub-style heatmap (responds to period filter)
          const hmNumWeeks=progressPeriod==="month"?5:progressPeriod==="3months"?14:progressPeriod==="6months"?26:53;
          const hmRowH=progressPeriod==="month"?30:progressPeriod==="3months"?22:progressPeriod==="6months"?16:12;
          const hmCellGap=progressPeriod==="month"?4:progressPeriod==="3months"?3:2;
          const hmTodayDow=(new Date(TODAY+"T12:00:00").getDay()+6)%7;
          const hmWeekCols=Array.from({length:hmNumWeeks},(_,wi)=>{
            const weekOffset=hmNumWeeks-1-wi;
            const ws=new Date(TODAY+"T12:00:00");ws.setDate(ws.getDate()-hmTodayDow-weekOffset*7);
            const prevWs=new Date(ws);prevWs.setDate(ws.getDate()-7);
            const monthLabel=(ws.getMonth()!==prevWs.getMonth()||wi===0)?ws.toLocaleDateString("en-GB",{month:"short"}):null;
            const days=Array.from({length:7},(_,di)=>{
              const d=new Date(ws);d.setDate(ws.getDate()+di);
              const date=_ld(d);
              return{date,score:date<=TODAY?getDayScore(date):null};
            });
            return{monthLabel,days};
          });

          // Period overview stats (driven by periodDates)
          const _todayWk=isoWeekKey(TODAY);
          const ovTodosDone=todos.filter(t=>periodDates.includes(t.date)&&t.done).length;
          const ovHabitsDone=(()=>{let total=0;periodDates.forEach(date=>{const wk=isoWeekKey(date);const wkD=weekDatesOf(wk);const idx=wkD.indexOf(date);if(idx<0)return;const aw=wk===_todayWk?habits:(habitsArchive[wk]||[]);total+=aw.filter(h=>h.days[idx]).length;});return total;})();
          const ovGoalsDone=allGoals.reduce((s,g)=>s+(g.milestones||[]).filter(m=>m.done&&periodDates.includes(m.doneDate||"")).length,0);
          const ovGratTotal=periodDates.reduce((s,d)=>s+(gratitude[d]||[]).length,0);
          const ovHomeReset=DAYS.reduce((s,dn)=>s+(cleaning[dn]||[]).filter(t=>t.done).length,0);
          const ovPeriodLabel=progressPeriod==="month"?"This Month":progressPeriod==="3months"?"Last 3 Months":progressPeriod==="6months"?"Last 6 Months":"This Year";
          // Momentum
          const momentumPts=periodDates.map((d,i)=>({date:d,score:Math.round(getDayScore(d)*100),i}));
          const mAvg=momentumPts.length?Math.round(momentumPts.reduce((s,p)=>s+p.score,0)/momentumPts.length):0;
          const priorDates=Array.from({length:periodDays},(_,i)=>{const d=new Date(TODAY+"T12:00:00");d.setDate(d.getDate()-(periodDays*2-1-i));return _ld(d);});
          const priorAvg=priorDates.length?Math.round(priorDates.map(d=>getDayScore(d)*100).reduce((s,v)=>s+v,0)/priorDates.length):0;
          const mChange=mAvg-priorAvg;
          const prevPeriodLabel=progressPeriod==="month"?"Apr":progressPeriod==="3months"?"prior 3mo":progressPeriod==="6months"?"prior 6mo":"last year";

          // SVG line graph
          const SVG_W=600,SVG_H=120,PAD_L=36,PAD_R=16,PAD_T=12,PAD_B=24;
          const plotW=SVG_W-PAD_L-PAD_R,plotH=SVG_H-PAD_T-PAD_B;
          const ptX=(i)=>PAD_L+(momentumPts.length>1?i/(momentumPts.length-1):0.5)*plotW;
          const ptY=(s)=>PAD_T+plotH-Math.max(0,Math.min(s,100))/100*plotH;
          const buildPath=(pts)=>{
            if(pts.length<2)return"";
            const co=pts.map((p,i)=>[ptX(i),ptY(p.score)]);
            let path=`M ${co[0][0]} ${co[0][1]}`;
            for(let i=1;i<co.length;i++){const cx=(co[i-1][0]+co[i][0])/2;path+=` C ${cx} ${co[i-1][1]}, ${cx} ${co[i][1]}, ${co[i][0]} ${co[i][1]}`;}
            return path;
          };
          const linePath=buildPath(momentumPts);
          const areaPath=momentumPts.length>=2?`${linePath} L ${ptX(momentumPts.length-1)} ${PAD_T+plotH} L ${PAD_L} ${PAD_T+plotH} Z`:"";
          const step=Math.max(Math.ceil(momentumPts.length/5),1);
          const xLabels=momentumPts.filter((_,i)=>i%step===0||i===momentumPts.length-1).map(p=>{const dt=new Date(p.date+"T12:00:00");return{x:ptX(p.i),label:`${dt.getDate()} ${dt.toLocaleDateString("en-GB",{month:"short"})}`};});
          const peakPt=momentumPts.length?momentumPts.reduce((b,p)=>p.score>b.score?p:b,momentumPts[0]):{score:0,i:0,date:TODAY};

          // Habit stability
          const todayWk=isoWeekKey(TODAY);
          const habStab=habits.map(h=>{
            let done=0,total=0;
            const byWk={};periodDates.forEach(d=>{const wk=isoWeekKey(d);if(!byWk[wk])byWk[wk]=[];byWk[wk].push(d);});
            Object.entries(byWk).forEach(([wk,wkDates])=>{
              const full=weekDatesOf(wk);
              const aw=wk===todayWk?h:(habitsArchive[wk]||[]).find(a=>a.id===h.id);
              if(!aw)return;
              wkDates.forEach(d=>{const idx=full.indexOf(d);if(idx>=0){total++;if(aw.days[idx])done++;}});
            });
            return{id:h.id,name:h.name,color:h.color,icon:h.icon,pct:total?Math.round(done/total*100):0};
          }).sort((a,b)=>b.pct-a.pct);

          // Goal milestone timeline
          const milestoneTimeline=allGoals.flatMap(g=>(g.milestones||[]).map(m=>({
            title:m.title,done:m.done,date:m.doneDate||m.deadline||"",
            goalTitle:g.title,color:g.color||"#A78BC7",
          }))).filter(m=>m.date).sort((a,b)=>a.date.localeCompare(b.date)).slice(-5);

          // Productivity rhythm
          const DOW_LABELS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
          const byDow=Array(7).fill(0);
          todos.filter(t=>t.done).forEach(t=>{const d=new Date(t.date+"T12:00:00");byDow[(d.getDay()+6)%7]++;});
          const maxDow=Math.max(...byDow,1);
          const peakDow=byDow.indexOf(Math.max(...byDow));

          // Time-of-day histogram (uses doneAt timestamps)
          const byHour=Array(24).fill(0);
          todos.filter(t=>t.done&&t.doneAt).forEach(t=>{byHour[new Date(t.doneAt).getHours()]++;});
          habits.forEach(hab=>(hab.dayTimes||[]).forEach(ts=>{if(ts)byHour[new Date(ts).getHours()]++;}));
          Object.values(habitsArchive).forEach(wkH=>wkH.forEach(hab=>(hab.dayTimes||[]).forEach(ts=>{if(ts)byHour[new Date(ts).getHours()]++;})));
          const maxHour=Math.max(...byHour,1);
          const peakHour=byHour.indexOf(Math.max(...byHour));
          const fmtHour=h=>h===0?"12am":h<12?h+"am":h===12?"12pm":(h-12)+"pm";
          const hasTimeData=byHour.some(v=>v>0);

          // Activity breakdown
          const ACT_KEYS=[["todos","#B89576"],["habits","#7F8F68"],["goals","#A78BC7"],["grat","#C98F8F"],["home","#7E9AAF"]];
          const getActBuckets=(()=>{
            if(actBarGran==="weekly"){
              return Array.from({length:5},(_,i)=>{
                const d=new Date(TODAY+"T12:00:00");d.setDate(d.getDate()-7*(4-i+actBarNav*5));
                const wk=isoWeekKey(_ld(d));const dates=weekDatesOf(wk);
                const d0=new Date(dates[0]+"T12:00:00"),d6=new Date(dates[6]+"T12:00:00");
                const label=`${d0.getDate()}–${d6.getDate()} ${d0.toLocaleDateString("en-GB",{month:"short"})}`;
                const todosV=todos.filter(t=>dates.includes(t.date)&&t.done).length;
                const aw=wk===todayWk?habits:(habitsArchive[wk]||[]);
                const habitsV=aw.reduce((s,h)=>s+h.days.filter(Boolean).length,0);
                const goalsV=allGoals.flatMap(g=>g.milestones||[]).filter(m=>m.done&&m.doneDate&&dates.includes(m.doneDate)).length;
                const gratV=dates.reduce((s,d2)=>s+(gratitude[d2]||[]).length,0);
                const homeV=wk===todayWk?DAYS.reduce((s,dn)=>s+(cleaning[dn]||[]).filter(t=>t.done).length,0):0;
                return{label,todos:todosV,habits:habitsV,goals:goalsV,grat:gratV,home:homeV};
              });
            }
            if(actBarGran==="monthly"){
              return Array.from({length:4},(_,i)=>{
                const d=new Date(TODAY+"T12:00:00");d.setMonth(d.getMonth()-(3-i+actBarNav*4));
                const yr=d.getFullYear(),mo=d.getMonth();
                const pfx=`${yr}-${String(mo+1).padStart(2,"0")}`;
                const label=d.toLocaleDateString("en-GB",{month:"short",year:"2-digit"});
                const todosV=todos.filter(t=>t.date.startsWith(pfx)&&t.done).length;
                const daysInMo=new Date(yr,mo+1,0).getDate();
                let habitsV=0;
                for(let di=1;di<=daysInMo;di++){const dd=`${pfx}-${String(di).padStart(2,"0")}`;const wk=isoWeekKey(dd);const wkD=weekDatesOf(wk);const idx=wkD.indexOf(dd);if(idx<0)continue;const aw2=wk===todayWk?habits:(habitsArchive[wk]||[]);habitsV+=aw2.filter(h=>h.days[idx]).length;}
                const goalsV=allGoals.flatMap(g=>g.milestones||[]).filter(m=>m.done&&(m.doneDate||"").startsWith(pfx)).length;
                const gratV=Object.entries(gratitude).filter(([d2])=>d2.startsWith(pfx)).reduce((s,[,arr])=>s+arr.length,0);
                return{label,todos:todosV,habits:habitsV,goals:goalsV,grat:gratV,home:0};
              });
            }
            // daily
            return Array.from({length:7},(_,i)=>{
              const d=new Date(TODAY+"T12:00:00");d.setDate(d.getDate()-(6-i+actBarNav*7));
              const date=_ld(d);
              const label=d.toLocaleDateString("en-GB",{weekday:"short"});
              const todosV=todos.filter(t=>t.date===date&&t.done).length;
              const wk=isoWeekKey(date);const wkD2=weekDatesOf(wk);const idx=wkD2.indexOf(date);
              const aw3=wk===todayWk?habits:(habitsArchive[wk]||[]);
              const habitsV=idx>=0?aw3.filter(h=>h.days[idx]).length:0;
              const goalsV=allGoals.flatMap(g=>g.milestones||[]).filter(m=>m.done&&m.doneDate===date).length;
              const gratV=(gratitude[date]||[]).length;
              const homeV=date===TODAY?DAYS.reduce((s,dn)=>s+(cleaning[dn]||[]).filter(t=>t.done).length,0):0;
              return{label,todos:todosV,habits:habitsV,goals:goalsV,grat:gratV,home:homeV};
            });
          })();
          const actMax=Math.max(...getActBuckets.map(b=>b.todos+b.habits+b.goals+b.grat+b.home),1);
          const actTotals={todos:getActBuckets.reduce((s,b)=>s+b.todos,0),habits:getActBuckets.reduce((s,b)=>s+b.habits,0),goals:getActBuckets.reduce((s,b)=>s+b.goals,0),grat:getActBuckets.reduce((s,b)=>s+b.grat,0),home:getActBuckets.reduce((s,b)=>s+b.home,0)};
          const actPeriodLabel=ovPeriodLabel;

          // Wins gallery
          const winsItems=(()=>{
            const items=[];
            habits.forEach(h=>{const s=streak(h.days);if(s>=7)items.push({icon:RW_ICONS.streak,title:`${s} Day Habit Streak`,desc:`${h.name} — ${s} consecutive days`,date:TODAY,bg:"#F3EAE1"});});
            allGoals.filter(g=>g.progress>=100||(g.milestones&&g.milestones.length>0&&g.milestones.every(m=>m.done))).slice(0,3).forEach(g=>items.push({icon:RW_ICONS.goal,title:"Goal Achieved",desc:g.title,date:g.deadline||TODAY,bg:"#F3EAE1"}));
            if(gratStreak>=7)items.push({icon:RW_ICONS.grat,title:"Gratitude Consistency",desc:`Logged gratitude ${gratStreak} times this month.`,date:TODAY,bg:"#F7EDEA"});
            if(bilCleanPct===100&&bilCleanTotal>0)items.push({icon:RW_ICONS.home,title:"All Reset Done",desc:"You completed all tasks in your home reset.",date:TODAY,bg:"#EEF3F8"});
            const topHab=habStab[0];
            if(topHab&&topHab.pct>=80)items.push({icon:RW_ICONS.habit,title:"Habit Champion",desc:`${topHab.name} at ${topHab.pct}% consistency.`,date:TODAY,bg:"#EEF3EA"});
            projects.forEach(p=>{const recentMil=p.milestones.filter(m=>m.done&&m.doneDate===TODAY)[0];if(recentMil)items.push({icon:RW_ICONS.goal,title:"Milestone Reached",desc:recentMil.title+" — "+p.title,date:TODAY,bg:"#F3EAE1"});});
            if(projects.some(p=>p.status==="completed"))items.push({icon:RW_ICONS.streak,title:"Project Complete!",desc:projects.find(p=>p.status==="completed").title+" ❆",date:TODAY,bg:"#F3EAE1"});
            return items.slice(0,5);
          })();

          return(
          <div style={{padding:"0 24px 64px"}}>

            {/* Header */}
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
              <div>
                <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:400,color:"var(--ink)"}}>My Progress</h1>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:13,color:"var(--ink-light)",marginTop:3}}>Track your consistency, celebrate your wins, and see how your life is improving over time.</div>
              </div>
              {headerIcons}
            </div>

            {/* Period tabs */}
            <div style={{display:"flex",gap:0,marginBottom:24}}>
              {PERIODS.map(([v,l],pi)=>(
                <button key={v} onClick={()=>setProgressPeriod(v)} style={{padding:"7px 18px",border:"1px solid var(--border)",borderRight:pi===PERIODS.length-1?"1px solid var(--border)":"none",borderRadius:pi===0?"20px 0 0 20px":pi===PERIODS.length-1?"0 20px 20px 0":"0",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,cursor:"pointer",background:progressPeriod===v?"var(--ink)":"#fff",color:progressPeriod===v?"#f4ede3":"var(--ink)",transition:"all .15s"}}>
                  {l}
                </button>
              ))}
            </div>

            {/* ── 1. Consistency Heatmap ── */}
            <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:14,padding:"22px 24px",boxShadow:"var(--shadow)",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="13" r="13" fill="#F3ECE4"/><rect x="7" y="7" width="3" height="3" rx="1" fill="#B89576"/><rect x="11.5" y="7" width="3" height="3" rx="1" fill="#D8C7B5"/><rect x="16" y="7" width="3" height="3" rx="1" fill="#E9DDD2"/><rect x="7" y="11.5" width="3" height="3" rx="1" fill="#D8C7B5"/><rect x="11.5" y="11.5" width="3" height="3" rx="1" fill="#B89576"/><rect x="16" y="11.5" width="3" height="3" rx="1" fill="#D8C7B5"/><rect x="7" y="16" width="3" height="3" rx="1" fill="#E9DDD2"/><rect x="11.5" y="16" width="3" height="3" rx="1" fill="#D8C7B5"/><rect x="16" y="16" width="3" height="3" rx="1" fill="#B89576"/></svg>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:600,color:"var(--ink)"}}>1. Consistency Heatmap</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 200px",gap:28,alignItems:"start"}}>
                {/* Left: heatmap — stretches to fill 1fr */}
                <div style={{minWidth:0}}>
                  {/* Month labels row */}
                  <div style={{display:"grid",gridTemplateColumns:"32px 1fr",gap:hmCellGap,marginBottom:4}}>
                    <div/>
                    <div style={{display:"grid",gridTemplateColumns:"repeat("+hmNumWeeks+",1fr)",gap:hmCellGap}}>
                      {hmWeekCols.map((wk,wi)=>(
                        <div key={wi} style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"var(--ink-light)",overflow:"hidden",whiteSpace:"nowrap"}}>{wk.monthLabel||""}</div>
                      ))}
                    </div>
                  </div>
                  {/* Day labels + cell grid */}
                  <div style={{display:"grid",gridTemplateColumns:"32px 1fr",gap:8}}>
                    {/* Day labels */}
                    <div style={{display:"grid",gridAutoRows:hmRowH,gap:hmCellGap}}>
                      {["Mon","","Wed","","Fri","","Sun"].map((d,i)=>(
                        <div key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"var(--ink-light)",display:"flex",alignItems:"center",lineHeight:1}}>{d}</div>
                      ))}
                    </div>
                    {/* Cells — row-major: di=day row, wi=week col */}
                    <div style={{display:"grid",gridTemplateColumns:"repeat("+hmNumWeeks+",1fr)",gridAutoRows:hmRowH,gap:hmCellGap}}>
                      {[0,1,2,3,4,5,6].flatMap(di=>hmWeekCols.map((wk,wi)=>{
                        const day=wk.days[di];
                        const sc=day.score;
                        const isFuture=sc===null;
                        const isToday=day.date===TODAY;
                        const alpha=(0.12+(sc||0)*0.88).toFixed(2);
                        const bg=isFuture?"#f4f0eb":sc<0.05?"#ede8e1":("rgba(184,149,118,"+alpha+")");
                        return(
                          <div key={di+"-"+wi}
                            title={day.date+(isFuture?"":(": "+Math.round((sc||0)*100)+"%"))}
                            style={{borderRadius:4,background:bg,outline:isToday?"2px solid #B89576":"none",outlineOffset:-1}}
                          />
                        );
                      }))}
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:14}}>
                    <span style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--ink-light)"}}>Less</span>
                    <div style={{display:"flex",gap:3}}>{[0.12,0.3,0.5,0.68,0.8,1].map((o,i)=><div key={i} style={{width:14,height:14,borderRadius:3,background:"rgba(184,149,118,"+o+")"}}/>)}</div>
                    <span style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--ink-light)"}}>More consistent</span>
                  </div>
                </div>
                {/* Right: overview */}
                <div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:13,fontWeight:600,color:"var(--ink)",marginBottom:14}}>Overview</div>
                  {[
                    {icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#F3ECE4"/><rect x="6" y="5.5" width="10" height="11" rx="1.5" stroke="#B89576" strokeWidth="1.4"/><path d="M8.5 10h5M8.5 12.5h3" stroke="#B89576" strokeWidth="1.4" strokeLinecap="round"/></svg>,label:"To-Do Tasks",val:ovTodosDone,sub:"completed"},
                    {icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#EEF3EA"/><path d="M6 11.5L9.5 15L16 8" stroke="#7F8F68" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,label:"Habits",val:ovHabitsDone,sub:"checked off"},
                    {icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#F2EDF7"/><circle cx="11" cy="11" r="4.5" stroke="#A78BC7" strokeWidth="1.4"/><circle cx="11" cy="11" r="1.6" fill="#A78BC7"/><path d="M13.5 8.5L16 6" stroke="#A78BC7" strokeWidth="1.5" strokeLinecap="round"/></svg>,label:"Goals",val:ovGoalsDone,sub:"milestones"},
                    {icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#F7EDEA"/><path d="M11 16.5c-.2 0-.4-.1-.5-.2C7.8 14.4 6 12.8 6 10.2 6 8.5 7.3 7 9 7c1 0 1.9.5 2 1.2.6-.7 1.5-1.2 2.5-1.2C15.2 7 16.5 8.5 16.5 10.2c0 2.6-1.8 4.2-4.5 6.1-.1.1-.5.2-1 .2z" fill="#C98F8F"/></svg>,label:"Gratitude",val:ovGratTotal,sub:"entries"},
                    {icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#EEF3F8"/><path d="M6 10.5L11 6.5L16 10.5V16H13V12.8H9V16H6V10.5Z" stroke="#7E9AAF" strokeWidth="1.4" strokeLinejoin="round"/></svg>,label:"Home Reset",val:ovHomeReset,sub:"tasks done"},
                  ].map(r=>(
                    <div key={r.label} style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                      {r.icon}
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11.5,color:"var(--ink)",flex:1}}>{r.label}</span>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:600,color:"var(--ink)",lineHeight:1}}>{r.val}</div>
                        <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:10,color:"var(--ink-light)"}}>{r.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* ── 2. Momentum Over Time ── */}
            <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:14,padding:"22px 24px",boxShadow:"var(--shadow)",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="13" r="13" fill="#F3ECE4"/><path d="M7 16C8.5 13.5 10 12 12 13C14 14 15 10 18.5 11.5" stroke="#B89576" strokeWidth="2" strokeLinecap="round"/></svg>
                  <span style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:600,color:"var(--ink)"}}>2. Momentum Over Time</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6,background:"#f8f5f1",borderRadius:8,padding:"6px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"var(--ink)"}}>
                  Overall Completion
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="#9a8a7a" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 150px",gap:16,alignItems:"center"}}>
                <div style={{overflow:"hidden"}}>
                  <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{width:"100%",height:"auto",display:"block"}}>
                    <defs>
                      <linearGradient id="moGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#B89576" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#B89576" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    {[0,25,50,75,100].map(v=>(
                      <g key={v}>
                        <line x1={PAD_L} y1={ptY(v)} x2={SVG_W-PAD_R} y2={ptY(v)} stroke="#f0ebe4" strokeWidth="1"/>
                        <text x={PAD_L-4} y={ptY(v)+4} textAnchor="end" fontSize="9" fill="#b5a99a" fontFamily="DM Sans">{v}%</text>
                      </g>
                    ))}
                    {areaPath&&<path d={areaPath} fill="url(#moGrad)"/>}
                    {linePath&&<path d={linePath} fill="none" stroke="#B89576" strokeWidth="2" strokeLinecap="round"/>}
                    {peakPt&&peakPt.score>0&&(
                      <g>
                        <circle cx={ptX(peakPt.i)} cy={ptY(peakPt.score)} r="4" fill="#fff" stroke="#B89576" strokeWidth="2"/>
                        <rect x={Math.min(ptX(peakPt.i)-22,SVG_W-PAD_R-44)} y={ptY(peakPt.score)-28} width="44" height="22" rx="4" fill="#fff" style={{filter:"drop-shadow(0 1px 4px rgba(0,0,0,.1))"}}/>
                        <text x={Math.min(ptX(peakPt.i),SVG_W-PAD_R-22)} y={ptY(peakPt.score)-16} textAnchor="middle" fontSize="8.5" fill="#9a7a5a" fontFamily="DM Sans">{peakPt.date.slice(5)}</text>
                        <text x={Math.min(ptX(peakPt.i),SVG_W-PAD_R-22)} y={ptY(peakPt.score)-6} textAnchor="middle" fontSize="9" fill="#B89576" fontFamily="DM Sans" fontWeight="600">{peakPt.score}%</text>
                      </g>
                    )}
                    {xLabels.map((l,i)=>(
                      <text key={i} x={Math.min(Math.max(l.x,PAD_L+20),SVG_W-PAD_R-20)} y={SVG_H-4} textAnchor="middle" fontSize="9" fill="#b5a99a" fontFamily="DM Sans">{l.label}</text>
                    ))}
                  </svg>
                </div>
                <div style={{background:"#f8f5f1",borderRadius:10,padding:"16px 14px",textAlign:"center"}}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--ink-light)",marginBottom:4}}>Average Completion</div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:38,fontWeight:600,color:"var(--ink)",lineHeight:1}}>{mAvg}%</div>
                  <div style={{fontSize:11,fontFamily:"'DM Sans',sans-serif",marginTop:8,color:mChange>=0?"#7F8F68":"#C98F8F"}}>
                    {mChange>=0?"↑":"↓"} {Math.abs(mChange)}% from {prevPeriodLabel}
                  </div>
                </div>
              </div>
            </div>

            {/* ── 3 + 4: Habit Stability | Goal Milestone Timeline ── */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>

              {/* 3. Habit Stability */}
              <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:14,padding:"22px 24px",boxShadow:"var(--shadow)"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="13" r="13" fill="#EEF3EA"/><rect x="7" y="9" width="12" height="2.5" rx="1.2" fill="#7F8F68"/><rect x="7" y="13" width="9" height="2.5" rx="1.2" fill="#A8B29A"/><rect x="7" y="17" width="6" height="2.5" rx="1.2" fill="#D5DEC9"/></svg>
                  <span style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:600,color:"var(--ink)"}}>3. Habit Stability</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"var(--ink-light)",marginBottom:10,paddingBottom:6,borderBottom:"1px solid var(--border)"}}>
                  <span>Habit</span><span>Consistency</span>
                </div>
                {habStab.length===0?<div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink-light)"}}>No habits tracked yet ✦</div>:
                  habStab.map(h=>(
                    <div key={h.id} style={{marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:3}}>
                        <div style={{display:"flex",alignItems:"center",gap:5}}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 12C5.3 10.8 3 9.1 3 6.8 3 5.4 4 4.5 5.3 4.5 6.1 4.5 6.8 4.9 7 5.5c.2-.6.9-1 1.7-1C10 4.5 11 5.4 11 6.8 11 9.1 8.7 10.8 7 12z" fill={h.color} opacity="0.7"/></svg>
                          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"var(--ink)"}}>{h.name}</span>
                        </div>
                        <span style={{fontFamily:"'Playfair Display',serif",fontSize:13,fontWeight:600,color:"var(--ink)"}}>{h.pct}%</span>
                      </div>
                      <div style={{height:6,background:"#f0ebe4",borderRadius:6,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${h.pct}%`,background:h.color,borderRadius:6}}/>
                      </div>
                    </div>
                  ))
                }
                {habStab.length>0&&<button onClick={()=>setPage("habits")} style={{marginTop:6,background:"none",border:"none",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--gold-deep)",cursor:"pointer",display:"flex",alignItems:"center",gap:4,padding:0}}>View all habits ›</button>}
              </div>

              {/* 4. Goal Milestone Timeline */}
              <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:14,padding:"22px 24px",boxShadow:"var(--shadow)"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                  <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="13" r="13" fill="#F2EDF7"/><circle cx="10" cy="9" r="2" fill="#A78BC7"/><circle cx="16" cy="13" r="2" fill="#A78BC7"/><circle cx="11" cy="18" r="2" fill="#A78BC7"/><path d="M10 9L16 13L11 18" stroke="#A78BC7" strokeWidth="1.6" strokeLinecap="round"/></svg>
                  <span style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:600,color:"var(--ink)"}}>4. Goal Milestone Timeline</span>
                </div>
                {milestoneTimeline.length===0?<div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink-light)"}}>No milestones yet — add goals to see your timeline ✦</div>:
                  milestoneTimeline.slice().reverse().map((m,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:12}}>
                      <div style={{width:22,height:22,borderRadius:"50%",background:m.done?"#7F8F68":"#A78BC7",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                        {m.done
                          ?<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          :<div style={{width:8,height:8,borderRadius:"50%",background:"rgba(255,255,255,.5)"}}/>
                        }
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,color:"var(--ink)"}}>{m.title||m.goalTitle}</div>
                        <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--ink-light)",marginTop:1}}>
                          {m.date?new Date(m.date+"T00:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):""}
                        </div>
                      </div>
                    </div>
                  ))
                }
                {milestoneTimeline.length>0&&<button onClick={()=>setPage("goals")} style={{background:"none",border:"none",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--gold-deep)",cursor:"pointer",display:"flex",alignItems:"center",gap:4,padding:0,marginTop:4}}>View all goals ›</button>}
              </div>
            </div>

            {/* ── 5 + 7: Productivity Rhythm | Activity Breakdown ── */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>

              {/* 5. Productivity Rhythm */}
              <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:14,padding:"22px 24px",boxShadow:"var(--shadow)"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                  <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="13" r="13" fill="#F8EFE7"/><rect x="8" y="15" width="2.5" height="4" rx="1.2" fill="#D8B08C"/><rect x="12" y="11" width="2.5" height="8" rx="1.2" fill="#B89576"/><rect x="16" y="8" width="2.5" height="11" rx="1.2" fill="#9C6F4D"/></svg>
                  <span style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:600,color:"var(--ink)"}}>5. Productivity Rhythm</span>
                </div>
                <div style={{display:"flex",gap:0,marginBottom:16,background:"#f8f5f1",borderRadius:20,padding:3,width:"fit-content"}}>
                  {[["time","Time of Day"],["weekday","Day of Week"]].map(([v,l])=>(
                    <button key={v} onClick={()=>setRhythmTab(v)} style={{padding:"5px 13px",borderRadius:16,border:"none",fontFamily:"'DM Sans',sans-serif",fontSize:11,cursor:"pointer",background:rhythmTab===v?"#fff":"transparent",color:rhythmTab===v?"var(--ink)":"var(--ink-light)",fontWeight:rhythmTab===v?500:400}}>
                      {l}
                    </button>
                  ))}
                </div>
                {rhythmTab==="weekday"?(
                  <div>
                    <div style={{display:"flex",alignItems:"flex-end",gap:5,height:80,marginBottom:6}}>
                      {DOW_LABELS.map((d,i)=>(
                        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
                          <div style={{width:"100%",borderRadius:"3px 3px 0 0",background:i===peakDow?"#B89576":byDow[i]>0?"#D8C7B5":"#f0ebe4",height:`${Math.max(byDow[i]/maxDow*68,3)}px`,minHeight:3}}/>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:5,marginBottom:10}}>
                      {DOW_LABELS.map((d,i)=><div key={i} style={{flex:1,textAlign:"center",fontFamily:"'DM Sans',sans-serif",fontSize:9,color:"var(--ink-light)"}}>{d}</div>)}
                    </div>
                    <div style={{padding:"9px 12px",background:"#faf7f3",borderRadius:8,display:"flex",alignItems:"center",gap:8}}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="#F3ECE4"/><path d="M5.5 8L7.5 10L11 5.5" stroke="#B89576" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink-light)"}}>
                        {todos.filter(t=>t.done).length>0?`Your most productive day is ${DOW_LABELS[peakDow]}.`:"Complete tasks to see your rhythm."}
                      </span>
                    </div>
                  </div>
                ):(
                  hasTimeData?(
                    <div>
                      <div style={{display:"flex",alignItems:"flex-end",gap:2,height:80,marginBottom:4}}>
                        {byHour.map((v,h)=>(
                          <div key={h} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
                            <div style={{width:"100%",borderRadius:"2px 2px 0 0",background:h===peakHour?"#B89576":v>0?"#D8C7B5":"#f0ebe4",height:`${Math.max(v/maxHour*70,v>0?3:1)}px`,minHeight:1,transition:"height .2s"}}/>
                          </div>
                        ))}
                      </div>
                      <div style={{display:"flex",gap:2,marginBottom:10}}>
                        {byHour.map((_,h)=>(
                          <div key={h} style={{flex:1,textAlign:"center",fontFamily:"'DM Sans',sans-serif",fontSize:8,color:"var(--ink-light)"}}>
                            {h===0||h===6||h===12||h===18||h===23?fmtHour(h):""}
                          </div>
                        ))}
                      </div>
                      <div style={{padding:"9px 12px",background:"#faf7f3",borderRadius:8,display:"flex",alignItems:"center",gap:8}}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="#F3ECE4"/><path d="M8 4v4l2.5 1.5" stroke="#B89576" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        <span style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink-light)"}}>
                          You're most productive around {fmtHour(peakHour)}.
                        </span>
                      </div>
                    </div>
                  ):(
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"28px 0",gap:8}}>
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke="#D8C7B5" strokeWidth="2"/><path d="M16 9v7l4 2" stroke="#D8C7B5" strokeWidth="2" strokeLinecap="round"/></svg>
                      <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink-light)",textAlign:"center"}}>Time-of-day tracking begins<br/>once tasks are marked complete ✦</div>
                    </div>
                  )
                )}
              </div>

              {/* 7. Activity Breakdown */}
              <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:14,padding:"22px 24px",boxShadow:"var(--shadow)"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="13" r="13" fill="#EEF3F8"/><rect x="7" y="13" width="2.5" height="6" rx="1.2" fill="#B89576"/><rect x="10.5" y="10" width="2.5" height="9" rx="1.2" fill="#7F8F68"/><rect x="14" y="8" width="2.5" height="11" rx="1.2" fill="#A78BC7"/><rect x="17.5" y="11" width="2.5" height="8" rx="1.2" fill="#7E9AAF"/></svg>
                    <span style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:600,color:"var(--ink)"}}>7. Activity Breakdown</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <select value={actBarGran} onChange={e=>{setActBarGran(e.target.value);setActBarNav(0);}} style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"var(--ink)",border:"1px solid var(--border)",borderRadius:8,padding:"4px 8px",background:"#fff",cursor:"pointer"}}>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    <button onClick={()=>setActBarNav(n=>n+1)} style={{background:"none",border:"none",cursor:"pointer",fontSize:15,color:"var(--ink-light)",padding:"0 3px",lineHeight:1}}>‹</button>
                    <button onClick={()=>setActBarNav(n=>Math.max(n-1,0))} disabled={actBarNav===0} style={{background:"none",border:"none",cursor:"pointer",fontSize:15,color:actBarNav===0?"var(--border)":"var(--ink-light)",padding:"0 3px",lineHeight:1}}>›</button>
                  </div>
                </div>
                {/* Stacked bars */}
                <div style={{display:"flex",alignItems:"flex-end",gap:4,height:80,marginBottom:5}}>
                  {getActBuckets.map((b,i)=>{
                    const total=b.todos+b.habits+b.goals+b.grat+b.home;
                    const h=total>0?Math.max(total/actMax*72,4):2;
                    return(
                      <div key={i} title={`Todos:${b.todos} Habits:${b.habits} Goals:${b.goals} Grat:${b.grat} Home:${b.home}`} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"stretch"}}>
                        <div style={{borderRadius:"3px 3px 0 0",overflow:"hidden",display:"flex",flexDirection:"column-reverse",height:`${h}px`}}>
                          {ACT_KEYS.map(([k,c])=>b[k]>0&&(
                            <div key={k} style={{background:c,height:`${b[k]/Math.max(total,1)*h}px`,minHeight:1}}/>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{display:"flex",gap:4,marginBottom:10}}>
                  {getActBuckets.map((b,i)=>(
                    <div key={i} style={{flex:1,textAlign:"center",fontFamily:"'DM Sans',sans-serif",fontSize:8.5,color:"var(--ink-light)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.label}</div>
                  ))}
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"3px 10px",marginBottom:10}}>
                  {[["To-Do","#B89576"],["Habits","#7F8F68"],["Goals","#A78BC7"],["Gratitude","#C98F8F"],["Home Reset","#7E9AAF"]].map(([l,c])=>(
                    <div key={l} style={{display:"flex",alignItems:"center",gap:4}}>
                      <div style={{width:8,height:8,borderRadius:2,background:c}}/>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"var(--ink-light)"}}>{l}</span>
                    </div>
                  ))}
                </div>
                <div style={{borderTop:"1px solid var(--border)",paddingTop:10,display:"flex"}}>
                  {[["To-Do Tasks",actTotals.todos],["Habits",actTotals.habits],["Goals",actTotals.goals],["Gratitude",actTotals.grat],["Home Reset",actTotals.home]].map(([l,v])=>(
                    <div key={l} style={{flex:1,textAlign:"center"}}>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:600,color:"var(--ink)"}}>{v}</div>
                      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:"var(--ink-light)",marginTop:1}}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── 6. Wins Gallery ── */}
            <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:14,padding:"22px 24px",boxShadow:"var(--shadow)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="13" r="13" fill="#F7EDEA"/><path d="M13 6L14.5 10.5L19 11L15.5 13.8L16.7 18L13 15.6L9.3 18L10.5 13.8L7 11L11.5 10.5L13 6Z" fill="#C98F8F"/></svg>
                  <span style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:600,color:"var(--ink)"}}>6. Wins Gallery</span>
                </div>
                <button onClick={()=>setPage("goals")} style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--gold-deep)",background:"none",border:"none",cursor:"pointer"}}>View all</button>
              </div>
              {winsItems.length===0?(
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--ink-light)"}}>Your wins will appear here as you build your streaks and hit your goals ✦</div>
              ):(
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:12}}>
                  {winsItems.map((w,i)=>(
                    <div key={i} style={{background:w.bg||"#F3EAE1",borderRadius:12,padding:"16px 14px"}}>
                      <div style={{marginBottom:10}}>{w.icon}</div>
                      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:"var(--ink)",marginBottom:4}}>{w.title}</div>
                      <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:11,color:"var(--ink-light)",lineHeight:1.45,marginBottom:6}}>{w.desc}</div>
                      {w.date&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"var(--ink-light)"}}>{(()=>{try{return new Date(w.date+"T00:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});}catch(e){return w.date;}})()}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
          );
        })()}


        {/* ── GOALS ── */}
        {page==="goals"&&(()=>{try{
          const mGoalsF=mGoals.filter(g=>{
            if(goalCat&&g.category!==goalCat)return false;
            const pct=goalPct(g);
            const allDone=g.milestones&&g.milestones.length>0&&g.milestones.every(m=>m.done);
            const anyDone=g.milestones&&g.milestones.some(m=>m.done);
            const anyInProgress=g.milestones&&g.milestones.some(m=>!m.done&&m.status==="inprogress");
            if(goalFilter==="completed")return allDone||(pct===100);
            if(goalFilter==="inprogress")return !allDone&&(anyDone||anyInProgress);
            if(goalFilter==="notstarted")return !anyDone&&!anyInProgress&&pct===0;
            return true;
          });
          const mCompletedCount=mGoals.filter(g=>g.milestones&&g.milestones.length>0&&g.milestones.every(m=>m.done)).length;
          const mAvgPct=mGoals.length?Math.round(mGoals.reduce((s,g)=>s+goalPct(g),0)/mGoals.length):0;
          const goalQuote=GOAL_QUOTES[NOW.getDate()%GOAL_QUOTES.length];
          const fmtDate=d=>{if(!d)return"";const dt=new Date(d+"T00:00:00");if(isNaN(dt.getTime()))return"";return dt.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});};
          const recentGoalWins=mGoals.flatMap(g=>(g.milestones||[]).filter(m=>m.done&&m.doneDate).map(m=>({...m,goalTitle:g.title,goalIcon:g.icon,cat:g.category}))).sort((a,b)=>(b.doneDate||"").localeCompare(a.doneDate||"")).slice(0,4);
          const CIRC=2*Math.PI*38;
          const donutDash=`${(mAvgPct/100)*CIRC} ${CIRC}`;
          return(<div style={{padding:"0 24px 64px"}}>
          {/* Add/Edit Goal Modal */}
          {showGoalModal&&(
            <div className="goal-modal-ov" onClick={()=>setShowGoalModal(false)}>
              <div className="goal-modal-box" onClick={e=>e.stopPropagation()}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"var(--ink)",marginBottom:4}}>{goalModalMode==="add"?"New Goal":"Edit Goal"}</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--gold-deep)",marginBottom:22}}>{vmLabel}</div>
                <label className="mlbl">Goal Title</label>
                <input className="minp" style={{marginBottom:14}} placeholder="What do you want to achieve?" value={gDraft.title} onChange={e=>setGDraft(d=>({...d,title:e.target.value}))} autoFocus/>
                <label className="mlbl">Description</label>
                <input className="minp" style={{marginBottom:14}} placeholder="A short description of this goal…" value={gDraft.description} onChange={e=>setGDraft(d=>({...d,description:e.target.value}))}/>
                <label className="mlbl">Category</label>
                <select className="msel" style={{marginBottom:14}} value={gDraft.category} onChange={e=>setGDraft(d=>({...d,category:e.target.value}))}>
                  {Object.keys(GOAL_CATS).map(c=><option key={c}>{c}</option>)}
                </select>
                <label className="mlbl">Icon</label>
                <div className="goal-icon-grid">
                  {GOAL_ICON_LIST.map(ic=>(
                    <div key={ic.id} className={`goal-icon-opt${gDraft.icon===ic.id?" selected":""}`} title={ic.label} onClick={()=>setGDraft(d=>({...d,icon:ic.id}))}>
                      {ic.el}
                    </div>
                  ))}
                </div>
                <label className="mlbl">Target Date</label>
                <input className="minp" style={{marginBottom:18}} type="date" value={gDraft.targetDate} onChange={e=>setGDraft(d=>({...d,targetDate:e.target.value}))}/>
                <label className="mlbl">Milestones <span style={{color:"var(--ink-light)",fontWeight:400}}>(up to 5)</span></label>
                <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:6,marginBottom:4}}>
                  {gDraft.milestones.map((m,i)=>(
                    <div key={i} className="ms-input-row">
                      <span className="ms-input-num">{i+1}</span>
                      <input className="minp" style={{flex:1,marginBottom:0}} placeholder={`Milestone ${i+1}…`} value={m} onChange={e=>gMsChange(i,e.target.value)}/>
                      {gDraft.milestones.length>1&&<button onClick={()=>gMsDel(i)} style={{border:"none",background:"none",cursor:"pointer",color:"var(--ink-light)",fontSize:16,padding:"0 4px",lineHeight:1}}>×</button>}
                    </div>
                  ))}
                </div>
                {gDraft.milestones.length<5&&<button onClick={gMsAdd} style={{border:"1px dashed var(--border)",background:"none",borderRadius:8,padding:"7px 14px",fontSize:12,color:"var(--ink-light)",cursor:"pointer",width:"100%",marginBottom:20}}>+ Add milestone</button>}
                <div style={{display:"flex",gap:8,marginTop:8}}>
                  <button style={{flex:1,padding:"10px",border:"1px solid var(--border)",borderRadius:10,background:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer",color:"var(--ink)"}} onClick={()=>setShowGoalModal(false)}>Cancel</button>
                  <button style={{flex:2,padding:"10px",border:"none",borderRadius:10,background:"var(--ink)",color:"#f4ede3",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,cursor:"pointer"}} onClick={saveGoal}>Save Goal ✦</button>
                </div>
              </div>
            </div>
          )}
          {/* Page header */}
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24,padding:"0"}}>
            <div>
              <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:400,color:"var(--ink)"}}>Monthly Goals</h1>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:13,color:"var(--ink-light)",marginTop:3}}>Focus on what matters this month and make it happen.</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{display:"flex",alignItems:"center",gap:4,border:"1px solid var(--border)",borderRadius:10,padding:"5px 10px",background:"#fff",fontSize:13}}>
                <button onClick={pmG} style={{border:"none",background:"none",cursor:"pointer",color:"var(--ink-light)",fontSize:16,padding:"0 4px",lineHeight:1}}>‹</button>
                <span style={{minWidth:90,textAlign:"center",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"var(--ink)"}}>{vmLabel}</span>
                <button onClick={nmG} disabled={vMonth>=MK} style={{border:"none",background:"none",cursor:"pointer",color:vMonth>=MK?"var(--border)":"var(--ink-light)",fontSize:16,padding:"0 4px",lineHeight:1}}>›</button>
              </div>
              <button onClick={openAddG} style={{background:"var(--ink)",color:"#f4ede3",border:"none",borderRadius:10,padding:"8px 18px",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>+ New Goal</button>
            </div>
          </div>
          {/* Stats row */}
          <div className="goal-stats-row">
            {/* Overall Progress — donut */}
            <div className="goal-stat-card">
              <div className="goal-stat-label">Overall Progress</div>
              <div style={{display:"flex",alignItems:"center",gap:16}}>
                <svg width="88" height="88" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(26,20,16,.07)" strokeWidth="8"/>
                  <circle cx="50" cy="50" r="38" fill="none" stroke="var(--sage)" strokeWidth="8" strokeLinecap="round" strokeDasharray={donutDash} strokeDashoffset={-CIRC/4} style={{transition:"stroke-dasharray .5s"}}/>
                  <text x="50" y="55" textAnchor="middle" fontFamily="'Playfair Display',serif" fontSize="18" fill="var(--ink)">{mAvgPct}%</text>
                </svg>
                <div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,color:"var(--ink)",lineHeight:1}}>{mAvgPct}%</div>
                  <div style={{fontSize:11,color:"var(--ink-light)",marginTop:4}}>{mGoals.length} goals this month</div>
                </div>
              </div>
            </div>
            {/* Goals Completed */}
            <div className="goal-stat-card">
              <div className="goal-stat-label">Goals Completed</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:44,color:"var(--ink)",lineHeight:1}}>{mCompletedCount}</div>
              <div style={{fontSize:12,color:"var(--ink-light)",marginTop:4}}>/{mGoals.length} total goals</div>
              <div style={{fontSize:11,color:"var(--sage)",marginTop:8}}>{mCompletedCount>0?"Keep going, you're doing great!":"Start tracking your first milestone ✦"}</div>
              <svg width="120" height="44" viewBox="0 0 120 44" fill="none" style={{marginTop:12}}>
                <path d="M6 34 C18 30, 24 31, 34 27 C44 22, 52 25, 62 21 C74 16, 82 19, 92 12 C102 6, 110 9, 116 4" stroke="#B89576" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="6" cy="34" r="3.5" fill="#B89576"/>
                <circle cx="34" cy="27" r="3.5" fill="#B89576"/>
                <circle cx="62" cy="21" r="3.5" fill="#B89576"/>
                <circle cx="92" cy="12" r="3.5" fill="#B89576"/>
                <circle cx="116" cy="4" r="3.5" fill="#B89576"/>
              </svg>
            </div>
            {/* Focus This Month */}
            <div className="goal-stat-card">
              <div className="goal-stat-label">Focus This Month</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {mGoals.slice(0,3).map(g=>{const cm=catMeta(g.category);return(
                  <div key={g.id} style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:28,height:28,borderRadius:"50%",overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:cm.bg}}>
                      <div style={{transform:"scale(0.7)",transformOrigin:"center"}}>{goalIconEl(g.icon)}</div>
                    </div>
                    <span style={{fontSize:13,color:"var(--ink)",textAlign:"left"}}>{g.title}</span>
                  </div>
                );})}
                {mGoals.length===0&&<div style={{fontSize:12,color:"var(--ink-light)",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic"}}>No goals set yet</div>}
              </div>
            </div>
          </div>
          {/* Filter + view controls */}
          <div className="goal-filter-row">
            <div className="goal-tabs">
              {[["all","All Goals"],["inprogress","In Progress"],["completed","Completed"],["notstarted","Not Started"]].map(([v,l])=>(
                <button key={v} className={`goal-tab${goalFilter===v?" active":""}`} onClick={()=>setGoalFilter(v)}>{l}</button>
              ))}
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <select value={goalCat} onChange={e=>setGoalCat(e.target.value)} style={{border:"1px solid var(--border)",borderRadius:8,padding:"5px 10px",fontSize:12,fontFamily:"'DM Sans',sans-serif",color:"var(--ink)",background:"#fff",cursor:"pointer"}}>
                <option value="">All Categories</option>
                {Object.keys(GOAL_CATS).map(c=><option key={c}>{c}</option>)}
              </select>
              <div style={{display:"flex",border:"1px solid var(--border)",borderRadius:8,overflow:"hidden"}}>
                {[["list","☰"],["grid","⊞"]].map(([v,ic])=>(
                  <button key={v} onClick={()=>setGoalView(v)} style={{border:"none",background:goalView===v?"var(--ink)":"#fff",color:goalView===v?"#f4ede3":"var(--ink-light)",padding:"6px 12px",cursor:"pointer",fontSize:14,transition:"all .15s"}}>{ic}</button>
                ))}
              </div>
            </div>
          </div>
          {/* Goal cards */}
          {goalView==="list"&&mGoalsF.map(goal=>{
            const pct=goalPct(goal);
            const cm=catMeta(goal.category);
            return(
            <div key={goal.id} className="goal-card" style={{position:"relative"}}>
              <div className="goal-card-left">
                <div className="goal-card-top">
                  <div className="goal-icon-wrap" style={{background:cm.bg}}>{goalIconEl(goal.icon)}</div>
                  <span className="goal-cat-tag" style={{color:cm.color,background:cm.bg,marginBottom:12}}>{goal.category}</span>
                </div>
                <div className="goal-title-txt">{goal.title}</div>
                <div className="goal-desc-txt">{goal.description||""}</div>
                <div className="goal-prog-track"><div className="goal-prog-fill" style={{width:`${pct}%`,background:cm.color}}/></div>
                <div className="goal-prog-row">
                  <span className="goal-prog-pct">{pct}%</span>
                  <span style={{fontSize:11,color:"var(--ink-light)"}}>{goal.milestones?`${goal.milestones.filter(m=>m.done).length}/${goal.milestones.length} milestones`:""}</span>
                </div>
                {goal.targetDate&&<div className="goal-target"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Target date: {fmtDate(goal.targetDate)}</div>}
              </div>
              <div className="goal-card-right">
                <div className="goal-ms-hd">
                  <span className="goal-ms-lbl">Milestones</span>
                </div>
                {goal.milestones&&goal.milestones.map((m,i)=>{
                  const safeStatus=["notstarted","inprogress","completed"].includes(m.status)?m.status:null;const status=m.done?"completed":(safeStatus&&safeStatus!=="completed"?safeStatus:"notstarted");
                  const statusLabel=status==="completed"?"Completed":status==="inprogress"?"In progress":"Not started";
                  return(
                  <div key={m.id||i} className="ms2-row">
                    <div className={`ms2-ck${m.done?" done":""}`} style={m.done?{background:cm.color}:{}} onClick={()=>toggleMs(goal.id,i)}>
                      {m.done&&<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <span className={`ms2-txt${m.done?" done":""}`}>{m.text}</span>
                    <div className="ms-status-wrap">
                      <span className={`ms-badge ${status}`} onClick={e=>{e.stopPropagation();setMsDropOpen(msDropOpen&&msDropOpen.gid===goal.id&&msDropOpen.mi===i?null:{gid:goal.id,mi:i});}}>{statusLabel} ▾</span>
                      {msDropOpen&&msDropOpen.gid===goal.id&&msDropOpen.mi===i&&(
                        <div className="ms-status-drop">
                          {[["notstarted","Not started"],["inprogress","In progress"],["completed","Completed"]].map(([v,l])=>(
                            <div key={v} className="ms-status-opt" onClick={()=>updateMsStatus(goal.id,i,v)}>{l}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="ms2-date">{m.done&&m.doneDate?fmtDate(m.doneDate):""}</span>
                  </div>
                );})}
                {(!goal.milestones||goal.milestones.length===0)&&<div style={{fontSize:12,color:"var(--ink-light)",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",padding:"8px 0"}}>No milestones added yet</div>}
              </div>
              {/* Menu */}
              <div style={{position:"absolute",top:14,right:14}}>
                <button className="goal-menu-btn" onClick={e=>{e.stopPropagation();setGoalMenuOpen(goalMenuOpen===goal.id?null:goal.id);}}>⋯</button>
                {goalMenuOpen===goal.id&&(
                  <div className="goal-dropdown" onClick={e=>e.stopPropagation()}>
                    <div className="goal-dd-item" onClick={()=>{openEditG(goal);setGoalMenuOpen(null);}}>✎ &nbsp;Edit goal</div>
                    <div className="goal-dd-item del" onClick={()=>delGoal(goal.id)}>✕ &nbsp;Delete</div>
                  </div>
                )}
              </div>
            </div>
          );})}
          {goalView==="grid"&&<div className="gg">{mGoalsF.map(goal=>{
            const pct=goalPct(goal);const cm=catMeta(goal.category);
            return(<div key={goal.id} className="gc" style={{position:"relative"}}>
              <div className="gac" style={{background:cm.color}}/>
              <div className="gct">
                <span className="goal-cat-tag" style={{color:cm.color,background:cm.bg}}>{goal.category}</span>
                <div className="gca"><button className="sb2" onClick={()=>openEditG(goal)}>✏️</button><button className="sb2 d" onClick={()=>delGoal(goal.id)}>×</button></div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{width:28,height:28,borderRadius:"50%",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",background:cm.bg,flexShrink:0}}><div style={{transform:"scale(0.7)",transformOrigin:"center"}}>{goalIconEl(goal.icon)}</div></div>
                <div className="gtit" style={{marginBottom:0}}>{goal.title}</div>
              </div>
              <div className="pb2"><div className="pf" style={{width:`${pct}%`,background:cm.color}}/></div>
              <div className="pr"><span className="pp">{pct}% complete</span>{goal.targetDate&&!isNaN(new Date(goal.targetDate+"T00:00:00"))&&<span className="gd">→ {new Date(goal.targetDate+"T00:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</span>}</div>
              <div className="ms">{(goal.milestones||[]).map((m,i)=><div key={m.id||i} className={`mi${m.done?" dm":""}`} onClick={()=>toggleMs(goal.id,i)}><div className="md2" style={m.done?{background:cm.color}:{}}/><span>{m.text}</span></div>)}</div>
            </div>);
          })}</div>}
          {mGoalsF.length===0&&(
            <div className="goal-empty">
              <div style={{fontSize:32,marginBottom:8}}>✦</div>
              <div>{goalFilter==="all"?`No goals for ${vmLabel} yet — click + New Goal to start.`:`No ${goalFilter==="completed"?"completed":goalFilter==="inprogress"?"in-progress":"not started"} goals`}</div>
            </div>
          )}
          {/* Recent Wins + Tips */}
          <div className="recent-wins-grid">
            <div className="rw-card">
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:"var(--ink)",marginBottom:16,display:"flex",alignItems:"center",gap:6}}>Recent Wins <span style={{color:"var(--gold)"}}>✦</span></div>
              {recentGoalWins.length===0&&<div style={{fontSize:12,color:"var(--ink-light)",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic"}}>Complete your first milestone to see it here ✦</div>}
              {recentGoalWins.map((w,i)=>{const cm=catMeta(w.cat);return(
                <div key={i} className="rw-item">
                  <div className="rw-icon" style={{background:cm.bg}}><div style={{transform:"scale(0.8)",transformOrigin:"center"}}>{goalIconEl(w.goalIcon)}</div></div>
                  <span className="rw-text">{w.text}</span>
                  <span className="rw-date">{fmtDate(w.doneDate)}</span>
                </div>
              );})}
            </div>
            <div className="tips-card" style={{backgroundImage:`url(${tipsBg})`}}>
              <div className="tips-card-overlay"/>
              <div className="tips-card-content">
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:"var(--ink)",marginBottom:16}}>Tips for this month</div>
                {(MONTHLY_TIPS[NOW.getMonth()]||MONTHLY_TIPS[4]).map(([ic,tip],i)=>(
                  <div key={i} className="tip-item">
                    <div className="tip-icon">{ic}</div>
                    <span style={{fontSize:13,color:"var(--ink)"}}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="goal-page-footer">✦ Big goals are achieved one small step at a time. ♡</div>
        </div>);}catch(e){console.error('Goals render error:',e);return(<div style={{padding:'40px',textAlign:'center'}}><div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:'var(--ink)',marginBottom:16}}>Something went wrong ✦</div><p style={{fontSize:13,color:'var(--ink-light)',marginBottom:24}}>Your goals data may need a reset.</p><button onClick={()=>{localStorage.setItem('sab_goals','{}');window.location.reload();}} style={{background:'var(--ink)',color:'#f4ede3',border:'none',borderRadius:10,padding:'10px 24px',fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:'pointer'}}>Reset Goals & Reload</button></div>);}})()}

        {/* ── CALENDAR ── */}
        {page==="calendar"&&<>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24,padding:"0 28px"}}>
            <div>
              <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:400,color:"var(--ink)"}}>Calendar</h1>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:13,color:"var(--ink-light)",marginTop:3}}>Plan your days. Stay aligned with what matters.</div>
            </div>
            {headerIcons}
          </div>

          {/* ── Top bar: nav + label + view toggle + add button ── */}
          <div className="cal-topbar2" style={{padding:"0 28px 0"}}>
            <button className="cal-nav-btn" onClick={calView==="month"?prevCal:calView==="week"?prevWk:prevDayD}>‹</button>
            <button className="cal-nav-btn" onClick={calView==="month"?nextCal:calView==="week"?nextWk:nextDayD}>›</button>
            <span className="cal-cur-label">{calView==="month"?calLabel:calView==="week"?calWkLabel:calDayLabel}</span>
            <button className="cal-today-btn2" onClick={goToday}>Today</button>
            <div className="cal-view-tgl">
              {[["month","Month"],["week","Week"],["day","Day"]].map(([v,l])=>(
                <button key={v} className={"cvt2"+(calView===v?" on":"")} onClick={()=>setCalView(v)}>{l}</button>
              ))}
            </div>
            <button className="cal-add2" onClick={()=>openAddEv(calView==="day"?effDayDate:TODAY)}>+ Add Event</button>
          </div>

          {/* ── Two-column layout: main + right panel ── */}
          <div className="cal-page">
            {/* ── LEFT: Main calendar area ── */}
            <div>
              {/* MONTH VIEW */}
              {calView==="month"&&<div className="cal-mth-wrap">
                <div className="cal-mth-hdr">
                  {DAYS.map(d=><div key={d} className="cal-mth-dh">{d}</div>)}
                </div>
                <div className="cal-mth-grid">
                  {Array.from({length:calFirst}).map((_,i)=><div key={"ep"+i} className="cal-mth-cell om2"/>)}
                  {Array.from({length:calDays}).map((_,i)=>{
                    const day=i+1;
                    const ds=calYear+"-"+String(calMonth+1).padStart(2,"0")+"-"+String(day).padStart(2,"0");
                    const de=evOn(ds);
                    const isT=ds===TODAY;
                    return(
                      <div key={day} className={"cal-mth-cell"+(isT?" tc3":"")} onClick={()=>openAddEv(ds)}>
                        <div className={"cal-mth-dn"+(isT?" tn2":"")}>{day}</div>
                        {de.slice(0,3).map(e=>(
                          <div key={e.id} className="cal-mth-ev" style={{background:calCatColor(e.category)||e.color}} onClick={ev=>{ev.stopPropagation();openEditEv(e,ev);}}>
                            {e.allDay?"● ":e.time?fmtShort(e.time)+" ":""}{e.title}
                          </div>
                        ))}
                        {de.length>3&&<div style={{fontSize:10,color:"var(--ink-light)",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic"}}>+{de.length-3} more</div>}
                      </div>
                    );
                  })}
                </div>
              </div>}

              {/* WEEK VIEW */}
              {calView==="week"&&<div className="cal-wk-wrap">
                <div className="cal-wk-hdr" style={{gridTemplateColumns:"52px repeat(7,1fr)"}}>
                  <div className="cal-wh-empty2" style={{height:64}}/>
                  {calWkDates.map(ds=>{
                    const d=new Date(ds+"T00:00:00");
                    const isT=ds===TODAY;
                    const dayIdx=d.getDay()===0?6:d.getDay()-1;
                    return(
                      <div key={ds} className="cal-wh-cell2">
                        <div className="cal-wh-day2">{DAYS[dayIdx]}</div>
                        <span className={"cal-wh-num2"+(isT?" tn3":"")}>{d.getDate()}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="cal-tgrid" style={{gridTemplateColumns:"52px repeat(7,1fr)"}}>
                  <div className="cal-tcol">
                    {CAL_HOURS.map(h=><div key={h} className="cal-tlbl">{fmtHour(h)}</div>)}
                  </div>
                  {calWkDates.map(ds=>{
                    const isT=ds===TODAY;
                    const de=evOn(ds).filter(e=>!e.allDay&&e.time);
                    return(
                      <div key={ds} className="cal-dcol" style={{background:isT?"rgba(201,168,124,.03)":"transparent"}}>
                        {CAL_HOURS.map(h=>(
                          <div key={h} className="cal-hslot" onClick={()=>openAddEv(ds,String(h).padStart(2,"0")+":00")}/>
                        ))}
                        {de.map(e=>{
                          const top=evTopPx(e.time);
                          if(top===null||top<0)return null;
                          const ht=evHtPx(e.time,e.endTime);
                          return(
                            <div key={e.id} className="cal-epill" style={{top:top,height:ht,background:calCatColor(e.category)||e.color}} onClick={ev=>openEditEv(e,ev)}>
                              <div className="cal-epill-t">{e.title}</div>
                              <div className="cal-epill-m">{fmtShort(e.time)}{e.endTime?" – "+fmtShort(e.endTime):""}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>}

              {/* DAY VIEW */}
              {calView==="day"&&<div className="cal-wk-wrap">
                <div className="cal-wk-hdr" style={{gridTemplateColumns:"52px 1fr"}}>
                  <div className="cal-wh-empty2" style={{height:64}}/>
                  <div className="cal-wh-cell2">
                    <div className="cal-wh-day2">{new Date(effDayDate+"T00:00:00").toLocaleDateString("en-GB",{weekday:"long"}).toUpperCase()}</div>
                    <span className={"cal-wh-num2"+(effDayDate===TODAY?" tn3":"")}>{new Date(effDayDate+"T00:00:00").getDate()}</span>
                  </div>
                </div>
                <div className="cal-tgrid" style={{gridTemplateColumns:"52px 1fr"}}>
                  <div className="cal-tcol">
                    {CAL_HOURS.map(h=><div key={h} className="cal-tlbl">{fmtHour(h)}</div>)}
                  </div>
                  <div className="cal-dcol">
                    {CAL_HOURS.map(h=>(
                      <div key={h} className="cal-hslot" onClick={()=>openAddEv(effDayDate,String(h).padStart(2,"0")+":00")}/>
                    ))}
                    {evOn(effDayDate).filter(e=>!e.allDay&&e.time).map(e=>{
                      const top=evTopPx(e.time);
                      if(top===null||top<0)return null;
                      const ht=evHtPx(e.time,e.endTime);
                      return(
                        <div key={e.id} className="cal-epill" style={{top:top,height:ht,background:calCatColor(e.category)||e.color}} onClick={ev=>openEditEv(e,ev)}>
                          <div className="cal-epill-t">{e.title}</div>
                          <div className="cal-epill-m">{fmtShort(e.time)}{e.endTime?" – "+fmtShort(e.endTime):""}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>}

              {/* Legend */}
              <div className="cal-leg">
                {CAL_CATS.map(c=>(
                  <div key={c.id} className="cal-leg-item">
                    <div className="cal-leg-dot" style={{background:c.color}}/>
                    {c.label}
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="cal-rp">
              {/* Mini calendar */}
              <div className="cal-mc">
                <div className="cal-mc-hdr">
                  <span className="cal-mc-mo">{MONTHS[calMonth]} {calYear}</span>
                  <div style={{display:"flex",gap:2}}>
                    <button className="cal-mc-nav" onClick={prevCal}>‹</button>
                    <button className="cal-mc-nav" onClick={nextCal}>›</button>
                  </div>
                </div>
                <div className="cal-mc-dh">
                  {["M","T","W","T","F","S","S"].map((d,i)=><div key={i} className="cal-mc-dhc">{d}</div>)}
                </div>
                <div className="cal-mc-dg">
                  {Array.from({length:calMiniFirst}).map((_,i)=><div key={"me"+i}/>)}
                  {Array.from({length:calMiniDays}).map((_,i)=>{
                    const day=i+1;
                    const ds=calYear+"-"+String(calMonth+1).padStart(2,"0")+"-"+String(day).padStart(2,"0");
                    const isT=ds===TODAY;
                    const haEv=evOn(ds).length>0;
                    return(
                      <div key={day} className={"cal-mc-d"+(isT?" tm":haEv?" hev":"")} onClick={()=>{
                        if(calView==="day"){setCalDayDate(ds);}
                        else if(calView==="week"){
                          const wd=new Date(ds+"T00:00:00");
                          const dow=wd.getDay();
                          const diff=dow===0?-6:1-dow;
                          wd.setDate(wd.getDate()+diff);
                          setCalWkStart(wd.getFullYear()+"-"+String(wd.getMonth()+1).padStart(2,"0")+"-"+String(wd.getDate()).padStart(2,"0"));
                        }
                        openAddEv(ds);
                      }}>{day}</div>
                    );
                  })}
                </div>
              </div>

              {/* Upcoming events */}
              <div className="cal-uc">
                <div className="cal-uc-hdr">
                  <span className="cal-uc-ttl">Upcoming</span>
                  <button className="cal-uc-va">View all</button>
                </div>
                <div className="cal-uc-scroll">
                {calUpcoming.length===0&&<div style={{fontSize:12,color:"var(--ink-light)",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic"}}>No events in the next two weeks ✦</div>}
                {calUpcoming.map((e,i)=>{
                  const dt=new Date(e._ds+"T00:00:00");
                  const dl=dt.toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"});
                  return(
                    <div key={e.id||i} className="cal-uc-item" onClick={ev=>openEditEv(e,ev)}>
                      <div className="cal-uc-dot" style={{background:calCatColor(e.category)||e.color}}/>
                      <div>
                        <div className="cal-uc-nm">{e.title}</div>
                        <div className="cal-uc-mt">{dl}{e.time?" · "+fmtEvTime(e.time):""}</div>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>

              {/* Gentle reminder quote */}
              <div className="cal-qc">
                <div className="cal-qc-lbl">A gentle reminder</div>
                <div className="cal-qc-txt">{QUOTE.text}</div>
                <div style={{fontSize:11,color:"var(--ink-light)",fontFamily:"'Cormorant Garamond',serif",marginTop:6}}>— {QUOTE.attr}</div>
              </div>
            </div>
          </div>
        </>}

        {/* ── HOME RESET v2 ── */}
        {page==="cleaning"&&(()=>{
          const HOME_PHILOSOPHY=["Little by little creates a home you love.","Order is the shape upon which beauty depends.","A tidy home reflects a clear mind.","Your home should tell the story of who you are.","Clean surroundings nurture calm thinking.","The details of your home are the poetry of your life.","A clean home is a happy home.","Simplicity is the ultimate form of sophistication.","Every corner you tend becomes a corner that tends you.","Home is not a place — it's a feeling. Make it beautiful.","Small acts of care add up to a beautiful life.","A serene home is the foundation of a serene life."];
          const homePhil=HOME_PHILOSOPHY[NOW.getDate()%HOME_PHILOSOPHY.length];
          const HR_CATS=["Kitchen","Living Room","Bedroom","Bathroom","General","Laundry","Garden","Office"];
          const HR_DURS=[5,10,15,20,30,45,60];
          // Viewed day
          const viewDate=new Date(NOW);viewDate.setDate(NOW.getDate()+hrDayOffset);
          const viewDayName=DAYS[viewDate.getDay()===0?6:viewDate.getDay()-1];
          const isHrToday=hrDayOffset===0;
          const hrDayLabel=hrDayOffset===0?"Today":hrDayOffset===-1?"Yesterday":hrDayOffset===1?"Tomorrow":viewDate.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"});
          const viewTasks=cleaning[viewDayName]||[];
          const viewDone=viewTasks.filter(t=>t.done).length;
          // Today's progress for top card
          const todayTasksHR=cleaning[TODAY_DAY]||[];
          const todayDoneHR=todayTasksHR.filter(t=>t.done).length;
          const todayTotalHR=todayTasksHR.length;
          // Week summary
          const todayDowHR=NOW.getDay()===0?6:NOW.getDay()-1;
          const wkSummary=DAYS.map((day,i)=>{
            const diff=i-todayDowHR;
            const tasks=cleaning[day]||[];
            const done=tasks.filter(t=>t.done).length;
            const total=tasks.length;
            return{day:day.slice(0,1),done,total,allDone:total>0&&done===total,isPast:diff<0,isToday:diff===0,isFuture:diff>0};
          });
          const wkTotalDone=wkSummary.reduce((s,d)=>s+d.done,0);
          const wkTotalAll=wkSummary.reduce((s,d)=>s+d.total,0);
          const wkPct=wkTotalAll>0?Math.round(wkTotalDone/wkTotalAll*100):0;
          // Upcoming tasks (next days)
          const hrUpcoming=(()=>{const r=[];for(let i=1;i<=6&&r.length<4;i++){const d=new Date(NOW);d.setDate(NOW.getDate()+i);const dn=DAYS[d.getDay()===0?6:d.getDay()-1];const tasks=(cleaning[dn]||[]).filter(t=>!t.done);if(!tasks.length)continue;const abbr=d.toLocaleDateString("en-GB",{weekday:"short"});const num=d.getDate();tasks.slice(0,2).forEach(t=>r.push({...t,abbr,num}));}return r.slice(0,4);})();
          // Day nav labels
          const prevDate=new Date(viewDate);prevDate.setDate(viewDate.getDate()-1);
          const nextDate=new Date(viewDate);nextDate.setDate(viewDate.getDate()+1);
          const prevLabel=hrDayOffset===1?"Yesterday":hrDayOffset===0?"Yesterday":prevDate.toLocaleDateString("en-GB",{weekday:"long"});
          const nextLabel=hrDayOffset===-1?"Tomorrow":hrDayOffset===0?"Tomorrow":nextDate.toLocaleDateString("en-GB",{weekday:"long"});
          const navDateLabel=isHrToday?viewDate.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"}):viewDate.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
          const chkSvg=<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5l2.5 2.8L9 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
          const calSvg=<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="6.5" width="14" height="13" rx="2.5" stroke="#8F8A83" strokeWidth="1.7"/><path d="M8 4.5V8" stroke="#8F8A83" strokeWidth="1.7" strokeLinecap="round"/><path d="M16 4.5V8" stroke="#8F8A83" strokeWidth="1.7" strokeLinecap="round"/><path d="M5.5 10H18.5" stroke="#8F8A83" strokeWidth="1.7" strokeLinecap="round"/><circle cx="9" cy="13.5" r="1" fill="#8F8A83"/><circle cx="12" cy="13.5" r="1" fill="#8F8A83"/><circle cx="15" cy="13.5" r="1" fill="#8F8A83"/></svg>;
          return(<div className="hr-wrap">
            {/* Header */}
            <div className="hr-hd-row">
              <div>
                <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:400,color:"var(--ink)"}}>Home Reset</h1>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:13,color:"var(--ink-light)",marginTop:3}}>A clean space, a clear mind.</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <button onClick={()=>{setHrDraft({text:"",category:"General",duration:10});setHrModal(true);}} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 20px",background:"var(--ink)",color:"#f4ede3",border:"none",borderRadius:20,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,cursor:"pointer"}}>+ Add Task</button>
                {headerIcons}
              </div>
            </div>

            {/* Top card: 3 columns — Progress | Image | Philosophy */}
            <div className="hr-top-card">
              {/* Col 1: Today's Progress */}
              <div className="hr-top-prog">
                <div>
                  <div style={{fontSize:11,color:"var(--ink-light)",textTransform:"uppercase",letterSpacing:".1em",fontFamily:"'DM Sans',sans-serif",marginBottom:14}}>Today's Progress</div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:13,color:"var(--ink-light)",marginBottom:10}}>{todayDoneHR===todayTotalHR&&todayTotalHR>0?"You've completed everything ✦":todayDoneHR>0?"You're keeping your space beautiful.":"Let's get started ✦"}</div>
                  <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:4}}>
                    <span style={{fontFamily:"'Playfair Display',serif",fontSize:52,fontWeight:400,color:"var(--ink)",lineHeight:1}}>{todayDoneHR}</span>
                    <span style={{fontSize:20,color:"var(--ink-light)",margin:"0 3px"}}>/</span>
                    <span style={{fontFamily:"'Playfair Display',serif",fontSize:26,color:"var(--ink-light)"}}>{todayTotalHR}</span>
                  </div>
                  <div style={{fontSize:12,color:"var(--ink-light)",fontFamily:"'DM Sans',sans-serif"}}>tasks completed</div>
                </div>
                {/* Timeline dots */}
                {todayTotalHR>0&&(
                  <div style={{marginTop:20}}>
                    <div style={{display:"flex",alignItems:"center",height:18,position:"relative"}}>
                      {todayTasksHR.flatMap((_,i)=>{
                        const done=i<todayDoneHR;
                        const dot=<div key={"d"+i} style={{width:16,height:16,borderRadius:"50%",background:done?"#7F8F68":"#fff",border:`2px solid ${done?"#7F8F68":"#c8d0ba"}`,flexShrink:0,zIndex:2,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .3s"}}>
                          {done&&<svg width="7" height="7" viewBox="0 0 7 7" fill="none"><path d="M1 3.5l1.8 2L6 1.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>;
                        return i===0?[dot]:[<div key={"l"+i} style={{flex:1,height:2,background:i<=todayDoneHR?"#7F8F68":"#dde5d4",transition:"background .3s"}}/>,dot];
                      })}
                    </div>
                    <div className="hr-prog-bar-bg" style={{marginTop:14}}>
                      <div className="hr-prog-bar-fill" style={{width:(todayDoneHR/todayTotalHR*100)+"%"}}/>
                    </div>
                  </div>
                )}
                {todayTotalHR===0&&<div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:13,color:"var(--ink-light)",marginTop:20}}>No tasks yet — add one to begin ✦</div>}
              </div>
              {/* Col 2: Image */}
              <div className="hr-top-img-col">
                <img src={homePhilImg} alt="Home philosophy"/>
              </div>
              {/* Col 3: Philosophy */}
              <div className="hr-top-phil-col">
                <div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:400,color:"var(--ink)",marginBottom:12}}>Home Philosophy</div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:17,color:"var(--ink)",lineHeight:1.65}}>{homePhil}</div>
                </div>
                <div style={{fontSize:18,color:"var(--ink-light)"}}>♡</div>
              </div>
            </div>

            <div className="hr-layout">
              {/* LEFT: Day Nav + Tasks */}
              <div className="hr-left">
                <div className="hr-tasks-card">
                  {/* Day navigator — text style */}
                  <div className="hr-day-nav">
                    <span className="hr-day-nav-prev" onClick={()=>setHrDayOffset(o=>o-1)}>← {prevLabel}</span>
                    <div className="hr-day-nav-center">
                      <div className="hr-day-nav-date">
                        {calSvg}
                        <span>{navDateLabel}</span>
                      </div>
                      {!isHrToday&&<div className="hr-day-nav-wk" onClick={()=>setHrDayOffset(0)}>← Back to Today</div>}
                      {isHrToday&&<div className="hr-day-nav-wk">View week ↓</div>}
                    </div>
                    <span className="hr-day-nav-next" onClick={()=>setHrDayOffset(o=>o+1)}>{nextLabel} →</span>
                  </div>
                  {/* Task section label */}
                  <div className="hr-tasks-lbl">Daily Tasks</div>
                  {/* Tasks */}
                  {viewTasks.length===0&&<div style={{padding:"16px 20px 20px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:13,color:"var(--ink-light)"}}>No tasks for {hrDayLabel.toLowerCase()} — add one ✦</div>}
                  {viewTasks.map((task,i)=>(
                    <div key={i} className="hr-task-row">
                      <div className={"hr-task-chk"+(task.done?" done":"")} onClick={()=>toggleClean(viewDayName,i)}>
                        {task.done&&chkSvg}
                      </div>
                      {editC&&editC.day===viewDayName&&editC.idx===i
                        ?<input className="inp" style={{fontSize:13,flex:1}} autoFocus value={editCTxt} onChange={e=>setEditCTxt(e.target.value)} onBlur={saveEC} onKeyDown={e=>e.key==="Enter"&&saveEC()}/>
                        :<span className={"hr-task-nm"+(task.done?" done":"")} onDoubleClick={()=>{setEditC({day:viewDayName,idx:i});setEditCTxt(task.text);}}>{task.text}</span>
                      }
                      {task.category&&<span className="hr-task-badge">{task.category}</span>}
                      {task.duration&&<span className="hr-task-dur">{task.duration} min</span>}
                      <button onClick={()=>delClean(viewDayName,i)} style={{background:"none",border:"none",color:"var(--ink-light)",cursor:"pointer",fontSize:16,padding:"0 2px",opacity:.35,lineHeight:1,flexShrink:0}}>×</button>
                    </div>
                  ))}
                  <div className="hr-add-row" onClick={()=>{setHrDraft({text:"",category:"General",duration:10});setHrModal(true);}}>+ Add Task</div>
                </div>
              </div>

              {/* RIGHT: This Week + Upcoming */}
              <div className="hr-right">
                <div className="hr-wk-card">
                  <div className="hr-wk-hdr">
                    <span style={{display:"flex",alignItems:"center",gap:7,fontFamily:"'Playfair Display',serif",fontSize:15,color:"var(--ink)"}}>{calSvg}This Week</span>
                    <span style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--gold-deep)",cursor:"pointer"}}>View all</span>
                  </div>
                  <div style={{fontSize:11,color:"var(--ink-light)",fontFamily:"'DM Sans',sans-serif",marginBottom:0}}>Progress</div>
                  <div style={{fontSize:13,color:"var(--ink)",fontFamily:"'DM Sans',sans-serif",marginTop:2}}>{wkTotalDone} / {wkTotalAll} tasks completed</div>
                  <div className="hr-prog-bar-bg">
                    <div className="hr-prog-bar-fill" style={{width:wkPct+"%"}}/>
                  </div>
                  <div className="hr-wk-days">
                    {wkSummary.map((d,i)=>{
                      const cls=d.allDone?"done":d.isToday?"today":d.isPast?"past":"future";
                      return(
                        <div key={i} className="hr-wk-day">
                          <div className="hr-wk-d-lbl">{d.day}</div>
                          <div className={"hr-wk-d-circle "+cls}>
                            {d.allDone&&chkSvg}
                            {d.isToday&&!d.allDone&&<div style={{width:8,height:8,borderRadius:"50%",background:"#7F8F68"}}/>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="hr-up-card">
                  <div className="hr-up-hdr">
                    <span style={{display:"flex",alignItems:"center",gap:7,fontFamily:"'Playfair Display',serif",fontSize:15,color:"var(--ink)"}}>{calSvg}Upcoming Tasks</span>
                    <span style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:12,color:"var(--gold-deep)",cursor:"pointer"}}>View all</span>
                  </div>
                  {hrUpcoming.length===0&&<div style={{padding:"4px 16px 16px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:13,color:"var(--ink-light)"}}>All clear ahead ✦</div>}
                  {hrUpcoming.map((t,i)=>(
                    <div key={i} className="hr-up-item">
                      <div className="hr-up-date">
                        <div className="hr-up-day-abbr">{t.abbr}</div>
                        <div className="hr-up-day-num">{t.num}</div>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13.5,color:"var(--ink)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.text}</div>
                        {t.category&&<div style={{fontSize:10,color:"var(--ink-light)",marginTop:1}}>{t.category}</div>}
                      </div>
                      {t.duration&&<div style={{fontSize:12,color:"var(--ink-light)",flexShrink:0,paddingLeft:8}}>{t.duration} min</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Add Task Modal */}
            {hrModal&&<div className="hr-modal" onClick={()=>setHrModal(false)}>
              <div className="hr-mbox" onClick={e=>e.stopPropagation()}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:"var(--ink)",marginBottom:20}}>Add Task</div>
                <div className="mf"><div className="mlb">TASK</div><input className="mi2" placeholder="What needs to be done?" value={hrDraft.text} autoFocus onChange={e=>setHrDraft(d=>({...d,text:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addHrTask()}/></div>
                <div className="mf" style={{marginTop:12}}><div className="mlb">CATEGORY</div>
                  <select className="sel" value={hrDraft.category} onChange={e=>setHrDraft(d=>({...d,category:e.target.value}))}>
                    {HR_CATS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="mf" style={{marginTop:12}}><div className="mlb">DURATION</div>
                  <select className="sel" value={hrDraft.duration} onChange={e=>setHrDraft(d=>({...d,duration:Number(e.target.value)}))}>
                    {HR_DURS.map(d=><option key={d} value={d}>{d} min</option>)}
                  </select>
                </div>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:20}}>
                  <button className="bc2" onClick={()=>setHrModal(false)}>Cancel</button>
                  <button className="bs" onClick={addHrTask}>Add ✦</button>
                </div>
              </div>
            </div>}
          </div>);
        })()}

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
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <button onClick={()=>{setGratViewOffset(0);setTimeout(()=>document.getElementById("grat-input-field")?.focus(),50);}} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 20px",background:"var(--ink)",color:"#f4ede3",border:"none",borderRadius:20,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,cursor:"pointer"}}>+ Add Gratitude</button>
                  {headerIcons}
                </div>
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
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#F3EAE1"/><path d="M12 7L12.8 9.2L15 10L12.8 10.8L12 13L11.2 10.8L9 10L11.2 9.2L12 7Z" fill="#B89576"/><path d="M16.5 5.5L16.9 6.6L18 7L16.9 7.4L16.5 8.5L16.1 7.4L15 7L16.1 6.6L16.5 5.5Z" fill="#B89576"/><path d="M8.5 14C9.4 15.2 10.7 16 12.2 16C14.8 16 17 13.8 17 11.2" stroke="#B89576" strokeWidth="1.8" strokeLinecap="round"/></svg>
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
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#F6EEE5"/><path d="M12.2 21C8.9 21 6.4 18.5 6.4 15.2C6.4 12.7 7.7 10.9 9.3 9.3C10.5 8.1 11.3 6.7 11.5 4.7C11.6 4 12.5 3.7 13 4.2C15 6.2 17.6 9.3 17.6 14.4C17.6 18.3 15.2 21 12.2 21Z" fill="#C49A6C"/><path d="M12.2 18.6C10.7 18.6 9.6 17.5 9.6 16.1C9.6 15 10.2 14.2 11 13.4C11.5 12.9 11.9 12.2 12 11.4C12.1 10.9 12.7 10.7 13 11.1C13.9 12.1 14.8 13.3 14.8 15.4C14.8 17.3 13.6 18.6 12.2 18.6Z" fill="#FFFDF9"/></svg>
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
                          :<div style={{fontSize:11,color:"var(--gold-deep)",marginTop:2,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={()=>setEditingReminder(rem.key)}>{gratReminders[rem.timeKey]}</div>
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

        {/* ── PROJECTS ── */}
        {page==="projects"&&(()=>{
          const selProj=selProjId?projects.find(p=>p.id===selProjId):null;
          
          // ── PROJECT DETAIL VIEW ──
          if(selProj){
            const pct=projPct(selProj);
            const doneTaskCount=selProj.tasks.filter(t=>t.done).length;
            const doneMilCount=selProj.milestones.filter(m=>m.done).length;
            const firstUndone=selProj.milestones.findIndex(m=>!m.done);
            const priBg={low:"#EEF3EA",medium:"#FFF3DF",high:"#F7EDEA"};
            const priClr={low:"#6F7F55",medium:"#A8793C",high:"#C98F8F"};
            const circumference=2*Math.PI*38;
            const dash=circumference*(1-pct/100);
            return(
            <div style={{padding:"0 24px 64px"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
                <button onClick={()=>{setSelProjId(null);}} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"1px solid var(--border)",borderRadius:20,padding:"6px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"var(--ink-light)",cursor:"pointer"}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  Projects
                </button>
              </div>
              {/* Project header card */}
              <div style={{background:"#fff",border:"1px solid #EAE4DC",borderRadius:16,padding:"24px 28px",boxShadow:"var(--shadow)",marginBottom:16}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:20}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:18,flex:1}}>
                    <div style={{flexShrink:0,cursor:"pointer"}} onClick={()=>openEditProj(selProj)} title="Edit project">{PROJ_ICONS[selProj.icon]||PROJ_ICONS.laptop}</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:600,color:"var(--ink)",margin:0}}>{selProj.title}</h1>
                        <button onClick={()=>openEditProj(selProj)} title="Edit project" style={{background:"none",border:"1px solid #EAE4DC",borderRadius:8,padding:"4px 8px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:"#8F8A83",flexShrink:0}}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 18.5L5.8 15L15.5 5.3C16.2 4.6 17.3 4.6 18 5.3L18.7 6C19.4 6.7 19.4 7.8 18.7 8.5L9 18.2L5 18.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M14.5 6.5L17.5 9.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
                          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11}}>Edit</span>
                        </button>
                      </div>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#8F8A83",margin:"0 0 20px",lineHeight:1.5}}>{selProj.description||"No description yet."}</p>
                      <div style={{display:"flex",flexWrap:"wrap",gap:24}}>
                        {[
                          {icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="5" y="6.5" width="14" height="13" rx="2.5" stroke="#8F8A83" strokeWidth="1.7"/><path d="M8 4.5V8" stroke="#8F8A83" strokeWidth="1.7" strokeLinecap="round"/><path d="M16 4.5V8" stroke="#8F8A83" strokeWidth="1.7" strokeLinecap="round"/><path d="M5.5 10H18.5" stroke="#8F8A83" strokeWidth="1.7" strokeLinecap="round"/></svg>,label:"Start Date",val:selProj.startDate?new Date(selProj.startDate+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):"\u2014"},
                          {icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="5" y="6.5" width="14" height="13" rx="2.5" stroke="#8F8A83" strokeWidth="1.7"/><path d="M8 4.5V8" stroke="#8F8A83" strokeWidth="1.7" strokeLinecap="round"/><path d="M16 4.5V8" stroke="#8F8A83" strokeWidth="1.7" strokeLinecap="round"/><path d="M5.5 10H18.5" stroke="#8F8A83" strokeWidth="1.7" strokeLinecap="round"/></svg>,label:"Due Date",val:selProj.dueDate?new Date(selProj.dueDate+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):"Ongoing"},
                          {icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 20V5" stroke="#C47C6A" strokeWidth="1.8" strokeLinecap="round"/><path d="M7 6H17L15.5 10L17 14H7V6Z" stroke="#C47C6A" strokeWidth="1.8" strokeLinejoin="round"/></svg>,label:"Priority",val:selProj.priority.charAt(0).toUpperCase()+selProj.priority.slice(1)},
                          {icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M10 7H18" stroke="#8F8A83" strokeWidth="1.8" strokeLinecap="round"/><path d="M10 12H18" stroke="#8F8A83" strokeWidth="1.8" strokeLinecap="round"/><path d="M10 17H18" stroke="#8F8A83" strokeWidth="1.8" strokeLinecap="round"/><circle cx="6" cy="7" r="1.2" fill="#8F8A83"/><circle cx="6" cy="12" r="1.2" fill="#8F8A83"/><circle cx="6" cy="17" r="1.2" fill="#8F8A83"/></svg>,label:"Tasks",val:doneTaskCount+" / "+selProj.tasks.length},
                        ].map(m=>(
                          <div key={m.label} style={{display:"flex",alignItems:"center",gap:7}}>
                            {m.icon}
                            <div>
                              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#8F8A83"}}>{m.label}</div>
                              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,color:"var(--ink)"}}>{m.val}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Progress donut */}
                  <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                    <svg width="90" height="90" viewBox="0 0 90 90">
                      <circle cx="45" cy="45" r="38" fill="none" stroke="#f0ebe4" strokeWidth="8"/>
                      <circle cx="45" cy="45" r="38" fill="none" stroke="#B9855E" strokeWidth="8"
                        strokeDasharray={circumference.toFixed(1)+" "+circumference.toFixed(1)}
                        strokeDashoffset={dash.toFixed(1)}
                        strokeLinecap="round"
                        transform="rotate(-90 45 45)"/>
                      <text x="45" y="49" textAnchor="middle" fontFamily="Playfair Display" fontSize="17" fontWeight="600" fill="#2A2421">{pct}%</text>
                    </svg>
                    <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#8F8A83"}}>Progress</div>
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div style={{background:"#fff",border:"1px solid #EAE4DC",borderRadius:14,padding:"20px 24px",boxShadow:"var(--shadow)",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M10 7H18" stroke="#8F8A83" strokeWidth="1.8" strokeLinecap="round"/><path d="M10 12H18" stroke="#8F8A83" strokeWidth="1.8" strokeLinecap="round"/><path d="M10 17H18" stroke="#8F8A83" strokeWidth="1.8" strokeLinecap="round"/><circle cx="6" cy="7" r="1.2" fill="#8F8A83"/><circle cx="6" cy="12" r="1.2" fill="#8F8A83"/><circle cx="6" cy="17" r="1.2" fill="#8F8A83"/></svg>
                    <span style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:600,color:"var(--ink)"}}>Tasks</span>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#8F8A83",background:"#f5f0ea",borderRadius:10,padding:"1px 8px"}}>{doneTaskCount} / {selProj.tasks.length}</span>
                  </div>
                </div>
                {selProj.tasks.map(t=>{
                  const pri=t.priority||"medium";
                  const isOverdue=!t.done&&t.dueDate&&t.dueDate<TODAY;
                  const isEditing=editTaskId===t.id;
                  return(
                  <div key={t.id} style={{borderBottom:"1px solid #f3ede6",paddingBottom:isEditing?12:0,marginBottom:isEditing?10:0}}>
                    {/* Normal row */}
                    <div className="proj-detail-task" style={{position:"relative"}}>
                      <button onClick={()=>toggleProjTask(selProj.id,t.id)} style={{background:"none",border:"none",cursor:"pointer",flexShrink:0,padding:0}}>
                        {t.done
                          ?<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#7F8F68"/><path d="M8 12.2L10.8 15L16.5 9.5" stroke="#FFFDF9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          :<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#BFA58D" strokeWidth="1.6"/></svg>
                        }
                      </button>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:t.done?"#8F8A83":"var(--ink)",textDecoration:t.done?"line-through":"none",flex:1}}>{t.text}</span>
                      {t.dueDate&&<span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:isOverdue?"#C98F8F":"#8F8A83",fontWeight:isOverdue?600:400,flexShrink:0}}>{isOverdue?"⚠ ":""}{new Date(t.dueDate+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</span>}
                      <span className="proj-pri-badge" style={{background:priBg[pri],color:priClr[pri],flexShrink:0}}>{pri}</span>
                      {/* Three-dot menu */}
                      <div style={{position:"relative",flexShrink:0}}>
                        <button onClick={e=>{e.stopPropagation();setTaskMenuId(taskMenuId===t.id?null:t.id);}} style={{background:"none",border:"none",cursor:"pointer",color:"#C4B9AD",padding:"2px 4px",lineHeight:1,fontSize:18,letterSpacing:1}}>⋮</button>
                        {taskMenuId===t.id&&(
                          <div style={{position:"absolute",right:0,top:"100%",background:"#fff",border:"1px solid #EAE4DC",borderRadius:10,boxShadow:"0 4px 18px rgba(0,0,0,.1)",zIndex:100,minWidth:120,overflow:"hidden"}}>
                            <button onClick={()=>openTaskEdit(t)} style={{display:"block",width:"100%",textAlign:"left",padding:"10px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--ink)",background:"none",border:"none",cursor:"pointer",borderBottom:"1px solid #f3ede6"}}>
                              Edit task
                            </button>
                            <button onClick={()=>{deleteProjTask(selProj.id,t.id);setTaskMenuId(null);}} style={{display:"block",width:"100%",textAlign:"left",padding:"10px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#C98F8F",background:"none",border:"none",cursor:"pointer"}}>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Inline edit form */}
                    {isEditing&&(
                      <div style={{padding:"10px 12px",background:"#faf7f3",borderRadius:10,marginTop:4}}>
                        <input autoFocus value={editTaskText} onChange={e=>setEditTaskText(e.target.value)} placeholder="Task name" style={{width:"100%",border:"1px solid #EAE4DC",borderRadius:7,padding:"8px 10px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--ink)",background:"#fff",outline:"none",boxSizing:"border-box",marginBottom:10}}/>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10,flexWrap:"wrap"}}>
                          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#8F8A83"}}>Priority:</span>
                          {[["low","#EEF3EA","#6F7F55"],["medium","#FFF3DF","#A8793C"],["high","#F7EDEA","#C98F8F"]].map(([v,bg,cl])=>(
                            <button key={v} onClick={()=>setEditTaskPri(v)} style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:editTaskPri===v?600:400,padding:"3px 10px",borderRadius:10,border:"1px solid "+(editTaskPri===v?cl:"#EAE4DC"),background:editTaskPri===v?bg:"transparent",color:editTaskPri===v?cl:"#8F8A83",cursor:"pointer"}}>{v}</button>
                          ))}
                          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#8F8A83",marginLeft:8}}>Due:</span>
                          <input type="date" value={editTaskDue} onChange={e=>setEditTaskDue(e.target.value)} style={{border:"1px solid #EAE4DC",borderRadius:7,padding:"3px 8px",fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"var(--ink)",background:"#fff",outline:"none"}}/>
                          {editTaskDue&&<button onClick={()=>setEditTaskDue("")} style={{background:"none",border:"none",cursor:"pointer",color:"#C4B9AD",fontSize:12,padding:"0 2px"}}>✕</button>}
                        </div>
                        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                          <button onClick={()=>setEditTaskId(null)} style={{background:"none",border:"1px solid #EAE4DC",borderRadius:7,padding:"6px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer",color:"var(--ink-light)"}}>Cancel</button>
                          <button onClick={()=>saveTaskEdit(selProj.id)} style={{background:"var(--ink)",color:"#f4ede3",border:"none",borderRadius:7,padding:"6px 16px",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,cursor:"pointer"}}>Save</button>
                        </div>
                      </div>
                    )}
                  </div>
                );})}
                <div style={{marginTop:14}}>
                  <div style={{display:"flex",gap:8,marginBottom:6}}>
                    <input value={newProjTaskText} onChange={e=>setNewProjTaskText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addProjTask(selProj.id)} placeholder="Add a task..." style={{flex:1,border:"1px solid #EAE4DC",borderRadius:8,padding:"8px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"var(--ink)",background:"#faf7f3",outline:"none"}}/>
                    <button onClick={()=>addProjTask(selProj.id)} style={{background:"var(--ink)",color:"#f4ede3",border:"none",borderRadius:8,padding:"8px 16px",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,cursor:"pointer",flexShrink:0}}>+ Add</button>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#8F8A83",flexShrink:0}}>Priority:</span>
                    {[["low","#EEF3EA","#6F7F55"],["medium","#FFF3DF","#A8793C"],["high","#F7EDEA","#C98F8F"]].map(([v,bg,cl])=>(
                      <button key={v} onClick={()=>setNewProjTaskPri(v)} style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:newProjTaskPri===v?600:400,padding:"3px 10px",borderRadius:10,border:"1px solid "+(newProjTaskPri===v?cl:"#EAE4DC"),background:newProjTaskPri===v?bg:"transparent",color:newProjTaskPri===v?cl:"#8F8A83",cursor:"pointer",transition:"all .15s"}}>{v}</button>
                    ))}
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#8F8A83",flexShrink:0,marginLeft:8}}>Due:</span>
                    <input type="date" value={newProjTaskDue} onChange={e=>setNewProjTaskDue(e.target.value)} style={{border:"1px solid #EAE4DC",borderRadius:7,padding:"3px 8px",fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"var(--ink)",background:"#faf7f3",outline:"none",cursor:"pointer"}}/>
                  </div>
                </div>
              </div>

              {/* Milestones */}
              <div style={{background:"#fff",border:"1px solid #EAE4DC",borderRadius:14,padding:"20px 24px",boxShadow:"var(--shadow)",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#B9855E" strokeWidth="1.7"/><circle cx="12" cy="12" r="4" fill="#B9855E"/></svg>
                    <span style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:600,color:"var(--ink)"}}>Milestones</span>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#8F8A83",background:"#f5f0ea",borderRadius:10,padding:"1px 8px"}}>{doneMilCount} / {selProj.milestones.length}</span>
                  </div>
                </div>
                {selProj.milestones.length>0&&(
                  <div style={{display:"flex",alignItems:"flex-start",gap:0,marginBottom:20,overflowX:"auto",paddingBottom:4}}>
                    {selProj.milestones.map((m,mi)=>{
                      const isCurrent=!m.done&&mi===firstUndone;
                      const isNext=!m.done&&mi>firstUndone;
                      return(
                        <div key={m.id} style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:90,flex:1,position:"relative"}}>
                          {mi>0&&<div style={{position:"absolute",top:12,right:"50%",left:"-50%",height:2,background:selProj.milestones[mi-1].done?"#7F8F68":"#E6D8CC",zIndex:0}}/>}
                          <button onClick={()=>toggleProjMil(selProj.id,m.id)} style={{background:"none",border:"none",cursor:"pointer",position:"relative",zIndex:1,padding:0}}>
                            {m.done
                              ?<svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="13" r="11" fill="#7F8F68"/><path d="M9 13.2L11.8 16L17.5 10.5" stroke="#FFFDF9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              :isCurrent
                                ?<svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="13" r="11" fill="#F3E8DE"/><circle cx="13" cy="13" r="7" stroke="#B9855E" strokeWidth="2"/><circle cx="13" cy="13" r="4" fill="#B9855E"/></svg>
                                :<svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="13" r="9" stroke="#E6D8CC" strokeWidth="1.8"/></svg>
                            }
                          </button>
                          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,color:m.done?"#7F8F68":isCurrent?"#B9855E":"#8F8A83",fontWeight:m.done||isCurrent?500:400,textAlign:"center",marginTop:6,lineHeight:1.3,maxWidth:80}}>{m.title}</div>
                          {m.doneDate&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:"#8F8A83",marginTop:3}}>{new Date(m.doneDate+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</div>}
                          {!m.done&&m.deadline&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:"#8F8A83",marginTop:3}}>{new Date(m.deadline+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</div>}
                          <button onClick={()=>deleteProjMil(selProj.id,m.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#ddd",fontSize:13,padding:"2px",marginTop:2,lineHeight:1}}>×</button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div style={{display:"flex",gap:8}}>
                  <input value={newProjMilText} onChange={e=>setNewProjMilText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addProjMil(selProj.id)} placeholder="Add a milestone..." style={{flex:1,border:"1px solid #EAE4DC",borderRadius:8,padding:"8px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"var(--ink)",background:"#faf7f3",outline:"none"}}/>
                  <button onClick={()=>addProjMil(selProj.id)} style={{background:"var(--ink)",color:"#f4ede3",border:"none",borderRadius:8,padding:"8px 16px",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,cursor:"pointer"}}>+ Add</button>
                </div>
              </div>

              {/* Notes */}
              {(()=>{
                const projNotes=getProjNotes(selProj);
                return(
                <div style={{background:"#fff",border:"1px solid #EAE4DC",borderRadius:14,padding:"20px 24px",boxShadow:"var(--shadow)",marginBottom:14}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#8F8A83" strokeWidth="1.7" strokeLinejoin="round"/><path d="M14 2v6h6" stroke="#8F8A83" strokeWidth="1.7" strokeLinejoin="round"/><path d="M8 13h8M8 17h5" stroke="#8F8A83" strokeWidth="1.7" strokeLinecap="round"/></svg>
                      <span style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:600,color:"var(--ink)"}}>Notes</span>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#8F8A83",background:"#f5f0ea",borderRadius:10,padding:"1px 8px"}}>{projNotes.length}</span>
                    </div>
                  </div>
                  {projNotes.length===0&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#8F8A83",lineHeight:1.6,fontStyle:"italic",marginBottom:16}}>No notes yet. Add your first thought below.</div>}
                  {projNotes.map(note=>(
                    <div key={note.id} style={{background:"#faf7f3",border:"1px solid #EAE4DC",borderRadius:10,padding:"12px 14px",marginBottom:10,position:"relative"}}>
                      {editNoteId===note.id
                        ?(<div>
                            <textarea autoFocus value={editNoteText} onChange={e=>setEditNoteText(e.target.value)} style={{width:"100%",minHeight:72,border:"1px solid #B9855E",borderRadius:6,padding:"8px 10px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--ink)",background:"#fff",outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
                            <div style={{display:"flex",gap:6,marginTop:6,justifyContent:"flex-end"}}>
                              <button onClick={()=>{setEditNoteId(null);setEditNoteText("");}} style={{background:"none",border:"1px solid #EAE4DC",borderRadius:6,padding:"4px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:11,cursor:"pointer",color:"var(--ink-light)"}}>Cancel</button>
                              <button onClick={()=>saveNoteEdit(selProj.id)} style={{background:"var(--ink)",color:"#f4ede3",border:"none",borderRadius:6,padding:"4px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500,cursor:"pointer"}}>Save</button>
                            </div>
                          </div>)
                        :(<>
                            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--ink)",lineHeight:1.6,whiteSpace:"pre-wrap",paddingRight:48}}>{note.text}</div>
                            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#8F8A83",marginTop:6}}>{note.createdAt?new Date(note.createdAt+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):""}</div>
                            <div style={{position:"absolute",top:10,right:10,display:"flex",gap:4}}>
                              <button onClick={()=>{setEditNoteId(note.id);setEditNoteText(note.text);}} style={{background:"none",border:"none",cursor:"pointer",color:"#8F8A83",padding:2}} title="Edit note"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 18.5L5.8 15L15.5 5.3C16.2 4.6 17.3 4.6 18 5.3L18.7 6C19.4 6.7 19.4 7.8 18.7 8.5L9 18.2L5 18.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M14.5 6.5L17.5 9.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg></button>
                              <button onClick={()=>deleteProjNote(selProj.id,note.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#ccc",fontSize:16,padding:"0 2px",lineHeight:1}} title="Delete note">×</button>
                            </div>
                          </>)
                      }
                    </div>
                  ))}
                  <div style={{display:"flex",gap:8,marginTop:4}}>
                    <textarea value={newNoteText} onChange={e=>setNewNoteText(e.target.value)} placeholder="Write a note..." rows={2} style={{flex:1,border:"1px solid #EAE4DC",borderRadius:8,padding:"8px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"var(--ink)",background:"#faf7f3",outline:"none",resize:"none"}}/>
                    <button onClick={()=>addProjNote(selProj.id)} style={{background:"var(--ink)",color:"#f4ede3",border:"none",borderRadius:8,padding:"8px 16px",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,cursor:"pointer",alignSelf:"flex-end"}}>+ Add</button>
                  </div>
                </div>
                );
              })()}

            {/* Attachments */}
            {(()=>{
              const atts=selProj.attachments||[];
              return(
              <div style={{background:"#fff",border:"1px solid #EAE4DC",borderRadius:14,padding:"20px 24px",boxShadow:"var(--shadow)",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" stroke="#8F8A83" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:600,color:"var(--ink)"}}>Attachments</span>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#8F8A83",background:"#f5f0ea",borderRadius:10,padding:"1px 8px"}}>{atts.length}</span>
                  </div>
                  <label style={{display:"flex",alignItems:"center",gap:5,background:"#f5f0ea",border:"1px solid #EAE4DC",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"var(--ink-light)"}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Attach file
                    <input type="file" style={{display:"none"}} onChange={e=>{if(e.target.files[0])addProjAttachment(selProj.id,e.target.files[0]);e.target.value="";}} accept="*/*"/>
                  </label>
                </div>
                {atts.length===0&&(
                  <div
                    style={{border:"2px dashed #EAE4DC",borderRadius:10,padding:"28px 20px",textAlign:"center",cursor:"pointer"}}
                    onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor="#B9855E";}}
                    onDragLeave={e=>{e.currentTarget.style.borderColor="#EAE4DC";}}
                    onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor="#EAE4DC";const f=e.dataTransfer.files[0];if(f)addProjAttachment(selProj.id,f);}}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{margin:"0 auto 8px",display:"block"}}><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" stroke="#C4B9AD" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#8F8A83"}}>Drop a file here or use <span style={{color:"#B9855E"}}>Attach file</span> above</div>
                    <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#C4B9AD",marginTop:4}}>Max 8 MB per file</div>
                  </div>
                )}
                {atts.length>0&&(
                  <div
                    style={{border:"2px dashed transparent",borderRadius:10,transition:"border-color .15s"}}
                    onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor="#B9855E";}}
                    onDragLeave={e=>{e.currentTarget.style.borderColor="transparent";}}
                    onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor="transparent";const f=e.dataTransfer.files[0];if(f)addProjAttachment(selProj.id,f);}}
                  >
                    {atts.map(att=>(
                      <div key={att.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:"#faf7f3",borderRadius:9,marginBottom:8,border:"1px solid #EAE4DC"}}>
                        <div style={{flexShrink:0}} dangerouslySetInnerHTML={{__html:attIcon(att.type||"")}} />
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,color:"var(--ink)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{att.name}</div>
                          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#8F8A83",marginTop:2}}>{fmtBytes(att.size)} · {att.addedAt?new Date(att.addedAt+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):""}</div>
                        </div>
                        <button onClick={()=>downloadAttachment(att)} title="Download" style={{background:"none",border:"none",cursor:"pointer",color:"#8F8A83",padding:4,flexShrink:0}}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        </button>
                        <button onClick={()=>deleteProjAttachment(selProj.id,att.id)} title="Remove" style={{background:"none",border:"none",cursor:"pointer",color:"#ccc",fontSize:16,padding:"0 2px",lineHeight:1}}>×</button>
                      </div>
                    ))}
                    <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#C4B9AD",marginTop:4,textAlign:"center"}}>Drop more files here · Max 8 MB each</div>
                  </div>
                )}
              </div>
              );
            })()}

            {/* Edit Project Modal — must live inside detail view */}
            {showEditProj&&(
              <div style={{position:"fixed",inset:0,background:"rgba(42,36,33,.45)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setShowEditProj(false)}>
                <div style={{background:"#fff",borderRadius:18,padding:"28px 32px",width:500,maxWidth:"92vw",boxShadow:"0 20px 60px rgba(0,0,0,.15)"}} onClick={e=>e.stopPropagation()}>
                  <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:600,color:"var(--ink)",marginBottom:20}}>Edit Project</h2>
                  <div style={{marginBottom:14}}>
                    <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#8F8A83",display:"block",marginBottom:5}}>Project Name *</label>
                    <input value={editProjTitle} onChange={e=>setEditProjTitle(e.target.value)} style={{width:"100%",border:"1px solid #EAE4DC",borderRadius:8,padding:"10px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--ink)",background:"#faf7f3",outline:"none",boxSizing:"border-box"}}/>
                  </div>
                  <div style={{marginBottom:14}}>
                    <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#8F8A83",display:"block",marginBottom:5}}>Description</label>
                    <textarea value={editProjDesc} onChange={e=>setEditProjDesc(e.target.value)} style={{width:"100%",border:"1px solid #EAE4DC",borderRadius:8,padding:"10px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--ink)",background:"#faf7f3",outline:"none",resize:"none",height:72,boxSizing:"border-box"}}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:14}}>
                    <div>
                      <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#8F8A83",display:"block",marginBottom:5}}>Status</label>
                      <select value={editProjStatus} onChange={e=>setEditProjStatus(e.target.value)} style={{width:"100%",border:"1px solid #EAE4DC",borderRadius:8,padding:"9px 10px",fontFamily:"'DM Sans',sans-serif",fontSize:13,background:"#faf7f3",outline:"none"}}>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div>
                      <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#8F8A83",display:"block",marginBottom:5}}>Priority</label>
                      <select value={editProjPriority} onChange={e=>setEditProjPriority(e.target.value)} style={{width:"100%",border:"1px solid #EAE4DC",borderRadius:8,padding:"9px 10px",fontFamily:"'DM Sans',sans-serif",fontSize:13,background:"#faf7f3",outline:"none"}}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#8F8A83",display:"block",marginBottom:5}}>Start Date</label>
                      <input type="date" value={editProjStart} onChange={e=>setEditProjStart(e.target.value)} style={{width:"100%",border:"1px solid #EAE4DC",borderRadius:8,padding:"9px 10px",fontFamily:"'DM Sans',sans-serif",fontSize:13,background:"#faf7f3",outline:"none",boxSizing:"border-box"}}/>
                    </div>
                  </div>
                  <div style={{marginBottom:14}}>
                    <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#8F8A83",display:"block",marginBottom:5}}>Due Date (optional)</label>
                    <input type="date" value={editProjDue} onChange={e=>setEditProjDue(e.target.value)} style={{width:"100%",border:"1px solid #EAE4DC",borderRadius:8,padding:"9px 10px",fontFamily:"'DM Sans',sans-serif",fontSize:13,background:"#faf7f3",outline:"none",boxSizing:"border-box"}}/>
                  </div>
                  <div style={{marginBottom:20}}>
                    <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#8F8A83",display:"block",marginBottom:8}}>Icon</label>
                    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                      {PROJ_ICON_KEYS.map(k=>(
                        <button key={k} onClick={()=>setEditProjIcon(k)} style={{background:"none",border:"2px solid "+(editProjIcon===k?"#B9855E":"transparent"),borderRadius:12,padding:4,cursor:"pointer",opacity:editProjIcon===k?1:0.6}}>
                          {PROJ_ICONS[k]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                    <button onClick={()=>setShowEditProj(false)} style={{background:"none",border:"1px solid #EAE4DC",borderRadius:8,padding:"10px 20px",fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer",color:"var(--ink-light)"}}>Cancel</button>
                    <button onClick={saveEditProject} style={{background:"#B9855E",color:"#fff",border:"none",borderRadius:8,padding:"10px 22px",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,cursor:"pointer"}}>Save Changes</button>
                  </div>
                </div>
              </div>
            )}
            </div>
            );
          }

          // ── PROJECT LIST VIEW ──
          const filtered=projects.filter(p=>projTab==="all"?true:projTab==="completed"?p.status==="completed":projTab==="archived"?p.status==="archived":p.status==="active"||p.status==="planning"||p.status==="paused");
          const sorted=[...filtered].sort((a,b)=>projSort==="name"?a.title.localeCompare(b.title):projSort==="progress"?projPct(b)-projPct(a):b.id-a.id);
          const recentWins=projects.flatMap(p=>p.milestones.filter(m=>m.done).map(m=>({type:"milestone",title:m.title,project:p.title,icon:p.icon,date:m.doneDate||TODAY}))).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4);
          return(
          <div style={{padding:"0 24px 64px"}}>
            {/* Header */}
            <div className="dash-page-header">
              <div>
                <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:400,color:"var(--ink)",margin:0}}>Project Planner</h1>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:13,color:"var(--ink-light)",marginTop:3}}>Plan, track and bring your ideas to life.</div>
              </div>
              <div className="dash-search">
                <button onClick={()=>setShowNewProj(true)} style={{display:"flex",alignItems:"center",gap:6,background:"var(--ink)",color:"#f4ede3",border:"none",borderRadius:10,padding:"9px 16px",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,cursor:"pointer",flexShrink:0}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  New Project
                </button>
                {headerIcons}
              </div>
            </div>

            {/* Tabs + Sort */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div style={{display:"flex",gap:6}}>
                {[["active","Active"],["all","All Projects"],["completed","Completed"],["archived","Archived"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setProjTab(v)} className={"proj-tab "+(projTab===v?"on":"off")}>{l}</button>
                ))}
              </div>
              <select value={projSort} onChange={e=>setProjSort(e.target.value)} style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"var(--ink)",border:"1px solid var(--border)",borderRadius:8,padding:"6px 10px",background:"#fff",cursor:"pointer"}}>
                <option value="recent">Sort: Recent</option>
                <option value="name">Sort: Name</option>
                <option value="progress">Sort: Progress</option>
              </select>
            </div>

            {/* Project cards */}
            {sorted.length===0&&<div style={{textAlign:"center",padding:"48px 0",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:15,color:"var(--ink-light)"}}>No projects yet. Create your first one ✦</div>}
            {sorted.map(p=>{
              const pct=projPct(p);
              const priBg={low:"#EEF3EA",medium:"#FFF3DF",high:"#F7EDEA"};
              const priClr={low:"#6F7F55",medium:"#A8793C",high:"#C98F8F"};
              return(
              <div key={p.id} className="proj-card" onClick={()=>setSelProjId(p.id)}>
                <div style={{display:"flex",alignItems:"flex-start",gap:16}}>
                  <div style={{flexShrink:0}}>{PROJ_ICONS[p.icon]||PROJ_ICONS.laptop}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:600,color:"var(--ink)",marginBottom:3}}>{p.title}</div>
                        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#8F8A83",lineHeight:1.5,marginBottom:10}}>{p.description||"\u2014"}</div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:5,fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#8F8A83"}}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M10 7H18" stroke="#8F8A83" strokeWidth="1.8" strokeLinecap="round"/><path d="M10 12H18" stroke="#8F8A83" strokeWidth="1.8" strokeLinecap="round"/><circle cx="6" cy="7" r="1.2" fill="#8F8A83"/><circle cx="6" cy="12" r="1.2" fill="#8F8A83"/></svg>
                          {p.tasks.filter(t=>t.done).length} / {p.tasks.length} tasks
                        </div>
                        {p.dueDate&&<div style={{display:"flex",alignItems:"center",gap:5,fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#8F8A83"}}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="5" y="6.5" width="14" height="13" rx="2.5" stroke="#8F8A83" strokeWidth="1.7"/><path d="M8 4.5V8" stroke="#8F8A83" strokeWidth="1.7" strokeLinecap="round"/><path d="M16 4.5V8" stroke="#8F8A83" strokeWidth="1.7" strokeLinecap="round"/><path d="M5.5 10H18.5" stroke="#8F8A83" strokeWidth="1.7" strokeLinecap="round"/></svg>
                          Due {new Date(p.dueDate+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}
                        </div>}
                        {!p.dueDate&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#8F8A83"}}>Due Ongoing</div>}
                        <span style={{background:priBg[p.priority]||priBg.medium,color:priClr[p.priority]||priClr.medium,borderRadius:12,padding:"2px 10px",fontSize:10,fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>{p.priority.charAt(0).toUpperCase()+p.priority.slice(1)}</span>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div className="proj-prog-bar" style={{flex:1}}><div className="proj-prog-fill" style={{width:pct+"%"}}/></div>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:"#B9855E",minWidth:32,textAlign:"right"}}>{pct}%</span>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}

            {/* Recent Milestones & Wins */}
            {recentWins.length>0&&(
              <div style={{marginTop:12}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                  <span style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:600,color:"var(--ink)"}}>Recent Milestones & Wins</span>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#B9855E",cursor:"pointer"}}>View all →</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
                  {recentWins.map((w,wi)=>(
                    <div key={wi} style={{background:"#fff",border:"1px solid #EAE4DC",borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"flex-start",gap:12}}>
                      <div style={{flexShrink:0,marginTop:2,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center"}}>{PROJ_ICONS[w.icon]||null}</div>
                      <div>
                        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:"var(--ink)",marginBottom:2}}>{w.title}</div>
                        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#8F8A83"}}>{w.project}</div>
                        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#B9855E",marginTop:4}}>{new Date(w.date+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Project Modal */}
            {showNewProj&&(
              <div style={{position:"fixed",inset:0,background:"rgba(42,36,33,.45)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setShowNewProj(false)}>
                <div style={{background:"#fff",borderRadius:18,padding:"28px 32px",width:480,maxWidth:"90vw",boxShadow:"0 20px 60px rgba(0,0,0,.15)"}} onClick={e=>e.stopPropagation()}>
                  <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:600,color:"var(--ink)",marginBottom:20}}>New Project</h2>
                  <div style={{marginBottom:14}}>
                    <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#8F8A83",display:"block",marginBottom:5}}>Project Name *</label>
                    <input value={newProjTitle} onChange={e=>setNewProjTitle(e.target.value)} placeholder="e.g. Launch Productivity App" style={{width:"100%",border:"1px solid #EAE4DC",borderRadius:8,padding:"10px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--ink)",background:"#faf7f3",outline:"none",boxSizing:"border-box"}}/>
                  </div>
                  <div style={{marginBottom:14}}>
                    <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#8F8A83",display:"block",marginBottom:5}}>Description</label>
                    <textarea value={newProjDesc} onChange={e=>setNewProjDesc(e.target.value)} placeholder="What is this project about?" style={{width:"100%",border:"1px solid #EAE4DC",borderRadius:8,padding:"10px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--ink)",background:"#faf7f3",outline:"none",resize:"none",height:72,boxSizing:"border-box"}}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                    <div>
                      <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#8F8A83",display:"block",marginBottom:5}}>Priority</label>
                      <select value={newProjPriority} onChange={e=>setNewProjPriority(e.target.value)} style={{width:"100%",border:"1px solid #EAE4DC",borderRadius:8,padding:"9px 10px",fontFamily:"'DM Sans',sans-serif",fontSize:13,background:"#faf7f3",outline:"none"}}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#8F8A83",display:"block",marginBottom:5}}>Due Date (optional)</label>
                      <input type="date" value={newProjDue} onChange={e=>setNewProjDue(e.target.value)} style={{width:"100%",border:"1px solid #EAE4DC",borderRadius:8,padding:"9px 10px",fontFamily:"'DM Sans',sans-serif",fontSize:13,background:"#faf7f3",outline:"none",boxSizing:"border-box"}}/>
                    </div>
                  </div>
                  <div style={{marginBottom:20}}>
                    <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#8F8A83",display:"block",marginBottom:8}}>Icon</label>
                    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                      {PROJ_ICON_KEYS.map(k=>(
                        <button key={k} onClick={()=>setNewProjIcon(k)} style={{background:"none",border:"2px solid "+(newProjIcon===k?"#B9855E":"transparent"),borderRadius:12,padding:4,cursor:"pointer",opacity:newProjIcon===k?1:0.6}}>
                          {PROJ_ICONS[k]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                    <button onClick={()=>setShowNewProj(false)} style={{background:"none",border:"1px solid #EAE4DC",borderRadius:8,padding:"10px 20px",fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer",color:"var(--ink-light)"}}>Cancel</button>
                    <button onClick={addProject} style={{background:"#B9855E",color:"#fff",border:"none",borderRadius:8,padding:"10px 22px",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,cursor:"pointer"}}>Create Project</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          );
        })()}
      </main>
    </>
  );
}
