export type NodeColor = 'red' | 'green' | 'blue';
export type NodeTier = 1 | 2 | 3 | 4 | 5;
export type PrerequisiteRelationship = 'AND' | 'OR';
export type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export interface Prerequisite {
  id: string;
  points: number;
}

export interface PrerequisitesGroup {
  prerequisites: Prerequisite[];
  relationship: PrerequisiteRelationship;
}

export interface NodeChoice {
  value: string;
  description: string;
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
  prerequisites?: PrerequisitesGroup[];
  requirements?: {
    red?: number;
    green?: number;
    blue?: number;
  };
  choices?: NodeChoice[]; // Optional: list of sub-choices for this node, with descriptions
}

// New types for trait effects
export interface AbilityModifier {
  ability: AbilityKey;
  modifier: number;
  source: string; // e.g., "race:human", "birthsign:warrior", "feat:athlete"
}

export interface SpecialAbility {
  id: string;
  name: string;
  description: string;
  source: string; // e.g., "race:elf", "birthsign:mage", "feat:alert"
  category: 'racial' | 'birthsign' | 'feat';
  effects?: {
    hpBonus?: number;
    manaBonus?: number;
    staminaBonus?: number;
    acBonus?: number;
    speedBonus?: number;
    darkvision?: boolean;
    resistance?: string[];
    proficiency?: string[];
    [key: string]: any; // Allow for custom effects
  };
}

export interface TraitEffect {
  abilityModifiers?: AbilityModifier[];
  specialAbilities?: SpecialAbility[];
  freeNodePurchases?: { nodeId: string; points: number }[];
  description: string;
}

export interface Race {
  id: string;
  name: string;
  description: string;
  icon: string;
  effects: TraitEffect;
}

export interface Birthsign {
  id: string;
  name: string;
  description: string;
  icon: string;
  effects: TraitEffect;
}

export interface Feat {
  id: string;
  name: string;
  description: string;
  icon: string;
  benefits: string[];
  requirements: string[];
  effects: TraitEffect;
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
  freeNodePoints: Record<string, number>;
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
  race?: string;
  birthsign?: string;
  feats: string[];
  // New properties for calculated effects
  effectiveAbilities: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  specialAbilities: SpecialAbility[];
  nodeChoices?: Record<string, string>; // nodeId -> chosen option
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