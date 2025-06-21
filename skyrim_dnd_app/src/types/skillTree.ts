export type NodeColor = 'red' | 'green' | 'blue';
export type NodeTier = 1 | 2 | 3 | 4 | 5;

export interface Prerequisite {
  id: string;
  points: number;
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  color: NodeColor;
  tier: NodeTier;
  cost: number;
  hpBonus: number;
  position: { x: number; y: number };
  prerequisites?: Prerequisite[];
  requirements?: {
    red?: number;
    green?: number;
    blue?: number;
  };
}

export interface CharacterState {
  points: {
    red: number;
    green: number;
    blue: number;
  };
  hp: number;
  maxHp: number;
  resources: {
    adrenaline: number;
    maxAdrenaline: number;
    mana: number;
    maxMana: number;
    stamina: number;
    maxStamina: number;
  };
  activeNodes: string[];
  nodePoints: Record<string, number>;
  abilities: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  level: number;
  ac: number;
  useDexForAC: boolean;
}

export interface SkillTreeState {
  nodes: SkillNode[];
  edges: {
    id: string;
    source: string;
    target: string;
  }[];
  character: CharacterState;
} 