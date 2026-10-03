import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { CAMPAIGN_PILLARS } from '../data/intelligenceData';

interface CampaignGenerator3DProps {
  progressRef: React.MutableRefObject<number>;
}

const PILLAR_COLORS = ['#c8a873', '#b8ce72', '#c5bca8', '#8e8b84'];
const PILLAR_PAPER = ['#ded5c5', '#d3c9b8', '#e3dacb', '#cec4b3'];

export const CampaignGenerator3D: React.FC<CampaignGenerator3DProps> = ({ progressRef }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const p = progressRef.current;
    const visibility = THREE.MathUtils.smoothstep(p, 0.79, 0.83) * (1 - THREE.MathUtils.smoothstep(p, 0.875, 0.91));
    groupRef.current.visible = visibility > 0.01;
    const branchFactor = THREE.MathUtils.smoothstep(p, 0.78, 0.825);
    groupRef.current.children.forEach((child, index) => {
      if (child instanceof THREE.Group && index > 0) {
        const pillarIndex = index - 1;
        child.position.x = (pillarIndex % 2 === 0 ? -1.45 : 1.45) * branchFactor;
        child.position.y = (pillarIndex < 2 ? 1.55 : -1.55) * branchFactor;
        child.scale.x = THREE.MathUtils.lerp(0.3, 1, branchFactor);
        child.scale.y = THREE.MathUtils.lerp(0.3, 1, branchFactor);
      }
    });
    const scale = THREE.MathUtils.lerp(0.01, 1, visibility);
    groupRef.current.scale.set(scale, scale, scale);
  });

  return (
    <group ref={groupRef} position={[2.4, 0.75, -10]}>
      <group position={[0, 3.2, 0]}>
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[0.9, 0.025, 0.02]} />
          <meshBasicMaterial color="#c8a873" />
        </mesh>
        <Text position={[0, 0.08, 0]} fontSize={0.16} color="#b8ce72" anchorX="center" anchorY="middle" letterSpacing={0.08}>
          SIGNAL → CAMPAIGN SYSTEM
        </Text>
        <Text position={[0, -0.08, 0]} fontSize={0.28} color="#f2eee4" anchorX="center" anchorY="middle">
          Make the thinking visible
        </Text>
      </group>

      {CAMPAIGN_PILLARS.map((pillar, pillarIndex) => {
        const accent = PILLAR_COLORS[pillarIndex % PILLAR_COLORS.length];
        return (
          <group key={pillar.number} position={[0, 0, 0]}>
            <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
              <boxGeometry args={[2.6, 2.75, 0.08]} />
            <meshStandardMaterial color={PILLAR_PAPER[pillarIndex]} roughness={0.94} metalness={0} />
            </mesh>
            <mesh position={[-1.24, -0.2, 0.055]}>
              <boxGeometry args={[0.035, 2.68, 0.018]} />
              <meshBasicMaterial color={accent} />
            </mesh>
            <Text position={[-1.23, 1.02, 0.06]} fontSize={0.1} color={accent} anchorX="left" anchorY="middle">
              {`PILLAR ${pillar.number} / ${pillar.cadence.toUpperCase()}`}
            </Text>
            <Text position={[-1.23, 0.72, 0.06]} fontSize={0.16} color="#171817" anchorX="left" anchorY="middle" maxWidth={2.2}>
              {pillar.title}
            </Text>
            <Text position={[-1.23, 0.39, 0.06]} fontSize={0.095} color="#55534d" anchorX="left" anchorY="middle" maxWidth={2.2}>
              {pillar.format.toUpperCase()}
            </Text>
            {pillar.ideas.map((idea, index) => (
              <group key={idea} position={[0, 0.08 - index * 0.52, 0.06]}>
                <mesh position={[-1.12, 0.1, 0]}>
                  <boxGeometry args={[0.13, 0.025, 0.012]} />
                  <meshBasicMaterial color={accent} transparent opacity={0.8} />
                </mesh>
                <Text position={[-0.98, 0.1, 0.01]} fontSize={0.1} color="#292a27" anchorX="left" anchorY="middle" maxWidth={1.88}>
                  {idea}
                </Text>
              </group>
            ))}
          </group>
        );
      })}
    </group>
  );
};
