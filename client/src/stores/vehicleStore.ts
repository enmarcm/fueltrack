import { create } from 'zustand';

interface VehicleStore {
  activeVehicleId: string | null;
  setActiveVehicle: (id: string | null) => void;
}

export const useVehicleStore = create<VehicleStore>((set) => ({
  activeVehicleId: localStorage.getItem('fueltrack-active-vehicle'),
  setActiveVehicle: (id) => {
    if (id) {
      localStorage.setItem('fueltrack-active-vehicle', id);
    } else {
      localStorage.removeItem('fueltrack-active-vehicle');
    }
    set({ activeVehicleId: id });
  },
}));
