import { create } from 'zustand';
import type { SkillTreeState, CharacterState, SkillNode, SpecialAbility } from '../types/skillTree';
import { races, birthsigns, feats } from '../data/traits';

type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

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
  setRace: (race: string) => void;
  setBirthsign: (birthsign: string) => void;
  setFeats: (feats: string[]) => void;
  toggleFeat: (featId: string) => void;
  getEffectiveAbilities: () => Record<AbilityKey, number>;
  getSpecialAbilities: () => SpecialAbility[];
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
    hp: 4,
    maxHp: 4,
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
    freeNodePoints: {},
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
    race: undefined,
    birthsign: undefined,
    feats: [],
    effectiveAbilities: {
      str: 8,
      dex: 8,
      con: 8,
      int: 8,
      wis: 8,
      cha: 8,
    },
    specialAbilities: [],
  },
};

// Helper to calculate resources based on skill tree points and trait bonuses
function calculateResources(
  characterPoints: Record<string, number>,
  specialAbilities: SpecialAbility[] = [],
  nodePoints: Record<string, number>
): {
  adrenaline: number;
  maxAdrenaline: number;
  mana: number;
  maxMana: number;
  stamina: number;
  maxStamina: number;
} {
  // Each resource is only the points in its specific node
  let adrenaline = nodePoints['adrenaline-1'] || 0;
  let mana = nodePoints['mana-regen-1'] || 0;
  let stamina = nodePoints['stamina-regen-1'] || 0;

  // Add bonuses from special abilities
  specialAbilities.forEach(ability => {
    if (ability.effects) {
      if (ability.effects.manaBonus) {
        mana += ability.effects.manaBonus;
      }
      if (ability.effects.staminaBonus) {
        stamina += ability.effects.staminaBonus;
      }
      // Add adrenalineBonus if you ever add it to traits
    }
  });

  // Debug log
  console.log('calculateResources nodePoints:', nodePoints);
  console.log('Adrenaline:', adrenaline, 'Mana:', mana, 'Stamina:', stamina);

  return {
    adrenaline,
    maxAdrenaline: adrenaline,
    mana,
    maxMana: mana,
    stamina,
    maxStamina: stamina,
  };
}

// Helper to calculate effective abilities with trait modifiers
function calculateEffectiveAbilities(character: CharacterState): Record<AbilityKey, number> {
  // Start with base abilities
  const effectiveAbilities: Record<AbilityKey, number> = { ...character.abilities };

  // Apply race modifiers
  if (character.race) {
    const raceData = races.find(r => r.id === character.race);
    if (raceData && raceData.effects.abilityModifiers) {
      raceData.effects.abilityModifiers.forEach(mod => {
        effectiveAbilities[mod.ability] += mod.modifier;
      });
    }
  }

  // Apply birthsign modifiers
  if (character.birthsign) {
    const birthsignData = birthsigns.find(b => b.id === character.birthsign);
    if (birthsignData && birthsignData.effects.abilityModifiers) {
      birthsignData.effects.abilityModifiers.forEach(mod => {
        effectiveAbilities[mod.ability] += mod.modifier;
      });
    }
  }

  // Apply feat modifiers
  if (character.feats && character.feats.length > 0) {
    character.feats.forEach(featId => {
      const featData = feats.find(f => f.id === featId);
      if (featData && featData.effects.abilityModifiers) {
        featData.effects.abilityModifiers.forEach(mod => {
          effectiveAbilities[mod.ability] += mod.modifier;
        });
      }
    });
  }

  return effectiveAbilities;
}

// Helper to calculate special abilities from traits
function calculateSpecialAbilities(character: CharacterState): SpecialAbility[] {
  const specialAbilities: SpecialAbility[] = [];

  if (character.race) {
    const raceData = races.find(r => r.id === character.race);
    if (raceData && raceData.effects.specialAbilities) {
      specialAbilities.push(...raceData.effects.specialAbilities);
    }
  }

  if (character.birthsign) {
    const birthsignData = birthsigns.find(b => b.id === character.birthsign);
    if (birthsignData && birthsignData.effects.specialAbilities) {
      specialAbilities.push(...birthsignData.effects.specialAbilities);
    }
  }

  if (character.feats && character.feats.length > 0) {
    character.feats.forEach(featId => {
      const featData = feats.find(f => f.id === featId);
      if (featData && featData.effects.specialAbilities) {
        specialAbilities.push(...featData.effects.specialAbilities);
      }
    });
  }

  return specialAbilities;
}

// Helper to calculate free node points from traits
function calculateFreeNodePoints(character: CharacterState): Record<string, number> {
  const freeNodePoints: Record<string, number> = {};
  // Race
  if (character.race) {
    const raceData = races.find(r => r.id === character.race);
    if (raceData && raceData.effects.freeNodePurchases) {
      raceData.effects.freeNodePurchases.forEach(free => {
        freeNodePoints[free.nodeId] = (freeNodePoints[free.nodeId] || 0) + free.points;
      });
    }
  }
  // Birthsign
  if (character.birthsign) {
    const birthsignData = birthsigns.find(b => b.id === character.birthsign);
    if (birthsignData && birthsignData.effects.freeNodePurchases) {
      birthsignData.effects.freeNodePurchases.forEach(free => {
        freeNodePoints[free.nodeId] = (freeNodePoints[free.nodeId] || 0) + free.points;
      });
    }
  }
  // Feats
  if (character.feats && character.feats.length > 0) {
    character.feats.forEach(featId => {
      const featData = feats.find(f => f.id === featId);
      if (featData && featData.effects.freeNodePurchases) {
        featData.effects.freeNodePurchases.forEach(free => {
          freeNodePoints[free.nodeId] = (freeNodePoints[free.nodeId] || 0) + free.points;
        });
      }
    });
  }
  return freeNodePoints;
}

// Helper to merge user nodePoints and freeNodePoints
export function getTotalNodePoints(userNodePoints: Record<string, number>, freeNodePoints: Record<string, number>): Record<string, number> {
  const total: Record<string, number> = { ...userNodePoints };
  for (const nodeId in freeNodePoints) {
    total[nodeId] = (total[nodeId] || 0) + freeNodePoints[nodeId];
  }
  return total;
}

export function prerequisitesMet(node: SkillNode, nodes: SkillNode[], nodePoints: Record<string, number>, characterPoints: Record<string, number>): boolean {
  if (!node.prerequisites || node.prerequisites.length === 0) {
    // If no prerequisites, only check requirements
    if (node.requirements) {
      return Object.entries(node.requirements).every(([color, requiredPoints]) => {
        return (characterPoints[color] || 0) >= requiredPoints;
      });
    }
    return true;
  }
  
  // Check prerequisites groups
  const allGroupsMet = node.prerequisites.every(group => {
    if (group.prerequisites.length === 0) return true;
    
    if (group.relationship === 'AND') {
      // All prerequisites in this group must be met
      return group.prerequisites.every(prereq => {
        const prereqNode = nodes.find(n => n.id === prereq.id);
        return prereqNode && (nodePoints[prereq.id] || 0) >= prereq.points;
      });
    } else {
      // OR relationship: at least one prerequisite in this group must be met
      return group.prerequisites.some(prereq => {
        const prereqNode = nodes.find(n => n.id === prereq.id);
        return prereqNode && (nodePoints[prereq.id] || 0) >= prereq.points;
      });
    }
  });

  // Check requirements (minimum total points in each color)
  const requirementsMet = !node.requirements || Object.entries(node.requirements).every(([color, requiredPoints]) => {
    return (characterPoints[color] || 0) >= requiredPoints;
  });

  // Unlocked if all prerequisite groups are met AND requirements are met
  return allGroupsMet && requirementsMet;
}

// Helper to calculate total point buy cost
function getPointBuyTotal(abilities: Record<string, number>) {
  return Object.values(abilities).reduce((sum, val) => sum + ABILITY_COSTS[val], 0);
}

// Helper to calculate constitution modifier
function getConstitutionModifier(constitution: number): number {
  return Math.floor((constitution - 10) / 2);
}

// Helper to calculate total HP
function calculateTotalHP(abilities: Record<string, number>, nodePoints: Record<string, number>, nodes: SkillNode[]): number {
  const baseHP = 5 + getConstitutionModifier(abilities.con);
  const bonusHP = Object.entries(nodePoints).reduce((total, [nodeId, points]) => {
    const node = nodes.find(n => n.id === nodeId);
    return total + (node ? node.hpBonus * points : 0);
  }, 0);
  return baseHP + bonusHP;
}

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
    if (!prerequisitesMet(node, state.nodes, state.character.nodePoints, state.character.points)) return;

    // ENFORCE SKILL POINTS
    const totalSpent = Object.values(state.character.nodePoints).reduce((sum, val) => sum + val, 0);
    const availableSkillPoints = state.character.level * 5 - totalSpent;
    if (availableSkillPoints < node.cost) return;

    const currentPoints = state.character.nodePoints[nodeId] || 0;
    const color = node.color;
    const cost = node.cost;

    set((state) => {
      const newNodePoints = {
        ...state.character.nodePoints,
        [nodeId]: currentPoints + cost,
      };
      const newMaxHP = calculateTotalHP(state.character.abilities, newNodePoints, state.nodes);
      
      const newPoints = {
        ...state.character.points,
        [color]: state.character.points[color] + cost,
      };
      
      // Create new character state with updated points
      const newCharacter = {
        ...state.character,
        points: newPoints,
        nodePoints: newNodePoints,
      };
      
      // Calculate special abilities with the new character state
      const specialAbilities = calculateSpecialAbilities(newCharacter);
      
      // Calculate resources with the new points and special abilities
      const newResources = calculateResources(newPoints, specialAbilities, newNodePoints);
      
      return {
        character: {
          ...newCharacter,
          maxHp: newMaxHP,
          hp: newMaxHP, // Set current HP to max HP when gaining HP
          resources: newResources,
          specialAbilities,
        },
      };
    });
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
        if (n.prerequisites) {
          // Check if this node is a prerequisite in any group
          const hasThisAsPrereq = n.prerequisites.some(group => 
            group.prerequisites.some(p => p.id === nodeIdToCheck)
          );
          
          if (hasThisAsPrereq) {
            // If this node no longer meets prerequisites and has points, remove all its points
            const meets = prerequisitesMet(n, state.nodes, draft.nodePoints, draft.points);
            const nodePoints = draft.nodePoints[n.id] || 0;
            if (!meets && nodePoints > 0) {
              // Remove all points from this node
              draft.points[n.color] -= nodePoints;
              draft.nodePoints[n.id] = 0;
              // Recursively remove from its dependents
              removeDependents(n.id, draft);
            }
          }
        }
      });
    }

    set((state) => {
      // Remove points from the node
      const newCharacter = { ...state.character };
      newCharacter.points = { ...newCharacter.points, [color]: newCharacter.points[color] - cost };
      newCharacter.nodePoints = { ...newCharacter.nodePoints, [nodeId]: currentPoints - cost };
      
      // Recursively remove points from dependents if needed
      removeDependents(nodeId, newCharacter);
      
      // Calculate new total HP
      newCharacter.maxHp = calculateTotalHP(state.character.abilities, newCharacter.nodePoints, state.nodes);
      newCharacter.hp = Math.min(newCharacter.hp, newCharacter.maxHp);
      
      // Calculate special abilities with the updated character state
      const specialAbilities = calculateSpecialAbilities(newCharacter);
      
      // Recalculate resources with new special abilities
      newCharacter.resources = calculateResources(newCharacter.points, specialAbilities, newCharacter.nodePoints);
      newCharacter.specialAbilities = specialAbilities;
      
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
      set((state) => {
        const loadedCharacter = JSON.parse(savedCharacter);
        // Ensure all properties exist with default values
        const characterWithDefaults = {
          ...state.character, // Start with default state
          ...loadedCharacter, // Override with loaded data
          // Ensure new properties have defaults if they don't exist in saved data
          race: loadedCharacter.race || undefined,
          birthsign: loadedCharacter.birthsign || undefined,
          feats: loadedCharacter.feats || [],
          nodePoints: loadedCharacter.nodePoints || {},
          points: loadedCharacter.points || { red: 0, green: 0, blue: 0 },
          abilities: loadedCharacter.abilities || { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
          level: loadedCharacter.level || 1,
          ac: loadedCharacter.ac || 10,
          useDexForAC: loadedCharacter.useDexForAC !== undefined ? loadedCharacter.useDexForAC : true,
          hp: loadedCharacter.hp || 4,
          maxHp: loadedCharacter.maxHp || 4,
          resources: loadedCharacter.resources || {
            adrenaline: 0,
            maxAdrenaline: 0,
            mana: 0,
            maxMana: 0,
            stamina: 0,
            maxStamina: 0,
          },
        };
        
        // Recalculate HP to ensure it's correct
        const recalculatedMaxHP = calculateTotalHP(characterWithDefaults.abilities, characterWithDefaults.nodePoints, state.nodes);
        
        // Calculate free node points from traits
        const freeNodePoints = calculateFreeNodePoints(characterWithDefaults);
        const totalNodePoints = getTotalNodePoints(characterWithDefaults.nodePoints, freeNodePoints);
        
        // Calculate effective abilities and special abilities
        const effectiveAbilities = calculateEffectiveAbilities(characterWithDefaults);
        const specialAbilities = calculateSpecialAbilities(characterWithDefaults);
        
        // Calculate resources based on skill tree points
        const resources = calculateResources(characterWithDefaults.points, specialAbilities, totalNodePoints);
        
        return {
          character: {
            ...characterWithDefaults,
            maxHp: recalculatedMaxHP,
            hp: Math.min(characterWithDefaults.hp || recalculatedMaxHP, recalculatedMaxHP),
            effectiveAbilities,
            specialAbilities,
            resources,
            freeNodePoints,
          },
        };
      });
    }
  },

  incrementAbility: (ability: AbilityKey) => {
    set((state) => {
      const current = state.character.abilities[ability];
      if (current >= ABILITY_MAX) return {};
      const newVal = current + 1;
      const newAbilities = { ...state.character.abilities, [ability]: newVal };
      if (getPointBuyTotal(newAbilities) > POINT_BUY_TOTAL) return {};
      
      // Recalculate HP if constitution changed
      const newMaxHP = calculateTotalHP(newAbilities, state.character.nodePoints, state.nodes);
      
      const newCharacter = { 
        ...state.character, 
        abilities: newAbilities,
        maxHp: newMaxHP,
        hp: ability === 'con' ? newMaxHP : Math.min(state.character.hp, newMaxHP), // If con increased, set HP to max
      };
      
      // Recalculate effective abilities and special abilities
      const effectiveAbilities = calculateEffectiveAbilities(newCharacter);
      const specialAbilities = calculateSpecialAbilities(newCharacter);
      
      // Recalculate resources with new special abilities
      const resources = calculateResources(newCharacter.points, specialAbilities, newCharacter.nodePoints);
      
      return { 
        character: { 
          ...newCharacter,
          effectiveAbilities,
          specialAbilities,
          resources,
        } 
      };
    });
  },
  decrementAbility: (ability: AbilityKey) => {
    set((state) => {
      const current = state.character.abilities[ability];
      if (current <= ABILITY_MIN) return {};
      const newVal = current - 1;
      const newAbilities = { ...state.character.abilities, [ability]: newVal };
      
      // Recalculate HP if constitution changed
      const newMaxHP = calculateTotalHP(newAbilities, state.character.nodePoints, state.nodes);
      
      const newCharacter = { 
        ...state.character, 
        abilities: newAbilities,
        maxHp: newMaxHP,
        hp: Math.min(state.character.hp, newMaxHP), // Ensure HP doesn't exceed new max
      };
      
      // Recalculate effective abilities and special abilities
      const effectiveAbilities = calculateEffectiveAbilities(newCharacter);
      const specialAbilities = calculateSpecialAbilities(newCharacter);
      
      // Recalculate resources with new special abilities
      const resources = calculateResources(newCharacter.points, specialAbilities, newCharacter.nodePoints);
      
      return { 
        character: { 
          ...newCharacter,
          effectiveAbilities,
          specialAbilities,
          resources,
        } 
      };
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

  setRace: (race: string) => {
    set((state) => {
      const newCharacter = { ...state.character, race };
      const freeNodePoints = calculateFreeNodePoints(newCharacter);
      const totalNodePoints = getTotalNodePoints(newCharacter.nodePoints, freeNodePoints);
      const effectiveAbilities = calculateEffectiveAbilities(newCharacter);
      const specialAbilities = calculateSpecialAbilities(newCharacter);
      const resources = calculateResources(newCharacter.points, specialAbilities, totalNodePoints);
      return {
        character: {
          ...newCharacter,
          freeNodePoints,
          effectiveAbilities,
          specialAbilities,
          resources,
        }
      };
    });
  },

  setBirthsign: (birthsign: string) => {
    set((state) => {
      const newCharacter = { ...state.character, birthsign };
      const freeNodePoints = calculateFreeNodePoints(newCharacter);
      const totalNodePoints = getTotalNodePoints(newCharacter.nodePoints, freeNodePoints);
      const effectiveAbilities = calculateEffectiveAbilities(newCharacter);
      const specialAbilities = calculateSpecialAbilities(newCharacter);
      const resources = calculateResources(newCharacter.points, specialAbilities, totalNodePoints);
      return {
        character: {
          ...newCharacter,
          freeNodePoints,
          effectiveAbilities,
          specialAbilities,
          resources,
        }
      };
    });
  },

  setFeats: (feats: string[]) => {
    set((state) => {
      const newCharacter = { ...state.character, feats };
      const freeNodePoints = calculateFreeNodePoints(newCharacter);
      const totalNodePoints = getTotalNodePoints(newCharacter.nodePoints, freeNodePoints);
      const effectiveAbilities = calculateEffectiveAbilities(newCharacter);
      const specialAbilities = calculateSpecialAbilities(newCharacter);
      const resources = calculateResources(newCharacter.points, specialAbilities, totalNodePoints);
      return {
        character: {
          ...newCharacter,
          freeNodePoints,
          effectiveAbilities,
          specialAbilities,
          resources,
        }
      };
    });
  },

  toggleFeat: (featId: string) => {
    set((state) => {
      const currentFeats = state.character.feats || [];
      const newFeats = currentFeats.includes(featId)
        ? currentFeats.filter(id => id !== featId)
        : [...currentFeats, featId];
      const newCharacter = { ...state.character, feats: newFeats };
      const freeNodePoints = calculateFreeNodePoints(newCharacter);
      const totalNodePoints = getTotalNodePoints(newCharacter.nodePoints, freeNodePoints);
      const effectiveAbilities = calculateEffectiveAbilities(newCharacter);
      const specialAbilities = calculateSpecialAbilities(newCharacter);
      const resources = calculateResources(newCharacter.points, specialAbilities, totalNodePoints);
      return {
        character: {
          ...newCharacter,
          freeNodePoints,
          effectiveAbilities,
          specialAbilities,
          resources,
        }
      };
    });
  },

  getEffectiveAbilities: () => {
    const state = get();
    return calculateEffectiveAbilities(state.character);
  },

  getSpecialAbilities: () => {
    const state = get();
    return calculateSpecialAbilities(state.character);
  },
})); 