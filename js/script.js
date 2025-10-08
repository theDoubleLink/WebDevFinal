

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
