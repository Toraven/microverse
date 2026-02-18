import { useState, useMemo, useCallback, useEffect, useRef } from "react";

// ============================================================
// GLOBAL STYLES — Fresh Lab (light theme)
// ============================================================
(() => {
  if (document.getElementById("mv-global")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap";
  document.head.appendChild(link);
  const s = document.createElement("style");
  s.id = "mv-global";
  s.textContent = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background:#f0f9f5; color:#1e293b; font-family:'DM Sans',sans-serif; overflow-x:hidden; }
    #root { min-height:100vh; }
    ::-webkit-scrollbar { width:4px; height:4px; }
    ::-webkit-scrollbar-track { background:#e2f4ee; }
    ::-webkit-scrollbar-thumb { background:rgba(13,148,136,0.35); border-radius:2px; }

    @keyframes blobPulse {
      0%,100% { opacity:.85; transform:scale(1); }
      50%      { opacity:1;  transform:scale(1.07); }
    }
    @keyframes badPulse {
      0%,100% { opacity:.65; }
      50%     { opacity:.95; }
    }
    @keyframes fadeUp {
      from { opacity:0; transform:translateY(10px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes slideIn {
      from { opacity:0; transform:translateX(-14px); }
      to   { opacity:1; transform:translateX(0); }
    }
    @keyframes glow {
      0%,100% { filter:drop-shadow(0 0 4px currentColor); }
      50%     { filter:drop-shadow(0 0 14px currentColor); }
    }
    @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
    @keyframes barGrow { from{width:0} to{width:var(--w)} }

    .mv-card {
      background:#ffffff;
      border:1px solid rgba(13,148,136,.13);
      border-radius:12px;
      padding:16px;
      box-shadow:0 2px 12px rgba(13,148,136,.07);
    }
    .mv-btn {
      cursor:pointer; border:none; border-radius:8px;
      font-family:'DM Sans',sans-serif; font-weight:600; font-size:13px;
      padding:8px 16px; transition:all .2s ease;
      display:inline-flex; align-items:center; gap:6px;
    }
    .mv-btn:disabled { opacity:.4; cursor:not-allowed; }
    .mv-btn-primary { background:linear-gradient(135deg,#0d9488,#0891b2); color:#ffffff; }
    .mv-btn-primary:hover:not(:disabled) { filter:brightness(1.1); transform:translateY(-1px); box-shadow:0 4px 20px rgba(13,148,136,.3); }
    .mv-btn-ghost { background:transparent; color:#64748b; border:1px solid rgba(13,148,136,.2); }
    .mv-btn-ghost:hover { border-color:#0d9488; color:#0d9488; }
    .mv-btn-danger { background:rgba(248,113,113,.08); color:#dc2626; border:1px solid rgba(248,113,113,.2); }
    .mv-btn-danger:hover { background:rgba(248,113,113,.15); }
    .mv-input {
      background:#f8fffd; border:1px solid rgba(13,148,136,.2);
      border-radius:8px; color:#1e293b;
      font-family:'DM Sans',sans-serif; font-size:14px;
      padding:10px 14px; outline:none; transition:border-color .2s,box-shadow .2s; width:100%;
    }
    .mv-input:focus { border-color:#0d9488; box-shadow:0 0 0 3px rgba(13,148,136,.12); }
    .mv-input::placeholder { color:#94a3b8; }
    .mv-tab { cursor:pointer; padding:10px 18px; font-weight:500; font-size:14px; color:#64748b; border-bottom:2px solid transparent; transition:all .2s; white-space:nowrap; background:none; border-top:none; border-left:none; border-right:none; font-family:'DM Sans',sans-serif; }
    .mv-tab:hover { color:#0d9488; }
    .mv-tab.active { color:#0d9488; border-bottom-color:#0d9488; }
    .food-enter { animation:slideIn .3s ease both; }
    .dropdown { position:absolute; top:calc(100% + 4px); left:0; right:0; background:#ffffff; border:1px solid rgba(13,148,136,.18); border-radius:10px; max-height:260px; overflow-y:auto; z-index:200; box-shadow:0 8px 32px rgba(13,148,136,.12); }
    .dropdown-item { padding:10px 14px; cursor:pointer; transition:background .15s; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(13,148,136,.07); }
    .dropdown-item:last-child { border-bottom:none; }
    .dropdown-item:hover, .dropdown-item.hi { background:rgba(13,148,136,.06); }
    .tag { display:inline-block; border-radius:4px; font-size:10px; font-weight:700; letter-spacing:.05em; padding:2px 7px; text-transform:uppercase; }
    .tag-green { background:#d1fae5; color:#065f46; }
    .tag-cyan  { background:#cffafe; color:#0e7490; }
    .tag-red   { background:#fee2e2; color:#dc2626; }
    .tag-orange{ background:#ffedd5; color:#c2410c; }
    .tag-purple{ background:#ede9fe; color:#6d28d9; }
    .tag-yellow{ background:#fef3c7; color:#92400e; }
    @media(max-width:860px) { .two-col { flex-direction:column !important; } }
  `;
  document.head.appendChild(s);
})();

// ============================================================
// FOOD DATABASE  (80 products)
// icon, id, ru, en, cal, p(rotein), f(at), c(arbs), fib(er),
// pre(biotic 0-10), pro(biotic bool),
// boost[], sup(press)[], sug(ar type: simple|complex|none)
// ============================================================
const FOODS = [
  // — Vegetables —
  {ic:"🥦",id:"broc",ru:"Брокколи",en:"Broccoli",cal:34,p:2.8,f:0.4,c:7,fib:2.6,pre:7,pro:false,boost:["bif","lac","fae"],sup:["cdi"],sug:"complex"},
  {ic:"🥕",id:"carr",ru:"Морковь",en:"Carrot",cal:41,p:0.9,f:0.2,c:10,fib:2.8,pre:6,pro:false,boost:["bif","bac"],sup:["can"],sug:"complex"},
  {ic:"🌿",id:"spin",ru:"Шпинат",en:"Spinach",cal:23,p:2.9,f:0.4,c:3.6,fib:2.2,pre:6,pro:false,boost:["lac","fae"],sup:["cdi"],sug:"complex"},
  {ic:"🧅",id:"onio",ru:"Лук репчатый",en:"Onion",cal:40,p:1.1,f:0.1,c:9,fib:1.7,pre:9,pro:false,boost:["bif","lac"],sup:["cdi","eco"],sug:"complex"},
  {ic:"🧄",id:"garl",ru:"Чеснок",en:"Garlic",cal:149,p:6.4,f:0.5,c:33,fib:2.1,pre:10,pro:false,boost:["bif","lac","akk"],sup:["cdi","eco","can"],sug:"complex"},
  {ic:"🍅",id:"toma",ru:"Томат",en:"Tomato",cal:18,p:0.9,f:0.2,c:3.9,fib:1.2,pre:4,pro:false,boost:["akk","bac"],sup:[],sug:"simple"},
  {ic:"🥒",id:"cucu",ru:"Огурец",en:"Cucumber",cal:15,p:0.7,f:0.1,c:3.6,fib:0.5,pre:2,pro:false,boost:[],sup:[],sug:"simple"},
  {ic:"🫑",id:"bell",ru:"Перец болгарский",en:"Bell Pepper",cal:31,p:1,f:0.3,c:6,fib:2.1,pre:4,pro:false,boost:["akk"],sup:[],sug:"simple"},
  {ic:"🥬",id:"cabb",ru:"Капуста белокочанная",en:"Cabbage",cal:25,p:1.3,f:0.1,c:5.8,fib:2.5,pre:6,pro:false,boost:["bif","fae"],sup:["cdi"],sug:"complex"},
  {ic:"🥗",id:"sauer",ru:"Квашеная капуста",en:"Sauerkraut",cal:19,p:0.9,f:0.1,c:4.3,fib:2.9,pre:8,pro:true,boost:["lac","bif"],sup:["cdi","can"],sug:"none"},
  {ic:"🫱",id:"beet",ru:"Свёкла",en:"Beet",cal:43,p:1.6,f:0.2,c:9.6,fib:2.8,pre:6,pro:false,boost:["bif","fae"],sup:[],sug:"simple"},
  {ic:"🍠",id:"swpo",ru:"Батат",en:"Sweet Potato",cal:86,p:1.6,f:0.1,c:20,fib:3,pre:5,pro:false,boost:["bif","bac"],sup:[],sug:"complex"},
  {ic:"🌱",id:"aspa",ru:"Спаржа",en:"Asparagus",cal:20,p:2.2,f:0.1,c:3.9,fib:2.1,pre:9,pro:false,boost:["bif","lac"],sup:["cdi"],sug:"complex"},
  {ic:"🌱",id:"arti",ru:"Артишок",en:"Artichoke",cal:47,p:3.3,f:0.2,c:10.5,fib:5.4,pre:10,pro:false,boost:["bif","lac","fae"],sup:["cdi","eco"],sug:"complex"},
  {ic:"🌰",id:"jeru",ru:"Топинамбур",en:"Jerusalem Artichoke",cal:73,p:2,f:0,c:17,fib:1.6,pre:10,pro:false,boost:["bif","lac","fae"],sup:["cdi","can"],sug:"complex"},
  {ic:"🧅",id:"leek",ru:"Лук-порей",en:"Leek",cal:61,p:1.5,f:0.3,c:14,fib:1.8,pre:8,pro:false,boost:["bif","lac"],sup:["cdi"],sug:"complex"},
  {ic:"🥬",id:"kale",ru:"Кале",en:"Kale",cal:49,p:4.3,f:0.9,c:9,fib:3.6,pre:8,pro:false,boost:["bif","lac","akk"],sup:["cdi"],sug:"complex"},
  {ic:"🎃",id:"pump",ru:"Тыква",en:"Pumpkin",cal:26,p:1,f:0.1,c:6.5,fib:0.5,pre:4,pro:false,boost:["bac"],sup:[],sug:"complex"},
  {ic:"🥔",id:"pota",ru:"Картофель",en:"Potato",cal:77,p:2,f:0.1,c:17,fib:2.2,pre:4,pro:false,boost:["bac"],sup:[],sug:"complex"},
  {ic:"🍆",id:"eggp",ru:"Баклажан",en:"Eggplant",cal:25,p:1,f:0.2,c:5.9,fib:3,pre:5,pro:false,boost:["fae"],sup:[],sug:"complex"},

  // — Fruits —
  {ic:"🍎",id:"appl",ru:"Яблоко",en:"Apple",cal:52,p:0.3,f:0.2,c:14,fib:2.4,pre:7,pro:false,boost:["bif","akk"],sup:["can"],sug:"simple"},
  {ic:"🍌",id:"bana",ru:"Банан",en:"Banana",cal:89,p:1.1,f:0.3,c:23,fib:2.6,pre:6,pro:false,boost:["bif","lac"],sup:[],sug:"simple"},
  {ic:"🍐",id:"pear",ru:"Груша",en:"Pear",cal:57,p:0.4,f:0.1,c:15,fib:3.1,pre:7,pro:false,boost:["bif","fae"],sup:[],sug:"simple"},
  {ic:"🫐",id:"blue",ru:"Черника",en:"Blueberry",cal:57,p:0.7,f:0.3,c:14,fib:2.4,pre:8,pro:false,boost:["akk","bif","lac"],sup:["cdi","eco"],sug:"simple"},
  {ic:"🍓",id:"stra",ru:"Клубника",en:"Strawberry",cal:32,p:0.7,f:0.3,c:7.7,fib:2,pre:6,pro:false,boost:["akk","bif"],sup:[],sug:"simple"},
  {ic:"🍒",id:"rasp",ru:"Малина",en:"Raspberry",cal:52,p:1.2,f:0.7,c:12,fib:6.5,pre:8,pro:false,boost:["bif","fae","akk"],sup:["can"],sug:"simple"},
  {ic:"🍊",id:"oran",ru:"Апельсин",en:"Orange",cal:47,p:0.9,f:0.1,c:12,fib:2.4,pre:5,pro:false,boost:["akk","bac"],sup:[],sug:"simple"},
  {ic:"🥑",id:"avoc",ru:"Авокадо",en:"Avocado",cal:160,p:2,f:15,c:9,fib:6.7,pre:5,pro:false,boost:["akk","fae"],sup:[],sug:"none"},
  {ic:"🍎",id:"pome",ru:"Гранат",en:"Pomegranate",cal:83,p:1.7,f:1.2,c:19,fib:4,pre:9,pro:false,boost:["akk","lac","fae"],sup:["cdi","eco"],sug:"simple"},
  {ic:"🥭",id:"mang",ru:"Манго",en:"Mango",cal:60,p:0.8,f:0.4,c:15,fib:1.6,pre:4,pro:false,boost:["bac"],sup:[],sug:"simple"},
  {ic:"🥝",id:"kiwi",ru:"Киви",en:"Kiwi",cal:61,p:1.1,f:0.5,c:15,fib:3,pre:6,pro:false,boost:["bif","lac"],sup:[],sug:"simple"},
  {ic:"🫐",id:"prun",ru:"Чернослив",en:"Prune",cal:240,p:2.2,f:0.4,c:64,fib:7,pre:7,pro:false,boost:["bif","lac"],sup:["cdi"],sug:"simple"},

  // — Grains —
  {ic:"🌾",id:"oats",ru:"Овсянка",en:"Oatmeal",cal:71,p:2.5,f:1.5,c:12,fib:1.7,pre:8,pro:false,boost:["bif","lac","fae"],sup:["cdi"],sug:"complex"},
  {ic:"🍞",id:"whtb",ru:"Хлеб цельнозерновой",en:"Whole Wheat Bread",cal:247,p:9,f:3.5,c:46,fib:6.8,pre:7,pro:false,boost:["bif","fae"],sup:["cdi"],sug:"complex"},
  {ic:"🍞",id:"whib",ru:"Хлеб белый",en:"White Bread",cal:265,p:7.6,f:1.6,c:53,fib:1.9,pre:1,pro:false,boost:[],sup:["fae"],sug:"complex"},
  {ic:"🌾",id:"buck",ru:"Гречка",en:"Buckwheat",cal:92,p:3.4,f:0.9,c:20,fib:2.7,pre:5,pro:false,boost:["bif","fae"],sup:[],sug:"complex"},
  {ic:"🍞",id:"ryeb",ru:"Ржаной хлеб",en:"Rye Bread",cal:259,p:8.5,f:3.3,c:48,fib:6.2,pre:7,pro:false,boost:["bif","lac","fae"],sup:["cdi"],sug:"complex"},
  {ic:"🌾",id:"quin",ru:"Киноа",en:"Quinoa",cal:120,p:4.4,f:1.9,c:21,fib:2.8,pre:5,pro:false,boost:["bif","fae"],sup:[],sug:"complex"},
  {ic:"🌾",id:"barl",ru:"Ячмень",en:"Barley",cal:123,p:2.3,f:0.4,c:28,fib:3.8,pre:9,pro:false,boost:["bif","lac","fae"],sup:["cdi"],sug:"complex"},
  {ic:"🍚",id:"bric",ru:"Бурый рис",en:"Brown Rice",cal:111,p:2.6,f:0.9,c:23,fib:1.8,pre:4,pro:false,boost:["bac","fae"],sup:[],sug:"complex"},
  {ic:"🍚",id:"wric",ru:"Белый рис",en:"White Rice",cal:130,p:2.7,f:0.3,c:28,fib:0.4,pre:1,pro:false,boost:[],sup:[],sug:"complex"},

  // — Legumes —
  {ic:"🫘",id:"lent",ru:"Чечевица",en:"Lentils",cal:116,p:9,f:0.4,c:20,fib:7.9,pre:8,pro:false,boost:["bif","fae","bac"],sup:["cdi"],sug:"complex"},
  {ic:"🫘",id:"chic",ru:"Нут",en:"Chickpeas",cal:164,p:8.9,f:2.6,c:27,fib:7.6,pre:8,pro:false,boost:["bif","lac","fae"],sup:["cdi"],sug:"complex"},
  {ic:"🫘",id:"kbea",ru:"Красная фасоль",en:"Kidney Beans",cal:127,p:8.7,f:0.5,c:22.8,fib:6.4,pre:7,pro:false,boost:["bif","fae"],sup:["cdi"],sug:"complex"},
  {ic:"🫘",id:"blbe",ru:"Чёрная фасоль",en:"Black Beans",cal:132,p:8.9,f:0.5,c:23.7,fib:8.7,pre:8,pro:false,boost:["bif","fae","bac"],sup:["cdi"],sug:"complex"},
  {ic:"🟢",id:"peas",ru:"Зелёный горошек",en:"Green Peas",cal:81,p:5.4,f:0.4,c:14,fib:5.7,pre:7,pro:false,boost:["bif","fae"],sup:[],sug:"complex"},

  // — Fermented / Probiotic —
  {ic:"🥛",id:"kefr",ru:"Кефир",en:"Kefir",cal:52,p:3.5,f:1,c:4.8,fib:0,pre:5,pro:true,boost:["lac","bif"],sup:["cdi","can"],sug:"none"},
  {ic:"🍶",id:"yogu",ru:"Йогурт натуральный",en:"Plain Yogurt",cal:61,p:3.5,f:3.3,c:4.7,fib:0,pre:4,pro:true,boost:["lac","bif"],sup:["cdi","can"],sug:"none"},
  {ic:"🧀",id:"cott",ru:"Творог",en:"Cottage Cheese",cal:98,p:11,f:4.3,c:3.4,fib:0,pre:2,pro:true,boost:["lac"],sup:[],sug:"none"},
  {ic:"🌶️",id:"kimchi",ru:"Кимчи",en:"Kimchi",cal:15,p:1.1,f:0.5,c:2.4,fib:1.6,pre:7,pro:true,boost:["lac","bif"],sup:["cdi","eco","can"],sug:"none"},
  {ic:"🍜",id:"miso",ru:"Мисо-паста",en:"Miso Paste",cal:199,p:11.7,f:6,c:27,fib:5.4,pre:6,pro:true,boost:["lac","bif"],sup:["cdi"],sug:"none"},
  {ic:"🍱",id:"temp",ru:"Темпе",en:"Tempeh",cal:193,p:19,f:11,c:9,fib:9,pre:6,pro:true,boost:["bif","lac"],sup:["cdi"],sug:"none"},
  {ic:"🍵",id:"kombuc",ru:"Комбуча",en:"Kombucha",cal:30,p:0,f:0,c:7,fib:0,pre:4,pro:true,boost:["lac","akk"],sup:["can"],sug:"simple"},

  // — Protein —
  {ic:"🍗",id:"chik",ru:"Куриная грудка",en:"Chicken Breast",cal:165,p:31,f:3.6,c:0,fib:0,pre:0,pro:false,boost:[],sup:[],sug:"none"},
  {ic:"🥩",id:"beef",ru:"Говядина",en:"Beef",cal:250,p:26,f:17,c:0,fib:0,pre:0,pro:false,boost:["bac"],sup:["bif"],sug:"none"},
  {ic:"🐟",id:"salm",ru:"Лосось",en:"Salmon",cal:208,p:20,f:13,c:0,fib:0,pre:0,pro:false,boost:["akk","fae"],sup:[],sug:"none"},
  {ic:"🥚",id:"egg",ru:"Яйцо",en:"Egg",cal:155,p:13,f:11,c:1.1,fib:0,pre:1,pro:false,boost:[],sup:[],sug:"none"},
  {ic:"🐟",id:"tuna",ru:"Тунец",en:"Tuna",cal:144,p:30,f:1,c:0,fib:0,pre:0,pro:false,boost:[],sup:[],sug:"none"},

  // — Nuts & Seeds —
  {ic:"🥜",id:"almo",ru:"Миндаль",en:"Almonds",cal:579,p:21,f:50,c:22,fib:12.5,pre:7,pro:false,boost:["bif","lac","akk"],sup:[],sug:"none"},
  {ic:"🥜",id:"waln",ru:"Грецкий орех",en:"Walnuts",cal:654,p:15,f:65,c:14,fib:6.7,pre:7,pro:false,boost:["akk","bif","lac"],sup:[],sug:"none"},
  {ic:"🌰",id:"flax",ru:"Льняное семя",en:"Flaxseed",cal:534,p:18,f:42,c:29,fib:27.3,pre:8,pro:false,boost:["bif","lac","fae"],sup:["cdi"],sug:"none"},
  {ic:"⚫",id:"chia",ru:"Семена чиа",en:"Chia Seeds",cal:486,p:17,f:31,c:42,fib:34.4,pre:9,pro:false,boost:["bif","lac","fae","akk"],sup:["cdi"],sug:"none"},
  {ic:"🌰",id:"sunf",ru:"Семечки подсолнуха",en:"Sunflower Seeds",cal:584,p:21,f:51,c:20,fib:8.6,pre:5,pro:false,boost:["fae"],sup:[],sug:"none"},

  // — Unhealthy —
  {ic:"🍬",id:"suga",ru:"Сахар белый",en:"White Sugar",cal:387,p:0,f:0,c:100,fib:0,pre:0,pro:false,boost:["cdi","eco","can"],sup:["bif","lac","fae","akk"],sug:"simple"},
  {ic:"🍫",id:"dcho",ru:"Тёмный шоколад",en:"Dark Chocolate",cal:546,p:5,f:31,c:60,fib:7,pre:6,pro:false,boost:["akk","bif"],sup:[],sug:"simple"},
  {ic:"🍫",id:"mcho",ru:"Молочный шоколад",en:"Milk Chocolate",cal:535,p:7.6,f:29.7,c:59,fib:1.5,pre:1,pro:false,boost:["can"],sup:["fae"],sug:"simple"},
  {ic:"🥔",id:"chips",ru:"Чипсы",en:"Chips",cal:536,p:7,f:35,c:53,fib:4.4,pre:0,pro:false,boost:["cdi","eco"],sup:["bif","lac","fae"],sug:"complex"},
  {ic:"🥤",id:"cola",ru:"Кола",en:"Cola",cal:37,p:0,f:0,c:9.6,fib:0,pre:0,pro:false,boost:["cdi","can"],sup:["bif","lac"],sug:"simple"},
  {ic:"🍺",id:"alco",ru:"Алкоголь",en:"Alcohol",cal:250,p:0,f:0,c:10,fib:0,pre:0,pro:false,boost:["cdi","eco"],sup:["bif","lac","akk","fae"],sug:"simple"},
  {ic:"🍔",id:"fchee",ru:"Фастфуд",en:"Fast Food",cal:295,p:17,f:14,c:27,fib:1.2,pre:0,pro:false,boost:["cdi","eco"],sup:["bif","lac","fae","akk"],sug:"complex"},
  {ic:"🍕",id:"pizza",ru:"Пицца",en:"Pizza",cal:266,p:11,f:10,c:33,fib:2.3,pre:1,pro:false,boost:["cdi"],sup:["fae"],sug:"complex"},

  // — Oils & Drinks —
  {ic:"🫒",id:"oliv",ru:"Оливковое масло",en:"Olive Oil",cal:884,p:0,f:100,c:0,fib:0,pre:3,pro:false,boost:["akk","bif"],sup:[],sug:"none"},
  {ic:"🍵",id:"gree",ru:"Зелёный чай",en:"Green Tea",cal:1,p:0,f:0,c:0,fib:0,pre:4,pro:false,boost:["akk","bif"],sup:["cdi","can"],sug:"none"},
  {ic:"☕",id:"coff",ru:"Кофе чёрный",en:"Black Coffee",cal:2,p:0.3,f:0,c:0,fib:0,pre:3,pro:false,boost:["akk"],sup:[],sug:"none"},
  {ic:"🍯",id:"honey",ru:"Мёд",en:"Honey",cal:304,p:0.3,f:0,c:82,fib:0.2,pre:3,pro:false,boost:["lac"],sup:["cdi"],sug:"simple"},
  {ic:"🥛",id:"milk",ru:"Молоко",en:"Milk",cal:61,p:3.2,f:3.3,c:4.8,fib:0,pre:2,pro:false,boost:["lac"],sup:[],sug:"simple"},
  {ic:"🧀",id:"chee",ru:"Сыр твёрдый",en:"Hard Cheese",cal:402,p:25,f:33,c:1.3,fib:0,pre:0,pro:false,boost:[],sup:[],sug:"none"},

  // — Spices & Herbs —
  {ic:"🌿",id:"turm",ru:"Куркума",en:"Turmeric",cal:354,p:8,f:10,c:65,fib:21,pre:7,pro:false,boost:["akk","bif"],sup:["cdi","can","eco"],sug:"complex"},
  {ic:"🫚",id:"ging",ru:"Имбирь",en:"Ginger",cal:80,p:1.8,f:0.8,c:18,fib:2,pre:6,pro:false,boost:["akk","lac"],sup:["cdi","eco"],sug:"complex"},
  {ic:"🫙",id:"cinn",ru:"Корица",en:"Cinnamon",cal:247,p:4,f:1.2,c:81,fib:53,pre:7,pro:false,boost:["bif","lac"],sup:["cdi","can"],sug:"complex"},
  {ic:"🌿",id:"oreg",ru:"Орегано",en:"Oregano",cal:265,p:9,f:4.3,c:68,fib:43,pre:6,pro:false,boost:["bif","lac"],sup:["cdi","eco"],sug:"complex"},
  {ic:"🌿",id:"thym",ru:"Тимьян",en:"Thyme",cal:101,p:5.6,f:1.7,c:24,fib:14,pre:6,pro:false,boost:["bif"],sup:["cdi"],sug:"complex"},
  {ic:"🌿",id:"rosm",ru:"Розмарин",en:"Rosemary",cal:131,p:3.3,f:5.9,c:21,fib:14,pre:5,pro:false,boost:["akk","bif"],sup:["cdi"],sug:"complex"},
  {ic:"🌿",id:"pars",ru:"Петрушка",en:"Parsley",cal:36,p:3,f:0.8,c:6.3,fib:3.3,pre:5,pro:false,boost:["bif","lac"],sup:[],sug:"complex"},
  {ic:"🌿",id:"dill",ru:"Укроп",en:"Dill",cal:43,p:3.5,f:1.1,c:7,fib:2.1,pre:4,pro:false,boost:["bif"],sup:[],sug:"complex"},
  {ic:"🌿",id:"basi",ru:"Базилик",en:"Basil",cal:23,p:3.2,f:0.6,c:2.7,fib:1.6,pre:4,pro:false,boost:["bif","lac"],sup:["cdi"],sug:"complex"},
  {ic:"🌶️",id:"chil",ru:"Перец чили",en:"Chili Pepper",cal:40,p:1.9,f:0.4,c:8.8,fib:1.5,pre:5,pro:false,boost:["bif","akk"],sup:["cdi","can"],sug:"simple"},
  {ic:"🌿",id:"mint",ru:"Мята",en:"Mint",cal:70,p:3.8,f:0.9,c:15,fib:8,pre:5,pro:false,boost:["lac","bif"],sup:["cdi"],sug:"complex"},
  {ic:"🫙",id:"cumi",ru:"Зира (кумин)",en:"Cumin",cal:375,p:18,f:22,c:44,fib:11,pre:6,pro:false,boost:["bif","lac"],sup:["cdi","eco"],sug:"complex"},

  // — Mushrooms —
  {ic:"🍄",id:"shii",ru:"Шиитаке",en:"Shiitake",cal:34,p:2.2,f:0.5,c:6.8,fib:2.5,pre:8,pro:false,boost:["bif","akk","fae"],sup:["cdi","can"],sug:"complex"},
  {ic:"🍄",id:"oymsh",ru:"Вешенки",en:"Oyster Mushrooms",cal:33,p:3.3,f:0.4,c:6.1,fib:2.3,pre:7,pro:false,boost:["bif","fae"],sup:["cdi"],sug:"complex"},
  {ic:"🍄",id:"chmp",ru:"Шампиньоны",en:"Button Mushrooms",cal:22,p:3.1,f:0.3,c:3.3,fib:1,pre:5,pro:false,boost:["bif","fae"],sup:[],sug:"complex"},
  {ic:"🍄",id:"reis",ru:"Рейши",en:"Reishi",cal:59,p:7,f:1.8,c:75,fib:26,pre:9,pro:false,boost:["bif","akk","fae"],sup:["cdi","can","eco"],sug:"complex"},
  {ic:"🍄",id:"chan",ru:"Лисички",en:"Chanterelles",cal:38,p:1.5,f:0.5,c:6.9,fib:3.8,pre:7,pro:false,boost:["bif","fae"],sup:[],sug:"complex"},
  {ic:"🍄",id:"porc",ru:"Белые грибы",en:"Porcini",cal:27,p:3.7,f:0.5,c:3.3,fib:2.3,pre:7,pro:false,boost:["bif","fae","akk"],sup:["cdi"],sug:"complex"},
  {ic:"🍄",id:"enok",ru:"Эноки",en:"Enoki",cal:37,p:2.7,f:0.3,c:7.6,fib:2.7,pre:7,pro:false,boost:["bif","fae"],sup:[],sug:"complex"},
  {ic:"🍄",id:"cord",ru:"Кордицепс",en:"Cordyceps",cal:60,p:8,f:0.5,c:60,fib:8,pre:8,pro:false,boost:["akk","bif","fae"],sup:["cdi","can"],sug:"complex"},

  // — Seafood —
  {ic:"🐟",id:"mack",ru:"Скумбрия",en:"Mackerel",cal:205,p:19,f:14,c:0,fib:0,pre:0,pro:false,boost:["akk","fae"],sup:[],sug:"none"},
  {ic:"🐟",id:"herr",ru:"Сельдь",en:"Herring",cal:158,p:17.7,f:9.7,c:0,fib:0,pre:0,pro:false,boost:["akk","fae"],sup:[],sug:"none"},
  {ic:"🦪",id:"musl",ru:"Мидии",en:"Mussels",cal:86,p:12,f:2.2,c:3.7,fib:0,pre:1,pro:false,boost:["bac"],sup:[],sug:"none"},
  {ic:"🦐",id:"shmp",ru:"Креветки",en:"Shrimp",cal:99,p:24,f:0.3,c:0.2,fib:0,pre:0,pro:false,boost:[],sup:[],sug:"none"},
  {ic:"🦪",id:"oyst",ru:"Устрицы",en:"Oysters",cal:69,p:7,f:2.5,c:4.7,fib:0,pre:2,pro:false,boost:["bac","fae"],sup:[],sug:"none"},
  {ic:"🦑",id:"squi",ru:"Кальмар",en:"Squid",cal:92,p:15.6,f:1.4,c:3.1,fib:0,pre:0,pro:false,boost:[],sup:[],sug:"none"},
  {ic:"🐟",id:"anch",ru:"Анчоусы",en:"Anchovies",cal:131,p:20,f:4.8,c:0,fib:0,pre:0,pro:false,boost:["fae"],sup:[],sug:"none"},
  {ic:"🐟",id:"trut",ru:"Форель",en:"Trout",cal:148,p:20.8,f:6.6,c:0,fib:0,pre:0,pro:false,boost:["akk","fae"],sup:[],sug:"none"},
  {ic:"🐟",id:"codf",ru:"Треска",en:"Cod",cal:82,p:18,f:0.7,c:0,fib:0,pre:0,pro:false,boost:[],sup:[],sug:"none"},
  {ic:"🐟",id:"sard",ru:"Сардины",en:"Sardines",cal:208,p:25,f:11.5,c:0,fib:0,pre:0,pro:false,boost:["akk","fae"],sup:[],sug:"none"},
  {ic:"🦀",id:"crab",ru:"Краб",en:"Crab",cal:97,p:19,f:1.5,c:0,fib:0,pre:0,pro:false,boost:[],sup:[],sug:"none"},
  {ic:"🌿",id:"nori",ru:"Водоросли нори",en:"Nori Seaweed",cal:35,p:5.8,f:0.3,c:5.1,fib:1.3,pre:6,pro:false,boost:["bif","akk","fae"],sup:["cdi"],sug:"none"},

  // — More Fermented —
  {ic:"🫘",id:"nato",ru:"Натто",en:"Natto",cal:211,p:17.7,f:11,c:14.4,fib:5.4,pre:7,pro:true,boost:["bif","lac","fae"],sup:["cdi","can"],sug:"complex"},
  {ic:"🥛",id:"ryaz",ru:"Ряженка",en:"Ryazhenka",cal:54,p:2.8,f:2.5,c:4.6,fib:0,pre:4,pro:true,boost:["lac","bif"],sup:["cdi"],sug:"none"},
  {ic:"🥛",id:"ayra",ru:"Айран",en:"Ayran",cal:22,p:1.4,f:1,c:2.3,fib:0,pre:3,pro:true,boost:["lac"],sup:[],sug:"none"},
  {ic:"🥒",id:"pick",ru:"Маринованные огурцы",en:"Pickled Cucumbers",cal:11,p:0.6,f:0.1,c:2.3,fib:0.5,pre:3,pro:true,boost:["lac"],sup:[],sug:"none"},
  {ic:"🍺",id:"kvas",ru:"Квас",en:"Kvass",cal:27,p:0.2,f:0,c:5.2,fib:0,pre:3,pro:true,boost:["lac","bif"],sup:[],sug:"simple"},
  {ic:"🫙",id:"acvi",ru:"Яблочный уксус",en:"Apple Cider Vinegar",cal:22,p:0,f:0,c:0.9,fib:0,pre:2,pro:true,boost:["akk","lac"],sup:["cdi","can"],sug:"none"},
  {ic:"🍜",id:"soyw",ru:"Соевый соус натуральный",en:"Natural Soy Sauce",cal:60,p:5.6,f:0,c:5.6,fib:0.8,pre:2,pro:false,boost:["bif"],sup:[],sug:"none"},
  {ic:"⬜",id:"tofu",ru:"Тофу",en:"Tofu",cal:76,p:8,f:4.8,c:1.9,fib:0.3,pre:3,pro:false,boost:["bif","fae"],sup:[],sug:"none"},

  // — More Vegetables —
  {ic:"🥦",id:"cali",ru:"Цветная капуста",en:"Cauliflower",cal:25,p:1.9,f:0.3,c:5,fib:2,pre:5,pro:false,boost:["bif","fae"],sup:["cdi"],sug:"complex"},
  {ic:"🥦",id:"brsp",ru:"Брюссельская капуста",en:"Brussels Sprouts",cal:43,p:3.4,f:0.3,c:8.9,fib:3.8,pre:7,pro:false,boost:["bif","lac","fae"],sup:["cdi"],sug:"complex"},
  {ic:"🥬",id:"cele",ru:"Сельдерей",en:"Celery",cal:16,p:0.7,f:0.2,c:3,fib:1.6,pre:5,pro:false,boost:["bif","akk"],sup:[],sug:"complex"},
  {ic:"🌱",id:"radi",ru:"Редис",en:"Radish",cal:16,p:0.7,f:0.1,c:3.4,fib:1.6,pre:4,pro:false,boost:["fae"],sup:[],sug:"simple"},
  {ic:"🌽",id:"corn",ru:"Кукуруза",en:"Corn",cal:86,p:3.3,f:1.4,c:19,fib:2.7,pre:4,pro:false,boost:["bac","fae"],sup:[],sug:"simple"},
  {ic:"🫘",id:"grbe",ru:"Стручковая фасоль",en:"Green Beans",cal:31,p:1.8,f:0.1,c:7,fib:2.7,pre:5,pro:false,boost:["bif","fae"],sup:[],sug:"complex"},
  {ic:"🌿",id:"kelp",ru:"Ламинария",en:"Kelp (Seaweed)",cal:43,p:1.7,f:0.6,c:9.6,fib:1.3,pre:8,pro:false,boost:["bif","akk","fae"],sup:["cdi","can"],sug:"complex"},
  {ic:"🥒",id:"zucc",ru:"Кабачок",en:"Zucchini",cal:17,p:1.2,f:0.3,c:3.1,fib:1,pre:3,pro:false,boost:["fae"],sup:[],sug:"simple"},
  {ic:"🌱",id:"prsn",ru:"Пастернак",en:"Parsnip",cal:75,p:1.2,f:0.3,c:18,fib:4.9,pre:7,pro:false,boost:["bif","lac"],sup:[],sug:"complex"},
  {ic:"🥬",id:"swch",ru:"Мангольд",en:"Swiss Chard",cal:19,p:1.8,f:0.2,c:3.7,fib:1.6,pre:5,pro:false,boost:["bif","fae"],sup:[],sug:"complex"},
  {ic:"🥬",id:"bokc",ru:"Бок-чой",en:"Bok Choy",cal:13,p:1.5,f:0.2,c:2.2,fib:1,pre:5,pro:false,boost:["bif","fae"],sup:[],sug:"complex"},
  {ic:"🟣",id:"turn",ru:"Репа",en:"Turnip",cal:28,p:0.9,f:0.1,c:6.4,fib:1.8,pre:5,pro:false,boost:["bif"],sup:[],sug:"complex"},

  // — More Fruits —
  {ic:"🫐",id:"figs",ru:"Инжир",en:"Figs",cal:74,p:0.75,f:0.3,c:19.2,fib:2.9,pre:6,pro:false,boost:["bif","fae"],sup:[],sug:"simple"},
  {ic:"🟤",id:"date",ru:"Финики",en:"Dates",cal:282,p:2.5,f:0.4,c:75,fib:8,pre:6,pro:false,boost:["bif","lac"],sup:[],sug:"simple"},
  {ic:"🌴",id:"papa",ru:"Папайя",en:"Papaya",cal:43,p:0.5,f:0.3,c:11,fib:1.7,pre:5,pro:false,boost:["bif","akk"],sup:[],sug:"simple"},
  {ic:"🍉",id:"watr",ru:"Арбуз",en:"Watermelon",cal:30,p:0.6,f:0.2,c:7.6,fib:0.4,pre:2,pro:false,boost:[],sup:[],sug:"simple"},
  {ic:"🍑",id:"plum",ru:"Слива",en:"Plum",cal:46,p:0.7,f:0.3,c:11.4,fib:1.4,pre:5,pro:false,boost:["bif","fae"],sup:[],sug:"simple"},
  {ic:"🍒",id:"cher",ru:"Вишня",en:"Cherry",cal:50,p:1,f:0.3,c:12,fib:1.6,pre:5,pro:false,boost:["akk","bif"],sup:[],sug:"simple"},
  {ic:"🍑",id:"apri",ru:"Абрикос",en:"Apricot",cal:48,p:1.4,f:0.4,c:11,fib:2,pre:5,pro:false,boost:["bif","fae"],sup:[],sug:"simple"},
  {ic:"🍇",id:"grap",ru:"Виноград",en:"Grapes",cal:69,p:0.7,f:0.2,c:18,fib:0.9,pre:3,pro:false,boost:["akk"],sup:[],sug:"simple"},
  {ic:"🍋",id:"lemo",ru:"Лимон",en:"Lemon",cal:29,p:1.1,f:0.3,c:9.3,fib:2.8,pre:5,pro:false,boost:["akk","lac"],sup:["cdi","can"],sug:"simple"},
  {ic:"🍍",id:"pine",ru:"Ананас",en:"Pineapple",cal:50,p:0.5,f:0.1,c:13.1,fib:1.4,pre:4,pro:false,boost:["bif","bac"],sup:[],sug:"simple"},
  {ic:"🥥",id:"coco",ru:"Кокос",en:"Coconut",cal:354,p:3.3,f:33.5,c:15.2,fib:9,pre:5,pro:false,boost:["bif","fae"],sup:["can"],sug:"simple"},
  {ic:"🍈",id:"melo",ru:"Дыня",en:"Melon",cal:34,p:0.8,f:0.2,c:8.2,fib:0.9,pre:2,pro:false,boost:[],sup:[],sug:"simple"},

  // — More Grains —
  {ic:"🌾",id:"mill",ru:"Пшено",en:"Millet",cal:378,p:11,f:4.2,c:73,fib:8.5,pre:6,pro:false,boost:["bif","fae"],sup:[],sug:"complex"},
  {ic:"🌾",id:"amar",ru:"Амарант",en:"Amaranth",cal:371,p:13.6,f:7,c:65,fib:6.7,pre:6,pro:false,boost:["bif","fae","lac"],sup:[],sug:"complex"},
  {ic:"🌾",id:"spel",ru:"Спельта",en:"Spelt",cal:338,p:14.6,f:2.4,c:70,fib:10.7,pre:8,pro:false,boost:["bif","lac","fae"],sup:["cdi"],sug:"complex"},
  {ic:"🌾",id:"teff",ru:"Тефф",en:"Teff",cal:367,p:13.3,f:2.4,c:73,fib:8,pre:7,pro:false,boost:["bif","fae"],sup:[],sug:"complex"},
  {ic:"🌾",id:"wbra",ru:"Пшеничные отруби",en:"Wheat Bran",cal:216,p:15.5,f:4.3,c:64.5,fib:42.8,pre:10,pro:false,boost:["bif","lac","fae","akk"],sup:["cdi"],sug:"complex"},
  {ic:"🌽",id:"crmm",ru:"Кукурузная крупа",en:"Cornmeal",cal:362,p:8.2,f:3.6,c:74,fib:7.3,pre:4,pro:false,boost:["bac"],sup:[],sug:"complex"},
  {ic:"🌾",id:"pbar",ru:"Перловка",en:"Pearl Barley",cal:123,p:2.3,f:0.4,c:28,fib:3.8,pre:8,pro:false,boost:["bif","lac","fae"],sup:["cdi"],sug:"complex"},
  {ic:"🍚",id:"wild",ru:"Дикий рис",en:"Wild Rice",cal:101,p:4,f:0.3,c:21,fib:1.8,pre:4,pro:false,boost:["bac","fae"],sup:[],sug:"complex"},

  // — More Nuts & Seeds —
  {ic:"🥜",id:"cash",ru:"Кешью",en:"Cashews",cal:553,p:18.2,f:43.9,c:30.2,fib:3.3,pre:3,pro:false,boost:["fae"],sup:[],sug:"none"},
  {ic:"🟢",id:"pist",ru:"Фисташки",en:"Pistachios",cal:562,p:20.3,f:45.4,c:27.5,fib:10.3,pre:6,pro:false,boost:["bif","lac","fae"],sup:[],sug:"none"},
  {ic:"🟤",id:"psee",ru:"Тыквенные семечки",en:"Pumpkin Seeds",cal:559,p:30,f:49,c:10.7,fib:6,pre:6,pro:false,boost:["fae","bif"],sup:["can"],sug:"none"},
  {ic:"⚪",id:"sesa",ru:"Кунжут",en:"Sesame Seeds",cal:573,p:17.7,f:49.7,c:23.4,fib:11.8,pre:6,pro:false,boost:["bif","lac","fae"],sup:[],sug:"none"},
  {ic:"🥜",id:"pean",ru:"Арахис",en:"Peanuts",cal:567,p:25.8,f:49.2,c:16.1,fib:8.5,pre:5,pro:false,boost:["bif","fae"],sup:[],sug:"none"},
  {ic:"🌰",id:"braz",ru:"Бразильский орех",en:"Brazil Nuts",cal:659,p:14.3,f:67.1,c:12.3,fib:7.5,pre:5,pro:false,boost:["akk","fae"],sup:[],sug:"none"},
  {ic:"🌿",id:"hemp",ru:"Конопляные семена",en:"Hemp Seeds",cal:553,p:31.6,f:48.8,c:8.7,fib:4,pre:5,pro:false,boost:["fae","akk"],sup:[],sug:"none"},
  {ic:"🌰",id:"cedr",ru:"Кедровый орех",en:"Pine Nuts",cal:673,p:13.7,f:68.4,c:13.1,fib:3.7,pre:4,pro:false,boost:["fae"],sup:[],sug:"none"},

  // — More Dairy —
  {ic:"🥛",id:"scre",ru:"Сметана",en:"Sour Cream",cal:198,p:2.5,f:20,c:3.7,fib:0,pre:1,pro:false,boost:[],sup:[],sug:"none"},
  {ic:"🍶",id:"gryg",ru:"Греческий йогурт",en:"Greek Yogurt",cal:97,p:9,f:5,c:3.6,fib:0,pre:5,pro:true,boost:["lac","bif"],sup:["cdi","can"],sug:"none"},
  {ic:"🧀",id:"parm",ru:"Пармезан",en:"Parmesan",cal:431,p:38,f:29,c:3.2,fib:0,pre:0,pro:false,boost:[],sup:[],sug:"none"},
  {ic:"🧀",id:"rico",ru:"Рикотта",en:"Ricotta",cal:174,p:11.3,f:13,c:3,fib:0,pre:1,pro:false,boost:["lac"],sup:[],sug:"none"},
  {ic:"🧈",id:"butr",ru:"Масло сливочное",en:"Butter",cal:717,p:0.9,f:81,c:0.1,fib:0,pre:0,pro:false,boost:[],sup:["bif","fae"],sug:"none"},
  {ic:"🥛",id:"crea",ru:"Сливки 35%",en:"Heavy Cream",cal:337,p:2.5,f:35,c:3,fib:0,pre:0,pro:false,boost:[],sup:[],sug:"none"},

  // — More Oils & Drinks —
  {ic:"🥥",id:"coil",ru:"Кокосовое масло",en:"Coconut Oil",cal:892,p:0,f:99,c:0,fib:0,pre:1,pro:false,boost:[],sup:["cdi","eco"],sug:"none"},
  {ic:"🌱",id:"floi",ru:"Льняное масло",en:"Flaxseed Oil",cal:884,p:0,f:100,c:0,fib:0,pre:2,pro:false,boost:["bif","fae","akk"],sup:[],sug:"none"},
  {ic:"🍵",id:"gite",ru:"Имбирный чай",en:"Ginger Tea",cal:5,p:0,f:0,c:1.2,fib:0.1,pre:3,pro:false,boost:["akk","lac"],sup:["cdi","eco"],sug:"none"},
  {ic:"🌸",id:"romt",ru:"Ромашковый чай",en:"Chamomile Tea",cal:1,p:0,f:0,c:0.2,fib:0,pre:2,pro:false,boost:["bif","lac"],sup:["cdi"],sug:"none"},
  {ic:"🍫",id:"caca",ru:"Какао (порошок)",en:"Cocoa Powder",cal:228,p:19.6,f:13.7,c:57.9,fib:33.2,pre:7,pro:false,boost:["akk","bif","fae"],sup:[],sug:"complex"},
  {ic:"🥥",id:"cwat",ru:"Кокосовая вода",en:"Coconut Water",cal:19,p:0.7,f:0.2,c:3.7,fib:1.1,pre:3,pro:false,boost:["lac"],sup:[],sug:"simple"},
  {ic:"☕",id:"chcy",ru:"Цикорий",en:"Chicory Drink",cal:18,p:0.4,f:0.2,c:4.3,fib:0.4,pre:9,pro:false,boost:["bif","lac"],sup:["cdi"],sug:"complex"},

  // — More Unhealthy —
  {ic:"🍦",id:"icec",ru:"Мороженое",en:"Ice Cream",cal:207,p:3.5,f:11,c:23.6,fib:0,pre:0,pro:false,boost:["can","cdi"],sup:["bif","lac","fae"],sug:"simple"},
  {ic:"🍩",id:"donu",ru:"Пончики",en:"Donuts",cal:452,p:7.5,f:25,c:51.3,fib:1.7,pre:0,pro:false,boost:["cdi","can"],sup:["bif","lac","fae","akk"],sug:"simple"},
  {ic:"🍪",id:"cook",ru:"Печенье",en:"Cookies",cal:502,p:5.9,f:25,c:65.5,fib:2.3,pre:0,pro:false,boost:["cdi","can"],sup:["bif","lac","fae"],sug:"simple"},
  {ic:"🫙",id:"mayo",ru:"Майонез",en:"Mayonnaise",cal:680,p:1.3,f:74.9,c:1.5,fib:0,pre:0,pro:false,boost:["cdi"],sup:["bif","fae"],sug:"none"},
  {ic:"🌭",id:"saus",ru:"Колбаса варёная",en:"Boiled Sausage",cal:257,p:13.7,f:22.8,c:1.5,fib:0,pre:0,pro:false,boost:["cdi","eco"],sup:["bif","lac","fae"],sug:"none"},
  {ic:"🍟",id:"corc",ru:"Картофель фри",en:"French Fries",cal:312,p:3.4,f:15.5,c:41.4,fib:3.8,pre:0,pro:false,boost:["cdi"],sup:["bif","fae"],sug:"complex"},
  {ic:"🥐",id:"bake",ru:"Сладкая выпечка",en:"Sweet Pastry",cal:384,p:6,f:12,c:63,fib:1.3,pre:0,pro:false,boost:["cdi","can"],sup:["bif","lac","fae","akk"],sug:"simple"},
  {ic:"🌭",id:"hdog",ru:"Сосиски",en:"Hot Dog Sausages",cal:296,p:12.4,f:26.3,c:2.4,fib:0,pre:0,pro:false,boost:["cdi","eco"],sup:["bif","fae"],sug:"none"},
];

// ============================================================
// BACTERIA DEFINITIONS
// cx/cy — position in SVG 480×285 viewBox
// ============================================================
const BACTERIA = [
  {id:"bif",ru:"Бифидобактерии",en:"Bifidobacterium",lat:"Bifidobacterium spp.",role:"good",
   desc_ru:"Защищает барьер кишечника, синтезирует витамины группы B, борется с воспалением",
   desc_en:"Protects gut barrier, synthesizes B vitamins, reduces inflammation",
   color:"#64ffda",cx:80,cy:118},
  {id:"lac",ru:"Лактобактерии",en:"Lactobacillus",lat:"Lactobacillus spp.",role:"good",
   desc_ru:"Производит молочную кислоту, подавляет патогены, поддерживает pH кишечника",
   desc_en:"Produces lactic acid, suppresses pathogens, maintains gut pH",
   color:"#00d4ff",cx:205,cy:82},
  {id:"akk",ru:"Аккермансия",en:"Akkermansia",lat:"Akkermansia muciniphila",role:"good",
   desc_ru:"Укрепляет слизистый барьер кишечника, связана со снижением ожирения",
   desc_en:"Strengthens intestinal mucus barrier, linked to reduced obesity",
   color:"#a78bfa",cx:325,cy:105},
  {id:"fae",ru:"Фекалибактерий",en:"Faecalibacterium",lat:"Faecalibacterium prausnitzii",role:"good",
   desc_ru:"Производит бутират — основное топливо для эпителия кишечника",
   desc_en:"Produces butyrate — primary fuel for intestinal epithelium",
   color:"#34d399",cx:420,cy:138},
  {id:"bac",ru:"Бактероиды",en:"Bacteroides",lat:"Bacteroides fragilis",role:"neutral",
   desc_ru:"Расщепляет сложные полисахариды; в норме полезен, в избытке — условно-патогенен",
   desc_en:"Breaks down complex polysaccharides; beneficial in balance, opportunistic in excess",
   color:"#fbbf24",cx:205,cy:162},
  {id:"cdi",ru:"Клостридии",en:"C. difficile",lat:"Clostridioides difficile",role:"bad",
   desc_ru:"Вырабатывает токсины A и B, вызывает диарею и воспаление кишечника",
   desc_en:"Produces toxins A and B, causes diarrhea and gut inflammation",
   color:"#f87171",cx:90,cy:228},
  {id:"eco",ru:"Кишечная палочка пат.",en:"E. coli (pathogenic)",lat:"Escherichia coli O157",role:"bad",
   desc_ru:"Патогенный штамм: токсины, геморрагическая диарея, воспаление",
   desc_en:"Pathogenic strain: toxins, hemorrhagic diarrhea, inflammation",
   color:"#fb923c",cx:228,cy:247},
  {id:"can",ru:"Кандида",en:"Candida",lat:"Candida albicans",role:"bad",
   desc_ru:"Условно-патогенный грибок, разрастается при избытке сахара и дефиците иммунитета",
   desc_en:"Opportunistic fungus, overgrows with excess sugar and immune deficiency",
   color:"#e879f9",cx:370,cy:228},
];
const BM = Object.fromEntries(BACTERIA.map(b=>[b.id,b]));
const BASELINE = {bif:65,lac:62,akk:52,fae:58,bac:50,cdi:10,eco:8,can:6};

// ============================================================
// SYMPTOMS DATABASE
// low: bacteria likely deficient | high: bacteria likely excess
// ============================================================
const SYMPTOMS = [
  {id:"bloat",ic:"🫧",ru:"Вздутие живота",en:"Bloating",
   low:["fae","lac"],high:["cdi"],
   tip_ru:"Нарушен баланс бактерий ферментации. Добавьте пробиотики и умеренную клетчатку.",
   tip_en:"Fermentation bacteria imbalance. Add probiotics and moderate fiber."},
  {id:"const",ic:"🪨",ru:"Запор",en:"Constipation",
   low:["bif","fae"],high:[],
   tip_ru:"Недостаток клетчатки и полезных бактерий. Увеличьте потребление клетчатки и воды.",
   tip_en:"Lack of fiber and beneficial bacteria. Increase fiber and water intake."},
  {id:"diarr",ic:"⚡",ru:"Диарея",en:"Diarrhea",
   low:["lac","bif"],high:["cdi","eco"],
   tip_ru:"Патогены преобладают. Пробиотики и продукты с антибактериальными свойствами.",
   tip_en:"Pathogens dominate. Probiotics and foods with antibacterial properties."},
  {id:"fatg",ic:"😴",ru:"Хроническая усталость",en:"Chronic Fatigue",
   low:["bif","fae"],high:[],
   tip_ru:"Микробиом влияет на синтез нейромедиаторов и энергетический обмен.",
   tip_en:"Microbiome affects neurotransmitter synthesis and energy metabolism."},
  {id:"skin",ic:"🧴",ru:"Проблемы с кожей",en:"Skin Issues",
   low:["akk","bif"],high:["can"],
   tip_ru:"Нарушение барьерной функции кишечника связано с кожными воспалениями.",
   tip_en:"Gut barrier dysfunction is linked to skin inflammation."},
  {id:"immu",ic:"🛡️",ru:"Слабый иммунитет",en:"Weak Immunity",
   low:["bif","akk","lac"],high:[],
   tip_ru:"80% иммунитета в кишечнике. Разнообразьте микрофлору пребиотиками.",
   tip_en:"80% of immunity is in the gut. Diversify microflora with prebiotics."},
  {id:"sugc",ic:"🍬",ru:"Тяга к сладкому",en:"Sugar Cravings",
   low:["lac","bif"],high:["can"],
   tip_ru:"Кандида и дефицит лактобактерий усиливают тягу к сахару.",
   tip_en:"Candida and lactobacilli deficiency increase sugar cravings."},
  {id:"weig",ic:"⚖️",ru:"Проблемы с весом",en:"Weight Issues",
   low:["akk"],high:["bac"],
   tip_ru:"Аккермансия — ключ к метаболизму. Полифенолы и омега-3 её поддерживают.",
   tip_en:"Akkermansia is key for metabolism. Polyphenols and omega-3 support it."},
  {id:"anxi",ic:"😰",ru:"Тревожность",en:"Anxiety & Stress",
   low:["lac","bif"],high:[],
   tip_ru:"Ось кишечник–мозг: лактобактерии участвуют в синтезе ГАМК и серотонина.",
   tip_en:"Gut-brain axis: lactobacilli participate in GABA and serotonin synthesis."},
  {id:"slep",ic:"🌙",ru:"Плохой сон",en:"Poor Sleep",
   low:["bif","fae"],high:[],
   tip_ru:"Микробиом регулирует синтез серотонина — предшественника мелатонина.",
   tip_en:"Microbiome regulates serotonin synthesis — melatonin precursor."},
  {id:"hbrn",ic:"🔥",ru:"Изжога",en:"Heartburn",
   low:["lac"],high:["eco","cdi"],
   tip_ru:"Дисбаланс pH. Противовоспалительные продукты и пробиотики помогут.",
   tip_en:"pH imbalance. Anti-inflammatory foods and probiotics will help."},
  {id:"alle",ic:"🤧",ru:"Аллергия",en:"Allergies",
   low:["lac","bif","akk"],high:[],
   tip_ru:"Снижение микробного разнообразия связано с аллергическими реакциями.",
   tip_en:"Reduced microbial diversity is linked to allergic reactions."},
];

const BASELINES_BY_AGE = {
  child:  {bif:80,lac:70,akk:45,fae:50,bac:45,cdi:8, eco:6, can:5},
  teen:   {bif:72,lac:65,akk:48,fae:54,bac:48,cdi:10,eco:8, can:7},
  young:  {bif:65,lac:62,akk:52,fae:58,bac:50,cdi:10,eco:8, can:6},
  middle: {bif:58,lac:55,akk:48,fae:52,bac:52,cdi:13,eco:10,can:8},
  older:  {bif:50,lac:48,akk:42,fae:45,bac:55,cdi:17,eco:13,can:11},
};

function getBaselineByAge(age){
  const a=Number(age)||30;
  if(a<=12) return BASELINES_BY_AGE.child;
  if(a<=17) return BASELINES_BY_AGE.teen;
  if(a<=35) return BASELINES_BY_AGE.young;
  if(a<=55) return BASELINES_BY_AGE.middle;
  return BASELINES_BY_AGE.older;
}

// ============================================================
// TRANSLATIONS
// ============================================================
const T = {
  ru:{
    title:"MicroVerse", sub:"GUT & FOOD LAB",
    tabs:["Калькулятор","Дневник 24ч","Рекомендации","Симптомы"],
    search:"Введите продукт...", addBtn:"Добавить", amtLabel:"Количество (г)",
    yourDiet:"Ваш рацион", noFoods:"Добавьте продукты чтобы увидеть анализ",
    nutTitle:"Питательная ценность", kcal:"ккал", g:"г",
    cal:"Калории", prot:"Белки", fat:"Жиры", carb:"Углеводы", fib:"Клетчатка",
    micro:"Состояние микробиома", score:"Здоровье кишечника",
    goodZ:"ПОЛЕЗНАЯ ЗОНА", badZ:"ПАТОГЕНЫ",
    bacteriaTitle:"Бактерии", role_good:"Полезные", role_bad:"Вредные", role_neutral:"Нейтральные",
    preScore:"Пребиотический индекс", probIn:"Пробиотики в рационе",
    yes:"✓ Есть", no:"Нет",
    clear:"Очистить рацион", remove:"×",
    per100:"на 100г", total:"Итого за день",
    excellent:"Отличное", good:"Хорошее", fair:"Удовлетворительное", poor:"Плохое",
    recTitle:"Рекомендации для вашего микробиома",
    recSub:"На основе анализа текущего рациона",
    defTitle:"Дефициты", exTitle:"Избытки",
    recAdd:"Добавьте в рацион:",
    recReduce:"Ограничьте:",
    noLog:"Добавьте продукты в калькуляторе — рекомендации появятся здесь",
    diaryTitle:"Дневник питания на день",
    meals:["Завтрак 🌅","Обед 🌞","Ужин 🌙","Перекус ⚡"],
    mealShort:["Завтрак","Обед","Ужин","Перекус"],
    dayScore:"Итог дня:",
    addToDiary:"Добавить в",
    diaryEmpty:"Пусто — добавьте продукты",
    diaryHint:"Введите продукт и выберите приём пищи",
    boosts:"Питает:", suppresses:"Подавляет:",
    gut_healthy:"Здоровый микробиом",
    gut_ok:"Микробиом в норме",
    gut_warn:"Требует внимания",
    gut_bad:"Дисбаланс микробиома",
    age:"Возраст",
    symTitle:"Режим симптомов",
    symSub:"Выберите симптомы — получите персональные рекомендации по питанию",
    symNone:"Выберите один или несколько симптомов выше",
    symEat:"Рекомендуем добавить в рацион:",
    symAvoid:"Ограничьте или исключите:",
    symAffect:"Вероятный дисбаланс бактерий:",
    symLow:"Снижены:",
    symHigh:"Повышены:",
    symTip:"Что происходит:",
    symClear:"Сбросить",
  },
  en:{
    title:"MicroVerse", sub:"GUT & FOOD LAB",
    tabs:["Calculator","24h Diary","Recommendations","Symptoms"],
    search:"Search food...", addBtn:"Add", amtLabel:"Amount (g)",
    yourDiet:"Your Diet", noFoods:"Add foods to see the analysis",
    nutTitle:"Nutrition Facts", kcal:"kcal", g:"g",
    cal:"Calories", prot:"Protein", fat:"Fat", carb:"Carbs", fib:"Fiber",
    micro:"Microbiome Status", score:"Gut Health",
    goodZ:"BENEFICIAL ZONE", badZ:"PATHOGENS",
    bacteriaTitle:"Bacteria", role_good:"Beneficial", role_bad:"Harmful", role_neutral:"Neutral",
    preScore:"Prebiotic Score", probIn:"Probiotics in diet",
    yes:"✓ Present", no:"No",
    clear:"Clear Diet", remove:"×",
    per100:"per 100g", total:"Day Total",
    excellent:"Excellent", good:"Good", fair:"Fair", poor:"Poor",
    recTitle:"Recommendations for Your Microbiome",
    recSub:"Based on current diet analysis",
    defTitle:"Deficiencies", exTitle:"Excesses",
    recAdd:"Add to your diet:",
    recReduce:"Reduce intake:",
    noLog:"Add foods in the Calculator — recommendations will appear here",
    diaryTitle:"Daily Food Diary",
    meals:["Breakfast 🌅","Lunch 🌞","Dinner 🌙","Snack ⚡"],
    mealShort:["Breakfast","Lunch","Dinner","Snack"],
    dayScore:"Day score:",
    addToDiary:"Add to",
    diaryEmpty:"Empty — add some foods",
    diaryHint:"Enter a product and select a meal",
    boosts:"Boosts:", suppresses:"Suppresses:",
    gut_healthy:"Healthy microbiome",
    gut_ok:"Microbiome in balance",
    gut_warn:"Needs attention",
    gut_bad:"Microbiome imbalance",
    age:"Age",
    symTitle:"Symptom Mode",
    symSub:"Select your symptoms — get personalized diet recommendations",
    symNone:"Select one or more symptoms above",
    symEat:"Recommended foods to add:",
    symAvoid:"Limit or avoid:",
    symAffect:"Likely bacteria imbalance:",
    symLow:"Low:",
    symHigh:"High:",
    symTip:"What's happening:",
    symClear:"Reset",
  }
};

// ============================================================
// HELPERS
// ============================================================
function calcNutrition(log){
  return log.reduce((a,{food:f,amount:amt})=>{
    const s=amt/100;
    return {cal:a.cal+f.cal*s, prot:a.prot+f.p*s, fat:a.fat+f.f*s,
            carb:a.carb+f.c*s, fib:a.fib+f.fib*s};
  },{cal:0,prot:0,fat:0,carb:0,fib:0});
}

function calcMicrobiome(log, baseline=BASELINES_BY_AGE.young){
  let s={...baseline};
  log.forEach(({food:f,amount:amt})=>{
    const sc=amt/100;
    f.boost.forEach(id=>{
      const g=(f.pre*1.6+(f.pro?9:0)+f.fib*0.4)*sc;
      s[id]=Math.min(100,s[id]+g);
    });
    f.sup.forEach(id=>{
      const l=(f.pre*1.3+(f.pro?7:0))*sc;
      s[id]=Math.max(0,s[id]-l);
    });
    if(f.sug==="simple"&&f.c>12){
      const pen=f.c/100*sc*9;
      ["bif","lac","fae","akk"].forEach(id=>s[id]=Math.max(0,s[id]-pen));
      ["cdi","can"].forEach(id=>s[id]=Math.min(100,s[id]+pen*0.55));
    }
    if(f.sug==="none"&&f.fib>5){
      const bon=f.fib/100*sc*6;
      ["bif","lac","fae"].forEach(id=>s[id]=Math.min(100,s[id]+bon));
    }
  });
  return s;
}

function healthScore(mb){
  const good=(mb.bif+mb.lac+mb.akk+mb.fae)/4;
  const bad=(mb.cdi+mb.eco+mb.can)/3;
  return Math.round(Math.max(0,Math.min(100,good*0.68-bad*0.32+4)));
}

function scoreColor(sc){
  if(sc>=76)return"#0d9488";
  if(sc>=56)return"#0891b2";
  if(sc>=36)return"#d97706";
  return"#dc2626";
}

function scoreLabel(sc,t){
  if(sc>=76)return t.excellent;
  if(sc>=56)return t.good;
  if(sc>=36)return t.fair;
  return t.poor;
}

function fmt(n){return Math.round(n*10)/10;}

// ============================================================
// MICROBIOME VISUALIZATION (SVG)
// ============================================================
function MicrobiomeViz({mb,lang}){
  const W=480,H=285;
  const divY=182; // divider between good/bad zone

  return(
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",display:"block"}} aria-label="Microbiome visualization">
      <defs>
        {BACTERIA.map(b=>(
          <radialGradient key={b.id} id={`g-${b.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={b.color} stopOpacity="0.92"/>
            <stop offset="70%" stopColor={b.color} stopOpacity="0.4"/>
            <stop offset="100%" stopColor={b.color} stopOpacity="0.05"/>
          </radialGradient>
        ))}
        <radialGradient id="gut-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0d2340" stopOpacity="1"/>
          <stop offset="100%" stopColor="#060f1e" stopOpacity="1"/>
        </radialGradient>
        <filter id="glow-f" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Gut background ellipse */}
      <ellipse cx={W/2} cy={H/2} rx={W/2-4} ry={H/2-6} fill="url(#gut-fill)"/>
      <ellipse cx={W/2} cy={H/2} rx={W/2-4} ry={H/2-6} fill="none" stroke="rgba(13,148,136,0.12)" strokeWidth="1"/>

      {/* Inner wall detail */}
      <ellipse cx={W/2} cy={H/2} rx={W/2-18} ry={H/2-22} fill="none" stroke="rgba(13,148,136,0.05)" strokeWidth="4" strokeDasharray="6,3"/>

      {/* Zone divider */}
      <line x1={16} y1={divY} x2={W-16} y2={divY} stroke="rgba(13,148,136,0.12)" strokeWidth="1" strokeDasharray="5,4"/>

      {/* Zone labels */}
      <text x={22} y={divY-7} fill="rgba(13,148,136,0.4)" fontSize="7.5" fontFamily="'Space Mono',monospace" letterSpacing="0.08em">
        {lang==="ru"?"ПОЛЕЗНАЯ ЗОНА":"BENEFICIAL ZONE"}
      </text>
      <text x={22} y={H-9} fill="rgba(248,113,113,0.25)" fontSize="7.5" fontFamily="'Space Mono',monospace" letterSpacing="0.08em">
        {lang==="ru"?"ПАТОГЕНЫ":"PATHOGENS"}
      </text>

      {/* Bacteria */}
      {BACTERIA.map((b,i)=>{
        const score=mb[b.id]??0;
        const baseR=Math.max(7,Math.min(54,score*0.54));
        const aniDur=`${1.8+(i%4)*0.35}s`;

        return(
          <g key={b.id} style={{cursor:"default"}}>
            <title>{b[lang==="ru"?"ru":"en"]}: {Math.round(score)}/100{"\n"}{b[lang==="ru"?"desc_ru":"desc_en"]}</title>
            {/* Outer ring */}
            <circle cx={b.cx} cy={b.cy} r={baseR+7} fill="none" stroke={b.color} strokeWidth="0.8" opacity="0.15"
              style={{animation:`${b.role==="bad"?"badPulse":"blobPulse"} ${aniDur} ease-in-out infinite`}}/>
            {/* Main body */}
            <circle cx={b.cx} cy={b.cy} r={baseR} fill={`url(#g-${b.id})`}
              filter={score>45?"url(#glow-f)":undefined}
              style={{
                transition:"r 0.7s cubic-bezier(.34,1.56,.64,1)",
                animation:`${b.role==="bad"?"badPulse":"blobPulse"} ${aniDur} ease-in-out infinite`,
                animationDelay:`${i*0.2}s`
              }}/>
            {/* Score label inside */}
            {baseR>14&&(
              <text x={b.cx} y={b.cy+4} textAnchor="middle" fill={b.color} fontSize={baseR>28?"11":"9"}
                fontWeight="700" fontFamily="'Space Mono',monospace" opacity="0.95">
                {Math.round(score)}
              </text>
            )}
            {/* Name below */}
            <text x={b.cx} y={b.cy+baseR+13} textAnchor="middle" fill={b.color} fontSize="8.5"
              fontFamily="'Space Mono',monospace" opacity="0.7" letterSpacing="-0.01em">
              {b.lat.split(" ")[0]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ============================================================
// HEALTH SCORE RING
// ============================================================
function HealthRing({score,t}){
  const R=54, C=2*Math.PI*R;
  const col=scoreColor(score);
  const dash=C*(score/100);
  const lbl=scoreLabel(score,t);
  return(
    <div style={{display:"flex",alignItems:"center",gap:16}}>
      <svg width={130} height={130} viewBox="0 0 130 130">
        <defs>
          <radialGradient id="ring-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={col} stopOpacity="0.15"/>
            <stop offset="100%" stopColor={col} stopOpacity="0"/>
          </radialGradient>
        </defs>
        <circle cx={65} cy={65} r={R+8} fill="url(#ring-glow)"/>
        <circle cx={65} cy={65} r={R} fill="none" stroke="rgba(13,148,136,0.07)" strokeWidth="9"/>
        <circle cx={65} cy={65} r={R} fill="none" stroke={col} strokeWidth="9"
          strokeDasharray={`${dash} ${C-dash}`} strokeDashoffset={C/4}
          strokeLinecap="round"
          style={{transition:"stroke-dasharray 0.8s ease, stroke 0.5s ease",
                  filter:`drop-shadow(0 0 6px ${col})`}}/>
        <text x={65} y={60} textAnchor="middle" fill={col} fontSize="24" fontWeight="700"
          fontFamily="'Space Mono',monospace"
          style={{filter:`drop-shadow(0 0 10px ${col})`}}>
          {score}
        </text>
        <text x={65} y={76} textAnchor="middle" fill="rgba(30,41,59,0.5)" fontSize="9"
          fontFamily="'DM Sans',sans-serif">
          /100
        </text>
      </svg>
      <div>
        <div style={{fontSize:11,color:"rgba(30,41,59,0.55)",fontFamily:"'Space Mono',monospace",letterSpacing:"0.08em",marginBottom:4}}>
          {t.score.toUpperCase()}
        </div>
        <div style={{fontSize:20,fontWeight:700,color:col,lineHeight:1,
          textShadow:`0 0 20px ${col}`}}>
          {lbl}
        </div>
        <div style={{fontSize:11,color:"rgba(30,41,59,0.5)",marginTop:6}}>
          {score>=76?t.gut_healthy:score>=56?t.gut_ok:score>=36?t.gut_warn:t.gut_bad}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FOOD SEARCH INPUT
// ============================================================
function FoodSearch({lang,t,onAdd}){
  const [query,setQuery]=useState("");
  const [results,setResults]=useState([]);
  const [open,setOpen]=useState(false);
  const [sel,setSel]=useState(null);
  const [amt,setAmt]=useState(100);
  const [hi,setHi]=useState(-1);
  const wrapRef=useRef(null);

  const search=useCallback((q)=>{
    setQuery(q);
    setSel(null);
    if(!q.trim()){setResults([]);setOpen(false);return;}
    const lq=q.toLowerCase();
    const r=FOODS.filter(f=>
      f.ru.toLowerCase().includes(lq)||f.en.toLowerCase().includes(lq)
    ).slice(0,9);
    setResults(r);setOpen(r.length>0);setHi(-1);
  },[]);

  const pick=(f)=>{setSel(f);setQuery(f[lang==="ru"?"ru":"en"]);setOpen(false);setHi(-1);};

  const add=()=>{
    if(!sel||amt<=0)return;
    onAdd(sel,amt);
    setSel(null);setQuery("");setAmt(100);setResults([]);
  };

  useEffect(()=>{
    const h=(e)=>{if(wrapRef.current&&!wrapRef.current.contains(e.target)){setOpen(false);}};
    document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);
  },[]);

  const handleKey=(e)=>{
    if(!open)return;
    if(e.key==="ArrowDown"){e.preventDefault();setHi(h=>Math.min(h+1,results.length-1));}
    else if(e.key==="ArrowUp"){e.preventDefault();setHi(h=>Math.max(h-1,0));}
    else if(e.key==="Enter"&&hi>=0){pick(results[hi]);}
    else if(e.key==="Escape"){setOpen(false);}
  };

  const name=f=>f[lang==="ru"?"ru":"en"];

  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div ref={wrapRef} style={{position:"relative"}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:18,flexShrink:0}}>🔍</span>
          <input className="mv-input" value={query}
            onChange={e=>search(e.target.value)}
            onKeyDown={handleKey}
            onFocus={()=>results.length>0&&setOpen(true)}
            placeholder={t.search}/>
        </div>
        {open&&(
          <div className="dropdown">
            {results.map((f,i)=>(
              <div key={f.id} className={`dropdown-item${hi===i?" hi":""}`}
                onMouseDown={()=>pick(f)} onMouseEnter={()=>setHi(i)}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:16}}>{f.ic}</span>
                  <div>
                    <div style={{fontSize:13,color:"#1e293b",fontWeight:500}}>{name(f)}</div>
                    <div style={{fontSize:10,color:"#64748b",marginTop:1}}>
                      {f.cal} {t.kcal} | {t.fib}: {f.fib}{t.g} | pre: {f.pre}/10
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                  {f.pro&&<span className="tag tag-cyan">PRO</span>}
                  {f.pre>=8&&<span className="tag tag-green">PRE</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Amount + Add row */}
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <div style={{position:"relative",width:110,flexShrink:0}}>
          <input className="mv-input" type="number" value={amt} min={1} max={2000}
            onChange={e=>setAmt(Number(e.target.value))}
            style={{paddingRight:28,textAlign:"center"}}/>
          <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
            color:"#64748b",fontSize:12,pointerEvents:"none"}}>{t.g}</span>
        </div>
        <button className="mv-btn mv-btn-primary" onClick={add} disabled={!sel||amt<=0}
          style={{flex:1}}>
          {t.addBtn}
        </button>
      </div>

      {/* Selected food preview */}
      {sel&&(
        <div style={{padding:"10px 12px",background:"rgba(13,148,136,0.06)",
          border:"1px solid rgba(13,148,136,0.18)",borderRadius:8,
          fontSize:12,color:"#475569",lineHeight:1.6,animation:"fadeUp .3s ease"}}>
          <div style={{fontWeight:600,color:"#64ffda",marginBottom:4,fontSize:13}}>
            {sel.ic} {name(sel)}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:4}}>
            {sel.boost.length>0&&(
              <span style={{color:"rgba(100,255,218,0.7)"}}>
                {t.boosts} {sel.boost.map(id=>BM[id]?.lat.split(" ")[0]).join(", ")}
              </span>
            )}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {sel.sup.length>0&&(
              <span style={{color:"rgba(248,113,113,0.7)"}}>
                {t.suppresses} {sel.sup.map(id=>BM[id]?.lat.split(" ")[0]).join(", ")}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// FOOD LOG
// ============================================================
function FoodLog({log,t,lang,onRemove,onClear}){
  const name=f=>f[lang==="ru"?"ru":"en"];
  if(!log.length)return(
    <div style={{textAlign:"center",padding:"24px 0",color:"#94a3b8",fontSize:13,fontStyle:"italic"}}>
      {t.noFoods}
    </div>
  );
  return(
    <div style={{display:"flex",flexDirection:"column",gap:0}}>
      {log.map(({id,food:f,amount})=>(
        <div key={id} className="food-enter" style={{
          display:"flex",alignItems:"center",gap:8,padding:"8px 0",
          borderBottom:"1px solid rgba(100,255,218,0.06)",
        }}>
          <span style={{fontSize:16,flexShrink:0}}>{f.ic}</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:500,color:"#1e293b",
              whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{name(f)}</div>
            <div style={{fontSize:11,color:"#64748b",marginTop:1}}>
              {amount}{t.g} · {fmt(f.cal*amount/100)} {t.kcal} · {t.fib} {fmt(f.fib*amount/100)}{t.g}
            </div>
          </div>
          {/* Effect pills */}
          <div style={{display:"flex",gap:4,flexShrink:0}}>
            {f.boost.length>0&&<span className="tag tag-green">+{f.boost.length}</span>}
            {f.sup.length>0&&<span className="tag tag-red">−{f.sup.length}</span>}
            {f.pro&&<span className="tag tag-cyan">PRO</span>}
          </div>
          <button className="mv-btn mv-btn-danger" onClick={()=>onRemove(id)}
            style={{padding:"4px 8px",fontSize:12,flexShrink:0}}>
            {t.remove}
          </button>
        </div>
      ))}
      <button className="mv-btn mv-btn-ghost" onClick={onClear}
        style={{marginTop:10,width:"100%",justifyContent:"center"}}>
        {t.clear}
      </button>
    </div>
  );
}

// ============================================================
// NUTRITION CARDS
// ============================================================
function NutritionSummary({n,t}){
  const items=[
    {label:t.cal,val:fmt(n.cal),unit:t.kcal,color:"#fbbf24",pct:null},
    {label:t.prot,val:fmt(n.prot),unit:t.g,color:"#00d4ff",pct:null},
    {label:t.fat,val:fmt(n.fat),unit:t.g,color:"#fb923c",pct:null},
    {label:t.carb,val:fmt(n.carb),unit:t.g,color:"#a78bfa",pct:null},
    {label:t.fib,val:fmt(n.fib),unit:t.g,color:"#64ffda",pct:null},
  ];
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      {items.map(({label,val,unit,color})=>(
        <div key={label} style={{
          background:`linear-gradient(135deg, rgba(${hexToRgb(color)},0.07), rgba(${hexToRgb(color)},0.02))`,
          border:`1px solid rgba(${hexToRgb(color)},0.18)`,
          borderRadius:8,padding:"10px 12px",
        }}>
          <div style={{fontSize:10,color:"rgba(30,41,59,0.55)",textTransform:"uppercase",
            letterSpacing:"0.06em",marginBottom:3,fontFamily:"'Space Mono',monospace"}}>
            {label}
          </div>
          <div style={{fontSize:18,fontWeight:700,color,fontFamily:"'Space Mono',monospace",
            textShadow:`0 0 12px rgba(${hexToRgb(color)},0.4)`}}>
            {val}
          </div>
          <div style={{fontSize:10,color:"rgba(30,41,59,0.4)",marginTop:1}}>{unit}</div>
        </div>
      ))}
    </div>
  );
}

function hexToRgb(hex){
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return`${r},${g},${b}`;
}

// ============================================================
// BACTERIA PANEL
// ============================================================
function BacteriaPanel({mb,t,lang,baseline}){
  const good=BACTERIA.filter(b=>b.role==="good");
  const bad=BACTERIA.filter(b=>b.role==="bad");
  const neutral=BACTERIA.filter(b=>b.role==="neutral");

  const Row=({b})=>{
    const sc=mb[b.id]??0;
    const base=(baseline??BASELINES_BY_AGE.young)[b.id];
    const diff=sc-base;
    const name=lang==="ru"?b.ru:b.en;
    return(
      <div style={{padding:"8px 0",borderBottom:"1px solid rgba(13,148,136,0.06)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
          <div>
            <div style={{fontSize:12,fontWeight:600,color:"#1e293b"}}>{name}</div>
            <div style={{fontSize:9,color:"#94a3b8",fontFamily:"'Space Mono',monospace",marginTop:1}}>{b.lat}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            {diff!==0&&(
              <span style={{fontSize:10,color:diff>0?b.role==="bad"?"#f87171":"#64ffda":"rgba(30,41,59,0.4)",fontFamily:"'Space Mono',monospace"}}>
                {diff>0?"+":""}{Math.round(diff)}
              </span>
            )}
            <span style={{fontSize:13,fontWeight:700,color:b.color,fontFamily:"'Space Mono',monospace",
              textShadow:`0 0 8px rgba(${hexToRgb(b.color)},0.5)`}}>
              {Math.round(sc)}
            </span>
          </div>
        </div>
        <div style={{height:5,background:"rgba(13,148,136,0.1)",borderRadius:3,overflow:"hidden"}}>
          <div style={{
            height:"100%",borderRadius:3,
            width:`${sc}%`,
            background:`linear-gradient(90deg, ${b.color}aa, ${b.color})`,
            transition:"width 0.7s cubic-bezier(.34,1.56,.64,1)",
            boxShadow:`0 0 6px rgba(${hexToRgb(b.color)},0.4)`,
          }}/>
        </div>
      </div>
    );
  };

  const Section=({title,items,col})=>(
    <div style={{marginBottom:12}}>
      <div style={{fontSize:10,color:col,fontFamily:"'Space Mono',monospace",letterSpacing:"0.08em",
        textTransform:"uppercase",marginBottom:6,paddingBottom:4,
        borderBottom:`1px solid rgba(${hexToRgb(col)},0.2)`}}>
        {title}
      </div>
      {items.map(b=><Row key={b.id} b={b}/>)}
    </div>
  );

  return(
    <div>
      <Section title={t.role_good} items={good} col="#64ffda"/>
      <Section title={t.role_neutral} items={neutral} col="#fbbf24"/>
      <Section title={t.role_bad} items={bad} col="#f87171"/>
    </div>
  );
}

// ============================================================
// PREBIOTIC / PROBIOTIC ROW
// ============================================================
function PrebioticRow({log,t}){
  const preAvg=log.length
    ?Math.min(10,log.reduce((s,{food:f,amount:a})=>s+f.pre*(a/100),0)/
              Math.max(0.01,log.reduce((s,{amount:a})=>s+a/100,0)))
    :0;
  const hasProb=log.some(({food:f})=>f.pro);
  const col=preAvg>=7?"#64ffda":preAvg>=4?"#fbbf24":"#f87171";
  return(
    <div style={{display:"flex",gap:10}}>
      <div style={{flex:1,background:"rgba(13,148,136,0.05)",border:"1px solid rgba(13,148,136,0.12)",
        borderRadius:8,padding:"10px 12px"}}>
        <div style={{fontSize:10,color:"rgba(30,41,59,0.5)",textTransform:"uppercase",
          letterSpacing:"0.06em",marginBottom:4,fontFamily:"'Space Mono',monospace"}}>
          {t.preScore}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{fontSize:22,fontWeight:700,color:col,fontFamily:"'Space Mono',monospace",
            textShadow:`0 0 12px rgba(${hexToRgb(col)},0.5)`}}>
            {preAvg.toFixed(1)}
          </div>
          <div style={{height:6,flex:1,background:"rgba(13,148,136,0.1)",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${preAvg*10}%`,borderRadius:3,
              background:`linear-gradient(90deg,${col}aa,${col})`,
              transition:"width 0.7s ease"}}/>
          </div>
          <div style={{fontSize:10,color:"rgba(30,41,59,0.4)",fontFamily:"'Space Mono',monospace"}}>/10</div>
        </div>
      </div>
      <div style={{flex:1,background:"rgba(0,212,255,0.04)",border:`1px solid rgba(0,212,255,${hasProb?0.25:0.1})`,
        borderRadius:8,padding:"10px 12px"}}>
        <div style={{fontSize:10,color:"rgba(30,41,59,0.5)",textTransform:"uppercase",
          letterSpacing:"0.06em",marginBottom:4,fontFamily:"'Space Mono',monospace"}}>
          {t.probIn}
        </div>
        <div style={{fontSize:14,fontWeight:600,color:hasProb?"#00d4ff":"rgba(30,41,59,0.4)"}}>
          {hasProb?t.yes:t.no}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CALCULATOR TAB
// ============================================================
function CalculatorTab({log,mb,setLog,t,lang,baseline}){
  const n=useMemo(()=>calcNutrition(log),[log]);
  const hs=useMemo(()=>healthScore(mb),[mb]);

  const onAdd=(food,amount)=>setLog(prev=>[...prev,{id:Date.now(),food,amount}]);
  const onRemove=(id)=>setLog(prev=>prev.filter(x=>x.id!==id));
  const onClear=()=>setLog([]);

  return(
    <div className="two-col" style={{display:"flex",gap:20,alignItems:"flex-start",animation:"fadeUp .4s ease"}}>

      {/* ── LEFT: input + log + nutrition ── */}
      <div style={{flex:"0 0 360px",minWidth:280,display:"flex",flexDirection:"column",gap:14}}>

        {/* Search card */}
        <div className="mv-card">
          <div style={{fontSize:11,color:"rgba(13,148,136,0.9)",fontFamily:"'Space Mono',monospace",
            letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>
            ＋ {lang==="ru"?"Добавить продукт":"Add Food"}
          </div>
          <FoodSearch lang={lang} t={t} onAdd={onAdd}/>
        </div>

        {/* Diet log */}
        <div className="mv-card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:11,color:"rgba(13,148,136,0.9)",fontFamily:"'Space Mono',monospace",
              letterSpacing:"0.08em",textTransform:"uppercase"}}>
              {t.yourDiet}
            </div>
            {log.length>0&&(
              <span style={{fontSize:11,color:"#64748b"}}>{log.length} {lang==="ru"?"позиций":"items"}</span>
            )}
          </div>
          <FoodLog log={log} t={t} lang={lang} onRemove={onRemove} onClear={onClear}/>
        </div>

        {/* Nutrition summary */}
        {log.length>0&&(
          <div className="mv-card" style={{animation:"fadeUp .3s ease"}}>
            <div style={{fontSize:11,color:"rgba(13,148,136,0.9)",fontFamily:"'Space Mono',monospace",
              letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>
              {t.nutTitle} · {t.total}
            </div>
            <NutritionSummary n={n} t={t}/>
            <div style={{marginTop:12}}>
              <PrebioticRow log={log} t={t}/>
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT: viz + bacteria ── */}
      <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:14}}>

        {/* Health ring + score */}
        <div className="mv-card">
          <div style={{fontSize:11,color:"rgba(13,148,136,0.9)",fontFamily:"'Space Mono',monospace",
            letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12}}>
            {t.micro}
          </div>
          <HealthRing score={hs} t={t}/>
        </div>

        {/* SVG microbiome */}
        <div className="mv-card" style={{padding:12,overflow:"hidden"}}>
          <MicrobiomeViz mb={mb} lang={lang}/>
        </div>

        {/* Bacteria panel */}
        <div className="mv-card">
          <div style={{fontSize:11,color:"rgba(13,148,136,0.9)",fontFamily:"'Space Mono',monospace",
            letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>
            {t.bacteriaTitle}
          </div>
          <BacteriaPanel mb={mb} t={t} lang={lang} baseline={baseline}/>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DIARY TAB
// ============================================================
function DiaryTab({t,lang,baseline}){
  const [meals,setMeals]=useState({0:[],1:[],2:[],3:[]});
  const [activeMeal,setActiveMeal]=useState(0);
  const mealColors=["#fbbf24","#00d4ff","#a78bfa","#34d399"];

  const onAdd=(food,amount)=>{
    setMeals(prev=>({...prev,[activeMeal]:[...prev[activeMeal],{id:Date.now(),food,amount}]}));
  };
  const onRemove=(mealIdx,id)=>{
    setMeals(prev=>({...prev,[mealIdx]:prev[mealIdx].filter(x=>x.id!==id)}));
  };

  const allLog=Object.values(meals).flat();
  const totalMb=useMemo(()=>calcMicrobiome(allLog,baseline),[allLog,baseline]);
  const hs=useMemo(()=>healthScore(totalMb),[totalMb]);

  // Running state per meal
  const running=useMemo(()=>{
    const states=[];
    let acc=[];
    for(let i=0;i<4;i++){acc=[...acc,...meals[i]];states.push(healthScore(calcMicrobiome(acc,baseline)));}
    return states;
  },[meals,baseline]);

  const name=f=>f[lang==="ru"?"ru":"en"];

  return(
    <div style={{animation:"fadeUp .4s ease"}}>
      <div style={{marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700,color:"#1e293b",marginBottom:2}}>{t.diaryTitle}</h2>
          <p style={{fontSize:12,color:"#64748b"}}>{t.diaryHint}</p>
        </div>
        {allLog.length>0&&(
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 16px",
            background:"rgba(13,148,136,0.06)",border:"1px solid rgba(13,148,136,0.18)",borderRadius:10}}>
            <span style={{fontSize:11,color:"rgba(30,41,59,0.5)",textTransform:"uppercase",
              letterSpacing:"0.06em",fontFamily:"'Space Mono',monospace"}}>{t.dayScore}</span>
            <span style={{fontSize:22,fontWeight:700,color:scoreColor(hs),fontFamily:"'Space Mono',monospace",
              textShadow:`0 0 12px ${scoreColor(hs)}`}}>{hs}</span>
            <span style={{fontSize:12,color:scoreColor(hs)}}>{scoreLabel(hs,t)}</span>
          </div>
        )}
      </div>

      {/* Meal selector tabs */}
      <div style={{display:"flex",gap:0,borderBottom:"1px solid rgba(13,148,136,0.12)",marginBottom:20,overflowX:"auto"}}>
        {t.meals.map((m,i)=>(
          <button key={i} onClick={()=>setActiveMeal(i)}
            style={{
              padding:"10px 20px",cursor:"pointer",border:"none",background:"transparent",
              fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:500,
              color:activeMeal===i?mealColors[i]:"#64748b",
              borderBottom:`2px solid ${activeMeal===i?mealColors[i]:"transparent"}`,
              transition:"all .2s",whiteSpace:"nowrap",
            }}>
            {m}
            {meals[i].length>0&&(
              <span style={{marginLeft:6,fontSize:10,padding:"2px 6px",borderRadius:10,
                background:`rgba(${hexToRgb(mealColors[i])},0.15)`,
                color:mealColors[i],fontFamily:"'Space Mono',monospace",fontWeight:700}}>
                {meals[i].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active meal content */}
      <div className="two-col" style={{display:"flex",gap:20,alignItems:"flex-start"}}>
        <div style={{flex:"0 0 360px",minWidth:280,display:"flex",flexDirection:"column",gap:14}}>
          <div className="mv-card">
            <div style={{fontSize:11,marginBottom:10,color:`rgba(${hexToRgb(mealColors[activeMeal])},0.8)`,
              fontFamily:"'Space Mono',monospace",letterSpacing:"0.07em",textTransform:"uppercase"}}>
              {t.mealShort[activeMeal]}
            </div>
            <FoodSearch lang={lang} t={t} onAdd={onAdd}/>
          </div>

          {/* Meal food list */}
          <div className="mv-card">
            {meals[activeMeal].length===0?(
              <div style={{textAlign:"center",padding:"16px 0",color:"#94a3b8",fontSize:12,fontStyle:"italic"}}>
                {t.diaryEmpty}
              </div>
            ):(
              meals[activeMeal].map(({id,food:f,amount})=>(
                <div key={id} className="food-enter" style={{display:"flex",alignItems:"center",gap:8,
                  padding:"7px 0",borderBottom:"1px solid rgba(13,148,136,0.06)"}}>
                  <span style={{fontSize:16}}>{f.ic}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,color:"#1e293b",fontWeight:500,
                      whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{name(f)}</div>
                    <div style={{fontSize:11,color:"#64748b"}}>{amount}{t.g} · {fmt(f.cal*amount/100)}{t.kcal}</div>
                  </div>
                  <button className="mv-btn mv-btn-danger" onClick={()=>onRemove(activeMeal,id)}
                    style={{padding:"4px 8px",fontSize:12}}>×</button>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:14}}>
          {/* Timeline progress */}
          <div className="mv-card">
            <div style={{fontSize:11,color:"rgba(13,148,136,0.9)",fontFamily:"'Space Mono',monospace",
              letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:16}}>
              {lang==="ru"?"Прогресс дня":"Day Progress"}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {t.mealShort.map((m,i)=>{
                const sc=running[i];
                const col=mealColors[i];
                const n=calcNutrition(meals[i]);
                return(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:70,fontSize:11,color:meals[i].length?col:"#94a3b8",
                      fontWeight:meals[i].length?600:400}}>{m}</div>
                    <div style={{flex:1,height:8,background:"rgba(13,148,136,0.1)",borderRadius:4,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${sc}%`,borderRadius:4,
                        background:`linear-gradient(90deg,${col}88,${col})`,
                        transition:"width .8s ease",
                        opacity:meals[i].length?1:0.3}}/>
                    </div>
                    <div style={{width:32,textAlign:"right",fontSize:11,fontFamily:"'Space Mono',monospace",
                      color:meals[i].length?scoreColor(sc):"#94a3b8",fontWeight:700}}>{sc}</div>
                    <div style={{width:50,textAlign:"right",fontSize:10,color:"#94a3b8"}}>
                      {meals[i].length?`${fmt(n.cal)}${t.kcal}`:"—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Microbiome state */}
          {allLog.length>0&&(
            <>
              <div className="mv-card" style={{padding:12}}>
                <MicrobiomeViz mb={totalMb} lang={lang}/>
              </div>
              <div className="mv-card">
                <div style={{fontSize:11,color:"rgba(13,148,136,0.9)",fontFamily:"'Space Mono',monospace",
                  letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>
                  {t.bacteriaTitle}
                </div>
                <BacteriaPanel mb={totalMb} t={t} lang={lang} baseline={baseline}/>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// RECOMMENDATIONS TAB
// ============================================================
function RecommendationsTab({log,mb,t,lang,baseline}){
  const hs=healthScore(mb);

  // Analyze deficiencies & excesses
  const analysis=useMemo(()=>{
    const deficient=[];
    const excess=[];

    BACTERIA.forEach(b=>{
      const sc=mb[b.id]??0;
      const base=(baseline??BASELINES_BY_AGE.young)[b.id];
      if(b.role==="good"&&sc<base-8){
        // find top foods that boost this bacteria
        const topFoods=FOODS.filter(f=>f.boost.includes(b.id))
          .sort((a,x)=>x.pre-a.pre||x.fib-a.fib).slice(0,4);
        deficient.push({b,sc,base,delta:base-sc,topFoods});
      }
      if(b.role==="bad"&&sc>base+8){
        const supFoods=FOODS.filter(f=>f.sup.includes(b.id))
          .sort((a,x)=>x.pre-a.pre).slice(0,4);
        excess.push({b,sc,base,delta:sc-base,supFoods});
      }
    });

    deficient.sort((a,b2)=>b2.delta-a.delta);
    excess.sort((a,b2)=>b2.delta-a.delta);
    return{deficient,excess};
  },[mb,baseline]);

  const name=f=>f[lang==="ru"?"ru":"en"];

  if(!log.length)return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      minHeight:300,gap:16,animation:"fadeUp .4s ease"}}>
      <div style={{fontSize:48,opacity:.5}}>🔬</div>
      <div style={{fontSize:14,color:"#64748b",textAlign:"center",maxWidth:360}}>{t.noLog}</div>
    </div>
  );

  const scoreCol=scoreColor(hs);

  return(
    <div style={{animation:"fadeUp .4s ease",maxWidth:960,margin:"0 auto"}}>
      {/* Overview */}
      <div className="mv-card" style={{marginBottom:20,
        background:`linear-gradient(135deg, rgba(${hexToRgb(scoreCol)},0.08), rgba(255,255,255,0.95))`,
        border:`1px solid rgba(${hexToRgb(scoreCol)},0.2)`}}>
        <div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
          <HealthRing score={hs} t={t}/>
          <div style={{flex:1,minWidth:200}}>
            <div style={{fontSize:20,fontWeight:700,color:"#1e293b",marginBottom:6}}>{t.recTitle}</div>
            <div style={{fontSize:13,color:"#475569",marginBottom:12}}>{t.recSub}</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {analysis.deficient.length===0&&analysis.excess.length===0&&(
                <span className="tag tag-green">✓ {lang==="ru"?"Отличный баланс!":"Excellent balance!"}</span>
              )}
              {analysis.deficient.length>0&&(
                <span className="tag tag-orange">
                  {lang==="ru"?`${analysis.deficient.length} дефицита`:`${analysis.deficient.length} deficiencies`}
                </span>
              )}
              {analysis.excess.length>0&&(
                <span className="tag tag-red">
                  {lang==="ru"?`${analysis.excess.length} превышения`:`${analysis.excess.length} excesses`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="two-col" style={{display:"flex",gap:20,alignItems:"flex-start"}}>
        {/* Deficiencies */}
        <div style={{flex:1,minWidth:0}}>
          {analysis.deficient.length>0&&(
            <>
              <div style={{fontSize:12,color:"rgba(13,148,136,0.9)",fontFamily:"'Space Mono',monospace",
                letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12,
                paddingBottom:6,borderBottom:"1px solid rgba(13,148,136,0.12)"}}>
                ↓ {t.defTitle}
              </div>
              {analysis.deficient.map(({b,sc,delta,topFoods})=>(
                <div key={b.id} className="mv-card" style={{marginBottom:14,
                  borderColor:`rgba(${hexToRgb(b.color)},0.2)`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:b.color,marginBottom:2}}>
                        {lang==="ru"?b.ru:b.en}
                      </div>
                      <div style={{fontSize:10,color:"#64748b",fontFamily:"'Space Mono',monospace"}}>{b.lat}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:18,fontWeight:700,color:"#f87171",fontFamily:"'Space Mono',monospace"}}>
                        {Math.round(sc)}
                      </div>
                      <div style={{fontSize:10,color:"rgba(30,41,59,0.4)"}}>
                        −{Math.round(delta)} {lang==="ru"?"от нормы":"below norm"}
                      </div>
                    </div>
                  </div>
                  <p style={{fontSize:12,color:"#475569",marginBottom:12,lineHeight:1.5}}>
                    {lang==="ru"?b.desc_ru:b.desc_en}
                  </p>
                  <div style={{fontSize:11,color:"rgba(13,148,136,0.8)",marginBottom:8,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>
                    {t.recAdd}
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                    {topFoods.map(f=>(
                      <div key={f.id} style={{
                        padding:"6px 10px",background:"rgba(13,148,136,0.06)",
                        border:"1px solid rgba(13,148,136,0.18)",borderRadius:8,
                        display:"flex",alignItems:"center",gap:6,
                      }}>
                        <span style={{fontSize:14}}>{f.ic}</span>
                        <div>
                          <div style={{fontSize:12,color:"#1e293b",fontWeight:500}}>{name(f)}</div>
                          <div style={{fontSize:9,color:"#64748b",fontFamily:"'Space Mono',monospace"}}>
                            pre:{f.pre} fib:{f.fib}{t.g} {f.pro?"🔬":""}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* General tips if all good */}
          {analysis.deficient.length===0&&(
            <div className="mv-card" style={{borderColor:"rgba(13,148,136,0.25)",
              background:"rgba(13,148,136,0.05)"}}>
              <div style={{fontSize:14,fontWeight:600,color:"#64ffda",marginBottom:8}}>
                {lang==="ru"?"✓ Полезные бактерии в норме":"✓ Beneficial bacteria in balance"}
              </div>
              <p style={{fontSize:12,color:"#475569",lineHeight:1.6}}>
                {lang==="ru"
                  ?"Ваш рацион хорошо питает полезную микрофлору. Продолжайте включать разнообразные овощи, ферментированные продукты и клетчатку."
                  :"Your diet is well-nourishing beneficial microflora. Continue including diverse vegetables, fermented foods and fiber."}
              </p>
            </div>
          )}
        </div>

        {/* Excesses */}
        <div style={{flex:1,minWidth:0}}>
          {analysis.excess.length>0&&(
            <>
              <div style={{fontSize:12,color:"rgba(248,113,113,0.6)",fontFamily:"'Space Mono',monospace",
                letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12,
                paddingBottom:6,borderBottom:"1px solid rgba(248,113,113,0.12)"}}>
                ↑ {t.exTitle}
              </div>
              {analysis.excess.map(({b,sc,delta,supFoods})=>(
                <div key={b.id} className="mv-card" style={{marginBottom:14,
                  borderColor:`rgba(${hexToRgb(b.color)},0.2)`,
                  background:`rgba(${hexToRgb(b.color)},0.03)`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:b.color,marginBottom:2}}>
                        {lang==="ru"?b.ru:b.en}
                      </div>
                      <div style={{fontSize:10,color:"#64748b",fontFamily:"'Space Mono',monospace"}}>{b.lat}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:18,fontWeight:700,color:b.color,fontFamily:"'Space Mono',monospace"}}>
                        {Math.round(sc)}
                      </div>
                      <div style={{fontSize:10,color:"rgba(30,41,59,0.4)"}}>
                        +{Math.round(delta)} {lang==="ru"?"выше нормы":"above norm"}
                      </div>
                    </div>
                  </div>
                  <p style={{fontSize:12,color:"#475569",marginBottom:12,lineHeight:1.5}}>
                    {lang==="ru"?b.desc_ru:b.desc_en}
                  </p>
                  {supFoods.length>0&&(
                    <>
                      <div style={{fontSize:11,color:"rgba(248,113,113,0.5)",marginBottom:8,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>
                        {t.recAdd}
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                        {supFoods.map(f=>(
                          <div key={f.id} style={{
                            padding:"6px 10px",background:"rgba(248,113,113,0.04)",
                            border:"1px solid rgba(248,113,113,0.15)",borderRadius:8,
                            display:"flex",alignItems:"center",gap:6,
                          }}>
                            <span style={{fontSize:14}}>{f.ic}</span>
                            <div>
                              <div style={{fontSize:12,color:"#1e293b",fontWeight:500}}>{name(f)}</div>
                              <div style={{fontSize:9,color:"#64748b",fontFamily:"'Space Mono',monospace"}}>
                                pre:{f.pre} {f.pro?"🔬":""}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </>
          )}

          {/* General nutrition insight */}
          <div className="mv-card" style={{borderColor:"rgba(167,139,250,0.2)",marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:"#a78bfa",marginBottom:10}}>
              {lang==="ru"?"🧬 Ключевые принципы питания для микробиома":"🧬 Key microbiome nutrition principles"}
            </div>
            {[
              lang==="ru"
                ?["🌿","Клетчатка","Цель: 25–35г/день. Питает бифидобактерии и лактобактерии"]
                :["🌿","Fiber","Goal: 25–35g/day. Feeds bifidobacteria and lactobacilli"],
              lang==="ru"
                ?["🥛","Ферментированные продукты","Кефир, йогурт, кимчи — прямой источник пробиотиков"]
                :["🥛","Fermented Foods","Kefir, yogurt, kimchi — direct source of probiotics"],
              lang==="ru"
                ?["🍓","Полифенолы","Ягоды, гранат, тёмный шоколад питают аккермансию"]
                :["🍓","Polyphenols","Berries, pomegranate, dark chocolate feed Akkermansia"],
              lang==="ru"
                ?["🧄","Пребиотики","Лук, чеснок, топинамбур — инулин для бифидобактерий"]
                :["🧄","Prebiotics","Onion, garlic, topinambur — inulin for bifidobacteria"],
              lang==="ru"
                ?["🚫","Ограничить","Сахар, алкоголь, фастфуд — подавляют всю полезную флору"]
                :["🚫","Limit","Sugar, alcohol, fast food — suppress all beneficial bacteria"],
            ].map(([ic,label,desc])=>(
              <div key={label} style={{display:"flex",gap:10,marginBottom:10,paddingBottom:10,
                borderBottom:"1px solid rgba(13,148,136,0.06)"}}>
                <span style={{fontSize:18,flexShrink:0}}>{ic}</span>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:"#1e293b",marginBottom:2}}>{label}</div>
                  <div style={{fontSize:11,color:"#475569",lineHeight:1.5}}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SYMPTOMS TAB
// ============================================================
function SymptomsTab({t,lang}){
  const [selected,setSelected]=useState(new Set());

  const toggle=(id)=>setSelected(prev=>{
    const next=new Set(prev);
    if(next.has(id))next.delete(id); else next.add(id);
    return next;
  });

  const analysis=useMemo(()=>{
    if(!selected.size)return null;
    const active=SYMPTOMS.filter(s=>selected.has(s.id));
    const lowBact=[...new Set(active.flatMap(s=>s.low))];
    const highBact=[...new Set(active.flatMap(s=>s.high))];

    const eatFoods=FOODS
      .filter(f=>
        f.boost.some(b=>lowBact.includes(b))||
        (f.pro&&lowBact.some(b=>["lac","bif"].includes(b)))||
        f.sup.some(b=>highBact.includes(b))
      )
      .filter(f=>!f.boost.some(b=>highBact.includes(b)))
      .sort((a,b)=>b.pre-a.pre||(b.pro?1:0)-(a.pro?1:0)||b.fib-a.fib)
      .slice(0,12);

    const avoidFoods=FOODS
      .filter(f=>f.boost.some(b=>highBact.includes(b))||(f.sug==="simple"&&f.c>20&&!f.pro))
      .filter(f=>!f.pro)
      .sort((a,b)=>b.cal-a.cal)
      .slice(0,8);

    return{lowBact,highBact,eatFoods,avoidFoods,active};
  },[selected]);

  const name=f=>f[lang==="ru"?"ru":"en"];
  const sname=s=>lang==="ru"?s.ru:s.en;

  return(
    <div style={{animation:"fadeUp .4s ease",maxWidth:1100,margin:"0 auto"}}>

      {/* Header */}
      <div style={{marginBottom:24,display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:700,color:"#1e293b",marginBottom:4}}>{t.symTitle}</h2>
          <p style={{fontSize:13,color:"#64748b"}}>{t.symSub}</p>
        </div>
        {selected.size>0&&(
          <button className="mv-btn mv-btn-ghost" onClick={()=>setSelected(new Set())}>
            × {t.symClear}
          </button>
        )}
      </div>

      {/* Symptom chips */}
      <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:28}}>
        {SYMPTOMS.map(s=>{
          const on=selected.has(s.id);
          return(
            <button key={s.id} onClick={()=>toggle(s.id)}
              style={{
                padding:"10px 16px",cursor:"pointer",
                borderRadius:10,fontFamily:"'DM Sans',sans-serif",
                fontSize:13,fontWeight:500,transition:"all .2s",
                display:"flex",alignItems:"center",gap:8,
                background:on?"rgba(13,148,136,0.1)":"#ffffff",
                border:`1px solid ${on?"rgba(13,148,136,0.5)":"rgba(13,148,136,0.15)"}`,
                color:on?"#0d9488":"#334155",
                boxShadow:on?"0 0 12px rgba(13,148,136,0.12)":"none",
              }}>
              <span style={{fontSize:16}}>{s.ic}</span>
              <span>{sname(s)}</span>
              {on&&<span style={{fontSize:10,opacity:.7}}>✓</span>}
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {!analysis&&(
        <div style={{textAlign:"center",padding:"48px 0",color:"#94a3b8"}}>
          <div style={{fontSize:52,marginBottom:12,opacity:.5}}>🩺</div>
          <div style={{fontSize:14}}>{t.symNone}</div>
        </div>
      )}

      {/* Results */}
      {analysis&&(
        <div>
          {/* Tips from selected symptoms */}
          <div style={{display:"flex",flexWrap:"wrap",gap:12,marginBottom:20}}>
            {analysis.active.map(s=>(
              <div key={s.id} className="mv-card" style={{flex:"1 1 280px",
                borderColor:"rgba(13,148,136,0.25)",background:"rgba(13,148,136,0.05)"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{fontSize:20}}>{s.ic}</span>
                  <span style={{fontSize:14,fontWeight:600,color:"#64ffda"}}>{sname(s)}</span>
                </div>
                <p style={{fontSize:12,color:"#475569",lineHeight:1.6,marginBottom:0}}>
                  {lang==="ru"?s.tip_ru:s.tip_en}
                </p>
              </div>
            ))}
          </div>

          {/* Bacteria status */}
          <div className="mv-card" style={{marginBottom:20}}>
            <div style={{fontSize:11,color:"rgba(13,148,136,0.9)",fontFamily:"'Space Mono',monospace",
              letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12}}>
              {t.symAffect}
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:16}}>
              {analysis.lowBact.length>0&&(
                <div style={{flex:1,minWidth:200}}>
                  <div style={{fontSize:11,color:"rgba(248,113,113,0.6)",marginBottom:8,
                    fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:"0.06em"}}>
                    ↓ {t.symLow}
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {analysis.lowBact.map(id=>{
                      const b=BM[id];if(!b)return null;
                      return(
                        <div key={id} style={{padding:"6px 12px",borderRadius:8,
                          background:`rgba(${hexToRgb(b.color)},0.08)`,
                          border:`1px solid rgba(${hexToRgb(b.color)},0.25)`,
                          fontSize:12,color:b.color,fontWeight:500}}>
                          {lang==="ru"?b.ru:b.en}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {analysis.highBact.length>0&&(
                <div style={{flex:1,minWidth:200}}>
                  <div style={{fontSize:11,color:"rgba(251,146,60,0.6)",marginBottom:8,
                    fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:"0.06em"}}>
                    ↑ {t.symHigh}
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {analysis.highBact.map(id=>{
                      const b=BM[id];if(!b)return null;
                      return(
                        <div key={id} style={{padding:"6px 12px",borderRadius:8,
                          background:`rgba(${hexToRgb(b.color)},0.08)`,
                          border:`1px solid rgba(${hexToRgb(b.color)},0.25)`,
                          fontSize:12,color:b.color,fontWeight:500}}>
                          {lang==="ru"?b.ru:b.en}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Two columns: eat / avoid */}
          <div className="two-col" style={{display:"flex",gap:20,alignItems:"flex-start"}}>

            {/* Foods to eat */}
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,color:"rgba(13,148,136,0.9)",fontFamily:"'Space Mono',monospace",
                letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12,
                paddingBottom:6,borderBottom:"1px solid rgba(13,148,136,0.12)"}}>
                ✓ {t.symEat}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {analysis.eatFoods.map(f=>(
                  <div key={f.id} style={{
                    padding:"10px 12px",background:"rgba(13,148,136,0.05)",
                    border:"1px solid rgba(13,148,136,0.12)",borderRadius:10,
                    display:"flex",alignItems:"flex-start",gap:8,
                  }}>
                    <span style={{fontSize:18,flexShrink:0}}>{f.ic}</span>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#1e293b",
                        whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{name(f)}</div>
                      <div style={{display:"flex",gap:4,marginTop:3,flexWrap:"wrap"}}>
                        {f.pre>=7&&<span className="tag tag-green">PRE {f.pre}</span>}
                        {f.pro&&<span className="tag tag-cyan">PRO</span>}
                        {f.fib>=5&&<span className="tag tag-purple">FIB {f.fib}g</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Foods to avoid */}
            <div style={{flex:"0 0 300px",minWidth:260}}>
              <div style={{fontSize:12,color:"rgba(248,113,113,0.6)",fontFamily:"'Space Mono',monospace",
                letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12,
                paddingBottom:6,borderBottom:"1px solid rgba(248,113,113,0.12)"}}>
                ✗ {t.symAvoid}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {analysis.avoidFoods.map(f=>(
                  <div key={f.id} style={{
                    padding:"8px 12px",background:"rgba(248,113,113,0.04)",
                    border:"1px solid rgba(248,113,113,0.1)",borderRadius:8,
                    display:"flex",alignItems:"center",gap:8,
                  }}>
                    <span style={{fontSize:16}}>{f.ic}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:500,color:"#1e293b"}}>{name(f)}</div>
                      <div style={{fontSize:10,color:"#64748b",marginTop:1}}>
                        {f.cal} kcal · {f.c}g carbs
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PARTICLE BACKGROUND (decorative)
// ============================================================
function ParticleField(){
  const particles=useMemo(()=>
    Array.from({length:22},(_,i)=>({
      id:i,
      x:Math.random()*100,
      y:Math.random()*100,
      r:Math.random()*2+0.8,
      dur:4+Math.random()*6,
      del:Math.random()*4,
      col:["#64ffda","#00d4ff","#a78bfa","#34d399"][i%4],
    }))
  ,[]);
  return(
    <svg style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0,opacity:.35}}
      xmlns="http://www.w3.org/2000/svg">
      {particles.map(p=>(
        <circle key={p.id} cx={`${p.x}%`} cy={`${p.y}%`} r={p.r} fill={p.col}
          style={{animation:`blobPulse ${p.dur}s ${p.del}s ease-in-out infinite`}}/>
      ))}
    </svg>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App(){
  const [lang,setLang]=useState("ru");
  const [tab,setTab]=useState(0);
  const [calcLog,setCalcLog]=useState([]);
  const [age,setAge]=useState(30);

  const t=T[lang];
  const baseline=useMemo(()=>getBaselineByAge(age),[age]);
  const mb=useMemo(()=>calcMicrobiome(calcLog,baseline),[calcLog,baseline]);

  return(
    <div style={{
      minHeight:"100vh",
      position:"relative",
      backgroundImage:`
        linear-gradient(rgba(13,148,136,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(13,148,136,0.05) 1px, transparent 1px)
      `,
      backgroundSize:"52px 52px",
    }}>
      <ParticleField/>

      {/* ── HEADER ── */}
      <header style={{
        position:"sticky",top:0,zIndex:100,
        borderBottom:"1px solid rgba(13,148,136,0.12)",
        background:"rgba(255,255,255,0.96)",
        backdropFilter:"blur(16px)",
        padding:"0 20px",
        display:"flex",alignItems:"center",gap:12,height:60,
      }}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div style={{
            width:36,height:36,borderRadius:"50%",flexShrink:0,
            background:"radial-gradient(circle, rgba(13,148,136,0.12), rgba(8,145,178,0.05))",
            border:"1px solid rgba(100,255,218,0.3)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,
            boxShadow:"0 0 20px rgba(13,148,136,0.18)",
          }}>🧫</div>
          <div>
            <div style={{fontFamily:"'Space Mono',monospace",fontWeight:700,fontSize:15,
              color:"#0d9488",letterSpacing:"-0.02em"}}>
              {t.title}
            </div>
            <div style={{fontSize:9,color:"#94a3b8",fontFamily:"'Space Mono',monospace",letterSpacing:"0.12em"}}>
              {t.sub}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",flex:1,justifyContent:"center",borderBottom:"none",overflowX:"auto"}}>
          {t.tabs.map((label,i)=>(
            <button key={i} className={`mv-tab${tab===i?" active":""}`} onClick={()=>setTab(i)}>
              {["⚗️","📋","🎯","🩺"][i]} {label}
            </button>
          ))}
        </div>

        {/* Age input */}
        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
          <label style={{
            fontSize:10,color:"rgba(30,41,59,0.55)",
            fontFamily:"'Space Mono',monospace",letterSpacing:"0.06em",
            textTransform:"uppercase",whiteSpace:"nowrap",
          }}>
            {t.age}
          </label>
          <input
            type="number" min={1} max={100} value={age}
            onChange={e=>setAge(Math.max(1,Math.min(100,Number(e.target.value)||30)))}
            style={{
              width:52,padding:"4px 8px",textAlign:"center",
              background:"#f0fdf9",
              border:"1px solid rgba(13,148,136,0.18)",
              borderRadius:6,color:"#1e293b",
              fontFamily:"'Space Mono',monospace",fontSize:12,
              outline:"none",
            }}
          />
        </div>

        {/* Lang switcher */}
        <div style={{display:"flex",gap:4,flexShrink:0}}>
          {["ru","en"].map(l=>(
            <button key={l} className="mv-btn"
              style={{
                background:lang===l?"rgba(13,148,136,0.1)":"transparent",
                color:lang===l?"#0d9488":"#94a3b8",
                border:`1px solid ${lang===l?"rgba(13,148,136,0.3)":"transparent"}`,
                padding:"5px 10px",fontFamily:"'Space Mono',monospace",
                fontSize:11,fontWeight:700,letterSpacing:"0.05em",
              }}
              onClick={()=>setLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={{maxWidth:1240,margin:"0 auto",padding:"24px 16px",position:"relative",zIndex:1}}>
        {tab===0&&<CalculatorTab log={calcLog} mb={mb} setLog={setCalcLog} t={t} lang={lang} baseline={baseline}/>}
        {tab===1&&<DiaryTab t={t} lang={lang} baseline={baseline}/>}
        {tab===2&&<RecommendationsTab log={calcLog} mb={mb} t={t} lang={lang} baseline={baseline}/>}
        {tab===3&&<SymptomsTab t={t} lang={lang}/>}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop:"1px solid rgba(100,255,218,0.06)",
        padding:"14px 24px",
        display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,
        background:"rgba(240,249,245,0.95)",
        position:"relative",zIndex:1,
      }}>
        <div style={{fontSize:11,color:"#94a3b8",fontFamily:"'Space Mono',monospace"}}>
          MicroVerse: Gut & Food Lab · v1.0 · 2026
        </div>
        <div style={{fontSize:11,color:"#94a3b8"}}>
          {lang==="ru"
            ?"Только для образовательных целей. Не является медицинским советом."
            :"For educational purposes only. Not medical advice."}
        </div>
      </footer>
    </div>
  );
}
