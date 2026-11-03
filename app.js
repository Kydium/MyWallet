/* My Wallet — lógica de la app.
   Datos en Firebase Realtime Database, en billetera/{uid}:
     settings  {name, accent, currency}
     accounts  {id: {name, type, initial, color, icon, limit?, closeDay?, payDay?, order}}
     cats      {id: {name, icon, color, limit, order}}
     tx        {id: {date, desc, cat, acc, to?, amount, created}}
     goals     {id: {name, target, saved, icon, color, order}}
     bills     {id: {name, amount, day, cat, acc, paid: {"YYYY-MM": true}, order}}
*/
(function () {
'use strict';

/* ------------------------------------------------------------------ */
/* Catálogos                                                           */
/* ------------------------------------------------------------------ */
var ICONS = {
  home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
  cart:'<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 12h12L22 7H6"/>',
  food:'<path d="M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 0-3 2-3 5s1 4 3 4v9"/>',
  coffee:'<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 11h2a2 2 0 0 1 0 4h-2M8 3v3M12 3v3"/>',
  bus:'<rect x="4" y="4" width="16" height="13" rx="3"/><path d="M4 11h16M7 20v-3M17 20v-3"/>',
  car:'<path d="M5 15l1.6-5.2A2 2 0 0 1 8.5 8.4h7a2 2 0 0 1 1.9 1.4L19 15"/><rect x="3" y="15" width="18" height="4" rx="1.5"/><path d="M6 19v2M18 19v2"/>',
  plane:'<path d="M2 12l20-8-6 18-4-8z"/><path d="M12 14l10-10"/>',
  play:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/>',
  game:'<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3M16 12h.01M18 14h.01"/>',
  music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  heart:'<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  gym:'<path d="M6 6v12M18 6v12M3 9v6M21 9v6M6 12h12"/>',
  school:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
  book:'<path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z"/>',
  gift:'<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18M12 8v13M12 8S10 3 7.5 4.5 9 8 12 8zM12 8s2-5 4.5-3.5S15 8 12 8z"/>',
  shirt:'<path d="M8 3 3 6l2 5 3-1v11h8V10l3 1 2-5-5-3a4 4 0 0 1-8 0z"/>',
  paw:'<circle cx="7" cy="9" r="1.8"/><circle cx="12" cy="6.5" r="1.8"/><circle cx="17" cy="9" r="1.8"/><path d="M8 17c0-3 2-5 4-5s4 2 4 5c0 2-2 3-4 3s-4-1-4-3z"/>',
  bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  wifi:'<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01"/>',
  tool:'<path d="M14.5 6.5a4 4 0 0 0 5 5l-8.5 8.5a2.1 2.1 0 0 1-3-3l8.5-8.5a4 4 0 0 0-2-2z"/>',
  briefcase:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
  star:'<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  dots:'<circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/>',
  cash:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
  phone:'<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
  bank:'<path d="M3 10h18L12 4z"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
  card:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
  safe:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="12" cy="12" r="3.5"/><path d="M12 8.5v1M12 14.5v1"/>',
  wallet:'<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/><path d="M21 10h-5a2 2 0 0 0 0 4h5z"/>',
  coins:'<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7"/><path d="M9 15v2c0 1.7 2.7 3 6 3s6-1.3 6-3v-5c0-1.7-2.7-3-6-3"/>'
};
var ICON_KEYS = Object.keys(ICONS);
var COLORS = {
  verde:{soft:'#E3F2EA', ink:'#0E7C5A', dot:'#2FA37A'},
  azul:{soft:'#E5EEFB', ink:'#2F67C4', dot:'#4C8BE8'},
  marino:{soft:'#E8EDF5', ink:'#3B5B8C', dot:'#3B5B8C'},
  morado:{soft:'#EEE8F8', ink:'#6A43B5', dot:'#A47BE0'},
  rosa:{soft:'#FBE4EC', ink:'#A8325E', dot:'#E0679A'},
  rojo:{soft:'#FBE4E1', ink:'#A8321F', dot:'#D9472B'},
  naranja:{soft:'#FBEADF', ink:'#B4501A', dot:'#E07A3F'},
  amarillo:{soft:'#FBF1D6', ink:'#8A6410', dot:'#E0A92E'},
  turquesa:{soft:'#DDF1F0', ink:'#1D6F6A', dot:'#2E9C94'},
  gris:{soft:'#ECEAE3', ink:'#55524A', dot:'#9C968A'}
};
var ACCENTS = {
  verde:{main:'#0E7C5A', soft:'#E3F2EA', ink:'#0A5A41', light:'#6FD6A8'},
  azul:{main:'#2563C9', soft:'#E3ECFB', ink:'#1A4590', light:'#8DB5FF'},
  morado:{main:'#6D44C9', soft:'#EDE7FB', ink:'#4C2E93', light:'#BBA3F5'},
  rosa:{main:'#C23A6B', soft:'#FBE4EC', ink:'#8E2449', light:'#F7A1C0'},
  naranja:{main:'#C2551F', soft:'#FBE9DF', ink:'#8C3A12', light:'#FFB27A'},
  grafito:{main:'#2F343C', soft:'#E7E8EA', ink:'#1C2026', light:'#C9CDD4'}
};
var CURRENCIES = ['S/', 'US$', '€'];
var TYPES = {
  efectivo:{name:'Efectivo', icon:'cash'},
  digital:{name:'Billetera digital', icon:'phone'},
  banco:{name:'Cuenta bancaria', icon:'bank'},
  ahorros:{name:'Ahorros', icon:'safe'},
  credito:{name:'Tarjeta de crédito', icon:'card'}
};
var INCOME = {id:'ingreso', name:'Ingreso', color:'verde', icon:'coins'};
var TRANSFER = {id:'transfer', name:'Transferencia', color:'gris', icon:'wallet'};
var GOAL_CAT = {id:'goal', name:'Meta de ahorro', color:'amarillo', icon:'star'};
/* Transferencias, cuentas compartidas y metas no cuentan como gasto ni ingreso. */
function noStat(t) { return t.cat === 'transfer' || t.cat === 'shared' || t.cat === 'goal'; }
var P = {
  plus:'<path d="M12 5v14M5 12h14"/>', edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  warn:'<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.5"/>', search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  down:'<path d="M3 7l6 6 4-4 8 8"/><path d="M14 17h7v-7"/>', up:'<path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', flag:'<path d="M5 21V4h11l-2 4 2 4H5"/>',
  left:'<path d="m15 6-6 6 6 6"/>', right:'<path d="m9 6 6 6-6 6"/>', check:'<path d="m5 12 5 5 9-10"/>',
  filter:'<path d="M4 6h16M7 12h10M10 18h4"/>', chevDown:'<path d="m6 9 6 6 6-6"/>', chevUp:'<path d="m6 15 6-6 6 6"/>',
  download:'<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 17v3h16v-3"/>', logout:'<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/>'
};
var MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
var MES3 = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
var DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];

function defaultCats() {
  return [
    {name:'Vivienda', color:'marino', icon:'home', limit:0},
    {name:'Comida', color:'naranja', icon:'cart', limit:0},
    {name:'Transporte', color:'azul', icon:'bus', limit:0},
    {name:'Ocio', color:'morado', icon:'play', limit:0},
    {name:'Salud', color:'verde', icon:'heart', limit:0},
    {name:'Servicios', color:'amarillo', icon:'bolt', limit:0},
    {name:'Otros', color:'gris', icon:'dots', limit:0}
  ];
}

/* ------------------------------------------------------------------ */
/* Estado                                                              */
/* ------------------------------------------------------------------ */
var S = { user:null, accounts:[], cats:[], tx:[], goals:[], bills:[], settings:{name:'', accent:'verde', currency:'S/'} };
var ref = null, seeding = false;
var viewMonth = ym(new Date());
var fKind = 'todos', fAccs = [], fCats = [], filterOpen = false, query = '';
var installEvt = null, confirmLogout = false;

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */
function $(id) { return document.getElementById(id); }
function pad(n) { return String(n).padStart(2, '0'); }
function ym(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1); }
function todayISO() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function curYM() { return ym(new Date()); }
function daysIn(m) { var p = m.split('-'); return new Date(+p[0], +p[1], 0).getDate(); }
function shiftMonth(m, n) { var p = m.split('-'); var d = new Date(+p[0], +p[1] - 1 + n, 1); return ym(d); }
function monthTitle(m) { var p = m.split('-'); var s = MESES[+p[1] - 1]; return s.charAt(0).toUpperCase() + s.slice(1) + ' ' + p[0]; }
function monthShort(m) { var s = MES3[+m.split('-')[1] - 1]; return s.charAt(0).toUpperCase() + s.slice(1); }

var nf = new Intl.NumberFormat('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
function money(n) { return S.settings.currency + ' ' + nf.format(Math.abs(n)); }
function signed(n) { return (n < 0 ? '−' : '+') + money(n); }
function round2(n) { return Math.round(n * 100) / 100; }
function num(v) { var n = parseFloat(String(v).replace(/,/g, '').trim()); return isFinite(n) ? round2(n) : NaN; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function svg(key, size, sw) {
  if (typeof key === 'string' && key.indexOf('ti-') === 0) return '<i class="ti ' + key.replace(/[^a-z0-9-]/g, '') + '" style="font-size:' + (size || 20) + 'px;line-height:1;font-style:normal" aria-hidden="true"></i>';
  var p = ICONS[key] || key; return '<svg width="' + (size || 20) + '" height="' + (size || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.8) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; }
function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }
function hexRGB(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function hexA(h, a) { var c = hexRGB(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
function mixHex(h, w, t) { var a = hexRGB(h), b = hexRGB(w); return '#' + a.map(function (v, i) { return ('0' + Math.round(v + (b[i] - v) * t).toString(16)).slice(-2); }).join(''); }
function C(k) {
  var c = COLORS[k] || COLORS.gris;
  if (!isDark()) return c;
  return {soft: hexA(c.dot, .2), ink: mixHex(c.dot, '#ffffff', .35), dot: c.dot};
}
function tile(iconKey, colorKey, size, r) { var c = C(colorKey); return '<span class="ico" style="background:' + c.soft + ';color:' + c.ink + (size ? ';width:' + size + 'px;height:' + size + 'px' : '') + (r ? ';border-radius:' + r + 'px' : '') + '">' + svg(iconKey, size ? Math.round(size / 2) : 16, 2) + '</span>'; }
function cat(id) { if (id === 'ingreso') return INCOME; if (id === 'transfer') return TRANSFER; if (id === 'shared') return SHARED_CAT; if (id === 'goal') return GOAL_CAT; return S.cats.filter(function (c) { return c.id === id; })[0] || {id:id, name:'Sin categoría', color:'gris', icon:'dots', limit:0}; }
function acc(id) { return S.accounts.filter(function (a) { return a.id === id; })[0] || {id:id, name:'Cuenta eliminada', type:'efectivo', color:'gris', icon:'cash', initial:0}; }
function accIcon(a) { return a.icon || (TYPES[a.type] || TYPES.efectivo).icon; }
function isCredit(a) { return a.type === 'credito'; }
function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
function dayLabel(iso) {
  var d = new Date(iso + 'T12:00:00'), t = new Date(todayISO() + 'T12:00:00');
  var diff = Math.round((t - d) / 86400000), base = d.getDate() + ' ' + MES3[d.getMonth()];
  if (diff === 0) return 'Hoy · ' + base; if (diff === 1) return 'Ayer · ' + base;
  return DIAS[d.getDay()] + ' · ' + base;
}
function shortDay(iso) {
  var d = new Date(iso + 'T12:00:00'), t = new Date(todayISO() + 'T12:00:00'), diff = Math.round((t - d) / 86400000);
  if (diff === 0) return 'Hoy'; if (diff === 1) return 'Ayer'; return d.getDate() + ' ' + MES3[d.getMonth()];
}
function nextDateLabel(day) {
  var t = new Date(); var m = t.getDate() <= day ? t.getMonth() : t.getMonth() + 1;
  var y = t.getFullYear() + (m > 11 ? 1 : 0);
  var dim = new Date(y, (m % 12) + 1, 0).getDate();
  return Math.min(day, dim) + ' ' + MES3[m % 12];
}
function dLabel(d) { return d.getDate() + ' ' + MES3[d.getMonth()]; }
function dISO(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function dayIn(y, m, day) { var dim = new Date(y, m + 1, 0).getDate(); return new Date(y, m, Math.min(day, dim), 12); }
/* Ciclo de una tarjeta: lo consumido hasta el último cierre se paga en la fecha de pago siguiente a ese cierre;
   lo consumido después del cierre se paga en la fecha de pago siguiente al próximo cierre. */
function cardInfo(a) {
  var t = new Date(); t.setHours(12, 0, 0, 0);
  var cd = a.closeDay || 1, pd = a.payDay || 1;
  var lastClose = dayIn(t.getFullYear(), t.getMonth(), cd);
  if (lastClose > t) lastClose = dayIn(t.getFullYear(), t.getMonth() - 1, cd);
  var nextClose = dayIn(lastClose.getFullYear(), lastClose.getMonth() + 1, cd);
  function dueAfter(c) { var d = dayIn(c.getFullYear(), c.getMonth(), pd); if (d <= c) d = dayIn(c.getFullYear(), c.getMonth() + 1, pd); return d; }
  var lc = dISO(lastClose), billed = 0, cycle = 0, paid = 0;
  if (a.initial) { if (a.created && a.created <= lastClose.getTime()) billed += a.initial; else cycle += a.initial; }
  S.tx.forEach(function (x) {
    if (x.cat === 'transfer') {
      if (x.to === a.id) paid += x.amount;
      if (x.acc === a.id) { if (x.date <= lc) billed += x.amount; else cycle += x.amount; }
    } else if (x.acc === a.id) { if (x.date <= lc) billed -= x.amount; else cycle -= x.amount; }
  });
  var stmt = round2(billed - paid), extra = 0;
  if (stmt < 0) { extra = -stmt; stmt = 0; }
  cycle = Math.max(round2(cycle - extra), 0);
  var lastDue = dueAfter(lastClose), nextDue = dueAfter(nextClose);
  return {lastClose:lastClose, nextClose:nextClose, lastDue:lastDue, nextDue:nextDue, stmt:stmt, cycle:cycle, overdue: stmt > 0 && lastDue < t, dueToday: stmt > 0 && dISO(lastDue) === dISO(t)};
}
function clean(o) { var r = {}; Object.keys(o).forEach(function (k) { if (o[k] !== undefined && k !== 'id') r[k] = o[k]; }); return r; }
function toList(obj) {
  if (!obj) return [];
  return Object.keys(obj).map(function (k) { var v = obj[k] || {}; var o = {}; Object.keys(v).forEach(function (x) { o[x] = v[x]; }); o.id = k; return o; })
    .sort(function (a, b) { return (a.order || 0) - (b.order || 0) || String(a.id).localeCompare(String(b.id)); });
}
function newId() { return ref ? ref.push().key : ('l' + Date.now()); }
function nextOrder(list) { return list.reduce(function (m, x) { return Math.max(m, x.order || 0); }, 0) + 1; }

/* ------------------------------------------------------------------ */
/* Firebase                                                            */
/* ------------------------------------------------------------------ */
firebase.initializeApp(window.FIREBASE_CONFIG);
var auth = firebase.auth();
var db = firebase.database();
var provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({prompt:'select_account'});

function fail(e) {
  console.error(e);
  toast(e && e.code === 'PERMISSION_DENIED' ? 'No tienes permiso para guardar. Vuelve a iniciar sesión.' : 'No se pudo guardar. Revisa tu conexión.');
}
/* ---------- Modo sin conexión ----------
   LOCAL es la copia completa de tu billetera guardada en este dispositivo.
   Cada cambio se aplica primero a LOCAL (se ve al instante y queda guardado aunque cierres la app)
   y se anota en una "bandeja de salida" que se envía a Firebase; cuando Firebase confirma, sale de la bandeja.
   Si no hay internet, la bandeja espera y se envía sola al volver la conexión, incluso si cerraste la app. */
var LOCAL = null, SHARED = {}, shRefs = {}, outbox = [], online = true, onlineKnown = false;
function uidNow() { return S.user ? S.user.uid : ''; }
function cacheKey() { return 'mw-cache-' + uidNow(); }
function outboxKey() { return 'mw-outbox-' + uidNow(); }
function sharedKey() { return 'mw-shared-' + uidNow(); }
function loadLocal() {
  try { LOCAL = JSON.parse(localStorage.getItem(cacheKey()) || 'null'); } catch (e) { LOCAL = null; }
  try { outbox = JSON.parse(localStorage.getItem(outboxKey()) || '[]'); } catch (e) { outbox = []; }
  try { SHARED = JSON.parse(localStorage.getItem(sharedKey()) || '{}') || {}; } catch (e) { SHARED = {}; }
  if (!Array.isArray(outbox)) outbox = [];
  /* cambios guardados por versiones anteriores: rutas relativas a tu billetera */
  outbox.forEach(function (it) { if (!it.abs) { it.upd = absPaths(it.upd); it.abs = true; } });
}
function saveLocal() { try { localStorage.setItem(cacheKey(), JSON.stringify(LOCAL)); } catch (e) {} }
function saveOutbox() { try { localStorage.setItem(outboxKey(), JSON.stringify(outbox)); } catch (e) {} }
function saveShared() { try { localStorage.setItem(sharedKey(), JSON.stringify(SHARED)); } catch (e) {} }
function clearLocal() {
  try { localStorage.removeItem(cacheKey()); localStorage.removeItem(outboxKey()); localStorage.removeItem(sharedKey()); } catch (e) {}
  Object.keys(shRefs).forEach(function (k) { shRefs[k].off(); }); shRefs = {};
  LOCAL = null; outbox = []; SHARED = {};
}
function applyUpd(obj, upd) {
  Object.keys(upd).forEach(function (path) {
    var parts = path.split('/').filter(Boolean), o = obj;
    for (var i = 0; i < parts.length - 1; i++) { if (!o[parts[i]] || typeof o[parts[i]] !== 'object') o[parts[i]] = {}; o = o[parts[i]]; }
    var k = parts[parts.length - 1], v = upd[path];
    if (v === null || v === undefined) delete o[k]; else o[k] = JSON.parse(JSON.stringify(v));
  });
}
function absPaths(upd) { var u = {}, bp = 'billetera/' + uidNow() + '/'; Object.keys(upd).forEach(function (k) { u[bp + k] = upd[k]; }); return u; }
/* Aplica un cambio a la copia local: tu billetera (LOCAL) o una cuenta compartida (SHARED[sid]). onlySid limita a una cuenta. */
function applyAbs(upd, onlySid) {
  var bp = 'billetera/' + uidNow() + '/';
  Object.keys(upd).forEach(function (path) {
    var one = {};
    if (path.indexOf(bp) === 0) { if (LOCAL && !onlySid) { one[path.slice(bp.length)] = upd[path]; applyUpd(LOCAL, one); } }
    else if (path.indexOf('shared/') === 0) {
      var rest = path.slice(7), i = rest.indexOf('/'), sid = i < 0 ? rest : rest.slice(0, i);
      if (onlySid && sid !== onlySid) return;
      if (i < 0) { if (upd[path] === null) delete SHARED[sid]; else SHARED[sid] = JSON.parse(JSON.stringify(upd[path])); }
      else { if (!SHARED[sid]) SHARED[sid] = {}; one[rest.slice(i + 1)] = upd[path]; applyUpd(SHARED[sid], one); }
    }
  });
}
function refreshFromLocal() { if (!LOCAL) return; hydrate(JSON.parse(JSON.stringify(LOCAL))); render(); }
function sendItem(item) {
  if (!S.user) return Promise.resolve();
  return db.ref().update(item.upd).then(function () {
    outbox = outbox.filter(function (x) { return x.id !== item.id; }); saveOutbox(); netBadge();
  }).catch(function (e) {
    outbox = outbox.filter(function (x) { return x.id !== item.id; }); saveOutbox(); netBadge(); fail(e);
  });
}
function commitAbs(upd) {
  var item = {id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), upd: upd, abs: true};
  outbox.push(item); saveOutbox();
  applyAbs(upd); saveLocal(); saveShared();
  var p = sendItem(item);
  syncSharedListeners();
  if (LOCAL) refreshFromLocal();
  netBadge();
  return p;
}
function commit(upd) { return commitAbs(absPaths(upd)); }
function put(path, obj) { var u = {}; u[path] = obj; return commit(u); }
function patch(obj) { return commit(obj); }
function del(path) { var u = {}; u[path] = null; return commit(u); }
function globalId() { return db.ref().push().key; }

/* Escucha cada cuenta compartida de la que eres miembro (billetera/{uid}/shared/{sid}). */
function syncSharedListeners() {
  if (!S.user) return;
  var want = LOCAL && LOCAL.shared ? Object.keys(LOCAL.shared) : [];
  Object.keys(shRefs).forEach(function (sid) { if (want.indexOf(sid) < 0) { shRefs[sid].off(); delete shRefs[sid]; } });
  want.forEach(function (sid) {
    if (shRefs[sid]) return;
    var r = db.ref('shared/' + sid); shRefs[sid] = r;
    r.on('value', function (snap) {
      var v = snap.val();
      if (v) { SHARED[sid] = v; outbox.forEach(function (it) { applyAbs(it.upd, sid); }); }
      else if (!outbox.some(function (it) { return Object.keys(it.upd).some(function (k) { return k.indexOf('shared/' + sid) === 0; }); })) delete SHARED[sid];
      saveShared(); refreshFromLocal(); runSharedApply();
    }, function (err) {
      console.warn('shared', sid, err && err.code);
      r.off(); delete shRefs[sid];
      var pending = outbox.some(function (it) { return Object.keys(it.upd).some(function (k) { return k.indexOf('shared/' + sid) === 0; }); });
      if (pending) return;
      delete SHARED[sid]; saveShared();
      if (LOCAL && LOCAL.shared && LOCAL.shared[sid]) { del('shared/' + sid); toast('Ya no eres parte de una cuenta compartida'); }
    });
  });
}
function netBadge() {
  var el = $('net'); if (!el) return;
  var n = outbox.length, icon, color, label;
  if (onlineKnown && !online) { icon = 'ti-cloud-off'; color = 'var(--red)'; label = 'Sin conexión' + (n ? ' · ' + plural(n, 'cambio guardado', 'cambios guardados') + ' en este dispositivo' : ''); }
  else if (n) { icon = 'ti-cloud-upload'; color = 'var(--muted)'; label = 'Sincronizando ' + plural(n, 'cambio', 'cambios'); }
  else { icon = 'ti-cloud-check'; color = 'var(--green)'; label = 'Conectado · todo guardado'; }
  el.innerHTML = svg(icon, 22);
  el.style.color = color;
  el.title = label;
  el.setAttribute('aria-label', label);
}
db.ref('.info/connected').on('value', function (snap) {
  online = !!snap.val();
  if (online) onlineKnown = true;
  netBadge();
});
setTimeout(function () { onlineKnown = true; netBadge(); }, 3500);
window.addEventListener('online', netBadge);
window.addEventListener('offline', function () { online = false; onlineKnown = true; netBadge(); });

function show(which) {
  $('loading').hidden = which !== 'loading';
  $('login').hidden = which !== 'login';
  $('app').hidden = which !== 'app';
  $('bottomnav').hidden = which !== 'app';
}

auth.getRedirectResult().catch(function (e) { loginError(e); });

auth.onAuthStateChanged(function (u) {
  if (ref) { ref.off(); ref = null; }
  S.user = u;
  if (!u) { Object.keys(shRefs).forEach(function (k) { shRefs[k].off(); }); shRefs = {}; LOCAL = null; outbox = []; SHARED = {}; applyAccent(); show('login'); return; }
  ref = db.ref('billetera/' + u.uid);
  loadLocal();
  if (LOCAL && LOCAL.meta) {
    outbox.forEach(function (it) { applyAbs(it.upd); });
    show('app'); refreshFromLocal(); netBadge();
  } else {
    LOCAL = null;
    $('loadingMsg').textContent = navigator.onLine === false ? 'Necesitas internet la primera vez que abres tu billetera en este dispositivo.' : 'Cargando tu billetera…';
    show('loading');
  }
  outbox.slice().forEach(sendItem);
  syncSharedListeners();
  ref.on('value', function (snap) {
    var v = snap.val();
    if (!v || !v.meta) { if (!outbox.length) seedUser(u); return; }
    LOCAL = v;
    var bp = 'billetera/' + u.uid + '/';
    outbox.forEach(function (it) { var one = {}; Object.keys(it.upd).forEach(function (k) { if (k.indexOf(bp) === 0) one[k.slice(bp.length)] = it.upd[k]; }); applyUpd(LOCAL, one); });
    saveLocal();
    show('app');
    syncSharedListeners();
    refreshFromLocal();
    netBadge();
    runAuto();
    runSharedApply();
  }, function (err) {
    console.error(err);
    $('loadingMsg').textContent = 'No se pudo abrir tu billetera (' + (err.code || err.message) + '). Revisa las reglas de la base de datos.';
  });
});

function seedUser(u) {
  if (seeding) return;
  seeding = true;
  var data = {
    meta: {created: firebase.database.ServerValue.TIMESTAMP, email: u.email || ''},
    settings: {name: (u.displayName || '').split(' ')[0] || 'amigo', accent:'verde', currency:'S/'},
    cats: {}, accounts: {}
  };
  defaultCats().forEach(function (c, i) { c.order = i + 1; data.cats[ref.push().key] = c; });
  data.accounts[ref.push().key] = {name:'Efectivo', type:'efectivo', initial:0, color:'verde', icon:'cash', order:1};
  ref.update(data).then(function () { seeding = false; }).catch(function (e) {
    seeding = false; console.error(e);
    $('loadingMsg').textContent = 'No se pudo crear tu billetera (' + (e.code || e.message) + ').';
  });
}

function hydrate(v) {
  S.settings = Object.assign({name:'', accent:'verde', currency:'S/'}, v.settings || {});
  S.accounts = toList(v.accounts);
  S.cats = toList(v.cats);
  S.goals = toList(v.goals);
  S.bills = toList(v.bills).map(function (b) {
    if (!b.freq) b.freq = 'monthly';
    b.done = b.done || {};
    if (b.paid) Object.keys(b.paid).forEach(function (k) { var p = k.split('-'); b.done[dISO(dayIn(+p[0], +p[1] - 1, b.day || 1))] = 'paid'; });
    delete b.paid;
    if (b.freq === 'weekly' && !Array.isArray(b.days)) b.days = b.days ? Object.keys(b.days).map(function (k) { return b.days[k]; }) : [];
    return b;
  });
  S.tx = toList(v.tx);
  S.applied = v.sharedApplied || {};
  S.shareds = Object.keys(v.shared || {}).map(function (sid) { return normShared(sid, SHARED[sid]); }).filter(Boolean);
}

function loginError(e) {
  if (!e) return;
  var map = {
    'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase (Authentication → Settings → Dominios autorizados).',
    'auth/network-request-failed': 'Sin conexión a internet. Inténtalo de nuevo.',
    'auth/operation-not-allowed': 'El inicio de sesión con Google no está activado en Firebase.'
  };
  if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return;
  $('loginErr').textContent = map[e.code] || ('No se pudo iniciar sesión (' + (e.code || e.message) + ').');
}
$('googleBtn').addEventListener('click', function () {
  if (navigator.onLine === false) { $('loginErr').textContent = 'Necesitas internet para iniciar sesión. Después podrás usar la app sin conexión.'; return; }
  var b = $('googleBtn'); b.disabled = true; $('loginErr').textContent = '';
  auth.signInWithPopup(provider).catch(function (e) {
    if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') return auth.signInWithRedirect(provider);
    loginError(e);
  }).then(function () { b.disabled = false; });
});

/* ------------------------------------------------------------------ */
/* Cálculos                                                            */
/* ------------------------------------------------------------------ */
function movementEffect(id) {
  var s = 0;
  S.tx.forEach(function (t) {
    if (t.cat === 'transfer') { if (t.acc === id) s -= t.amount; if (t.to === id) s += t.amount; }
    else if (t.acc === id) s += t.amount;
  });
  return s;
}
function balances() {
  var bal = {};
  S.accounts.forEach(function (a) { bal[a.id] = round2((isCredit(a) ? -(a.initial || 0) : (a.initial || 0)) + movementEffect(a.id)); });
  return bal;
}
function monthExpense(m) {
  return S.tx.reduce(function (s, t) { return t.date && t.date.slice(0, 7) === m && !noStat(t) && t.amount < 0 ? s - t.amount : s; }, 0);
}
function stats(m) {
  var inc = 0, exp = 0, byCat = {};
  S.cats.forEach(function (c) { byCat[c.id] = 0; });
  S.tx.forEach(function (t) {
    if (!t.date || t.date.slice(0, 7) !== m || noStat(t)) return;
    if (t.amount > 0) inc += t.amount; else { exp -= t.amount; byCat[t.cat] = (byCat[t.cat] || 0) - t.amount; }
  });
  var bal = balances(), cash = 0, debt = 0;
  S.accounts.forEach(function (a) { if (isCredit(a)) debt += Math.max(-bal[a.id], 0); else cash += bal[a.id]; });
  var limit = 0, bspent = 0;
  S.cats.forEach(function (c) { if (c.limit) { limit += c.limit; bspent += byCat[c.id] || 0; } });
  var isCur = m === curYM(), dim = daysIn(m), today = new Date().getDate();
  return {inc:inc, exp:exp, byCat:byCat, bal:bal, cash:cash, debt:debt, net:cash - debt, limit:limit, bspent:bspent,
          isCur:isCur, daysLeft: isCur ? dim - today + 1 : 0, daysElapsed: isCur ? today : dim};
}

/* ------------------------------------------------------------------ */
/* Navegación                                                          */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* Cuentas compartidas (mancomunadas)                                  */
/* shared/{sid}: meta {name, mode, pct{uid}, createdBy, created, invite}
                 members {uid: {name, photo, joined, code}}
                 movs {id: {type: aporte|gasto|saldo, by, to?, amount, desc?, cat?{name,icon,color}, paid?, accName?, date, created, ptx?}} */
/* ------------------------------------------------------------------ */
var SH_COLORS = ['verde', 'rosa', 'azul', 'naranja', 'morado', 'turquesa', 'amarillo', 'marino'];
var SH_MODES = {mitad:{name:'Mitad y mitad', s:'Cada uno pone la misma parte'}, porcentaje:{name:'Por porcentaje', s:'Por ejemplo 60% y 40%'}, fondo:{name:'Solo un fondo común', s:'Sin llevar cuentas de quién debe a quién'}};
var SHARED_CAT = {id:'shared', name:'Cuenta compartida', color:'turquesa', icon:'ti-users'};
var selSh = null, pendingJoinCode = null;

function normShared(sid, raw) {
  if (!raw || !raw.meta) return null;
  var members = Object.keys(raw.members || {}).map(function (uid) { var m = raw.members[uid] || {}; return {uid:uid, name:m.name || 'Miembro', photo:m.photo || '', joined:m.joined || 0}; })
    .sort(function (a, b) { return a.joined - b.joined; });
  members.forEach(function (m, i) { m.color = SH_COLORS[i % SH_COLORS.length]; });
  var movs = Object.keys(raw.movs || {}).map(function (id) { var o = Object.assign({}, raw.movs[id]); o.id = id; return o; })
    .sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : (b.created || 0) - (a.created || 0); });
  var meta = Object.assign({mode:'mitad', pct:{}}, raw.meta);
  return {id:sid, meta:meta, name:meta.name || 'Cuenta compartida', members:members, movs:movs};
}
function shById(sid) { return (S.shareds || []).filter(function (x) { return x.id === sid; })[0] || null; }
function shMember(sh, uid) { return sh.members.filter(function (m) { return m.uid === uid; })[0] || {uid:uid, name:'Ex miembro', color:'gris', joined:0}; }
function shWho(sh, uid) { return uid === uidNow() ? 'Tú' : shMember(sh, uid).name; }
function shAv(sh, uid, size) {
  var m = shMember(sh, uid), c = C(m.color), s = size || 32, ini = esc(((m.name || '?').trim()[0] || '?').toUpperCase());
  return '<span class="avatar" style="width:' + s + 'px;height:' + s + 'px;border-radius:' + (s / 2) + 'px;background:' + c.soft + ';color:' + c.ink + ';font-size:' + Math.round(s * 0.4) + 'px">' + (m.photo ? '<img src="' + esc(m.photo) + '" alt="" referrerpolicy="no-referrer">' : ini) + '</span>';
}
function shFund(sh) { var f = 0; sh.movs.forEach(function (m) { if (m.type === 'aporte') f += m.amount; if (m.type === 'gasto' && m.paid === 'fondo') f -= m.amount; }); return round2(f); }
function shTotals(sh) {
  var ap = 0, g = 0; sh.movs.forEach(function (m) { if (m.type === 'aporte') ap += m.amount; if (m.type === 'gasto') g += m.amount; });
  return {aportes:round2(ap), gastos:round2(g)};
}
function shMembersAt(sh, ts) { return sh.members.filter(function (m) { return (m.joined || 0) <= (ts || 0) + 1000; }).map(function (m) { return m.uid; }); }
function shShareAt(sh, uid, list) {
  if (list.indexOf(uid) < 0) return 0;
  if (sh.meta.mode === 'porcentaje') {
    var pct = sh.meta.pct || {}, all = list.every(function (u) { return pct[u] != null; });
    var tot = list.reduce(function (a, u) { return a + (+pct[u] || 0); }, 0);
    if (all && tot > 0) return (+pct[uid] || 0) / tot;
  }
  return 1 / list.length;
}
function shShareNow(sh, uid) { return shShareAt(sh, uid, sh.members.map(function (m) { return m.uid; })); }
/* Quien se une después solo comparte lo que pasa desde que entró. */
function shBalances(sh) {
  var put = {}, exp = {}, diff = {};
  sh.members.forEach(function (m) { put[m.uid] = 0; exp[m.uid] = 0; });
  sh.movs.forEach(function (m) {
    if (m.type === 'aporte' || (m.type === 'gasto' && m.paid === 'propia')) {
      if (put[m.by] != null) put[m.by] += m.amount;
      var list = shMembersAt(sh, m.created);
      sh.members.forEach(function (x) { exp[x.uid] += m.amount * shShareAt(sh, x.uid, list); });
    } else if (m.type === 'saldo') {
      if (put[m.by] != null) put[m.by] += m.amount;
      if (put[m.to] != null) put[m.to] -= m.amount;
    }
  });
  sh.members.forEach(function (m) { put[m.uid] = round2(put[m.uid]); exp[m.uid] = round2(exp[m.uid]); diff[m.uid] = round2(put[m.uid] - exp[m.uid]); });
  return {put:put, exp:exp, diff:diff};
}
function shDebts(sh) {
  if (sh.meta.mode === 'fondo') return [];
  var d = shBalances(sh).diff, pos = [], neg = [], out = [];
  sh.members.forEach(function (m) { if (d[m.uid] > 0.004) pos.push({u:m.uid, v:d[m.uid]}); else if (d[m.uid] < -0.004) neg.push({u:m.uid, v:-d[m.uid]}); });
  pos.sort(function (a, b) { return b.v - a.v; }); neg.sort(function (a, b) { return b.v - a.v; });
  var i = 0, j = 0;
  while (i < neg.length && j < pos.length) {
    var x = Math.min(neg[i].v, pos[j].v);
    out.push({from:neg[i].u, to:pos[j].u, amount:round2(x)});
    neg[i].v -= x; pos[j].v -= x;
    if (neg[i].v < 0.005) i++; if (pos[j].v < 0.005) j++;
  }
  return out;
}
function myShareValue(sh) { return round2(shFund(sh) * shShareNow(sh, uidNow())); }

/* Cuando alguien te paga para quedar parejos, ese pago entra a tu primera cuenta (que no sea tarjeta). */
var applyBusy = false;
function runSharedApply() {
  if (applyBusy || !S.user || !LOCAL) return;
  var me = uidNow(), target = S.accounts.filter(function (a) { return !isCredit(a); })[0];
  if (!target) return;
  var upd = {}, n = 0;
  (S.shareds || []).forEach(function (sh) {
    sh.movs.forEach(function (m) {
      if (m.type !== 'saldo' || m.to !== me) return;
      var key = sh.id + '_' + m.id;
      if (S.applied[key]) return;
      upd['tx/' + globalId()] = {date:m.date, desc:'Pago de ' + shMember(sh, m.by).name + ' · ' + sh.name, cat:'shared', acc:target.id, amount:m.amount, created:Date.now() + n, shared:sh.id, smov:m.id};
      upd['sharedApplied/' + key] = true;
      n++;
    });
  });
  if (!n) return;
  applyBusy = true;
  commit(upd);
  applyBusy = false;
  toast(n === 1 ? 'Recibiste un pago en una cuenta compartida' : 'Recibiste ' + n + ' pagos en cuentas compartidas');
}

var VIEWS = [
  {id:'inicio', name:'Inicio', icon:'home'},
  {id:'presupuesto', name:'Presupuesto', icon:P.target},
  {id:'movimientos', name:'Movimientos', icon:P.list},
  {id:'estadisticas', name:'Estadísticas', icon:P.chart},
  {id:'billetera', name:'Mi billetera', short:'Billetera', icon:'wallet'},
  {id:'personalizar', name:'Configuración', icon:P.gear}
];
var ALIAS = {cuentas:'billetera', reportes:'estadisticas', metas:'presupuesto', configuracion:'personalizar'};
var SUBVIEWS = {'cfg-cuentas':1, 'cfg-categorias':1, 'cfg-pagos':1, 'cfg-metas':1, 'cfg-compartidas':1, 'compartida':1};
function current() { var h = (location.hash || '').slice(1); h = ALIAS[h] || h; if (SUBVIEWS[h]) return h; return VIEWS.some(function (v) { return v.id === h; }) ? h : 'inicio'; }

function renderNav() {
  var cur = current();
  $('sidenav').innerHTML = VIEWS.map(function (v) {
    return '<a class="navlink" href="#' + v.id + '"' + (v.id === cur || (cur === 'compartida' ? v.id === 'billetera' : SUBVIEWS[cur] && v.id === 'personalizar') ? ' aria-current="page"' : '') + '>' + svg(v.icon, 20) + v.name + '</a>';
  }).join('');
  var mob = ['inicio', 'presupuesto', 'movimientos', 'estadisticas', 'billetera'], parent = {personalizar:'inicio'};
  var html = '<button class="fab" data-open-add aria-label="Agregar movimiento">' + svg(P.plus, 26, 2.2) + '</button>';
  mob.forEach(function (id) {
    var v = VIEWS.filter(function (x) { return x.id === id; })[0];
    var on = id === cur || parent[cur] === id || (cur === 'compartida' ? id === 'billetera' : SUBVIEWS[cur] && id === 'inicio');
    html += '<a href="#' + id + '"' + (on ? ' aria-current="page"' : '') + '>' + svg(v.icon, 22) + (v.short || v.name) + '</a>';
  });
  $('bottomnav').innerHTML = html;
  var u = S.user;
  if (u) $('sideUser').innerHTML = avatar(u) + '<div style="min-width:0;display:flex;flex-direction:column"><b style="color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(u.displayName || 'Tu cuenta') + '</b><a class="link" href="#personalizar">Ajustes y cuenta</a></div>';
}
function avatar(u) {
  var initial = esc(((u.displayName || u.email || '?').trim()[0] || '?').toUpperCase());
  return '<span class="avatar">' + (u.photoURL ? '<img src="' + esc(u.photoURL) + '" alt="" referrerpolicy="no-referrer">' : initial) + '</span>';
}
function monthNav() {
  var atCur = viewMonth >= curYM();
  return '<div class="monthnav"><button data-month="-1" aria-label="Mes anterior">' + svg(P.left, 18, 2) + '</button><b>' + monthTitle(viewMonth) + '</b><button data-month="1" aria-label="Mes siguiente"' + (atCur ? ' disabled' : '') + '>' + svg(P.right, 18, 2) + '</button></div>';
}

/* ------------------------------------------------------------------ */
/* Piezas de vista                                                     */
/* ------------------------------------------------------------------ */
function txRow(t, withDay) {
  if (t.cat === 'shared') {
    var sc = C(SHARED_CAT.color);
    return '<div class="tx"><button class="rowbtn" data-open-shared="' + esc(t.shared || '') + '" aria-label="Ver la cuenta compartida"><span class="ic" style="background:' + sc.soft + ';color:' + sc.ink + '">' + svg(SHARED_CAT.icon, 20) + '</span>' +
      '<span class="t"><b>' + esc(t.desc) + '</b><span>Cuenta compartida · ' + esc(acc(t.acc).name) + (withDay ? ' · ' + shortDay(t.date) : '') + '</span></span><span class="amt" style="color:var(--muted)">' + signed(t.amount) + '</span></button></div>';
  }
  if (t.cat === 'goal') {
    var gl = S.goals.filter(function (x) { return x.id === t.goal; })[0], gc = C(gl ? (gl.color || 'amarillo') : 'amarillo');
    return '<div class="tx"><button class="rowbtn" ' + (gl ? 'data-edit-goal="' + esc(gl.id) + '"' : 'data-edit-tx="' + esc(t.id) + '"') + ' aria-label="Ver la meta"><span class="ic" style="background:' + gc.soft + ';color:' + gc.ink + '">' + svg(gl ? (gl.icon || 'star') : 'star', 20) + '</span>' +
      '<span class="t"><b>' + esc(t.desc) + '</b><span>Meta de ahorro · ' + esc(acc(t.acc).name) + (withDay ? ' · ' + shortDay(t.date) : '') + '</span></span><span class="amt" style="color:var(--muted)">' + signed(t.amount) + '</span></button></div>';
  }
  var c = cat(t.cat), a = acc(t.acc), isT = t.cat === 'transfer';
  var meta = isT ? a.name + ' → ' + acc(t.to).name : c.name + ' · ' + a.name;
  var amt = isT ? '<span class="amt" style="color:var(--muted)">' + money(t.amount) + '</span>' : '<span class="amt" style="' + (t.amount > 0 ? 'color:var(--green)' : '') + '">' + signed(t.amount) + '</span>';
  var cc = C(c.color);
  return '<div class="tx"><button class="rowbtn" data-edit-tx="' + esc(t.id) + '" aria-label="Editar ' + esc(t.desc) + '"><span class="ic" style="background:' + cc.soft + ';color:' + cc.ink + '">' + svg(c.icon, 20) + '</span>' +
    '<span class="t"><b>' + esc(t.desc) + '</b><span>' + esc(meta) + (withDay ? ' · ' + shortDay(t.date) : '') + '</span></span>' + amt + '</button></div>';
}
function sortedTx(list) { return (list || S.tx).slice().sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : ((b.created || 0) - (a.created || 0)); }); }
function accTile(a, bal) {
  var val = isCredit(a)
    ? '<span class="v">' + money(Math.max((a.limit || 0) - Math.max(-bal, 0), 0)) + '</span><span class="n" style="margin-top:-4px">disponible</span>'
    : '<span class="v">' + (bal < 0 ? '−' : '') + money(bal) + '</span>';
  return '<a class="acc" href="#billetera">' + tile(accIcon(a), a.color) + '<span class="n">' + esc(a.name) + '</span>' + val + '</a>';
}
function emptyBox(icon, title, text, btn) {
  return '<div class="card empty"><span class="ic">' + svg(icon, 24, 2) + '</span><b style="font-size:16px">' + title + '</b><span class="sub" style="max-width:340px">' + text + '</span>' + (btn || '') + '</div>';
}
function budgetBlock(s) {
  if (!s.limit) return '<div class="card"><h2>Presupuesto</h2><p class="sub" style="margin:0 0 12px">Ponle un límite mensual a tus categorías y aquí verás cuánto te queda.</p><a class="btn btn-ghost btn-sm" href="#personalizar">Poner límites</a></div>';
  var pct = Math.round(s.bspent / s.limit * 100);
  var over = S.cats.filter(function (c) { return c.limit && (s.byCat[c.id] || 0) > c.limit; });
  return '<div class="card"><div class="row-between" style="margin-bottom:12px"><h2 style="margin:0">Presupuesto de ' + MESES[+viewMonth.split('-')[1] - 1] + '</h2><span class="sub" style="font-weight:600">' + pct + '%</span></div>' +
    '<div class="bar"><div style="width:' + Math.min(pct, 100) + '%;background:' + (pct > 100 ? '#D9472B' : 'var(--green)') + '"></div></div>' +
    '<div class="row-between sub" style="margin-top:10px;font-size:13px"><span>' + money(s.bspent) + ' de ' + money(s.limit) + '</span><span>' + (s.limit - s.bspent >= 0 ? 'Quedan ' + money(s.limit - s.bspent) : 'Te pasaste ' + money(s.bspent - s.limit)) + '</span></div>' +
    over.map(function (c) { return '<div class="alert">' + svg(P.warn, 16, 2) + esc(c.name) + ' superó su límite por ' + money(s.byCat[c.id] - c.limit) + '</div>'; }).join('') + '</div>';
}

/* ------------------------------------------------------------------ */
/* Vistas                                                              */
/* ------------------------------------------------------------------ */
function viewInicio() {
  viewMonth = curYM();
  var s = stats(viewMonth), recent = sortedTx().slice(0, 6);
  var hello = S.settings.name ? 'Hola, ' + esc(S.settings.name) : 'Hola';
  return '<div class="top"><div><div class="sub">' + hello + '</div><h1>' + monthTitle(viewMonth) + '</h1></div><div style="display:flex;gap:8px"><a class="btn btn-ghost iconbtn-round only-m" href="#personalizar" aria-label="Personalizar">' + svg(P.gear, 20) + '</a><button class="btn btn-dark hide-m" data-open-add>' + svg(P.plus, 18, 2.2) + 'Agregar</button></div></div>' +
  '<div class="grid">' +
    '<div class="c7" style="display:flex;flex-direction:column;gap:16px">' +
      '<div class="balance"><div style="display:flex;flex-direction:column;gap:6px"><span class="lbl">Tu dinero</span><span class="big">' + (s.cash < 0 ? '−' : '') + money(s.cash) + '</span>' + (s.debt > 0 ? '<span class="lbl">Deuda en tarjetas: <b style="color:var(--debt)">' + money(s.debt) + '</b></span>' : '') + '</div>' +
      '<div class="duo"><div><span class="lbl" style="font-size:12px">Ingresos del mes</span><b style="color:var(--mint);font-size:15px">+' + money(s.inc) + '</b></div><div><span class="lbl" style="font-size:12px">Gastos del mes</span><b style="font-size:15px">−' + money(s.exp) + '</b></div></div></div>' +
      '<div><div class="row-between" style="margin-bottom:10px"><b style="font-size:15px">Mis cuentas</b><a class="link" href="#billetera">Gestionar</a></div><div class="accounts">' + S.accounts.map(function (a) { return accTile(a, s.bal[a.id]); }).join('') + '</div></div>' +
      budgetBlock(s) +
    '</div>' +
    '<div class="c5" style="display:flex;flex-direction:column;gap:16px">' + upcomingCard() + (recent.length
      ? '<div class="card"><div class="row-between"><h2>Movimientos recientes</h2><a class="link" href="#movimientos">Ver todo</a></div>' + recent.map(function (t) { return txRow(t, true); }).join('') + '</div>'
      : emptyBox('coins', 'Registra tu primer gasto', 'Cada gasto o ingreso que anotes actualiza tus cuentas, tu presupuesto y tus reportes.', '<button class="btn btn-primary" data-open-add style="margin-top:6px">' + svg(P.plus, 18, 2.2) + 'Agregar movimiento</button>')) +
    '</div>' +
  '</div>';
}

function cardDates(a) {
  var ci = cardInfo(a), html = '';
  if (ci.stmt > 0) {
    var col = ci.overdue ? 'var(--red)' : ci.dueToday ? 'var(--red)' : 'var(--ink)';
    html += '<div style="font-size:13px;background:' + (ci.overdue || ci.dueToday ? 'var(--red-soft)' : 'var(--bg)') + ';border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:2px"><span class="sub" style="font-size:12px">Consumos hasta el cierre del ' + dLabel(ci.lastClose) + '</span><div class="row-between"><b style="color:' + col + '">' + money(ci.stmt) + '</b><b style="color:' + col + '">' + (ci.overdue ? 'Venció el ' + dLabel(ci.lastDue) : ci.dueToday ? 'Vence hoy' : 'Pagar antes del ' + dLabel(ci.lastDue)) + '</b></div></div>';
  }
  html += '<div style="font-size:13px;background:var(--bg);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:2px"><span class="sub" style="font-size:12px">Consumos desde el ' + dLabel(new Date(ci.lastClose.getTime() + 86400000)) + ' · cierra el ' + dLabel(ci.nextClose) + '</span><div class="row-between"><b>' + money(ci.cycle) + '</b><b>Se paga el ' + dLabel(ci.nextDue) + '</b></div></div>';
  return html;
}

function viewCuentas() {
  var s = stats(curYM());
  var cards = S.accounts.map(function (a) {
    var bal = s.bal[a.id], body, cc = C(a.color);
    if (isCredit(a)) {
      var debt = Math.max(-bal, 0), lim = a.limit || 0, avail = Math.max(lim - debt, 0), p = lim ? Math.min(Math.round(debt / lim * 100), 100) : 0;
      body = '<div class="row-between"><span class="sub" style="font-size:13px">Disponible</span><b style="font-size:24px;letter-spacing:-.01em">' + money(avail) + '</b></div>' +
        '<div class="bar" style="height:8px"><div style="width:' + p + '%;background:' + (p >= 80 ? '#D9472B' : cc.dot) + '"></div></div>' +
        '<div class="row-between sub" style="font-size:12px"><span>Usado ' + money(debt) + ' (' + p + '%)</span><span>Línea ' + money(lim) + '</span></div>' +
        cardDates(a) +
        (debt > 0 ? '<button class="btn btn-primary btn-sm" data-pay="' + esc(a.id) + '">Pagar tarjeta (' + money(debt) + ')</button>' : '<span class="sub" style="font-size:13px">No tienes deuda en esta tarjeta.</span>');
    } else body = '<b style="font-size:26px;letter-spacing:-.01em">' + (bal < 0 ? '−' : '') + money(bal) + '</b>';
    return '<div class="acccard"><div class="head">' + tile(accIcon(a), a.color, 40, 13) + '<div style="flex:1;min-width:0;display:flex;flex-direction:column"><b style="font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(a.name) + '</b><span class="typetag">' + (TYPES[a.type] || TYPES.efectivo).name + '</span></div>' +
      '<button class="del" data-edit-acc="' + esc(a.id) + '" aria-label="Editar ' + esc(a.name) + '">' + svg(P.edit, 18) + '</button></div>' + body + '</div>';
  }).join('');
  return '<div class="top"><div><div class="sub">Tus cuentas, tarjetas y ahorros</div><h1>Mi billetera</h1></div>' + '<a class="btn btn-ghost btn-sm" href="#personalizar">' + svg(P.gear, 16, 2) + 'Configurar</a>' + '</div>' +
    '<div class="metrics"><div class="metric"><span class="sub" style="font-size:13px">Patrimonio neto</span><b>' + (s.net < 0 ? '−' : '') + money(s.net) + '</b></div><div class="metric"><span class="sub" style="font-size:13px">Tu dinero</span><b style="font-size:18px">' + money(s.cash) + '</b></div><div class="metric"><span class="sub" style="font-size:13px">Deuda en tarjetas</span><b style="font-size:18px;color:' + (s.debt > 0 ? 'var(--red)' : 'inherit') + '">' + money(s.debt) + '</b></div></div>' +
    '<div class="accgrid">' + cards + '</div>' + sharedCards() + goalsCard();
}

function filterCount() { return (fKind !== 'todos' ? 1 : 0) + fAccs.length + fCats.length; }
function viewMovimientos() {
  fAccs = fAccs.filter(function (id) { return S.accounts.some(function (a) { return a.id === id; }); });
  fCats = fCats.filter(function (id) { return S.cats.some(function (c) { return c.id === id; }); });
  var inMonth = S.tx.filter(function (t) { return t.date && t.date.slice(0, 7) === viewMonth; });
  var list = sortedTx(inMonth).filter(function (t) {
    if (fKind === 'gastos' && !(t.amount < 0 && !noStat(t))) return false;
    if (fKind === 'ingresos' && !(t.amount > 0 && !noStat(t))) return false;
    if (fKind === 'transfer' && t.cat !== 'transfer') return false;
    if (fAccs.length && fAccs.indexOf(t.acc) < 0 && fAccs.indexOf(t.to) < 0) return false;
    if (fCats.length && fCats.indexOf(t.cat) < 0) return false;
    if (query) { var q = query.toLowerCase(); if ((t.desc + ' ' + cat(t.cat).name + ' ' + acc(t.acc).name).toLowerCase().indexOf(q) < 0) return false; }
    return true;
  });
  var groups = {}, order = [];
  list.forEach(function (t) { if (!groups[t.date]) { groups[t.date] = []; order.push(t.date); } groups[t.date].push(t); });
  var n = filterCount();
  var kinds = [['todos','Todos'],['gastos','Gastos'],['ingresos','Ingresos'],['transfer','Transferencias']];
  var panel = filterOpen ? '<div class="card" id="filterPanel" style="display:flex;flex-direction:column;gap:16px">' +
      '<div><span class="lab">Tipo</span><div class="chips">' + kinds.map(function (k) { return '<button class="chip" data-fkind="' + k[0] + '" aria-pressed="' + (fKind === k[0]) + '">' + k[1] + '</button>'; }).join('') + '</div></div>' +
      '<div><span class="lab">Cuentas' + (fAccs.length ? ' · ' + plural(fAccs.length, 'elegida', 'elegidas') : '') + '</span><div class="chips">' + S.accounts.map(function (a) { return '<button class="chip" data-facc="' + esc(a.id) + '" aria-pressed="' + (fAccs.indexOf(a.id) >= 0) + '">' + svg(accIcon(a), 14, 2) + esc(a.name) + '</button>'; }).join('') + '</div></div>' +
      '<div><span class="lab">Categorías' + (fCats.length ? ' · ' + plural(fCats.length, 'elegida', 'elegidas') : '') + '</span><div class="chips">' + S.cats.map(function (c) { return '<button class="chip" data-fcat="' + esc(c.id) + '" aria-pressed="' + (fCats.indexOf(c.id) >= 0) + '"><i style="width:8px;height:8px;border-radius:4px;background:' + C(c.color).dot + '"></i>' + esc(c.name) + '</button>'; }).join('') + '</div></div>' +
      '<div class="row-between" style="align-items:center"><button class="link" data-fclear' + (n ? '' : ' style="visibility:hidden"') + '>Limpiar filtros</button><button class="btn btn-dark btn-sm" data-ftoggle>Ver ' + plural(list.length, 'movimiento', 'movimientos') + '</button></div>' +
    '</div>' : '';
  var summary = (!filterOpen && (n || query)) ? '<div class="sub" style="font-size:13px;margin-top:-6px">Mostrando ' + list.length + ' de ' + inMonth.length + (n ? ' · <button class="link" data-fclear>Quitar filtros</button>' : '') + '</div>' : '';
  var body;
  if (order.length) {
    body = order.map(function (d) {
      var sum = groups[d].reduce(function (s, t) { return noStat(t) ? s : s + t.amount; }, 0);
      return '<div class="daylbl"><span>' + dayLabel(d) + '</span><span style="' + (sum > 0 ? 'color:var(--green)' : '') + '">' + (sum === 0 ? '' : signed(sum)) + '</span></div><div class="card" style="padding:0 16px">' + groups[d].map(function (t) { return txRow(t, false); }).join('') + '</div>';
    }).join('');
  } else if (inMonth.length) {
    body = emptyBox(P.search, 'Nada con ese filtro', 'Prueba con otra búsqueda o quita los filtros.');
  } else {
    body = emptyBox('coins', 'Sin movimientos en ' + MESES[+viewMonth.split('-')[1] - 1], 'Cuando registres gastos o ingresos de este mes aparecerán aquí.', '<button class="btn btn-primary" data-open-add style="margin-top:6px">' + svg(P.plus, 18, 2.2) + 'Agregar movimiento</button>');
  }
  return '<div class="top"><div><div class="sub">Toca un movimiento para editarlo</div><h1>Movimientos</h1></div>' + monthNav() + '</div>' +
    '<div style="display:flex;gap:10px;align-items:center"><label class="search">' + svg(P.search, 18, 2) + '<input id="q" type="search" placeholder="Buscar" aria-label="Buscar movimientos" value="' + esc(query) + '"></label>' +
    '<button class="btn ' + (n ? 'btn-dark' : 'btn-ghost') + '" data-ftoggle aria-expanded="' + filterOpen + '" aria-controls="filterPanel" style="height:46px;flex-shrink:0">' + svg(P.filter, 18, 2) + 'Filtrar' + (n ? ' (' + n + ')' : '') + svg(filterOpen ? P.chevUp : P.chevDown, 16, 2) + '</button></div>' +
    panel + summary + '<div>' + body + '</div>';
}

function viewPresupuesto() {
  var s = stats(viewMonth), left = s.limit - s.bspent, pct = s.limit ? Math.round(s.bspent / s.limit * 100) : 0;
  var perDay = left > 0 && s.daysLeft ? left / s.daysLeft : 0;
  var mname = MESES[+viewMonth.split('-')[1] - 1];
  var hero;
  if (!s.limit) hero = emptyBox(P.target, 'Todavía no tienes límites', 'Ponle un presupuesto mensual a tus categorías (por ejemplo, Comida S/ 700) y aquí verás cuánto te queda cada día.', '<a class="btn btn-primary" href="#personalizar" style="margin-top:6px">Poner límites</a>');
  else hero = '<div class="balance" style="flex-direction:row;align-items:center;gap:20px">' +
      '<div class="donut" style="width:110px;height:110px;background:conic-gradient(var(--mint) 0 ' + Math.min(pct, 100) + '%, var(--ring) ' + Math.min(pct, 100) + '% 100%)"><div style="width:84px;height:84px;background:var(--dark)"><b style="font-size:22px">' + pct + '%</b><span class="lbl" style="font-size:11px">usado</span></div></div>' +
      '<div style="display:flex;flex-direction:column;gap:6px"><span class="lbl">' + (left >= 0 ? 'Te quedan para ' + mname : 'Te pasaste en ' + mname) + '</span><span class="big" style="font-size:30px">' + money(left) + '</span><span style="font-size:13px;color:var(--on-dark-muted)">' + (s.isCur ? (left > 0 ? 'Puedes gastar ' + money(perDay) + ' por día durante ' + plural(s.daysLeft, 'día', 'días') : 'Revisa tus categorías en rojo') : 'Presupuesto de ' + money(s.limit) + ' en total') + '</span></div></div>';
  return '<div class="top"><div><div class="sub">Límites del mes y pagos fijos</div><h1>Presupuesto</h1></div><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' + monthNav() + '<a class="btn btn-ghost btn-sm" href="#personalizar">' + svg(P.gear, 16, 2) + 'Configurar</a>' + '</div></div>' +
  '<div class="grid">' +
    '<div class="c5">' + hero + '</div>' +
    '<div class="c7"><div class="card"><div class="row-between" style="align-items:center;margin-bottom:6px"><h2 style="margin:0">Por categoría</h2><div style="display:flex;gap:12px;align-items:center"><a class="link" href="#personalizar">Editar límites</a></div></div>' +
    S.cats.map(function (c) {
      var sp = s.byCat[c.id] || 0, cc = C(c.color);
      if (!c.limit) return '<div class="goal"><div style="display:flex;align-items:center;gap:10px">' + tile(c.icon, c.color, 28, 9) + '<b style="flex:1;font-size:14px">' + esc(c.name) + '</b><span class="sub" style="font-size:13px">' + money(sp) + ' · sin límite</span></div></div>';
      var p = Math.round(sp / c.limit * 100), over = sp > c.limit;
      return '<div class="goal"><div style="display:flex;align-items:center;gap:10px">' + tile(c.icon, c.color, 28, 9) + '<b style="flex:1;font-size:14px">' + esc(c.name) + '</b><span class="sub" style="font-size:13px">' + money(sp) + ' / ' + nf.format(c.limit) + '</span></div>' +
        '<div class="bar" style="height:8px"><div style="width:' + Math.min(p, 100) + '%;background:' + (over ? '#D9472B' : p >= 90 ? '#E0A030' : cc.dot) + '"></div></div>' +
        (over ? '<span style="font-size:12px;font-weight:700;color:var(--red)">Te pasaste por ' + money(sp - c.limit) + '</span>' : '<span class="sub" style="font-size:12px">' + p + '% usado · quedan ' + money(c.limit - sp) + '</span>') + '</div>';
    }).join('') + '</div></div>' +
    '<div class="c12">' + billsCard() + '</div>' +
  '</div>';
}

function viewEstadisticas() {
  var s = stats(viewMonth), a0 = 0;
  var mtx = S.tx.filter(function (t) { return t.date && t.date.slice(0, 7) === viewMonth && !noStat(t); });
  var exps = mtx.filter(function (t) { return t.amount < 0; });
  var stops = s.exp ? S.cats.map(function (c) { var p = (s.byCat[c.id] || 0) / s.exp * 100; var a = a0; a0 += p; return C(c.color).dot + ' ' + a.toFixed(2) + '% ' + a0.toFixed(2) + '%'; }).join(',') : 'var(--empty) 0 100%';
  var saved = s.inc - s.exp, rate = s.inc ? Math.round(saved / s.inc * 100) : null;
  var avg = s.exp / Math.max(s.daysElapsed, 1);
  var head = '<div class="top"><div><div class="sub">Cómo se mueve tu plata</div><h1>Estadísticas</h1></div>' + monthNav() + '</div>';
  if (!mtx.length) return head + emptyBox(P.chart, 'Aún no hay datos en ' + MESES[+viewMonth.split('-')[1] - 1], 'Registra tus gastos e ingresos y aquí verás en qué se va tu plata, cuánto ahorras y cómo cambias mes a mes.', '<button class="btn btn-primary" data-open-add style="margin-top:6px">' + svg(P.plus, 18, 2.2) + 'Agregar movimiento</button>');

  // Resumen
  var metrics = '<div class="statgrid">' +
    '<div class="metric"><span class="sub" style="font-size:13px">Ingresos</span><b style="color:var(--green)">' + money(s.inc) + '</b></div>' +
    '<div class="metric"><span class="sub" style="font-size:13px">Gastos</span><b>' + money(s.exp) + '</b></div>' +
    '<div class="metric"><span class="sub" style="font-size:13px">Ahorro del mes</span><b style="color:' + (saved < 0 ? 'var(--red)' : 'inherit') + '">' + (saved < 0 ? '−' : '') + money(saved) + '</b><span class="sub" style="font-size:12px">' + (rate === null ? 'Sin ingresos este mes' : (rate >= 0 ? 'Ahorraste el ' + rate + '% de lo que ganaste' : 'Gastaste más de lo que ganaste')) + '</span></div>' +
    '<div class="metric"><span class="sub" style="font-size:13px">Promedio diario</span><b>' + money(avg) + '</b><span class="sub" style="font-size:12px">' + plural(exps.length, 'gasto', 'gastos') + ' en el mes</span></div>' +
  '</div>';

  // Por categoría
  var catCard = '<div class="card"><h2>Gastos por categoría</h2>' + (s.exp ? '<div class="donutwrap">' +
      '<div class="donut" role="img" aria-label="Gastos por categoría" style="background:conic-gradient(' + stops + ')"><div><span class="sub" style="font-size:12px">Total</span><b style="font-size:17px">' + money(s.exp) + '</b></div></div>' +
      '<div class="legend">' + S.cats.filter(function (c) { return (s.byCat[c.id] || 0) > 0; }).sort(function (a, b) { return (s.byCat[b.id] || 0) - (s.byCat[a.id] || 0); }).map(function (c) { var v = s.byCat[c.id] || 0, p = v / s.exp * 100; return '<div><i style="background:' + C(c.color).dot + '"></i><span>' + esc(c.name) + '</span><b>' + money(v) + '</b><em class="sub" style="font-style:normal;width:46px;text-align:right">' + p.toFixed(1) + '%</em></div>'; }).join('') + '</div></div>'
    : '<p class="sub" style="margin:0">No hay gastos este mes.</p>') + '</div>';

  // Ingresos vs gastos, últimos 6 meses
  var six = [-5, -4, -3, -2, -1, 0].map(function (k) {
    var m = shiftMonth(viewMonth, k), inc = 0, exp = 0;
    S.tx.forEach(function (t) { if (!t.date || t.date.slice(0, 7) !== m || noStat(t)) return; if (t.amount > 0) inc += t.amount; else exp -= t.amount; });
    return {m:m, inc:inc, exp:exp};
  });
  var max6 = Math.max.apply(null, six.map(function (x) { return Math.max(x.inc, x.exp); })) || 1;
  var trend = '<div class="card"><div class="row-between"><h2>Ingresos y gastos</h2><span class="sub" style="font-size:12px">Últimos 6 meses</span></div>' +
    '<div class="pairs">' + six.map(function (x) {
      var on = x.m === viewMonth;
      return '<div><div class="pb"><span style="height:' + Math.max(Math.round(x.inc / max6 * 130), 3) + 'px;background:' + (on ? 'var(--green)' : 'var(--mint)') + '" title="Ingresos ' + money(x.inc) + '"></span><span style="height:' + Math.max(Math.round(x.exp / max6 * 130), 3) + 'px;background:' + (on ? 'var(--ink)' : 'var(--track)') + '" title="Gastos ' + money(x.exp) + '"></span></div><span class="sub" style="font-size:12px;font-weight:' + (on ? 700 : 500) + '">' + monthShort(x.m) + '</span></div>';
    }).join('') + '</div>' +
    '<div class="chips" style="margin-top:12px;gap:14px;font-size:12px;color:var(--muted)"><span style="display:flex;align-items:center;gap:6px"><i style="width:10px;height:10px;border-radius:3px;background:var(--green)"></i>Ingresos</span><span style="display:flex;align-items:center;gap:6px"><i style="width:10px;height:10px;border-radius:3px;background:var(--ink)"></i>Gastos</span></div></div>';

  // Dónde más gastas
  var byDesc = {};
  exps.forEach(function (t) { var k = (t.desc || '').trim().toLowerCase(); if (!byDesc[k]) byDesc[k] = {name:t.desc, total:0, n:0, cat:t.cat}; byDesc[k].total -= t.amount; byDesc[k].n++; });
  var top = Object.keys(byDesc).map(function (k) { return byDesc[k]; }).sort(function (a, b) { return b.total - a.total; }).slice(0, 5);
  var topMax = top.length ? top[0].total : 1;
  var topCard = '<div class="card"><h2>Dónde más gastas</h2>' + (top.length ? top.map(function (x) {
    var c = cat(x.cat);
    return '<div class="goal" style="gap:8px;padding:10px 0"><div style="display:flex;align-items:center;gap:10px">' + tile(c.icon, c.color, 28, 9) + '<b style="flex:1;font-size:14px;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(x.name) + '</b><span class="sub" style="font-size:12px">' + plural(x.n, 'vez', 'veces') + '</span><b style="font-size:14px">' + money(x.total) + '</b></div><div class="bar" style="height:6px"><div style="width:' + Math.round(x.total / topMax * 100) + '%;background:' + C(c.color).dot + '"></div></div></div>';
  }).join('') : '<p class="sub" style="margin:0">No hay gastos este mes.</p>') + '</div>';

  // Por día de la semana (lunes a domingo)
  var wd = [0, 0, 0, 0, 0, 0, 0];
  exps.forEach(function (t) { var d = new Date(t.date + 'T12:00:00').getDay(); wd[(d + 6) % 7] -= t.amount; });
  var wmax = Math.max.apply(null, wd) || 1, wTop = wd.indexOf(Math.max.apply(null, wd));
  var WD = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'], WDL = ['los lunes', 'los martes', 'los miércoles', 'los jueves', 'los viernes', 'los sábados', 'los domingos'];
  var weekCard = '<div class="card"><div class="row-between"><h2>Por día de la semana</h2>' + (s.exp ? '<span class="sub" style="font-size:12px">Gastas más ' + WDL[wTop] + '</span>' : '') + '</div><div class="week">' +
    wd.map(function (v, i) { return '<div><span class="sub" style="font-size:11px">' + (v ? Math.round(v).toLocaleString('en-US') : '') + '</span><span class="b" style="height:' + Math.max(Math.round(v / wmax * 110), 3) + 'px;background:' + (i === wTop && v ? 'var(--green)' : 'var(--track)') + '"></span><span class="sub" style="font-size:12px;font-weight:600">' + WD[i] + '</span></div>'; }).join('') + '</div></div>';

  // Datos curiosos
  var biggest = exps.slice().sort(function (a, b) { return a.amount - b.amount; })[0];
  var prev = six[4].exp, insight = '';
  if (s.exp && prev > 0) {
    var diff = (s.exp - prev) / prev * 100;
    insight = '<div class="insight"><span style="width:42px;height:42px;border-radius:13px;background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0">' + svg(diff <= 0 ? P.down : P.up, 20, 2) + '</span><div><b style="color:var(--green-ink);font-size:15px">' + (diff <= 0 ? 'Gastaste ' + Math.abs(diff).toFixed(1) + '% menos que el mes anterior' : 'Gastaste ' + diff.toFixed(1) + '% más que el mes anterior') + '</b><div style="font-size:13px;color:var(--green-ink);margin-top:2px">' + monthTitle(shiftMonth(viewMonth, -1)) + ': ' + money(prev) + ' · ' + monthTitle(viewMonth) + ': ' + money(s.exp) + '</div></div></div>';
  }
  var facts = '<div class="card"><h2>Datos del mes</h2>' +
    (biggest ? '<div class="setrow"><span class="t"><span>Tu gasto más grande</span><b>' + esc(biggest.desc) + ' · ' + shortDay(biggest.date) + '</b></span><b>' + money(biggest.amount) + '</b></div>' : '') +
    '<div class="setrow"><span class="t"><span>Movimientos registrados</span><b>' + plural(mtx.length, 'movimiento', 'movimientos') + '</b></span></div>' +
    '<div class="setrow"><span class="t"><span>Gasto promedio por compra</span><b>' + money(exps.length ? s.exp / exps.length : 0) + '</b></span></div>' +
  '</div>';

  return head + metrics + (insight ? insight : '') +
    '<div class="grid"><div class="c6">' + catCard + '</div><div class="c6">' + trend + '</div>' +
    '<div class="c6">' + topCard + '</div><div class="c6" style="display:flex;flex-direction:column;gap:16px">' + weekCard + facts + '</div></div>';
}

function goalsCard() {
  var goals = S.goals.length ? S.goals.map(function (g) {
    var p = g.target ? Math.min(Math.round((g.saved || 0) / g.target * 100), 100) : 0, done = (g.saved || 0) >= g.target;
    return '<div class="goal"><div style="display:flex;align-items:center;gap:10px">' + tile(g.icon || 'star', g.color || 'verde', 36, 12) + '<b style="flex:1;font-size:15px">' + esc(g.name) + '</b>' + (done ? '<span class="tag">' + svg(P.check, 14, 2.4) + 'Lograda</span>' : '<b style="color:var(--green);font-size:13px">' + p + '%</b>') + '<button class="del" data-edit-goal="' + esc(g.id) + '" aria-label="Editar ' + esc(g.name) + '">' + svg(P.edit, 18) + '</button></div>' +
      '<div class="bar" style="height:8px"><div style="width:' + p + '%;background:' + C(g.color || 'verde').dot + '"></div></div><div class="row-between sub" style="font-size:12px"><span>' + money(g.saved || 0) + ' de ' + money(g.target) + '</span><span>' + (done ? '¡Felicidades!' : 'Faltan ' + money(g.target - (g.saved || 0))) + '</span></div></div>';
  }).join('') : '<p class="sub" style="margin:0 0 4px">Crea metas de ahorro (un viaje, una laptop, tu fondo de emergencia) en <a class="link" href="#personalizar">Configuración</a> y ve sumando tus aportes.</p>';
  return '<div class="card"><h2>Metas de ahorro</h2>' + goals + '</div>';
}

/* ---------- Pagos fijos: repeticiones ---------- */
var WD_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
var WD_NAME = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
function wdIdx(d) { return (d.getDay() + 6) % 7; }
function parseISO(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12); }
function addDays(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
function isoAdd(s, n) { return dISO(addDays(parseISO(s), n)); }
function occurrences(b, fromISO, toISO) {
  var out = [];
  if (b.start && b.start > fromISO) fromISO = b.start;
  if (fromISO > toISO) return out;
  if (b.freq === 'weekly') {
    var days = b.days || [];
    for (var d = parseISO(fromISO), end = parseISO(toISO); d <= end; d = addDays(d, 1)) if (days.indexOf(wdIdx(d)) >= 0) out.push(dISO(d));
  } else if (b.freq === 'once') {
    if (b.date && b.date >= fromISO && b.date <= toISO) out.push(b.date);
  } else if (b.freq === 'yearly') {
    if (!b.date) return out;
    var mm = +b.date.slice(5, 7) - 1, dd = +b.date.slice(8, 10);
    for (var y = +fromISO.slice(0, 4); y <= +toISO.slice(0, 4); y++) { var s1 = dISO(dayIn(y, mm, dd)); if (s1 >= fromISO && s1 <= toISO) out.push(s1); }
  } else {
    var y2 = +fromISO.slice(0, 4), m2 = +fromISO.slice(5, 7) - 1;
    for (var guard = 0; guard < 600; guard++) {
      var s2 = dISO(dayIn(y2, m2, b.day || 1));
      if (s2 > toISO) break;
      if (s2 >= fromISO) out.push(s2);
      m2++; if (m2 > 11) { m2 = 0; y2++; }
    }
  }
  return out;
}
function freqLabel(b) {
  if (b.freq === 'weekly') {
    var ds = (b.days || []).slice().sort();
    if (ds.length === 7) return 'Todos los días';
    if (ds.length === 5 && ds.join() === '0,1,2,3,4') return 'De lunes a viernes';
    var names = ds.map(function (i) { return WD_NAME[i]; });
    return 'Cada ' + (names.length > 1 ? names.slice(0, -1).join(', ') + ' y ' + names[names.length - 1] : (names[0] || 'semana'));
  }
  if (b.freq === 'once') return 'Una vez, el ' + (b.date ? dLabel(parseISO(b.date)) : '—');
  if (b.freq === 'yearly') return 'Cada año, el ' + (b.date ? +b.date.slice(8, 10) + ' de ' + MESES[+b.date.slice(5, 7) - 1] : '—');
  return 'El ' + (b.day || 1) + ' de cada mes';
}
function monthlyEquiv(b) {
  if (b.freq === 'weekly') return b.amount * (b.days || []).length * 52 / 12;
  if (b.freq === 'yearly') return b.amount / 12;
  if (b.freq === 'once') return 0;
  return b.amount;
}
function nextPending(b) {
  var t = todayISO();
  return occurrences(b, t, isoAdd(t, 400)).filter(function (d) { return !b.done[d]; })[0] || null;
}
function whenLabel(d) {
  var t = todayISO();
  if (d === t) return 'Hoy';
  if (d === isoAdd(t, 1)) return 'Mañana';
  var x = parseISO(d);
  return (d < t ? 'Era el ' : '') + WD_SHORT[wdIdx(x)].toLowerCase() + ' ' + dLabel(x);
}
/* Pagos por registrar: desde hace 3 días hasta dentro de 7. Lo que pasó hace más tiempo y no registraste se da por no gastado. */
function pendingItems() {
  var t = todayISO(), from = isoAdd(t, -3), to = isoAdd(t, 7), out = [];
  S.bills.forEach(function (b) {
    occurrences(b, from, to).forEach(function (d) {
      if (b.done[d]) return;
      if (b.auto && d <= t) return;
      out.push({b:b, date:d});
    });
  });
  return out.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
}
function pendingRow(it) {
  var b = it.b, c = cat(b.cat), cc = C(c.color), t = todayISO(), due = it.date <= t, x = parseISO(it.date);
  var when = whenLabel(it.date), key = esc(b.id) + '|' + it.date;
  var col = it.date === t ? 'color:var(--red)' : it.date < t ? 'color:var(--muted)' : '';
  var actions = b.auto
    ? '<span class="tag">Automático</span>'
    : '<button class="btn ' + (due ? 'btn-primary' : 'btn-ghost') + ' btn-sm" data-payocc="' + key + '">Registrar</button>' +
      (due ? '<button class="del" data-skipocc="' + key + '" aria-label="No lo pagué: ' + esc(b.name) + '" title="No lo pagué">' + svg('<path d="M6 6l12 12M18 6 6 18"/>', 18, 2) + '</button>' : '');
  return '<div class="setrow"><span class="ic" style="background:' + cc.soft + ';color:' + cc.ink + ';flex-direction:column;line-height:1"><b style="font-size:14px">' + x.getDate() + '</b><span style="font-size:9px;font-weight:700">' + WD_SHORT[wdIdx(x)].toUpperCase() + '</span></span>' +
    '<span class="t"><b>' + esc(b.name) + '</b><span><b style="' + col + '">' + when + '</b> · ' + money(b.amount) + ' · ' + esc(acc(b.acc).name) + '</span></span>' + actions + '</div>';
}
function billRow(b) {
  var c = cat(b.cat), np = nextPending(b);
  return '<div class="setrow">' + tile(c.icon, c.color, 40, 13) +
    '<span class="t"><b>' + esc(b.name) + ' · ' + money(b.amount) + '</b><span>' + freqLabel(b) + (b.auto ? ' · automático' : '') + (np ? ' · próximo: ' + whenLabel(np).toLowerCase() : ' · sin fechas próximas') + '</span></span>' +
    '<button class="del" data-edit-bill="' + esc(b.id) + '" aria-label="Editar ' + esc(b.name) + '">' + svg(P.edit, 18) + '</button></div>';
}
function cardPayRows() {
  var bal = balances(), rows = [];
  S.accounts.filter(isCredit).forEach(function (a) {
    var d = Math.max(-bal[a.id], 0); if (!(d > 0)) return;
    var ci = cardInfo(a);
    var line = ci.stmt > 0 ? money(ci.stmt) + (ci.overdue ? ' · <b style="color:var(--red)">venció el ' + dLabel(ci.lastDue) + '</b>' : ' · antes del ' + dLabel(ci.lastDue)) : money(ci.cycle) + ' · se paga el ' + dLabel(ci.nextDue);
    rows.push('<div class="setrow">' + tile(accIcon(a), a.color, 40, 13) + '<span class="t"><b>Pago ' + esc(a.name) + '</b><span>' + line + '</span></span><button class="btn btn-primary btn-sm" data-pay="' + esc(a.id) + '">Pagar</button></div>');
  });
  return rows;
}
function billsCard() {
  var pend = pendingItems(), monthly = S.bills.reduce(function (x, b) { return x + monthlyEquiv(b); }, 0);
  var cards = cardPayRows();
  var head = '<h2 style="margin:0">Pagos fijos</h2>';
  if (!S.bills.length) return '<div class="card">' + head + '<p class="sub" style="margin:10px 0 0">Anota lo que pagas seguido: cada lunes, el 5 de cada mes, una vez al año o en una fecha exacta. Agrégalos en <a class="link" href="#personalizar">Configuración</a>; cuando llegue el día te aparecen aquí para registrarlos con un toque, o se registran solos si los pones en automático.</p>' + cards.join('') + '</div>';
  return '<div class="card">' + head +
    '<p class="sub" style="margin:8px 0 4px;font-size:13px">Más o menos ' + money(monthly) + ' al mes</p>' +
    (pend.length ? '<div class="lab" style="margin:12px 0 0">Por registrar esta semana</div>' + pend.map(pendingRow).join('') : '') +
    '<div class="lab" style="margin:14px 0 0">Todos tus pagos fijos</div>' + S.bills.map(billRow).join('') +
    (cards.length ? '<div class="lab" style="margin:14px 0 0">Tarjetas</div>' + cards.join('') : '') + '</div>';
}
function upcomingCard() {
  if (!S.bills.length) return '<div class="card"><h2 style="margin:0">Pagos fijos</h2><p class="sub" style="margin:10px 0 0;font-size:13px">Anota lo que pagas seguido (cada lunes, el 5 de cada mes…) en <a class="link" href="#personalizar">Configuración</a> y aquí te aparece cuando toque pagarlo.</p></div>';
  var pend = pendingItems();
  if (!pend.length) return '<div class="card"><div class="row-between"><h2 style="margin:0">Pagos fijos</h2><a class="link" href="#presupuesto">Ver todos</a></div><p class="sub" style="margin:10px 0 0;font-size:13px">No tienes pagos por registrar esta semana.</p></div>';
  var sum = pend.reduce(function (x, it) { return x + it.b.amount; }, 0);
  return '<div class="card"><div class="row-between"><h2 style="margin:0">Pagos de esta semana</h2><a class="link" href="#presupuesto">Ver todos</a></div><p class="sub" style="margin:6px 0 2px;font-size:13px">' + plural(pend.length, 'pago', 'pagos') + ' · ' + money(sum) + '</p>' + pend.slice(0, 4).map(pendingRow).join('') + (pend.length > 4 ? '<a class="link" href="#presupuesto" style="display:block;padding-top:10px">Ver ' + (pend.length - 4) + ' más</a>' : '') + '</div>';
}

/* Registro automático: crea el gasto de cada pago automático cuyo día ya llegó (hasta 60 días atrás desde que lo creaste). */
var autoBusy = false;
function runAuto() {
  if (autoBusy || !ref) return;
  var t = todayISO(), from = isoAdd(t, -60), upd = {}, n = 0;
  S.bills.forEach(function (b) {
    if (!b.auto) return;
    if (!S.accounts.some(function (a) { return a.id === b.acc; }) || !S.cats.some(function (c) { return c.id === b.cat; })) return;
    occurrences(b, from, t).forEach(function (d) {
      if (b.done[d]) return;
      upd['tx/' + newId()] = {date:d, desc:b.name, cat:b.cat, acc:b.acc, amount:-b.amount, created:Date.now() + n, bill:b.id};
      upd['bills/' + b.id + '/done/' + d] = 'paid';
      n++;
    });
  });
  if (!n) return;
  autoBusy = true;
  commit(upd);
  autoBusy = false;
  toast(plural(n, 'pago fijo se registró', 'pagos fijos se registraron') + ' automáticamente');
}

function cfgData(kind) {
  if (kind === 'cfg-compartidas') return {title:'Cuentas compartidas', icon:'ti-users', color:'rosa', count:(S.shareds || []).length, one:'cuenta compartida', many:'cuentas compartidas'};
  var used = {}; S.tx.forEach(function (t) { used[t.cat] = (used[t.cat] || 0) + 1; });
  var bal = balances();
  function editBtn(attr, id, name) { return '<button class="del" ' + attr + '="' + esc(id) + '" aria-label="Editar ' + esc(name) + '">' + svg(P.edit, 18) + '</button>'; }
  if (kind === 'cfg-cuentas') return {title:'Cuentas y tarjetas', add:'data-open-acc', addText:'Nueva cuenta', icon:'wallet', color:'verde', count:S.accounts.length, one:'cuenta', many:'cuentas',
    empty:'Agrega tu efectivo, Yape, cuentas de banco, ahorros y tarjetas de crédito.',
    rows:S.accounts.map(function (a) {
      var info = isCredit(a) ? 'Disponible ' + money(Math.max((a.limit || 0) - Math.max(-bal[a.id], 0), 0)) + ' de ' + money(a.limit || 0) : (bal[a.id] < 0 ? '−' : '') + money(bal[a.id]);
      return '<div class="setrow">' + tile(accIcon(a), a.color, 40, 13) + '<div class="t"><b>' + esc(a.name) + '</b><span>' + (TYPES[a.type] || TYPES.efectivo).name + ' · ' + info + '</span></div>' + editBtn('data-edit-acc', a.id, a.name) + '</div>';
    }).join('')};
  if (kind === 'cfg-categorias') return {title:'Categorías y límites', add:'data-open-cat', addText:'Nueva categoría', icon:'dots', color:'naranja', count:S.cats.length, one:'categoría', many:'categorías',
    empty:'Crea categorías para ordenar tus gastos y ponles un límite mensual.',
    rows:S.cats.map(function (c) { var n = used[c.id] || 0; return '<div class="setrow">' + tile(c.icon, c.color, 40, 13) + '<div class="t"><b>' + esc(c.name) + '</b><span>' + (c.limit ? 'Límite ' + money(c.limit) + ' al mes' : 'Sin límite') + ' · ' + plural(n, 'movimiento', 'movimientos') + '</span></div>' + editBtn('data-edit-cat', c.id, c.name) + '</div>'; }).join('')};
  if (kind === 'cfg-pagos') return {title:'Pagos fijos', add:'data-open-bill', addText:'Nuevo pago', icon:'ti-repeat', color:'azul', count:S.bills.length, one:'pago fijo', many:'pagos fijos',
    empty:'Lo que pagas seguido: cada lunes, el 5 de cada mes, cada año o en una fecha exacta.',
    rows:S.bills.map(billRow).join('')};
  return {title:'Metas de ahorro', add:'data-open-goal', addText:'Nueva meta', icon:'star', color:'amarillo', count:S.goals.length, one:'meta', many:'metas',
    empty:'Un viaje, una laptop, tu fondo de emergencia…',
    rows:S.goals.map(function (g) { return '<div class="setrow">' + tile(g.icon || 'star', g.color || 'verde', 40, 13) + '<div class="t"><b>' + esc(g.name) + '</b><span>' + money(g.saved || 0) + ' de ' + money(g.target) + '</span></div>' + editBtn('data-edit-goal', g.id, g.name) + '</div>'; }).join('')};
}
function viewCfgList(kind) {
  var d = cfgData(kind);
  return '<div class="top"><div><a class="link" href="#personalizar" style="display:inline-flex;align-items:center;gap:4px;font-size:14px">' + svg(P.left, 16, 2.2) + 'Configuración</a><h1>' + d.title + '</h1></div>' +
    '<button class="btn btn-dark" ' + d.add + '>' + svg(P.plus, 18, 2.2) + d.addText + '</button></div>' +
    '<div class="card">' + (d.rows || '<p class="sub" style="margin:0">' + d.empty + '</p>') + '</div>';
}
function viewPersonalizar() {
  var u = S.user || {};
  var standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  var install = standalone ? '<p class="sub" style="margin:0;font-size:13px">Ya estás usando la app instalada.</p>'
    : installEvt ? '<button class="btn btn-primary btn-sm" data-install>' + svg(P.download, 16, 2) + 'Instalar My Wallet</button>'
    : ios ? '<p class="sub" style="margin:0;font-size:13px">En iPhone: toca Compartir y luego "Agregar a pantalla de inicio".</p>'
    : '<p class="sub" style="margin:0;font-size:13px">Abre el menú del navegador (⋮) y elige "Instalar app" o "Agregar a la pantalla de inicio".</p>';
  var theme = S.settings.theme || 'auto';
  var menu = ['cfg-cuentas', 'cfg-compartidas', 'cfg-categorias', 'cfg-pagos', 'cfg-metas'].map(function (k) {
    var d = cfgData(k);
    return '<a class="setrow menurow" href="#' + k + '">' + tile(d.icon, d.color, 40, 13) + '<span class="t"><b>' + d.title + '</b><span>' + (d.count ? plural(d.count, d.one, d.many) : 'Sin ' + d.many + ' todavía') + '</span></span>' + svg(P.right, 20, 2) + '</a>';
  }).join('');
  return '<div class="top"><div><div class="sub">Agrega y personaliza todo desde aquí</div><h1>Configuración</h1></div></div>' +
  '<div class="grid">' +
    '<div class="c7" style="display:flex;flex-direction:column;gap:16px">' +
      '<div class="card" style="padding:6px 20px">' + menu + '</div>' +
      '<div class="card"><h2>Apariencia</h2><span class="lab">Tema</span><div class="seg" style="margin-bottom:16px">' +
        [['light','Claro'],['dark','Oscuro'],['auto','Automático']].map(function (o) { return '<button data-theme="' + o[0] + '" aria-pressed="' + (theme === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>' +
        '<span class="lab">Color de la app</span><div class="swatches">' + Object.keys(ACCENTS).map(function (k) { return '<button class="swatch" data-accent="' + k + '" aria-label="Color ' + k + '" aria-pressed="' + (S.settings.accent === k) + '" style="background:' + ACCENTS[k].main + ';width:44px;height:44px;border-radius:22px"></button>'; }).join('') + '</div>' +
        '<p class="hint">Automático usa el modo del celular (claro u oscuro).</p></div>' +
    '</div>' +
    '<div class="c5" style="display:flex;flex-direction:column;gap:16px">' +
      '<div class="card"><h2>Moneda</h2><div class="chips">' + CURRENCIES.map(function (c) { return '<button class="chip" data-currency="' + esc(c) + '" aria-pressed="' + (S.settings.currency === c) + '">' + esc(c) + '</button>'; }).join('') + '</div><p class="hint">Solo cambia el símbolo que se muestra, no convierte montos.</p></div>' +
      '<div class="card"><h2>Tu cuenta</h2><div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">' + avatar(u) + '<div style="min-width:0;display:flex;flex-direction:column"><b style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(u.displayName || '') + '</b><span class="sub" style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(u.email || '') + '</span></div></div>' +
        '<label class="lab" for="sName">Cómo te saludamos</label><input class="field" id="sName" maxlength="20" value="' + esc(S.settings.name || '') + '" placeholder="Tu nombre">' +
        '<button class="btn btn-ghost btn-sm" data-logout style="margin-top:14px">' + svg(P.logout, 16, 2) + 'Cerrar sesión</button></div>' +
      '<div class="card"><h2>Instalar en este dispositivo</h2>' + install + '</div>' +
    '</div>' +
  '</div>';
}

/* ------------------------------------------------------------------ */
/* Render                                                              */
/* ------------------------------------------------------------------ */
/* ---------- Cuentas compartidas: pantallas ---------- */
var I_SH = {
  in:'<path d="M12 19V5M5 12l7-7 7 7"/>', swap:'<path d="M4 8h14l-3-3M20 16H6l3 3"/>', trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  share:'<path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"/>', key:'<circle cx="8" cy="15" r="4"/><path d="M10.8 12.2 20 3M17 6l3 3M15 8l2 2"/>'
};
function sharedCards() {
  if (!(S.shareds || []).length) return '';
  var me = uidNow();
  return '<div class="row-between" style="margin-top:4px"><b style="font-size:15px">Compartidas</b><a class="link" href="#cfg-compartidas">Administrar</a></div><div class="accgrid">' +
    S.shareds.map(function (sh) {
      var ds = shDebts(sh), owe = ds.filter(function (d) { return d.from === me; }), owed = ds.filter(function (d) { return d.to === me; }), pill = '';
      if (owe.length) pill = '<span class="shpill" style="color:var(--debt)">Debes ' + money(owe.reduce(function (a, d) { return a + d.amount; }, 0)) + '</span>';
      else if (owed.length) pill = '<span class="shpill" style="color:var(--mint)">Te deben ' + money(owed.reduce(function (a, d) { return a + d.amount; }, 0)) + '</span>';
      return '<button class="shcard" data-open-shared="' + esc(sh.id) + '"><div class="row-between" style="align-items:center;width:100%"><span style="display:flex;align-items:center;gap:12px;min-width:0"><span class="ico" style="width:40px;height:40px;border-radius:13px;background:var(--dark2);color:var(--mint)">' + svg('ti-users', 20) + '</span><span style="display:flex;flex-direction:column;gap:2px;min-width:0;text-align:left"><b style="font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(sh.name) + '</b><span style="font-size:12px;color:var(--dark-muted)">' + plural(sh.members.length, 'persona', 'personas') + ' · ' + SH_MODES[sh.meta.mode].name.toLowerCase() + '</span></span></span>' +
        '<span class="avs">' + sh.members.slice(0, 4).map(function (m) { return shAv(sh, m.uid, 28); }).join('') + '</span></div>' +
        '<div class="row-between" style="align-items:flex-end;width:100%;flex-wrap:wrap"><span style="display:flex;flex-direction:column;gap:2px;text-align:left"><span style="font-size:12px;color:var(--dark-muted)">Saldo del fondo</span><b style="font-size:24px;letter-spacing:-.02em">' + money(shFund(sh)) + '</b></span>' + pill + '</div></button>';
    }).join('') + '</div>';
}

function viewCompartida() {
  var sh = shById(selSh) || (S.shareds || [])[0];
  if (!sh) return '<div class="top"><div><a class="link" href="#billetera" style="display:inline-flex;align-items:center;gap:4px;font-size:14px">' + svg(P.left, 16, 2.2) + 'Mi billetera</a><h1>Cuentas compartidas</h1></div></div>' +
    emptyBox('ti-users', 'Todavía no tienes cuentas compartidas', 'Créalas o únete a una con un código desde Configuración.', '<a class="btn btn-primary" href="#cfg-compartidas" style="margin-top:6px">Ir a Configuración</a>');
  selSh = sh.id;
  var me = uidNow(), f = shFund(sh), t = shTotals(sh), b = shBalances(sh), ds = shDebts(sh), mode = sh.meta.mode;
  var hero = '<div class="balance"><div class="row-between" style="align-items:center"><span style="display:flex;align-items:center;gap:12px;min-width:0"><span class="ico" style="width:42px;height:42px;border-radius:14px;background:var(--dark2);color:var(--mint)">' + svg('ti-users', 22) + '</span><span style="display:flex;flex-direction:column;gap:2px"><b>' + esc(sh.name) + '</b><span class="lbl">' + SH_MODES[mode].name + ' · ' + plural(sh.members.length, 'persona', 'personas') + '</span></span></span><span class="avs">' + sh.members.slice(0, 5).map(function (m) { return shAv(sh, m.uid, 30); }).join('') + '</span></div>' +
    '<div style="display:flex;flex-direction:column;gap:4px"><span class="lbl">Saldo del fondo común</span><span class="big">' + (f < 0 ? '−' : '') + money(f) + '</span><span class="lbl">Tu parte: ' + money(myShareValue(sh)) + '</span></div>' +
    '<div class="duo"><div><span class="lbl" style="font-size:12px">Aportes</span><b style="color:var(--mint);font-size:15px">+' + money(t.aportes) + '</b></div><div><span class="lbl" style="font-size:12px">Gastos compartidos</span><b style="font-size:15px">−' + money(t.gastos) + '</b></div></div>' +
    '<div class="duo"><button class="btn btn-primary" data-sh-open="gasto">' + svg(P.plus, 18, 2.4) + 'Registrar gasto</button><button class="btn" style="background:var(--dark2);color:#fff" data-sh-open="aporte">' + svg(I_SH.in, 18, 2.2) + 'Poner aporte</button></div></div>';

  var whoCard;
  if (mode === 'fondo') {
    whoCard = '<div class="card"><h2>Quién puso cuánto</h2>' + sh.members.map(function (m) { return '<div class="setrow">' + shAv(sh, m.uid) + '<span class="t"><b>' + esc(shWho(sh, m.uid)) + '</b></span><b>' + money(b.put[m.uid] || 0) + '</b></div>'; }).join('') +
      '<p class="hint">En "Solo un fondo común" no se calcula quién debe a quién: todos ponen y gastan del mismo fondo.</p></div>';
  } else {
    var maxV = Math.max.apply(null, sh.members.map(function (m) { return Math.max(b.put[m.uid] || 0, b.exp[m.uid] || 0); }).concat([1]));
    whoCard = '<div class="card"><div class="row-between"><h2>Quién puso cuánto</h2><span class="sub" style="font-size:12px">' + SH_MODES[mode].name + '</span></div><div style="display:flex;flex-direction:column;gap:14px">' +
      sh.members.map(function (m) {
        var put = b.put[m.uid] || 0;
        return '<div style="display:flex;gap:10px;align-items:flex-start">' + shAv(sh, m.uid) + '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px"><div class="row-between"><b style="font-size:14px">' + esc(shWho(sh, m.uid)) + '</b><b style="font-size:14px">' + money(put) + '</b></div>' +
          '<div class="bar" style="height:8px"><div style="width:' + Math.min(100, Math.round(put / maxV * 100)) + '%;background:' + C(m.color).dot + '"></div></div>' +
          '<span class="sub" style="font-size:12px">Le toca ' + money(b.exp[m.uid] || 0) + ' (' + Math.round(shShareNow(sh, m.uid) * 100) + '%)</span></div></div>';
      }).join('') + '</div><div style="display:flex;flex-direction:column;gap:8px;margin-top:14px">' +
      (ds.length ? ds.map(function (d) {
        var mine = d.from === me, forMe = d.to === me;
        var txt = mine ? '<span><b>Le debes ' + money(d.amount) + ' a ' + esc(shMember(sh, d.to).name) + '</b> para quedar parejos</span>' : forMe ? '<span><b>' + esc(shMember(sh, d.from).name) + ' te debe ' + money(d.amount) + '</b> para quedar parejos</span>' : '<span><b>' + esc(shMember(sh, d.from).name) + ' le debe ' + money(d.amount) + ' a ' + esc(shMember(sh, d.to).name) + '</b></span>';
        return '<div class="shdebt' + (mine ? ' mine' : '') + '">' + txt + (mine ? '<button class="btn btn-primary btn-sm" data-sh-settle="' + esc(d.to) + '|' + d.amount + '">Pagar ahora</button>' : '') + '</div>';
      }).join('') : '<div class="shdebt">' + svg(P.check, 16, 2.4) + '<span><b>Están parejos.</b> Nadie le debe a nadie.</span></div>') + '</div></div>';
  }

  var movs = '<div class="card" style="padding-top:6px;padding-bottom:6px"><div class="row-between" style="padding-top:12px"><h2 style="margin:0">Movimientos</h2><span class="sub" style="font-size:12px">Los ven todos los miembros</span></div>' +
    (sh.movs.length ? sh.movs.map(function (m) {
      var icon, title, meta, amt, col = '', mineM = m.by === me;
      if (m.type === 'aporte') { icon = shAv(sh, m.by, 38); title = mineM ? 'Tu aporte' : 'Aporte de ' + shMember(sh, m.by).name; meta = (m.accName ? 'Desde ' + (mineM ? 'tu ' : 'su ') + m.accName + ' · ' : '') + shortDay(m.date); amt = '+' + money(m.amount); col = 'color:var(--green)'; }
      else if (m.type === 'saldo') { icon = '<span class="ic" style="background:var(--soft);color:var(--ink2)">' + svg(I_SH.swap, 18) + '</span>'; title = mineM ? 'Le pagaste a ' + shMember(sh, m.to).name : m.to === me ? shMember(sh, m.by).name + ' te pagó' : shMember(sh, m.by).name + ' le pagó a ' + shMember(sh, m.to).name; meta = 'Para quedar parejos · ' + shortDay(m.date); amt = money(m.amount); col = 'color:var(--muted)'; }
      else { var c = m.cat || {name:'Otros', icon:'dots', color:'gris'}, cc = C(c.color); icon = '<span class="ic" style="background:' + cc.soft + ';color:' + cc.ink + '">' + svg(c.icon, 18) + '</span>'; title = m.desc; meta = c.name + ' · ' + (m.paid === 'fondo' ? 'del fondo' : (mineM ? 'lo pagaste con tu ' : 'lo pagó ' + shMember(sh, m.by).name + ' con su ') + (m.accName || 'plata')) + ' · ' + (mineM ? 'lo registraste' : 'registró ' + shMember(sh, m.by).name) + ' · ' + shortDay(m.date); amt = '−' + money(m.amount); }
      return '<div class="setrow" style="gap:12px">' + icon + '<span class="t"><b>' + esc(title) + '</b><span style="white-space:normal">' + esc(meta) + '</span></span><span class="amt" style="' + col + '">' + amt + '</span>' +
        (mineM ? '<button class="del" data-sh-del="' + esc(m.id) + '" aria-label="Borrar ' + esc(title) + '">' + svg(I_SH.trash, 17, 1.9) + '</button>' : '<span class="del" title="Solo quien lo registró puede borrarlo" style="cursor:default;opacity:.35">' + svg(I_SH.lock, 16, 1.9) + '</span>') + '</div>';
    }).join('') : '<p class="sub" style="padding:8px 0 14px;margin:0">Todavía no hay movimientos. Empiecen poniendo un aporte al fondo.</p>') + '</div>';

  var tabs = S.shareds.length > 1 ? '<div class="chips">' + S.shareds.map(function (x) { return '<button class="chip" data-open-shared="' + esc(x.id) + '" aria-pressed="' + (x.id === sh.id) + '">' + esc(x.name) + '</button>'; }).join('') + '</div>' : '';
  return '<div class="top"><div><a class="link" href="#billetera" style="display:inline-flex;align-items:center;gap:4px;font-size:14px">' + svg(P.left, 16, 2.2) + 'Mi billetera</a><h1>' + esc(sh.name) + '</h1></div><a class="btn btn-ghost btn-sm" href="#cfg-compartidas">' + svg(P.gear, 16, 2) + 'Configurar</a></div>' + tabs +
    '<div class="grid"><div class="c6" style="display:flex;flex-direction:column;gap:16px">' + hero + whoCard + '</div><div class="c6">' + movs + '</div></div>';
}

function viewCfgCompartidas() {
  var me = uidNow();
  var list = (S.shareds || []).map(function (sh) {
    var isOwner = sh.meta.createdBy === me, mode = sh.meta.mode, inv = sh.meta.invite || null;
    var pct = mode === 'porcentaje' ? '<div style="display:flex;flex-direction:column;gap:10px;margin-top:10px">' + sh.members.map(function (m) {
        var v = sh.meta.pct && sh.meta.pct[m.uid] != null ? sh.meta.pct[m.uid] : Math.round(100 / sh.members.length);
        return '<div style="display:flex;align-items:center;gap:10px">' + shAv(sh, m.uid, 28) + '<label for="pct-' + esc(sh.id) + '-' + esc(m.uid) + '" style="width:70px;font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(shWho(sh, m.uid)) + '</label><input type="range" id="pct-' + esc(sh.id) + '-' + esc(m.uid) + '" data-sh-pct="' + esc(sh.id) + '|' + esc(m.uid) + '" min="0" max="100" step="5" value="' + v + '" style="flex:1;accent-color:var(--green)"><b style="width:44px;text-align:right">' + v + '%</b></div>';
      }).join('') + (function () { var tot = sh.members.reduce(function (a, m) { return a + (+(sh.meta.pct || {})[m.uid] || 0); }, 0); return tot !== 100 ? '<p class="err" style="margin:0">Los porcentajes suman ' + tot + '%; deben sumar 100%. Mientras tanto se reparte en partes iguales.</p>' : ''; })() + '</div>' : '';
    return '<div class="card" style="display:flex;flex-direction:column;gap:14px">' +
      '<div class="row-between" style="align-items:center"><span style="display:flex;align-items:center;gap:12px;min-width:0">' + tile('ti-users', 'turquesa', 40, 13) + '<span class="t"><b>' + esc(sh.name) + '</b><span>' + plural(sh.members.length, 'persona', 'personas') + (isOwner ? ' · la creaste tú' : '') + '</span></span></span><button class="btn btn-ghost btn-sm" data-open-shared="' + esc(sh.id) + '">Abrir</button></div>' +
      '<div><label class="lab" for="shname-' + esc(sh.id) + '">Nombre</label><input class="field" id="shname-' + esc(sh.id) + '" data-sh-name="' + esc(sh.id) + '" maxlength="28" value="' + esc(sh.name) + '"></div>' +
      '<div><span class="lab">Cómo se reparten los gastos</span><div style="display:flex;flex-direction:column;gap:8px">' + Object.keys(SH_MODES).map(function (k) { return '<button class="opt" data-sh-mode="' + esc(sh.id) + '|' + k + '" aria-pressed="' + (mode === k) + '"><span class="dot"></span><span><b>' + SH_MODES[k].name + '</b><span class="s">' + SH_MODES[k].s + '</span></span></button>'; }).join('') + '</div>' + pct + '</div>' +
      '<div><span class="lab">Miembros</span>' + sh.members.map(function (m) { return '<div class="setrow">' + shAv(sh, m.uid) + '<span class="t"><b>' + esc(shWho(sh, m.uid)) + '</b><span>' + (m.uid === sh.meta.createdBy ? 'Creó la cuenta' : 'Se unió el ' + dLabel(new Date(m.joined))) + '</span></span>' + (isOwner && m.uid !== me ? '<button class="btn btn-ghost btn-sm" data-sh-remove="' + esc(sh.id) + '|' + esc(m.uid) + '">Quitar</button>' : '') + '</div>'; }).join('') + '</div>' +
      '<div><span class="lab">Invitar a alguien</span>' +
        (inv && inv.exp > Date.now() ? '<div class="shcode" aria-label="Código de invitación">' + esc(fmtCode(inv.code)) + '</div><div class="two" style="margin-top:8px"><button class="btn btn-ghost btn-sm" data-sh-copy="' + esc(inv.code) + '">' + svg(I_SH.copy, 16) + 'Copiar enlace</button><button class="btn btn-primary btn-sm" data-sh-sharelink="' + esc(inv.code) + '|' + esc(sh.name) + '">' + svg(I_SH.share, 16) + 'Compartir</button></div><p class="hint">Vence el ' + dLabel(new Date(inv.exp)) + '. La otra persona entra a My Wallet con su Google, va a Configuración → Cuentas compartidas → Unirme, y escribe el código. O abre el enlace.</p><button class="link" data-sh-invite="' + esc(sh.id) + '" style="margin-top:6px">Generar otro código</button>'
          : '<button class="btn btn-dark btn-sm" data-sh-invite="' + esc(sh.id) + '">' + svg(I_SH.key, 16) + 'Generar código de invitación</button><p class="hint">El código sirve por 7 días.</p>') + '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' + (isOwner ? '<button class="btn btn-danger btn-sm" data-sh-delete="' + esc(sh.id) + '">Eliminar cuenta compartida</button>' : '<button class="btn btn-danger btn-sm" data-sh-leave="' + esc(sh.id) + '">Salir de esta cuenta</button>') + '</div>' +
    '</div>';
  }).join('');
  return '<div class="top"><div><a class="link" href="#personalizar" style="display:inline-flex;align-items:center;gap:4px;font-size:14px">' + svg(P.left, 16, 2.2) + 'Configuración</a><h1>Cuentas compartidas</h1></div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-ghost" data-sh-open="unirse">' + svg(I_SH.key, 18, 2) + 'Unirme con un código</button><button class="btn btn-dark" data-sh-open="crear">' + svg(P.plus, 18, 2.2) + 'Crear cuenta compartida</button></div></div>' +
    (list || '<div class="card"><p class="sub" style="margin:0;line-height:1.5">Una cuenta compartida (mancomunada) es un fondo que manejas con otra persona: los dos ponen aportes, registran gastos y la app calcula quién le debe a quién. Solo comparten esa cuenta; nadie ve tus otras cuentas ni tus gastos personales.</p></div>') +
    '<div class="card" style="display:flex;gap:10px;align-items:flex-start;font-size:13px;color:var(--ink2);line-height:1.45">' + svg(I_SH.lock, 16) + '<span>Solo los miembros pueden ver una cuenta compartida. Las reglas de Firebase no dejan entrar a nadie más.</span></div>';
}
function fmtCode(c) { return String(c).slice(0, 3) + '-' + String(c).slice(3); }

/* ---------- Cuentas compartidas: formularios ---------- */
var SM = null;
function openSh(kind, data) {
  SM = Object.assign({kind:kind}, data || {});
  var own = S.accounts.filter(function (a) { return !isCredit(a); });
  if (!SM.acc) SM.acc = (kind === 'gasto' ? S.accounts[0] : own[0] || S.accounts[0] || {}).id;
  if (kind === 'gasto') { SM.paid = SM.paid || 'fondo'; SM.cat = SM.cat || (S.cats[0] && S.cats[0].id); }
  if (kind === 'crear') { SM.mode = SM.mode || 'mitad'; }
  paintSh();
  setTimeout(function () { var a = $('smAmount') || $('smName') || $('smCode'); if (a && window.innerWidth > 760) a.focus(); }, 40);
}
function closeSh() { SM = null; paintSh(); }
function keepSh() { ['smAmount', 'smDesc', 'smName', 'smCode'].forEach(function (id) { var el = $(id); if (el) SM[id] = el.value; }); SM.err = ''; }
function smAccChips(label, list) {
  return '<div><span class="lab">' + label + '</span><div class="chips">' + list.map(function (a) { var bal = balances()[a.id]; return '<button type="button" class="chip" data-sm-acc="' + esc(a.id) + '" aria-pressed="' + (SM.acc === a.id) + '">' + svg(accIcon(a), 14, 2) + esc(a.name) + ' · ' + (isCredit(a) ? 'disp. ' + money(Math.max((a.limit || 0) - Math.max(-bal, 0), 0)) : money(bal)) + '</button>'; }).join('') + '</div></div>';
}
function paintSh() {
  var el = $('shModal'); if (!el) return;
  if (!SM) { el.innerHTML = ''; return; }
  var sh = shById(selSh), me = uidNow(), title, body = '', btn, amountField = true;
  var own = S.accounts.filter(function (a) { return !isCredit(a); });
  if (SM.kind === 'crear') {
    title = 'Nueva cuenta compartida'; btn = 'Crear cuenta compartida'; amountField = false;
    body = '<div><label class="lab" for="smName">Nombre</label><input class="field" id="smName" maxlength="28" placeholder="Gastos de la casa" value="' + esc(SM.smName || '') + '"></div>' +
      '<div><span class="lab">Cómo se reparten los gastos</span><div style="display:flex;flex-direction:column;gap:8px">' + Object.keys(SH_MODES).map(function (k) { return '<button type="button" class="opt" data-sm-mode="' + k + '" aria-pressed="' + (SM.mode === k) + '"><span class="dot"></span><span><b>' + SH_MODES[k].name + '</b><span class="s">' + SH_MODES[k].s + '</span></span></button>'; }).join('') + '</div></div>' +
      '<p class="hint" style="margin:0">Después de crearla te damos un código para invitar a la otra persona.</p>';
  } else if (SM.kind === 'unirse') {
    title = 'Unirme a una cuenta'; amountField = false; btn = SM.invite ? 'Unirme' : 'Buscar';
    body = '<div><label class="lab" for="smCode">Código de invitación</label><input class="field" id="smCode" maxlength="8" autocomplete="off" autocapitalize="characters" placeholder="K7Q-4MX" value="' + esc(SM.smCode || '') + '" style="height:56px;font-size:22px;font-weight:800;letter-spacing:.16em;text-align:center;text-transform:uppercase"></div>' +
      (SM.invite ? '<div class="card" style="background:var(--surface);display:flex;flex-direction:column;gap:8px;text-align:center;align-items:center"><span class="ico" style="width:48px;height:48px;border-radius:16px;background:var(--green-soft);color:var(--green)">' + svg('ti-users', 24) + '</span><b style="font-size:17px">' + esc(SM.invite.byName || 'Alguien') + ' te invitó a “' + esc(SM.invite.name || 'Cuenta compartida') + '”</b><span class="sub" style="font-size:13px;line-height:1.45">Los dos verán y registrarán los movimientos de esa cuenta. Nadie verá tus otras cuentas ni tus gastos personales.</span></div>' : '<p class="hint" style="margin:0">Pídele el código a quien creó la cuenta. Necesitas internet para unirte.</p>');
  } else if (SM.kind === 'aporte') {
    title = 'Poner aporte'; btn = 'Poner aporte';
    body = smAccChips('Sale de tu cuenta', own) + '<p class="hint" style="margin:-6px 0 0">El aporte pasa al fondo de “' + esc(sh.name) + '” y cuenta como lo que pusiste.</p>';
  } else if (SM.kind === 'gasto') {
    title = 'Nuevo gasto compartido'; btn = 'Guardar gasto';
    var amt = num(SM.smAmount || SM.amount || 0) || 0;
    body = '<div><label class="lab" for="smDesc">Descripción</label><input class="field" id="smDesc" maxlength="40" placeholder="Tottus Parra" value="' + esc(SM.smDesc || '') + '"></div>' +
      '<div><span class="lab">Categoría</span><div class="chips">' + S.cats.map(function (c) { return '<button type="button" class="chip" data-sm-cat="' + esc(c.id) + '" aria-pressed="' + (SM.cat === c.id) + '"><i style="width:8px;height:8px;border-radius:4px;background:' + C(c.color).dot + '"></i>' + esc(c.name) + '</button>'; }).join('') + '</div></div>' +
      '<div style="display:flex;flex-direction:column;gap:8px"><span class="lab" style="margin:0">¿Con qué se pagó?</span>' +
      '<button type="button" class="opt" data-sm-paid="fondo" aria-pressed="' + (SM.paid === 'fondo') + '"><span class="dot"></span><span><b>Con el fondo común</b><span class="s">Sale del saldo compartido (hay ' + money(shFund(sh)) + ')</span></span></button>' +
      '<button type="button" class="opt" data-sm-paid="propia" aria-pressed="' + (SM.paid === 'propia') + '"><span class="dot"></span><span><b>Lo pagué yo con mi plata</b><span class="s">Sale de tu cuenta' + (sh.meta.mode === 'fondo' ? '' : ' y los demás te deben su parte') + '</span></span></button></div>' +
      (SM.paid === 'propia' ? smAccChips('¿Con qué cuenta?', S.accounts) : '') +
      (sh.meta.mode === 'fondo' ? '' : '<div class="card" style="padding:12px 14px;background:var(--surface)"><span class="lab">Cómo se divide · ' + SH_MODES[sh.meta.mode].name.toLowerCase() + '</span>' + sh.members.map(function (m) { return '<div style="display:flex;align-items:center;gap:10px;padding:4px 0">' + shAv(sh, m.uid, 26) + '<span style="flex:1;font-size:14px">' + esc(shWho(sh, m.uid)) + '</span><b style="font-size:14px">' + money(round2(amt * shShareNow(sh, m.uid))) + '</b></div>'; }).join('') + '</div>');
  } else {
    title = 'Pagar a ' + shMember(sh, SM.to).name; btn = 'Registrar pago';
    body = smAccChips('¿Desde qué cuenta le pagas?', own) + '<p class="hint" style="margin:-6px 0 0">Se descuenta de tu cuenta y le llega a ' + esc(shMember(sh, SM.to).name) + ' en su app. El fondo común no cambia.</p>';
  }
  el.innerHTML = '<div class="scrim on" data-sm-scrim><form class="sheet" id="smForm" novalidate role="dialog" aria-modal="true" aria-labelledby="smTitle">' +
    '<div class="row-between" style="align-items:center"><h2 id="smTitle" style="margin:0;font-size:18px">' + title + '</h2><button type="button" class="btn btn-ghost iconbtn-round" data-sm-close aria-label="Cerrar">' + svg('<path d="M6 6l12 12M18 6 6 18"/>', 18, 2) + '</button></div>' +
    (amountField ? '<label class="amount"><span class="cur">' + esc(S.settings.currency) + '</span><input id="smAmount" inputmode="decimal" placeholder="0.00" aria-label="Monto" autocomplete="off" value="' + esc(SM.smAmount != null ? SM.smAmount : (SM.amount != null ? SM.amount : '')) + '"></label>' : '') +
    '<p class="err" id="smErr" role="alert">' + esc(SM.err || '') + '</p>' + body +
    '<button type="submit" class="btn btn-primary" style="height:54px;font-size:16px;flex-shrink:0">' + btn + '</button></form></div>';
}

function smError(msg) { SM.err = msg; paintSh(); }
function genCode() { var a = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', s = ''; for (var i = 0; i < 6; i++) s += a[Math.floor(Math.random() * a.length)]; return s; }
function myMemberInfo() { var u = S.user || {}; return {name:(S.settings.name || (u.displayName || '').split(' ')[0] || 'Yo'), photo:u.photoURL || '', joined:Date.now()}; }
function makeInvite(sid, name) {
  var code = genCode(), now = Date.now(), exp = now + 7 * 86400000, u = {};
  u['invites/' + code] = {sid:sid, by:uidNow(), byName:myMemberInfo().name, name:name, created:now, exp:exp};
  u['shared/' + sid + '/meta/invite'] = {code:code, exp:exp};
  return {code:code, upd:u};
}
function inviteLink(code) { return location.origin + location.pathname + '#unirse-' + code; }

function submitSh() {
  keepSh();
  var me = uidNow(), sh = shById(selSh), now = Date.now(), today = todayISO();
  if (SM.kind === 'crear') {
    var name = (SM.smName || '').trim();
    if (!name) return smError('Ponle un nombre a la cuenta compartida.');
    var sid = globalId(), info = myMemberInfo(), u = {};
    u['shared/' + sid + '/meta'] = {name:name, mode:SM.mode, createdBy:me, created:now};
    u['shared/' + sid + '/members/' + me] = info;
    u['billetera/' + me + '/shared/' + sid] = true;
    commitAbs(u);
    var inv = makeInvite(sid, name); commitAbs(inv.upd);
    selSh = sid; closeSh(); render();
    toast('Cuenta creada. Comparte el código ' + fmtCode(inv.code));
    return;
  }
  if (SM.kind === 'unirse') {
    var code = (SM.smCode || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (code.length !== 6) return smError('El código tiene 6 letras y números, por ejemplo K7Q-4MX.');
    if (!SM.invite || SM.invite.code !== code) {
      if (navigator.onLine === false) return smError('Necesitas internet para unirte.');
      SM.err = 'Buscando…'; paintSh();
      db.ref('invites/' + code).once('value').then(function (snap) {
        var v = snap.val();
        if (!SM) return;
        if (!v) return smError('No encontramos ese código. Revísalo con quien te lo mandó.');
        if (v.exp && v.exp < Date.now()) return smError('Ese código ya venció. Pide uno nuevo.');
        if ((S.shareds || []).some(function (x) { return x.id === v.sid; })) return smError('Ya eres parte de “' + (v.name || 'esa cuenta') + '”.');
        SM.invite = Object.assign({code:code}, v); SM.err = ''; paintSh();
      }).catch(function (e) { if (SM) smError('No se pudo buscar el código (' + (e.code || e.message) + ').'); });
      return;
    }
    var info2 = myMemberInfo(), u2 = {}; info2.code = code;
    u2['shared/' + SM.invite.sid + '/members/' + me] = info2;
    u2['billetera/' + me + '/shared/' + SM.invite.sid] = true;
    var joinedName = SM.invite.name; selSh = SM.invite.sid;
    commitAbs(u2); closeSh(); location.hash = 'compartida';
    toast('Te uniste a “' + (joinedName || 'la cuenta compartida') + '”');
    return;
  }
  var n = num(SM.smAmount);
  if (!isFinite(n) || n <= 0) return smError('Escribe un monto mayor que cero.');
  if (!sh) return smError('No se encontró la cuenta compartida.');
  var a = acc(SM.acc), bal = balances()[SM.acc];
  var needsAcc = SM.kind !== 'gasto' || SM.paid === 'propia';
  if (needsAcc) {
    if (!S.accounts.some(function (x) { return x.id === SM.acc; })) return smError('Elige una cuenta.');
    if (isCredit(a)) { var avail = Math.max((a.limit || 0) - Math.max(-bal, 0), 0); if (n > avail + 0.001) return smError('Supera el crédito disponible de ' + a.name + ' (' + money(avail) + ').'); }
    else if (n > bal + 0.001) return smError('Tu ' + a.name + ' solo tiene ' + money(Math.max(bal, 0)) + '.');
  }
  var mid = globalId(), ptx = needsAcc ? globalId() : null, upd = {}, mov = {by:me, amount:n, date:today, created:now};
  if (SM.kind === 'aporte') {
    mov.type = 'aporte'; mov.accName = a.name; mov.ptx = ptx;
    upd['billetera/' + me + '/tx/' + ptx] = {date:today, desc:'Aporte a ' + sh.name, cat:'shared', acc:a.id, amount:-n, created:now, shared:sh.id, smov:mid};
  } else if (SM.kind === 'gasto') {
    var c = cat(SM.cat), desc = (SM.smDesc || '').trim() || c.name;
    if (SM.paid === 'fondo' && n > shFund(sh) + 0.001) return smError('El fondo solo tiene ' + money(shFund(sh)) + '. Paga con tu plata o pongan un aporte.');
    mov.type = 'gasto'; mov.desc = desc; mov.cat = {name:c.name, icon:c.icon, color:c.color}; mov.paid = SM.paid;
    if (ptx) { mov.accName = a.name; mov.ptx = ptx; upd['billetera/' + me + '/tx/' + ptx] = {date:today, desc:desc + ' · ' + sh.name, cat:'shared', acc:a.id, amount:-n, created:now, shared:sh.id, smov:mid}; }
  } else {
    mov.type = 'saldo'; mov.to = SM.to; mov.accName = a.name; mov.ptx = ptx;
    upd['billetera/' + me + '/tx/' + ptx] = {date:today, desc:'Pago a ' + shMember(sh, SM.to).name + ' · ' + sh.name, cat:'shared', acc:a.id, amount:-n, created:now, shared:sh.id, smov:mid};
  }
  upd['shared/' + sh.id + '/movs/' + mid] = mov;
  var kind = SM.kind; closeSh(); commitAbs(upd);
  toast(kind === 'aporte' ? 'Aporte de ' + money(n) + ' al fondo' : kind === 'gasto' ? 'Gasto compartido guardado' : 'Pago de ' + money(n) + ' registrado');
}

function shClick(t, d) {
  var me = uidNow();
  if (d.openShared) { selSh = d.openShared; if (current() !== 'compartida') location.hash = 'compartida'; else render(); return true; }
  if (d.shOpen) { if ((d.shOpen === 'aporte' || d.shOpen === 'gasto') && !S.accounts.length) { toast('Primero crea una cuenta en Configuración'); return true; } openSh(d.shOpen); return true; }
  if (t.hasAttribute('data-sm-close')) { closeSh(); return true; }
  if (d.smAcc) { keepSh(); SM.acc = d.smAcc; paintSh(); return true; }
  if (d.smCat) { keepSh(); SM.cat = d.smCat; paintSh(); return true; }
  if (d.smPaid) { keepSh(); SM.paid = d.smPaid; if (d.smPaid === 'propia' && !SM.acc) SM.acc = S.accounts[0] && S.accounts[0].id; paintSh(); return true; }
  if (d.smMode) { keepSh(); SM.mode = d.smMode; paintSh(); return true; }
  if (d.shSettle) { var p = d.shSettle.split('|'); openSh('saldo', {to:p[0], amount:(+p[1]).toFixed(2), smAmount:(+p[1]).toFixed(2)}); return true; }
  if (d.shDel) {
    var sh = shById(selSh), m = sh && sh.movs.filter(function (x) { return x.id === d.shDel; })[0]; if (!m || m.by !== me) return true;
    var u = {}; u['shared/' + sh.id + '/movs/' + m.id] = null; if (m.ptx) u['billetera/' + me + '/tx/' + m.ptx] = null;
    commitAbs(u); toast('Borrado'); return true;
  }
  if (d.shMode) { var q = d.shMode.split('|'), s2 = shById(q[0]); var u2 = {}; u2['shared/' + q[0] + '/meta/mode'] = q[1];
    if (q[1] === 'porcentaje' && s2 && !(s2.meta.pct && s2.members.every(function (x) { return s2.meta.pct[x.uid] != null; }))) { var eq = {}, base = Math.floor(100 / s2.members.length / 5) * 5; s2.members.forEach(function (x, i) { eq[x.uid] = base + (i === 0 ? 100 - base * s2.members.length : 0); }); u2['shared/' + q[0] + '/meta/pct'] = eq; }
    commitAbs(u2); toast('Reparto: ' + SH_MODES[q[1]].name); return true; }
  if (d.shInvite) { var s3 = shById(d.shInvite); if (!s3) return true; var inv = makeInvite(s3.id, s3.name); commitAbs(inv.upd); toast('Código nuevo: ' + fmtCode(inv.code)); return true; }
  if (d.shCopy) { var link = inviteLink(d.shCopy), txt = 'Únete a mi cuenta compartida en My Wallet con el código ' + fmtCode(d.shCopy) + ': ' + link;
    try { navigator.clipboard.writeText(txt).then(function () { toast('Enlace copiado'); }, function () { toast('Código: ' + fmtCode(d.shCopy)); }); } catch (e) { toast('Código: ' + fmtCode(d.shCopy)); } return true; }
  if (d.shSharelink) { var z = d.shSharelink.split('|'), msg = 'Únete a “' + z[1] + '” en My Wallet con el código ' + fmtCode(z[0]) + ': ' + inviteLink(z[0]);
    if (navigator.share) navigator.share({title:'My Wallet', text:msg}).catch(function () {}); else { try { navigator.clipboard.writeText(msg).then(function () { toast('Mensaje copiado, pégalo en WhatsApp'); }); } catch (e) { toast('Código: ' + fmtCode(z[0])); } } return true; }
  if (d.shRemove) { var r = d.shRemove.split('|'), s4 = shById(r[0]); if (!s4) return true; var bal = shBalances(s4).diff[r[1]] || 0;
    if (Math.abs(bal) > 0.004 && s4.meta.mode !== 'fondo') { toast('Primero tienen que quedar parejos con ' + shMember(s4, r[1]).name); return true; }
    if (confirmShAction !== d.shRemove) { confirmShAction = d.shRemove; toast('Toca "Quitar" otra vez para confirmar'); setTimeout(function () { confirmShAction = null; }, 5000); return true; }
    confirmShAction = null; var u3 = {}; u3['shared/' + r[0] + '/members/' + r[1]] = null; commitAbs(u3); toast(shMember(s4, r[1]).name + ' ya no es parte de la cuenta'); return true; }
  if (d.shLeave) { var s5 = shById(d.shLeave); if (!s5) return true; var b5 = shBalances(s5).diff[me] || 0;
    if (b5 < -0.004 && s5.meta.mode !== 'fondo') { toast('Primero paga lo que debes (' + money(-b5) + ')'); return true; }
    if (confirmShAction !== 'leave' + d.shLeave) { confirmShAction = 'leave' + d.shLeave; toast('Toca "Salir" otra vez para confirmar'); setTimeout(function () { confirmShAction = null; }, 5000); return true; }
    confirmShAction = null; var u4 = {}; u4['shared/' + d.shLeave + '/members/' + me] = null; u4['billetera/' + me + '/shared/' + d.shLeave] = null;
    if (shRefs[d.shLeave]) { shRefs[d.shLeave].off(); delete shRefs[d.shLeave]; }
    commitAbs(u4); delete SHARED[d.shLeave]; saveShared(); refreshFromLocal(); toast('Saliste de “' + s5.name + '”'); return true; }
  if (d.shDelete) { var s6 = shById(d.shDelete); if (!s6) return true;
    if (confirmShAction !== 'del' + d.shDelete) { confirmShAction = 'del' + d.shDelete; toast('Se borrará para todos. Toca otra vez para confirmar'); setTimeout(function () { confirmShAction = null; }, 5000); return true; }
    confirmShAction = null; if (shRefs[d.shDelete]) { shRefs[d.shDelete].off(); delete shRefs[d.shDelete]; }
    var u5 = {}; u5['shared/' + d.shDelete] = null; u5['billetera/' + me + '/shared/' + d.shDelete] = null; if (s6.meta.invite && s6.meta.invite.code) u5['invites/' + s6.meta.invite.code] = null;
    commitAbs(u5); toast('Cuenta compartida eliminada'); return true; }
  return false;
}
var confirmShAction = null;

var darkMQ = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
function themePref() { if (S.user && S.settings.theme) return S.settings.theme; try { return localStorage.getItem('mw-theme') || 'auto'; } catch (e) { return 'auto'; } }
function applyTheme() {
  var t = themePref(), dark = t === 'dark' || (t === 'auto' && darkMQ && darkMQ.matches);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  try { localStorage.setItem('mw-theme', t); } catch (e) {}
}
if (darkMQ && darkMQ.addEventListener) darkMQ.addEventListener('change', function () { applyAccent(); render(); });
function applyAccent() {
  applyTheme();
  var a = ACCENTS[S.settings.accent] || ACCENTS.verde, r = document.documentElement.style;
  if (isDark()) { var m = mixHex(a.main, '#ffffff', .18); a = {main:m, soft:hexA(m, .22), ink:a.light, light:a.light}; }
  r.setProperty('--green', a.main); r.setProperty('--green-soft', a.soft); r.setProperty('--green-ink', a.ink); r.setProperty('--mint', a.light);
  var meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', isDark() ? '#0F1114' : '#F4F3EF');
  document.querySelectorAll('.cur').forEach(function (el) { el.textContent = S.settings.currency; });
}
function render() {
  if (!S.user || $('app').hidden) return;
  applyAccent(); renderNav();
  var v = current();
  var html = v === 'compartida' ? viewCompartida() : v === 'cfg-compartidas' ? viewCfgCompartidas() : SUBVIEWS[v] ? viewCfgList(v) : v === 'movimientos' ? viewMovimientos() : v === 'billetera' ? viewCuentas() : v === 'presupuesto' ? viewPresupuesto() : v === 'estadisticas' ? viewEstadisticas() : v === 'personalizar' ? viewPersonalizar() : viewInicio();
  var active = document.activeElement && document.activeElement.id;
  $('view').innerHTML = html;
  var h1 = document.querySelector('#view .top h1');
  if (h1) { h1.style.display = 'flex'; h1.style.alignItems = 'center'; h1.style.gap = '8px'; h1.insertAdjacentHTML('beforeend', '<span id="net" class="net" role="status"></span>'); netBadge(); }
  var q = $('q');
  if (q) {
    q.addEventListener('input', function () { query = q.value; var pos = q.selectionStart; render(); var n = $('q'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} } });
    if (active === 'q') { q.focus(); }
  }
  if (pendingJoinCode && S.user) { var jc = pendingJoinCode; pendingJoinCode = null; setTimeout(function () { openSh('unirse', {smCode:fmtCode(jc)}); }, 50); }
  var sn = $('sName');
  if (sn) sn.addEventListener('change', function () { put('settings/name', sn.value.trim()); toast('Nombre guardado'); });
}

var tt;
function toast(msg) { var t = $('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('on'); }, 2600); }
function openSheet(id, focusId) { $(id).classList.add('on'); setTimeout(function () { var f = $(focusId); if (f && window.innerWidth > 760) f.focus(); }, 60); }
function closeSheet(id) { $(id).classList.remove('on'); }
function colorRow(sel) { return Object.keys(COLORS).map(function (k) { return '<button type="button" class="swatch" data-pick-color="' + k + '" aria-label="Color ' + k + '" aria-pressed="' + (k === sel) + '" style="background:' + COLORS[k].dot + '"></button>'; }).join(''); }

/* ------------------------------------------------------------------ */
/* ---------- Biblioteca de íconos (más de 5,700, con buscador en español) ---------- */
var TI_FAV = ['shopping-cart','basket','shopping-bag','building-store','tools-kitchen-2','pizza','burger','soup','salad','fish','meat','egg','bread','carrot','apple','milk','coffee','beer','glass-full','bottle','ice-cream','cake','cookie','candy',
  'car','bus','motorbike','moped','bike','train','plane','gas-station','parking','steering-wheel','truck','car-garage',
  'home','building','armchair','sofa','lamp','key','wash-machine','bulb','droplet','flame','plug','wifi','device-mobile','device-tv','device-laptop','device-desktop','headphones','camera',
  'movie','music','ticket','confetti','device-gamepad-2','ball-football','ball-basketball','swimming','barbell','run','yoga','mountain','tent','beach','luggage','map','world',
  'heart','pill','stethoscope','first-aid-kit','dental','school','book','pencil','palette','briefcase','cash','coin','coins','wallet','moneybag','pig-money','receipt','receipt-tax','credit-card','building-bank','chart-line','percentage','businessplan',
  'gift','shirt','shoe','hanger','scissors','cut','brush','perfume','diamond','needle-thread','paw','dog','cat','baby-carriage','baby-bottle','mood-kid','users','friends','heart-handshake','old',
  'tool','hammer','plant','leaf','seeding','recycle','trash','package','shield','umbrella','phone','mail','cloud','cloud-computing','lock','star','trophy','calendar','repeat','bolt','battery','sun','snowflake',
  'brand-netflix','brand-spotify','brand-youtube','brand-amazon','brand-apple','brand-google','brand-steam','brand-xbox','brand-uber','brand-tiktok','brand-instagram'].map(function (n) { return 'ti-' + n; });
var ES_ICON = {
  comida:'tools-kitchen food soup pizza burger', almuerzo:'tools-kitchen soup', menu:'tools-kitchen soup', restaurante:'tools-kitchen chef', supermercado:'shopping-cart basket', mercado:'basket shopping-cart', compras:'shopping-bag shopping-cart', tienda:'building-store', pan:'bread', panaderia:'bread baguette',
  pizza:'pizza', hamburguesa:'burger', pollo:'meat', carne:'meat', pescado:'fish', huevo:'egg', fruta:'apple lemon', verdura:'carrot salad', leche:'milk', cafe:'coffee', cerveza:'beer', trago:'glass glass-full', vino:'glass', bebida:'bottle glass cup', helado:'ice-cream', torta:'cake', pastel:'cake', dulce:'candy cookie', galleta:'cookie',
  auto:'car', carro:'car', taxi:'car', uber:'car brand-uber', bus:'bus', pasaje:'bus ticket', combi:'bus', micro:'bus', moto:'motorbike moped', bici:'bike', bicicleta:'bike', tren:'train', avion:'plane', vuelo:'plane', gasolina:'gas-station', combustible:'gas-station', estacionamiento:'parking', cochera:'parking car-garage', peaje:'road', camion:'truck',
  casa:'home house', hogar:'home', alquiler:'home key building', departamento:'building', mueble:'armchair sofa', lampara:'lamp', llave:'key', lavanderia:'wash-machine', luz:'bulb bolt', electricidad:'bolt plug', agua:'droplet', gas:'flame', internet:'wifi world', cable:'device-tv', telefono:'phone', celular:'device-mobile', plan:'device-mobile', computadora:'device-laptop device-desktop', laptop:'device-laptop', tele:'device-tv', audifonos:'headphones', camara:'camera',
  cine:'movie', pelicula:'movie', musica:'music', concierto:'ticket music', entrada:'ticket', fiesta:'confetti', juego:'device-gamepad', videojuego:'device-gamepad', futbol:'ball-football', deporte:'ball run', gimnasio:'barbell', gym:'barbell', correr:'run', yoga:'yoga', piscina:'swimming', viaje:'plane luggage map', vacaciones:'beach luggage', playa:'beach', montana:'mountain', campamento:'tent', hotel:'bed building',
  salud:'heart stethoscope', medicina:'pill', medicamento:'pill', farmacia:'pill first-aid-kit', botica:'pill first-aid-kit', doctor:'stethoscope', medico:'stethoscope', dentista:'dental', hospital:'building-hospital first-aid-kit', seguro:'shield umbrella',
  escuela:'school', colegio:'school', universidad:'school', estudio:'school book', curso:'school certificate', libro:'book', utiles:'pencil', arte:'palette',
  trabajo:'briefcase', sueldo:'cash wallet', salario:'cash', dinero:'cash coin', plata:'cash coins', ahorro:'pig-money', ahorros:'pig-money', inversion:'chart-line trending-up', banco:'building-bank', tarjeta:'credit-card', deuda:'receipt credit-card', prestamo:'cash receipt', impuesto:'receipt-tax', factura:'receipt', recibo:'receipt', negocio:'businessplan building-store', porcentaje:'percentage',
  regalo:'gift', cumpleanos:'cake gift', ropa:'shirt hanger', polo:'shirt', zapato:'shoe', zapatilla:'shoe', peluqueria:'scissors cut', corte:'scissors cut', belleza:'brush perfume', maquillaje:'brush', perfume:'perfume', joya:'diamond', costura:'needle-thread',
  mascota:'paw', perro:'dog paw', gato:'cat paw', veterinario:'paw stethoscope', bebe:'baby-carriage baby-bottle', hijo:'mood-kid baby-carriage', nino:'mood-kid', familia:'users', amigos:'friends users', pareja:'heart', novia:'heart', donacion:'heart-handshake', ayuda:'heart-handshake', abuelo:'old',
  herramienta:'tool', reparacion:'tool hammer', mantenimiento:'tool', planta:'plant', jardin:'plant seeding', reciclaje:'recycle', basura:'trash', paquete:'package', envio:'package truck', delivery:'package motorbike', nube:'cloud', suscripcion:'repeat', mensual:'calendar repeat', streaming:'brand-netflix device-tv', netflix:'brand-netflix', spotify:'brand-spotify', youtube:'brand-youtube', amazon:'brand-amazon', apple:'brand-apple', google:'brand-google', steam:'brand-steam', xbox:'brand-xbox', tiktok:'brand-tiktok', instagram:'brand-instagram',
  estrella:'star', premio:'trophy', calendario:'calendar', sol:'sun', frio:'snowflake', bateria:'battery', candado:'lock', correo:'mail', otros:'dots category'
};
var ICON_NAMES = null, iconNamesLoading = false;
function loadIconNames(cb) {
  if (ICON_NAMES) return cb();
  if (iconNamesLoading) return;
  iconNamesLoading = true;
  fetch('icons/names.json').then(function (r) { return r.json(); }).then(function (list) { ICON_NAMES = list.map(function (n) { return 'ti-' + n; }); iconNamesLoading = false; cb(); })
    .catch(function () { iconNamesLoading = false; });
}
function normTxt(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim(); }
function searchIcons(q) {
  q = normTxt(q);
  if (!q) return ICON_KEYS.concat(TI_FAV);
  var terms = [q.replace(/\s+/g, '-')];
  Object.keys(ES_ICON).forEach(function (k) { if (k.indexOf(q) === 0 || (q.length >= 4 && q.indexOf(k) === 0)) terms = terms.concat(ES_ICON[k].split(' ')); });
  var pool = ICON_KEYS.concat(ICON_NAMES || TI_FAV), seen = {}, exact = [], partial = [];
  pool.forEach(function (n) {
    if (seen[n]) return;
    var bare = n.indexOf('ti-') === 0 ? n.slice(3) : n;
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      if (bare === t) { exact.push(n); seen[n] = 1; return; }
      if (bare.indexOf(t) >= 0) { partial.push(n); seen[n] = 1; return; }
    }
  });
  return exact.concat(partial).slice(0, 160);
}
var iconQuery = {};
function iconGrid(sel, gridKey) {
  var q = iconQuery[gridKey] || '';
  if (q && !ICON_NAMES) loadIconNames(function () { repaintIcons(gridKey); });
  var list = searchIcons(q);
  if (sel && list.indexOf(sel) < 0) list = [sel].concat(list);
  if (!list.length) return '<p class="sub" style="grid-column:1/-1;margin:6px 0;font-size:13px">' + (ICON_NAMES ? 'No encontramos ese ícono. Prueba con otra palabra, también en inglés (dog, car, gift…).' : 'Cargando íconos…') + '</p>';
  return list.map(function (k) { return '<button type="button" data-pick-icon="' + k + '" aria-label="Ícono ' + esc(k.replace(/^ti-/, '')) + '" title="' + esc(k.replace(/^ti-/, '')) + '" aria-pressed="' + (k === sel) + '">' + svg(k, 20) + '</button>'; }).join('');
}
function repaintIcons(gridKey) {
  if (gridKey === 'acc' && $('accScrim').classList.contains('on')) paintAcc();
  if (gridKey === 'cat' && $('catScrim').classList.contains('on')) paintCat();
  if (gridKey === 'goal' && $('goalScrim').classList.contains('on')) paintGoal();
}

/* ------------------------------------------------------------------ */
/* Formulario: movimiento                                              */
/* ------------------------------------------------------------------ */
var F = {};
function paintTx() {
  document.querySelectorAll('#typeSeg button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.ttype === F.type)); });
  $('catBlock').style.display = F.type === 'gasto' ? '' : 'none';
  $('toBlock').style.display = F.type === 'transfer' ? '' : 'none';
  $('accLabel').textContent = F.type === 'transfer' ? 'Desde' : F.type === 'ingreso' ? 'Entra a' : 'Pagado con';
  if (!S.cats.some(function (c) { return c.id === F.cat; })) F.cat = S.cats.length ? S.cats[0].id : null;
  $('catGrid').innerHTML = S.cats.map(function (c) { return '<button type="button" class="catbtn" data-cat="' + esc(c.id) + '" aria-pressed="' + (c.id === F.cat) + '">' + tile(c.icon, c.color, 28, 9) + '<span>' + esc(c.name) + '</span></button>'; }).join('');
  var fromList = F.type === 'gasto' ? S.accounts : S.accounts.filter(function (a) { return !isCredit(a); });
  if (!fromList.some(function (a) { return a.id === F.acc; })) F.acc = fromList.length ? fromList[0].id : null;
  $('accChips').innerHTML = fromList.map(function (a) { return '<button type="button" class="chip" data-acc="' + esc(a.id) + '" aria-pressed="' + (a.id === F.acc) + '">' + svg(accIcon(a), 14, 2) + esc(a.name) + '</button>'; }).join('');
  var toList_ = S.accounts.filter(function (a) { return a.id !== F.acc; });
  if (!toList_.some(function (a) { return a.id === F.to; })) F.to = toList_.length ? toList_[0].id : null;
  $('toChips').innerHTML = toList_.length ? toList_.map(function (a) { return '<button type="button" class="chip" data-to="' + esc(a.id) + '" aria-pressed="' + (a.id === F.to) + '">' + svg(accIcon(a), 14, 2) + esc(a.name) + '</button>'; }).join('') : '<span class="sub" style="font-size:13px">Necesitas al menos dos cuentas para transferir.</span>';
  var word = F.type === 'gasto' ? 'gasto' : F.type === 'ingreso' ? 'ingreso' : 'transferencia';
  $('saveBtn').textContent = F.editId ? 'Guardar cambios' : 'Guardar ' + word;
  $('txTitle').textContent = F.editId ? 'Editar movimiento' : 'Nuevo movimiento';
  $('txDelete').style.display = F.editId ? '' : 'none';
  $('fDesc').placeholder = F.type === 'transfer' ? 'Pago de tarjeta' : F.type === 'ingreso' ? 'Sueldo' : 'Tottus Parra';
}
function openTx(o) {
  o = o || {};
  var e = o.edit;
  var lastAcc = S.accounts.filter(function (a) { return !isCredit(a); })[0];
  F = { editId: e ? e.id : null, billId: o.billId || null, billOcc: o.billOcc || null,
        type: e ? (e.cat === 'transfer' ? 'transfer' : e.amount > 0 ? 'ingreso' : 'gasto') : (o.type || 'gasto'),
        cat: e && e.cat !== 'transfer' && e.cat !== 'ingreso' ? e.cat : (o.cat || (S.cats[0] && S.cats[0].id)),
        acc: e ? e.acc : (o.from || (lastAcc && lastAcc.id)), to: e && e.to ? e.to : (o.to || null), created: e ? e.created : null };
  $('fAmount').value = e ? Math.abs(e.amount).toFixed(2) : (o.amount ? o.amount.toFixed(2) : '');
  $('fDesc').value = e ? e.desc : (o.desc || '');
  $('fDate').value = e ? e.date : (o.date || todayISO());
  $('fErr').textContent = '';
  paintTx(); openSheet('txScrim', 'fAmount');
}
$('txForm').addEventListener('submit', function (e) {
  e.preventDefault();
  var err = $('fErr'), n = num($('fAmount').value);
  if (!isFinite(n) || n <= 0) { err.textContent = 'Escribe un monto mayor que cero.'; $('fAmount').focus(); return; }
  if (n > 100000000) { err.textContent = 'Ese monto es demasiado alto.'; return; }
  if (!F.acc) { err.textContent = 'Primero crea una cuenta.'; return; }
  if (F.type === 'gasto' && !F.cat) { err.textContent = 'Primero crea una categoría.'; return; }
  if (F.type === 'transfer' && (!F.to || F.to === F.acc)) { err.textContent = 'Elige una cuenta de destino distinta.'; return; }
  var date = $('fDate').value || todayISO();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { err.textContent = 'Elige una fecha válida.'; return; }
  var descIn = $('fDesc').value.trim();
  var id = F.editId || newId();
  var item = {date:date, acc:F.acc, created: F.created || Date.now()};
  if (F.type === 'transfer') { item.cat = 'transfer'; item.to = F.to; item.amount = n; item.desc = descIn || ('A ' + acc(F.to).name); }
  else if (F.type === 'ingreso') { item.cat = 'ingreso'; item.amount = n; item.desc = descIn || 'Ingreso'; }
  else { item.cat = F.cat; item.amount = -n; item.desc = descIn || cat(F.cat).name; }
  if (F.type === 'gasto' && isCredit(acc(F.acc))) {
    var a = acc(F.acc), prev = F.editId ? S.tx.filter(function (x) { return x.id === F.editId; })[0] : null;
    var debt = Math.max(-balances()[a.id], 0) - (prev && prev.acc === a.id && prev.cat !== 'transfer' ? -prev.amount : 0);
    if (debt + n > (a.limit || 0) + 0.001) { err.textContent = 'Supera tu crédito disponible (' + money(Math.max((a.limit || 0) - debt, 0)) + ').'; return; }
  }
  var upd = {}; upd['tx/' + id] = clean(item);
  if (F.billId && F.billOcc) upd['bills/' + F.billId + '/done/' + F.billOcc] = 'paid';
  var wasEdit = !!F.editId, type = F.type;
  closeSheet('txScrim');
  patch(upd);
  toast(wasEdit ? 'Cambios guardados' : (type === 'gasto' ? 'Gasto' : type === 'ingreso' ? 'Ingreso' : 'Transferencia') + ' guardado: ' + money(n));
});
$('txDelete').addEventListener('click', function () {
  var old = S.tx.filter(function (x) { return x.id === F.editId; })[0];
  closeSheet('txScrim'); del('tx/' + F.editId); if (old) toast('Eliminado: ' + old.desc);
});

/* ------------------------------------------------------------------ */
/* Formulario: cuenta                                                  */
/* ------------------------------------------------------------------ */
var A = {};
function paintAcc() {
  var used = A.editId && S.tx.some(function (x) { return x.acc === A.editId || x.to === A.editId; });
  $('typeChips').innerHTML = Object.keys(TYPES).map(function (k) { return '<button type="button" class="chip" data-atype="' + k + '" aria-pressed="' + (k === A.type) + '"' + (used && k !== A.type ? ' disabled' : '') + '>' + svg(TYPES[k].icon, 14, 2) + TYPES[k].name + '</button>'; }).join('');
  $('typeHint').style.display = used ? '' : 'none';
  $('accIcons').innerHTML = iconGrid(A.icon, 'acc');
  $('accColors').innerHTML = colorRow(A.color);
  var cr = A.type === 'credito';
  $('creditFields').style.display = cr ? 'flex' : 'none';
  $('plainFields').style.display = cr ? 'none' : '';
  $('aName').placeholder = {efectivo:'Efectivo', digital:'Yape', banco:'Cuenta BCP', ahorros:'Ahorros Interbank', credito:'Visa Signature'}[A.type];
  var nm = $('aName').value.trim() || $('aName').placeholder;
  $('accPreview').innerHTML = tile(A.icon, A.color, 44, 14) + '<div style="display:flex;flex-direction:column"><b>' + esc(nm) + '</b><span class="sub" style="font-size:12px">' + TYPES[A.type].name + '</span></div>';
  $('accTitle').textContent = A.editId ? 'Editar cuenta' : 'Nueva cuenta';
  $('accSave').textContent = A.editId ? 'Guardar cambios' : 'Crear cuenta';
  $('accDelete').style.display = A.editId ? '' : 'none';
}
function openAcc(editId) {
  var a = editId ? acc(editId) : null, bal = a ? balances()[a.id] : 0;
  A = {editId: a ? a.id : null, type: a ? a.type : 'banco', icon: a ? accIcon(a) : 'bank', color: a ? a.color : 'azul', iconTouched: !!a, order: a ? a.order : nextOrder(S.accounts), created: a ? (a.created || null) : Date.now(), fromTx: $('txScrim').classList.contains('on')};
  $('aName').value = a ? a.name : '';
  $('aBal').value = a && !isCredit(a) ? bal.toFixed(2) : '';
  $('aLimit').value = a && isCredit(a) ? (a.limit || 0).toFixed(2) : '';
  $('aDebt').value = a && isCredit(a) ? Math.max(-bal, 0).toFixed(2) : '';
  $('aClose').value = a && isCredit(a) ? a.closeDay : '';
  $('aPay').value = a && isCredit(a) ? a.payDay : '';
  $('aErr').textContent = '';
  iconQuery.acc = ''; $('aIconQ').value = '';
  paintAcc(); openSheet('accScrim', 'aName');
}
$('accForm').addEventListener('submit', function (e) {
  e.preventDefault();
  var err = $('aErr'), name = $('aName').value.trim();
  if (!name) { err.textContent = 'Ponle un nombre a la cuenta.'; $('aName').focus(); return; }
  if (S.accounts.some(function (a) { return a.id !== A.editId && a.name.toLowerCase() === name.toLowerCase(); })) { err.textContent = 'Ya tienes una cuenta con ese nombre.'; return; }
  var id = A.editId || newId(), mv = A.editId ? movementEffect(id) : 0;
  var a = {name:name, type:A.type, color:A.color, icon:A.icon, order:A.order};
  if (A.created) a.created = A.created;
  if (A.type === 'credito') {
    var lim = num($('aLimit').value), debt = $('aDebt').value.trim() ? num($('aDebt').value) : 0;
    var cl = parseInt($('aClose').value, 10), py = parseInt($('aPay').value, 10);
    if (!isFinite(lim) || lim <= 0) { err.textContent = 'Escribe la línea de crédito de la tarjeta.'; $('aLimit').focus(); return; }
    if (!isFinite(debt) || debt < 0 || debt > lim) { err.textContent = 'La deuda debe estar entre 0 y la línea de crédito.'; return; }
    if (!(cl >= 1 && cl <= 31)) { err.textContent = 'El día de cierre debe ser entre 1 y 31.'; return; }
    if (!(py >= 1 && py <= 31)) { err.textContent = 'El día de pago debe ser entre 1 y 31.'; return; }
    a.limit = lim; a.closeDay = cl; a.payDay = py; a.initial = round2(debt + mv);
  } else {
    var bal = $('aBal').value.trim() ? num($('aBal').value) : 0;
    if (!isFinite(bal)) { err.textContent = 'Escribe un saldo válido.'; return; }
    a.initial = round2(bal - mv);
  }
  var wasEdit = !!A.editId, fromTx = A.fromTx;
  closeSheet('accScrim');
  put('accounts/' + id, a).then(function () {
    if (fromTx) { F.acc = id; paintTx(); }
  });
  toast(wasEdit ? 'Cuenta actualizada' : 'Cuenta creada: ' + name);
});
$('accDelete').addEventListener('click', function () {
  var n = S.tx.filter(function (x) { return x.acc === A.editId || x.to === A.editId; }).length;
  if (n) { $('aErr').textContent = 'Tiene ' + plural(n, 'movimiento', 'movimientos') + '. Elimínalos o cámbialos de cuenta primero.'; return; }
  var nm = acc(A.editId).name, upd = {};
  upd['accounts/' + A.editId] = null;
  S.bills.forEach(function (b) { if (b.acc === A.editId) upd['bills/' + b.id + '/acc'] = null; });
  closeSheet('accScrim'); patch(upd); toast('Cuenta eliminada: ' + nm);
});

/* ------------------------------------------------------------------ */
/* Formulario: categoría                                               */
/* ------------------------------------------------------------------ */
var K = {};
function paintCat() {
  $('catIcons').innerHTML = iconGrid(K.icon, 'cat');
  $('catColors').innerHTML = colorRow(K.color);
  var nm = $('cName').value.trim() || 'Mascotas';
  $('catPreview').innerHTML = tile(K.icon, K.color, 44, 14) + '<div style="display:flex;flex-direction:column"><b>' + esc(nm) + '</b><span class="sub" style="font-size:12px">Así se verá en tus movimientos</span></div>';
  $('catTitle').textContent = K.editId ? 'Editar categoría' : 'Nueva categoría';
  $('catSave').textContent = K.editId ? 'Guardar cambios' : 'Crear categoría';
  $('catDelete').style.display = K.editId ? '' : 'none';
}
function openCat(editId, fromTx) {
  var c = editId ? cat(editId) : null;
  K = {editId: c ? c.id : null, icon: c ? c.icon : 'paw', color: c ? c.color : 'rosa', fromTx: !!fromTx, order: c ? c.order : nextOrder(S.cats)};
  $('cName').value = c ? c.name : '';
  $('cLimit').value = c && c.limit ? c.limit.toFixed(2) : '';
  $('cErr').textContent = '';
  iconQuery.cat = ''; $('cIconQ').value = '';
  paintCat(); openSheet('catScrim', 'cName');
}
$('catForm').addEventListener('submit', function (e) {
  e.preventDefault();
  var err = $('cErr'), name = $('cName').value.trim();
  if (!name) { err.textContent = 'Ponle un nombre a la categoría.'; $('cName').focus(); return; }
  if (S.cats.some(function (c) { return c.id !== K.editId && c.name.toLowerCase() === name.toLowerCase(); })) { err.textContent = 'Ya tienes una categoría con ese nombre.'; return; }
  var raw = $('cLimit').value.trim(), lim = raw ? num(raw) : 0;
  if (!isFinite(lim) || lim < 0) { err.textContent = 'Escribe un límite válido o déjalo vacío.'; return; }
  var id = K.editId || newId(), wasEdit = !!K.editId, fromTx = K.fromTx;
  closeSheet('catScrim');
  put('cats/' + id, {name:name, icon:K.icon, color:K.color, limit:lim, order:K.order}).then(function () { if (fromTx) { F.cat = id; paintTx(); } });
  toast(wasEdit ? 'Categoría actualizada' : 'Categoría creada: ' + name);
});
$('catDelete').addEventListener('click', function () {
  if (S.cats.length <= 1) { $('cErr').textContent = 'Necesitas al menos una categoría.'; return; }
  var gone = cat(K.editId), rest = S.cats.filter(function (c) { return c.id !== gone.id; });
  var fallback = rest.filter(function (c) { return c.name.toLowerCase() === 'otros'; })[0] || rest[0], moved = 0, upd = {};
  upd['cats/' + gone.id] = null;
  S.tx.forEach(function (x) { if (x.cat === gone.id) { upd['tx/' + x.id + '/cat'] = fallback.id; moved++; } });
  S.bills.forEach(function (b) { if (b.cat === gone.id) upd['bills/' + b.id + '/cat'] = fallback.id; });
  closeSheet('catScrim'); patch(upd);
  toast('Categoría eliminada' + (moved ? ' · ' + plural(moved, 'movimiento pasó', 'movimientos pasaron') + ' a ' + fallback.name : ''));
});

/* ------------------------------------------------------------------ */
/* Formulario: meta                                                    */
/* ------------------------------------------------------------------ */
var G = {};
function paintGoal() {
  $('goalIcons').innerHTML = iconGrid(G.icon, 'goal');
  $('goalColors').innerHTML = colorRow(G.color);
  $('goalPreview').innerHTML = tile(G.icon, G.color, 44, 14) + '<div style="display:flex;flex-direction:column"><b>' + esc($('gName').value.trim() || 'Laptop nueva') + '</b><span class="sub" style="font-size:12px">Meta de ahorro</span></div>';
  $('goalTitle').textContent = G.editId ? 'Editar meta' : 'Nueva meta';
  $('goalSave').textContent = G.editId ? 'Guardar cambios' : 'Crear meta';
  $('goalDelete').style.display = G.editId ? '' : 'none';
  $('gAddWrap').style.display = G.editId ? '' : 'none';
  paintGoalAcc();
}
function paintGoalAcc() {
  var v = $('gAdd').value.trim() ? num($('gAdd').value) : 0, out = v < 0, bals = balances();
  $('gAccLab').textContent = out ? '¿A qué cuenta vuelve la plata?' : '¿De qué cuenta sale?';
  $('gAccChips').innerHTML = S.accounts.filter(function (a) { return !isCredit(a); }).map(function (a) {
    return '<button type="button" class="chip" data-gacc="' + esc(a.id) + '" aria-pressed="' + (G.acc === a.id) + '">' + svg(accIcon(a), 14, 2) + esc(a.name) + ' · ' + money(bals[a.id] || 0) + '</button>';
  }).join('') + '<button type="button" class="chip" data-gacc="" aria-pressed="' + (!G.acc) + '">Ninguna, solo anotar</button>';
}
function openGoal(editId) {
  var g = editId ? S.goals.filter(function (x) { return x.id === editId; })[0] : null;
  var firstAcc = S.accounts.filter(function (a) { return !isCredit(a); })[0];
  G = {editId: g ? g.id : null, icon: g ? (g.icon || 'star') : 'plane', color: g ? (g.color || 'verde') : 'turquesa', order: g ? g.order : nextOrder(S.goals), acc: G && G.acc !== undefined && acc(G.acc).id === G.acc ? G.acc : (firstAcc ? firstAcc.id : '')};
  $('gName').value = g ? g.name : ''; $('gTarget').value = g ? g.target.toFixed(2) : ''; $('gSaved').value = g ? (g.saved || 0).toFixed(2) : ''; $('gAdd').value = '';
  $('gErr').textContent = '';
  iconQuery.goal = ''; $('gIconQ').value = '';
  paintGoal(); openSheet('goalScrim', g ? 'gAdd' : 'gName');
}
$('goalForm').addEventListener('submit', function (e) {
  e.preventDefault();
  var err = $('gErr'), name = $('gName').value.trim();
  var target = num($('gTarget').value), saved = $('gSaved').value.trim() ? num($('gSaved').value) : 0, add = $('gAdd').value.trim() ? num($('gAdd').value) : 0;
  if (!name) { err.textContent = 'Ponle un nombre a la meta.'; $('gName').focus(); return; }
  if (!isFinite(target) || target <= 0) { err.textContent = 'Escribe cuánto quieres juntar.'; $('gTarget').focus(); return; }
  if (!isFinite(saved) || saved < 0) { err.textContent = 'Lo ahorrado debe ser 0 o más.'; return; }
  if (!isFinite(add)) { err.textContent = 'Escribe un aporte válido.'; return; }
  var id = G.editId || newId(), wasEdit = !!G.editId;
  var newSaved = round2(Math.max(saved + add, 0)), moved = round2(newSaved - saved);
  if (moved > 0 && G.acc) { var bal = balances()[G.acc] || 0; if (moved > bal + 0.004) { err.textContent = 'En ' + acc(G.acc).name + ' solo tienes ' + money(bal) + '.'; return; } }
  closeSheet('goalScrim');
  var upd = {}; upd['goals/' + id] = {name:name, target:target, saved:newSaved, icon:G.icon, color:G.color, order:G.order};
  if (moved && G.acc) upd['tx/' + newId()] = {date:todayISO(), desc:(moved > 0 ? 'Aporte a ' : 'Retiro de ') + name, cat:'goal', goal:id, acc:G.acc, amount:-moved, created:Date.now()};
  patch(upd);
  toast(moved > 0 ? 'Aporte de ' + money(moved) + ' sumado' + (G.acc ? ' desde ' + acc(G.acc).name : '') : moved < 0 ? money(-moved) + ' sacados de la meta' + (G.acc ? ' a ' + acc(G.acc).name : '') : wasEdit ? 'Meta actualizada' : 'Meta creada: ' + name);
});
$('goalDelete').addEventListener('click', function () { closeSheet('goalScrim'); del('goals/' + G.editId); toast('Meta eliminada'); });

/* ------------------------------------------------------------------ */
/* Formulario: pago fijo                                               */
/* ------------------------------------------------------------------ */
var B = {};
function paintBill() {
  if (!S.cats.some(function (c) { return c.id === B.cat; })) B.cat = S.cats[0] && S.cats[0].id;
  if (!S.accounts.some(function (a) { return a.id === B.acc; })) B.acc = S.accounts[0] && S.accounts[0].id;
  document.querySelectorAll('#bFreq button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.bfreq === B.freq)); });
  document.querySelectorAll('#bMode button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.bmode === (B.auto ? 'auto' : 'manual'))); });
  $('bWeekly').style.display = B.freq === 'weekly' ? '' : 'none';
  $('bMonthly').style.display = B.freq === 'monthly' ? '' : 'none';
  $('bDateWrap').style.display = B.freq === 'yearly' || B.freq === 'once' ? '' : 'none';
  $('bDateLab').textContent = B.freq === 'yearly' ? 'Fecha (se repite cada año)' : 'Fecha exacta';
  $('bDays').innerHTML = WD_SHORT.map(function (n, i) { return '<button type="button" class="chip" data-bday="' + i + '" aria-pressed="' + (B.days.indexOf(i) >= 0) + '" aria-label="' + WD_NAME[i] + '" style="min-width:52px;justify-content:center">' + n + '</button>'; }).join('');
  $('bModeHint').textContent = B.auto ? 'Cuando llegue el día, el gasto se anota solo en tu cuenta.' : 'Cuando llegue el día te aparece para registrarlo. Si no lo registras, se entiende que ese día no lo pagaste.';
  $('bCats').innerHTML = S.cats.map(function (c) { return '<button type="button" class="chip" data-bcat="' + esc(c.id) + '" aria-pressed="' + (c.id === B.cat) + '"><i style="width:8px;height:8px;border-radius:4px;background:' + C(c.color).dot + '"></i>' + esc(c.name) + '</button>'; }).join('');
  $('bAccs').innerHTML = S.accounts.map(function (a) { return '<button type="button" class="chip" data-bacc="' + esc(a.id) + '" aria-pressed="' + (a.id === B.acc) + '">' + svg(accIcon(a), 14, 2) + esc(a.name) + '</button>'; }).join('');
  $('billTitle').textContent = B.editId ? 'Editar pago fijo' : 'Nuevo pago fijo';
  $('billSave').textContent = B.editId ? 'Guardar cambios' : 'Crear pago fijo';
  $('billDelete').style.display = B.editId ? '' : 'none';
}
function openBill(editId) {
  var b = editId ? S.bills.filter(function (x) { return x.id === editId; })[0] : null;
  var first = S.cats[0];
  B = {editId: b ? b.id : null, cat: b ? b.cat : (first && first.id), acc: b ? b.acc : (S.accounts[0] && S.accounts[0].id),
       freq: b ? b.freq : 'weekly', days: b && b.days ? b.days.slice() : [wdIdx(new Date())], auto: b ? !!b.auto : false,
       done: b ? (b.done || {}) : {}, start: b ? (b.start || todayISO()) : todayISO(), order: b ? b.order : nextOrder(S.bills)};
  $('bName').value = b ? b.name : ''; $('bAmount').value = b ? b.amount.toFixed(2) : '';
  $('bDay').value = b && b.day ? b.day : ''; $('bDate').value = b && b.date ? b.date : todayISO();
  $('bErr').textContent = '';
  paintBill(); openSheet('billScrim', 'bName');
}
$('billForm').addEventListener('submit', function (e) {
  e.preventDefault();
  var err = $('bErr'), name = $('bName').value.trim(), amount = num($('bAmount').value);
  if (!name) { err.textContent = 'Ponle un nombre al pago.'; $('bName').focus(); return; }
  if (!isFinite(amount) || amount <= 0) { err.textContent = 'Escribe el monto del pago.'; $('bAmount').focus(); return; }
  var obj = {name:name, amount:amount, cat:B.cat, acc:B.acc, freq:B.freq, auto:!!B.auto, start:B.start, order:B.order};
  if (B.freq === 'weekly') {
    if (!B.days.length) { err.textContent = 'Elige al menos un día de la semana.'; return; }
    obj.days = B.days.slice().sort();
  } else if (B.freq === 'monthly') {
    var day = parseInt($('bDay').value, 10);
    if (!(day >= 1 && day <= 31)) { err.textContent = 'El día del mes debe ser entre 1 y 31.'; $('bDay').focus(); return; }
    obj.day = day;
  } else {
    var dt = $('bDate').value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dt)) { err.textContent = 'Elige una fecha.'; $('bDate').focus(); return; }
    obj.date = dt;
    if (B.freq === 'once' && dt < obj.start) obj.start = dt;
  }
  if (!B.cat || !B.acc) { err.textContent = 'Necesitas al menos una categoría y una cuenta.'; return; }
  if (B.done && Object.keys(B.done).length) obj.done = B.done;
  var id = B.editId || newId(), wasEdit = !!B.editId;
  closeSheet('billScrim'); put('bills/' + id, obj);
  toast(wasEdit ? 'Pago fijo actualizado' : 'Pago fijo creado: ' + name);
});
$('billDelete').addEventListener('click', function () { closeSheet('billScrim'); del('bills/' + B.editId); toast('Pago fijo eliminado'); });

/* ------------------------------------------------------------------ */
/* Clics                                                               */
/* ------------------------------------------------------------------ */
document.addEventListener('click', function (e) {
  if (e.target.hasAttribute && e.target.hasAttribute('data-sm-scrim')) { closeSh(); return; }
  var t = e.target.closest('button, a'); if (!t) return;
  var d = t.dataset;
  if (shClick(t, d)) return;
  if (t.hasAttribute('data-open-add')) { if (!S.accounts.length) { toast('Primero crea una cuenta en Configuración'); location.hash = 'personalizar'; return; } if (!S.cats.length) { toast('Primero crea una categoría en Configuración'); location.hash = 'personalizar'; return; } openTx(); return; }
  if (d.close) { closeSheet(d.close); return; }
  if (t.hasAttribute('data-open-acc')) { openAcc(); return; }
  if (t.hasAttribute('data-open-cat')) { openCat(null, d.openCat === 'fromtx'); return; }
  if (t.hasAttribute('data-open-goal')) { openGoal(); return; }
  if (t.hasAttribute('data-open-bill')) { if (!S.accounts.length) { toast('Primero crea una cuenta'); return; } openBill(); return; }
  if (d.editTx) { var it = S.tx.filter(function (x) { return x.id === d.editTx; })[0]; if (it) openTx({edit:it}); return; }
  if (d.editAcc) { openAcc(d.editAcc); return; }
  if (d.editCat) { openCat(d.editCat); return; }
  if (d.editGoal) { openGoal(d.editGoal); return; }
  if (d.gacc !== undefined) { G.acc = d.gacc; paintGoalAcc(); return; }
  if (d.editBill) { openBill(d.editBill); return; }
  if (d.ttype) { F.type = d.ttype; paintTx(); return; }
  if (d.cat) { F.cat = d.cat; paintTx(); return; }
  if (d.acc) { F.acc = d.acc; paintTx(); return; }
  if (d.to) { F.to = d.to; paintTx(); return; }
  if (d.atype) { A.type = d.atype; if (!A.iconTouched) A.icon = TYPES[A.type].icon; paintAcc(); return; }
  if (d.bcat) { B.cat = d.bcat; paintBill(); return; }
  if (d.bacc) { B.acc = d.bacc; paintBill(); return; }
  if (d.pickIcon) { var s1 = t.closest('.scrim').id; if (s1 === 'accScrim') { A.icon = d.pickIcon; A.iconTouched = true; paintAcc(); } else if (s1 === 'goalScrim') { G.icon = d.pickIcon; paintGoal(); } else { K.icon = d.pickIcon; paintCat(); } return; }
  if (d.pickColor) { var s2 = t.closest('.scrim').id; if (s2 === 'accScrim') { A.color = d.pickColor; paintAcc(); } else if (s2 === 'goalScrim') { G.color = d.pickColor; paintGoal(); } else { K.color = d.pickColor; paintCat(); } return; }
  if (d.month) { viewMonth = shiftMonth(viewMonth, +d.month); if (viewMonth > curYM()) viewMonth = curYM(); render(); return; }
  if (t.hasAttribute('data-ftoggle')) { filterOpen = !filterOpen; render(); return; }
  if (t.hasAttribute('data-fclear')) { fKind = 'todos'; fAccs = []; fCats = []; render(); return; }
  if (d.fkind) { fKind = d.fkind; render(); return; }
  if (d.facc) { var i1 = fAccs.indexOf(d.facc); if (i1 >= 0) fAccs.splice(i1, 1); else fAccs.push(d.facc); render(); return; }
  if (d.fcat) { var i2 = fCats.indexOf(d.fcat); if (i2 >= 0) fCats.splice(i2, 1); else fCats.push(d.fcat); render(); return; }
  if (d.accent) { S.settings.accent = d.accent; applyAccent(); put('settings/accent', d.accent); toast('Color actualizado'); return; }
  if (d.theme) { S.settings.theme = d.theme; applyAccent(); render(); put('settings/theme', d.theme); return; }
  if (d.currency) { put('settings/currency', d.currency); toast('Moneda: ' + d.currency); return; }
  if (d.pay) {
    var card = acc(d.pay), debt = Math.max(-balances()[card.id], 0);
    var src = S.accounts.filter(function (a) { return !isCredit(a); });
    if (!src.length) { toast('Necesitas una cuenta (no tarjeta) para pagar'); return; }
    openTx({type:'transfer', from:src[0].id, to:card.id, amount:debt, desc:'Pago ' + card.name}); return;
  }
  if (d.payocc) {
    var po = d.payocc.split('|'), b = S.bills.filter(function (x) { return x.id === po[0]; })[0]; if (!b) return;
    openTx({type:'gasto', cat:b.cat, from:b.acc, amount:b.amount, desc:b.name, billId:b.id, billOcc:po[1], date: po[1] <= todayISO() ? po[1] : todayISO()}); return;
  }
  if (d.skipocc) {
    var so = d.skipocc.split('|'); put('bills/' + so[0] + '/done/' + so[1], 'skip'); toast('Listo, no se registró'); return;
  }
  if (d.bfreq) { B.freq = d.bfreq; paintBill(); return; }
  if (d.bmode) { B.auto = d.bmode === 'auto'; paintBill(); return; }
  if (d.bday !== undefined) { var di = +d.bday, ix = B.days.indexOf(di); if (ix >= 0) B.days.splice(ix, 1); else B.days.push(di); paintBill(); return;
  }
  if (t.hasAttribute('data-install') || t.id === 'installLogin') { if (installEvt) { installEvt.prompt(); installEvt.userChoice.then(function () { installEvt = null; $('installLogin').hidden = true; render(); }); } return; }
  if (t.hasAttribute('data-logout')) {
    if (outbox.length && !confirmLogout) { confirmLogout = true; toast('Tienes ' + plural(outbox.length, 'cambio', 'cambios') + ' sin subir. Conéctate a internet antes de cerrar sesión, o toca otra vez para cerrar igual.'); setTimeout(function () { confirmLogout = false; }, 6000); return; }
    clearLocal(); auth.signOut(); location.hash = ''; return;
  }
});
['txScrim', 'accScrim', 'catScrim', 'goalScrim', 'billScrim'].forEach(function (id) { $(id).addEventListener('click', function (e) { if (e.target.id === id) closeSheet(id); }); });
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  var open = ['billScrim', 'goalScrim', 'catScrim', 'accScrim', 'txScrim'].filter(function (id) { return $(id).classList.contains('on'); });
  if (open.length) closeSheet(open[0]);
});
$('fAmount').addEventListener('input', function () { $('fErr').textContent = ''; });
$('aName').addEventListener('input', function () { $('aErr').textContent = ''; paintAcc(); });
['aBal', 'aLimit', 'aDebt', 'aClose', 'aPay'].forEach(function (id) { $(id).addEventListener('input', function () { $('aErr').textContent = ''; }); });
$('cName').addEventListener('input', function () { $('cErr').textContent = ''; paintCat(); });
$('cLimit').addEventListener('input', function () { $('cErr').textContent = ''; });
$('gName').addEventListener('input', function () { $('gErr').textContent = ''; paintGoal(); });
$('gAdd').addEventListener('input', function () { $('gErr').textContent = ''; paintGoalAcc(); });
['gTarget', 'gSaved', 'gAdd'].forEach(function (id) { $(id).addEventListener('input', function () { $('gErr').textContent = ''; }); });
['bName', 'bAmount', 'bDay', 'bDate'].forEach(function (id) { $(id).addEventListener('input', function () { $('bErr').textContent = ''; }); });

document.addEventListener('input', function (e) {
  var k = e.target && e.target.getAttribute && e.target.getAttribute('data-iconq');
  if (k) { iconQuery[k] = e.target.value; repaintIcons(k); }
});
document.addEventListener('submit', function (e) { if (e.target.id === 'smForm') { e.preventDefault(); submitSh(); } });
document.addEventListener('input', function (e) {
  if (e.target.id === 'smAmount' && SM && SM.kind === 'gasto') { var pos = e.target.selectionStart; keepSh(); paintSh(); var a = $('smAmount'); if (a) { a.focus(); try { a.setSelectionRange(pos, pos); } catch (er) {} } }
  if (e.target.id === 'smCode' && SM && SM.invite) { SM.invite = null; keepSh(); paintSh(); var c = $('smCode'); if (c) c.focus(); }
});
document.addEventListener('change', function (e) {
  var el = e.target, nm = el.getAttribute && el.getAttribute('data-sh-name'), pc = el.getAttribute && el.getAttribute('data-sh-pct');
  if (nm) { var v = el.value.trim(); if (!v) { render(); return; } var u = {}; u['shared/' + nm + '/meta/name'] = v; commitAbs(u); toast('Nombre guardado'); }
  if (pc) {
    var p = pc.split('|'), sh = shById(p[0]); if (!sh) return;
    var val = +el.value, pct = Object.assign({}, sh.meta.pct || {}); pct[p[1]] = val;
    if (sh.members.length === 2) { var other = sh.members.filter(function (m) { return m.uid !== p[1]; })[0]; pct[other.uid] = 100 - val; }
    var u2 = {}; u2['shared/' + p[0] + '/meta/pct'] = pct; commitAbs(u2);
  }
});
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && SM) closeSh(); });
function checkJoinHash() { var h = (location.hash || '').slice(1); if (h.indexOf('unirse-') === 0) { pendingJoinCode = h.slice(7).toUpperCase(); location.hash = 'cfg-compartidas'; } }
checkJoinHash();
window.addEventListener('hashchange', checkJoinHash);
document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && S.user && ref) { runAuto(); render(); } });
window.addEventListener('hashchange', function () { if (current() !== 'inicio' && ['movimientos', 'presupuesto', 'estadisticas'].indexOf(current()) < 0) viewMonth = curYM(); render(); window.scrollTo(0, 0); });

/* ------------------------------------------------------------------ */
/* Instalación (PWA)                                                   */
/* ------------------------------------------------------------------ */
window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); installEvt = e; $('installLogin').hidden = false; if (current() === 'personalizar') render(); });
window.addEventListener('appinstalled', function () { installEvt = null; $('installLogin').hidden = true; toast('My Wallet se instaló'); });
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function (e) { console.warn('SW', e); }); });
}
})();
