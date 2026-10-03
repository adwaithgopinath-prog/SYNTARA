import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DataFlowRingsProps {
  progressRef: React.MutableRefObject<number>;
}

// Decorative data-flow rings orbiting the core brand structure
export const DataFlowRings: React.FC<DataFlowRingsProps> = ({ progressRef }) => {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const p = progressRef.current;
    const time = state.clock.getElapsedTime();

    // Present from the Market scene through to Final World
    const baseVis = THREE.MathUtils.smoothstep(p, 0.00, 0.04);
    groupRef.current.visible = baseVis > 0.01;

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = time * 0.14;
      ring1Ref.current.rotation.x = time * 0.08;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -time * 0.10;
      ring2Ref.current.rotation.y = time * 0.06;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x = time * 0.07;
      ring3Ref.current.rotation.z = time * 0.12;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.2, -10]}>
      {/* Ring 1 — tight inner */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 6, 0, 0]}>
        <ringGeometry args={[4.2, 4.3, 64]} />
        <meshBasicMaterial
          color="#c8a873"
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Ring 2 — medium orbit, tilted */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 3, Math.PI / 5, 0]}>
        <ringGeometry args={[6.8, 6.92, 80]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.10}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Ring 3 — outer wide */}
      <mesh ref={ring3Ref} rotation={[Math.PI / 2, Math.PI / 7, 0]}>
        <ringGeometry args={[9.5, 9.62, 80]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.07}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};
