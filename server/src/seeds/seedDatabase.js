/**
 * seedDatabase.js
 * Seeds the database with real Rourkela locations, users, and 20 civic issues
 *
 * Usage: node src/seeds/seedDatabase.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Simple inline models for seeding
const User = require('../models/User.model');
const Issue = require('../models/Issue.model');

const ROURKELA_COORDS = { lat: 22.2604, lng: 84.8536 };

const SAMPLE_ISSUES = [
  {
    title: 'Large pothole on Panposh Road near hospital junction',
    description: 'A large pothole approximately 2 feet wide has formed near the junction leading to Rourkela Government Hospital on Panposh Road. Vehicles swerving dangerously.',
    category: 'pothole', severity: 4, urgency: 'high',
    location: { type: 'Point', coordinates: [84.8134, 22.2089] },
    address: 'Panposh Road, near Government Hospital, Rourkela',
    ward: 28, authority: 'RMC', status: 'reported',
  },
  {
    title: 'Severe waterlogging in Bondamunda near railway crossing',
    description: 'Standing water over 2 feet deep near the Bondamunda railway level crossing. Water has been stagnant for 3 days after heavy rain. Dengue risk.',
    category: 'waterlogging', severity: 5, urgency: 'critical',
    location: { type: 'Point', coordinates: [84.8412, 22.2134] },
    address: 'Bondamunda Railway Crossing, Ward 20, Rourkela',
    ward: 20, authority: 'RMC', status: 'verified',
  },
  {
    title: 'Street light broken for 2 months in Udit Nagar',
    description: 'Three consecutive street lights on the road near Udit Nagar Park have been non-functional for 2+ months. Creating safety hazard at night.',
    category: 'streetlight', severity: 3, urgency: 'medium',
    location: { type: 'Point', coordinates: [84.8723, 22.2334] },
    address: 'Udit Nagar Park Road, Ward 1, Rourkela',
    ward: 1, authority: 'RMC', status: 'in_progress',
  },
  {
    title: 'Illegal garbage dump near Chhend residential colony',
    description: 'A large illegal garbage dumping site has appeared in Chhend Colony near Block C. Foul smell and fly breeding. Residents have complained multiple times.',
    category: 'garbage', severity: 3, urgency: 'medium',
    location: { type: 'Point', coordinates: [84.8834, 22.2512] },
    address: 'Chhend Colony Block C, Ward 8, Rourkela',
    ward: 8, authority: 'RMC', status: 'assigned',
  },
  {
    title: 'Pothole on EM Bypass approach near NIT turning',
    description: 'Multiple potholes on EM Bypass approach road near NIT Rourkela turning. Road surface completely damaged. Two-wheeler accident reported last week.',
    category: 'pothole', severity: 4, urgency: 'high',
    location: { type: 'Point', coordinates: [84.8934, 22.2456] },
    address: 'EM Bypass Approach, NIT Rourkela Turning, Ward 9',
    ward: 9, authority: 'RMC', status: 'reported',
  },
  {
    title: 'Water pipe leakage flooding Civil Township road',
    description: 'Underground water supply pipe has burst on the main road of Civil Township Sector 3. Water gushing and road submerged. SAIL RSP responsible.',
    category: 'water_supply', severity: 4, urgency: 'high',
    location: { type: 'Point', coordinates: [84.8712, 22.2289] },
    address: 'Civil Township Sector 3 Main Road, Ward 3',
    ward: 3, authority: 'SAIL_RSP', status: 'in_progress',
  },
  {
    title: 'Black smoke from factory near RSP Gate 1',
    description: 'Black smoke visible from a SAIL RSP auxiliary facility near Gate 1. Strong smell and visible air pollution. OSPCB complaint required.',
    category: 'pollution', severity: 5, urgency: 'critical',
    location: { type: 'Point', coordinates: [84.8534, 22.2389] },
    address: 'Near RSP Main Gate 1, Sector 1, Rourkela',
    ward: 5, authority: 'OSPCB', status: 'verified',
  },
  {
    title: 'Road surface broken with exposed pipes in Birsa Nagar',
    description: 'Road surface collapsed revealing exposed underground pipes in Birsa Nagar Ward 17. Risk of vehicle falling in. Urgent barricading needed.',
    category: 'construction', severity: 5, urgency: 'critical',
    location: { type: 'Point', coordinates: [84.8567, 22.2167] },
    address: 'Birsa Nagar Main Road, Ward 17, Rourkela',
    ward: 17, authority: 'RMC', status: 'assigned',
  },
  {
    title: 'Broken footpath tiles causing falls in Koel Nagar',
    description: 'Footpath tiles in Koel Nagar are broken and raised. An elderly woman fell yesterday and was injured. Multiple complaints already submitted to RMC.',
    category: 'construction', severity: 3, urgency: 'medium',
    location: { type: 'Point', coordinates: [84.8678, 22.2445] },
    address: 'Koel Nagar Park Road, Ward 4, Rourkela',
    ward: 4, authority: 'SAIL_RSP', status: 'resolved',
  },
  {
    title: 'Blocked stormwater drain causing flooding in Jhirpani',
    description: 'The main stormwater drain in Jhirpani is completely blocked with construction debris. Even mild rain causes road flooding of this low-lying area.',
    category: 'sewer', severity: 4, urgency: 'high',
    location: { type: 'Point', coordinates: [84.8234, 22.1956] },
    address: 'Jhirpani Main Drain, Ward 23, Rourkela',
    ward: 23, authority: 'RMC', status: 'reported',
  },
  {
    title: 'No drinking water supply for 4 days in Sector 6',
    description: 'SAIL RSP residential Sector 6 has had zero drinking water supply for the past 4 days. Over 200 families affected. Residents fetching from distant sources.',
    category: 'water_supply', severity: 5, urgency: 'critical',
    location: { type: 'Point', coordinates: [84.8423, 22.2384] },
    address: 'Sector 6 Housing Complex, Ward 32, Rourkela',
    ward: 32, authority: 'SAIL_RSP', status: 'in_progress',
  },
  {
    title: 'Overflowing manhole near Rourkela Railway Station',
    description: 'Sewage manhole overflowing near Rourkela Railway Station entrance. Visitors and locals have to wade through waste. Foul smell affecting entire area.',
    category: 'sewer', severity: 4, urgency: 'high',
    location: { type: 'Point', coordinates: [84.8612, 22.2234] },
    address: 'Near Rourkela Railway Station Main Entrance, Ward 14',
    ward: 14, authority: 'RMC', status: 'verified',
  },
  {
    title: 'Street lights not working in Panposh colony for weeks',
    description: 'Entire stretch of 500 meters of Panposh colony road has been dark for the past 3 weeks. At least 8 lights are out. Crime incidents reported.',
    category: 'streetlight', severity: 4, urgency: 'high',
    location: { type: 'Point', coordinates: [84.8156, 22.2045] },
    address: 'Panposh Colony Main Road, Ward 22, Rourkela',
    ward: 22, authority: 'RMC', status: 'reported',
  },
  {
    title: 'Garbage not collected from Fertilizer Township for 10 days',
    description: 'Municipal garbage collection has not happened in Fertilizer Township for 10 consecutive days. Waste overflowing from bins and onto streets.',
    category: 'garbage', severity: 3, urgency: 'medium',
    location: { type: 'Point', coordinates: [84.8623, 22.2678] },
    address: 'Fertilizer Township Market Area, Ward 15, Rourkela',
    ward: 15, authority: 'RMC', status: 'reported',
  },
  {
    title: 'Deep pothole near Budharaja petrol pump causing accidents',
    description: 'A 2-foot deep pothole exists right next to the Budharaja petrol pump on the main road. Two motorcycle accidents in the last week. Urgent repair needed.',
    category: 'pothole', severity: 5, urgency: 'critical',
    location: { type: 'Point', coordinates: [84.8890, 22.2600] },
    address: 'Budharaja Main Road near Petrol Pump, Ward 12',
    ward: 12, authority: 'RMC', status: 'verified',
  },
  {
    title: 'River bank erosion threatening Jhirpani homes',
    description: 'Heavy monsoon has caused severe river bank erosion in Jhirpani. Three homes are at immediate risk of collapse. Residents need to be evacuated.',
    category: 'other', severity: 5, urgency: 'critical',
    location: { type: 'Point', coordinates: [84.8200, 22.1890] },
    address: 'Jhirpani River Bank, Ward 25, Rourkela',
    ward: 25, authority: 'OSDMA', status: 'assigned',
  },
  {
    title: 'Construction debris blocking road in Mangal Nagar',
    description: 'A private construction project has dumped debris covering half the road width in Mangal Nagar. Traffic disrupted and emergency vehicles cannot pass.',
    category: 'construction', severity: 3, urgency: 'medium',
    location: { type: 'Point', coordinates: [84.8634, 22.2167] },
    address: 'Mangal Nagar Colony Road, Ward 26, Rourkela',
    ward: 26, authority: 'RMC', status: 'reported',
  },
  {
    title: 'Power lines dangerously low over road near NIT',
    description: 'Electrical power lines have sagged dangerously low over the main road near NIT Rourkela gate. Trucks cannot pass safely. Serious electrocution risk.',
    category: 'other', severity: 5, urgency: 'critical',
    location: { type: 'Point', coordinates: [84.9012, 22.2523] },
    address: 'NIT Rourkela Main Gate Road, Ward 11',
    ward: 11, authority: 'RMC', status: 'verified',
  },
  {
    title: 'Waterlogging destroying market area in Chhend',
    description: 'Standing water 1.5 feet deep in Chhend Market due to clogged drains. Shop owners suffering massive losses. Market inaccessible for 5 days.',
    category: 'waterlogging', severity: 4, urgency: 'high',
    location: { type: 'Point', coordinates: [84.8890, 22.2534] },
    address: 'Chhend Market Area, Ward 16, Rourkela',
    ward: 16, authority: 'RMC', status: 'in_progress',
  },
  {
    title: 'Chemical smell near OSPCB sampling point Bondamunda',
    description: 'Strong chemical odour reported near the OSPCB water quality sampling point at Bondamunda. Residents suspect industrial effluent discharge into local drain.',
    category: 'pollution', severity: 4, urgency: 'high',
    location: { type: 'Point', coordinates: [84.8389, 22.2123] },
    address: 'Bondamunda Industrial Zone outskirts, Ward 21',
    ward: 21, authority: 'OSPCB', status: 'reported',
  },
];

async function seed() {
  console.log('🌱 Starting database seed for Rourkela data...');

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGO_URI not set in environment. Aborting seed.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  // Clear existing seed data
  await Promise.all([
    User.deleteMany({ email: { $regex: /@(rourkela|communityhero)/ } }),
    Issue.deleteMany({ 'location.coordinates': { $exists: true } }),
  ]);
  console.log('🗑️  Cleared previous seed data');

  // Create admin user
  const adminPw = await bcrypt.hash('Admin@1234', 12);
  const admin = await User.create({
    name: 'Community Hero Admin',
    email: 'admin@communityhero.in',
    password: adminPw,
    role: 'admin',
    ward: 1,
    points: 0,
    isVerified: true,
    phone: '+916612400825',
  });
  console.log('✅ Admin user created: admin@communityhero.in / Admin@1234');

  // Create 5 test citizens
  const citizens = [
    { name: 'Rajesh Kumar',   email: 'rajesh@rourkela.in',  ward: 5,  points: 180 },
    { name: 'Priya Patel',    email: 'priya@rourkela.in',   ward: 12, points: 245 },
    { name: 'Amit Singh',     email: 'amit@rourkela.in',    ward: 20, points: 120 },
    { name: 'Sunita Devi',    email: 'sunita@rourkela.in',  ward: 28, points: 310 },
    { name: 'Ravi Sharma',    email: 'ravi@rourkela.in',    ward: 35, points: 95  },
  ];

  const citizenDocs = await Promise.all(
    citizens.map(async (c) => {
      const pw = await bcrypt.hash('User@1234', 12);
      return User.create({ ...c, password: pw, role: 'citizen', isVerified: true });
    })
  );
  console.log(`✅ ${citizenDocs.length} citizen users created`);

  // Seed 20 issues
  const allUsers = [admin, ...citizenDocs];
  const issueDocs = await Promise.all(
    SAMPLE_ISSUES.map((issue, i) =>
      Issue.create({
        ...issue,
        reporter: allUsers[i % allUsers.length]._id,
        upvotes: [],
        images: [],
        comments: [],
        aiAnalysis: {
          issueType: issue.category,
          severity: issue.severity,
          urgency: issue.urgency,
          authority: issue.authority,
          title: issue.title,
          description: issue.description,
          estimatedFixTime: issue.severity >= 4 ? '1-3 days' : '1-2 weeks',
          safetyRisk: issue.severity >= 4,
          tags: [issue.category, 'rourkela', issue.ward <= 10 ? 'civil-area' : 'residential'],
          confidence: 0.87,
          analyzedAt: new Date(),
        },
        statusHistory: [{ status: issue.status, changedAt: new Date(), note: 'Initial report' }],
      })
    )
  );

  console.log(`✅ ${issueDocs.length} sample issues created at real Rourkela coordinates`);
  console.log('\n📊 SEED COMPLETE. Summary:');
  console.log(`   Admin: admin@communityhero.in / Admin@1234`);
  console.log(`   Citizens: *@rourkela.in / User@1234`);
  console.log(`   Issues: ${issueDocs.length} across ${new Set(SAMPLE_ISSUES.map(i => i.ward)).size} wards`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
