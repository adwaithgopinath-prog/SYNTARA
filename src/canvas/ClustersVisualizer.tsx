import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { CLUSTERS } from '../data/intelligenceData';
import { ClusterTheme } from '../types';

interface ClustersVisualizerProps {
  progressRef: React.MutableRefObject<number>;
  onSelectCluster: (cluster: ClusterTheme) => void;
  clusters?: ClusterTheme[];
}

function territoryShape(name: string, scale = 1) {
  const seed = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const shape = new THREE.Shape();
  const sides = 48;
  for (let i = 0; i <= sides; i++) {
    const angle = (i / sides) * Math.PI * 2;
    const ripple = 1 + Math.sin(angle * 3 + seed) * 0.09 + Math.cos(angle * 5 + seed * 0.2) * 0.055;
    const x = Math.cos(angle) * 2.7 * ripple * scale;
    const y = Math.sin(angle) * 2.05 * ripple * scale;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  return shape;
}

const ClusterTerritory: React.FC<{ cluster: ClusterTheme; progressRef: React.MutableRefObject<number>; onSelectCluster: (cluster: ClusterTheme) => void }> = ({ cluster, progressRef, onSelectCluster }) => {
  const labelGroupRef = useRef<THREE.Group>(null);
  const territoryRef = useRef<THREE.Group>(null);
  const opportunity = Boolean(cluster.isOpportunity);
  const shape = useMemo(() => territoryShape(cluster.name), [cluster.name]);
  const boundaryShape = useMemo(() => territoryShape(cluster.name, 1.12), [cluster.name]);
  const contourGeometryOne = useMemo(() => new THREE.BufferGeometry().setFromPoints(
    territoryShape(cluster.name, 0.78).getPoints(48).map((p) => new THREE.Vector3(p.x, p.y, 0)),
  ), [cluster.name]);
  const contourGeometryTwo = useMemo(() => new THREE.BufferGeometry().setFromPoints(
    territoryShape(cluster.name, 0.54).getPoints(48).map((p) => new THREE.Vector3(p.x, p.y, 0)),
  ), [cluster.name]);

  useFrame(() => {
    if (!labelGroupRef.current) return;
    const p = progressRef.current;
    const patternLabels = THREE.MathUtils.smoothstep(p, 0.20, 0.22) * (1 - THREE.MathUtils.smoothstep(p, 0.28, 0.30));
    const mapLabels = THREE.MathUtils.smoothstep(p, 0.61, 0.63) * (1 - THREE.MathUtils.smoothstep(p, 0.67, 0.69));
    const opportunityLabels = opportunity ? THREE.MathUtils.smoothstep(p, 0.61, 0.63) * (1 - THREE.MathUtils.smoothstep(p, 0.72, 0.74)) : 0;
    labelGroupRef.current.visible = Math.max(patternLabels, mapLabels, opportunityLabels) > 0.01;
    if (territoryRef.current) {
      const soften = THREE.MathUtils.smoothstep(p, 0.70, 0.79);
      territoryRef.current.scale.setScalar(THREE.MathUtils.lerp(1, opportunity ? 0.62 : 0.28, soften));
    }
  });

  return (
    <group
      position={cluster.position}
      onClick={(e) => { e.stopPropagation(); onSelectCluster(cluster); }}
    >
      {/* Layered, uneven boundaries read as a market map instead of an icon field. */}
      <group ref={territoryRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} receiveShadow>
          <shapeGeometry args={[boundaryShape]} />
          <meshStandardMaterial color="#101211" roughness={0.96} metalness={0} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <shapeGeometry args={[shape]} />
          <meshStandardMaterial color={opportunity ? '#292b22' : '#20211f'} roughness={0.9} metalness={0.02} side={THREE.DoubleSide} />
        </mesh>
        <lineLoop geometry={contourGeometryOne} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
          <lineBasicMaterial color={cluster.color} transparent opacity={opportunity ? 0.72 : 0.38} />
        </lineLoop>
        <lineLoop geometry={contourGeometryTwo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <lineBasicMaterial color="#aaa69c" transparent opacity={0.16} />
        </lineLoop>

      {/* Small publication bars indicate occupied ground; the open territory stays legible. */}
      {Array.from({ length: 5 }, (_, index) => {
        const x = Math.sin(index * 3.1 + cluster.marketShare) * 1.7;
        const z = Math.cos(index * 2.4 + cluster.brandShare) * 1.1;
        const height = 0.12 + ((index + cluster.itemCount) % 4) * 0.07;
        return (
          <mesh key={index} position={[x, height / 2 + 0.055, z]} castShadow receiveShadow>
            <boxGeometry args={[0.48 + (index % 2) * 0.2, height, 0.13]} />
            <meshStandardMaterial color={index === 0 && opportunity ? '#c8a873' : cluster.color} roughness={0.74} metalness={0.03} />
          </mesh>
        );
      })}
      <mesh position={[-1.25, 0.04, -1.55]}>
        <boxGeometry args={[0.9, 0.018, 0.02]} />
        <meshBasicMaterial color={cluster.color} transparent opacity={0.8} />
      </mesh>
      </group>
      <group ref={labelGroupRef}>
        <Text position={[0, 1.38, 0]} fontSize={0.31} color="#f2eee4" anchorX="center" anchorY="middle" maxWidth={5}>
          {cluster.name}
        </Text>
        <Text position={[0, 1.02, 0]} fontSize={0.15} color="#aaa69c" anchorX="center" anchorY="middle">
          {`${cluster.marketShare}% MARKET · ${cluster.brandShare}% BRAND`}
        </Text>
        {opportunity && (
          <Text position={[0, 1.72, 0]} fontSize={0.12} color="#b8ce72" anchorX="center" anchorY="middle">
            UNDER-SERVED TERRITORY
          </Text>
        )}
      </group>
    </group>
  );
};

export const ClustersVisualizer: React.FC<ClustersVisualizerProps> = ({ progressRef, onSelectCluster, clusters = CLUSTERS }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const visibility = THREE.MathUtils.smoothstep(progressRef.current, 0.19, 0.26);
    groupRef.current.position.y = THREE.MathUtils.lerp(-6, 0, visibility);
    groupRef.current.scale.set(1, 1, 1);
  });

  return (
    <group ref={groupRef}>
      {clusters.map((cluster) => (
        <ClusterTerritory key={cluster.name} cluster={cluster} progressRef={progressRef} onSelectCluster={onSelectCluster} />
      ))}
    </group>
  );
};
