import { create } from 'zustand';
import type { SkillTreeState, CharacterState, SkillNode } from '../types/skillTree';

interface SkillTreeStore extends SkillTreeState {
  addNode: (node: SkillNode) => void;
  addEdge: (source: string, target: string) => void;
  investPoint: (nodeId: string) => void;
  removePoint: (nodeId: string) => void;
  updateCharacter: (character: Partial<CharacterState>) => void;
  saveCharacter: () => void;
  loadCharacter: () => void;
  incrementAbility: (ability: AbilityKey) => void;
  decrementAbility: (ability: AbilityKey) => void;
  incrementLevel: () => void;
  decrementLevel: () => void;
  incrementAC: () => void;
  decrementAC: () => void;
  toggleUseDexForAC: () => void;
}

const ABILITY_MIN = 8;
const ABILITY_MAX = 20;
const POINT_BUY_TOTAL = 50;
const ABILITY_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
};

const LEVEL_MIN = 1;
const LEVEL_MAX = 20;
const AC_MIN = 0;

const initialState: SkillTreeState = {
  nodes: [],
  edges: [],
  character: {
    points: {
      red: 0,
      green: 0,
      blue: 0,
    },
    hp: 0,
    maxHp: 0,
    resources: {
      adrenaline: 0,
      maxAdrenaline: 0,
      mana: 0,
      maxMana: 0,
      stamina: 0,
      maxStamina: 0,
    },
    activeNodes: [],
    nodePoints: {},
    abilities: {
      str: 8,
      dex: 8,
      con: 8,
      int: 8,
      wis: 8,
      cha: 8,
    },
    level: 1,
    ac: 10,
    useDexForAC: true,
  },
};

function prerequisitesMet(node: SkillNode, nodes: SkillNode[], nodePoints: Record<string, number>): boolean {
  if (!node.prerequisites || node.prerequisites.length === 0) return true;
  return node.prerequisites.every(prereq => {
    const prereqNode = nodes.find(n => n.id === prereq.id);
    return prereqNode && (nodePoints[prereq.id] || 0) >= prereq.points;
  });
}

// Helper to calculate total point buy cost
function getPointBuyTotal(abilities: Record<string, number>) {
  return Object.values(abilities).reduce((sum, val) => sum + ABILITY_COSTS[val], 0);
}

type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export const useSkillTreeStore = create<SkillTreeStore>((set, get) => ({
  ...initialState,

  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, node],
  })),

  addEdge: (source, target) => set((state) => ({
    edges: [...state.edges, { id: `${source}-${target}`, source, target }],
  })),

  investPoint: (nodeId) => {
    const state = get();
    const node = state.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // ENFORCE PREREQUISITES
    if (!prerequisitesMet(node, state.nodes, state.character.nodePoints)) return;

    // ENFORCE SKILL POINTS
    const totalSpent = Object.values(state.character.nodePoints).reduce((sum, val) => sum + val, 0);
    const availableSkillPoints = state.character.level * 5 - totalSpent;
    if (availableSkillPoints < node.cost) return;

    const currentPoints = state.character.nodePoints[nodeId] || 0;
    const color = node.color;
    const cost = node.cost;

    set((state) => ({
      character: {
        ...state.character,
        points: {
          ...state.character.points,
          [color]: state.character.points[color] + cost,
        },
        nodePoints: {
          ...state.character.nodePoints,
          [nodeId]: currentPoints + cost,
        },
        maxHp: state.character.maxHp + node.hpBonus * cost,
        hp: state.character.hp + node.hpBonus * cost,
      },
    }));
  },

  removePoint: (nodeId) => {
    const state = get();
    const node = state.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const currentPoints = state.character.nodePoints[nodeId] || 0;
    const color = node.color;
    const cost = node.cost;
    if (currentPoints < cost) return;

    // Helper to recursively remove points from dependents
    function removeDependents(nodeIdToCheck: string, draft: typeof state.character) {
      // Find all nodes that have this node as a prerequisite
      state.nodes.forEach((n) => {
        if (n.prerequisites && n.prerequisites.some((p) => p.id === nodeIdToCheck)) {
          // If this node no longer meets prerequisites and has points, remove all its points
          const meets = !n.prerequisites || n.prerequisites.every((p) => (draft.nodePoints[p.id] || 0) >= p.points);
          const nodePoints = draft.nodePoints[n.id] || 0;
          if (!meets && nodePoints > 0) {
            // Remove all points from this node
            draft.points[n.color] -= nodePoints;
            draft.maxHp -= n.hpBonus * nodePoints;
            draft.hp = Math.min(draft.hp, draft.maxHp);
            draft.nodePoints[n.id] = 0;
            // Recursively remove from its dependents
            removeDependents(n.id, draft);
          }
        }
      });
    }

    set((state) => {
      // Remove points from the node
      const newCharacter = { ...state.character };
      newCharacter.points = { ...newCharacter.points, [color]: newCharacter.points[color] - cost };
      newCharacter.nodePoints = { ...newCharacter.nodePoints, [nodeId]: currentPoints - cost };
      newCharacter.maxHp = newCharacter.maxHp - node.hpBonus * cost;
      newCharacter.hp = Math.min(newCharacter.hp, newCharacter.maxHp);
      // Recursively remove points from dependents if needed
      removeDependents(nodeId, newCharacter);
      return { character: newCharacter };
    });
  },

  updateCharacter: (character) => set((state) => ({
    character: { ...state.character, ...character },
  })),

  saveCharacter: () => {
    const state = get();
    localStorage.setItem('skillTreeCharacter', JSON.stringify(state.character));
  },

  loadCharacter: () => {
    const savedCharacter = localStorage.getItem('skillTreeCharacter');
    if (savedCharacter) {
      set((state) => ({
        character: JSON.parse(savedCharacter),
      }));
    }
  },

  incrementAbility: (ability: AbilityKey) => {
    set((state) => {
      const current = state.character.abilities[ability];
      if (current >= ABILITY_MAX) return {};
      const newVal = current + 1;
      const newAbilities = { ...state.character.abilities, [ability]: newVal };
      if (getPointBuyTotal(newAbilities) > POINT_BUY_TOTAL) return {};
      return { character: { ...state.character, abilities: newAbilities } };
    });
  },
  decrementAbility: (ability: AbilityKey) => {
    set((state) => {
      const current = state.character.abilities[ability];
      if (current <= ABILITY_MIN) return {};
      const newVal = current - 1;
      const newAbilities = { ...state.character.abilities, [ability]: newVal };
      return { character: { ...state.character, abilities: newAbilities } };
    });
  },

  incrementLevel: () => {
    set((state) => {
      if (state.character.level >= LEVEL_MAX) return {};
      return { character: { ...state.character, level: state.character.level + 1 } };
    });
  },
  decrementLevel: () => {
    set((state) => {
      if (state.character.level <= LEVEL_MIN) return {};
      return { character: { ...state.character, level: state.character.level - 1 } };
    });
  },
  incrementAC: () => {
    set((state) => ({ character: { ...state.character, ac: state.character.ac + 1 } }));
  },
  decrementAC: () => {
    set((state) => {
      if (state.character.ac <= AC_MIN) return {};
      return { character: { ...state.character, ac: state.character.ac - 1 } };
    });
  },

  toggleUseDexForAC: () => {
    set((state) => ({ character: { ...state.character, useDexForAC: !state.character.useDexForAC } }));
  },
})); 