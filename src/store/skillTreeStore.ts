import { create } from 'zustand';
import type { SkillTreeState, CharacterState, SkillNode, SpecialAbility, InventoryItem } from '../types/skillTree';
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
  exportCharacter: () => void;
  importCharacter: (file: File) => Promise<void>;
  incrementAbility: (ability: AbilityKey) => void;
  decrementAbility: (ability: AbilityKey) => void;
  incrementLevel: () => void;
  decrementLevel: () => void;
  incrementAC: () => void;
  decrementAC: () => void;
  incrementHP: () => void;
  decrementHP: () => void;
  setHP: (hp: number) => void;
  toggleUseDexForAC: () => void;
  setName: (name: string) => void;
  setNotes: (notes: string) => void;
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  removeInventoryItem: (id: string) => void;
  setRace: (race: string) => void;
  setBirthsign: (birthsign: string) => void;
  setFeats: (feats: string[]) => void;
  toggleFeat: (featId: string) => void;
  getEffectiveAbilities: () => Record<AbilityKey, number>;
  getSpecialAbilities: () => SpecialAbility[];
  setNodeChoice: (nodeId: string, choice: string) => void;
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
    name: '',
    notes: '',
    inventory: [],
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
    nodeChoices: {},
  },
};

// Helper to calculate resources based on skill tree points and trait bonuses
function calculateResources(
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
function calculateTotalHP(abilities: Record<string, number>, nodePoints: Record<string, number>, nodes: SkillNode[], specialAbilities: SpecialAbility[] = []): number {
  const baseHP = 5 + getConstitutionModifier(abilities.con);
  const bonusHP = Object.entries(nodePoints).reduce((total, [nodeId, points]) => {
    const node = nodes.find(n => n.id === nodeId);
    return total + (node ? node.hpBonus * points : 0);
  }, 0);
  
  // Add HP bonuses from special abilities
  const specialAbilityHP = specialAbilities.reduce((total, ability) => {
    if (ability.effects?.hpBonus) {
      if (typeof ability.effects.hpBonus === 'number') {
        return total + ability.effects.hpBonus;
      } else if (ability.effects.hpBonus === 'constitution') {
        // Dynamic bonus: 2 + constitution modifier
        return total + 2 + getConstitutionModifier(abilities.con);
      }
    }
    return total;
  }, 0);
  
  return baseHP + bonusHP + specialAbilityHP;
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
      
      // Calculate HP with special abilities included
      const newMaxHP = calculateTotalHP(state.character.abilities, newNodePoints, state.nodes, specialAbilities);
      
      // Calculate resources with the new points and special abilities
      const newResources = calculateResources(specialAbilities, newNodePoints);
      
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
      
      // Calculate special abilities with the updated character state
      const specialAbilities = calculateSpecialAbilities(newCharacter);
      
      // Calculate new total HP with special abilities included
      newCharacter.maxHp = calculateTotalHP(state.character.abilities, newCharacter.nodePoints, state.nodes, specialAbilities);
      newCharacter.hp = Math.min(newCharacter.hp, newCharacter.maxHp);
      
      // Recalculate resources with new special abilities
      newCharacter.resources = calculateResources(specialAbilities, newCharacter.nodePoints);
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
        
        // Calculate free node points from traits
        const freeNodePoints = calculateFreeNodePoints(characterWithDefaults);
        const totalNodePoints = getTotalNodePoints(characterWithDefaults.nodePoints, freeNodePoints);
        
        // Calculate effective abilities and special abilities
        const effectiveAbilities = calculateEffectiveAbilities(characterWithDefaults);
        const specialAbilities = calculateSpecialAbilities(characterWithDefaults);
        
        // Recalculate HP to ensure it's correct with special abilities included
        const recalculatedMaxHP = calculateTotalHP(characterWithDefaults.abilities, characterWithDefaults.nodePoints, state.nodes, specialAbilities);
        
        // Calculate resources based on skill tree points
        const resources = calculateResources(specialAbilities, totalNodePoints);
        
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

  exportCharacter: () => {
    const state = get();
    const characterData = {
      ...state.character,
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    };
    
    const blob = new Blob([JSON.stringify(characterData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `character-${state.character.race || 'unknown'}-${state.character.birthsign || 'unknown'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importCharacter: async (file: File) => {
    try {
      const text = await file.text();
      const loadedCharacter = JSON.parse(text);
      
      set((state) => {
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
        
        // Calculate free node points from traits
        const freeNodePoints = calculateFreeNodePoints(characterWithDefaults);
        const totalNodePoints = getTotalNodePoints(characterWithDefaults.nodePoints, freeNodePoints);
        
        // Calculate effective abilities and special abilities
        const effectiveAbilities = calculateEffectiveAbilities(characterWithDefaults);
        const specialAbilities = calculateSpecialAbilities(characterWithDefaults);
        
        // Recalculate HP to ensure it's correct with special abilities included
        const recalculatedMaxHP = calculateTotalHP(characterWithDefaults.abilities, characterWithDefaults.nodePoints, state.nodes, specialAbilities);
        
        // Calculate resources based on skill tree points
        const resources = calculateResources(specialAbilities, totalNodePoints);
        
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
    } catch (error) {
      console.error('Error importing character:', error);
      alert('Error importing character file. Please make sure it\'s a valid character save file.');
    }
  },

  incrementAbility: (ability: AbilityKey) => {
    set((state) => {
      const current = state.character.abilities[ability];
      if (current >= ABILITY_MAX) return {};
      const newVal = current + 1;
      const newAbilities = { ...state.character.abilities, [ability]: newVal };
      if (getPointBuyTotal(newAbilities) > POINT_BUY_TOTAL) return {};
      
      const newCharacter = { 
        ...state.character, 
        abilities: newAbilities,
      };
      
      // Recalculate effective abilities and special abilities
      const effectiveAbilities = calculateEffectiveAbilities(newCharacter);
      const specialAbilities = calculateSpecialAbilities(newCharacter);
      
      // Recalculate HP with special abilities included
      const newMaxHP = calculateTotalHP(newAbilities, state.character.nodePoints, state.nodes, specialAbilities);
      
      // Recalculate resources with new special abilities
      const resources = calculateResources(specialAbilities, newCharacter.nodePoints);
      
      return { 
        character: { 
          ...newCharacter,
          maxHp: newMaxHP,
          hp: ability === 'con' ? newMaxHP : Math.min(state.character.hp, newMaxHP), // If con increased, set HP to max
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
      
      // Recalculate effective abilities and special abilities
      const newCharacter = { 
        ...state.character, 
        abilities: newAbilities,
      };
      
      // Recalculate effective abilities and special abilities
      const effectiveAbilities = calculateEffectiveAbilities(newCharacter);
      const specialAbilities = calculateSpecialAbilities(newCharacter);
      
      // Recalculate HP with special abilities included
      const newMaxHP = calculateTotalHP(newAbilities, state.character.nodePoints, state.nodes, specialAbilities);
      
      // Recalculate resources with new special abilities
      const resources = calculateResources(specialAbilities, newCharacter.nodePoints);
      
      return { 
        character: { 
          ...newCharacter,
          maxHp: newMaxHP,
          hp: Math.min(state.character.hp, newMaxHP), // Ensure HP doesn't exceed new max
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

  incrementHP: () => {
    set((state) => {
      const newHP = Math.min(state.character.hp + 1, state.character.maxHp);
      return { character: { ...state.character, hp: newHP } };
    });
  },
  decrementHP: () => {
    set((state) => {
      const newHP = Math.max(state.character.hp - 1, 0);
      return { character: { ...state.character, hp: newHP } };
    });
  },
  setHP: (hp: number) => {
    set((state) => {
      const clampedHP = Math.max(0, Math.min(hp, state.character.maxHp));
      return { character: { ...state.character, hp: clampedHP } };
    });
  },

  toggleUseDexForAC: () => {
    set((state) => ({ character: { ...state.character, useDexForAC: !state.character.useDexForAC } }));
  },

  setName: (name: string) => {
    set((state) => ({ character: { ...state.character, name } }));
  },

  setNotes: (notes: string) => {
    set((state) => ({ character: { ...state.character, notes } }));
  },

  addInventoryItem: (item: InventoryItem) => {
    set((state) => ({
      character: {
        ...state.character,
        inventory: [...(state.character.inventory || []), item],
      },
    }));
  },

  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => {
    set((state) => ({
      character: {
        ...state.character,
        inventory: (state.character.inventory || []).map(i =>
          i.id === id ? { ...i, ...item } : i
        ),
      },
    }));
  },

  removeInventoryItem: (id: string) => {
    set((state) => ({
      character: {
        ...state.character,
        inventory: (state.character.inventory || []).filter(i => i.id !== id),
      },
    }));
  },

  setRace: (race: string) => {
    set((state) => {
      const newCharacter = { ...state.character, race };
      const freeNodePoints = calculateFreeNodePoints(newCharacter);
      const totalNodePoints = getTotalNodePoints(newCharacter.nodePoints, freeNodePoints);
      const effectiveAbilities = calculateEffectiveAbilities(newCharacter);
      const specialAbilities = calculateSpecialAbilities(newCharacter);
      const resources = calculateResources(specialAbilities, totalNodePoints);
      
      // Recalculate HP with new special abilities
      const newMaxHP = calculateTotalHP(newCharacter.abilities, newCharacter.nodePoints, state.nodes, specialAbilities);
      
      return {
        character: {
          ...newCharacter,
          maxHp: newMaxHP,
          hp: Math.min(newCharacter.hp, newMaxHP), // Ensure HP doesn't exceed new max
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
      const resources = calculateResources(specialAbilities, totalNodePoints);
      
      // Recalculate HP with new special abilities
      const newMaxHP = calculateTotalHP(newCharacter.abilities, newCharacter.nodePoints, state.nodes, specialAbilities);
      
      return {
        character: {
          ...newCharacter,
          maxHp: newMaxHP,
          hp: Math.min(newCharacter.hp, newMaxHP), // Ensure HP doesn't exceed new max
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
      const resources = calculateResources(specialAbilities, totalNodePoints);
      
      // Recalculate HP with new special abilities
      const newMaxHP = calculateTotalHP(newCharacter.abilities, newCharacter.nodePoints, state.nodes, specialAbilities);
      
      return {
        character: {
          ...newCharacter,
          maxHp: newMaxHP,
          hp: Math.min(newCharacter.hp, newMaxHP), // Ensure HP doesn't exceed new max
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
      const resources = calculateResources(specialAbilities, totalNodePoints);
      
      // Recalculate HP with new special abilities
      const newMaxHP = calculateTotalHP(newCharacter.abilities, newCharacter.nodePoints, state.nodes, specialAbilities);
      
      return {
        character: {
          ...newCharacter,
          maxHp: newMaxHP,
          hp: Math.min(newCharacter.hp, newMaxHP), // Ensure HP doesn't exceed new max
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

  setNodeChoice: (nodeId, choice) => set(state => ({
    character: {
      ...state.character,
      nodeChoices: { ...state.character.nodeChoices, [nodeId]: choice },
    },
  })),
})); 