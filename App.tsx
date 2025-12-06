import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { Scene } from './components/Scene';
import { Overlay } from './components/Overlay';
import { TreeState } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<string>(TreeState.TREE);

  return (
    <div className="relative w-full h-screen bg-black">
      <Overlay mode={mode} setMode={setMode} />
      
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        camera={{ position: [0, 0, 30], fov: 45 }}
        gl={{ antialias: false, toneMappingExposure: 1.5 }}
      >
        <Suspense fallback={null}>
          <Scene mode={mode} />
        </Suspense>
      </Canvas>
      
      <Loader 
        containerStyles={{ background: '#001005' }}
        innerStyles={{ width: '200px', height: '2px', background: '#003311' }}
        barStyles={{ height: '2px', background: '#FFD700' }}
        dataStyles={{ color: '#FFD700', fontFamily: 'serif' }}
      />
    </div>
  );
};

export default App;
