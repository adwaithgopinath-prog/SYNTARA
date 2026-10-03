import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONTENT_OBJECTS } from '../data/intelligenceData';
import { ContentObject } from '../types';

interface ContentObjectsFieldProps {
  progressRef: React.MutableRefObject<number>;
  onSelectObject: (obj: ContentObject) => void;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  contentObjects?: ContentObject[];
}

const FORMAT_COLORS: Record<string, string> = {
  Reel: '#ae563b',
  Carousel: '#b9ad99',
  Post: '#9aaa76',
  Video: '#9d7565',
  Article: '#d0c8b8',
  Story: '#858c7f',
};

const FORMAT_SIZES: Record<string, [number, number]> = {
  Reel: [0.75, 1.35],
  Carousel: [1.3, 0.88],
  Post: [1, 1],
  Video: [0.86, 1.23],
  Article: [1.35, 1.08],
  Story: [0.68, 1.28],
};

export const ContentObjectsField: React.FC<ContentObjectsFieldProps> = ({
  progressRef,
  onSelectObject,
  hoveredId,
  setHoveredId,
  contentObjects = CONTENT_OBJECTS,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const detailRef = useRef<THREE.InstancedMesh>(null);
  const detailLineRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const detailDummy = useMemo(() => new THREE.Object3D(), []);
  const markOffset = useMemo(() => new THREE.Vector3(), []);
  const colorHelper = useMemo(() => new THREE.Color(), []);
  const detailColorHelper = useMemo(() => new THREE.Color(), []);
  const darkenedColor = useMemo(() => new THREE.Color('#292a27'), []);
  const faceInk = useMemo(() => new THREE.Color('#f2eee4'), []);
  const formatColors = useMemo(
    () => Object.fromEntries(Object.entries(FORMAT_COLORS).map(([format, color]) => [format, new THREE.Color(color)])),
    [],
  );
  const plateGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.48, -0.5);
    shape.lineTo(0.37, -0.5);
    shape.lineTo(0.5, -0.37);
    shape.lineTo(0.5, 0.5);
    shape.lineTo(-0.37, 0.5);
    shape.lineTo(-0.5, 0.37);
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.055,
      bevelEnabled: true,
      bevelSegments: 1,
      bevelSize: 0.014,
      bevelThickness: 0.012,
      curveSegments: 1,
    });
    geometry.translate(0, 0, -0.035);
    return geometry;
  }, []);

  useFrame((state) => {
    if (!meshRef.current || !detailRef.current || !detailLineRef.current) return;
    const p = progressRef.current;
    const time = state.clock.getElapsedTime();
    const marketField = 1 - THREE.MathUtils.smoothstep(p, 0.27, 0.30);
    const signalField = THREE.MathUtils.smoothstep(p, 0.38, 0.43) *
      (1 - THREE.MathUtils.smoothstep(p, 0.52, 0.58));
    const fieldVisibility = Math.max(marketField, signalField);
    if (groupRef.current) {
      groupRef.current.visible = fieldVisibility > 0.01;
      groupRef.current.scale.setScalar(1);
    }
    (meshRef.current.material as THREE.MeshStandardMaterial).opacity = fieldVisibility;
    (detailRef.current.material as THREE.MeshStandardMaterial).opacity = fieldVisibility;
    (detailLineRef.current.material as THREE.MeshStandardMaterial).opacity = fieldVisibility;
    const clusterFactor = THREE.MathUtils.smoothstep(p, 0.18, 0.28);
    const filterFactor = THREE.MathUtils.smoothstep(p, 0.44, 0.52);

    for (let i = 0; i < contentObjects.length; i++) {
      const item = contentObjects[i];
      const [formatWidth, formatHeight] = FORMAT_SIZES[item.format] || FORMAT_SIZES.Post;
      const isHovered = hoveredId === item.id;
      const x = THREE.MathUtils.lerp(item.initialPos[0], item.clusterPos[0], clusterFactor);
      const y = THREE.MathUtils.lerp(item.initialPos[1], item.clusterPos[1], clusterFactor) + Math.sin(time * 1.5 + i) * 0.075;
      const z = THREE.MathUtils.lerp(item.initialPos[2], item.clusterPos[2], clusterFactor);
      dummy.position.set(x, y, z);

      if (clusterFactor < 0.9) {
        dummy.rotation.set(
          Math.sin(time * 0.5 + i) * 0.22 * (1 - clusterFactor),
          Math.cos(time * 0.4 + i) * 0.28 * (1 - clusterFactor),
          Math.sin(i * 1.3) * 0.12 * (1 - clusterFactor),
        );
      } else {
        dummy.rotation.set(0, 0, 0);
      }

      let scale = isHovered ? 1.55 : 1;
      if (!isHovered && filterFactor > 0.01) {
        scale = item.highlighted
          ? THREE.MathUtils.lerp(1, 1.2, filterFactor)
          : THREE.MathUtils.lerp(1, 0.46, filterFactor);
      }
      const chaosScale = THREE.MathUtils.smoothstep(p, 0.10, 0.15) * (1 - THREE.MathUtils.smoothstep(p, 0.20, 0.25));
      scale += chaosScale * 0.2;
      const organizedScale = THREE.MathUtils.lerp(1, 0.36, clusterFactor);
      dummy.scale.set(scale * formatWidth * organizedScale, scale * formatHeight * organizedScale, scale * organizedScale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      colorHelper.copy(formatColors[item.format] || formatColors.Article);
      if (isHovered) colorHelper.set('#f2eee4');
      else if (filterFactor > 0.1 && !item.highlighted) colorHelper.lerp(darkenedColor, filterFactor * 0.8);
      else if (item.highlighted && filterFactor > 0.1) colorHelper.set('#c8a873');
      meshRef.current.setColorAt(i, colorHelper);

      // A small editorial imprint makes each signal read as published material,
      // while its format still controls the underlying silhouette.
      markOffset.set(-formatWidth * 0.31 * scale * organizedScale, formatHeight * 0.03 * scale * organizedScale, 0.06 * scale * organizedScale).applyEuler(dummy.rotation);
      detailDummy.position.set(x + markOffset.x, y + markOffset.y, z + markOffset.z);
      detailDummy.rotation.copy(dummy.rotation);
      detailDummy.scale.set(formatWidth * 0.035 * scale * organizedScale, formatHeight * 0.4 * scale * organizedScale, scale * organizedScale);
      detailDummy.updateMatrix();
      detailColorHelper.copy(colorHelper).lerp(faceInk, 0.54);
      detailRef.current.setMatrixAt(i, detailDummy.matrix);
      detailRef.current.setColorAt(i, detailColorHelper);

      markOffset.set(formatWidth * 0.035 * scale * organizedScale, formatHeight * 0.25 * scale * organizedScale, 0.06 * scale * organizedScale).applyEuler(dummy.rotation);
      detailDummy.position.set(x + markOffset.x, y + markOffset.y, z + markOffset.z);
      detailDummy.scale.set(formatWidth * 0.36 * scale * organizedScale, formatHeight * 0.045 * scale * organizedScale, scale * organizedScale);
      detailDummy.updateMatrix();
      detailColorHelper.copy(colorHelper).lerp(faceInk, 0.38);
      detailLineRef.current.setMatrixAt(i * 2, detailDummy.matrix);
      detailLineRef.current.setColorAt(i * 2, detailColorHelper);

      markOffset.set(0, -formatHeight * 0.13 * scale * organizedScale, 0.06 * scale * organizedScale).applyEuler(dummy.rotation);
      detailDummy.position.set(x + markOffset.x, y + markOffset.y, z + markOffset.z);
      detailDummy.scale.set(formatWidth * (0.22 + (i % 3) * 0.06) * scale * organizedScale, formatHeight * 0.035 * scale * organizedScale, scale * organizedScale);
      detailDummy.updateMatrix();
      detailLineRef.current.setMatrixAt(i * 2 + 1, detailDummy.matrix);
      detailLineRef.current.setColorAt(i * 2 + 1, detailColorHelper);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    detailRef.current.instanceMatrix.needsUpdate = true;
    detailLineRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    if (detailRef.current.instanceColor) detailRef.current.instanceColor.needsUpdate = true;
    if (detailLineRef.current.instanceColor) detailLineRef.current.instanceColor.needsUpdate = true;
  });

  const interactionHandlers = {
    onClick: (e: any) => {
      e.stopPropagation();
      if (e.instanceId !== undefined && contentObjects[e.instanceId]) onSelectObject(contentObjects[e.instanceId]);
    },
    onPointerOver: (e: any) => {
      e.stopPropagation();
      if (e.instanceId !== undefined && contentObjects[e.instanceId]) setHoveredId(contentObjects[e.instanceId].id);
    },
    onPointerOut: () => setHoveredId(null),
  };

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[plateGeometry, undefined, contentObjects.length]} castShadow receiveShadow {...interactionHandlers}>
        <meshStandardMaterial roughness={0.82} metalness={0.04} transparent opacity={1} />
      </instancedMesh>
      <instancedMesh ref={detailRef} args={[undefined, undefined, contentObjects.length]} raycast={() => null}>
        <boxGeometry args={[1, 1, 0.025]} />
        <meshStandardMaterial roughness={0.9} metalness={0.02} transparent opacity={1} />
      </instancedMesh>
      <instancedMesh ref={detailLineRef} args={[undefined, undefined, contentObjects.length * 2]} raycast={() => null}>
        <boxGeometry args={[1, 1, 0.025]} />
        <meshStandardMaterial roughness={0.9} metalness={0.02} transparent opacity={1} />
      </instancedMesh>
    </group>
  );
};
