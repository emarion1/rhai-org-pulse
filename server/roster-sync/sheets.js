/**
 * Google Sheets client for fetching team breakdown data.
 * Authenticates via service account key file.
 */

const { google } = require('googleapis');
const fs = require('fs');
const { DEFAULT_SHEET_COLUMNS } = require('./constants');

let cachedAuth = null;

function getAuth() {
  if (cachedAuth) return cachedAuth;

  const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || '/etc/secrets/google-sa-key.json';
  if (!fs.existsSync(keyFile)) {
    throw new Error(
      `Google service account key not found at ${keyFile}. ` +
      'Set GOOGLE_SERVICE_ACCOUNT_KEY_FILE env var to the correct path.'
    );
  }

  cachedAuth = new google.auth.GoogleAuth({
    keyFile: keyFile,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });
  return cachedAuth;
}

function normalizeNameForMatch(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[''`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Discover all sheet names in a spreadsheet.
 * Returns an array of sheet title strings.
 */
async function discoverSheetNames(sheetId) {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.get({
    spreadsheetId: sheetId,
    fields: 'sheets.properties.title'
  });
  return (response.data.sheets || []).map(s => s.properties.title);
}

/**
 * Fetch team breakdown data from Google Sheets.
 * If sheetNames is empty/null, auto-discovers all sheets and uses those
 * that contain the expected name column.
 * Returns a Map of normalized name -> enrichment data.
 */
async function fetchSheetData(sheetId, sheetNames) {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const people = new Map();

  if (!sheetNames || sheetNames.length === 0) {
    sheetNames = await discoverSheetNames(sheetId);
    console.log(`[sheets] Auto-discovered ${sheetNames.length} sheets: ${sheetNames.join(', ')}`);
  }

  for (const sheetName of sheetNames) {
    let rows;
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `'${sheetName}'`,
        valueRenderOption: 'UNFORMATTED_VALUE'
      });
      rows = response.data.values;
    } catch (err) {
      console.warn(`Sheet "${sheetName}" could not be read: ${err.message}`);
      continue;
    }

    if (!rows || rows.length < 2) {
      console.warn(`Sheet "${sheetName}" is empty or has no data rows`);
      continue;
    }

    // First row is headers
    const headers = rows[0];
    const colIndex = {};
    for (const [field, colName] of Object.entries(DEFAULT_SHEET_COLUMNS)) {
      const idx = headers.indexOf(colName);
      if (idx !== -1) colIndex[field] = idx;
    }

    if (colIndex.name === undefined) {
      console.warn(`Sheet "${sheetName}" missing "${DEFAULT_SHEET_COLUMNS.name}" column, skipping`);
      continue;
    }

    const dataRows = rows.slice(1);
    console.log(`  Sheet "${sheetName}": ${dataRows.length} rows`);

    for (const row of dataRows) {
      const name = row[colIndex.name];
      if (!name || typeof name !== 'string') continue;

      const normalized = normalizeNameForMatch(name);
      const entry = {
        originalName: name,
        manager: colIndex.manager !== undefined ? (row[colIndex.manager] || null) : null,
        miroTeam: colIndex.miroTeam !== undefined ? (row[colIndex.miroTeam] || null) : null,
        jiraComponent: colIndex.jiraComponent !== undefined ? (row[colIndex.jiraComponent] || null) : null,
        jiraTeam: colIndex.jiraTeam !== undefined ? (row[colIndex.jiraTeam] || null) : null,
        pm: colIndex.pm !== undefined ? (row[colIndex.pm] || null) : null,
        engLead: colIndex.engLead !== undefined ? (row[colIndex.engLead] || null) : null,
        status: colIndex.status !== undefined ? (row[colIndex.status] || null) : null,
        specialty: colIndex.specialty !== undefined ? (row[colIndex.specialty] || null) : null,
        subcomponent: colIndex.subcomponent !== undefined ? (row[colIndex.subcomponent] || null) : null,
        region: colIndex.region !== undefined ? (row[colIndex.region] || null) : null,
        sourceSheet: sheetName
      };

      const existing = people.get(normalized);
      if (existing) {
        if (!Array.isArray(existing)) {
          people.set(normalized, [existing, entry]);
        } else {
          existing.push(entry);
        }
      } else {
        people.set(normalized, entry);
      }
    }
  }

  return people;
}

module.exports = {
  fetchSheetData,
  discoverSheetNames,
  normalizeNameForMatch
};
