import numpy as np
from scipy.optimize import linprog

class OptimizationService:
    def optimize_budget(self, total_budget: float):
        """
        Maximizes the number of civic issues resolved under a constrained ward budget.
        Uses SciPy Linear Programming.
        """
        # Variables: x1 (Potholes), x2 (Water Leaks), x3 (Streetlights), x4 (Garbage Clearing)
        # Objective: Maximize total issues resolved -> Maximize x1 + x2 + x3 + x4
        # Since linprog does minimization, we minimize -(x1 + x2 + x3 + x4)
        c = [-1, -1, -1, -1]

        # Constraints:
        # 1. Cost constraint: 2000*x1 + 5000*x2 + 1000*x3 + 500*x4 <= total_budget
        cost_per_pothole = 2000
        cost_per_water = 5000
        cost_per_light = 1000
        cost_per_garbage = 500
        
        A_ub = [[cost_per_pothole, cost_per_water, cost_per_light, cost_per_garbage]]
        b_ub = [total_budget]

        # Bounds: Minimum required fixes per category to prevent neglecting one issue entirely
        # Let's say at least 10 potholes, 2 water leaks, 15 lights, 20 garbage
        x1_bounds = (10, None)
        x2_bounds = (2, None)
        x3_bounds = (15, None)
        x4_bounds = (20, None)

        try:
            res = linprog(c, A_ub=A_ub, b_ub=b_ub, bounds=[x1_bounds, x2_bounds, x3_bounds, x4_bounds], method='highs')
            
            if res.success:
                return {
                    "success": True,
                    "allocations": {
                        "potholes_to_fix": int(res.x[0]),
                        "water_leaks_to_fix": int(res.x[1]),
                        "streetlights_to_fix": int(res.x[2]),
                        "garbage_zones_to_clear": int(res.x[3]),
                    },
                    "total_resolved": int(sum(res.x)),
                    "budget_used": float(np.dot(A_ub[0], res.x)),
                    "total_budget": total_budget
                }
            else:
                return {"success": False, "error": "Could not find optimal solution with given budget constraints."}
        except Exception as e:
            return {"success": False, "error": str(e)}

optimization_service = OptimizationService()
