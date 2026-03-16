/**
 * Merge LDAP org tree with Google Sheets enrichment data.
 * Pure function — does not read/write storage.
 */

const { normalizeNameForMatch } = require('./sheets');

/**
 * Enrich a single person with Sheets data.
 */
function enrichPerson(person, sheetsMap) {
  const normalized = normalizeNameForMatch(person.name);
  const ssData = sheetsMap.get(normalized);
  if (!ssData) return;

  const primary = Array.isArray(ssData) ? ssData[0] : ssData;
  person.miroTeam = primary.miroTeam;
  person.jiraComponent = primary.jiraComponent;
  person.jiraTeam = primary.jiraTeam;
  person.pm = primary.pm;
  person.engLead = primary.engLead;
  person.specialty = primary.specialty;
  person.status = primary.status;
  person.subcomponent = primary.subcomponent;
  person.region = primary.region;
  person.sourceSheet = primary.sourceSheet;

  if (Array.isArray(ssData) && ssData.length > 1) {
    person.additionalAssignments = ssData.slice(1).map(function(e) {
      return {
        miroTeam: e.miroTeam,
        jiraComponent: e.jiraComponent,
        jiraTeam: e.jiraTeam,
        specialty: e.specialty
      };
    });
  }
}

/**
 * Build the full roster object from LDAP data + Sheets enrichment.
 *
 * @param {Array} orgRoots - Array of { uid, name, displayName }
 * @param {Object} ldapOrgs - Map of uid -> { leader, members }
 * @param {Map} sheetsData - Map of normalized name -> enrichment data (or null)
 * @param {Object} vpInfo - { name, uid } for the VP (optional)
 * @returns {Object} org-roster-full.json format
 */
function buildRoster(orgRoots, ldapOrgs, sheetsData, vpInfo) {
  const roster = {
    generatedAt: new Date().toISOString(),
    vp: vpInfo || null,
    orgs: {}
  };

  for (const root of orgRoots) {
    const orgData = ldapOrgs[root.uid];
    if (!orgData) continue;

    // Enrich with Sheets data if available
    if (sheetsData) {
      enrichPerson(orgData.leader, sheetsData);
      for (const member of orgData.members) {
        enrichPerson(member, sheetsData);
      }
    }

    roster.orgs[root.uid] = {
      leader: orgData.leader,
      members: orgData.members
    };
  }

  return roster;
}

module.exports = {
  buildRoster,
  enrichPerson
};
