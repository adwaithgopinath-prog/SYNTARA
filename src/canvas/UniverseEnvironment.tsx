import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface UniverseEnvironmentProps {
  progressRef: React.MutableRefObject<number>;
}

export const UniverseEnvironment: React.FC<UniverseEnvironmentProps> = ({ progressRef }) => {
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const accentLightRef = useRef<THREE.PointLight>(null);
  const opportunityLightRef = useRef<THREE.PointLight>(null);
  const fogRef = useRef<THREE.FogExp2>(null);
  const gridRef = useRef<THREE.GridHelper>(null);

  // Evolving colors
  const darkInk = new THREE.Color('#0b0c0d');
  const signalWarmth = new THREE.Color('#120f0e');
  const opportunityGlowColor = new THREE.Color('#13140f');
  const campaignGlowColor = new THREE.Color('#101211');

  useFrame(() => {
    const p = progressRef.current;

    if (ambientLightRef.current) {
      // Evolving ambient intensity: 0.6 -> 0.9 depending on chapter
      const intensity = THREE.MathUtils.lerp(0.55, 0.95, Math.sin(p * Math.PI));
      ambientLightRef.current.intensity = intensity;
    }

    if (keyLightRef.current) {
      // Move keylight slightly to cast dynamic subtle shadows
      keyLightRef.current.position.set(
        Math.sin(p * Math.PI * 2) * 20,
        25,
        -15 + Math.cos(p * Math.PI * 2) * 10
      );
    }

    if (accentLightRef.current) {
      // Light up during competitor movement & signal detection (0.35 - 0.55)
      const signalFactor = THREE.MathUtils.smoothstep(p, 0.32, 0.42) * (1 - THREE.MathUtils.smoothstep(p, 0.55, 0.65));
      accentLightRef.current.intensity = signalFactor * 4.5;
    }

    if (opportunityLightRef.current) {
      // Light up during white space & opportunity (0.65 - 0.85)
      const oppFactor = THREE.MathUtils.smoothstep(p, 0.65, 0.73) * (1 - THREE.MathUtils.smoothstep(p, 0.85, 0.92));
      opportunityLightRef.current.intensity = oppFactor * 5.0;
    }

    if (fogRef.current) {
      if (p < 0.35) {
        fogRef.current.color.lerp(darkInk, 0.05);
        fogRef.current.density = 0.016;
      } else if (p < 0.65) {
        fogRef.current.color.lerp(signalWarmth, 0.05);
        fogRef.current.density = 0.018;
      } else if (p < 0.85) {
        fogRef.current.color.lerp(opportunityGlowColor, 0.05);
        fogRef.current.density = 0.015;
      } else {
        fogRef.current.color.lerp(campaignGlowColor, 0.05);
        fogRef.current.density = 0.014;
      }
    }

    if (gridRef.current) {
      const opportunityFocus = THREE.MathUtils.smoothstep(p, 0.65, 0.72) *
        (1 - THREE.MathUtils.smoothstep(p, 0.82, 0.88));
      const materials = Array.isArray(gridRef.current.material)
        ? gridRef.current.material
        : [gridRef.current.material];
      materials.forEach((material) => {
        material.transparent = true;
        material.depthWrite = false;
        material.opacity = THREE.MathUtils.lerp(0.32, 0.11, opportunityFocus);
      });
    }
  });

  return (
    <>
      <fogExp2 ref={fogRef} attach="fog" args={['#0b0c0d', 0.016]} />
      <ambientLight ref={ambientLightRef} intensity={0.65} color="#d8d0c0" />
      <directionalLight
        ref={keyLightRef}
        position={[15, 25, 20]}
        intensity={1.2}
        color="#f2eee4"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={180}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />
      <directionalLight
        position={[-15, -10, -20]}
        intensity={0.28}
        color="#b8ce72"
      />

      {/* Narrative Accent Point Lights */}
      {/* Competitor / Signal Spotlight */}
      <pointLight
        ref={accentLightRef}
        position={[-10, 3, -18]}
        color="#c8a873"
        distance={25}
        intensity={0}
      />

      {/* White Space / Opportunity Spotlight */}
      <pointLight
        ref={opportunityLightRef}
        position={[-6, 4, -26]}
        color="#b8ce72"
        distance={30}
        intensity={0}
      />

      {/* Subtle Ground Datum Grid */}
      <group position={[0, -6, -20]}>
        <gridHelper ref={gridRef} args={[160, 40, '#343530', '#171918']} />
      </group>
    </>
  );
};
