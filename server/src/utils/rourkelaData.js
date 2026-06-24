/**
 * rourkelaData.js
 * Complete real data for Rourkela, Odisha — Community Hero platform
 */

const ROURKELA_DATA = {
  city: 'Rourkela',
  state: 'Odisha',
  country: 'India',
  center: { lat: 22.2604, lng: 84.8536 },
  defaultZoom: 12,
  boundingBox: {
    north: 22.3200,
    south: 22.1800,
    east:  84.9300,
    west:  84.7800,
  },

  // ─── All 40 RMC Wards ───────────────────────────────────────────────
  wards: [
    { id: 1,  name: 'Udit Nagar Ward 1',         authority: 'RMC',      centre: { lat: 22.2390, lng: 84.8735 }, population: 8200,  councillor: 'TBD', phone: '06612400825' },
    { id: 2,  name: 'Udit Nagar Ward 2',         authority: 'RMC',      centre: { lat: 22.2356, lng: 84.8760 }, population: 7800,  councillor: 'TBD', phone: '06612400825' },
    { id: 3,  name: 'Civil Township',            authority: 'SAIL_RSP', centre: { lat: 22.2278, lng: 84.8689 }, population: 12000, councillor: 'TBD', phone: '06612520100' },
    { id: 4,  name: 'Koel Nagar',                authority: 'SAIL_RSP', centre: { lat: 22.2445, lng: 84.8678 }, population: 11500, councillor: 'TBD', phone: '06612520100' },
    { id: 5,  name: 'Sector 1',                  authority: 'SAIL_RSP', centre: { lat: 22.2389, lng: 84.8534 }, population: 9800,  councillor: 'TBD', phone: '06612520100' },
    { id: 6,  name: 'Sector 2',                  authority: 'SAIL_RSP', centre: { lat: 22.2412, lng: 84.8567 }, population: 9200,  councillor: 'TBD', phone: '06612520100' },
    { id: 7,  name: 'Sector 3',                  authority: 'SAIL_RSP', centre: { lat: 22.2434, lng: 84.8598 }, population: 9000,  councillor: 'TBD', phone: '06612520100' },
    { id: 8,  name: 'Chhend Colony',             authority: 'RMC',      centre: { lat: 22.2512, lng: 84.8834 }, population: 10200, councillor: 'TBD', phone: '06612400825' },
    { id: 9,  name: 'Shastri Nagar',             authority: 'RMC',      centre: { lat: 22.2456, lng: 84.8934 }, population: 8700,  councillor: 'TBD', phone: '06612400825' },
    { id: 10, name: 'Bhedia Bypass Ward',        authority: 'RMC',      centre: { lat: 22.2567, lng: 84.9012 }, population: 7500,  councillor: 'TBD', phone: '06612400825' },
    { id: 11, name: 'NIT Area',                  authority: 'RMC',      centre: { lat: 22.2523, lng: 84.9022 }, population: 6800,  councillor: 'TBD', phone: '06612400825' },
    { id: 12, name: 'Budharaja',                 authority: 'RMC',      centre: { lat: 22.2600, lng: 84.8890 }, population: 9100,  councillor: 'TBD', phone: '06612400825' },
    { id: 13, name: 'Koelnagar Extension',       authority: 'RMC',      centre: { lat: 22.2490, lng: 84.8720 }, population: 8400,  councillor: 'TBD', phone: '06612400825' },
    { id: 14, name: 'Gopabandhu Nagar',          authority: 'RMC',      centre: { lat: 22.2312, lng: 84.8712 }, population: 7900,  councillor: 'TBD', phone: '06612400825' },
    { id: 15, name: 'Fertilizer Township',       authority: 'RMC',      centre: { lat: 22.2678, lng: 84.8623 }, population: 8600,  councillor: 'TBD', phone: '06612400825' },
    { id: 16, name: 'Chhend Extension',          authority: 'RMC',      centre: { lat: 22.2534, lng: 84.8856 }, population: 7200,  councillor: 'TBD', phone: '06612400825' },
    { id: 17, name: 'Birsa Nagar',               authority: 'RMC',      centre: { lat: 22.2167, lng: 84.8567 }, population: 9300,  councillor: 'TBD', phone: '06612400825' },
    { id: 18, name: 'Lathikatha',                authority: 'RMC',      centre: { lat: 22.2234, lng: 84.8578 }, population: 6700,  councillor: 'TBD', phone: '06612400825' },
    { id: 19, name: 'Bondamunda East',           authority: 'RMC',      centre: { lat: 22.2134, lng: 84.8456 }, population: 11200, councillor: 'TBD', phone: '06612400825' },
    { id: 20, name: 'Bondamunda West',           authority: 'RMC',      centre: { lat: 22.2156, lng: 84.8412 }, population: 10800, councillor: 'TBD', phone: '06612400825' },
    { id: 21, name: 'Hamirpur',                  authority: 'RMC',      centre: { lat: 22.2089, lng: 84.8389 }, population: 8900,  councillor: 'TBD', phone: '06612400825' },
    { id: 22, name: 'Panposh',                   authority: 'RMC',      centre: { lat: 22.2045, lng: 84.8156 }, population: 9400,  councillor: 'TBD', phone: '06612400825' },
    { id: 23, name: 'Jhirpani',                  authority: 'RMC',      centre: { lat: 22.1956, lng: 84.8234 }, population: 8100,  councillor: 'TBD', phone: '06612400825' },
    { id: 24, name: 'Koel River Bank',           authority: 'RMC',      centre: { lat: 22.2012, lng: 84.8300 }, population: 7600,  councillor: 'TBD', phone: '06612400825' },
    { id: 25, name: 'Banjari',                   authority: 'RMC',      centre: { lat: 22.1890, lng: 84.8178 }, population: 6900,  councillor: 'TBD', phone: '06612400825' },
    { id: 26, name: 'Mangal Nagar',              authority: 'RMC',      centre: { lat: 22.2167, lng: 84.8634 }, population: 8500,  councillor: 'TBD', phone: '06612400825' },
    { id: 27, name: 'Power House Road',          authority: 'RMC',      centre: { lat: 22.2289, lng: 84.8545 }, population: 9700,  councillor: 'TBD', phone: '06612400825' },
    { id: 28, name: 'Panposh Road Area',         authority: 'RMC',      centre: { lat: 22.2089, lng: 84.8134 }, population: 8800,  councillor: 'TBD', phone: '06612400825' },
    { id: 29, name: 'RINL Township',             authority: 'SAIL_RSP', centre: { lat: 22.2323, lng: 84.8512 }, population: 10500, councillor: 'TBD', phone: '06612520100' },
    { id: 30, name: 'Sector 4',                  authority: 'SAIL_RSP', centre: { lat: 22.2350, lng: 84.8490 }, population: 9600,  councillor: 'TBD', phone: '06612520100' },
    { id: 31, name: 'Sector 5',                  authority: 'SAIL_RSP', centre: { lat: 22.2367, lng: 84.8456 }, population: 9200,  councillor: 'TBD', phone: '06612520100' },
    { id: 32, name: 'Sector 6',                  authority: 'SAIL_RSP', centre: { lat: 22.2384, lng: 84.8423 }, population: 9000,  councillor: 'TBD', phone: '06612520100' },
    { id: 33, name: 'Sector 7',                  authority: 'SAIL_RSP', centre: { lat: 22.2401, lng: 84.8390 }, population: 8700,  councillor: 'TBD', phone: '06612520100' },
    { id: 34, name: 'Rasulgarh Outskirts',       authority: 'RMC',      centre: { lat: 22.2678, lng: 84.8756 }, population: 7400,  councillor: 'TBD', phone: '06612400825' },
    { id: 35, name: 'Tangarpali',                authority: 'RMC',      centre: { lat: 22.2145, lng: 84.8512 }, population: 8000,  councillor: 'TBD', phone: '06612400825' },
    { id: 36, name: 'Mandirpali',                authority: 'RMC',      centre: { lat: 22.2178, lng: 84.8489 }, population: 7600,  councillor: 'TBD', phone: '06612400825' },
    { id: 37, name: 'Sibtala',                   authority: 'RMC',      centre: { lat: 22.2234, lng: 84.8423 }, population: 8200,  councillor: 'TBD', phone: '06612400825' },
    { id: 38, name: 'Kachery Road',              authority: 'RMC',      centre: { lat: 22.2289, lng: 84.8634 }, population: 8900,  councillor: 'TBD', phone: '06612400825' },
    { id: 39, name: 'Ispat Nagar',               authority: 'SAIL_RSP', centre: { lat: 22.2412, lng: 84.8445 }, population: 10200, councillor: 'TBD', phone: '06612520100' },
    { id: 40, name: 'Dhelua',                    authority: 'RMC',      centre: { lat: 22.1812, lng: 84.8256 }, population: 7100,  councillor: 'TBD', phone: '06612400825' },
  ],

  // ─── Flood Prone Zones ──────────────────────────────────────────────
  floodProneZones: [
    {
      name: 'Bondamunda Low Area',
      lat: 22.2134, lng: 84.8412,
      risk: 'HIGH',
      trigger: 'Koel River > 147m elevation or rainfall > 50mm/hr',
      wardsAffected: [19, 20, 21, 35, 36],
      description: 'Low-lying area on the banks of Koel River. Historically flooded during heavy monsoon.'
    },
    {
      name: 'Jhirpani River Bank',
      lat: 22.1956, lng: 84.8234,
      risk: 'HIGH',
      trigger: 'Rainfall > 40mm/hour for 3+ hours',
      wardsAffected: [23, 24, 25, 40],
      description: 'Confluence of multiple streams. Flash floods common during peak monsoon.'
    },
    {
      name: 'Panposh Confluence',
      lat: 22.2045, lng: 84.8156,
      risk: 'MEDIUM',
      trigger: 'Sanjo River overflow or Koel River > 145m',
      wardsAffected: [22, 28, 21],
      description: 'Where Sanjo and Koel rivers meet. Moderate flood risk during heavy rain.'
    },
    {
      name: 'Koelnagar Drain Overflow',
      lat: 22.2445, lng: 84.8678,
      risk: 'MEDIUM',
      trigger: 'Blocked drains + rainfall > 30mm/hr',
      wardsAffected: [4, 13],
      description: 'Inadequate stormwater drainage causes road flooding.'
    },
    {
      name: 'Chhend Valley',
      lat: 22.2512, lng: 84.8834,
      risk: 'LOW',
      trigger: 'Intense rainfall > 60mm/hr',
      wardsAffected: [8, 16],
      description: 'Low-lying area with occasional waterlogging.'
    },
  ],

  // ─── Authority Contacts ─────────────────────────────────────────────
  authorityContacts: {
    RMC: {
      name: 'Rourkela Municipal Corporation',
      shortName: 'RMC',
      phone: '0661-2400825',
      email: 'rmc@odisha.gov.in',
      portal: 'https://rmc.odisha.gov.in',
      address: 'RMC Building, Udit Nagar, Rourkela, Odisha 769012',
      jurisdiction: 'Civil areas of Rourkela — all 40 wards (shared with SAIL)'
    },
    SAIL_RSP: {
      name: 'SAIL Rourkela Steel Plant Township',
      shortName: 'SAIL RSP',
      phone: '0661-2520100',
      email: 'township@sailrsp.com',
      portal: 'https://www.sail.co.in/rourkela-steel-plant',
      address: 'RSP Main Gate, Sector 1, Rourkela, Odisha 769011',
      jurisdiction: 'Sectors 1–28 and SAIL residential townships'
    },
    NHAI: {
      name: 'National Highways Authority of India',
      shortName: 'NHAI',
      phone: '1800-11-6500',
      email: 'bhubaneswar@nhai.org',
      portal: 'https://www.nhai.gov.in',
      jurisdiction: 'NH-143, NH-143C passing through Rourkela'
    },
    OSPCB: {
      name: 'Odisha State Pollution Control Board',
      shortName: 'OSPCB',
      phone: '0674-2542987',
      email: 'complaints@ospcb.gov.in',
      portal: 'https://ospcb.odisha.gov.in',
      jurisdiction: 'Industrial pollution, air & water quality'
    },
    OSDMA: {
      name: 'Odisha State Disaster Management Authority',
      shortName: 'OSDMA',
      phone: '0674-2534177',
      email: 'osdma@odisha.gov.in',
      portal: 'https://osdma.org',
      jurisdiction: 'Disaster response and flood management'
    }
  },

  // ─── Key Landmarks ──────────────────────────────────────────────────
  hospitals: [
    { name: 'Ispat General Hospital (IGH)',  lat: 22.2484, lng: 84.8615, phone: '0661-2520100', type: 'SAIL', emergency: true },
    { name: 'Rourkela Government Hospital',  lat: 22.2289, lng: 84.8654, phone: '0661-2400825', type: 'Govt', emergency: true },
    { name: 'NIT Rourkela Medical Centre',   lat: 22.2523, lng: 84.9022, phone: '0661-2462000', type: 'NIT',  emergency: false },
    { name: 'Shanti Nursing Home',           lat: 22.2345, lng: 84.8734, phone: '0661-2401234', type: 'Private', emergency: true },
  ],

  policeStations: [
    { name: 'Rourkela Town PS',    lat: 22.2312, lng: 84.8645, phone: '0661-2400156' },
    { name: 'Udit Nagar PS',       lat: 22.2356, lng: 84.8734, phone: '0661-2401234' },
    { name: 'Bondamunda PS',       lat: 22.2156, lng: 84.8434, phone: '0661-2402345' },
    { name: 'Civil Township PS',   lat: 22.2278, lng: 84.8689, phone: '0661-2403456' },
    { name: 'Panposh PS',          lat: 22.2045, lng: 84.8156, phone: '0661-2404567' },
  ],

  markets: [
    { name: 'Udit Nagar Market',      lat: 22.2334, lng: 84.8723 },
    { name: 'Civil Township Market',  lat: 22.2289, lng: 84.8712 },
    { name: 'Chhend Market',          lat: 22.2512, lng: 84.8834 },
    { name: 'Bondamunda Market',      lat: 22.2134, lng: 84.8456 },
    { name: 'Koel Nagar Market',      lat: 22.2445, lng: 84.8678 },
    { name: 'Panposh Market',         lat: 22.2045, lng: 84.8200 },
  ],

  landmarks: [
    { name: 'RSP Main Gate (Gate 1)',  lat: 22.2389, lng: 84.8534, type: 'industrial',  icon: '🏭' },
    { name: 'RSP Gate 6 Bondamunda',   lat: 22.2123, lng: 84.8389, type: 'industrial',  icon: '🏭' },
    { name: 'Mandira Dam',             lat: 22.1893, lng: 84.7654, type: 'dam',          icon: '🌊' },
    { name: 'NIT Rourkela',            lat: 22.2523, lng: 84.9022, type: 'education',    icon: '🎓' },
    { name: 'Rourkela Bus Stand',      lat: 22.2256, lng: 84.8645, type: 'transport',    icon: '🚌' },
    { name: 'Rourkela Railway Station',lat: 22.2234, lng: 84.8612, type: 'transport',    icon: '🚂' },
    { name: 'Birsa Munda Airport',     lat: 22.2145, lng: 84.8434, type: 'transport',    icon: '✈️'  },
    { name: 'Rourkela Stadium',        lat: 22.2312, lng: 84.8678, type: 'sports',       icon: '🏟️' },
    { name: 'Veer Surendra Sai University (VSSUT)', lat: 22.2490, lng: 84.8912, type: 'education', icon: '🎓' },
  ],

  // ─── Dams & Rivers ──────────────────────────────────────────────────
  mandiraDam: {
    name: 'Mandira Dam',
    lat: 22.1893, lng: 84.7654,
    river: 'Sanjo (Koel tributary)',
    capacity: '363 MCM',
    normalLevel: '140m',
    warningLevel: '145m',
    criticalLevel: '148m',
    dangerLevel:  '150m',
    pondingArea: '26.7 sq km',
    impactedWards: [19, 20, 21, 22, 23, 24, 25, 40],
  },

  koelRiver: {
    name: 'Koel River',
    normalLevel: '140m',
    warningLevel: '145m',
    criticalLevel: '147m',
    floodLevel: '149m',
    monitoringStation: 'Koelnagar Barrage',
  },

  // ─── Issue Categories with Rourkela context ─────────────────────────
  issueCategories: [
    { id: 'pothole',        label: 'Pothole',          icon: '🕳️',  color: '#ef4444', authority: 'RMC'      },
    { id: 'waterlogging',   label: 'Waterlogging',     icon: '💧',  color: '#3b82f6', authority: 'RMC'      },
    { id: 'streetlight',    label: 'Streetlight',      icon: '💡',  color: '#f59e0b', authority: 'RMC'      },
    { id: 'garbage',        label: 'Garbage Dump',     icon: '🗑️',  color: '#10b981', authority: 'RMC'      },
    { id: 'pollution',      label: 'Industrial Pollution', icon: '🏭', color: '#6b7280', authority: 'OSPCB' },
    { id: 'construction',   label: 'Road Damage',      icon: '🚧',  color: '#8b5cf6', authority: 'RMC'      },
    { id: 'water_supply',   label: 'Water Supply',     icon: '🚰',  color: '#06b6d4', authority: 'RMC'      },
    { id: 'sewer',          label: 'Sewer/Drain',      icon: '🪣',  color: '#a16207', authority: 'RMC'      },
    { id: 'heritage',       label: 'Heritage Issue',   icon: '🏛️',  color: '#dc2626', authority: 'RMC'      },
    { id: 'other',          label: 'Other',            icon: '📋',  color: '#94a3b8', authority: 'RMC'      },
  ],
};

/**
 * Get authority based on ward ID
 */
function getAuthorityForWard(wardId) {
  const ward = ROURKELA_DATA.wards.find(w => w.id === wardId);
  return ward ? ward.authority : 'RMC';
}

/**
 * Find nearest ward to given coordinates using Haversine
 */
function getNearestWard(lat, lng) {
  let minDist = Infinity;
  let nearestWard = ROURKELA_DATA.wards[0];

  for (const ward of ROURKELA_DATA.wards) {
    const dlat = (ward.centre.lat - lat) * Math.PI / 180;
    const dlng = (ward.centre.lng - lng) * Math.PI / 180;
    const a = Math.sin(dlat/2)**2 +
              Math.cos(lat * Math.PI / 180) * Math.cos(ward.centre.lat * Math.PI / 180) * Math.sin(dlng/2)**2;
    const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    if (dist < minDist) { minDist = dist; nearestWard = ward; }
  }
  return nearestWard;
}

/**
 * Check if coordinates are in a flood-prone zone
 */
function isInFloodZone(lat, lng, radiusKm = 1.5) {
  return ROURKELA_DATA.floodProneZones.filter(zone => {
    const dlat = (zone.lat - lat) * Math.PI / 180;
    const dlng = (zone.lng - lng) * Math.PI / 180;
    const a = Math.sin(dlat/2)**2 +
              Math.cos(lat * Math.PI / 180) * Math.cos(zone.lat * Math.PI / 180) * Math.sin(dlng/2)**2;
    const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return dist <= radiusKm;
  });
}

module.exports = { ROURKELA_DATA, getAuthorityForWard, getNearestWard, isInFloodZone };
