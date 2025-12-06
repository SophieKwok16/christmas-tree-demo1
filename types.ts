export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE = 'TREE'
}

export interface DualPosition {
  x: number;
  y: number;
  z: number;
}

export interface ParticleData {
  scatterPos: DualPosition;
  treePos: DualPosition;
  scale: number;
  rotationSpeed: number;
  phase: number;
}
