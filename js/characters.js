/* ============================================
   ANGELEXE — character storage
   Client-side only: characters live in the visitor's
   browser (localStorage). Nothing is sent to a server
   except chat messages, which go straight to whatever
   AI endpoint is configured in settings.
   ============================================ */

const STORAGE_KEY = "angelexe_characters";
const SEED_FLAG_KEY = "angelexe_seeded";

function loadCharacters() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveCharacters(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function getCharacter(id) {
  return loadCharacters().find((c) => c.id === id) || null;
}

function upsertCharacter(character) {
  const list = loadCharacters();
  const idx = list.findIndex((c) => c.id === character.id);
  if (idx >= 0) {
    list[idx] = character;
  } else {
    list.push(character);
  }
  saveCharacters(list);
}

function deleteCharacter(id) {
  saveCharacters(loadCharacters().filter((c) => c.id !== id));
}

function makeId() {
  return "c_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// First-time visitors get a couple of example characters so the hub
// isn't empty. This only runs once per browser.
async function seedIfEmpty() {
  if (localStorage.getItem(SEED_FLAG_KEY)) return;
  localStorage.setItem(SEED_FLAG_KEY, "1");
  if (loadCharacters().length > 0) return;
  try {
    const res = await fetch("data/example-characters.json");
    const examples = await res.json();
    saveCharacters(examples);
  } catch (e) {
    // fine to skip if fetch fails (e.g. opened via file://)
    console.warn("Could not load example characters:", e);
  }
}
