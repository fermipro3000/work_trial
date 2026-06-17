const fs = require("fs/promises");
const path = require("path");

const DATA_FILE =
  process.env.DATA_FILE || path.join(__dirname, "../../data.json");

let cache = null;
let writeQueue = Promise.resolve();

const EMPTY_DB = {
  users: [],
  campaigns: [],
  claims: [],
  whitelist_entries: [],
  blacklist: [],
  eligibility_cache: [],
  notifications: [],
  user_sessions: [],
};

async function loadDb() {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    try {
      cache = { ...EMPTY_DB, ...JSON.parse(raw) };
    } catch (parseErr) {
      console.error("Error parsing data.json, it might be corrupted. Starting with empty DB.", parseErr);
      cache = structuredClone(EMPTY_DB);
    }
  } catch (err) {
    if (err.code === "ENOENT") {
      cache = structuredClone(EMPTY_DB);
      await saveDb();
    } else {
      throw err;
    }
  }
  // Ensure all top-level keys exist and are arrays
  for (const key of Object.keys(EMPTY_DB)) {
    if (!Array.isArray(cache[key])) cache[key] = [];
  }
  return cache;
}

async function saveDb() {
  const data = cache || (await loadDb());
  const tmpFile = `${DATA_FILE}.tmp`;

  writeQueue = writeQueue.then(async () => {
    try {
      const content = JSON.stringify(data, null, 2);
      await fs.writeFile(tmpFile, content, "utf8");
      await fs.rename(tmpFile, DATA_FILE);
    } catch (err) {
      console.error("Failed to save database:", err);
      // Try to clean up temp file if it exists
      try {
        await fs.unlink(tmpFile);
      } catch (unlinkErr) {
        // ignore
      }
      throw err;
    }
  });

  await writeQueue;
}

async function withDb(mutator) {
  const db = await loadDb();
  const result = await mutator(db);
  await saveDb();
  return result;
}

function nowIso() {
  return new Date().toISOString();
}

module.exports = {
  DATA_FILE,
  loadDb,
  saveDb,
  withDb,
  nowIso,
};
