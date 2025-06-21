import React from 'react';
import { useSkillTreeStore } from '../store/skillTreeStore';
import type { SkillNode } from '../types/skillTree';

type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

const ABILITY_LABELS: { key: AbilityKey; label: string }[] = [
  { key: 'str', label: 'STR' },
  { key: 'dex', label: 'DEX' },
  { key: 'con', label: 'CON' },
  { key: 'int', label: 'INT' },
  { key: 'wis', label: 'WIS' },
  { key: 'cha', label: 'CHA' },
];
const ABILITY_COSTS: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9, 16: 10, 17: 11, 18: 12, 19: 13, 20: 14 };
const ABILITY_MIN = 8;
const ABILITY_MAX = 20;
const POINT_BUY_TOTAL = 50;

function getPointBuyTotal(abilities: Record<AbilityKey, number>) {
  return Object.values(abilities).reduce((sum, val) => sum + ABILITY_COSTS[val], 0);
}
function getModifier(score: number) {
  return Math.floor((score - 10) / 2);
}

export const CharacterSheet: React.FC = () => {
  const { character, nodes, incrementAbility, decrementAbility, incrementLevel, decrementLevel, incrementAC, decrementAC, toggleUseDexForAC } = useSkillTreeStore();
  const activeNodes = nodes.filter(node => character.nodePoints[node.id] > 0);
  const remainingPoints = POINT_BUY_TOTAL - getPointBuyTotal(character.abilities);
  const totalSpentOnTree = Object.values(character.nodePoints).reduce((sum, val) => sum + val, 0);
  const availableSkillPoints = character.level * 5 - totalSpentOnTree;

  // D&D 5e proficiency bonus by level
  function getProficiencyBonus(level: number) {
    if (level >= 17) return 6;
    if (level >= 13) return 5;
    if (level >= 9) return 4;
    if (level >= 5) return 3;
    return 2;
  }
  const dexMod = getModifier(character.abilities.dex);
  const acTotal = character.useDexForAC ? character.ac + dexMod : character.ac;

  return (
    <div className="p-4 bg-white/90 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-extrabold mb-2 text-slate-800 tracking-tight">Character Stats</h2>
      <div className="mb-4 flex items-center gap-8">
        <div className="text-lg font-semibold text-blue-700 bg-blue-100 rounded-lg px-4 py-2 shadow border border-blue-200">
          Available Skill Points: <span className={availableSkillPoints < 0 ? 'text-red-500' : 'text-blue-700'}>{availableSkillPoints}</span>
        </div>
      </div>
      {/* Level, AC, Proficiency Bonus */}
      <div className="flex gap-12 items-center mb-6 justify-center">
        <div className="flex flex-col items-center bg-slate-100 rounded-xl shadow border border-slate-200 px-6 py-3 min-w-[110px]">
          <span className="text-xs text-slate-500 mb-1">Level</span>
          <div className="flex items-center gap-1">
            <button className="px-2 rounded bg-slate-200 text-slate-700 font-bold disabled:opacity-40" onClick={decrementLevel} disabled={character.level <= 1} aria-label="Decrease Level">-</button>
            <span className="text-xl font-bold text-center mx-3">{character.level}</span>
            <button className="px-2 rounded bg-slate-200 text-slate-700 font-bold disabled:opacity-40" onClick={incrementLevel} disabled={character.level >= 20} aria-label="Increase Level">+</button>
          </div>
        </div>
        <div className="flex flex-col items-center bg-slate-100 rounded-xl shadow border border-slate-200 px-6 py-3 min-w-[170px]">
          <span className="text-xs text-slate-500 mb-1">AC</span>
          <div className="flex items-center gap-1 mb-1">
            <button className="px-2 rounded bg-slate-200 text-slate-700 font-bold disabled:opacity-40" onClick={decrementAC} disabled={character.ac <= 0} aria-label="Decrease AC">-</button>
            <span className="text-xl font-bold text-center mx-3">{acTotal}</span>
            <button className="px-2 rounded bg-slate-200 text-slate-700 font-bold disabled:opacity-40" onClick={incrementAC} aria-label="Increase AC">+</button>
          </div>
          <label className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer select-none">
            <input type="checkbox" checked={character.useDexForAC} onChange={toggleUseDexForAC} className="accent-blue-500" />
            Use DEX bonus
          </label>
        </div>
        <div className="flex flex-col items-center bg-slate-100 rounded-xl shadow border border-slate-200 px-6 py-3 min-w-[110px]">
          <span className="text-xs text-slate-500 mb-1">Proficiency</span>
          <span className="text-xl font-bold text-center mx-3">{getProficiencyBonus(character.level)}</span>
        </div>
      </div>
      {/* D&D Stat Block */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-slate-700">Ability Scores <span className="ml-2 text-xs text-slate-500">(Point Buy: <span className={remainingPoints < 0 ? 'text-red-500' : 'text-slate-700'}>{remainingPoints}</span> left)</span></h3>
        <div className="flex gap-6 justify-between">
          {ABILITY_LABELS.map(({ key, label }) => {
            const value = character.abilities[key];
            const mod = getModifier(value);
            const canInc = value < ABILITY_MAX && remainingPoints >= ABILITY_COSTS[value + 1] - ABILITY_COSTS[value];
            const canDec = value > ABILITY_MIN;
            return (
              <div key={key} className="flex flex-col items-center bg-slate-100 rounded-lg w-24 h-24 border border-slate-200 justify-center">
                <div className="font-bold text-slate-700 mb-1">{label}</div>
                <div className="flex items-center gap-1 mb-1">
                  <button
                    className={`px-1 rounded bg-slate-200 text-slate-700 font-bold disabled:opacity-40`}
                    onClick={() => decrementAbility(key)}
                    disabled={!canDec}
                    aria-label={`Decrease ${label}`}
                  >-</button>
                  <span className="text-xl font-bold text-center mx-3">{value}</span>
                  <button
                    className={`px-1 rounded bg-slate-200 text-slate-700 font-bold disabled:opacity-40`}
                    onClick={() => incrementAbility(key)}
                    disabled={!canInc}
                    aria-label={`Increase ${label}`}
                  >+</button>
                </div>
                <div className="text-xs text-slate-500">{mod >= 0 ? '+' : ''}{mod}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-slate-700">Resources</h3>
          <div className="space-y-1 text-sm text-slate-700">
            <div>HP: <span className="font-bold">{character.hp}</span> / {character.maxHp}</div>
            <div>Adrenaline: <span className="font-bold">{character.resources.adrenaline}</span> / {character.resources.maxAdrenaline}</div>
            <div>Mana: <span className="font-bold">{character.resources.mana}</span> / {character.resources.maxMana}</div>
            <div>Stamina: <span className="font-bold">{character.resources.stamina}</span> / {character.resources.maxStamina}</div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 text-slate-700">Points Invested</h3>
          <div className="space-y-1 text-sm text-slate-700">
            <div>Red: <span className="font-bold text-red-500">{character.points.red}</span></div>
            <div>Green: <span className="font-bold text-green-500">{character.points.green}</span></div>
            <div>Blue: <span className="font-bold text-blue-500">{character.points.blue}</span></div>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2 text-slate-700">Active Abilities</h3>
        <div className="space-y-3">
          {activeNodes.length === 0 && <div className="text-slate-400 italic">No active abilities</div>}
          {activeNodes.map(node => (
            <div key={node.id} className="p-3 bg-slate-100 rounded-lg border border-slate-200">
              <div className="font-semibold text-slate-800">{node.name}</div>
              <div className="text-xs text-slate-500">Points: {character.nodePoints[node.id]}</div>
              <div className="text-xs text-slate-700 mt-1">{node.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 