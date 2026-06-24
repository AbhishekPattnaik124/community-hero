const { runAutoReporter } = require("./specialized/autoReporterAgent");
const { runAuthorityLiaison } = require("./specialized/authorityLiaisonAgent");
const { runResolutionVerifier } = require("./specialized/resolutionVerifierAgent");
const { runCommunityMobilizer } = require("./specialized/communityMobilizerAgent");
const { runPredictiveMaintenance } = require("./specialized/predictiveMaintenanceAgent");

async function dispatchAgent(agentType, payload = {}) {
  console.log(`[Orchestrator] Dispatching ${agentType} agent...`);
  
  switch (agentType) {
    case 'auto_reporter':
      return await runAutoReporter(payload.city || "Bangalore");
      
    case 'authority_liaison':
      return await runAuthorityLiaison(payload.daysStale || 2);
      
    case 'resolution_verifier':
      return await runResolutionVerifier();
      
    case 'community_mobilizer':
      return await runCommunityMobilizer();
      
    case 'predictive_maintenance':
      return await runPredictiveMaintenance();
      
    default:
      throw new Error(`Unknown agent type: ${agentType}`);
  }
}

module.exports = { dispatchAgent };
