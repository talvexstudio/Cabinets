import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { View } from '@react-three/drei';
import { Sidebar } from './components/Sidebar.tsx';
import { MainViewport } from './components/MainViewport.tsx';
import { TechViewports } from './components/TechViewports.tsx';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="app-grid">
      <div className="viewport-3d-container">
        <MainViewport />
      </div>
      <div className="viewports-2d-container">
        <TechViewports />
      </div>
      <Sidebar />

      {/* Shared Canvas for all Views */}
      <Canvas
        eventSource={containerRef as any}
        className="canvas-overlay"
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        shadows
      >
        <View.Port />
      </Canvas>
    </div>
  );
}

export default App;
