/**
 * Fetch GitLab contribution stats via the authenticated REST API (/api/v4/users/:id/events).
 *
 * calendar.json is a web UI endpoint that ignores PRIVATE-TOKEN and only returns
 * contributions to public projects. The events API respects authentication and returns
 * contributions to private projects the token owner has access to.
 *
 * Uses node-fetch (v2) for HTTP requests.
 * No batching possible with GitLab REST; uses sequential requests with per-request delay.
 */

const fetch = require('node-fetch');

const GITLAB_BASE_URL = process.env.GITLAB_BASE_URL || 'https://gitlab.com';
const GITLAB_TOKEN = process.env.GITLAB_TOKEN || null;
// 200ms with token (~300 req/min), 7s without to stay under ~10 req/min limit
const REQUEST_DELAY_MS = GITLAB_TOKEN ? 200 : 7000;

if (!GITLAB_TOKEN) {
  console.warn('[gitlab] WARNING: GITLAB_TOKEN not set. Rate limit is ~10 req/min unauthenticated.');
  console.warn('[gitlab] Set GITLAB_TOKEN in .env for authenticated access to private project contributions.');
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildHeaders() {
  const headers = { Accept: 'application/json' };
  if (GITLAB_TOKEN) headers['PRIVATE-TOKEN'] = GITLAB_TOKEN;
  return headers;
}

/**
 * Resolve a GitLab username to a numeric user ID via the REST API.
 * @returns {number|null} user ID or null if not found
 */
async function resolveUserId(username) {
  const url = `${GITLAB_BASE_URL}/api/v4/users?username=${encodeURIComponent(username)}`;
  const res = await fetch(url, { headers: buildHeaders(), timeout: 10000 });
  if (!res.ok) return null;
  const users = await res.json();
  return users.length > 0 ? users[0].id : null;
}

/**
 * Fetch all events for a user in the last year, paginated.
 * @returns {Array} flat list of event objects
 */
async function fetchAllEvents(userId) {
  const since = new Date();
  since.setFullYear(since.getFullYear() - 1);
  const afterDate = since.toISOString().slice(0, 10); // "YYYY-MM-DD"

  const events = [];
  let page = 1;
  while (true) {
    const url = `${GITLAB_BASE_URL}/api/v4/users/${userId}/events?per_page=100&page=${page}&after=${afterDate}`;
    const res = await fetch(url, { headers: buildHeaders(), timeout: 15000 });
    if (!res.ok) break;
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    events.push(...batch);
    if (batch.length < 100) break;
    page++;
  }
  return events;
}

/**
 * Fetch yearly contribution counts for a list of GitLab usernames.
 * @param {string[]} usernames - GitLab usernames to query
 * @returns {Object} Map of username -> { totalContributions, fetchedAt } or null if user not found
 */
async function fetchContributions(usernames) {
  console.log(`[gitlab] Fetching contributions for ${usernames.length} users`);

  const results = {};
  const now = new Date().toISOString();

  for (let i = 0; i < usernames.length; i++) {
    const username = usernames[i];
    if (i > 0) await delay(REQUEST_DELAY_MS);

    try {
      const userId = await resolveUserId(username);
      if (!userId) {
        console.log(`[gitlab] User not found: ${username}`);
        results[username] = null;
        continue;
      }

      await delay(REQUEST_DELAY_MS);
      const events = await fetchAllEvents(userId);
      const totalContributions = events.length;
      results[username] = { totalContributions, fetchedAt: now };
      console.log(`[gitlab] ${username}: ${totalContributions} contributions (${i + 1}/${usernames.length})`);
    } catch (err) {
      console.error(`[gitlab] Error fetching ${username}:`, err.message);
      results[username] = null;
    }
  }

  return results;
}

/**
 * Fetch monthly contribution breakdown for a list of GitLab usernames.
 * Buckets events by "YYYY-MM".
 * @param {string[]} usernames - GitLab usernames to query
 * @returns {Object} Map of username -> { months: { "YYYY-MM": count }, fetchedAt } or null
 */
async function fetchContributionHistory(usernames) {
  console.log(`[gitlab] Fetching contribution history for ${usernames.length} users`);

  const results = {};
  const now = new Date().toISOString();

  for (let i = 0; i < usernames.length; i++) {
    const username = usernames[i];
    if (i > 0) await delay(REQUEST_DELAY_MS);

    try {
      const userId = await resolveUserId(username);
      if (!userId) {
        console.log(`[gitlab] User not found: ${username}`);
        results[username] = null;
        continue;
      }

      await delay(REQUEST_DELAY_MS);
      const events = await fetchAllEvents(userId);
      const months = {};
      for (const event of events) {
        const monthKey = event.created_at.slice(0, 7); // "YYYY-MM"
        months[monthKey] = (months[monthKey] || 0) + 1;
      }
      results[username] = { months, fetchedAt: now };
      console.log(`[gitlab] ${username}: history fetched (${i + 1}/${usernames.length})`);
    } catch (err) {
      console.error(`[gitlab] Error fetching history for ${username}:`, err.message);
      results[username] = null;
    }
  }

  return results;
}

module.exports = { fetchContributions, fetchContributionHistory };
