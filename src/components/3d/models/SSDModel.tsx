import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function SSDModel() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} rotation={[0.5, -0.2, 0]}>
      {/* PCB Board */}
      <mesh>
        <boxGeometry args={[2.5, 0.1, 4]} />
        <meshStandardMaterial color="#004400" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Controller Chip */}
      <mesh position={[0, 0.1, -1]}>
        <boxGeometry args={[0.8, 0.1, 0.8]} />
        <meshStandardMaterial color="#111" metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Flash Memory Chips */}
      <group position={[0, 0.1, 0.5]}>
        <mesh position={[-0.6, 0, 0]}>
          <boxGeometry args={[0.8, 0.1, 1.2]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0.6, 0, 0]}>
          <boxGeometry args={[0.8, 0.1, 1.2]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[-0.6, 0, 1.4]}>
          <boxGeometry args={[0.8, 0.1, 1.2]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0.6, 0, 1.4]}>
          <boxGeometry args={[0.8, 0.1, 1.2]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </group>

      {/* Connector Pins */}
      <mesh position={[0, 0, -2.05]}>
        <boxGeometry args={[1.5, 0.05, 0.1]} />
        <meshStandardMaterial color="#gold" metalness={1} roughness={0.2} />
      </mesh>
    </group>
  );
}
