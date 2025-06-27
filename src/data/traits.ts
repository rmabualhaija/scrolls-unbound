import type { Race, Birthsign, Feat } from '../types/skillTree';

export const races: Race[] = [
  {
    id: 'orc',
    name: 'Orc',
    description: 'Fierce and strong, orcs are known for their battle rage.',
    icon: '👹',
    effects: {
      abilityModifiers: [
        { ability: 'str', modifier: 2, source: 'race:orc' },
        { ability: 'con', modifier: 1, source: 'race:orc' },
      ],
      freeNodePurchases: [
        { nodeId: 'adrenaline-1', points: 1 }
      ],
      description: '+2 Strength, +1 Constitution, 1 free Adrenaline node purchase',
    },
  },
  {
    id: 'human',
    name: 'Human',
    description: 'Versatile and adaptable, humans are known for their determination and diverse talents.',
    icon: '👤',
    effects: {
      abilityModifiers: [
        { ability: 'str', modifier: 1, source: 'race:human' },
        { ability: 'dex', modifier: 1, source: 'race:human' },
        { ability: 'con', modifier: 1, source: 'race:human' },
        { ability: 'int', modifier: 1, source: 'race:human' },
        { ability: 'wis', modifier: 1, source: 'race:human' },
        { ability: 'cha', modifier: 1, source: 'race:human' },
      ],
      specialAbilities: [
        {
          id: 'human-versatility',
          name: 'Versatility',
          description: 'Humans gain an extra skill proficiency and a bonus feat at 1st level.',
          source: 'race:human',
          category: 'racial',
          effects: {
            proficiency: ['extra-skill'],
            featBonus: 1,
          },
        },
      ],
      description: '+1 to all ability scores, extra skill proficiency, bonus feat',
    },
  },
  {
    id: 'elf',
    name: 'Elf',
    description: 'Graceful and long-lived, elves are known for their connection to magic and nature.',
    icon: '🧝',
    effects: {
      abilityModifiers: [
        { ability: 'dex', modifier: 2, source: 'race:elf' },
        { ability: 'int', modifier: 1, source: 'race:elf' },
      ],
      specialAbilities: [
        {
          id: 'elf-darkvision',
          name: 'Darkvision',
          description: 'You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light.',
          source: 'race:elf',
          category: 'racial',
          effects: {
            darkvision: true,
          },
        },
        {
          id: 'elf-fey-ancestry',
          name: 'Fey Ancestry',
          description: 'You have advantage on saving throws against being charmed, and magic can\'t put you to sleep.',
          source: 'race:elf',
          category: 'racial',
        },
        {
          id: 'elf-trance',
          name: 'Trance',
          description: 'You don\'t need to sleep. Instead, you meditate deeply for 4 hours a day.',
          source: 'race:elf',
          category: 'racial',
        },
      ],
      description: '+2 Dexterity, +1 Intelligence, Darkvision, Fey Ancestry, Trance',
    },
  },
  {
    id: 'dwarf',
    name: 'Dwarf',
    description: 'Sturdy and resilient, dwarves are known for their craftsmanship and endurance.',
    icon: '🧙',
    effects: {
      abilityModifiers: [
        { ability: 'con', modifier: 2, source: 'race:dwarf' },
        { ability: 'str', modifier: 1, source: 'race:dwarf' },
      ],
      specialAbilities: [
        {
          id: 'dwarf-darkvision',
          name: 'Darkvision',
          description: 'You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light.',
          source: 'race:dwarf',
          category: 'racial',
          effects: {
            darkvision: true,
          },
        },
        {
          id: 'dwarf-resilience',
          name: 'Dwarven Resilience',
          description: 'You have advantage on saving throws against poison, and you have resistance against poison damage.',
          source: 'race:dwarf',
          category: 'racial',
          effects: {
            resistance: ['poison'],
          },
        },
        {
          id: 'dwarf-stonecunning',
          name: 'Stonecunning',
          description: 'Whenever you make an Intelligence (History) check related to the origin of stonework, you are considered proficient.',
          source: 'race:dwarf',
          category: 'racial',
        },
      ],
      description: '+2 Constitution, +1 Strength, Darkvision, Dwarven Resilience, Stonecunning',
    },
  },
  {
    id: 'halfling',
    name: 'Halfling',
    description: 'Small and nimble, halflings are known for their luck and stealth.',
    icon: '🧑‍🦲',
    effects: {
      abilityModifiers: [
        { ability: 'dex', modifier: 2, source: 'race:halfling' },
        { ability: 'cha', modifier: 1, source: 'race:halfling' },
      ],
      specialAbilities: [
        {
          id: 'halfling-lucky',
          name: 'Lucky',
          description: 'When you roll a 1 on an attack roll, ability check, or saving throw, you can reroll the die and must use the new roll.',
          source: 'race:halfling',
          category: 'racial',
        },
        {
          id: 'halfling-brave',
          name: 'Brave',
          description: 'You have advantage on saving throws against being frightened.',
          source: 'race:halfling',
          category: 'racial',
        },
        {
          id: 'halfling-nimbleness',
          name: 'Halfling Nimbleness',
          description: 'You can move through the space of any creature that is of a size larger than yours.',
          source: 'race:halfling',
          category: 'racial',
        },
      ],
      description: '+2 Dexterity, +1 Charisma, Lucky, Brave, Halfling Nimbleness',
    },
  },
  {
    id: 'dragonborn',
    name: 'Dragonborn',
    description: 'Descendants of dragons, dragonborn are known for their breath weapons and draconic heritage.',
    icon: '🐉',
    effects: {
      abilityModifiers: [
        { ability: 'str', modifier: 2, source: 'race:dragonborn' },
        { ability: 'cha', modifier: 1, source: 'race:dragonborn' },
      ],
      specialAbilities: [
        {
          id: 'dragonborn-breath-weapon',
          name: 'Breath Weapon',
          description: 'You can use your action to exhale destructive energy. Choose acid, cold, fire, lightning, or poison.',
          source: 'race:dragonborn',
          category: 'racial',
        },
        {
          id: 'dragonborn-damage-resistance',
          name: 'Damage Resistance',
          description: 'You have resistance to the damage type associated with your draconic ancestry.',
          source: 'race:dragonborn',
          category: 'racial',
          effects: {
            resistance: ['fire'], // Default, could be customized
          },
        },
      ],
      description: '+2 Strength, +1 Charisma, Breath Weapon, Damage Resistance',
    },
  },
  {
    id: 'tiefling',
    name: 'Tiefling',
    description: 'Descendants of fiends, tieflings are known for their infernal heritage and magical abilities.',
    icon: '😈',
    effects: {
      abilityModifiers: [
        { ability: 'cha', modifier: 2, source: 'race:tiefling' },
        { ability: 'int', modifier: 1, source: 'race:tiefling' },
      ],
      specialAbilities: [
        {
          id: 'tiefling-darkvision',
          name: 'Darkvision',
          description: 'You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light.',
          source: 'race:tiefling',
          category: 'racial',
          effects: {
            darkvision: true,
          },
        },
        {
          id: 'tiefling-hellish-resistance',
          name: 'Hellish Resistance',
          description: 'You have resistance to fire damage.',
          source: 'race:tiefling',
          category: 'racial',
          effects: {
            resistance: ['fire'],
          },
        },
        {
          id: 'tiefling-infernal-legacy',
          name: 'Infernal Legacy',
          description: 'You know the thaumaturgy cantrip. At 3rd level, you can cast the hellish rebuke spell once per day.',
          source: 'race:tiefling',
          category: 'racial',
        },
      ],
      description: '+2 Charisma, +1 Intelligence, Darkvision, Hellish Resistance, Infernal Legacy',
    },
  },
];

export const birthsigns: Birthsign[] = [
  {
    id: 'warrior',
    name: 'The Warrior',
    description: 'Born under the sign of the Warrior, you are destined for battle and physical prowess.',
    icon: '⚔️',
    effects: {
      abilityModifiers: [
        { ability: 'str', modifier: 1, source: 'birthsign:warrior' },
        { ability: 'con', modifier: 1, source: 'birthsign:warrior' },
      ],
      specialAbilities: [
        {
          id: 'warrior-hp-bonus',
          name: 'Warrior\'s Vitality',
          description: 'You gain +10 to your maximum hit points.',
          source: 'birthsign:warrior',
          category: 'birthsign',
          effects: {
            hpBonus: 10,
          },
        },
        {
          id: 'warrior-strength-saves',
          name: 'Strength of the Warrior',
          description: 'You have advantage on Strength saving throws.',
          source: 'birthsign:warrior',
          category: 'birthsign',
        },
        {
          id: 'warrior-weapon-proficiency',
          name: 'Martial Weapon Training',
          description: 'You are proficient with all martial weapons.',
          source: 'birthsign:warrior',
          category: 'birthsign',
          effects: {
            proficiency: ['martial-weapons'],
          },
        },
      ],
      description: '+1 Strength, +1 Constitution, +10 HP, advantage on Strength saves, martial weapon proficiency',
    },
  },
  {
    id: 'mage',
    name: 'The Mage',
    description: 'Born under the sign of the Mage, you have an innate connection to magical forces.',
    icon: '🔮',
    effects: {
      abilityModifiers: [
        { ability: 'int', modifier: 2, source: 'birthsign:mage' },
      ],
      specialAbilities: [
        {
          id: 'mage-mana-bonus',
          name: 'Mage\'s Power',
          description: 'You gain +20 to your maximum mana.',
          source: 'birthsign:mage',
          category: 'birthsign',
          effects: {
            manaBonus: 20,
          },
        },
        {
          id: 'mage-intelligence-saves',
          name: 'Mental Fortitude',
          description: 'You have advantage on Intelligence saving throws.',
          source: 'birthsign:mage',
          category: 'birthsign',
        },
        {
          id: 'mage-cantrips',
          name: 'Arcane Gift',
          description: 'You can cast cantrips as a spellcaster.',
          source: 'birthsign:mage',
          category: 'birthsign',
        },
      ],
      description: '+2 Intelligence, +20 Mana, advantage on Intelligence saves, can cast cantrips',
    },
  },
  {
    id: 'thief',
    name: 'The Thief',
    description: 'Born under the sign of the Thief, you are naturally stealthy and agile.',
    icon: '🗡️',
    effects: {
      abilityModifiers: [
        { ability: 'dex', modifier: 2, source: 'birthsign:thief' },
      ],
      specialAbilities: [
        {
          id: 'thief-stamina-bonus',
          name: 'Thief\'s Endurance',
          description: 'You gain +10 to your maximum stamina.',
          source: 'birthsign:thief',
          category: 'birthsign',
          effects: {
            staminaBonus: 10,
          },
        },
        {
          id: 'thief-dexterity-saves',
          name: 'Lightning Reflexes',
          description: 'You have advantage on Dexterity saving throws.',
          source: 'birthsign:thief',
          category: 'birthsign',
        },
        {
          id: 'thief-stealth-advantage',
          name: 'Shadow Walker',
          description: 'You have advantage on stealth checks.',
          source: 'birthsign:thief',
          category: 'birthsign',
        },
      ],
      description: '+2 Dexterity, +10 Stamina, advantage on Dexterity saves, advantage on stealth',
    },
  },
  {
    id: 'serpent',
    name: 'The Serpent',
    description: 'Born under the sign of the Serpent, you are cunning and resistant to poison.',
    icon: '🐍',
    effects: {
      abilityModifiers: [
        { ability: 'con', modifier: 1, source: 'birthsign:serpent' },
        { ability: 'int', modifier: 1, source: 'birthsign:serpent' },
      ],
      specialAbilities: [
        {
          id: 'serpent-poison-resistance',
          name: 'Serpent\'s Immunity',
          description: 'You have resistance to poison damage.',
          source: 'birthsign:serpent',
          category: 'birthsign',
          effects: {
            resistance: ['poison'],
          },
        },
        {
          id: 'serpent-constitution-saves',
          name: 'Poison Resistance',
          description: 'You have advantage on Constitution saving throws.',
          source: 'birthsign:serpent',
          category: 'birthsign',
        },
        {
          id: 'serpent-speak-with-snakes',
          name: 'Serpent Tongue',
          description: 'You can communicate with snakes and understand their language.',
          source: 'birthsign:serpent',
          category: 'birthsign',
        },
      ],
      description: '+1 Constitution, +1 Intelligence, poison resistance, advantage on Constitution saves, speak with snakes',
    },
  },
  {
    id: 'lady',
    name: 'The Lady',
    description: 'Born under the sign of the Lady, you are blessed with healing and protection.',
    icon: '👸',
    effects: {
      abilityModifiers: [
        { ability: 'wis', modifier: 1, source: 'birthsign:lady' },
        { ability: 'cha', modifier: 1, source: 'birthsign:lady' },
      ],
      specialAbilities: [
        {
          id: 'lady-hp-bonus',
          name: 'Lady\'s Blessing',
          description: 'You gain +10 to your maximum hit points.',
          source: 'birthsign:lady',
          category: 'birthsign',
          effects: {
            hpBonus: 10,
          },
        },
        {
          id: 'lady-healing-spells',
          name: 'Divine Healing',
          description: 'You can cast healing spells.',
          source: 'birthsign:lady',
          category: 'birthsign',
        },
        {
          id: 'lady-protection-from-evil',
          name: 'Protection from Evil',
          description: 'You have advantage on saving throws against evil creatures.',
          source: 'birthsign:lady',
          category: 'birthsign',
        },
      ],
      description: '+1 Wisdom, +1 Charisma, +10 HP, can cast healing spells, protection from evil',
    },
  },
  {
    id: 'steed',
    name: 'The Steed',
    description: 'Born under the sign of the Steed, you are swift and tireless.',
    icon: '🐎',
    effects: {
      abilityModifiers: [
        { ability: 'dex', modifier: 1, source: 'birthsign:steed' },
        { ability: 'con', modifier: 1, source: 'birthsign:steed' },
      ],
      specialAbilities: [
        {
          id: 'steed-speed-bonus',
          name: 'Steed\'s Speed',
          description: 'Your movement speed increases by 10 feet.',
          source: 'birthsign:steed',
          category: 'birthsign',
          effects: {
            speedBonus: 10,
          },
        },
        {
          id: 'steed-stamina-bonus',
          name: 'Endless Stamina',
          description: 'You gain +10 to your maximum stamina.',
          source: 'birthsign:steed',
          category: 'birthsign',
          effects: {
            staminaBonus: 10,
          },
        },
        {
          id: 'steed-tireless',
          name: 'Tireless Runner',
          description: 'You can run for hours without tiring.',
          source: 'birthsign:steed',
          category: 'birthsign',
        },
      ],
      description: '+1 Dexterity, +1 Constitution, +10 movement speed, +10 Stamina, tireless running',
    },
  },
  {
    id: 'lord',
    name: 'The Lord',
    description: 'Born under the sign of the Lord, you are a natural leader and commander.',
    icon: '👑',
    effects: {
      abilityModifiers: [
        { ability: 'cha', modifier: 2, source: 'birthsign:lord' },
      ],
      specialAbilities: [
        {
          id: 'lord-protection',
          name: 'Lord\'s Protection',
          description: 'Once per long rest as a reaction reduce non-fire damage by 1d10 + lvl',
          source: 'birthsign:lord',
          category: 'birthsign',
        },
        {
          id: 'lord-hp-bonus',
          name: 'Lord\'s Vitality',
          description: 'You gain 2 + your Constitution modifier to your maximum hit points.',
          source: 'birthsign:lord',
          category: 'birthsign',
          effects: {
            hpBonus: 'constitution', // Special value to indicate dynamic calculation
          },
        },
      ],
      description: 'Lords\'s Protection, and 2 + Constitution modifier HP',
    },
  },
  {
    id: 'apprentice',
    name: 'The Apprentice',
    description: 'Born under the sign of the Apprentice, you learn quickly and adapt to new situations.',
    icon: '📚',
    effects: {
      abilityModifiers: [
        { ability: 'int', modifier: 2, source: 'birthsign:apprentice' },
      ],
      specialAbilities: [
        {
          id: 'apprentice-fast-learning',
          name: 'Fast Learner',
          description: 'You learn skills twice as fast as normal.',
          source: 'birthsign:apprentice',
          category: 'birthsign',
        },
        {
          id: 'apprentice-bonus-experience',
          name: 'Bonus Experience',
          description: 'You gain 10% more experience points from all sources.',
          source: 'birthsign:apprentice',
          category: 'birthsign',
        },
      ],
      description: '+2 Intelligence, learn skills faster, +10% experience gain',
    },
  },
  {
    id: 'atronach',
    name: 'The Atronach',
    description: 'Born under the sign of the Atronach, you can absorb magical energy.',
    icon: '🛡️',
    effects: {
      abilityModifiers: [
        { ability: 'con', modifier: 1, source: 'birthsign:atronach' },
        { ability: 'int', modifier: 1, source: 'birthsign:atronach' },
      ],
      specialAbilities: [
        {
          id: 'atronach-spell-absorption',
          name: 'Spell Absorption',
          description: 'You have a 50% chance to absorb spells cast at you.',
          source: 'birthsign:atronach',
          category: 'birthsign',
        },
        {
          id: 'atronach-mana-bonus',
          name: 'Magical Reservoir',
          description: 'You gain +20 to your maximum mana.',
          source: 'birthsign:atronach',
          category: 'birthsign',
          effects: {
            manaBonus: 20,
          },
        },
        {
          id: 'atronach-magic-resistance',
          name: 'Magic Resistance',
          description: 'You have resistance to magical damage.',
          source: 'birthsign:atronach',
          category: 'birthsign',
          effects: {
            resistance: ['magical'],
          },
        },
      ],
      description: '+1 Constitution, +1 Intelligence, 50% spell absorption, +20 Mana, magic resistance',
    },
  },
  {
    id: 'ritual',
    name: 'The Ritual',
    description: 'Born under the sign of the Ritual, you have a deep connection to divine forces.',
    icon: '⛪',
    effects: {
      abilityModifiers: [
        { ability: 'wis', modifier: 2, source: 'birthsign:ritual' },
      ],
      specialAbilities: [
        {
          id: 'ritual-divine-rituals',
          name: 'Divine Rituals',
          description: 'You can perform divine rituals to gain temporary boons.',
          source: 'birthsign:ritual',
          category: 'birthsign',
        },
        {
          id: 'ritual-divine-favor',
          name: 'Divine Favor',
          description: 'You have advantage on saving throws against divine magic.',
          source: 'birthsign:ritual',
          category: 'birthsign',
        },
      ],
      description: '+2 Wisdom, can perform divine rituals, advantage against divine magic',
    },
  },
  {
    id: 'lover',
    name: 'The Lover',
    description: 'Born under the sign of the Lover, you are charming and persuasive.',
    icon: '💕',
    effects: {
      abilityModifiers: [
        { ability: 'cha', modifier: 2, source: 'birthsign:lover' },
      ],
      specialAbilities: [
        {
          id: 'lover-persuasion-advantage',
          name: 'Silver Tongue',
          description: 'You have advantage on persuasion checks.',
          source: 'birthsign:lover',
          category: 'birthsign',
        },
        {
          id: 'lover-charm-creatures',
          name: 'Natural Charm',
          description: 'You can charm creatures more easily.',
          source: 'birthsign:lover',
          category: 'birthsign',
        },
      ],
      description: '+2 Charisma, advantage on persuasion, easier to charm creatures',
    },
  },
  {
    id: 'shadow',
    name: 'The Shadow',
    description: 'Born under the sign of the Shadow, you can move unseen and strike from darkness.',
    icon: '👤',
    effects: {
      abilityModifiers: [
        { ability: 'dex', modifier: 2, source: 'birthsign:shadow' },
      ],
      specialAbilities: [
        {
          id: 'shadow-invisibility',
          name: 'Shadow Walk',
          description: 'You can turn invisible while in shadows.',
          source: 'birthsign:shadow',
          category: 'birthsign',
        },
        {
          id: 'shadow-darkvision',
          name: 'Shadow Sight',
          description: 'You can see in complete darkness.',
          source: 'birthsign:shadow',
          category: 'birthsign',
          effects: {
            darkvision: true,
          },
        },
      ],
      description: '+2 Dexterity, can turn invisible in shadows, darkvision',
    },
  },
];

export const feats: Feat[] = [
  {
    id: 'alert',
    name: 'Alert',
    description: 'Always on the lookout for danger, you gain the following benefits.',
    icon: '👁️',
    benefits: [
      'You can\'t be surprised while you are conscious',
      '+5 to initiative rolls',
      'Other creatures don\'t gain advantage on attack rolls against you as a result of being hidden from you',
    ],
    requirements: [],
    effects: {
      abilityModifiers: [
        { ability: 'dex', modifier: 1, source: 'feat:alert' },
      ],
      specialAbilities: [
        {
          id: 'alert-no-surprise',
          name: 'Alert',
          description: 'You can\'t be surprised while you are conscious.',
          source: 'feat:alert',
          category: 'feat',
        },
        {
          id: 'alert-initiative-bonus',
          name: 'Quick Reflexes',
          description: 'You gain +5 to initiative rolls.',
          source: 'feat:alert',
          category: 'feat',
        },
      ],
      description: '+1 Dexterity, can\'t be surprised, +5 initiative, no advantage from hidden enemies',
    },
  },
  {
    id: 'athlete',
    name: 'Athlete',
    description: 'You have undergone extensive physical training to gain the following benefits.',
    icon: '🏃',
    benefits: [
      'You can stand from prone using only 5 feet of movement',
      'Climbing doesn\'t cost you extra movement',
      'You can make a running long jump or running high jump after moving only 5 feet on foot',
    ],
    requirements: [],
    effects: {
      abilityModifiers: [
        { ability: 'str', modifier: 1, source: 'feat:athlete' },
      ],
      specialAbilities: [
        {
          id: 'athlete-stand-from-prone',
          name: 'Quick Recovery',
          description: 'You can stand from prone using only 5 feet of movement.',
          source: 'feat:athlete',
          category: 'feat',
        },
        {
          id: 'athlete-climbing',
          name: 'Expert Climber',
          description: 'Climbing doesn\'t cost you extra movement.',
          source: 'feat:athlete',
          category: 'feat',
        },
      ],
      description: '+1 Strength, quick recovery from prone, expert climbing, improved jumping',
    },
  },
  {
    id: 'charger',
    name: 'Charger',
    description: 'When you use your action to Dash, you can use a bonus action to make one melee weapon attack or to shove a creature.',
    icon: '💨',
    benefits: [
      'If you move at least 10 feet in a straight line immediately before taking this bonus action, you either gain a +5 bonus to the attack\'s damage roll (if you chose to make a melee attack and hit) or push the target up to 10 feet away from you (if you chose to shove and you succeed)',
    ],
    requirements: [],
    effects: {
      abilityModifiers: [
        { ability: 'str', modifier: 1, source: 'feat:charger' },
      ],
      specialAbilities: [
        {
          id: 'charger-bonus-action',
          name: 'Charging Attack',
          description: 'When you use your action to Dash, you can use a bonus action to make one melee weapon attack or to shove a creature.',
          source: 'feat:charger',
          category: 'feat',
        },
      ],
      description: '+1 Strength, charging attack after dash, +5 damage or push 10 feet',
    },
  },
  {
    id: 'defensive-duelist',
    name: 'Defensive Duelist',
    description: 'When you are wielding a finesse weapon with which you are proficient and another creature hits you with a melee attack, you can use your reaction to add your proficiency bonus to your AC for that attack.',
    icon: '⚔️',
    benefits: [
      'Add proficiency bonus to AC against melee attacks when wielding a finesse weapon',
    ],
    requirements: ['Dexterity 13 or higher'],
    effects: {
      abilityModifiers: [
        { ability: 'dex', modifier: 1, source: 'feat:defensive-duelist' },
      ],
      specialAbilities: [
        {
          id: 'defensive-duelist-reaction',
          name: 'Defensive Duelist',
          description: 'When wielding a finesse weapon, you can use your reaction to add your proficiency bonus to your AC against melee attacks.',
          source: 'feat:defensive-duelist',
          category: 'feat',
          effects: {
            acBonus: 2, // Proficiency bonus at low levels
          },
        },
      ],
      description: '+1 Dexterity, defensive reaction with finesse weapons',
    },
  },
  {
    id: 'dual-wielder',
    name: 'Dual Wielder',
    description: 'You master fighting with two weapons, gaining the following benefits.',
    icon: '🗡️',
    benefits: [
      'You gain a +1 bonus to AC while you are wielding a separate melee weapon in each hand',
      'You can use two-weapon fighting even when the one-handed melee weapons you are wielding aren\'t light',
      'You can draw or stow two one-handed weapons when you would normally be able to draw or stow only one',
    ],
    requirements: [],
    effects: {
      abilityModifiers: [
        { ability: 'dex', modifier: 1, source: 'feat:dual-wielder' },
      ],
      specialAbilities: [
        {
          id: 'dual-wielder-ac-bonus',
          name: 'Dual Wielding Defense',
          description: 'You gain a +1 bonus to AC while wielding two melee weapons.',
          source: 'feat:dual-wielder',
          category: 'feat',
          effects: {
            acBonus: 1,
          },
        },
        {
          id: 'dual-wielder-improved-fighting',
          name: 'Improved Two-Weapon Fighting',
          description: 'You can use two-weapon fighting with non-light weapons.',
          source: 'feat:dual-wielder',
          category: 'feat',
        },
      ],
      description: '+1 Dexterity, +1 AC with two weapons, improved two-weapon fighting',
    },
  },
  {
    id: 'grappler',
    name: 'Grappler',
    description: 'You\'ve developed the skills necessary to hold your own in close-quarters grappling.',
    icon: '🤼',
    benefits: [
      'You have advantage on attack rolls against a creature you are grappling',
      'You can use your action to try to pin a creature grappled by you',
      'Creatures that are one size larger than you don\'t automatically succeed on checks to escape your grapple',
    ],
    requirements: ['Strength 13 or higher'],
    effects: {
      abilityModifiers: [
        { ability: 'str', modifier: 1, source: 'feat:grappler' },
      ],
      specialAbilities: [
        {
          id: 'grappler-advantage',
          name: 'Grappling Master',
          description: 'You have advantage on attack rolls against grappled creatures.',
          source: 'feat:grappler',
          category: 'feat',
        },
        {
          id: 'grappler-pin',
          name: 'Pin Attack',
          description: 'You can use your action to try to pin a creature you are grappling.',
          source: 'feat:grappler',
          category: 'feat',
        },
      ],
      description: '+1 Strength, advantage against grappled creatures, can pin grappled creatures',
    },
  },
  {
    id: 'great-weapon-master',
    name: 'Great Weapon Master',
    description: 'You\'ve learned to put the weight of a weapon to your advantage, letting its momentum empower your strikes.',
    icon: '🪓',
    benefits: [
      'On your turn, when you score a critical hit with a melee weapon or reduce a creature to 0 hit points with one, you can make one melee weapon attack as a bonus action',
      'Before you make a melee attack with a heavy weapon that you are proficient with, you can choose to take a -5 penalty to the attack roll. If the attack hits, you add +10 to the attack\'s damage',
    ],
    requirements: [],
    effects: {
      abilityModifiers: [
        { ability: 'str', modifier: 1, source: 'feat:great-weapon-master' },
      ],
      specialAbilities: [
        {
          id: 'great-weapon-master-bonus-action',
          name: 'Great Weapon Master',
          description: 'On a critical hit or reducing a creature to 0 HP, you can make a bonus action melee attack.',
          source: 'feat:great-weapon-master',
          category: 'feat',
        },
        {
          id: 'great-weapon-master-power-attack',
          name: 'Power Attack',
          description: 'With heavy weapons, you can take -5 to attack for +10 damage.',
          source: 'feat:great-weapon-master',
          category: 'feat',
        },
      ],
      description: '+1 Strength, bonus action attack on crit/kill, power attack with heavy weapons',
    },
  },
  {
    id: 'healer',
    name: 'Healer',
    description: 'You are an able physician, allowing you to mend wounds quickly and get your allies back in the fight.',
    icon: '🏥',
    benefits: [
      'When you use a healer\'s kit to stabilize a dying creature, that creature also regains 1 hit point',
      'As an action, you can spend one use of a healer\'s kit to tend to a creature and restore 1d6 + 4 hit points to it, plus additional hit points equal to the creature\'s maximum number of Hit Dice',
    ],
    requirements: [],
    effects: {
      abilityModifiers: [
        { ability: 'wis', modifier: 1, source: 'feat:healer' },
      ],
      specialAbilities: [
        {
          id: 'healer-stabilize',
          name: 'Expert Healer',
          description: 'When you stabilize a dying creature with a healer\'s kit, they also regain 1 hit point.',
          source: 'feat:healer',
          category: 'feat',
        },
        {
          id: 'healer-treat-wounds',
          name: 'Treat Wounds',
          description: 'You can use a healer\'s kit to restore 1d6 + 4 + Hit Dice hit points to a creature.',
          source: 'feat:healer',
          category: 'feat',
        },
      ],
      description: '+1 Wisdom, expert healing, treat wounds with healer\'s kit',
    },
  },
  {
    id: 'keen-mind',
    name: 'Keen Mind',
    description: 'You have a mind that can track time, direction, and detail with uncanny precision.',
    icon: '🧠',
    benefits: [
      'You always know which way is north',
      'You always know the number of hours left before the next sunrise or sunset',
      'You can accurately recall anything you have seen or heard within the past month',
    ],
    requirements: [],
    effects: {
      abilityModifiers: [
        { ability: 'int', modifier: 1, source: 'feat:keen-mind' },
      ],
      specialAbilities: [
        {
          id: 'keen-mind-direction',
          name: 'Perfect Direction',
          description: 'You always know which way is north.',
          source: 'feat:keen-mind',
          category: 'feat',
        },
        {
          id: 'keen-mind-time',
          name: 'Time Sense',
          description: 'You always know the hours until sunrise or sunset.',
          source: 'feat:keen-mind',
          category: 'feat',
        },
        {
          id: 'keen-mind-memory',
          name: 'Perfect Recall',
          description: 'You can accurately recall anything seen or heard in the past month.',
          source: 'feat:keen-mind',
          category: 'feat',
        },
      ],
      description: '+1 Intelligence, perfect direction sense, time sense, perfect recall',
    },
  },
  {
    id: 'lightly-armored',
    name: 'Lightly Armored',
    description: 'You have trained to master the use of light armor, gaining the following benefits.',
    icon: '🛡️',
    benefits: [
      'You gain proficiency with light armor',
    ],
    requirements: [],
    effects: {
      abilityModifiers: [
        { ability: 'dex', modifier: 1, source: 'feat:lightly-armored' },
      ],
      specialAbilities: [
        {
          id: 'lightly-armored-proficiency',
          name: 'Light Armor Training',
          description: 'You are proficient with light armor.',
          source: 'feat:lightly-armored',
          category: 'feat',
          effects: {
            proficiency: ['light-armor'],
          },
        },
      ],
      description: '+1 Dexterity, proficiency with light armor',
    },
  },
  {
    id: 'linguist',
    name: 'Linguist',
    description: 'You have studied languages and codes, gaining the following benefits.',
    icon: '📝',
    benefits: [
      'You learn three languages of your choice',
      'You can ably create written ciphers',
      'Others can\'t decipher a code you create unless you teach them, they succeed on an Intelligence check (DC equal to your Intelligence score + your proficiency bonus), or they use magic to decipher it',
    ],
    requirements: ['Intelligence 13 or higher'],
    effects: {
      abilityModifiers: [
        { ability: 'int', modifier: 1, source: 'feat:linguist' },
      ],
      specialAbilities: [
        {
          id: 'linguist-languages',
          name: 'Polyglot',
          description: 'You learn three additional languages.',
          source: 'feat:linguist',
          category: 'feat',
        },
        {
          id: 'linguist-ciphers',
          name: 'Code Master',
          description: 'You can create written ciphers that are difficult to decipher.',
          source: 'feat:linguist',
          category: 'feat',
        },
      ],
      description: '+1 Intelligence, learn three languages, create ciphers',
    },
  },
  {
    id: 'lucky',
    name: 'Lucky',
    description: 'You have inexplicable luck that seems to kick in at just the right moment.',
    icon: '🍀',
    benefits: [
      'You have 3 luck points',
      'Whenever you make an attack roll, an ability check, or a saving throw, you can spend one luck point to roll an additional d20',
      'You can choose to spend one of your luck points after you roll the die, but before the outcome is determined',
    ],
    requirements: [],
    effects: {
      abilityModifiers: [
        { ability: 'cha', modifier: 1, source: 'feat:lucky' },
      ],
      specialAbilities: [
        {
          id: 'lucky-points',
          name: 'Lucky',
          description: 'You have 3 luck points to spend on rerolls.',
          source: 'feat:lucky',
          category: 'feat',
        },
      ],
      description: '+1 Charisma, 3 luck points for rerolls',
    },
  },
]; 