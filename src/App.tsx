import { useEffect, useState } from 'react';
import { SkillTree } from './components/SkillTree';
import { CharacterSheet } from './components/CharacterSheet';
import { useSkillTreeStore } from './store/skillTreeStore';
import { skillNodes } from './data/skillNodes';
import { races, birthsigns, feats } from './data/traits';
import 'reactflow/dist/style.css';
import './index.css';

type TabType = 'skill-tree' | 'race' | 'birthsign' | 'feats';

export default function App() {
  const { loadCharacter, addNode } = useSkillTreeStore();
  const [activeTab, setActiveTab] = useState<TabType>('skill-tree');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (useSkillTreeStore.getState().nodes.length === 0) {
      skillNodes.forEach((node) => {
        addNode(node);
      });
    }
    loadCharacter();
  }, [addNode, loadCharacter]);

  const tabs = [
    { id: 'skill-tree' as TabType, label: 'Skill Tree', icon: '🌳' },
    { id: 'race' as TabType, label: 'Race', icon: '👤' },
    { id: 'birthsign' as TabType, label: 'Birthsign', icon: '⭐' },
    { id: 'feats' as TabType, label: 'Feats', icon: '⚔️' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'skill-tree':
        return <SkillTree />;
      case 'race':
        return <RaceSelection />;
      case 'birthsign':
        return <BirthsignSelection />;
      case 'feats':
        return <FeatsSelection />;
      default:
        return <SkillTree />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 flex items-center justify-center p-6">
      <div className={`flex w-full max-w-7xl h-[90vh] gap-8 transition-all duration-300 ${
        sidebarCollapsed ? 'justify-center' : ''
      }`}>
        {/* Collapsible Sidebar */}
        <div className={`bg-white/80 rounded-2xl shadow-2xl p-4 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'w-16 overflow-hidden' : 'flex-1'
        }`}>
          {/* Collapse/Expand Button */}
          <div className="flex justify-between items-center mb-4">
            {!sidebarCollapsed && (
              <div className="flex border-b border-slate-200 flex-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`flex items-center justify-center w-10 h-10 rounded-lg bg-slate-200 hover:bg-slate-300 transition-colors ${
                sidebarCollapsed ? 'ml-0' : 'ml-2'
              }`}
              title={sidebarCollapsed ? 'Expand Builder' : 'Collapse Builder'}
            >
              <span className="text-lg">
                {sidebarCollapsed ? '→' : '←'}
              </span>
            </button>
          </div>
          
          {/* Tab Content */}
          {!sidebarCollapsed && (
            <div className="flex-1 flex items-center justify-center">
              {renderTabContent()}
            </div>
          )}
          
          {/* Collapsed State - Show Icons Only */}
          {sidebarCollapsed && (
            <div className="flex flex-col items-center space-y-4 mt-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSidebarCollapsed(false)}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title={`${tab.label} (Click to expand)`}
                >
                  <span className="text-xl">{tab.icon}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Character Sheet */}
        <div className={`bg-white/90 rounded-2xl shadow-2xl p-6 overflow-y-auto transition-all duration-300 ${
          sidebarCollapsed ? 'w-full max-w-6xl' : 'w-[600px]'
        }`}>
          <CharacterSheet />
        </div>
      </div>
    </div>
  );
}

// Placeholder components for the new tabs
const RaceSelection: React.FC = () => {
  const { character, setRace } = useSkillTreeStore();

  return (
    <div className="w-full max-w-4xl">
      <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">Choose Your Race</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {races.map((race) => {
          const isSelected = character.race === race.id;
          return (
            <div
              key={race.id}
              onClick={() => setRace(race.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg relative ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  ✓
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{race.icon}</span>
                <h3 className="text-lg font-bold text-slate-800">{race.name}</h3>
              </div>
              <p className="text-sm text-slate-600 mb-3">{race.description}</p>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Racial Bonuses:</h4>
                <div className="text-xs text-slate-600">{race.effects.description}</div>
              </div>
            </div>
          );
        })}
      </div>
      {character.race && (
        <div className="mt-6 text-center">
          <div className="text-sm text-slate-600 mb-2">
            Selected: <span className="font-semibold text-blue-600">{races.find(r => r.id === character.race)?.name}</span>
          </div>
          <button 
            onClick={() => setRace('')}
            className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors font-semibold"
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
};

const BirthsignSelection: React.FC = () => {
  const { character, setBirthsign } = useSkillTreeStore();

  return (
    <div className="w-full max-w-6xl">
      <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">Choose Your Birthsign</h2>
      <p className="text-center text-slate-600 mb-6">Your birthsign determines your destiny and grants you unique abilities</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {birthsigns.map((birthsign) => {
          const isSelected = character.birthsign === birthsign.id;
          return (
            <div
              key={birthsign.id}
              onClick={() => setBirthsign(birthsign.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg relative ${
                isSelected
                  ? 'border-purple-500 bg-purple-50 shadow-lg'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  ✓
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{birthsign.icon}</span>
                <h3 className="text-lg font-bold text-slate-800">{birthsign.name}</h3>
              </div>
              <p className="text-sm text-slate-600 mb-3">{birthsign.description}</p>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Effects:</h4>
                <div className="text-xs text-slate-600">{birthsign.effects.description}</div>
              </div>
            </div>
          );
        })}
      </div>
      {character.birthsign && (
        <div className="mt-6 text-center">
          <div className="text-sm text-slate-600 mb-2">
            Selected: <span className="font-semibold text-purple-600">{birthsigns.find(b => b.id === character.birthsign)?.name}</span>
          </div>
          <button 
            onClick={() => setBirthsign('')}
            className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors font-semibold"
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
};

const FeatsSelection: React.FC = () => {
  const { character, toggleFeat } = useSkillTreeStore();

  return (
    <div className="w-full max-w-6xl">
      <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">Choose Your Feats</h2>
      <p className="text-center text-slate-600 mb-6">Feats represent special abilities that set your character apart</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {feats.map((feat) => {
          const isSelected = character.feats && character.feats.includes(feat.id);
          return (
            <div
              key={feat.id}
              onClick={() => toggleFeat(feat.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg relative ${
                isSelected
                  ? 'border-green-500 bg-green-50 shadow-lg'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  ✓
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{feat.icon}</span>
                <h3 className="text-lg font-bold text-slate-800">{feat.name}</h3>
              </div>
              <p className="text-sm text-slate-600 mb-3">{feat.description}</p>
              {feat.requirements.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Requirements:</h4>
                  {feat.requirements.map((req, index) => (
                    <div key={index} className="text-xs text-red-600 flex items-start gap-1">
                      <span className="text-red-500 mt-0.5">•</span>
                      {req}
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Benefits:</h4>
                {feat.benefits.map((benefit, index) => (
                  <div key={index} className="text-xs text-slate-600 flex items-start gap-1">
                    <span className="text-green-500 mt-0.5">•</span>
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {character.feats && character.feats.length > 0 && (
        <div className="mt-6 text-center">
          <div className="mb-4">
            <p className="text-sm text-slate-600">Selected Feats: <span className="font-semibold text-green-600">{character.feats.length}</span></p>
            <p className="text-xs text-slate-500">Click feats to select/deselect them</p>
          </div>
          <div className="text-xs text-slate-600 mb-2">
            Selected: {character.feats.map(featId => feats.find(f => f.id === featId)?.name).filter(Boolean).join(', ')}
          </div>
        </div>
      )}
    </div>
  );
}; 