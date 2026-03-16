/**
 * Roster sync configuration stored on PVC.
 * Manages org roots, Google Sheet settings, and sync metadata.
 */

const CONFIG_KEY = 'roster-sync-config.json';

function loadConfig(storage) {
  return storage.readFromStorage(CONFIG_KEY);
}

function saveConfig(storage, config) {
  storage.writeToStorage(CONFIG_KEY, config);
}

function isConfigured(storage) {
  const config = loadConfig(storage);
  return config && Array.isArray(config.orgRoots) && config.orgRoots.length > 0;
}

function getOrgDisplayNames(storage) {
  const config = loadConfig(storage);
  if (!config || !config.orgRoots) return {};
  const map = {};
  for (const root of config.orgRoots) {
    map[root.uid] = root.displayName || root.name;
  }
  return map;
}

function updateSyncStatus(storage, status, error) {
  const config = loadConfig(storage);
  if (!config) return;
  config.lastSyncAt = new Date().toISOString();
  config.lastSyncStatus = status;
  config.lastSyncError = error || null;
  saveConfig(storage, config);
}

module.exports = {
  loadConfig,
  saveConfig,
  isConfigured,
  getOrgDisplayNames,
  updateSyncStatus
};
