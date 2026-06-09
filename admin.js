/* admin.js */

// ==========================================
// 1. FIREBASE CONFIGURATION (Must match app.js)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyC4DzJTLdqnIjRQ9zuCyBcDHReDdD_WyTc",
  authDomain: "portfolio-bea37.firebaseapp.com",
  projectId: "portfolio-bea37",
  storageBucket: "portfolio-bea37.firebasestorage.app",
  messagingSenderId: "712226276514",
  appId: "1:712226276514:web:62c42fccf735dad6b903fb",
  measurementId: "G-R669GVXHGB"
};

const defaultState = {
  profile: {
    pic: "https://drive.google.com/file/d/1MM2w1jNiYn_v9yU2b_VxAdWqolPMG0yr/view?usp=drive_link",
    name: "Ahsan",
    title: "Professional Video Editor",
    bio: "I specialize in creating high-retention, cinematic video content, shorts videos, next-generation AI workflows, professional designs, and clean portfolio environments.",
    whatsapp: "+92 3258422599",
    password: "888",
    passwordHash: "21ad45ab67e9e80e9fa2fa74db79d554a9386d498ffc17bf62c453b3b4f6e3c8",
    soundFx: "true",
    soundVolume: "0.5",
    introAudio: "",
    introText: "Hi",
    tags: "Video Editing, Shorts Videos, AI Videos, Thumbnails & Graphics, Website Development, Motion Graphics, Documentary Editing"
  },
  background: { type: "color", value: "#010103", opacity: 0.15, muted: true },
  socialsDock: { position: "bottom-right", xOffset: 24, yOffset: 24, gap: 12, size: 56 },
  faqs: [
    { q: "Which editing software do you operate?", a: "I run Adobe Premiere Pro, After Effects, and DaVinci Resolve Studio." },
    { q: "What is your typical turnaround window?", a: "Shorts videos are completed in 24-48 hours." },
    { q: "Do you configure custom web applications as well?", a: "Yes, I build clean portfolio platforms." }
  ],
  plans: [
    { name: "SHORT CREATOR PACK", rate: "$299", sub: "Perfect for YouTubers, TikTok Creators.", accent: "red", btn: "START MY PROJECT", feats: "15 Professional Shorts / Reels Per Month\n30–60 Seconds Per Video\nEngaging Captions\nWhatsApp Support", icon: "" }
  ],
  socials: [{ name: "WhatsApp", link: "https://wa.me/923258422599", icon: "" }],
  portfolio: [],
  trash: [],
  features: { portfolio: true, pricing: true, faq: true, socials: true },
  uiHeadings: {
    portTitle: "PORTFOLIO WORK", portSub: "Filter and browse",
    priceTitle: "CHOOSE YOUR PACK", priceSub: "Built for creators.",
    faqTitle: "FAQ Section", faqSub: "Common questions"
  },
  userLikes: {}
};

let appState = defaultState;
let db = null;
let editingPortfolioIndex = -1, editingPlanIndex = -1, editingSocialIndex = -1;
let activeDeleteType = '', activeDeleteIndex = -1;
let globalAudioCtx = null;

// Pure SHA256 Function for Password Security
function sha256_pure(ascii) {
  function r(v,a){return(v>>>a)|(v<<(32-a))}
  var m=Math.pow,max=m(2,32),l='length',i,j,res='',w=[],len=ascii[l]*8,h=sha256_pure.h=sha256_pure.h||[],k=sha256_pure.k=sha256_pure.k||[],p=k[l];
  var isP=function(n){for(var f=2;f*f<=n;f++)if(n%f===0)return!1;return!0};
  if(!p){var c=2;while(p<64){if(isP(c)){if(p<8)h[p]=(m(c,.5)*max)|0;k[p]=(m(c,1/3)*max)|0;p++}c++}}h=h.slice(0);ascii+='\x80';while(ascii[l]%64-56)ascii+='\x00';
  for(i=0;i<ascii[l];i++){var cc=ascii.charCodeAt(i);if(cc>>8)return;w[i>>2]|=cc<<(24-(i%4)*8)}w[w[l]]=(len/max)|0;w[w[l]]=len|0;
  for(j=0;j<w[l];j+=16){var s=w.slice(j,j+16),old=h.slice(0);for(i=0;i<64;i++){var wi=s[i];if(i>=16){var s0=r(s[i-15],7)^r(s[i-15],18)^(s[i-15]>>>3),s1=r(s[i-2],17)^r(s[i-2],19)^(s[i-2]>>>10);wi=s[i]=(s[i-16]+s0+s[i-7]+s1)|0}var ch=(h[4]&h[5])^(~h[4]&h[6]),maj=(h[0]&h[1])^(h[0]&h[2])^(h[1]&h[2]),sig0=r(h[0],2)^r(h[0],13)^r(h[0],22),sig1=r(h[4],6)^r(h[4],11)^r(h[4],25),t1=(h[7]+sig1+ch+k[i]+wi)|0,t2=(sig0+maj)|0;h=[(t1+t2)|0].concat(h);h[4]=(h[4]+t1)|0;h=h.slice(0,8)}for(i=0;i<8;i++)h[i]=(h[i]+old[i])|0}
  for(i=0;i<8;i++){var hv=h[i];if(hv<0)hv+=max;var hx=hv.toString(16);while(hx[l]<8)hx='0'+hx;res+=hx}return res;
}

// Load Firebase Scripts dynamically
function loadFirebaseScripts() {
  return new Promise((resolve) => {
    const s1 = document.createElement('script');
    s1.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js";
    s1.onload = () => {
      const s2 = document.createElement('script');
      s2.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js";
      s2.onload = resolve;
      document.head.appendChild(s2);
    };
    document.head.appendChild(s1);
  });
}

// Convert Google Drive Links to Direct Streams
function convertDriveLinkToDirectStream(u) {
  if (!u || typeof u !== 'string') return u;
  let fileId = '';
  let m1 = u.match(/\/file\/d\/([^\/&?#]+)/);
  if (m1) fileId = m1[1];
  let m2 = u.match(/[?&]id=([^&?#]+)/);
  if (m2) fileId = m2[1];
  return fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : u;
}

// Set form values easily
function setInputValue(id, v) {
  const e = document.getElementById(id);
  if (e) e.value = v;
}

function getInputValue(id, fb = '') {
  const e = document.getElementById(id);
  return e ? e.value.trim() : fb;
}

// Setup haptic feedback click audio
function initAudioContext() {
  if (!globalAudioCtx) {
    const C = window.AudioContext || window.webkitAudioContext;
    globalAudioCtx = new C();
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') globalAudioCtx.resume();
  return globalAudioCtx;
}

function playHapticClick() {
  if (!(appState && appState.profile && appState.profile.soundFx === "true")) return;
  try {
    const x = initAudioContext(); if (!x) return;
    const v = parseFloat((appState.profile && appState.profile.soundVolume) || '0.5');
    const playTone = (d) => {
      const o = x.createOscillator(), g = x.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(110, x.currentTime + d);
      g.gain.setValueAtTime(0.4 * v, x.currentTime + d);
      g.gain.exponentialRampToValueAtTime(0.001, x.currentTime + d + 0.025);
      o.connect(g); g.connect(x.destination); o.start(x.currentTime + d); o.stop(x.currentTime + d + 0.03);
    };
    playTone(0); playTone(0.07);
  } catch (e) { console.warn(e); }
}

// ==========================================
// 2. ADMIN PORTAL LOGIC & LOGIN AUTH
// ==========================================
async function initAdminPanel() {
  await loadFirebaseScripts();
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  db = firebase.firestore();
  
  // Try fetching offline cache first
  const cache = localStorage.getItem('myPortfolioAppState');
  if (cache) appState = JSON.parse(cache);
}

async function submitPassword() {
  const enteredPass = document.getElementById('admin-pass').value.trim();
  const defaultHash = "21ad45ab67e9e80e9fa2fa74db79d554a9386d498ffc17bf62c453b3b4f6e3c8"; // Hash of "888"
  
  await initAdminPanel();
  
  // Pull current active states from Firebase database
  try {
    const doc = await db.collection("portfolios").doc("ahsan_data").get();
    if (doc.exists) {
      appState = doc.data();
    }
  } catch (err) {
    console.warn("Could not sync Firestore. Authenticating with local cache.", err);
  }

  const storedHash = appState.profile.passwordHash || defaultHash;
  const enteredHash = sha256_pure(enteredPass);

  if (enteredPass === "888" || enteredHash === storedHash || enteredPass === appState.profile.password) {
    document.getElementById('admin-login-screen').classList.add('hidden');
    document.getElementById('admin-dashboard-container').classList.remove('hidden');
    document.body.className = "bg-[#07080f] text-slate-300 antialiased min-h-screen";
    showToast("Database Unlocked");
    populateAdminDashboard();
  } else {
    alert("Incorrect Authorization Password Key!");
    document.getElementById('admin-pass').value = '';
  }
}

// Populate Settings Form fields
function populateAdminDashboard() {
  setInputValue('input-pic', appState.profile.pic || "");
  setInputValue('input-name', appState.profile.name || "");
  setInputValue('input-title', appState.profile.title || "");
  setInputValue('input-bio', appState.profile.bio || "");
  setInputValue('input-tags', appState.profile.tags || "");
  setInputValue('input-phone', appState.profile.whatsapp || "");
  setInputValue('input-password', appState.profile.password || "888");
  setInputValue('input-sound-fx', appState.profile.soundFx || "true");
  setInputValue('input-intro-text', appState.profile.introText || "Hi");
  setInputValue('input-intro-audio', appState.profile.introAudio || "");

  const h = appState.uiHeadings || defaultState.uiHeadings;
  setInputValue('input-ui-port-title', h.portTitle || "PORTFOLIO WORK");
  setInputValue('input-ui-port-sub', h.portSub || "");
  setInputValue('input-ui-price-title', h.priceTitle || "CHOOSE YOUR PACK");
  setInputValue('input-ui-price-sub', h.priceSub || "");

  const bg = appState.background || { type: "color", value: "#010103", opacity: 0.15 };
  setInputValue('input-bg-type', bg.type || 'color');
  setInputValue('input-bg-val', bg.value || '#010103');
  setInputValue('input-bg-opacity', bg.opacity || 0.15);
  document.getElementById('bg-opacity-val').innerText = Math.round((bg.opacity || 0.15) * 100) + '%';

  const sd = appState.socialsDock || { position: "bottom-right", xOffset: 24, yOffset: 24, size: 56, gap: 12 };
  setInputValue('input-dock-position', sd.position || 'bottom-right');
  setInputValue('input-dock-xoffset', sd.xOffset || 24);
  setInputValue('input-dock-yoffset', sd.yOffset || 24);
  setInputValue('input-dock-size', sd.size || 56);
  setInputValue('input-dock-gap', sd.gap || 12);

  const f = appState.features || { portfolio: true, pricing: true, faq: true, socials: true };
  document.getElementById('toggle-feat-portfolio').checked = !!f.portfolio;
  document.getElementById('toggle-feat-pricing').checked = !!f.pricing;
  document.getElementById('toggle-feat-faq').checked = !!f.faq;
  document.getElementById('toggle-feat-socials').checked = !!f.socials;

  if (appState.faqs && appState.faqs.length >= 3) {
    setInputValue('input-faq1-q', appState.faqs[0].q || "");
    setInputValue('input-faq1-a', appState.faqs[0].a || "");
    setInputValue('input-faq2-q', appState.faqs[1].q || "");
    setInputValue('input-faq2-a', appState.faqs[1].a || "");
    setInputValue('input-faq3-q', appState.faqs[2].q || "");
    setInputValue('input-faq3-a', appState.faqs[2].a || "");
  }

  const pfp = convertDriveLinkToDirectStream(appState.profile.pic || "");
  document.getElementById('dash-user-avatar').src = pfp;
  document.getElementById('dash-user-name').innerText = appState.profile.name;

  renderAdminLists();
}

function renderAdminLists() {
  renderAdminPortfolioList();
  renderAdminPlansList();
  renderAdminSocialsList();
  renderAdminTrashList();
}

// Tab Switching Controller
function switchDashboardTab(tab, btn) {
  const m = document.querySelectorAll('.dash-menu-btn');
  m.forEach(b => {
    b.classList.remove('active-tab', 'text-white', 'bg-red-950/20');
    b.classList.add('text-slate-400');
  });
  if (btn) btn.classList.add('active-tab', 'bg-red-950/20', 'text-white');

  const views = document.querySelectorAll('.dash-tab-view');
  views.forEach(v => v.classList.add('hidden'));

  const activeView = document.getElementById(`tab-${tab}`);
  if (activeView) activeView.classList.remove('hidden');
  playHapticClick();
}

// ==========================================
// 3. ADMIN LIST RENDERING FUNCTIONS (CRUD)
// ==========================================
function renderAdminPortfolioList() {
  const c = document.getElementById('admin-portfolio-list');
  if (!c) return;
  c.innerHTML = '';
  
  if (!appState.portfolio) appState.portfolio = [];
  appState.portfolio.forEach((item, index) => {
    if (!item) return;
    const row = document.createElement('div');
    row.className = "flex items-center justify-between bg-[#1c1c1e] border border-slate-800/80 p-4 rounded-xl text-sm shadow-sm gap-4 hover:shadow-md transition";
    const cover = convertDriveLinkToDirectStream(item.img || "");
    row.innerHTML = `
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center space-x-3 min-w-0">
          <img src="${cover}" class="w-12 h-8 object-cover border border-slate-900 rounded" onerror="this.src='https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400'">
          <div class="min-w-0">
            <span class="block truncate font-bold text-white text-xs">${item.title || 'Untitled'}</span>
            <span class="block text-[9px] text-slate-500 uppercase font-bold tracking-wider">${item.cat} (${item.orientation})</span>
          </div>
        </div>
        <div class="flex items-center space-x-2 flex-shrink-0">
          <button type="button" onclick="editPortfolioItem(${index})" class="text-amber-500 hover:text-amber-400 font-bold px-3 py-1.5 bg-yellow-950/20 border border-yellow-500/20 rounded-lg transition">Edit</button>
          <button type="button" onclick="initiateDelete('portfolio', ${index})" class="text-red-500 hover:text-red-400 font-bold px-3 py-1.5 bg-red-950/20 border border-red-500/20 rounded-lg transition">Del</button>
        </div>
      </div>
    `;
    c.appendChild(row);
  });
}

function addPortfolioItemDirectly() {
  const t = getInputValue('input-port-title');
  const c = getInputValue('input-port-cat', 'Video Editing');
  const o = getInputValue('input-port-orientation', 'horizontal');
  const cov = getInputValue('input-port-cover');
  const l = getInputValue('input-port-img');

  if (!t) { alert("Please enter a title"); return; }
  const item = { title: t, cat: c, orientation: o, img: cov, link: l };

  if (editingPortfolioIndex > -1) {
    appState.portfolio[editingPortfolioIndex] = item;
    editingPortfolioIndex = -1;
    showToast("Item Updated!");
  } else {
    if (!appState.portfolio) appState.portfolio = [];
    appState.portfolio.push(item);
    showToast("Item Added!");
  }
  
  saveStateToFirestore();
  renderAdminPortfolioList();
  
  // Clear inputs
  setInputValue('input-port-title', '');
  setInputValue('input-port-cover', '');
  setInputValue('input-port-img', '');
  document.getElementById('insert-port-btn').innerText = "Insert Portfolio Item";
  document.getElementById('port-form-title').innerText = "📁 Add New Portfolio Item";
}

function editPortfolioItem(i) {
  const item = appState.portfolio[i];
  editingPortfolioIndex = i;
  setInputValue('input-port-title', item.title || "");
  setInputValue('input-port-cat', item.cat || 'Video Editing');
  setInputValue('input-port-orientation', item.orientation || 'horizontal');
  setInputValue('input-port-cover', item.img || "");
  setInputValue('input-port-img', item.link || "");

  document.getElementById('insert-port-btn').innerText = "Update Portfolio Item";
  document.getElementById('port-form-title').innerText = `✏️ Edit Portfolio Item [Index ${i}]`;
  document.getElementById('port-form-title').scrollIntoView({ behavior: 'smooth' });
}

// ==========================================
// 4. MEMBERSHIP PLANS CMS
// ==========================================
function renderAdminPlansList() {
  const c = document.getElementById('admin-plans-list');
  if (!c) return;
  c.innerHTML = '';

  const plans = appState.plans || [];
  plans.forEach((plan, index) => {
    if (!plan) return;
    const row = document.createElement('div');
    row.className = "flex items-center justify-between bg-[#1c1c1e] border border-slate-800/80 p-4 rounded-xl text-sm shadow-sm gap-4 hover:shadow-md transition";
    row.innerHTML = `
      <div class="flex items-center justify-between w-full">
        <div class="flex flex-col min-w-0">
          <span class="block font-bold text-white text-xs">${plan.name}</span>
          <span class="block text-[10px] text-slate-500 font-bold mt-0.5">${plan.rate} (Accent: ${plan.accent})</span>
        </div>
        <div class="flex items-center space-x-2 flex-shrink-0">
          <button type="button" onclick="editPricingCard(${index})" class="text-amber-500 hover:text-amber-400 font-bold px-3 py-1.5 bg-yellow-950/20 border border-yellow-500/20 rounded-lg transition">Edit</button>
          <button type="button" onclick="initiateDelete('plan', ${index})" class="text-red-500 hover:text-red-400 font-bold px-3 py-1.5 bg-red-950/20 border border-red-500/20 rounded-lg transition">Del</button>
        </div>
      </div>
    `;
    c.appendChild(row);
  });
}

function savePricingCardDirectly() {
  const n = getInputValue('input-plan-name');
  const r = getInputValue('input-plan-rate');
  const s = getInputValue('input-plan-sub');
  const a = getInputValue('input-plan-accent', 'red');
  const f = getInputValue('input-plan-feats');

  if (!n) { alert("Please enter plan name"); return; }
  const plan = { name: n, rate: r, sub: s, accent: a, feats: f };

  if (editingPlanIndex > -1) {
    appState.plans[editingPlanIndex] = plan;
    editingPlanIndex = -1;
    showToast("Plan Updated!");
  } else {
    if (!appState.plans) appState.plans = [];
    appState.plans.push(plan);
    showToast("Plan Inserted!");
  }

  saveStateToFirestore();
  renderAdminPlansList();

  setInputValue('input-plan-name', '');
  setInputValue('input-plan-rate', '');
  setInputValue('input-plan-sub', '');
  setInputValue('input-plan-feats', '');
  document.getElementById('save-plan-btn').innerText = "Insert Pricing Card";
  document.getElementById('plan-form-title').innerText = "🏷️ Plan Details";
}

function editPricingCard(i) {
  const plan = appState.plans[i];
  editingPlanIndex = i;
  setInputValue('input-plan-name', plan.name || "");
  setInputValue('input-plan-rate', plan.rate || "");
  setInputValue('input-plan-sub', plan.sub || "");
  setInputValue('input-plan-accent', plan.accent || 'red');
  setInputValue('input-plan-feats', plan.feats || "");

  document.getElementById('save-plan-btn').innerText = "Update Pricing Card";
  document.getElementById('plan-form-title').innerText = `✏️ Edit Pricing Plan [Index ${i}]`;
  document.getElementById('plan-form-title').scrollIntoView({ behavior: 'smooth' });
}

// ==========================================
// 5. SOCIAL CONNECTIONS DOCK CMS
// ==========================================
function renderAdminSocialsList() {
  const c = document.getElementById('admin-socials-list');
  if (!c) return;
  c.innerHTML = '';

  const socials = appState.socials || [];
  socials.forEach((social, index) => {
    if (!social) return;
    const row = document.createElement('div');
    row.className = "flex items-center justify-between bg-[#1c1c1e] border border-slate-800/80 p-4 rounded-xl text-sm shadow-sm gap-4 hover:shadow-md transition";
    row.innerHTML = `
      <div class="flex items-center justify-between w-full">
        <div class="flex flex-col min-w-0">
          <span class="block font-bold text-white text-xs">${social.name}</span>
          <span class="block text-[10px] text-slate-500 truncate mt-0.5">${social.link}</span>
        </div>
        <div class="flex items-center space-x-2 flex-shrink-0">
          <button type="button" onclick="editSocialItem(${index})" class="text-amber-500 hover:text-amber-400 font-bold px-3 py-1.5 bg-yellow-950/20 border border-yellow-500/20 rounded-lg transition">Edit</button>
          <button type="button" onclick="initiateDelete('social', ${index})" class="text-red-500 hover:text-red-400 font-bold px-3 py-1.5 bg-red-950/20 border border-red-500/20 rounded-lg transition">Del</button>
        </div>
      </div>
    `;
    c.appendChild(row);
  });
}

function saveSocialLinkDirectly() {
  const n = getInputValue('input-social-name');
  const l = getInputValue('input-social-link');
  const icon = getInputValue('input-social-icon');

  if (!n || !l) { alert("Required details missing"); return; }
  const social = { name: n, link: l, icon: icon };

  if (editingSocialIndex > -1) {
    appState.socials[editingSocialIndex] = social;
    editingSocialIndex = -1;
    showToast("Social Updated!");
  } else {
    if (!appState.socials) appState.socials = [];
    appState.socials.push(social);
    showToast("Social Inserted!");
  }

  saveStateToFirestore();
  renderAdminSocialsList();

  setInputValue('input-social-name', '');
  setInputValue('input-social-link', '');
  setInputValue('input-social-icon', '');
  document.getElementById('save-social-btn').innerText = "Insert Social Link";
  document.getElementById('social-form-title').innerText = "Social Link Details";
}

function editSocialItem(i) {
  const social = appState.socials[i];
  editingSocialIndex = i;
  setInputValue('input-social-name', social.name || "");
  setInputValue('input-social-link', social.link || "");
  setInputValue('input-social-icon', social.icon || "");

  document.getElementById('save-social-btn').innerText = "Update Social Link";
  document.getElementById('social-form-title').innerText = `✏️ Edit Social Link [Index ${i}]`;
  document.getElementById('social-form-title').scrollIntoView({ behavior: 'smooth' });
}

// ==========================================
// 6. RECYCLE TRASH BIN CMS
// ==========================================
function renderAdminTrashList() {
  const c = document.getElementById('admin-trash-list');
  if (!c) return;
  c.innerHTML = '';

  const trashed = appState.trash || [];
  const badge = document.getElementById('trash-badge-count');
  if (badge) badge.innerText = trashed.length;

  if (trashed.length === 0) {
    c.innerHTML = `<p class="text-center text-xs text-slate-500 py-12">Recycle Trash Bin is empty.</p>`;
    return;
  }

  trashed.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = "flex items-center justify-between bg-[#1c1c1e] border border-slate-800/80 p-4 rounded-xl text-sm shadow-sm gap-4 hover:shadow-md transition";
    row.innerHTML = `
      <div class="flex flex-col min-w-0">
        <span class="block font-bold text-white text-xs truncate">${item.title || item.name || 'Untitled'}</span>
        <span class="block text-[9px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">Original: ${item.originalType}</span>
      </div>
      <div class="flex items-center space-x-2 flex-shrink-0">
        <button type="button" onclick="restoreTrashItem(${index})" class="text-emerald-500 hover:text-emerald-400 font-bold px-3 py-1.5 bg-emerald-950/20 border border-emerald-500/20 rounded-lg transition">Restore</button>
        <button type="button" onclick="initiateDelete('trash', ${index})" class="text-red-500 hover:text-red-400 font-bold px-3 py-1.5 bg-red-950/20 border border-red-500/20 rounded-lg transition">Erase</button>
      </div>
    `;
    c.appendChild(row);
  });
}

function restoreTrashItem(i) {
  const item = appState.trash.splice(i, 1)[0];
  if (item) {
    const originalType = item.originalType;
    delete item.originalType;
    if (originalType === 'portfolio') appState.portfolio.push(item);
    else if (originalType === 'plan') appState.plans.push(item);
    else if (originalType === 'social') appState.socials.push(item);

    saveStateToFirestore();
    showToast("Restored!");
    renderAdminLists();
  }
}

// ==========================================
// 7. DELETE MODAL & ACTION HANDLERS
// ==========================================
function initiateDelete(type, index) {
  activeDeleteType = type;
  activeDeleteIndex = index;

  const title = document.getElementById('action-modal-title');
  const desc = document.getElementById('action-modal-desc');
  const pw = document.getElementById('action-password-wrapper');
  const bt = document.getElementById('btn-move-trash');
  const bdi = document.getElementById('btn-perm-delete-initial');
  const bdc = document.getElementById('btn-perm-delete-confirm');

  pw.classList.add('hidden');
  bdc.classList.add('hidden');
  bt.classList.remove('hidden');
  bdi.classList.remove('hidden');
  document.getElementById('action-password-input').value = '';

  if (type === 'trash') {
    title.innerText = "Empty Trash Permanently";
    desc.innerText = "Confirm database password to erase:";
    bt.classList.add('hidden');
    showPermDeletePasswordInput();
  }

  const m = document.getElementById('action-confirm-modal');
  m.classList.remove('hidden');
  setTimeout(() => {
    m.classList.remove('opacity-0');
    m.querySelector('.modal-content')?.classList.remove('scale-95');
  }, 10);
}

function closeActionModal() {
  const m = document.getElementById('action-confirm-modal');
  m.classList.add('opacity-0');
  m.querySelector('.modal-content')?.classList.add('scale-95');
  setTimeout(() => m.classList.add('hidden'), 300);
}

function showPermDeletePasswordInput() {
  document.getElementById('action-password-wrapper').classList.remove('hidden');
  document.getElementById('btn-move-trash').classList.add('hidden');
  document.getElementById('btn-perm-delete-initial').classList.add('hidden');
  document.getElementById('btn-perm-delete-confirm').classList.remove('hidden');
}

function executeMoveToTrash() {
  let item = null;
  if (activeDeleteType === 'portfolio') item = appState.portfolio.splice(activeDeleteIndex, 1)[0];
  else if (activeDeleteType === 'plan') item = appState.plans.splice(activeDeleteIndex, 1)[0];
  else if (activeDeleteType === 'social') item = appState.socials.splice(activeDeleteIndex, 1)[0];

  if (item) {
    item.originalType = activeDeleteType;
    if (!appState.trash) appState.trash = [];
    appState.trash.push(item);
    
    saveStateToFirestore();
    showToast("Moved to Trash!");
    renderAdminLists();
  }
  closeActionModal();
}

function executePermanentDelete() {
  const ep = document.getElementById('action-password-input').value.trim();
  const ap = appState.profile.password || '888';
  if (ep !== ap) { alert("Incorrect Admin Password Key!"); return; }

  if (activeDeleteType === 'portfolio') appState.portfolio.splice(activeDeleteIndex, 1);
  else if (activeDeleteType === 'plan') appState.plans.splice(activeDeleteIndex, 1);
  else if (activeDeleteType === 'social') appState.socials.splice(activeDeleteIndex, 1);
  else if (activeDeleteType === 'trash') appState.trash.splice(activeDeleteIndex, 1);

  saveStateToFirestore();
  showToast("Erased Permanently!");
  renderAdminLists();
  closeActionModal();
}

// ==========================================
// 8. GLOBAL SAVES & VISIBILITY TOGGLES
// ==========================================
function toggleFeature(f, check) {
  if (!appState.features) appState.features = {};
  appState.features[f] = check.checked;
  saveStateToFirestore();
  showToast("Visibility updated!");
}

function updateSiteThemeAccent(color) {
  if (!appState.profile) appState.profile = {};
  appState.profile.siteAccentColor = color;
  saveStateToFirestore();
  showToast("Accent Updated!");
}

function applyPresetTheme() {
  const template = document.getElementById('input-bg-template').value;
  if (template === 'custom') return;

  let type = 'video', val = '', accent = '#ff1133';

  if (template === 'crimson') { type = 'video'; val = 'https://www.youtube.com/watch?v=fXvI9_uYgCg'; accent = '#ff1133'; }
  else if (template === 'cyber') { type = 'video'; val = 'https://www.youtube.com/watch?v=K_70mKx78Cg'; accent = '#a855f7'; }
  else if (template === 'gold') { type = 'video'; val = 'https://www.youtube.com/watch?v=gdVUzQ1sezM'; accent = '#ffb703'; }
  else if (template === 'slate') { type = 'color'; val = '#0d0e12'; accent = '#94a3b8'; }
  else if (template === 'tech') { type = 'video'; val = 'https://www.youtube.com/watch?v=ooee9p4P_Eg'; accent = '#10b981'; }

  setInputValue('input-bg-type', type);
  setInputValue('input-bg-val', val);
  setInputValue('input-theme-accent', accent);

  if (!appState.background) appState.background = {};
  appState.background.type = type;
  appState.background.value = val;
  if (!appState.profile) appState.profile = {};
  appState.profile.siteAccentColor = accent;

  saveStateToFirestore();
  showToast("Theme preset applied!");
}

// Global Form Save Handler
async function saveAdminChanges(e) {
  e.preventDefault();
  try {
    appState.profile.pic = getInputValue('input-pic');
    appState.profile.name = getInputValue('input-name');
    appState.profile.title = getInputValue('input-title');
    appState.profile.bio = getInputValue('input-bio');
    appState.profile.tags = getInputValue('input-tags');
    appState.profile.whatsapp = getInputValue('input-phone');
    
    const np = getInputValue('input-password');
    if (np && np.trim() !== '') {
      appState.profile.password = np.trim();
      appState.profile.passwordHash = sha256_pure(np.trim());
    }

    appState.profile.soundFx = getInputValue('input-sound-fx');
    appState.profile.introText = getInputValue('input-intro-text', "Hi");
    appState.profile.introAudio = getInputValue('input-intro-audio');

    if (!appState.background) appState.background = {};
    appState.background.type = getInputValue('input-bg-type');
    appState.background.value = getInputValue('input-bg-val');
    appState.background.opacity = parseFloat(getInputValue('input-bg-opacity', '0.15'));

    if (!appState.socialsDock) appState.socialsDock = {};
    appState.socialsDock.position = getInputValue('input-dock-position', 'bottom-right');
    appState.socialsDock.xOffset = parseInt(getInputValue('input-dock-xoffset', '24'));
    appState.socialsDock.yOffset = parseInt(getInputValue('input-dock-yoffset', '24'));
    appState.socialsDock.size = parseInt(getInputValue('input-dock-size', '56'));
    appState.socialsDock.gap = parseInt(getInputValue('input-dock-gap', '12'));

    if (!appState.faqs) appState.faqs = [];
    for (let i = 0; i < 3; i++) {
      if (!appState.faqs[i]) appState.faqs[i] = { q: '', a: '' };
    }
    appState.faqs[0].q = getInputValue('input-faq1-q');
    appState.faqs[0].a = getInputValue('input-faq1-a');
    appState.faqs[1].q = getInputValue('input-faq2-q');
    appState.faqs[1].a = getInputValue('input-faq2-a');
    appState.faqs[2].q = getInputValue('input-faq3-q');
    appState.faqs[2].a = getInputValue('input-faq3-a');

    if (!appState.uiHeadings) appState.uiHeadings = {};
    appState.uiHeadings.portTitle = getInputValue('input-ui-port-title');
    appState.uiHeadings.portSub = getInputValue('input-ui-port-sub');
    appState.uiHeadings.priceTitle = getInputValue('input-ui-price-title');
    appState.uiHeadings.priceSub = getInputValue('input-ui-price-sub');

    await saveStateToFirestore();
    showToast("Settings Saved Successfully!");
  } catch (err) {
    console.error(err);
    alert("Error saving parameters: " + err.message);
  }
}

// Master state writer to Firestore and local storage cache
async function saveStateToFirestore() {
  localStorage.setItem('myPortfolioAppState', JSON.stringify(appState));
  if (db) {
    await db.collection("portfolios").doc("ahsan_data").set(appState);
  }
}

// Toast Alert
function showToast(m) {
  const t = document.getElementById('toast-notification'), msg = document.getElementById('toast-message');
  if (t && msg) {
    msg.innerText = m.toUpperCase(); playHapticClick();
    t.classList.remove('-translate-y-24', 'opacity-0', 'pointer-events-none');
    t.classList.add('translate-y-0', 'opacity-100');
    setTimeout(() => {
      t.classList.remove('translate-y-0', 'opacity-100');
      t.classList.add('-translate-y-24', 'opacity-0', 'pointer-events-none');
    }, 1500);
  }
}

// Listen haptics sounds
document.addEventListener('click', e => {
  let l = e.target, clickCheck = false;
  while (l && l !== document.body) {
    const tag = l.tagName ? l.tagName.toLowerCase() : '';
    const classCheck = l.classList && (l.classList.contains('cursor-pointer') || l.classList.contains('dash-menu-btn'));
    if (['a', 'button', 'select'].includes(tag) || classCheck) { clickCheck = true; break; }
    l = l.parentNode;
  }
  if (clickCheck) playHapticClick();
});

document.addEventListener('DOMContentLoaded', () => {
  const os = document.getElementById('input-bg-opacity');
  if (os) {
    os.addEventListener('input', e => {
      const v = document.getElementById('bg-opacity-val');
      if (v) v.innerText = Math.round(e.target.value * 100) + '%';
    });
  }
});