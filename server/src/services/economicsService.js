/**
 * Economics Service
 * Calculates the real financial impact of unresolved civic issues.
 * Uses mathematical models and mock API integrations to estimate costs.
 */

class EconomicsService {
  /**
   * Main calculation engine. Takes an issue and computes its current financial impact.
   * @param {Object} issue 
   * @returns {Object} { totalCost, breakdown, roiToFix }
   */
  calculateImpact(issue) {
    let breakdown = {
      potholeDamage: 0,
      waterLoss: 0,
      crimeCost: 0,
      productivityLoss: 0,
      healthCost: 0,
    };

    const hoursUnresolved = this.getHoursUnresolved(issue.createdAt, issue.resolvedAt);

    switch (issue.category) {
      case 'roads': // Potholes
        breakdown.potholeDamage = this.calculatePotholeDamage(hoursUnresolved);
        break;
      case 'water': // Water leakage or waterlogging
        if (issue.title.toLowerCase().includes('leak')) {
          breakdown.waterLoss = this.calculateWaterLoss(hoursUnresolved);
        } else if (issue.title.toLowerCase().includes('log') || issue.description.toLowerCase().includes('log')) {
          breakdown.productivityLoss = this.calculateProductivityLoss(hoursUnresolved);
        }
        break;
      case 'safety': // Streetlights
      case 'electricity':
        if (issue.title.toLowerCase().includes('light')) {
          breakdown.crimeCost = this.calculateCrimeCost(hoursUnresolved);
        }
        break;
      case 'sanitation':
        breakdown.healthCost = this.calculateHealthCost('sanitation');
        break;
      default:
        break;
    }

    const totalCost = Object.values(breakdown).reduce((acc, curr) => acc + curr, 0);

    // Mock generic fix costs
    const fixCostMap = {
      roads: 15000,
      water: 5000,
      safety: 2000,
      sanitation: 1000
    };
    
    const costToFix = fixCostMap[issue.category] || 5000;
    
    // ROI = (Cost of Neglect - Cost to Fix) / Cost to Fix * 100
    let roiToFix = 0;
    if (totalCost > costToFix) {
      roiToFix = ((totalCost - costToFix) / costToFix) * 100;
    }

    return {
      totalCost: Math.round(totalCost),
      breakdown,
      roiToFix: Math.round(roiToFix)
    };
  }

  getHoursUnresolved(createdAt, resolvedAt) {
    const end = resolvedAt ? new Date(resolvedAt) : new Date();
    const start = new Date(createdAt);
    const ms = end - start;
    return Math.max(0, ms / (1000 * 60 * 60));
  }

  // 1. POTHOLE ECONOMIC DAMAGE CALCULATOR
  calculatePotholeDamage(hours) {
    // CRRI damage cost formulas
    const avgRepairCost = 3200; // INR
    const mockDailyTraffic = 500; // Vehicles per day (simulated Google Maps API)
    const hourlyTraffic = mockDailyTraffic / 24;
    const hitProbability = 0.05; // 5% of cars hit it hard enough

    return Math.round(hours * hourlyTraffic * hitProbability * avgRepairCost);
  }

  // 2. WATER LEAKAGE LOSS CALCULATOR
  calculateWaterLoss(hours) {
    const costPerKL = 6.07; // KMC rate
    const leakageRateLitersPerHour = 100; // Average 100L/hr
    const klPerHour = leakageRateLitersPerHour / 1000;

    return Math.round(hours * klPerHour * costPerKL);
  }

  // 3. BROKEN STREETLIGHT CRIME COST
  calculateCrimeCost(hours) {
    // NCRB data: 40% higher crime rate. 
    // Mocking an hourly economic burden of crime in an unlit area: ₹50/hour
    return Math.round(hours * 50); 
  }

  // 4. PRODUCTIVITY LOSS FROM WATERLOGGING
  calculateProductivityLoss(hours) {
    const peopleAffected = 5000; // Scaled down mock
    const hourlyWage = 180; // NSSO data
    const workingHoursImpacted = Math.min(hours, 8); // Max 1 work day impacted per event usually

    return Math.round(peopleAffected * workingHoursImpacted * hourlyWage);
  }

  // 5. HEALTH COST CALCULATOR
  calculateHealthCost(type) {
    // AIIMS/ICMR data
    if (type === 'sanitation') {
      const dengueCost = 25000;
      const respCost = 8000;
      // Probabilistic burden per unresolved sanitation issue
      return Math.round((dengueCost * 0.1) + (respCost * 0.2)); 
    }
    return 0;
  }
}

module.exports = new EconomicsService();
