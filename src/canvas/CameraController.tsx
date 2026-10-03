import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraWaypoint {
  progress: number;
  pos: [number, number, number];
  target: [number, number, number];
  fov?: number;
}

const WAYPOINTS: CameraWaypoint[] = [
  { progress: 0.00, pos: [0, 1.8, 14], target: [0, 0.5, -15], fov: 48 },   // 01 Market
  { progress: 0.07, pos: [0, 1.3, 5], target: [0, 0.8, -18], fov: 48 },    // 02 Content
  { progress: 0.16, pos: [0, 0.2, -12], target: [0, -0.2, -35], fov: 55 }, // 03 Chaos
  { progress: 0.24, pos: [0, 6, -10], target: [0, 0, -25], fov: 50 },      // 04 Intelligence
  { progress: 0.32, pos: [-6, 2.5, -12], target: [-9, 1.5, -18], fov: 45 },// 05 Competitors
  { progress: 0.40, pos: [-8, 1.8, -15], target: [-9.5, 1.5, -18], fov: 42 },// 06 Competitor Move
  { progress: 0.48, pos: [-3, 3, -14], target: [-8, 2, -22], fov: 46 },    // 07 Signal Detection
  { progress: 0.56, pos: [4.5, 2.4, 12], target: [0, 0.4, 0], fov: 44 }, // 08 Creative DNA (hero focus)
  { progress: 0.64, pos: [0, 19, 7], target: [0, -1, -24], fov: 54 },      // 09 Market Landscape
  { progress: 0.71, pos: [-5, 4, -18], target: [-7, 2, -25], fov: 44 },    // 10 White Space
  // Lift the camera into a clear survey angle so the convergence map reads as a
  // designed terrain plate, with enough perspective to keep the next move in view.
  { progress: 0.77, pos: [-3.5, 8, -16], target: [-4.5, 1.45, -28], fov: 44 },// 11 Opportunity
  { progress: 0.83, pos: [0, 3, -2], target: [0, 1, -12], fov: 52 },       // 12 Campaign Gen
  { progress: 0.88, pos: [0, 1.5, -4], target: [0, 0.8, -14], fov: 48 },   // 13 Marketing Autopilot
  { progress: 0.93, pos: [0, 2.5, 4], target: [0, 0.5, -5], fov: 45 },     // 14 Content Calendar
  { progress: 0.96, pos: [0, 1.8, 1], target: [0, 1, -15], fov: 48 },      // 15 Results
  { progress: 0.98, pos: [0, 5, 2], target: [0, 0, -10], fov: 50 },        // 16 Learning Loop
  { progress: 1.00, pos: [0, 9, 18], target: [0, 0, -15], fov: 52 },       // 17 Final World
];

interface CameraControllerProps {
  progressRef: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}

export const CameraController: React.FC<CameraControllerProps> = ({ progressRef, mouseRef }) => {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 1.8, 14));
  const currentTarget = useRef(new THREE.Vector3(0, 0.5, -15));
  const tempPos = useRef(new THREE.Vector3());
  const tempTarget = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const p = THREE.MathUtils.clamp(progressRef.current, 0, 1);

    // Find the two surrounding waypoints
    let idx = 0;
    while (idx < WAYPOINTS.length - 1 && WAYPOINTS[idx + 1].progress <= p) {
      idx++;
    }

    const p0 = WAYPOINTS[idx];
    const p1 = WAYPOINTS[Math.min(idx + 1, WAYPOINTS.length - 1)];

    const segmentSpan = Math.max(0.0001, p1.progress - p0.progress);
    const tRaw = (p - p0.progress) / segmentSpan;
    // Smooth cubic hermite ease between waypoints
    const t = THREE.MathUtils.smoothstep(tRaw, 0, 1);

    tempPos.current.set(
      THREE.MathUtils.lerp(p0.pos[0], p1.pos[0], t),
      THREE.MathUtils.lerp(p0.pos[1], p1.pos[1], t),
      THREE.MathUtils.lerp(p0.pos[2], p1.pos[2], t)
    );

    tempTarget.current.set(
      THREE.MathUtils.lerp(p0.target[0], p1.target[0], t),
      THREE.MathUtils.lerp(p0.target[1], p1.target[1], t),
      THREE.MathUtils.lerp(p0.target[2], p1.target[2], t)
    );

    // Add subtle mouse parallax (damping factor)
    const mx = mouseRef.current.x * 0.45;
    const my = mouseRef.current.y * 0.3;
    tempPos.current.x += mx;
    tempPos.current.y += my;

    // Smoothly interpolate current camera towards target with framerate-independent lerp
    const lerpSpeed = Math.min(1, delta * 3.5);
    currentPos.current.lerp(tempPos.current, lerpSpeed);
    currentTarget.current.lerp(tempTarget.current, lerpSpeed);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentTarget.current);

    if (camera instanceof THREE.PerspectiveCamera) {
      const authoredFov = THREE.MathUtils.lerp(p0.fov || 48, p1.fov || 48, t);
      const aspectCompensation = THREE.MathUtils.clamp(1.45 / camera.aspect, 1, 1.9);
      const targetFov = THREE.MathUtils.clamp(authoredFov * aspectCompensation, 40, 82);
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, lerpSpeed);
      camera.updateProjectionMatrix();
    }
  });

  return null;
};
