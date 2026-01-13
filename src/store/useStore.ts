import { create } from 'zustand';

interface CabinetState {
  width: number;
  height: number;
  depth: number;
  numRows: number;
  numCols: number;
  doorsOpen: boolean;
  useDoors: boolean;
  useDrawers: boolean;
  numShelves: number;
  floorHeight: number;
  cabinetColor: string;
  showSkirting: boolean;
  showFeet: boolean;
  recessDistance: number;
  numFeetPerRow: number;

  setWidth: (w: number) => void;
  setHeight: (h: number) => void;
  setDepth: (d: number) => void;
  setNumRows: (n: number) => void;
  setNumCols: (n: number) => void;
  setDoorsOpen: (isOpen: boolean) => void;
  setUseDoors: (use: boolean) => void;
  setUseDrawers: (use: boolean) => void;
  setNumShelves: (n: number) => void;
  setFloorHeight: (h: number) => void;
  setCabinetColor: (c: string) => void;
  setShowSkirting: (show: boolean) => void;
  setShowFeet: (show: boolean) => void;
  setRecessDistance: (dist: number) => void;
  setNumFeetPerRow: (num: number) => void;
}

export const useStore = create<CabinetState>((set) => ({
  width: 1200,
  height: 900,
  depth: 600,
  numRows: 1,
  numCols: 2,
  doorsOpen: true,
  useDoors: true,
  useDrawers: false,
  numShelves: 2,
  floorHeight: 0,
  cabinetColor: '#58737e',
  showSkirting: false,
  showFeet: false,
  recessDistance: 50,
  numFeetPerRow: 2,

  setWidth: (w) => set({ width: w }),
  setHeight: (h) => set({ height: h }),
  setDepth: (d) => set({ depth: d }),
  setNumRows: (n) => set({ numRows: Math.max(1, n) }),
  setNumCols: (n) => set({ numCols: Math.max(1, n) }),
  setDoorsOpen: (isOpen) => set({ doorsOpen: isOpen }),
  setUseDoors: (use) => set({ useDoors: use, useDrawers: use ? false : true }),
  setUseDrawers: (use) => set({ useDrawers: use, useDoors: use ? false : true }),
  setNumShelves: (n) => set({ numShelves: n }),
  setFloorHeight: (h) => set({ floorHeight: h }),
  setCabinetColor: (c) => set({ cabinetColor: c }),
  setShowSkirting: (show) => set({ showSkirting: show }),
  setShowFeet: (show) => set({ showFeet: show }),
  setRecessDistance: (dist) => set({ recessDistance: dist }),
  setNumFeetPerRow: (num) => set({ numFeetPerRow: Math.max(2, num) }),
}));
