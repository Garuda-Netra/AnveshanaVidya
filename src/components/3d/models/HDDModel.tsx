import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function HDDModel() {
  const platterRef = useRef<THREE.Group>(null);
  const armRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (platterRef.current) {
      // Spin the platter
      platterRef.current.rotation.y += 0.1;
    }
    if (armRef.current) {
      // Move the arm back and forth slightly
      armRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.5;
    }
  });

  return (
    <group rotation={[0.5, 0, 0]}>
      {/* Case */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[3.5, 0.2, 4.5]} />
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Platter Group */}
      <group ref={platterRef} position={[0, 0.1, 0]}>
        <mesh>
          <cylinderGeometry args={[1.5, 1.5, 0.05, 32]} />
          <meshStandardMaterial color="#silver" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Spindle */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </group>

      {/* Actuator Arm Group */}
      <group ref={armRef} position={[1.2, 0.15, 1.2]} rotation={[0, 0.5, 0]}>
        {/* Pivot */}
        <mesh>
          <cylinderGeometry args={[0.15, 0.15, 0.2, 16]} />
          <meshStandardMaterial color="#555" />
        </mesh>
        {/* Arm */}
        <mesh position={[-0.8, 0, 0]}>
          <boxGeometry args={[1.6, 0.05, 0.2]} />
          <meshStandardMaterial color="#888" />
        </mesh>
        {/* Head */}
        <mesh position={[-1.6, -0.05, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color="#f00" emissive="#f00" emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  );
}
