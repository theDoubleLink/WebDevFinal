

// ---------- Utility helpers ----------
const $ = (sel, parent = document) => parent.querySelector(sel);
const todayISO = () => new Date().toISOString().split("T")[0];

const storage = {
  get(key, def = null) {
    try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; }
  },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
};

function setYear() {
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
}

// ---------- Mock data (used until real APIs are plugged in) ----------
const mockAnnouncements = [
  { title: "Extended Library Hours", body: "Open until 1am Mon–Thu during midterms." },
  { title: "Homecoming Friday", body: "Parade 5pm · Game 7pm." }
];

const mockEvents = [
  { id: 1, title: "Intramural Soccer Finals", date: todayISO(), time: "7:00 PM", location: "Field A", category: "sports", cost: "free", description: "Cheer on your classmates in the finals!" },
  { id: 2, title: "Guest Lecture: AI in Healthcare", date: todayISO(), time: "3:00 PM", location: "Hall 204", category: "academic", cost: "free", description: "Insights into modern AI applications." },
  { id: 3, title: "Open Mic Night", date: todayISO(), time: "8:00 PM", location: "Student Union", category: "arts", cost: "paid", description: "Sign-ups at the door." }
];

const mockMenus = {
  hallA: {
    breakfast: [
      { name: "Oatmeal", tags: ["vegetarian", "vegan", "gluten-free"] },
      { name: "Scrambled Eggs", tags: ["vegetarian"] }
    ],
    lunch: [
      { name: "Grilled Chicken", tags: ["gluten-free", "halal"] },
      { name: "Veggie Wrap", tags: ["vegetarian"] }
    ],
    dinner: [
      { name: "Pasta Marinara", tags: ["vegetarian"] },
      { name: "Tofu Stir-Fry", tags: ["vegan"] }
    ],
    hours: { open: 7, close: 20 }
  },
  hallB: {
    breakfast: [{ name: "Bagel & Cream Cheese", tags: ["vegetarian"] }],
    lunch: [{ name: "Burger Bar", tags: [] }],
    dinner: [{ name: "Salmon & Rice", tags: ["gluten-free"] }],
    hours: { open: 8, close: 21 }
  },
  cafe: {
    breakfast: [{ name: "Avocado Toast", tags: ["vegetarian"] }],
    lunch: [{ name: "Chicken Caesar Salad", tags: [] }],
    dinner: [{ name: "Panini", tags: [] }],
    hours: { open: 7, close: 18 }
  }
};

// ---------- API attempts (replace later with real endpoints) ----------
async function tryFetchAnnouncements() {
  // Placeholder for public-news API
  return mockAnnouncements;
}
async function tryFetchEvents() {
  // Placeholder for Eventbrite or other event page
  return mockEvents;
}
async function tryFetchMenu(locationKey, mealKey) {
  // Placeholder for Open Food Facts / campus JSON
  return (mockMenus[locationKey] && mockMenus[locationKey][mealKey]) || [];
}

// ---------- Render helpers ----------
function renderAnnouncements(list, el) {
  el.innerHTML = "";
  if (!list.length) { el.innerHTML = `<p class="text-muted">No announcements.</p>`; el.setAttribute("aria-busy","false"); return; }
  list.forEach(a => {
    const card = document.createElement("article");
    card.className = "card mb-2";
    card.innerHTML = `<div class="card-body"><h3 class="h6">${a.title}</h3><p class="mb-0">${a.body}</p></div>`;
    el.appendChild(card);
  });
  el.setAttribute("aria-busy","false");
}

function renderEventsTo(container, events, onAction) {
  container.innerHTML = "";
  if (!events.length) { container.innerHTML = `<p class="text-muted">No events found.</p>`; container.setAttribute("aria-busy","false"); return; }
  const row = document.createElement("div");
  row.className = "row g-3";
  events.forEach(evt => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-6";
    col.innerHTML = `
      <article class="card h-100">
        <div class="card-body d-flex flex-column">
          <h3 class="h6">${evt.title}</h3>
          <p class="mb-1">${evt.date} • ${evt.time}</p>
          <p class="text-muted small mb-2">${evt.location} • ${evt.category} • ${evt.cost}</p>
          <div class="mt-auto d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary" data-action="preview" data-id="${evt.id}">Details</button>
            <button class="btn btn-sm btn-primary" data-action="rsvp" data-id="${evt.id}">RSVP</button>
            <button class="btn btn-sm btn-outline-secondary" data-action="save" data-id="${evt.id}">Save</button>
          </div>
        </div>
      </article>`;
    row.appendChild(col);
  });
  container.appendChild(row);
  container.onclick = (e)=>{
    const b = e.target.closest("button[data-action]");
    if (!b) return;
    const id = Number(b.dataset.id);
    const evt = events.find(x=>x.id===id);
    onAction && onAction(b.dataset.action, evt);
  };
  container.setAttribute("aria-busy","false");
}

function renderEventPreview(el, evt){
  el.innerHTML = `
    <h3 class="h6">${evt.title}</h3>
    <p class="mb-1">${evt.date} • ${evt.time} • ${evt.location}</p>
    <p>${evt.description}</p>
    <div class="d-flex gap-2">
      <button class="btn btn-primary">RSVP</button>
      <button class="btn btn-outline-secondary" data-save-event="${evt.id}">Save</button>
      <a class="btn btn-outline-primary" href="#" role="button">Open on Map</a>
    </div>`;
}

function renderMenu(items, container){
  container.innerHTML = "";
  if (!items.length) { container.innerHTML = `<p class="text-muted">No items for selected filters.</p>`; container.setAttribute("aria-busy","false"); return; }
  const row = document.createElement("div");
  row.className = "row g-2";
  items.forEach(i=>{
    const col = document.createElement("div");
    col.className = "col-12 col-md-6";
    col.innerHTML = `
      <article class="card h-100">
        <div class="card-body d-flex justify-content-between align-items-start">
          <div>
            <h3 class="h6 mb-1">${i.name}</h3>
            <div class="small text-muted">${i.tags.join(", ") || "General"}</div>
          </div>
          <button class="btn btn-sm btn-outline-secondary" data-fav-menu="${i.name}">♥</button>
        </div>
      </article>`;
    row.appendChild(col);
  });
  container.appendChild(row);
  container.setAttribute("aria-busy","false");
}

function renderOpenStatus(hours, el){
  const now = new Date();
  const hr = now.getHours();
  const open = hr >= hours.open && hr < hours.close;
  const msg = open ? `Open now · Closes at ${hours.close}:00` : `Closed · Opens at ${hours.open}:00`;
  el.innerHTML = `<p class="${open?"text-success":"text-danger"} fw-semibold">${msg}</p>
                  <p class="small text-muted">Current time: ${now.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}</p>`;
}

// ---------- Page initializers ----------
async function initHome(){
  // Announcements
  const a = $("#announcements");
  if (a){ const data = await tryFetchAnnouncements().catch(()=>mockAnnouncements); renderAnnouncements(data, a); }

  // Upcoming Events preview (first 3)
  const prev = $("#eventsPreview");
  if (prev){
    const events = await tryFetchEvents().catch(()=>mockEvents);
    prev.innerHTML = events.slice(0,3).map(e=>`
      <div class="mb-2 d-flex justify-content-between">
        <div>
          <div class="fw-semibold">${e.title}</div>
          <div class="small text-muted">${e.date} • ${e.time} • ${e.location}</div>
        </div>
        <button class="btn btn-sm btn-outline-secondary" data-home-save-event="${e.id}">Save</button>
      </div>`).join("");
  }

  // Favorites list
  const favEl = $("#favoritesList");
  if (favEl){
    const list = storage.get("favorites", []);
    favEl.innerHTML = list.length ? `<ul class="list-unstyled mb-0">${list.map(s=>`<li>• ${s}</li>`).join("")}</ul>`
                                  : `<p class="text-muted mb-0">No favorites yet. Save events or menu items to see them here.</p>`;
  }

  // Quick Actions demo
  document.addEventListener("click", (e)=>{
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    alert(`(MVP) ${btn.dataset.action} clicked`);
  });

  // Save from preview
  document.addEventListener("click", (e)=>{
    const b = e.target.closest("[data-home-save-event]");
    if (!b) return;
    const id = Number(b.dataset.homeSaveEvent);
    const evt = mockEvents.find(x=>x.id===id);
    const list = storage.get("favorites", []);
    list.push(`Event: ${evt.title}`);
    storage.set("favorites", list);
    alert(`Saved to favorites: ${evt.title}`);
  });
}

async function initEvents(){
  const listEl = $("#eventsList");
  const previewEl = $("#eventPreview");
  const controls = {
    date: $("#eventDate"),
    cat: $("#eventCategory"),
    cost: $("#eventCost"),
    search: $("#eventSearch"),
    sort: $("#eventSort")
  };

  let events = await tryFetchEvents().catch(()=>mockEvents);

  function applyFilters(){
    listEl.setAttribute("aria-busy","true");
    let out = [...events];
    const d = controls.date.value;
    const c = controls.cat.value;
    const cost = controls.cost.value;
    const q = controls.search.value.toLowerCase().trim();

    if (d) out = out.filter(e=>e.date===d);
    if (c) out = out.filter(e=>e.category===c);
    if (cost) out = out.filter(e=>e.cost===cost);
    if (q) out = out.filter(e=>(e.title+e.location+e.description).toLowerCase().includes(q));

    if (controls.sort.value === "date") out.sort((a,b)=>a.date.localeCompare(b.date));
    if (controls.sort.value === "popularity") out.sort((a,b)=>a.title.localeCompare(b.title)); // placeholder

    renderEventsTo(listEl, out, (action, evt)=>{
      if (action === "preview") renderEventPreview(previewEl, evt);
      if (action === "rsvp") alert(`(MVP) RSVP for ${evt.title}`);
      if (action === "save") {
        const list = storage.get("favorites", []);
        list.push(`Event: ${evt.title}`);
        storage.set("favorites", list);
        alert(`Saved to favorites: ${evt.title}`);
      }
    });
  }

  $("#applyEventFilters").addEventListener("click", applyFilters);
  controls.search.addEventListener("input", ()=>{ /* live search optional */ });
  controls.sort.addEventListener("change", applyFilters);

  applyFilters();
}

async function initDining(){
  const menuEl = $("#menuList");
  const statusEl = $("#hoursStatus");

  const selects = {
    location: $("#diningLocation"),
    meal: $("#mealType"),
    diet: $("#dietary")
  };

  function currentMealKey(key){
    if (key !== "now") return key;
    const hr = new Date().getHours();
    if (hr < 11) return "breakfast";
    if (hr < 16) return "lunch";
    return "dinner";
  }

  async function render(){
    menuEl.setAttribute("aria-busy","true");
    const loc = selects.location.value;
    const meal = currentMealKey(selects.meal.value);
    let items = await tryFetchMenu(loc, meal).catch(()=>[]);
    const diet = selects.diet.value;
    if (diet) items = items.filter(i=>i.tags.includes(diet));
    renderMenu(items, menuEl);
    renderOpenStatus(mockMenus[loc].hours, statusEl);
  }

  $("#applyDiningFilters").addEventListener("click", render);
  $("#clearDiningFilters").addEventListener("click", ()=>{
    selects.location.value = "hallA";
    selects.meal.value = "now";
    selects.diet.value = "";
    render();
  });

  $("#saveDiningPrefs").addEventListener("click", ()=>{
    const prefs = { location: selects.location.value, meal: selects.meal.value, diet: selects.diet.value };
    storage.set("diningPrefs", prefs);
    $("#savedPrefs").textContent = `Saved: ${prefs.location}, ${prefs.meal}, ${prefs.diet || "any"}`;
  });

  // Load prefs if present
  const saved = storage.get("diningPrefs");
  if (saved){
    selects.location.value = saved.location;
    selects.meal.value = saved.meal;
    selects.diet.value = saved.diet;
    $("#savedPrefs").textContent = `Saved: ${saved.location}, ${saved.meal}, ${saved.diet || "any"}`;
  }

  // Save favorite menu item
  document.addEventListener("click", (e)=>{
    const b = e.target.closest("[data-fav-menu]");
    if (!b) return;
    const item = b.dataset.favMenu;
    const list = storage.get("favorites", []);
    list.push(`Menu: ${item}`);
    storage.set("favorites", list);
    alert(`Saved to favorites: ${item}`);
  });

  render();
}

// ---------- Router ----------
document.addEventListener("DOMContentLoaded", () => {
  setYear();
  initThemeToggle();
  const page = document.body.dataset.page;
  if (page === "home") initHome();
  if (page === "events") initEvents();
  if (page === "dining") initDining();
});


// --- Dark mode toggle (works on every page that has #themeToggle) ---
function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  const root = document.documentElement;

  // Apply saved theme on load
  const saved = localStorage.getItem('theme');
  if (saved) root.setAttribute('data-bs-theme', saved);

  // Sync button visuals (icon + pressed state)
  function syncButton() {
    if (!btn) return;
    const isDark = (root.getAttribute('data-bs-theme') === 'dark');
    btn.textContent = isDark ? '☀️' : '🌓';
    btn.setAttribute('aria-pressed', String(isDark));
    btn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  syncButton();

  // Toggle on click
  btn && btn.addEventListener('click', () => {
    const current = root.getAttribute('data-bs-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    root.setAttribute('data-bs-theme', next);
    localStorage.setItem('theme', next);
    syncButton();
  });
}


/* ===== Appended: Weather (NWS), Events, Dining + Open Food Facts ===== */
(function(){
  const $ = (s,p=document)=>p.querySelector(s);
  const $$ = (s,p=document)=>[...p.querySelectorAll(s)];
  const todayISO = ()=>new Date().toISOString().split("T")[0];
  const setYear = ()=> $$("#year").forEach(el=>el.textContent=new Date().getFullYear());

  // ---------- WEATHER (Home) ----------
  async function fetchNWSWeather(){
    const el = $("#weatherBlock");
    if(!el) return;
    try{
      const res = await fetch("https://api.weather.gov/gridpoints/DMX/44,61/forecast", {
        headers: { "Accept":"application/geo+json", "User-Agent":"CampusLifeSuperApp/1.0 (student project)" }
      });
      const data = await res.json();
      const p = data?.properties?.periods?.[0];
      if(!p) throw new Error("no periods");
      el.innerHTML = `<div>
        <div class="fw-semibold">${p.name}</div>
        <div>${p.shortForecast}</div>
        <div class="small text-muted">${p.temperature}&deg;${p.temperatureUnit}</div>
      </div>`;
    }catch(e){
      el.innerHTML = `<p class="text-muted mb-0">Weather unavailable.</p>`;
    }
  }

  // ---------- HOME WIDGETS ----------
  function renderAnnouncements(){
    const wrap = $("#announcements");
    if(!wrap) return;
    const anns = [
      {title:"Campus Safety Drill", body:"Practice scheduled for Monday at 10 AM."},
      {title:"Library Renovation", body:"New study pods opening this week!"}
    ];
    wrap.setAttribute("aria-busy","true");
    wrap.innerHTML = anns.map(a=>`<div class="mb-2"><strong>${a.title}</strong><p class="mb-0">${a.body}</p></div>`).join("");
    wrap.setAttribute("aria-busy","false");
  }

  function generateEvents(){
    const base=["Movie Night","Career Fair","Intramural Volleyball Finals","Art Showcase","STEM Expo"];
    return base.map((t,i)=>{
      const d = new Date(); d.setDate(d.getDate()+i);
      const hh = 17 + (i%4);
      const mm = i%2 ? "30":"00";
      return {
        id:i+1,
        title:t,
        dateISO:d.toISOString().split("T")[0],
        dateLabel:d.toLocaleDateString(),
        time:`${(hh>12?hh-12:hh)}:${mm} ${hh>=12?"PM":"AM"}`,
        location:"Student Center",
        category:i%2?"academic":"social",
        cost:i%2?"free":"paid",
        popularity:100 - i*10,
        description:`Join us for ${t}!`
      };
    });
  }

  function renderEventsPreviewHome(){
    const wrap = $("#eventsPreview");
    if(!wrap) return;
    const list = generateEvents().slice(0,3);
    wrap.setAttribute("aria-busy","true");
    wrap.innerHTML = list.map(e => `
      <div class="mb-2 d-flex justify-content-between align-items-start">
        <div>
          <div class="fw-semibold">${e.title}</div>
          <div class="small text-muted">${e.dateLabel} • ${e.time} • ${e.location}</div>
        </div>
        <button class="btn btn-sm btn-outline-secondary" data-save-fav="${e.title}">Save</button>
      </div>`).join("");
    wrap.setAttribute("aria-busy","false");
  }

  // ---------- EVENTS PAGE ----------
  function applyEventFilters(list){
    const dateVal = $("#eventDate")?.value || "";
    const category = $("#eventCategory")?.value || "";
    const cost = $("#eventCost")?.value || "";
    const search = ($("#eventSearch")?.value || "").trim().toLowerCase();
    const sortBy = $("#eventSort")?.value || "date";
    let filtered = list.slice();
    if (dateVal) filtered = filtered.filter(e => e.dateISO === dateVal);
    if (category) filtered = filtered.filter(e => e.category === category);
    if (cost) filtered = filtered.filter(e => e.cost === cost);
    if (search) filtered = filtered.filter(e => e.title.toLowerCase().includes(search));
    if (sortBy === "popularity") filtered.sort((a,b)=>b.popularity - a.popularity);
    else filtered.sort((a,b)=> a.dateISO.localeCompare(b.dateISO));
    return filtered;
  }

  function renderEventsList(list){
    const root = $("#eventsList");
    if (!root) return;
    root.setAttribute("aria-busy","true");
    root.innerHTML = "";
    if (!list.length){
      root.innerHTML = `<div class="col-12"><p class="text-muted mb-0">No events match your filters.</p></div>`;
      root.setAttribute("aria-busy","false");
      return;
    }
    list.forEach(evt=>{
      const col = document.createElement("div");
      col.className = "col-12 col-md-6";
      col.innerHTML = `
        <article class="card h-100">
          <div class="card-body d-flex flex-column">
            <h3 class="h6">${evt.title}</h3>
            <p class="mb-1">${evt.dateLabel} • ${evt.time}</p>
            <p class="small text-muted mb-2">${evt.location} • ${evt.category} • ${evt.cost}</p>
            <div class="mt-auto">
              <button class="btn btn-sm btn-outline-primary" data-evt="${evt.id}">Details</button>
            </div>
          </div>
        </article>`;
      root.appendChild(col);
    });
    root.setAttribute("aria-busy","false");
  }

  function attachEventPreview(list){
    const preview = $("#eventPreview");
    if (!preview) return;
    document.addEventListener("click", (e)=>{
      const btn = e.target.closest("[data-evt]");
      if (!btn) return;
      const id = +btn.getAttribute("data-evt");
      const evt = list.find(x => x.id === id);
      if (!evt) return;
      preview.innerHTML = `
        <h3 class="h6">${evt.title}</h3>
        <p>${evt.dateLabel} • ${evt.time} • ${evt.location}</p>
        <p>${evt.description}</p>`;
    });
  }

  function initEventsPage(){
    if (!$("#eventsList")) return;
    const master = generateEvents();
    let current = master.slice();
    renderEventsList(current);
    attachEventPreview(master);
    $("#applyEventFilters")?.addEventListener("click", ()=>{ current = applyEventFilters(master); renderEventsList(current); });
    $("#eventSearch")?.addEventListener("input", ()=>{ current = applyEventFilters(master); renderEventsList(current); });
    $("#eventSort")?.addEventListener("change", ()=>{ current = applyEventFilters(master); renderEventsList(current); });
  }

  // ---------- DINING PAGE ----------
  function generateFoods(){
    return [
      { name:"Grilled Chicken", location:"hallA", meal:"dinner", diets:[] },
      { name:"Avocado Toast", location:"cafe", meal:"breakfast", diets:["vegetarian"] },
      { name:"Pasta Primavera", location:"hallB", meal:"lunch", diets:["vegetarian"] },
      { name:"Veggie Wrap", location:"cafe", meal:"lunch", diets:["vegan"] },
      { name:"Tofu Stir Fry", location:"hallA", meal:"dinner", diets:["vegan","gluten-free"] },
      { name:"Gluten-Free Pancakes", location:"hallB", meal:"breakfast", diets:["gluten-free","vegetarian"] },
      { name:"Halal Beef Gyro", location:"hallA", meal:"lunch", diets:["halal"] },
      { name:"Kosher Salmon", location:"hallB", meal:"dinner", diets:["kosher"] },
    ];
  }

  async function fetchFoodFacts(foodName){
    const url = `https://world.openfoodfacts.org/api/v2/search?fields=product_name,nutriscore_grade,nutriments,labels_tags_en&sort_by=popularity&page_size=1&search_terms=${encodeURIComponent(foodName)}`;
    try{
      const res = await fetch(url);
      const data = await res.json();
      const p = (data.products && data.products.length) ? data.products[0] : null;
      if (!p) return { name: foodName, nutri:"N/A", kcal:"?", labels:"General" };
      return {
        name: p.product_name || foodName,
        nutri: (p.nutriscore_grade || "N/A").toString().toUpperCase(),
        kcal: p?.nutriments?.["energy-kcal_100g"] ?? "?",
        labels: (p.labels_tags_en || []).join(", ") || "General"
      };
    }catch(e){
      return { name: foodName, nutri:"N/A", kcal:"?", labels:"General" };
    }
  }

  function applyDiningFilters(list){
    const loc = $("#diningLocation")?.value || "";
    const meal = $("#mealType")?.value || "";
    const diet = $("#dietary")?.value || "";
    let filtered = list.slice();
    if (loc) filtered = filtered.filter(i => i.location === loc);
    if (meal && meal !== "now") filtered = filtered.filter(i => i.meal === meal);
    if (diet) filtered = filtered.filter(i => i.diets.includes(diet));
    return filtered;
  }

  async function renderMenu(list){
    const root = $("#menuList");
    if (!root) return;
    root.setAttribute("aria-busy","true");
    if (!list.length){
      root.innerHTML = `<p class="text-muted mb-0">No menu items match your filters.</p>`;
      root.setAttribute("aria-busy","false");
      return;
    }
    let html = "";
    for (const item of list){
      const info = await fetchFoodFacts(item.name);
      html += `<article class="card mb-2">
        <div class="card-body">
          <h3 class="h6 mb-1">${info.name}</h3>
          <p class="small mb-0">NutriScore: ${info.nutri} • ${info.kcal} kcal/100g</p>
          <p class="text-muted small mb-1">${info.labels}</p>
          <p class="text-muted small mb-0">Location: ${item.location} • Meal: ${item.meal} • Diets: ${item.diets.join(", ")||"—"}</p>
        </div>
      </article>`;
    }
    root.innerHTML = html;
    root.setAttribute("aria-busy","false");
  }

  function renderHoursStatus(){
    const el = $("#hoursStatus");
    if(!el) return;
    const now = new Date(); const hour = now.getHours();
    const isOpen = hour >= 7 && hour <= 20;
    el.innerHTML = `<p class="mb-1">Today: 7:00 AM – 9:00 PM</p>
      <p class="mb-0 ${isOpen?'text-success':'text-danger'} fw-semibold">${isOpen?'Open Now':'Closed Now'}</p>`;
  }

  function initDiningPage(){
    if (!$("#menuList")) return;
    const prefBox = $("#savedPrefs");
    const saved = JSON.parse(localStorage.getItem("diningPrefs") || "{}");
    if (saved && Object.keys(saved).length){
      if ($("#diningLocation")) $("#diningLocation").value = saved.location || "hallA";
      if ($("#mealType")) $("#mealType").value = saved.meal || "now";
      if ($("#dietary")) $("#dietary").value = saved.diet || "";
      if (prefBox) prefBox.textContent = `Saved: Location=${saved.location||'hallA'}, Meal=${saved.meal||'now'}, Diet=${saved.diet||'any'}`;
    }

    const master = generateFoods();
    let current = applyDiningFilters(master);
    renderMenu(current);
    renderHoursStatus();

    $("#applyDiningFilters")?.addEventListener("click", ()=>{ current = applyDiningFilters(master); renderMenu(current); });
    $("#clearDiningFilters")?.addEventListener("click", ()=>{
      if ($("#diningLocation")) $("#diningLocation").value = "hallA";
      if ($("#mealType")) $("#mealType").value = "now";
      if ($("#dietary")) $("#dietary").value = "";
      current = applyDiningFilters(master);
      renderMenu(current);
    });
    $("#saveDiningPrefs")?.addEventListener("click", ()=>{
      const prefs = {
        location: $("#diningLocation")?.value || "hallA",
        meal: $("#mealType")?.value || "now",
        diet: $("#dietary")?.value || ""
      };
      localStorage.setItem("diningPrefs", JSON.stringify(prefs));
      if (prefBox) prefBox.textContent = `Saved: Location=${prefs.location}, Meal=${prefs.meal}, Diet=${prefs.diet||'any'}`;
    });
  }

  // ---------- Boot ----------
  document.addEventListener("DOMContentLoaded", ()=>{
    setYear();
    renderAnnouncements();
    renderEventsPreviewHome();
    initEventsPage();
    initDiningPage();
    fetchNWSWeather(); // will do nothing if #weatherBlock isn't present
  });
})();

/* ===== Campus Life Dining Module (namespaced) ===== */
(function(){
  const $ = (s,p=document)=>p.querySelector(s);

  // Only attach if the new Dining layout is present
  function CLD_present(){
    return !!($("#menuList") && $("#diningLocation") && $("#mealType") && $("#dietary"));
  }

  // Hours map
  const CLD_HOURS = { hallA:{open:7,close:20}, hallB:{open:8,close:21}, cafe:{open:7,close:18} };

  // Single-source dataset
  const CLD_ITEMS = [
    { name:"Scrambled Eggs", location:"hallA", meal:"breakfast", diets:["gluten-free"] },
    { name:"Bacon", location:"hallA", meal:"breakfast", diets:["gluten-free"] },
    { name:"Hash Browns", location:"hallA", meal:"breakfast", diets:[] },
    { name:"Whole Wheat Toast", location:"hallA", meal:"breakfast", diets:["vegetarian"] },
    { name:"Grilled Chicken Sandwich", location:"hallA", meal:"lunch", diets:[] },
    { name:"French Fries", location:"hallA", meal:"lunch", diets:["vegetarian"] },
    { name:"Caesar Salad", location:"hallA", meal:"lunch", diets:[] },
    { name:"Baked Salmon", location:"hallA", meal:"dinner", diets:["gluten-free"] },
    { name:"Roasted Vegetables", location:"hallA", meal:"dinner", diets:["vegan","gluten-free"] },
    { name:"Mashed Potatoes", location:"hallA", meal:"dinner", diets:["vegetarian","gluten-free"] },
    { name:"Oatmeal Bar", location:"hallB", meal:"breakfast", diets:["vegetarian","gluten-free"] },
    { name:"Greek Yogurt Parfait", location:"hallB", meal:"breakfast", diets:["vegetarian","gluten-free"] },
    { name:"Fresh Fruit", location:"hallB", meal:"breakfast", diets:["vegan","gluten-free"] },
    { name:"Quinoa Bowl", location:"hallB", meal:"lunch", diets:["vegan","gluten-free"] },
    { name:"Veggie Wrap", location:"hallB", meal:"lunch", diets:["vegan"] },
    { name:"Lentil Soup", location:"hallB", meal:"lunch", diets:["vegan","gluten-free"] },
    { name:"Tofu Stir Fry", location:"hallB", meal:"dinner", diets:["vegan","gluten-free"] },
    { name:"Brown Rice", location:"hallB", meal:"dinner", diets:["vegan","gluten-free"] },
    { name:"Steamed Broccoli", location:"hallB", meal:"dinner", diets:["vegan","gluten-free"] },
    { name:"Avocado Toast", location:"cafe", meal:"breakfast", diets:["vegetarian"] },
    { name:"Breakfast Burrito", location:"cafe", meal:"breakfast", diets:[] },
    { name:"Muffin", location:"cafe", meal:"breakfast", diets:["vegetarian"] },
    { name:"Turkey Panini", location:"cafe", meal:"lunch", diets:[] },
    { name:"Tomato Basil Soup", location:"cafe", meal:"lunch", diets:["vegetarian","gluten-free"] },
    { name:"Caesar Wrap", location:"cafe", meal:"lunch", diets:[] },
    { name:"Pizza Slice (Cheese)", location:"cafe", meal:"dinner", diets:["vegetarian"] },
    { name:"Pizza Slice (Pepperoni)", location:"cafe", meal:"dinner", diets:[] },
    { name:"Pasta Alfredo", location:"cafe", meal:"dinner", diets:["vegetarian"] },
    { name:"Side Salad", location:"cafe", meal:"dinner", diets:["vegan","gluten-free"] },
    { name:"Halal Beef Gyro", location:"hallA", meal:"lunch", diets:["halal"] },
    { name:"Kosher Salmon", location:"hallB", meal:"dinner", diets:["kosher","gluten-free"] },
    { name:"Gluten-Free Pancakes", location:"hallB", meal:"breakfast", diets:["gluten-free","vegetarian"] },
  ];

  // OFF cache
  const CLD_OFF = new Map();
  async function CLD_off(foodName){
    if (CLD_OFF.has(foodName)) return CLD_OFF.get(foodName);
    const url = "https://world.openfoodfacts.org/api/v2/search?fields=nutriscore_grade,nutriments,labels_tags_en&page_size=1&sort_by=popularity&search_terms="+encodeURIComponent(foodName);
    try{
      const r = await fetch(url);
      const data = await r.json();
      const p = (data.products && data.products.length) ? data.products[0] : null;
      const val = {
        nutri: (p?.nutriscore_grade || "N/A").toString().toUpperCase(),
        kcal: (p?.nutriments?.["energy-kcal_100g"] ?? "—"),
        labels: (p?.labels_tags_en || []).join(", ") || "General"
      };
      if (val.kcal === 0) val.kcal = "—";
      CLD_OFF.set(foodName, val);
      return val;
    }catch(e){
      const val = { nutri:"N/A", kcal:"—", labels:"General" };
      CLD_OFF.set(foodName, val);
      return val;
    }
  }

  function CLD_mealKey(v){
    if (v !== "now") return v;
    const h = new Date().getHours();
    if (h < 11) return "breakfast";
    if (h < 16) return "lunch";
    return "dinner";
  }

  function CLD_filter(items, {location, meal, diet}){
    const mk = CLD_mealKey(meal);
    return items.filter(i =>
      (!location || i.location === location) &&
      (!mk || i.meal === mk) &&
      (!diet || i.diets.includes(diet))
    );
  }

  async function CLD_render(list){
    const root = $("#menuList");
    if (!root) return;
    root.setAttribute("aria-busy","true");
    if (!list.length){
      root.innerHTML = `<p class="text-muted mb-0">No menu items match your filters.</p>`;
      root.setAttribute("aria-busy","false");
      return;
    }
    let html = "";
    for (const item of list){
      const info = await CLD_off(item.name);
      html += `<article class="card mb-2">
        <div class="card-body d-flex justify-content-between align-items-start">
          <div>
            <h3 class="h6 mb-1">${item.name}</h3>
            <div class="small text-muted">NutriScore: ${info.nutri} • ${info.kcal} kcal/100g</div>
            <div class="small text-muted">${info.labels}</div>
            <div class="small text-muted">Location: ${item.location} • Meal: ${item.meal} • Diets: ${item.diets.join(", ") || "—"}</div>
          </div>
          <button class="btn btn-sm btn-outline-secondary" data-fav-menu="${item.name}" aria-label="Save ${item.name}">♥</button>
        </div>
      </article>`;
    }
    root.innerHTML = html;
    root.setAttribute("aria-busy","false");
  }

  function CLD_status(loc){
    const el = $("#hoursStatus"); if (!el) return;
    const h = CLD_HOURS[loc] || {open:7,close:20};
    const now = new Date(); const hr = now.getHours();
    const open = hr >= h.open && hr < h.close;
    el.innerHTML = `<p class="mb-1">Today: ${h.open}:00 – ${h.close}:00</p>
      <p class="mb-0 ${open?'text-success':'text-danger'} fw-semibold">${open?'Open Now':'Closed Now'}</p>`;
  }

  async function CLD_initDining(){
    if (!CLD_present()) return;

    const selects = {
      location: $("#diningLocation"),
      meal: $("#mealType"),
      diet: $("#dietary")
    };

    // Default to "now"
    if (selects.meal) selects.meal.value = "now";

    // Restore prefs
    const saved = JSON.parse(localStorage.getItem("diningPrefs") || "{}");
    if (Object.keys(saved).length){
      if (saved.location) selects.location.value = saved.location;
      if (saved.meal)     selects.meal.value     = saved.meal;
      if (saved.diet)     selects.diet.value     = saved.diet;
      const box = $("#savedPrefs"); if (box) box.textContent = `Saved: ${selects.location.value}, ${selects.meal.value}, ${selects.diet.value || "any"}`;
    }

    async function render(){
      const filt = {
        location: selects.location?.value || "hallA",
        meal: selects.meal?.value || "now",
        diet: selects.diet?.value || ""
      };
      const items = CLD_filter(CLD_ITEMS, filt);
      await CLD_render(items);
      CLD_status(filt.location);
    }

    $("#applyDiningFilters")?.addEventListener("click", render);
    $("#clearDiningFilters")?.addEventListener("click", ()=>{
      selects.location.value = "hallA";
      selects.meal.value = "now";
      selects.diet.value = "";
      render();
    });
    $("#saveDiningPrefs")?.addEventListener("click", ()=>{
      const prefs = { location: selects.location.value, meal: selects.meal.value, diet: selects.diet.value };
      localStorage.setItem("diningPrefs", JSON.stringify(prefs));
      const box = $("#savedPrefs"); if (box) box.textContent = `Saved: ${prefs.location}, ${prefs.meal}, ${prefs.diet || "any"}`;
    });

    document.addEventListener("click", (e)=>{
      const btn = e.target.closest("[data-fav-menu]");
      if (!btn) return;
      const list = JSON.parse(localStorage.getItem("favorites") || "[]");
      list.push(`Menu: ${btn.dataset.favMenu}`);
      localStorage.setItem("favorites", JSON.stringify(list));
      alert(`Saved: ${btn.dataset.favMenu}`);
    });

    render();
  }

  // Register without interfering with existing code
  document.addEventListener("DOMContentLoaded", CLD_initDining);
})();
