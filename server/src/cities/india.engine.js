/**
 * Unified India Routing Engine
 * Provides intelligent fallback routing for issues reported anywhere in India
 * when a specialized city engine is not present.
 */

function determineAuthority(city, state) {
  if (!city) {
    return 'National Grievance Redressal Portal';
  }

  // Format the city name
  const formattedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

  // Tier 1 / Major Metropolitan Cities usually have specific well-known acronyms or names,
  // but a generic "Municipal Corporation" covers 99% of urban routing.
  const knownMetros = {
    'mumbai': 'Brihanmumbai Municipal Corporation',
    'bengaluru': 'Bruhat Bengaluru Mahanagara Palike',
    'bangalore': 'Bruhat Bengaluru Mahanagara Palike',
    'chennai': 'Greater Chennai Corporation',
    'delhi': 'Municipal Corporation of Delhi',
    'hyderabad': 'Greater Hyderabad Municipal Corporation',
    'ahmedabad': 'Ahmedabad Municipal Corporation',
    'pune': 'Pune Municipal Corporation',
    'surat': 'Surat Municipal Corporation'
  };

  const cityLower = city.toLowerCase();
  
  if (knownMetros[cityLower]) {
    return knownMetros[cityLower];
  }

  // Generic Fallback: Assume urban areas use Municipal Corporations
  return `${formattedCity} Municipal Corporation`;
}

module.exports = {
  determineAuthority
};
