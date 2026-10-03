import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ConnectionLinesProps {
  progressRef: React.MutableRefObject<number>;
}

// Static connection network between cluster positions — reveals during intelligence phase
const CLUSTER_POSITIONS: [number, number, number][] = [
  [-8, 2, -22],   // EDUCATION
  [8, 4, -26],    // PRODUCT
  [14, -2, -18],  // PRICE
  [-12, -3, -15], // SOCIAL PROOF
  [-6, 6, -30],   // COMMUNITY
  [11, 6, -34],   // LIFESTYLE
  [-14, 5, -28],  // TRUST
  [4, -5, -20],   // COMPARISON
  [0, 0.2, -10],  // SYNTARA CORE
];

// Define which nodes connect to which (by index)
const EDGES: [number, number][] = [
  [0, 4], [0, 8], [1, 2], [1, 8], [2, 7],
  [3, 8], [4, 6], [5, 1], [6, 0], [7, 3],
  [3, 8], [0, 6], [1, 7], [4, 8],
];

export const ConnectionLines: React.FC<ConnectionLinesProps> = ({ progressRef }) => {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<(THREE.Line | null)[]>([]);

  const lineGeometries = useMemo(() => {
    return EDGES.map(([a, b]) => {
      const points = [
        new THREE.Vector3(...CLUSTER_POSITIONS[a]),
        new THREE.Vector3(...CLUSTER_POSITIONS[b]),
      ];
      return new THREE.BufferGeometry().setFromPoints(points);
    });
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const p = progressRef.current;

    // Lines reveal from Scene 04 (patterns) through to Scene 17 (final world)
    const visibility = THREE.MathUtils.smoothstep(p, 0.20, 0.28);
    const mapAttenuation = 1 - THREE.MathUtils.smoothstep(p, 0.70, 0.77);

    linesRef.current.forEach((line, i) => {
      if (!line) return;
      const mat = line.material as THREE.LineBasicMaterial;
      // Staggered appearance per line
      const delay = i * 0.02;
      const lineVis = THREE.MathUtils.smoothstep(p, 0.20 + delay, 0.30 + delay);

      // White space & opportunity — education-community connection pulses
      const isOpportunityLine = i === 0 || i === 13; // EDUCATION↔COMMUNITY
      const oppFactor = THREE.MathUtils.smoothstep(p, 0.65, 0.72) * (1 - THREE.MathUtils.smoothstep(p, 0.84, 0.90));
      const basePulse = isOpportunityLine ? (0.1 + 0.5 * Math.sin(Date.now() * 0.003)) * oppFactor : 0;

      mat.opacity = lineVis * (isOpportunityLine ? (0.15 + basePulse) : 0.09) * mapAttenuation;
    });

    const s = Math.max(0.001, visibility);
    groupRef.current.scale.set(s, s, s);
  });

  return (
    <group ref={groupRef}>
      {lineGeometries.map((geo, i) => (
        <line
          key={i}
          ref={(el) => { linesRef.current[i] = el as THREE.Line; }}
          geometry={geo}
        >
          <lineBasicMaterial
          color={i === 0 || i === 13 ? '#b8ce72' : '#30312e'}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </line>
      ))}
    </group>
  );
};
