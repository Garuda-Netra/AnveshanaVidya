import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

function CyberObject() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[2, 0]} />
          <meshBasicMaterial color="#00f3ff" wireframe transparent opacity={0.15} />
        </mesh>
        <mesh scale={[0.6, 0.6, 0.6]}>
          <icosahedronGeometry args={[2, 0]} />
          <meshBasicMaterial color="#a855f7" wireframe transparent opacity={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

export default function Scene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
      <Canvas camera={{ position: [0, 0, 8] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <CyberObject />
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  );
}
