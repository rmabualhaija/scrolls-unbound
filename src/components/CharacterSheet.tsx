import React, { useState } from 'react';
import { useSkillTreeStore } from '../store/skillTreeStore';
import { getTotalNodePoints } from '../store/skillTreeStore';
import type { InventoryItem } from '../types/skillTree';

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
  const { character, nodes, incrementAbility, decrementAbility, incrementLevel, decrementLevel, incrementAC, decrementAC, incrementHP, decrementHP, setHP, toggleUseDexForAC, setName, setNotes, addInventoryItem, updateInventoryItem, removeInventoryItem, saveCharacter, loadCharacter, exportCharacter, importCharacter, setNodeChoice } = useSkillTreeStore();
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [loadMessage, setLoadMessage] = useState<string>('');
  const [exportMessage, setExportMessage] = useState<string>('');
  const [importMessage, setImportMessage] = useState<string>('');
  const [isEditingHP, setIsEditingHP] = useState(false);
  const [editingHPValue, setEditingHPValue] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [traitsOpen, setTraitsOpen] = useState(true);
  const [abilitiesOpen, setAbilitiesOpen] = useState(true);
  
  const totalNodePoints = getTotalNodePoints(character.nodePoints, character.freeNodePoints);
  const activeNodes = nodes.filter(node => (totalNodePoints && totalNodePoints[node.id]) > 0);
  const remainingPoints = POINT_BUY_TOTAL - getPointBuyTotal(character.abilities || { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 });
  const totalSpentOnTree = Object.values(totalNodePoints || {}).reduce((sum, val) => sum + val, 0);
  const availableSkillPoints = (character.level || 1) * 5 - totalSpentOnTree;

  // Use effective abilities (with trait modifiers) for display
  const displayAbilities = character.effectiveAbilities || character.abilities || { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };

  const handleSave = () => {
    saveCharacter();
    setSaveMessage('Character saved!');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const handleLoad = () => {
    loadCharacter();
    setLoadMessage('Character loaded!');
    setTimeout(() => setLoadMessage(''), 2000);
  };

  const handleExport = () => {
    exportCharacter();
    setExportMessage('Character exported!');
    setTimeout(() => setExportMessage(''), 2000);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await importCharacter(file);
        setImportMessage('Character imported!');
        setTimeout(() => setImportMessage(''), 2000);
      } catch (error) {
        setImportMessage('Import failed!');
        setTimeout(() => setImportMessage(''), 2000);
      }
    }
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const handleHPInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditingHPValue(event.target.value);
  };

  const handleHPInputSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const newHP = parseInt(editingHPValue);
    if (!isNaN(newHP)) {
      setHP(newHP);
      setEditingHPValue('');
    }
  };

  const handleHPInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleHPInputSubmit(event);
    }
  };

  const handleHPClick = () => {
    setIsEditingHP(true);
    setEditingHPValue((character.hp || 0).toString());
  };

  const handleHPBlur = () => {
    setIsEditingHP(false);
    const newHP = parseInt(editingHPValue);
    if (!isNaN(newHP) && newHP >= 0 && newHP <= (character.maxHp || 0)) {
      setHP(newHP);
    }
    setEditingHPValue('');
  };

  const handleHPKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleHPBlur();
    } else if (event.key === 'Escape') {
      setIsEditingHP(false);
      setEditingHPValue('');
    }
  };

  // D&D 5e proficiency bonus by level
  function getProficiencyBonus(level: number) {
    if (level >= 17) return 6;
    if (level >= 13) return 5;
    if (level >= 9) return 4;
    if (level >= 5) return 3;
    return 2;
  }
  const dexMod = getModifier((character.abilities && character.abilities.dex) || 8);
  const acTotal = (character.useDexForAC !== undefined ? character.useDexForAC : true) ? (character.ac || 10) + dexMod : (character.ac || 10);

  // In Points Invested section, use totalNodePoints for color sums:
  // Red: sum of all red node points, etc.
  const redPoints = nodes.filter(n => n.color === 'red').reduce((sum, n) => sum + (totalNodePoints[n.id] || 0), 0);
  const greenPoints = nodes.filter(n => n.color === 'green').reduce((sum, n) => sum + (totalNodePoints[n.id] || 0), 0);
  const bluePoints = nodes.filter(n => n.color === 'blue').reduce((sum, n) => sum + (totalNodePoints[n.id] || 0), 0);

  const handleNodeChoiceChange = (nodeId: string, choice: string) => {
    setNodeChoice(nodeId, choice);
  };

  return (
    <div className="p-6 bg-slate-50 rounded-2xl shadow-xl max-w-3xl mx-auto mt-6">
      {/* Header and Actions */}
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">Character Stats</h2>
        <div className="flex gap-3 flex-wrap">
          <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 font-semibold" title="Save the current character">Save</button>
          <button onClick={handleLoad} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 font-semibold" title="Load a previously saved character">Load</button>
          <button onClick={handleExport} className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 font-semibold" title="Export the current character to a file">Export</button>
          <button onClick={handleImport} className="px-4 py-2 bg-yellow-600 text-white rounded-lg shadow hover:bg-yellow-700 font-semibold" title="Import a character from a file">Import</button>
        </div>
      </div>
      {/* Character Name */}
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-blue-400 text-2xl">👤</span>
            <h3 className="text-xl font-bold text-slate-700">Character Name</h3>
          </div>
          <input
            type="text"
            value={character.name || ''}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your character's name..."
            className="w-full px-4 py-3 text-lg border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 hover:bg-white transition-colors"
            maxLength={50}
          />
        </div>
      </div>
      {/* Skill Points */}
      <div className="mb-6">
        <div className="text-lg font-semibold text-blue-700 bg-blue-100 rounded-lg px-4 py-2 shadow border border-blue-200 inline-block">
          Available Skill Points: <span className={availableSkillPoints < 0 ? 'text-red-500' : 'text-blue-700'}>{availableSkillPoints}</span>
        </div>
      </div>
      {/* Stats Card */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex flex-wrap gap-8 items-center justify-center mb-6">
          {/* Level */}
          <div className="flex flex-col items-center bg-slate-100 rounded-xl shadow border border-slate-200 px-6 py-3 min-w-[110px]">
            <span className="text-xs text-slate-500 mb-1">Level</span>
            <div className="flex items-center gap-1">
              <button className="px-2 rounded bg-slate-200 text-slate-700 font-bold disabled:opacity-40" onClick={decrementLevel} disabled={(character.level || 1) <= 1} aria-label="Decrease Level">-</button>
              <span className="text-xl font-bold text-center mx-3">{character.level || 1}</span>
              <button className="px-2 rounded bg-slate-200 text-slate-700 font-bold disabled:opacity-40" onClick={incrementLevel} disabled={(character.level || 1) >= 20} aria-label="Increase Level">+</button>
            </div>
          </div>
          {/* AC */}
          <div className="flex flex-col items-center bg-slate-100 rounded-xl shadow border border-slate-200 px-6 py-3 min-w-[170px]">
            <span className="text-xs text-slate-500 mb-1">AC</span>
            <div className="flex items-center gap-1 mb-1">
              <button className="px-2 rounded bg-slate-200 text-slate-700 font-bold disabled:opacity-40" onClick={decrementAC} disabled={(character.ac || 10) <= 0} aria-label="Decrease AC">-</button>
              <span className="text-xl font-bold text-center mx-3">{acTotal}</span>
              <button className="px-2 rounded bg-slate-200 text-slate-700 font-bold disabled:opacity-40" onClick={incrementAC} aria-label="Increase AC">+</button>
            </div>
            <label className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer select-none">
              <input type="checkbox" checked={character.useDexForAC !== undefined ? character.useDexForAC : true} onChange={toggleUseDexForAC} className="accent-blue-500" />
              Use DEX bonus
            </label>
          </div>
          {/* Proficiency */}
          <div className="flex flex-col items-center bg-slate-100 rounded-xl shadow border border-slate-200 px-6 py-3 min-w-[110px]">
            <span className="text-xs text-slate-500 mb-1">Proficiency</span>
            <span className="text-xl font-bold text-center mx-3">{getProficiencyBonus(character.level || 1)}</span>
          </div>
        </div>
        {/* Ability Scores Grid */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2 text-slate-700">Ability Scores <span className="ml-2 text-xs text-slate-500">(Point Buy: <span className={remainingPoints < 0 ? 'text-red-500' : 'text-slate-700'}>{remainingPoints}</span> left)</span></h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {ABILITY_LABELS.map(({ key, label }) => {
              const value = (displayAbilities && displayAbilities[key]) || 8;
              const mod = getModifier(value);
              const canInc = value < ABILITY_MAX && remainingPoints >= ABILITY_COSTS[value + 1] - ABILITY_COSTS[value];
              const canDec = value > ABILITY_MIN;
              // Color backgrounds for each stat
              const statBg = {
                str: 'bg-red-100 border-red-300',
                dex: 'bg-yellow-100 border-yellow-300',
                con: 'bg-green-100 border-green-300',
                int: 'bg-blue-100 border-blue-300',
                wis: 'bg-purple-100 border-purple-300',
                cha: 'bg-pink-100 border-pink-300',
              }[key];
              return (
                <div key={key} className={`flex flex-col items-center rounded-lg border p-4 shadow-sm ${statBg}`}>
                  <div className="font-bold text-slate-700 mb-1 text-lg">{label}</div>
                  <div className="flex items-center gap-1 mb-1">
                    <button className="px-1 rounded bg-slate-200 text-slate-700 font-bold disabled:opacity-40" onClick={() => decrementAbility(key)} disabled={!canDec} aria-label={`Decrease ${label}`}>-</button>
                    <span className="text-3xl font-extrabold text-center mx-3">{value}</span>
                    <button className="px-1 rounded bg-slate-200 text-slate-700 font-bold disabled:opacity-40" onClick={() => incrementAbility(key)} disabled={!canInc} aria-label={`Increase ${label}`}>+</button>
                  </div>
                  <div className="text-base text-slate-500 font-mono">{mod >= 0 ? '+' : ''}{mod}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Resources and Points Invested Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-red-400 text-2xl">❤️</span>
            <h3 className="text-xl font-bold text-slate-700">Resources</h3>
          </div>
          <div className="space-y-4 text-sm text-slate-700">
            {/* HP with controls */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span>HP:</span>
                <div className="flex items-center gap-1">
                  <button className="px-2 py-1 rounded bg-red-200 text-red-700 font-bold hover:bg-red-300 disabled:opacity-40" onClick={decrementHP} disabled={(character.hp || 0) <= 0} aria-label="Decrease HP">-</button>
                  {isEditingHP ? (
                    <input
                      type="number"
                      value={editingHPValue}
                      onChange={handleHPInputChange}
                      onBlur={handleHPBlur}
                      onKeyDown={handleHPKeyDown}
                      className="font-bold text-lg px-4 py-1 rounded-full min-w-[3rem] text-center bg-white border-2 border-blue-500 focus:outline-none"
                      min="0"
                      max={character.maxHp || 0}
                      autoFocus
                    />
                  ) : (
                    <span 
                      className={`font-bold text-lg px-4 py-1 rounded-full min-w-[3rem] text-center bg-slate-200 border cursor-pointer hover:bg-slate-300 transition-colors ${
                        (character.hp || 0) <= (character.maxHp || 0) * 0.25 ? 'text-red-600 border-red-300 bg-red-100' :
                        (character.hp || 0) <= (character.maxHp || 0) * 0.5 ? 'text-yellow-600 border-yellow-300 bg-yellow-100' :
                        'text-slate-700 border-slate-300 bg-slate-100'
                      }`}
                      onClick={handleHPClick}
                      title="Click to edit HP"
                    >
                      {character.hp || 0}
                    </span>
                  )}
                  <button className="px-2 py-1 rounded bg-green-200 text-green-700 font-bold hover:bg-green-300 disabled:opacity-40" onClick={incrementHP} disabled={(character.hp || 0) >= (character.maxHp || 0)} aria-label="Increase HP">+</button>
                </div>
                <span>/ {character.maxHp || 0}</span>
              </div>
              {/* Health bar indicator */}
              <div className="w-full max-w-xs mx-auto">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all duration-200 ${
                    (character.hp || 0) <= (character.maxHp || 0) * 0.25 ? 'bg-red-500' :
                    (character.hp || 0) <= (character.maxHp || 0) * 0.5 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} style={{ width: `${Math.max(0, Math.min(100, ((character.hp || 0) / (character.maxHp || 1)) * 100))}%` }}></div>
                </div>
              </div>
            </div>
            {/* Only show resources that have more than 0 max points */}
            {(character.resources && character.resources.maxAdrenaline > 0) && (
              <div>Adrenaline: <span className="font-bold text-red-600">{character.resources.adrenaline}</span> / <span className="text-red-400">{character.resources.maxAdrenaline}</span></div>
            )}
            {(character.resources && character.resources.maxMana > 0) && (
              <div>Mana: <span className="font-bold text-blue-600">{character.resources.mana}</span> / <span className="text-blue-400">{character.resources.maxMana}</span></div>
            )}
            {(character.resources && character.resources.maxStamina > 0) && (
              <div>Stamina: <span className="font-bold text-green-600">{character.resources.stamina}</span> / <span className="text-green-400">{character.resources.maxStamina}</span></div>
            )}
            {/* Show message if no resources are available */}
            {(!character.resources || 
              (character.resources.maxAdrenaline <= 0 && 
               character.resources.maxMana <= 0 && 
               character.resources.maxStamina <= 0)) && (
              <div className="text-slate-400 italic">No resources available - invest in skill tree nodes to gain resources</div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-amber-400 text-2xl">📊</span>
            <h3 className="text-xl font-bold text-slate-700">Points Invested</h3>
          </div>
          <div className="space-y-2 text-sm text-slate-700">
            <div>Red: <span className="font-bold text-red-500">{redPoints}</span></div>
            <div>Green: <span className="font-bold text-green-500">{greenPoints}</span></div>
            <div>Blue: <span className="font-bold text-blue-500">{bluePoints}</span></div>
          </div>
        </div>
      </div>
      {/* Traits Card (Collapsible) */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setTraitsOpen(o => !o)}>
          <div className="flex items-center gap-2">
            <span className="text-blue-400 text-2xl">🧬</span>
            <h3 className="text-xl font-bold text-slate-700">Character Traits</h3>
          </div>
          <button className="text-slate-500 hover:text-slate-700 focus:outline-none" aria-label="Toggle Traits">
            {traitsOpen ? <span>▼</span> : <span>▲</span>}
          </button>
        </div>
        {traitsOpen && (
          <div className="mt-4">
            <div className="space-y-3">
              {character.race && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-600">👤</span>
                    <div className="font-semibold text-slate-800">Race: {character.race}</div>
                  </div>
                  <div className="text-xs text-slate-600">Racial bonuses applied to your character</div>
                </div>
              )}
              {character.birthsign && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-purple-600">⭐</span>
                    <div className="font-semibold text-slate-800">Birthsign: {character.birthsign}</div>
                  </div>
                  <div className="text-xs text-slate-600">Birthsign effects applied to your character</div>
                </div>
              )}
              {character.feats && character.feats.length > 0 && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-green-600">⚔️</span>
                    <div className="font-semibold text-slate-800">Feats ({character.feats.length})</div>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    {character.feats.map((featId, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <span className="text-green-500">•</span>
                        {featId}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Special Abilities Card (Collapsible) */}
      {character.specialAbilities && character.specialAbilities.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setAbilitiesOpen(o => !o)}>
            <div className="flex items-center gap-2">
              <span className="text-purple-400 text-2xl">✨</span>
              <h3 className="text-xl font-bold text-slate-700">Special Abilities</h3>
            </div>
            <button className="text-slate-500 hover:text-slate-700 focus:outline-none" aria-label="Toggle Abilities">
              {abilitiesOpen ? <span>▼</span> : <span>▲</span>}
            </button>
          </div>
          {abilitiesOpen && (
            <div className="mt-4">
              <div className="space-y-3">
                {character.specialAbilities.map((ability) => (
                  <div key={ability.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm px-2 py-1 rounded-full text-white font-semibold ${
                        ability.category === 'racial' ? 'bg-blue-500' :
                        ability.category === 'birthsign' ? 'bg-purple-500' :
                        'bg-green-500'
                      }`}>
                        {ability.category}
                      </span>
                      <div className="font-semibold text-slate-800">{ability.name}</div>
                    </div>
                    <div className="text-sm text-slate-600">{ability.description}</div>
                    {ability.effects && (
                      <div className="mt-2 text-xs text-slate-500">
                        {ability.effects.hpBonus && <div>HP Bonus: +{ability.effects.hpBonus}</div>}
                        {ability.effects.manaBonus && <div>Mana Bonus: +{ability.effects.manaBonus}</div>}
                        {ability.effects.staminaBonus && <div>Stamina Bonus: +{ability.effects.staminaBonus}</div>}
                        {ability.effects.acBonus && <div>AC Bonus: +{ability.effects.acBonus}</div>}
                        {ability.effects.speedBonus && <div>Speed Bonus: +{ability.effects.speedBonus} ft</div>}
                        {ability.effects.darkvision && <div>Darkvision: Yes</div>}
                        {ability.effects.resistance && <div>Resistance: {ability.effects.resistance.join(', ')}</div>}
                        {ability.effects.proficiency && <div>Proficiency: {ability.effects.proficiency.join(', ')}</div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Active Abilities Card */}
      <hr className="my-8 border-slate-200" />
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-orange-400 text-2xl">⚡</span>
          <h3 className="text-xl font-bold text-slate-700">Active Abilities</h3>
        </div>
        <div className="space-y-3">
          {activeNodes.length === 0 && <div className="text-slate-400 italic">No active abilities</div>}
          {activeNodes.map(node => (
            <div key={node.id} className="p-3 bg-slate-100 rounded-lg border border-slate-200">
              <div className="font-semibold text-slate-800">{node.name}</div>
              <div className="text-xs text-slate-500">Points: {totalNodePoints && totalNodePoints[node.id]}</div>
              <div className="text-xs text-slate-700 mt-1">{node.description}</div>
              {/* Node choice UI */}
              {node.choices && node.choices.length > 0 && (
                <div className="mt-2">
                  <label className="text-xs font-semibold text-slate-600 mr-2">Choice:</label>
                  <select className="rounded border px-2 py-1 text-xs" value={(character.nodeChoices || {})[node.id] || ''} onChange={e => handleNodeChoiceChange(node.id, e.target.value)}>
                    <option value="" disabled>Select...</option>
                    {node.choices.map(choice => (
                      <option key={choice.value} value={choice.value}>{choice.value}</option>
                    ))}
                  </select>
                  {(character.nodeChoices || {})[node.id] && (
                    <span className="ml-2 text-xs text-blue-700 font-semibold">Selected: {(character.nodeChoices || {})[node.id]}</span>
                  )}
                  {/* Show description for selected choice */}
                  {(character.nodeChoices || {})[node.id] && (
                    <div className="mt-1 text-xs text-slate-600">
                      {node.choices.find(c => c.value === (character.nodeChoices || {})[node.id])?.description}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Inventory Card */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-2xl">🎒</span>
            <h3 className="text-xl font-bold text-slate-700">Inventory</h3>
          </div>
          <button
            onClick={() => {
              const newItem: InventoryItem = {
                id: Date.now().toString(),
                name: 'New Item',
                quantity: 1,
                unit: 'pieces',
                weightPerUnit: 0,
                description: ''
              };
              addInventoryItem(newItem);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm"
          >
            Add Item
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-2 font-semibold text-slate-700">Quantity</th>
                <th className="text-left py-2 px-2 font-semibold text-slate-700">Unit</th>
                <th className="text-left py-2 px-2 font-semibold text-slate-700">Weight/Unit</th>
                <th className="text-left py-2 px-2 font-semibold text-slate-700">Name</th>
                <th className="text-left py-2 px-2 font-semibold text-slate-700">Description</th>
                <th className="text-left py-2 px-2 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(character.inventory || []).map((item) => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateInventoryItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                      className="w-16 px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      min="0"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => updateInventoryItem(item.id, { unit: e.target.value })}
                      className="w-20 px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="pieces"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      value={item.weightPerUnit}
                      onChange={(e) => updateInventoryItem(item.id, { weightPerUnit: parseFloat(e.target.value) || 0 })}
                      className="w-20 px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      min="0"
                      step="0.1"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateInventoryItem(item.id, { name: e.target.value })}
                      className="w-32 px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Item name"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateInventoryItem(item.id, { description: e.target.value })}
                      className="w-48 px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Item description"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <button
                      onClick={() => removeInventoryItem(item.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                      title="Remove item"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(character.inventory || []).length === 0 && (
            <div className="text-center py-8 text-slate-400 italic">
              No items in inventory. Click "Add Item" to get started.
            </div>
          )}
        </div>
      </div>
      {/* Notes Card */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-yellow-400 text-2xl">📝</span>
          <h3 className="text-xl font-bold text-slate-700">Notes</h3>
        </div>
        <textarea
          value={character.notes || ''}
          onChange={(e) => {
            setNotes(e.target.value);
            // Auto-resize the textarea
            e.target.style.height = 'auto';
            e.target.style.height = Math.max(128, e.target.scrollHeight) + 'px';
          }}
          className="w-full p-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-hidden"
          style={{ 
            minHeight: '8rem',
            height: '8rem'
          }}
          placeholder="Add your character notes here... (backstory, personality, goals, etc.)"
        />
      </div>
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
}; 