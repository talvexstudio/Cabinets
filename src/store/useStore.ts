import { create } from 'zustand';

interface CabinetState {
  width: number;
  height: number;
  depth: number;
  numDoors: number;
  doorsOpen: boolean;
  numShelves: number;
  floorHeight: number;
  cabinetColor: string;

  setWidth: (w: number) => void;
  setHeight: (h: number) => void;
  setDepth: (d: number) => void;
  setNumDoors: (n: number) => void;
  setDoorsOpen: (isOpen: boolean) => void;
  setNumShelves: (n: number) => void;
  setFloorHeight: (h: number) => void;
  setCabinetColor: (c: string) => void;
}

export const useStore = create<CabinetState>((set) => ({
  width: 1200,
  height: 900,
  depth: 600,
  numDoors: 2,
  doorsOpen: true,
  numShelves: 2,
  floorHeight: 0,
  cabinetColor: '#58737e',

  setWidth: (w) => set({ width: w }),
  setHeight: (h) => set({ height: h }),
  setDepth: (d) => set({ depth: d }),
  setNumDoors: (n) => set({ numDoors: n }),
  setDoorsOpen: (isOpen) => set({ doorsOpen: isOpen }),
  setNumShelves: (n) => set({ numShelves: n }),
  setFloorHeight: (h) => set({ floorHeight: h }),
  setCabinetColor: (c) => set({ cabinetColor: c }),
}));
