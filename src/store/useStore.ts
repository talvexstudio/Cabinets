import { create } from 'zustand';
import type * as THREE from 'three';

interface CabinetBlock {
  id: string;
  height: number;
  numRows: number;
  numCols: number;
  doorsOpen: boolean;
  useDoors: boolean;
  useDrawers: boolean;
  useTrunk: boolean;
  lidHeight: number;
  lidOpen: boolean;
  drawersOpen: boolean;
  numShelves: number;
}

interface CabinetState {
  width: number;
  depth: number;
  floorHeight: number;
  cabinetColor: string;
  showSkirting: boolean;
  showFeet: boolean;
  recessDistance: number;
  numFeetPerRow: number;
  blocks: CabinetBlock[];

  setWidth: (w: number) => void;
  setDepth: (d: number) => void;
  setFloorHeight: (h: number) => void;
  setCabinetColor: (c: string) => void;
  setShowSkirting: (show: boolean) => void;
  setShowFeet: (show: boolean) => void;
  setRecessDistance: (dist: number) => void;
  setNumFeetPerRow: (num: number) => void;
  exportRoot: THREE.Object3D | null;
  setExportRoot: (root: THREE.Object3D | null) => void;
  addBlock: () => void;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, changes: Partial<CabinetBlock>) => void;
  setCabinetState: (data: {
    width: number;
    depth: number;
    floorHeight: number;
    cabinetColor: string;
    showSkirting: boolean;
    showFeet: boolean;
    recessDistance: number;
    numFeetPerRow: number;
    blocks: CabinetBlock[];
  }) => void;
}

export const useStore = create<CabinetState>((set) => ({
  width: 1200,
  depth: 600,
  floorHeight: 0,
  cabinetColor: '#58737e',
  showSkirting: false,
  showFeet: false,
  recessDistance: 50,
  numFeetPerRow: 2,
  exportRoot: null,
  blocks: [
    {
      id: 'block-1',
      height: 900,
      numRows: 1,
      numCols: 2,
      doorsOpen: true,
      useDoors: true,
      useDrawers: false,
      useTrunk: false,
      lidHeight: 60,
      lidOpen: false,
      drawersOpen: false,
      numShelves: 2,
    },
  ],

  setWidth: (w) => set({ width: w }),
  setDepth: (d) => set({ depth: d }),
  setFloorHeight: (h) => set({ floorHeight: h }),
  setCabinetColor: (c) => set({ cabinetColor: c }),
  setShowSkirting: (show) => set({ showSkirting: show }),
  setShowFeet: (show) => set({ showFeet: show }),
  setRecessDistance: (dist) => set({ recessDistance: dist }),
  setNumFeetPerRow: (num) => set({ numFeetPerRow: Math.max(2, num) }),
  setExportRoot: (root) => set({ exportRoot: root }),
  addBlock: () =>
    set((state) => ({
      blocks: [
        ...state.blocks,
        {
          id: `block-${state.blocks.length + 1}-${Date.now()}`,
          height: 900,
          numRows: 1,
          numCols: 2,
          doorsOpen: true,
          useDoors: true,
          useDrawers: false,
          useTrunk: false,
          lidHeight: 60,
          lidOpen: false,
          drawersOpen: false,
          numShelves: 2,
        },
      ],
    })),
  removeBlock: (id) =>
    set((state) => ({
      blocks: state.blocks.length > 1 ? state.blocks.filter((block) => block.id !== id) : state.blocks,
    })),
  updateBlock: (id, changes) =>
    set((state) => ({
      blocks: state.blocks.map((block) => (block.id === id ? { ...block, ...changes } : block)),
    })),
  setCabinetState: (data) =>
    set({
      width: data.width,
      depth: data.depth,
      floorHeight: data.floorHeight,
      cabinetColor: data.cabinetColor,
      showSkirting: data.showSkirting,
      showFeet: data.showFeet,
      recessDistance: data.recessDistance,
      numFeetPerRow: Math.max(2, data.numFeetPerRow),
      blocks: data.blocks.map((block, index) => ({
        id: block.id || `block-${index + 1}-${Date.now()}`,
        height: block.height,
        numRows: Math.max(1, block.numRows),
        numCols: Math.max(1, block.numCols),
        doorsOpen: block.doorsOpen,
        useDoors: block.useDoors,
        useDrawers: block.useDrawers,
        useTrunk: block.useTrunk ?? false,
        lidHeight: Math.max(0, block.lidHeight ?? 60),
        lidOpen: block.lidOpen ?? false,
        drawersOpen: block.drawersOpen ?? false,
        numShelves: block.numShelves,
      })),
    }),
}));
