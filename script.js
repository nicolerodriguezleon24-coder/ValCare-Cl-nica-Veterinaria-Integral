// Encapsulación: no contaminar global
(() => {
  // --- Helpers ---
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));
  const qs = (id) => document.getElementById(id);

  // --- DOM references ---
  const petsBody = qs('pets-body');
  const form = qs('appointment-form');
  const filterSpecies = qs('filter-species');
  const countEl = qs('count');
  const quickSearch = qs('quick-search');
  const addSampleBtn = qs('add-sample');
  const clearAllBtn = qs('clear-all');
  const searchInputTop = qs('search-input');
  const themeToggle = qs('theme-toggle');
  const openGallery = qs('open-gallery');
  const gallery = qs('gallery');
  const modal = qs('modal');
  const modalBody = qs('modal-body');
  const modalClose = qs('modal-close');
  const yearEl = qs('year');

  // --- Model ---
  class Pet {
    constructor({ name, species='Perro', age=0, owner='' }) {
      this.id = Pet._id = (Pet._id || 0) + 1;
      this.name = String(name).trim();
      this.species = species;
      this.age = Number(age) || 0;
      this.owner = String(owner).trim();
      this.createdAt = new Date().toISOString();
    }
  }

  // --- Persistence (localStorage) ---
  const STORAGE_KEY = 'arboleda_pets_v1';
  function loadPets() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  function savePets(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  // --- Pure functions ---
  function formatRow(pet) {
    // Sanitize via text node creation
    const tr = document.createElement('tr');
    tr.dataset.id = pet.id;
    tr.innerHTML = `
      <td>${escapeHtml(pet.name)}</td>
      <td>${escapeHtml(pet.species)}</td>
      <td>${escapeHtml(String(pet.age))}</td>
      <td>${escapeHtml(pet.owner)}</td>
      <td>
        <button class="btn small edit" data-id="${pet.id}">✎</button>
        <button class="btn ghost small remove" data-id="${pet.id}">🗑</button>
      </td>`;
    return tr;
  }
  function escapeHtml(str = '') {
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }

  // --- Rendering & filtering ---
  function render(list) {
    petsBody.innerHTML = '';
    const fragment = document.createDocumentFragment();
    list.forEach(p => fragment.appendChild(formatRow(p)));
    petsBody.appendChild(fragment);
    countEl.textContent = list.length;
  }

  function applyFilters() {
    const species = filterSpecies.value;
    const q = (quickSearch.value || '').toLowerCase().trim();
    const all = loadPets();
    const filtered = all.filter(p => {
      const bySpecies = (species === 'all') || p.species === species;
      const byQuery = !q || p.name.toLowerCase().includes(q) || p.owner.toLowerCase().includes(q);
      return bySpecies && byQuery;
    });
    render(filtered);
  }

  // --- Events ---
  addSampleBtn.addEventListener('click', () => {
    const sample = new Pet({ name: 'Luna', species: 'Perro', age: 2, owner: 'Carolina' });
    const list = loadPets(); list.push(sample); savePets(list);
    applyFilters();
    flashMessage('Muestra agregada ✔');
  });

  clearAllBtn.addEventListener('click', () => {
    if (!confirm('¿Eliminar todos los pacientes?')) return;
    localStorage.removeItem(STORAGE_KEY);
    applyFilters();
    flashMessage('Lista vaciada');
  });

  // Form submit
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const data = new FormData(form);
    const name = data.get('petName')?.trim();
    const owner = data.get('ownerName')?.trim();
    const species = data.get('species') || 'Perro';
    const age = data.get('age') || 0;
    const notes = data.get('notes') || '';

    // Validation
    if (!name || name.length < 2) {
      return showFormMessage('El nombre debe tener al menos 2 caracteres', true);
    }
    if (!owner || owner.length < 2) {
      return showFormMessage('Indica el nombre del dueño/a', true);
    }

    const newPet = new Pet({ name, species, age, owner });
    const list = loadPets(); list.push(newPet); savePets(list);
    form.reset();
    applyFilters();
    showFormMessage(`Cita reservada para ${name} ✔`);
  });

  qs('reset-form').addEventListener('click', () => form.reset());

  filterSpecies.addEventListener('change', applyFilters);
  quickSearch.addEventListener('input', debounce(applyFilters, 220));
  searchInputTop.addEventListener('input', debounce((e) => {
    // Mirror global search to table quick search
    quickSearch.value = e.target.value;
    applyFilters();
  }, 200));

  // Delegation: edit / remove buttons in table
  petsBody.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.classList.contains('remove')) {
      if (!confirm('¿Eliminar este paciente?')) return;
      const list = loadPets().filter(p => p.id !== id);
      savePets(list); applyFilters(); flashMessage('Paciente eliminado');
    } else if (btn.classList.contains('edit')) {
      // Fill form for edit (simple flow — create new entry for demo)
      const pet = loadPets().find(p => p.id === id);
      if (!pet) return;
      qs('pet-name').value = pet.name;
      qs('owner-name').value = pet.owner;
      qs('species').value = pet.species;
      qs('age').value = pet.age;
      qs('notes').value = 'Edición: ' + (pet.notes || '');
      flashMessage('Edita los campos y presiona Reservar (creará una nueva entrada)');
    }
  });

  // Gallery modal
  gallery.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.thumb');
    if (!btn) return;
    const name = btn.dataset.name;
    const species = btn.dataset.species;
    openModal(`<div style="font-size:48px;margin-bottom:8px">${btn.textContent}</div><h3>${escapeHtml(name)}</h3><p class="muted">Especie: ${escapeHtml(species)}</p>`);
  });

  openGallery.addEventListener('click', () => {
    // open a simple gallery modal showing all thumbs
    const html = Array.from($$('.thumb')).map(b => `<div style="padding:8px;font-size:28px">${b.textContent}<div class="small muted">${escapeHtml(b.dataset.species)}</div></div>`).join('');
    openModal(`<div style="display:flex;gap:8px;flex-wrap:wrap">${html}</div>`);
  });

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (ev) => {
    if (ev.target === modal) closeModal();
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') closeModal();
  });

  // Theme toggle
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    setTheme(next);
  });

  // --- Utilities & UI helpers ---
  function applySavedTheme() {
    const theme = localStorage.getItem('arboleda_theme') || 'light';
    setTheme(theme, false);
  }
  function setTheme(name, persist = true) {
    if (name === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '☀️';
      themeToggle.setAttribute('aria-pressed','true');
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeToggle.textContent = '🌙';
      themeToggle.setAttribute('aria-pressed','false');
    }
    if (persist) localStorage.setItem('arboleda_theme', name);
  }

  function flashMessage(msg) {
    // small ephemeral message near top
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.position = 'fixed';
    el.style.right = '18px';
    el.style.bottom = '18px';
    el.style.background = 'linear-gradient(90deg,#73e6d6,#7ad7ff)';
    el.style.color = '#042026';
    el.style.padding = '10px 14px';
    el.style.borderRadius = '10px';
    el.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
    document.body.appendChild(el);
    setTimeout(()=> el.style.opacity = '0', 1800);
    setTimeout(()=> el.remove(), 2200);
  }

  function showFormMessage(text, isError = false) {
    const el = qs('form-msg');
    el.textContent = text;
    el.style.color = isError ? '#b91c1c' : '';
    setTimeout(()=> el.textContent = '', 2800);
  }

  function openModal(html) {
    modalBody.innerHTML = html;
    modal.setAttribute('aria-hidden','false');
    modal.classList.add('open');
    setTimeout(() => modalBody.focus(), 70);
  }
  function closeModal() {
    modal.setAttribute('aria-hidden','true');
    modal.classList.remove('open');
    modalBody.innerHTML = '';
  }

  function debounce(fn, wait=200){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait); } }

  // --- Init on load ---
  function init() {
    // fill year
    yearEl.textContent = new Date().getFullYear();

    // load data
    applyFilters();

    // apply theme
    applySavedTheme();

    // small UX: animate existing thumbs
    $$('.thumb').forEach((b, i) => { b.style.transition = 'transform .22s ease'; b.style.transform = `translateY(${(i%3)-1}px)`; setTimeout(()=> b.style.transform = '', 300 + i*30); });

    // accessibility: ensure modal has hidden when loaded
    modal.setAttribute('aria-hidden','true');
  }

  // run
  init();
})();
