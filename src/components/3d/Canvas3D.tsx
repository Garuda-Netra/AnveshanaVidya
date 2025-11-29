import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { HDDModel } from './models/HDDModel';
import { SSDModel } from './models/SSDModel';
import { FallbackView } from './FallbackView';
import { Button } from '../ui/Button';
import { SceneLights } from './SceneLights';

interface Canvas3DProps {
  scene: 'hdd' | 'ssd' | 'network' | string;
  className?: string;
}

// Placeholder 3D mesh component for unknown scenes
function PlaceholderMesh() {
  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#00ffff" wireframe />
    </mesh>
  );
}

function SceneContent({ type }: { type: string }) {
  // Map complex asset names to available models
  const modelType = type.includes('hdd') || type.includes('ntfs') ? 'hdd' :
                    type.includes('ssd') ? 'ssd' :
                    type;

  switch (modelType) {
    case 'hdd':
      return <HDDModel />;
    case 'ssd':
      return <SSDModel />;
    default:
      return <PlaceholderMesh />;
  }
}

export default function Canvas3D({ scene, className = '' }: Canvas3DProps) {
  const [is3D, setIs3D] = useState(true);
  
  // Determine fallback type
  let fallbackType: 'hdd' | 'ssd' | 'network' | 'default' = 'default';
  if (scene.includes('hdd') || scene.includes('ntfs')) fallbackType = 'hdd';
  else if (scene.includes('ssd')) fallbackType = 'ssd';
  else if (scene.includes('network')) fallbackType = 'network';

  return (
    <div className={`w-full h-full relative min-h-[300px] bg-black/20 rounded-lg overflow-hidden ${className}`}>
      {is3D ? (
        <div className="w-full h-full" role="img" aria-label={`3D visualization for ${scene}`}>
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 2, 5]} />
            <SceneLights />
            
            <Suspense fallback={null}>
              <SceneContent type={scene} />
              <OrbitControls enableZoom={true} enablePan={false} minDistance={3} maxDistance={10} />
            </Suspense>
          </Canvas>
        </div>
      ) : (
        <FallbackView type={fallbackType} />
      )}
      
      <div className="absolute bottom-4 right-4 z-10">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIs3D(!is3D)}
          className="bg-surface-dark/80 backdrop-blur-md border border-white/10 hover:bg-surface-light"
        >
          {is3D ? 'Switch to 2D' : 'Switch to 3D'}
        </Button>
      </div>
    </div>
  );
}
