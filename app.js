/* app.js */

// ==========================================
// 1. FIREBASE CONFIGURATION
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyAhobdhuTu5ExYxkC-vHMzYBSzvj8516_w",
  authDomain: "my-portfolio-5cd5b.firebaseapp.com",
  projectId: "my-portfolio-5cd5b",
  storageBucket: "my-portfolio-5cd5b.firebasestorage.app",
  messagingSenderId: "969580314187",
  appId: "1:969580314187:web:2f1cf57deff9543b3697ce",
  measurementId: "G-BZH7F6P5EW"
};

// ==========================================
// 2. DEFAULT STATE (Agar database khali ho toh)
// ==========================================
const defaultState = {
  profile: {
    pic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    name: "Ahsan Jarwar",
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
    { q: "What is your typical turnaround window?", a: "Shorts videos are completed in 24-48 hours. Custom video plans inside 4-7 days." },
    { q: "Do you configure custom web applications as well?", a: "Yes, I build clean portfolio platforms, custom developer layouts, and high-conversion landing pages." }
  ],
  plans: [
    { name: "SHORT CREATOR PACK", rate: "$299", sub: "Perfect for YouTubers, TikTok Creators, Instagram Influencers.", accent: "red", btn: "START MY PROJECT", feats: "15 Professional Shorts / Reels Per Month\n30–60 Seconds Per Video\nEngaging Captions\nWhatsApp Support", icon: "" },
    { name: "LONG CREATOR PACK", rate: "$590", sub: "Perfect for creators who want consistent long-form content.", accent: "silver", btn: "SCALE MY CHANNEL", feats: "4 Long-Form Videos Per Month\n15–20 Minutes Per Video\nColor Grading\nPriority Support", icon: "" },
    { name: "CUSTOM STUDIO PACK", rate: "Custom Plan", sub: "Custom visual design architectures structured to adapt to your brand.", accent: "purple", btn: "DISCUSS YOUR PROJECT", feats: "Fully Customized Workload\nAI Video Production\nDedicated Project Consultation", icon: "" }
  ],
  socials: [{ name: "WhatsApp", link: "https://wa.me/923258422599", icon: "" }],
  portfolio: [
    { title: "Motion graphics", cat: "Shorts Videos", img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400", link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", orientation: "vertical" },
    { title: "Sample Google Drive Film", cat: "AI Videos", img: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=400", link: "https://drive.google.com/file/d/1gCccf86I3j1qZ_EaG8y9rJ_Zg7e4v9_A/view", orientation: "horizontal" }
  ],
  trash: [],
  features: { portfolio: true, pricing: true, faq: true, socials: true },
  uiHeadings: {
    portTitle: "PORTFOLIO WORK",
    portSub: "Filter and browse through my creative visual systems",
    priceTitle: "CHOOSE YOUR PACK",
    priceSub: "Powerful content. Professional quality. Built for creators.",
    faqTitle: "FAQ Section",
    faqSub: "Common questions regarding video production & software integration"
  },
  userLikes: {}
};

let appState = JSON.parse(localStorage.getItem('myPortfolioAppState')) || defaultState;
let globalAudioCtx = null, previewAudioObj = null, hoverTimeout = null, activeLightboxIndex = -1;

// ==========================================
// 3. DYNAMIC FIREBASE SCRIPTS INJECTION
// ==========================================
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

// ==========================================
// 4. FIREBASE SYNCHRONIZER
// ==========================================
async function initFirebaseSync() {
  await loadFirebaseScripts();
  
  // Initialize Firebase App
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.firestore();

  // Listen to Firestore document real-time updates
  db.collection("portfolios").doc("ahsan_data").onSnapshot((doc) => {
    if (doc.exists) {
      appState = doc.data();
      localStorage.setItem('myPortfolioAppState', JSON.stringify(appState));
      renderPage();
    } else {
      // Setup initial data in Firestore if empty
      db.collection("portfolios").doc("ahsan_data").set(defaultState);
    }
  }, (error) => {
    console.warn("Firebase not connected. Running offline cached mode.", error);
    renderPage();
  });
}

// ==========================================
// 5. RENDERING FUNCTIONS FOR FRONT-END
// ==========================================
function renderPage() {
  renderDynamicBackground();
  
  // Profile elements
  const d = convertDriveLinkToDirectStream(appState.profile.pic);
  const p = document.getElementById('profile-pic');
  if (p) {
    p.src = d;
    p.style.display = 'block';
  }
  const fb = document.getElementById('profile-fallback');
  if (fb) fb.classList.add('hidden');
  
  document.getElementById('profile-name').innerText = appState.profile.name;
  document.getElementById('profile-title').innerText = appState.profile.title || "Professional Video Editor";
  document.getElementById('profile-bio').innerText = appState.profile.bio;

  // Render Spec Tags
  const tagsCont = document.getElementById('profile-tags-container');
  if (tagsCont && appState.profile.tags) {
    tagsCont.innerHTML = '';
    const tagArr = appState.profile.tags.split(',');
    tagArr.forEach(t => {
      if (t.trim()) {
        tagsCont.innerHTML += `<span class="bg-white/[0.02] border border-white/5 px-2.5 py-1 rounded-md text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest">${t.trim()}</span>`;
      }
    });
  }

  // Headings
  const h = appState.uiHeadings || defaultState.uiHeadings;
  if (document.getElementById('ui-portfolio-header-title')) document.getElementById('ui-portfolio-header-title').innerText = h.portTitle || "PORTFOLIO WORK";
  if (document.getElementById('ui-portfolio-header-sub')) document.getElementById('ui-portfolio-header-sub').innerText = h.portSub || "";
  if (document.getElementById('ui-pricing-header-title')) document.getElementById('ui-pricing-header-title').innerText = h.priceTitle || "CHOOSE YOUR PACK";
  if (document.getElementById('ui-pricing-header-sub')) document.getElementById('ui-pricing-header-sub').innerText = h.priceSub || "";
  if (document.getElementById('ui-faq-header-title')) document.getElementById('ui-faq-header-title').innerText = h.faqTitle || "FAQ Section";
  if (document.getElementById('ui-faq-header-sub')) document.getElementById('ui-faq-header-sub').innerText = h.faqSub || "";

  // Feature Toggles Visibilities
  const f = appState.features || { portfolio: true, pricing: true, faq: true, socials: true };
  toggleSectionVisibility('portfolio', f.portfolio, 'nav-portfolio');
  toggleSectionVisibility('pricing', f.pricing, 'nav-pricing');
  toggleSectionVisibility('faq', f.faq, 'nav-faq');
  toggleSectionVisibility('socials-floating-dock', f.socials);

  renderFAQs();
  setupCategoriesTabs();
  renderPortfolioGrid('all');
  renderPricingPlans();
  renderFloatingSocials();
}

function toggleSectionVisibility(id, v, navId = null) {
  const e = document.getElementById(id);
  if (e) e.classList.toggle('hidden', !v);
  if (navId) {
    const ne = document.getElementById(navId);
    if (ne) ne.classList.toggle('hidden', !v);
  }
}

// Render FAQs Accordion
function renderFAQs() {
  const c = document.getElementById('faq-container');
  if (!c) return;
  c.innerHTML = '';
  appState.faqs.forEach((faq, index) => {
    if (!faq) return;
    const item = document.createElement('div');
    item.className = "card-3d bg-cardBg border border-white/5 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:border-white/10 active:scale-[0.98]";
    item.onclick = () => { toggleAccordion(index); };
    item.innerHTML = `
      <div class="flex justify-between items-center">
        <h4 class="text-xs font-bold uppercase tracking-wider text-gray-200">${faq.q || 'Question'}</h4>
        <span id="faq-icon-${index}" class="text-xs text-accentRed">➕</span>
      </div>
      <p id="faq-ans-${index}" class="text-gray-400 text-xs mt-3 leading-relaxed hidden transition-all duration-300">${faq.a || 'Answer'}</p>
    `;
    c.appendChild(item);
  });
}

function toggleAccordion(i) {
  const a = document.getElementById(`faq-ans-${i}`), o = document.getElementById(`faq-icon-${i}`);
  if (a && o) {
    const h = a.classList.contains('hidden');
    a.classList.toggle('hidden', !h);
    o.innerText = h ? "➖" : "➕";
  }
}

// Setup Portfolio Filter Tabs
function setupCategoriesTabs() {
  const cont = document.getElementById('portfolio-categories-tabs');
  if (!cont) return;
  cont.innerHTML = `<button onclick="filterPortfolio('all')" class="port-tab active-tab bg-accentRed text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition hover:scale-105 active:scale-95">All</button>`;
  const cats = [];
  appState.portfolio.forEach(item => {
    if (item && item.cat && !cats.includes(item.cat)) {
      cats.push(item.cat);
      cont.innerHTML += `<button onclick="filterPortfolio('${item.cat}')" class="port-tab bg-white/[0.03] border border-white/10 text-gray-400 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition hover:text-white hover:scale-105 active:scale-95">${item.cat}</button>`;
    }
  });
}

// Filter portfolio
function filterPortfolio(cat) {
  const tabs = document.querySelectorAll('.port-tab');
  tabs.forEach(t => {
    t.classList.remove('active-tab', 'bg-accentRed', 'text-white');
    t.classList.add('bg-white/[0.03]', 'border-white/10', 'text-gray-400');
  });
  const active = Array.from(tabs).find(t => t.innerText.toLowerCase().includes(cat.toLowerCase()) || (cat === 'all' && t.innerText === 'All'));
  if (active) {
    active.classList.remove('bg-white/[0.03]', 'border-white/10', 'text-gray-400');
    active.classList.add('active-tab', 'bg-accentRed', 'text-white');
  }
  renderPortfolioGrid(cat);
}

// Render Portfolio Grid
function renderPortfolioGrid(fc) {
  const g = document.getElementById('portfolio-grid');
  if (!g) return;
  g.innerHTML = '';
  const items = fc === 'all' ? appState.portfolio : appState.portfolio.filter(item => item.cat === fc);
  
  if (items.length === 0) {
    g.innerHTML = `<p class="col-span-3 text-center text-xs text-gray-500 py-12">No portfolio elements found under this category.</p>`;
    return;
  }
  
  items.forEach((item, index) => {
    if (!item) return;
    const card = document.createElement('div'), isV = item.orientation === 'vertical';
    card.className = `card-3d portfolio-card-item group relative bg-cardBg rounded-2xl overflow-hidden border border-white/5 shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer active:scale-[0.98] ${isV ? 'aspect-[9/16]' : 'aspect-video'} w-full`;
    card.onclick = () => { playMediaInLightbox(index); };
    
    let cov = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400";
    if (item.img && item.img.trim() !== "") {
      cov = convertDriveLinkToDirectStream(item.img);
    } else if (item.link) {
      const yt = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/, m = item.link.match(yt);
      if (m) cov = `https://img.youtube.com/vi/${m[1]}/maxresdefault.jpg`;
    }
    
    card.innerHTML = `
      <div class="w-full h-full overflow-hidden relative bg-black/40 flex items-center justify-center">
        <div class="absolute inset-0 hidden z-10 bg-black pointer-events-none portfolio-preview-container flex items-center justify-center overflow-hidden"></div>
        <img src="${cov}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="handlePortfolioThumbnailError(this, '${item.cat}')">
        <div class="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition">
          <div class="w-12 h-12 bg-accentRed/90 rounded-full flex items-center justify-center shadow-lg shadow-accentRed/40 group-hover:scale-110 transition duration-300">
            <svg class="w-5 h-5 text-white fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        <span class="absolute top-3 left-3 bg-[#010103]/90 text-[8px] font-bold text-accentRed tracking-widest px-2.5 py-1 rounded-full uppercase border border-white/5 z-20">${item.cat}</span>
      </div>
    `;
    g.appendChild(card);
  });
  setupHoverPreviews();
}

function setupHoverPreviews() {
  const cards = document.querySelectorAll('.portfolio-card-item');
  cards.forEach((card, index) => {
    card.addEventListener('mouseenter', () => {
      const item = appState.portfolio[index];
      if (!item) return;
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        const pc = card.querySelector('.portfolio-preview-container');
        if (pc) {
          pc.innerHTML = parseMediaHTMLMuted(item.link || item.img || '');
          pc.classList.remove('hidden');
        }
      }, 150);
    });
    card.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
      const pc = card.querySelector('.portfolio-preview-container');
      if (pc) {
        pc.innerHTML = '';
        pc.classList.add('hidden');
      }
    });
  });
}

// Render Pricing Cards
function renderPricingPlans() {
  const g = document.getElementById('pricing-grid');
  if (!g) return;
  g.innerHTML = '';
  
  const colorMaps = {
    red: { gc: "radial-glow-red", bc: "glow-red", btnC: "bg-gradient-to-r from-red-500 to-red-600 text-white", cc: "text-red-500", sc: "text-red-500", isC: "255,17,51", lc: "from-transparent to-red-500/50", scC: "shiny-plan-card shiny-plan-red" },
    silver: { gc: "radial-glow-silver", bc: "glow-silver", btnC: "bg-white text-black hover:bg-gray-100", cc: "text-white", sc: "text-white", isC: "255,255,255", lc: "from-transparent to-white/30", scC: "shiny-plan-card shiny-plan-silver" },
    purple: { gc: "radial-glow-purple", bc: "glow-purple", btnC: "bg-gradient-to-r from-purple-500 to-purple-600 text-white", cc: "text-[#a855f7]", sc: "text-[#a855f7]", isC: "168,85,247", lc: "from-transparent to-purple-500/50", scC: "shiny-plan-card shiny-plan-purple" }
  };
  
  appState.plans.forEach((plan) => {
    if (!plan) return;
    const map = colorMaps[plan.accent] || colorMaps.red;
    const card = document.createElement('div');
    card.className = `card-3d ${map.scC} group bg-cardBg rounded-[2rem] p-5 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 ${map.bc} relative overflow-hidden`;
    
    const lines = (plan.feats || "").split('\n');
    let featsHTML = '';
    lines.forEach(l => {
      if (l.trim() !== '') featsHTML += `<li class="flex items-center py-1.5"><span class="${map.cc} mr-2.5 text-xs">✔</span>${l.trim()}</li>`;
    });
    
    let icon = `<svg class="w-16 h-16 relative z-10" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="72" rx="24" fill="${plan.accent === 'silver' ? '#333' : '#cc0000'}"/><polygon points="42,34 66,46 42,58" fill="#ffffff"/></svg>`;
    if (plan.icon && plan.icon.trim() !== "") {
      const url = convertDriveLinkToDirectStream(plan.icon);
      icon = `<img src="${url}" class="w-16 h-16 object-contain relative z-10 filter drop-shadow-[0_8px_12px_rgba(${map.isC},0.5)]">`;
    }
    
    card.innerHTML = `
      <div>
        <div class="relative w-36 h-28 flex items-center justify-center mx-auto mb-4"><div class="absolute inset-0 ${map.gc} pointer-events-none rounded-full"></div>${icon}</div>
        <h3 class="text-base font-black uppercase tracking-widest text-center font-sans">${plan.name}</h3>
        <div class="flex items-center justify-center my-3.5">
          <div class="w-16 h-[1px] bg-gradient-to-r ${map.lc}"></div><span class="${map.sc} text-xs mx-3">★</span><div class="w-16 h-[1px] bg-gradient-to-l ${map.lc}"></div>
        </div>
        <p class="text-gray-400 text-[10px] text-center px-4 leading-relaxed min-h-[40px]">${plan.sub || ""}</p>
        <div class="w-2/3 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent mx-auto my-4"></div>
        <div class="text-center mt-2 pb-4"><span class="text-3xl font-extrabold text-white font-sans">${plan.rate}</span></div>
        <ul class="text-left mt-4 text-[10px] text-gray-300 divide-y divide-white/[0.04] border-b border-white/[0.04]">${featsHTML}</ul>
      </div>
      <button onclick="bookWhatsAppPlan('${plan.name}','${plan.rate}')" class="mt-6 w-full py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition shadow-md hover:scale-105 active:scale-95 duration-200 ${map.btnC} font-sans">${plan.btn || "START PROJECT"}</button>
    `;
    g.appendChild(card);
  });
}

// Render Floating Social Icons
function renderFloatingSocials() {
  const d = document.getElementById('socials-floating-dock');
  if (!d) return;
  d.innerHTML = '';
  
  const config = appState.socialsDock || { position: "bottom-right", xOffset: 24, yOffset: 24, size: 56, gap: 12 };
  d.className = "fixed z-40 flex flex-col items-center transition-all duration-300";
  d.style.top = 'auto'; d.style.bottom = 'auto'; d.style.left = 'auto'; d.style.right = 'auto'; d.style.gap = `${config.gap}px`;
  
  const [v, h] = config.position.split('-');
  d.style[v] = `${config.yOffset}px`;
  d.style[h] = `${config.xOffset}px`;
  
  appState.socials.forEach((social) => {
    if (!social) return;
    const link = social.link || '#', name = social.name || 'Social', icon = convertDriveLinkToDirectStream(social.icon) || "";
    const btn = document.createElement('a');
    btn.href = link; btn.target = "_blank"; btn.title = name;
    btn.style.width = `${config.size}px`; btn.style.height = `${config.size}px`;
    
    if (social.icon && social.icon.trim() !== '') {
      btn.className = "flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group relative z-40";
      btn.innerHTML = `<img src="${icon}" alt="${name}" class="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]">`;
    } else {
      if (name.toLowerCase().includes('whatsapp')) {
        btn.className = "flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95 group relative z-40 bg-[#25D366] p-3 shadow-[0_12px_30px_rgba(37,211,102,0.3)]";
        btn.innerHTML = `<svg class="w-full h-full text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.454L0 24zm6.59-4.846c1.6.95 3.167 1.455 4.717 1.456 5.422 0 9.833-4.389 9.836-9.777.001-2.61-1.011-5.064-2.851-6.907C16.49 2.083 14.045.079 11.454.079c-5.429 0-9.845 4.39-9.845 9.778-.001 1.957.514 3.869 1.492 5.568l-.973 3.553 3.64-.954zm12.355-6.046c-.332-.166-1.966-.968-2.271-1.079-.306-.112-.528-.166-.75.166-.222.333-.861 1.079-1.055 1.302-.194.222-.389.25-.721.083-.332-.167-1.402-.515-2.67-1.643-.988-.88-1.654-1.967-1.848-2.3-.194-.333-.021-.513.145-.679.15-.15.333-.388.5-.582.166-.194.222-.333.333-.555.111-.222.056-.416-.028-.583-.083-.167-.75-1.802-1.028-2.47-.27-.655-.544-.567-.75-.578l-.638-.012c-.222 0-.583.083-.889.416-.305.333-1.165 1.137-1.165 2.772s1.193 3.216 1.36 3.438c.166.222 2.348 3.57 5.688 5.006.794.341 1.415.545 1.9.702.799.253 1.526.218 2.101.132.64-.096 1.966-.803 2.243-1.579.278-.776.278-1.442.194-1.579-.083-.139-.305-.222-.638-.388z"/></svg>`;
      } else {
        btn.className = "flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95 group relative z-40 bg-white p-3 border border-white/10 shadow-lg shadow-black/40";
        btn.innerHTML = `<svg class="w-full h-full text-slate-800" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>`;
      }
    }
    d.appendChild(btn);
  });
}

// Render dynamic background configurations
function renderDynamicBackground() {
  const c = document.getElementById('dynamic-bg-container');
  if (!c) return;
  c.style.opacity = '0';
  
  setTimeout(() => {
    c.innerHTML = '';
    const bg = appState.background || { type: "color", value: "#010103", opacity: 0.15, muted: true };
    let val = (bg.value || "").trim();
    const o = bg.opacity || 0.15, m = bg.muted !== false, ma = m ? 'muted' : '';
    const idr = val.includes('drive.google.com');
    const isV = val.match(/\.(mp4|webm|ogg)/i) || val.includes('youtube.com') || val.includes('youtu.be') || val.includes('.mp4') || (idr && bg.type === 'video');
    
    if (bg.type === 'image' && !isV) {
      const s = convertDriveLinkToDirectStream(val);
      c.innerHTML = `<div class="absolute inset-0 bg-cover bg-center" style="background-image: linear-gradient(rgba(1,1,3,${1 - o}),rgba(1,1,3,${1 - o})),url('${s}');"></div>`;
    } else if (bg.type === 'video' || isV) {
      c.style.backgroundImage = 'none'; c.style.backgroundColor = '#010103';
      const y = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/, mY = val.match(y);
      
      if (mY) {
        c.innerHTML = `<div class="absolute inset-0 overflow-hidden w-full h-full"><iframe class="absolute top-[-60px] left-0 w-full h-[calc(100%+120px)] scale-110 pointer-events-none" style="opacity:${o};" src="https://www.youtube.com/embed/${mY[1]}?autoplay=1&mute=1&loop=1&playlist=${mY[1]}&controls=0&showinfo=0&rel=0&modestbranding=1" frameborder="0" allow="autoplay" allowfullscreen></iframe></div>`;
      } else if (idr) {
        let f = extractDriveFileId(val);
        if (f) {
          const ds = `https://docs.google.com/uc?export=download&id=${f}`;
          c.innerHTML = `<video class="w-full h-full object-cover pointer-events-none" style="opacity:${o};" autoplay loop ${ma} playsinline src="${ds}"></video>`;
        }
      } else {
        const vs = convertDriveLinkToDirectStream(val);
        c.innerHTML = `<video class="w-full h-full object-cover pointer-events-none" style="opacity:${o};" autoplay loop ${ma} playsinline src="${vs}"></video>`;
      }
    } else {
      c.style.backgroundImage = 'none';
      let s = `background-color:${val || '#010103'}`;
      if (val === '#010103' || val === '#000000') {
        s = `background:radial-gradient(circle at center,#110005 0,#010103 100%)`;
      }
      c.setAttribute('style', `position:fixed;inset:0;pointer-events:none;z-index:-50;${s};transition:all 1s ease-in-out;`);
    }
    if (bg.type !== 'color') c.style.opacity = '1';
  }, 300);
}

// ==========================================
// 6. HELPER FUNCTIONS & MEDIA PARSERS
// ==========================================
function extractDriveFileId(u) {
  if (!u || typeof u !== 'string') return '';
  u = u.trim();
  let m1 = u.match(/\/file\/d\/([^\/&?#]+)/); if (m1) return m1[1];
  let m2 = u.match(/[?&]id=([^&?#]+)/); if (m2) return m2[1];
  return '';
}

function convertDriveLinkToDirectStream(u) {
  let f = extractDriveFileId(u);
  return f ? `https://lh3.googleusercontent.com/d/${f}` : u;
}

// Fixed download link for audio files
function convertDriveAudioLink(u) {
  let f = extractDriveFileId(u);
  return f ? `https://docs.google.com/uc?export=download&id=${f}` : u;
}

function parseMediaHTML(u) {
  if (!u) return ''; u = u.trim();
  const yt = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/, mY = u.match(yt);
  if (mY) return `<iframe class="w-full h-full border-0" src="https://www.youtube.com/embed/${mY[1]}?autoplay=1&rel=0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  
  if (u.includes('drive.google.com')) {
    let f = extractDriveFileId(u);
    if (f) return `<iframe class="w-full h-full border-0" src="https://drive.google.com/file/d/${f}/preview" frameborder="0" allow="autoplay" allowfullscreen></iframe>`;
  }
  if (u.match(/\.(mp4|webm|ogg)/i)) return `<video id="lightbox-native-video" class="w-full h-full object-contain bg-black" autoplay controls playsinline loop src="${u}"></video>`;
  if (u.match(/\.(jpeg|jpg|gif|png|webp|svg)/i)) return `<img src="${u}" class="w-full h-full object-cover">`;
  return `<iframe class="w-full h-full border-0" src="${u}" frameborder="0" allowfullscreen></iframe>`;
}

function parseMediaHTMLMuted(u) {
  if (!u) return ''; u = u.trim();
  const yt = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/, mY = u.match(yt);
  if (mY) return `<iframe class="absolute inset-0 w-full h-full scale-110 pointer-events-none" src="https://www.youtube.com/embed/${mY[1]}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&loop=1&playlist=${mY[1]}" frameborder="0" allow="autoplay" allowfullscreen></iframe>`;
  if (u.match(/\.(mp4|webm|ogg)/i)) return `<video class="w-full h-full object-cover pointer-events-none" autoplay muted loop playsinline src="${u}"></video>`;
  return '';
}

// Haptic feedback & click audio handler
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

// Lightbox controller
function playMediaInLightbox(i) {
  activeLightboxIndex = i;
  const item = appState.portfolio[i]; if (!item) return;
  
  const m = document.getElementById('lightbox-modal'), c = document.getElementById('lightbox-content'), dl = document.getElementById('lightbox-direct-link'), t = document.getElementById('lightbox-video-title'), isV = item.orientation === 'vertical', cb = document.getElementById('lightbox-container-box');
  if (cb) cb.className = isV ? "relative bg-white border border-slate-200 rounded-2xl w-full max-w-[360px] aspect-[9/16] flex flex-col justify-between overflow-hidden shadow-2xl" : "relative bg-white border border-slate-200 rounded-2xl w-full max-w-4xl aspect-video flex flex-col justify-between overflow-hidden shadow-2xl";
  
  if (t) t.innerText = item.title || 'Untitled Video';
  if (c) c.innerHTML = parseMediaHTML(item.link || item.img || '');
  if (dl) dl.href = item.link || '#';
  updateLightboxLikeUI();
  
  if (m) { m.classList.remove('hidden'); m.classList.add('flex'); }
}

function closeLightbox() {
  const m = document.getElementById('lightbox-modal'), c = document.getElementById('lightbox-content');
  if (m) { m.classList.add('hidden'); m.classList.remove('flex'); }
  if (c) c.innerHTML = '';
}

function changeLightboxVideoSpeed(s) {
  const v = document.getElementById('lightbox-native-video');
  if (v) v.playbackRate = parseFloat(s);
}

function updateLightboxLikeUI() {
  if (activeLightboxIndex > -1) {
    const item = appState.portfolio[activeLightboxIndex];
    if (item) {
      const key = item.title || `item_${activeLightboxIndex}`;
      if (item.likes === undefined) item.likes = Math.floor(Math.random() * 150) + 50;
      const hasLiked = appState.userLikes && appState.userLikes[key];
      document.getElementById('lightbox-likes-count').innerText = item.likes;
      const icon = document.getElementById('lightbox-like-icon');
      if (icon) {
        icon.classList.toggle('text-red-500', !!hasLiked);
        icon.classList.toggle('text-slate-400', !hasLiked);
      }
    }
  }
}

function toggleLightboxLike() {
  if (activeLightboxIndex > -1) {
    const item = appState.portfolio[activeLightboxIndex];
    if (item) {
      const key = item.title || `item_${activeLightboxIndex}`;
      if (!appState.userLikes) appState.userLikes = {};
      if (appState.userLikes[key]) {
        item.likes = Math.max(0, (item.likes || 1) - 1);
        delete appState.userLikes[key];
        showToast("Like Removed");
      } else {
        item.likes = (item.likes || 0) + 1;
        appState.userLikes[key] = true;
        showToast("Liked!");
      }
      updateLightboxLikeUI();
      playHapticClick();
    }
  }
}

// WhatsApp Bookings
function bookWhatsAppPlan(p, r) {
  const ph = appState.profile.whatsapp.replace(/[^0-9]/g, ''), m = encodeURIComponent(`Hi Ahsan! I am interested in your "${p}" (${r}) plan. Let's discuss details!`);
  window.open(`https://wa.me/${ph}?text=${m}`, '_blank');
}

// Image fallback errors
function handleProfileImageError(img) {
  img.style.display = 'none';
  document.getElementById('profile-fallback').classList.remove('hidden');
}

function handlePortfolioThumbnailError(img, cat) {
  img.onerror = null;
  img.src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400";
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

// Splash Screen Loader
function startCinematicIntro() {
  const ac = document.getElementById('splash-animation-container'), st = document.getElementById('splash-text');
  if (ac) ac.classList.remove('hidden');
  const au = (appState.profile && appState.profile.introAudio) || "";
  
  if (au && au.trim() !== "") {
    try {
      const ctx = initAudioContext(), audio = new Audio(convertDriveAudioLink(au));
      const src = ctx.createMediaElementSource(audio), g = ctx.createGain();
      g.gain.setValueAtTime(parseFloat((appState.profile && appState.profile.soundVolume) || "0.5"), ctx.currentTime);
      src.connect(g); g.connect(ctx.destination);
      audio.play().catch(() => {});
    } catch (e) {}
  }
  
  const ft = (appState.profile && appState.profile.introText) || "Hi";
  if (st) {
    st.innerHTML = ft;
    st.className = "text-6xl font-black tracking-tight text-white animate-pulse font-sans";
  }
  
  setTimeout(() => {
    const s = document.getElementById('intro-splash');
    if (s) {
      s.classList.add('opacity-0'); s.style.transform = "scale(1.02)"; s.style.pointerEvents = "none";
      setTimeout(() => s.classList.add('hidden'), 500);
    }
  }, 500);
}

// Listen haptic sounds
document.addEventListener('click', e => {
  let l = e.target, clickCheck = false;
  while (l && l !== document.body) {
    const tag = l.tagName ? l.tagName.toLowerCase() : '';
    const classCheck = l.classList && (l.classList.contains('cursor-pointer') || l.classList.contains('port-tab'));
    if (['a', 'button', 'select'].includes(tag) || classCheck) { clickCheck = true; break; }
    l = l.parentNode;
  }
  if (clickCheck) playHapticClick();
});

// Load Page State
window.addEventListener('load', () => {
  initFirebaseSync();
  setTimeout(startCinematicIntro, 300);
});