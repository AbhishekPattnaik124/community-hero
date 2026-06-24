import { create } from 'zustand';

export const useMapStore = create((set) => ({
  viewport: {
    longitude: 77.5946,
    latitude: 12.9716,
    zoom: 12,
  },
  selectedIssue: null,
  filters: { status: '', category: '', severity: '' },
  isHeatmap: false,

  setViewport: (viewport) => set({ viewport }),
  setSelectedIssue: (issue) => set({ selectedIssue: issue }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  toggleHeatmap: () => set((state) => ({ isHeatmap: !state.isHeatmap })),
  flyTo: (lng, lat, zoom = 15) => set({ viewport: { longitude: lng, latitude: lat, zoom } }),
}));
