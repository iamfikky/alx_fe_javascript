/* ===========================
Dynamic Quote Generator
=========================== */

/** Storage keys */
const LS_QUOTES_KEY = 'quotes_v1';
const LS_LAST_CAT_KEY = 'lastCategory';
const SS_LAST_QUOTE_KEY = 'lastViewedQuote';

/** App state */
let quotes = [
{ text: "The best way to predict the future is to invent it.", category: "Motivation" },
{ text: "Life is what happens when you're busy making other plans.", category: "Life" },
{ text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

/** Elements */
const el = {
quoteDisplay: document.getElementById('quoteDisplay'),
newQuoteBtn: document.getElementById('newQuote'),
categoryFilter: document.getElementById('categoryFilter'),
exportBtn: document.getElementById('exportBtn'),
importFile: document.getElementById('importFile'),
addQuoteContainer: document.getElementById('addQuoteContainer'),
syncStatus: document.getElementById('syncStatus'),
notices: document.getElementById('notices'),
};

/* ===========================
Utilities
=========================== */
function saveQuotes() {
localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
const stored = localStorage.getItem(LS_QUOTES_KEY);
if (stored) {
try {
const parsed = JSON.parse(stored);
if (Array.isArray(parsed)) {
quotes = sanitizeQuotes(parsed);
}
} catch (e) {
// If corrupted, keep defaults
console.warn('Failed to parse stored quotes:', e);
}
}
}

function sanitizeQuotes(arr) {
// Ensure objects have text/category strings
return arr
.filter(q => q && typeof q === 'object')
.map(q => ({
text: String(q.text ?? '').trim(),
category: String(q.category ?? '').trim() || 'General'
}))
.filter(q => q.text.length > 0);
}

function setNotice(message, type = 'notice', ttlMs = 4000) {
const div = document.createElement('div');
div.className = `${type === 'error' ? 'error' : type === 'warn' ? 'warn' : 'notice'}`;
div.textContent = message;
el.notices.appendChild(div);
setTimeout(() => div.remove(), ttlMs);
}

/* ===========================
DOM Builders
=========================== */

function createAddQuoteForm() {
const wrapper = document.createElement('div');
wrapper.className = 'space-top';

const title = document.createElement('h2');
title.textContent = 'Add a Quote';
title.style.marginBottom = '8px';

const row = document.createElement('div');
row.className = 'row';

const textInput = document.createElement('input');
textInput.id = 'newQuoteText';
textInput.type = 'text';
textInput.placeholder = 'Enter a new quote';

const categoryInput = document.createElement('input');
categoryInput.id = 'newQuoteCategory';
categoryInput.type = 'text';
categoryInput.placeholder = 'Enter quote category';

const addBtn = document.createElement('button');
addBtn.id = 'addQuoteBtn';
addBtn.textContent = 'Add Quote';

row.appendChild(textInput);
row.appendChild(categoryInput);
row.appendChild(addBtn);

wrapper.appendChild(title);
wrapper.appendChild(row);

el.addQuoteContainer.appendChild(wrapper);

// Wire event
addBtn.addEventListener('click', addQuote);
}

/* ===========================
Categories & Filtering
=========================== */

function getUniqueCategories() {
return [...new Set(quotes.map(q => q.category).filter(Boolean))].sort((a,b) => a.localeCompare(b));
}

function populateCategories() {
const select = el.categoryFilter;
// Reset options
select.innerHTML = '<option value="all">All Categories</option>';
getUniqueCategories().forEach(cat => {
const opt = document.createElement('option');
opt.value = cat;
opt.textContent = cat;
select.appendChild(opt);
});
}

function filterQuotes() {
const selected = el.categoryFilter.value;
localStorage.setItem(LS_LAST_CAT_KEY, selected);

const pool = selected === 'all'
? quotes
: quotes.filter(q => q.category === selected);

if (pool.length === 0) {
el.quoteDisplay.textContent = 'No quotes in this category.';
return;
}
// Display a random from filtered pool
const idx = Math.floor(Math.random() * pool.length);
const q = pool[idx];
displayQuote(q);
}

/* ===========================
Core Actions
=========================== */

function displayQuote(quote) {
el.quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
try {
sessionStorage.setItem(SS_LAST_QUOTE_KEY, JSON.stringify(quote));
} catch {}
}

function showRandomQuote() {
if (quotes.length === 0) {
el.quoteDisplay.textContent = 'No quotes available yet. Add one below!';
return;
}
const selected = el.categoryFilter.value;
if (selected && selected !== 'all') {
return filterQuotes(); // respects current filter
}
const idx = Math.floor(Math.random() * quotes.length);
displayQuote(quotes[idx]);
}

function addQuote() {
const textEl = document.getElementById('newQuoteText');
const catEl = document.getElementById('newQuoteCategory');

const text = (textEl?.value || '').trim();
const category = (catEl?.value || '').trim();

if (!text || !category) {
setNotice('Please fill out both the quote and category.', 'warn');
return;
}

const newItem = { text, category };
quotes.push(newItem);
saveQuotes();
populateCategories();

// If user is filtering by this category or "all", show the new quote
const currentFilter = el.categoryFilter.value;
if (currentFilter === 'all' || currentFilter === category) {
displayQuote(newItem);
}

textEl.value = '';
catEl.value = '';
setNotice('Quote added successfully!');
}

/* ===========================
Import / Export JSON
=========================== */

function exportToJsonFile() {
try {
const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'quotes.json';
document.body.appendChild(a);
a.click();
a.remove();
URL.revokeObjectURL(url);
} catch (e) {
console.error(e);
setNotice('Failed to export quotes.', 'error');
}
}

function importFromJsonFile(event) {
const file = event.target.files?.[0];
if (!file) return;

const reader = new FileReader();
reader.onload = (e) => {
try {
const parsed = JSON.parse(e.target.result);
if (!Array.isArray(parsed)) {
throw new Error('Invalid format: not an array.');
}
const imported = sanitizeQuotes(parsed);
if (imported.length === 0) {
throw new Error('No valid quotes found in file.');
}

// Merge: keep existing, add non-duplicates (by text)
const texts = new Set(quotes.map(q => q.text));
const toAdd = imported.filter(q => !texts.has(q.text));
quotes.push(...toAdd);
saveQuotes();
populateCategories();
setNotice(`Imported ${toAdd.length} quote(s) successfully!`);
// Immediately reflect current filter
filterQuotes();
} catch (err) {
console.error(err);
setNotice(`Import failed: ${err.message}`, 'error', 6000);
} finally {
// reset input so same file can be selected again
event.target.value = '';
}
};
reader.readAsText(file);
}

/* ===========================
Simulated Server Sync
=========================== */

async function syncWithServer() {
// Simulate: fetch new items; server wins on conflicts (by text)
setSyncStatus('Syncing with server…');
try {
// Demo endpoint (JSONPlaceholder). We map post titles to quotes.
const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const data = await res.json();

const serverQuotes = sanitizeQuotes(
data.map(item => ({ text: String(item.title || '').trim(), category: 'Server' }))
);

// "Server wins" means:
// - If same text exists locally with different category, replace local category with server's
// - If text doesn't exist locally, add it
const byText = new Map(quotes.map(q => [q.text, q]));
let added = 0, updated = 0;

serverQuotes.forEach(sq => {
if (byText.has(sq.text)) {
const local = byText.get(sq.text);
if (local.category !== sq.category) {
local.category = sq.category; // server precedence
updated++;
}
} else {
quotes.push(sq);
added++;
}
});

if (added || updated) {
saveQuotes();
populateCategories();
setNotice(`Sync complete: ${added} added, ${updated} updated.`);
} else {
setNotice('Sync complete: no changes.');
}
setSyncStatus('Last sync: just now');
} catch (e) {
console.error(e);
setSyncStatus('Sync failed. Will retry later.', true);
setNotice('Server sync failed. Check your connection.', 'warn');
}
}

function setSyncStatus(msg, isError = false) {
el.syncStatus.textContent = msg;
el.syncStatus.className = isError ? 'error' : 'muted';
}

/* ===========================
Init
=========================== */

function restoreLastSelections() {
const lastCat = localStorage.getItem(LS_LAST_CAT_KEY);
if (lastCat) {
// If category exists, select it
const options = Array.from(el.categoryFilter.options).map(o => o.value);
if (options.includes(lastCat)) {
el.categoryFilter.value = lastCat;
}
}
}

function restoreLastViewedQuote() {
try {
const raw = sessionStorage.getItem(SS_LAST_QUOTE_KEY);
if (raw) {
const q = JSON.parse(raw);
if (q && q.text) {
displayQuote(q);
return true;
}
}
} catch {}
return false;
}

function wireEvents() {
el.newQuoteBtn.addEventListener('click', showRandomQuote);
el.categoryFilter.addEventListener('change', filterQuotes);
el.exportBtn.addEventListener('click', exportToJsonFile);
el.importFile.addEventListener('change', importFromJsonFile);
}

function boot() {
// Load persisted quotes
loadQuotes();
// Build dynamic form
createAddQuoteForm();
// Populate category filter
populateCategories();
// Restore filter choice
restoreLastSelections();

// Prefer session's last viewed quote; otherwise show based on filter
if (!restoreLastViewedQuote()) {
filterQuotes();
}

// Initial sync (non-blocking), then periodic
syncWithServer();
// Periodic sync every 30s
setInterval(syncWithServer, 30000);
setSyncStatus('Ready. Will sync periodically.');
}

document.addEventListener('DOMContentLoaded', () => {
wireEvents();
boot();
});
