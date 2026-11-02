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
var installEvt = null;

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
function svg(key, size, sw) { var p = ICONS[key] || key; return '<svg width="' + (size || 20) + '" height="' + (size || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.8) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; }
function C(k) { return COLORS[k] || COLORS.gris; }
function tile(iconKey, colorKey, size, r) { var c = C(colorKey); return '<span class="ico" style="background:' + c.soft + ';color:' + c.ink + (size ? ';width:' + size + 'px;height:' + size + 'px' : '') + (r ? ';border-radius:' + r + 'px' : '') + '">' + svg(iconKey, size ? Math.round(size / 2) : 16, 2) + '</span>'; }
function cat(id) { if (id === 'ingreso') return INCOME; if (id === 'transfer') return TRANSFER; return S.cats.filter(function (c) { return c.id === id; })[0] || {id:id, name:'Sin categoría', color:'gris', icon:'dots', limit:0}; }
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
function put(path, obj) { return ref.child(path).set(obj).catch(fail); }
function patch(obj) { return ref.update(obj).catch(fail); }
function del(path) { return ref.child(path).remove().catch(fail); }

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
  if (!u) { applyAccent(); show('login'); return; }
  $('loadingMsg').textContent = 'Cargando tu billetera…';
  show('loading');
  ref = db.ref('billetera/' + u.uid);
  ref.on('value', function (snap) {
    var v = snap.val();
    if (!v || !v.meta) { seedUser(u); return; }
    hydrate(v);
    show('app');
    render();
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
  S.bills = toList(v.bills).sort(function (a, b) { return (a.day || 0) - (b.day || 0); });
  S.tx = toList(v.tx);
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
  return S.tx.reduce(function (s, t) { return t.date && t.date.slice(0, 7) === m && t.cat !== 'transfer' && t.amount < 0 ? s - t.amount : s; }, 0);
}
function stats(m) {
  var inc = 0, exp = 0, byCat = {};
  S.cats.forEach(function (c) { byCat[c.id] = 0; });
  S.tx.forEach(function (t) {
    if (!t.date || t.date.slice(0, 7) !== m || t.cat === 'transfer') return;
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
var VIEWS = [
  {id:'inicio', name:'Inicio', icon:'home'},
  {id:'presupuesto', name:'Presupuesto', icon:P.target},
  {id:'movimientos', name:'Movimientos', icon:P.list},
  {id:'estadisticas', name:'Estadísticas', icon:P.chart},
  {id:'billetera', name:'Mi billetera', short:'Billetera', icon:'wallet'},
  {id:'personalizar', name:'Personalizar', icon:P.gear}
];
var ALIAS = {cuentas:'billetera', reportes:'estadisticas', metas:'presupuesto'};
function current() { var h = (location.hash || '').slice(1); h = ALIAS[h] || h; return VIEWS.some(function (v) { return v.id === h; }) ? h : 'inicio'; }

function renderNav() {
  var cur = current();
  $('sidenav').innerHTML = VIEWS.map(function (v) {
    return '<a class="navlink" href="#' + v.id + '"' + (v.id === cur ? ' aria-current="page"' : '') + '>' + svg(v.icon, 20) + v.name + '</a>';
  }).join('');
  var mob = ['inicio', 'presupuesto', 'movimientos', 'estadisticas', 'billetera'], parent = {personalizar:'inicio'};
  var html = '<button class="fab" data-open-add aria-label="Agregar movimiento">' + svg(P.plus, 26, 2.2) + '</button>';
  mob.forEach(function (id) {
    var v = VIEWS.filter(function (x) { return x.id === id; })[0];
    var on = id === cur || parent[cur] === id;
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
      '<div class="balance"><div style="display:flex;flex-direction:column;gap:6px"><span class="lbl">Tu dinero</span><span class="big">' + (s.cash < 0 ? '−' : '') + money(s.cash) + '</span>' + (s.debt > 0 ? '<span class="lbl">Deuda en tarjetas: <b style="color:#FFB4A3">' + money(s.debt) + '</b></span>' : '') + '</div>' +
      '<div class="duo"><div><span class="lbl" style="font-size:12px">Ingresos del mes</span><b style="color:var(--mint);font-size:15px">+' + money(s.inc) + '</b></div><div><span class="lbl" style="font-size:12px">Gastos del mes</span><b style="font-size:15px">−' + money(s.exp) + '</b></div></div></div>' +
      '<div><div class="row-between" style="margin-bottom:10px"><b style="font-size:15px">Mis cuentas</b><a class="link" href="#billetera">Gestionar</a></div><div class="accounts">' + S.accounts.map(function (a) { return accTile(a, s.bal[a.id]); }).join('') + '<button class="acc addcard" style="min-height:0;border-radius:18px" data-open-acc>' + svg(P.plus, 20, 2) + '<span style="font-size:13px">Agregar</span></button></div></div>' +
      budgetBlock(s) +
    '</div>' +
    '<div class="c5" style="display:flex;flex-direction:column;gap:16px">' + upcomingCard() + (recent.length
      ? '<div class="card"><div class="row-between"><h2>Movimientos recientes</h2><a class="link" href="#movimientos">Ver todo</a></div>' + recent.map(function (t) { return txRow(t, true); }).join('') + '</div>'
      : emptyBox('coins', 'Registra tu primer gasto', 'Cada gasto o ingreso que anotes actualiza tus cuentas, tu presupuesto y tus reportes.', '<button class="btn btn-primary" data-open-add style="margin-top:6px">' + svg(P.plus, 18, 2.2) + 'Agregar movimiento</button>')) +
    '</div>' +
  '</div>';
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
        '<div class="row-between" style="font-size:13px;background:var(--bg);border-radius:12px;padding:10px 12px"><span>Cierre: día ' + a.closeDay + '</span><b>Pagar antes del ' + nextDateLabel(a.payDay) + '</b></div>' +
        (debt > 0 ? '<button class="btn btn-primary btn-sm" data-pay="' + esc(a.id) + '">Pagar tarjeta (' + money(debt) + ')</button>' : '<span class="sub" style="font-size:13px">No tienes deuda en esta tarjeta.</span>');
    } else body = '<b style="font-size:26px;letter-spacing:-.01em">' + (bal < 0 ? '−' : '') + money(bal) + '</b>';
    return '<div class="acccard"><div class="head">' + tile(accIcon(a), a.color, 40, 13) + '<div style="flex:1;min-width:0;display:flex;flex-direction:column"><b style="font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(a.name) + '</b><span class="typetag">' + (TYPES[a.type] || TYPES.efectivo).name + '</span></div>' +
      '<button class="del" data-edit-acc="' + esc(a.id) + '" aria-label="Editar ' + esc(a.name) + '">' + svg(P.edit, 18) + '</button></div>' + body + '</div>';
  }).join('');
  return '<div class="top"><div><div class="sub">Tus cuentas, tarjetas y ahorros</div><h1>Mi billetera</h1></div><button class="btn btn-dark" data-open-acc>' + svg(P.plus, 18, 2.2) + 'Agregar cuenta</button></div>' +
    '<div class="metrics"><div class="metric"><span class="sub" style="font-size:13px">Patrimonio neto</span><b>' + (s.net < 0 ? '−' : '') + money(s.net) + '</b></div><div class="metric"><span class="sub" style="font-size:13px">Tu dinero</span><b style="font-size:18px">' + money(s.cash) + '</b></div><div class="metric"><span class="sub" style="font-size:13px">Deuda en tarjetas</span><b style="font-size:18px;color:' + (s.debt > 0 ? 'var(--red)' : 'inherit') + '">' + money(s.debt) + '</b></div></div>' +
    '<div class="accgrid">' + cards + '<button class="addcard" data-open-acc>' + svg(P.plus, 24, 2) + 'Agregar cuenta<span class="sub" style="font-weight:500;font-size:13px">Banco, ahorros, billetera o tarjeta</span></button></div>' + goalsCard();
}

function filterCount() { return (fKind !== 'todos' ? 1 : 0) + fAccs.length + fCats.length; }
function viewMovimientos() {
  fAccs = fAccs.filter(function (id) { return S.accounts.some(function (a) { return a.id === id; }); });
  fCats = fCats.filter(function (id) { return S.cats.some(function (c) { return c.id === id; }); });
  var inMonth = S.tx.filter(function (t) { return t.date && t.date.slice(0, 7) === viewMonth; });
  var list = sortedTx(inMonth).filter(function (t) {
    if (fKind === 'gastos' && !(t.amount < 0 && t.cat !== 'transfer')) return false;
    if (fKind === 'ingresos' && !(t.amount > 0 && t.cat !== 'transfer')) return false;
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
      var sum = groups[d].reduce(function (s, t) { return t.cat === 'transfer' ? s : s + t.amount; }, 0);
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
      '<div class="donut" style="width:110px;height:110px;background:conic-gradient(var(--mint) 0 ' + Math.min(pct, 100) + '%, #2C3038 ' + Math.min(pct, 100) + '% 100%)"><div style="width:84px;height:84px;background:var(--dark)"><b style="font-size:22px">' + pct + '%</b><span class="lbl" style="font-size:11px">usado</span></div></div>' +
      '<div style="display:flex;flex-direction:column;gap:6px"><span class="lbl">' + (left >= 0 ? 'Te quedan para ' + mname : 'Te pasaste en ' + mname) + '</span><span class="big" style="font-size:30px">' + money(left) + '</span><span style="font-size:13px;color:#E0E3E8">' + (s.isCur ? (left > 0 ? 'Puedes gastar ' + money(perDay) + ' por día durante ' + plural(s.daysLeft, 'día', 'días') : 'Revisa tus categorías en rojo') : 'Presupuesto de ' + money(s.limit) + ' en total') + '</span></div></div>';
  return '<div class="top"><div><div class="sub">Límites del mes y pagos fijos</div><h1>Presupuesto</h1></div>' + monthNav() + '</div>' +
  '<div class="grid">' +
    '<div class="c5">' + hero + '</div>' +
    '<div class="c7"><div class="card"><div class="row-between"><h2>Por categoría</h2><a class="link" href="#personalizar">Editar límites</a></div>' +
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
  var mtx = S.tx.filter(function (t) { return t.date && t.date.slice(0, 7) === viewMonth && t.cat !== 'transfer'; });
  var exps = mtx.filter(function (t) { return t.amount < 0; });
  var stops = s.exp ? S.cats.map(function (c) { var p = (s.byCat[c.id] || 0) / s.exp * 100; var a = a0; a0 += p; return C(c.color).dot + ' ' + a.toFixed(2) + '% ' + a0.toFixed(2) + '%'; }).join(',') : '#ECEAE3 0 100%';
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
    S.tx.forEach(function (t) { if (!t.date || t.date.slice(0, 7) !== m || t.cat === 'transfer') return; if (t.amount > 0) inc += t.amount; else exp -= t.amount; });
    return {m:m, inc:inc, exp:exp};
  });
  var max6 = Math.max.apply(null, six.map(function (x) { return Math.max(x.inc, x.exp); })) || 1;
  var trend = '<div class="card"><div class="row-between"><h2>Ingresos y gastos</h2><span class="sub" style="font-size:12px">Últimos 6 meses</span></div>' +
    '<div class="pairs">' + six.map(function (x) {
      var on = x.m === viewMonth;
      return '<div><div class="pb"><span style="height:' + Math.max(Math.round(x.inc / max6 * 130), 3) + 'px;background:' + (on ? 'var(--green)' : 'var(--mint)') + '" title="Ingresos ' + money(x.inc) + '"></span><span style="height:' + Math.max(Math.round(x.exp / max6 * 130), 3) + 'px;background:' + (on ? 'var(--ink)' : '#C9C5BA') + '" title="Gastos ' + money(x.exp) + '"></span></div><span class="sub" style="font-size:12px;font-weight:' + (on ? 700 : 500) + '">' + monthShort(x.m) + '</span></div>';
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
    wd.map(function (v, i) { return '<div><span class="sub" style="font-size:11px">' + (v ? Math.round(v).toLocaleString('en-US') : '') + '</span><span class="b" style="height:' + Math.max(Math.round(v / wmax * 110), 3) + 'px;background:' + (i === wTop && v ? 'var(--green)' : '#D9D5CB') + '"></span><span class="sub" style="font-size:12px;font-weight:600">' + WD[i] + '</span></div>'; }).join('') + '</div></div>';

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
  }).join('') : '<p class="sub" style="margin:0 0 4px">Crea una meta (un viaje, una laptop, tu fondo de emergencia) y ve sumando tus aportes.</p>';
  return '<div class="card"><div class="row-between"><h2>Metas de ahorro</h2><button class="btn btn-dark btn-sm" data-open-goal>' + svg(P.plus, 16, 2.2) + 'Nueva meta</button></div>' + goals + '</div>';
}

function billRow(b, m, compact) {
  var paid = b.paid && b.paid[m], c = cat(b.cat), cc = C(c.color), today = new Date().getDate();
  var late = !paid && b.day < today, soon = !paid && b.day >= today && b.day - today <= 3;
  var when = paid ? '' : late ? ' · <b style="color:var(--red)">venció el ' + b.day + '</b>' : b.day === today ? ' · <b style="color:var(--red)">vence hoy</b>' : soon ? ' · <b style="color:#8A6410">en ' + plural(b.day - today, 'día', 'días') + '</b>' : '';
  return '<div class="setrow"><span class="ic" style="background:' + cc.soft + ';color:' + cc.ink + ';flex-direction:column;line-height:1"><b style="font-size:14px">' + b.day + '</b><span style="font-size:9px;font-weight:700">' + MES3[new Date().getMonth()].toUpperCase() + '</span></span>' +
    '<span class="t"><b>' + esc(b.name) + '</b><span>' + money(b.amount) + ' · ' + esc(acc(b.acc).name) + when + '</span></span>' +
    (paid ? '<span class="tag">' + svg(P.check, 14, 2.4) + 'Pagado</span>' : '<button class="btn btn-primary btn-sm" data-paybill="' + esc(b.id) + '">Registrar</button>') +
    (compact ? '' : '<button class="del" data-edit-bill="' + esc(b.id) + '" aria-label="Editar ' + esc(b.name) + '">' + svg(P.edit, 18) + '</button>') + '</div>';
}

function billsCard() {
  var s = stats(curYM()), m = curYM();
  var rows = S.bills.map(function (b) { return billRow(b, m, false); });
  S.accounts.filter(isCredit).forEach(function (a) {
    var d = Math.max(-s.bal[a.id], 0); if (!(d > 0)) return;
    rows.push('<div class="setrow">' + tile(accIcon(a), a.color, 40, 13) + '<span class="t"><b>Pago ' + esc(a.name) + '</b><span>' + money(d) + ' · antes del ' + nextDateLabel(a.payDay) + '</span></span><button class="btn btn-primary btn-sm" data-pay="' + esc(a.id) + '">Pagar</button></div>');
  });
  var total = S.bills.reduce(function (x, b) { return x + b.amount; }, 0);
  var pending = S.bills.filter(function (b) { return !(b.paid && b.paid[m]); }).reduce(function (x, b) { return x + b.amount; }, 0);
  return '<div class="card"><div class="row-between" style="align-items:center"><h2 style="margin:0">Pagos fijos de ' + MESES[new Date().getMonth()] + '</h2><button class="btn btn-dark btn-sm" data-open-bill>' + svg(P.plus, 16, 2.2) + 'Nuevo pago</button></div>' +
    (S.bills.length ? '<p class="sub" style="margin:8px 0 4px;font-size:13px">Todos los meses: ' + money(total) + ' · Falta pagar: ' + money(pending) + '</p>' : '<p class="sub" style="margin:10px 0 0">Anota lo que pagas cada mes y qué día (alquiler el 1, internet el 5, luz el 12…). Te avisamos cuando se acerque la fecha y lo registras con un toque.</p>') +
    rows.join('') + '</div>';
}

function upcomingCard() {
  var m = curYM(), today = new Date().getDate();
  if (!S.bills.length) return '<div class="card"><div class="row-between" style="align-items:center"><h2 style="margin:0">Pagos fijos</h2><button class="btn btn-ghost btn-sm" data-open-bill>' + svg(P.plus, 16, 2.2) + 'Agregar</button></div><p class="sub" style="margin:10px 0 0;font-size:13px">Anota lo que pagas cada mes (alquiler, internet, luz…) y aquí verás lo que viene.</p></div>';
  var pend = S.bills.filter(function (b) { return !(b.paid && b.paid[m]); }).sort(function (a, b) { return a.day - b.day; });
  if (!pend.length) return '<div class="card"><div class="row-between"><h2 style="margin:0">Pagos fijos</h2><a class="link" href="#presupuesto">Ver todos</a></div><p class="sub" style="margin:10px 0 0;font-size:13px">' + svg(P.check, 14, 2.4) + ' Ya pagaste todos tus pagos fijos de este mes.</p></div>';
  var sum = pend.reduce(function (x, b) { return x + b.amount; }, 0);
  return '<div class="card"><div class="row-between"><h2 style="margin:0">Próximos pagos</h2><a class="link" href="#presupuesto">Ver todos</a></div><p class="sub" style="margin:6px 0 2px;font-size:13px">Te falta pagar ' + money(sum) + ' este mes</p>' + pend.slice(0, 3).map(function (b) { return billRow(b, m, true); }).join('') + '</div>';
}

function viewPersonalizar() {
  var used = {}; S.tx.forEach(function (t) { used[t.cat] = (used[t.cat] || 0) + 1; });
  var u = S.user || {};
  var standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  var install = standalone ? '<p class="sub" style="margin:0;font-size:13px">Ya estás usando la app instalada.</p>'
    : installEvt ? '<button class="btn btn-primary btn-sm" data-install>' + svg(P.download, 16, 2) + 'Instalar My Wallet</button>'
    : ios ? '<p class="sub" style="margin:0;font-size:13px">En iPhone: toca Compartir y luego "Agregar a pantalla de inicio".</p>'
    : '<p class="sub" style="margin:0;font-size:13px">Abre el menú del navegador (⋮) y elige "Instalar app" o "Agregar a la pantalla de inicio".</p>';
  return '<div class="top"><div><div class="sub">Haz que la app sea tuya</div><h1>Personalizar</h1></div></div>' +
  '<div class="grid">' +
    '<div class="c5" style="display:flex;flex-direction:column;gap:16px">' +
      '<div class="card"><h2>Tu cuenta</h2><div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">' + avatar(u) + '<div style="min-width:0;display:flex;flex-direction:column"><b style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(u.displayName || '') + '</b><span class="sub" style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(u.email || '') + '</span></div></div>' +
        '<label class="lab" for="sName">Cómo te saludamos</label><input class="field" id="sName" maxlength="20" value="' + esc(S.settings.name || '') + '" placeholder="Tu nombre">' +
        '<button class="btn btn-ghost btn-sm" data-logout style="margin-top:14px">' + svg(P.logout, 16, 2) + 'Cerrar sesión</button></div>' +
      '<div class="card"><h2>Instalar en este dispositivo</h2>' + install + '</div>' +
      '<div class="card"><h2>Color de la app</h2><div class="swatches">' + Object.keys(ACCENTS).map(function (k) { return '<button class="swatch" data-accent="' + k + '" aria-label="Color ' + k + '" aria-pressed="' + (S.settings.accent === k) + '" style="background:' + ACCENTS[k].main + ';width:44px;height:44px;border-radius:22px"></button>'; }).join('') + '</div></div>' +
      '<div class="card"><h2>Moneda</h2><div class="chips">' + CURRENCIES.map(function (c) { return '<button class="chip" data-currency="' + esc(c) + '" aria-pressed="' + (S.settings.currency === c) + '">' + esc(c) + '</button>'; }).join('') + '</div><p class="hint">Solo cambia el símbolo que se muestra, no convierte montos.</p></div>' +
    '</div>' +
    '<div class="c7"><div class="card"><div class="row-between"><h2>Categorías y límites</h2><button class="btn btn-dark btn-sm" data-open-cat>' + svg(P.plus, 16, 2.2) + 'Nueva</button></div>' +
      S.cats.map(function (c) { var n = used[c.id] || 0; return '<div class="setrow">' + tile(c.icon, c.color, 40, 13) + '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px"><b style="font-size:14px">' + esc(c.name) + '</b><span class="sub" style="font-size:12px">' + (c.limit ? 'Límite ' + money(c.limit) + ' al mes' : 'Sin límite') + ' · ' + plural(n, 'movimiento', 'movimientos') + '</span></div><button class="del" data-edit-cat="' + esc(c.id) + '" aria-label="Editar ' + esc(c.name) + '">' + svg(P.edit, 18) + '</button></div>'; }).join('') +
    '</div></div>' +
  '</div>';
}

/* ------------------------------------------------------------------ */
/* Render                                                              */
/* ------------------------------------------------------------------ */
function applyAccent() {
  var a = ACCENTS[S.settings.accent] || ACCENTS.verde, r = document.documentElement.style;
  r.setProperty('--green', a.main); r.setProperty('--green-soft', a.soft); r.setProperty('--green-ink', a.ink); r.setProperty('--mint', a.light);
  var meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', a.main);
  document.querySelectorAll('.cur').forEach(function (el) { el.textContent = S.settings.currency; });
}
function render() {
  if (!S.user || $('app').hidden) return;
  applyAccent(); renderNav();
  var v = current();
  var html = v === 'movimientos' ? viewMovimientos() : v === 'billetera' ? viewCuentas() : v === 'presupuesto' ? viewPresupuesto() : v === 'estadisticas' ? viewEstadisticas() : v === 'personalizar' ? viewPersonalizar() : viewInicio();
  var active = document.activeElement && document.activeElement.id;
  $('view').innerHTML = html;
  var q = $('q');
  if (q) {
    q.addEventListener('input', function () { query = q.value; var pos = q.selectionStart; render(); var n = $('q'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} } });
    if (active === 'q') { q.focus(); }
  }
  var sn = $('sName');
  if (sn) sn.addEventListener('change', function () { put('settings/name', sn.value.trim()); toast('Nombre guardado'); });
}

var tt;
function toast(msg) { var t = $('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('on'); }, 2600); }
function openSheet(id, focusId) { $(id).classList.add('on'); setTimeout(function () { var f = $(focusId); if (f && window.innerWidth > 760) f.focus(); }, 60); }
function closeSheet(id) { $(id).classList.remove('on'); }
function iconGrid(sel) { return ICON_KEYS.map(function (k) { return '<button type="button" data-pick-icon="' + k + '" aria-label="Ícono ' + k + '" aria-pressed="' + (k === sel) + '">' + svg(k, 20) + '</button>'; }).join(''); }
function colorRow(sel) { return Object.keys(COLORS).map(function (k) { return '<button type="button" class="swatch" data-pick-color="' + k + '" aria-label="Color ' + k + '" aria-pressed="' + (k === sel) + '" style="background:' + COLORS[k].dot + '"></button>'; }).join(''); }

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
  $('catGrid').innerHTML = S.cats.map(function (c) { return '<button type="button" class="catbtn" data-cat="' + esc(c.id) + '" aria-pressed="' + (c.id === F.cat) + '">' + tile(c.icon, c.color, 28, 9) + '<span>' + esc(c.name) + '</span></button>'; }).join('') + '<button type="button" class="catbtn new" data-open-cat="fromtx">' + svg(P.plus, 16, 2) + '<span>Nueva</span></button>';
  var fromList = F.type === 'gasto' ? S.accounts : S.accounts.filter(function (a) { return !isCredit(a); });
  if (!fromList.some(function (a) { return a.id === F.acc; })) F.acc = fromList.length ? fromList[0].id : null;
  $('accChips').innerHTML = fromList.map(function (a) { return '<button type="button" class="chip" data-acc="' + esc(a.id) + '" aria-pressed="' + (a.id === F.acc) + '">' + svg(accIcon(a), 14, 2) + esc(a.name) + '</button>'; }).join('') + '<button type="button" class="chip" data-open-acc>' + svg(P.plus, 14, 2) + 'Cuenta</button>';
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
  F = { editId: e ? e.id : null, billId: o.billId || null,
        type: e ? (e.cat === 'transfer' ? 'transfer' : e.amount > 0 ? 'ingreso' : 'gasto') : (o.type || 'gasto'),
        cat: e && e.cat !== 'transfer' && e.cat !== 'ingreso' ? e.cat : (o.cat || (S.cats[0] && S.cats[0].id)),
        acc: e ? e.acc : (o.from || (lastAcc && lastAcc.id)), to: e && e.to ? e.to : (o.to || null), created: e ? e.created : null };
  $('fAmount').value = e ? Math.abs(e.amount).toFixed(2) : (o.amount ? o.amount.toFixed(2) : '');
  $('fDesc').value = e ? e.desc : (o.desc || '');
  $('fDate').value = e ? e.date : todayISO();
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
  if (F.billId) upd['bills/' + F.billId + '/paid/' + date.slice(0, 7)] = true;
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
  $('accIcons').innerHTML = iconGrid(A.icon);
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
  A = {editId: a ? a.id : null, type: a ? a.type : 'banco', icon: a ? accIcon(a) : 'bank', color: a ? a.color : 'azul', iconTouched: !!a, order: a ? a.order : nextOrder(S.accounts), fromTx: $('txScrim').classList.contains('on')};
  $('aName').value = a ? a.name : '';
  $('aBal').value = a && !isCredit(a) ? bal.toFixed(2) : '';
  $('aLimit').value = a && isCredit(a) ? (a.limit || 0).toFixed(2) : '';
  $('aDebt').value = a && isCredit(a) ? Math.max(-bal, 0).toFixed(2) : '';
  $('aClose').value = a && isCredit(a) ? a.closeDay : '';
  $('aPay').value = a && isCredit(a) ? a.payDay : '';
  $('aErr').textContent = '';
  paintAcc(); openSheet('accScrim', 'aName');
}
$('accForm').addEventListener('submit', function (e) {
  e.preventDefault();
  var err = $('aErr'), name = $('aName').value.trim();
  if (!name) { err.textContent = 'Ponle un nombre a la cuenta.'; $('aName').focus(); return; }
  if (S.accounts.some(function (a) { return a.id !== A.editId && a.name.toLowerCase() === name.toLowerCase(); })) { err.textContent = 'Ya tienes una cuenta con ese nombre.'; return; }
  var id = A.editId || newId(), mv = A.editId ? movementEffect(id) : 0;
  var a = {name:name, type:A.type, color:A.color, icon:A.icon, order:A.order};
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
    else if (!wasEdit && current() !== 'billetera') location.hash = 'billetera';
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
  $('catIcons').innerHTML = iconGrid(K.icon);
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
  $('goalIcons').innerHTML = iconGrid(G.icon);
  $('goalColors').innerHTML = colorRow(G.color);
  $('goalPreview').innerHTML = tile(G.icon, G.color, 44, 14) + '<div style="display:flex;flex-direction:column"><b>' + esc($('gName').value.trim() || 'Laptop nueva') + '</b><span class="sub" style="font-size:12px">Meta de ahorro</span></div>';
  $('goalTitle').textContent = G.editId ? 'Editar meta' : 'Nueva meta';
  $('goalSave').textContent = G.editId ? 'Guardar cambios' : 'Crear meta';
  $('goalDelete').style.display = G.editId ? '' : 'none';
  $('gAddWrap').style.display = G.editId ? '' : 'none';
}
function openGoal(editId) {
  var g = editId ? S.goals.filter(function (x) { return x.id === editId; })[0] : null;
  G = {editId: g ? g.id : null, icon: g ? (g.icon || 'star') : 'plane', color: g ? (g.color || 'verde') : 'turquesa', order: g ? g.order : nextOrder(S.goals)};
  $('gName').value = g ? g.name : ''; $('gTarget').value = g ? g.target.toFixed(2) : ''; $('gSaved').value = g ? (g.saved || 0).toFixed(2) : ''; $('gAdd').value = '';
  $('gErr').textContent = '';
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
  closeSheet('goalScrim');
  put('goals/' + id, {name:name, target:target, saved:round2(Math.max(saved + add, 0)), icon:G.icon, color:G.color, order:G.order});
  toast(add ? 'Aporte de ' + money(add) + ' sumado' : wasEdit ? 'Meta actualizada' : 'Meta creada: ' + name);
});
$('goalDelete').addEventListener('click', function () { closeSheet('goalScrim'); del('goals/' + G.editId); toast('Meta eliminada'); });

/* ------------------------------------------------------------------ */
/* Formulario: pago fijo                                               */
/* ------------------------------------------------------------------ */
var B = {};
function paintBill() {
  if (!S.cats.some(function (c) { return c.id === B.cat; })) B.cat = S.cats[0] && S.cats[0].id;
  if (!S.accounts.some(function (a) { return a.id === B.acc; })) B.acc = S.accounts[0] && S.accounts[0].id;
  $('bCats').innerHTML = S.cats.map(function (c) { return '<button type="button" class="chip" data-bcat="' + esc(c.id) + '" aria-pressed="' + (c.id === B.cat) + '"><i style="width:8px;height:8px;border-radius:4px;background:' + C(c.color).dot + '"></i>' + esc(c.name) + '</button>'; }).join('');
  $('bAccs').innerHTML = S.accounts.map(function (a) { return '<button type="button" class="chip" data-bacc="' + esc(a.id) + '" aria-pressed="' + (a.id === B.acc) + '">' + svg(accIcon(a), 14, 2) + esc(a.name) + '</button>'; }).join('');
  $('billTitle').textContent = B.editId ? 'Editar pago fijo' : 'Nuevo pago fijo';
  $('billSave').textContent = B.editId ? 'Guardar cambios' : 'Crear pago fijo';
  $('billDelete').style.display = B.editId ? '' : 'none';
}
function openBill(editId) {
  var b = editId ? S.bills.filter(function (x) { return x.id === editId; })[0] : null;
  var vivienda = S.cats.filter(function (c) { return c.name.toLowerCase() === 'vivienda'; })[0];
  B = {editId: b ? b.id : null, cat: b ? b.cat : (vivienda && vivienda.id), acc: b ? b.acc : (S.accounts[0] && S.accounts[0].id), paid: b ? (b.paid || null) : null, order: b ? b.order : nextOrder(S.bills)};
  $('bName').value = b ? b.name : ''; $('bAmount').value = b ? b.amount.toFixed(2) : ''; $('bDay').value = b ? b.day : '';
  $('bErr').textContent = '';
  paintBill(); openSheet('billScrim', 'bName');
}
$('billForm').addEventListener('submit', function (e) {
  e.preventDefault();
  var err = $('bErr'), name = $('bName').value.trim(), amount = num($('bAmount').value), day = parseInt($('bDay').value, 10);
  if (!name) { err.textContent = 'Ponle un nombre al pago.'; $('bName').focus(); return; }
  if (!isFinite(amount) || amount <= 0) { err.textContent = 'Escribe el monto del pago.'; $('bAmount').focus(); return; }
  if (!(day >= 1 && day <= 31)) { err.textContent = 'El día debe ser entre 1 y 31.'; $('bDay').focus(); return; }
  if (!B.cat || !B.acc) { err.textContent = 'Necesitas al menos una categoría y una cuenta.'; return; }
  var id = B.editId || newId(), wasEdit = !!B.editId;
  var obj = {name:name, amount:amount, day:day, cat:B.cat, acc:B.acc, order:B.order}; if (B.paid) obj.paid = B.paid;
  closeSheet('billScrim'); put('bills/' + id, obj);
  toast(wasEdit ? 'Pago fijo actualizado' : 'Pago fijo creado: ' + name);
});
$('billDelete').addEventListener('click', function () { closeSheet('billScrim'); del('bills/' + B.editId); toast('Pago fijo eliminado'); });

/* ------------------------------------------------------------------ */
/* Clics                                                               */
/* ------------------------------------------------------------------ */
document.addEventListener('click', function (e) {
  var t = e.target.closest('button, a'); if (!t) return;
  var d = t.dataset;
  if (t.hasAttribute('data-open-add')) { if (!S.accounts.length) { toast('Primero crea una cuenta'); openAcc(); return; } openTx(); return; }
  if (d.close) { closeSheet(d.close); return; }
  if (t.hasAttribute('data-open-acc')) { openAcc(); return; }
  if (t.hasAttribute('data-open-cat')) { openCat(null, d.openCat === 'fromtx'); return; }
  if (t.hasAttribute('data-open-goal')) { openGoal(); return; }
  if (t.hasAttribute('data-open-bill')) { if (!S.accounts.length) { toast('Primero crea una cuenta'); return; } openBill(); return; }
  if (d.editTx) { var it = S.tx.filter(function (x) { return x.id === d.editTx; })[0]; if (it) openTx({edit:it}); return; }
  if (d.editAcc) { openAcc(d.editAcc); return; }
  if (d.editCat) { openCat(d.editCat); return; }
  if (d.editGoal) { openGoal(d.editGoal); return; }
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
  if (d.currency) { put('settings/currency', d.currency); toast('Moneda: ' + d.currency); return; }
  if (d.pay) {
    var card = acc(d.pay), debt = Math.max(-balances()[card.id], 0);
    var src = S.accounts.filter(function (a) { return !isCredit(a); });
    if (!src.length) { toast('Necesitas una cuenta (no tarjeta) para pagar'); return; }
    openTx({type:'transfer', from:src[0].id, to:card.id, amount:debt, desc:'Pago ' + card.name}); return;
  }
  if (d.paybill) {
    var b = S.bills.filter(function (x) { return x.id === d.paybill; })[0]; if (!b) return;
    openTx({type:'gasto', cat:b.cat, from:b.acc, amount:b.amount, desc:b.name, billId:b.id}); return;
  }
  if (t.hasAttribute('data-install') || t.id === 'installLogin') { if (installEvt) { installEvt.prompt(); installEvt.userChoice.then(function () { installEvt = null; $('installLogin').hidden = true; render(); }); } return; }
  if (t.hasAttribute('data-logout')) { auth.signOut(); location.hash = ''; return; }
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
['gTarget', 'gSaved', 'gAdd'].forEach(function (id) { $(id).addEventListener('input', function () { $('gErr').textContent = ''; }); });
['bName', 'bAmount', 'bDay'].forEach(function (id) { $(id).addEventListener('input', function () { $('bErr').textContent = ''; }); });

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
