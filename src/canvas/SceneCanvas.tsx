import React from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraController } from './CameraController';
import { UniverseEnvironment } from './UniverseEnvironment';
import { ContentObjectsField } from './ContentObjectsField';
import { ClustersVisualizer } from './ClustersVisualizer';
import { CompetitorStructures } from './CompetitorStructures';
import { CreativeDnaExploded } from './CreativeDnaExploded';
import { OpportunityZone } from './OpportunityZone';
import { CampaignGenerator3D } from './CampaignGenerator3D';
import { Calendar3D } from './Calendar3D';
import { LearningLoop3D } from './LearningLoop3D';
import { CreativeStudio3D } from './CreativeStudio3D';
import { ConnectionLines } from './ConnectionLines';
import { ContentObject, CompetitorData, ClusterTheme } from '../types';
import { CLUSTERS, COMPETITORS, CONTENT_OBJECTS } from '../data/intelligenceData';

interface SceneCanvasProps {
  progressRef: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
  onSelectObject: (obj: ContentObject) => void;
  onSelectCompetitor: (comp: CompetitorData) => void;
  onSelectCluster: (cluster: ClusterTheme) => void;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  hoveredCompId: string | null;
  setHoveredCompId: (id: string | null) => void;
  contentObjects?: ContentObject[];
  competitors?: CompetitorData[];
  clusters?: ClusterTheme[];
}

export const SceneCanvas: React.FC<SceneCanvasProps> = ({
  progressRef,
  mouseRef,
  onSelectObject,
  onSelectCompetitor,
  onSelectCluster,
  hoveredId,
  setHoveredId,
  hoveredCompId,
  setHoveredCompId,
  contentObjects = CONTENT_OBJECTS,
  competitors = COMPETITORS,
  clusters = CLUSTERS
}) => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-auto z-0 overflow-hidden">
      <Canvas
        shadows
        dpr={[1, Math.min(window.devicePixelRatio, 1.8)]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
        }}
        camera={{ position: [0, 1.8, 14], fov: 48, near: 0.1, far: 300 }}
        frameloop="always"
      >
        <color attach="background" args={['#0b0c0d']} />

        <React.Suspense fallback={null}>
          <CameraController progressRef={progressRef} mouseRef={mouseRef} />
          <UniverseEnvironment progressRef={progressRef} />

          {/* Relationships between observed themes stay visible as the story unfolds. */}
          <ConnectionLines progressRef={progressRef} />

          {/* Core Narrative Objects */}
          <ContentObjectsField
            progressRef={progressRef}
            onSelectObject={onSelectObject}
            hoveredId={hoveredId}
            setHoveredId={setHoveredId}
            contentObjects={contentObjects}
          />

          <ClustersVisualizer
            progressRef={progressRef}
            onSelectCluster={onSelectCluster}
            clusters={clusters}
          />

          <CompetitorStructures
            progressRef={progressRef}
            onSelectCompetitor={onSelectCompetitor}
            hoveredCompId={hoveredCompId}
            setHoveredCompId={setHoveredCompId}
            competitors={competitors}
          />

          <CreativeDnaExploded progressRef={progressRef} />
          <OpportunityZone progressRef={progressRef} />
          <CampaignGenerator3D progressRef={progressRef} />
          <CreativeStudio3D progressRef={progressRef} />
          <Calendar3D progressRef={progressRef} />
          <LearningLoop3D progressRef={progressRef} />
        </React.Suspense>
      </Canvas>
    </div>
  );
};
