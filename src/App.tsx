import { useEffect } from 'react';
import { SkillTree } from './components/SkillTree';
import { CharacterSheet } from './components/CharacterSheet';
import { useSkillTreeStore } from './store/skillTreeStore';
import { skillNodes } from './data/skillNodes';
import 'reactflow/dist/style.css';
import './index.css';

export default function App() {
  const { loadCharacter, addNode } = useSkillTreeStore();

  useEffect(() => {
    if (useSkillTreeStore.getState().nodes.length === 0) {
      skillNodes.forEach((node) => {
        addNode(node);
      });
    }
    loadCharacter();
  }, [addNode, loadCharacter]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 flex items-center justify-center p-6">
      <div className="flex w-full max-w-7xl h-[90vh] gap-8">
        <div className="flex-1 bg-white/80 rounded-2xl shadow-2xl p-4 flex items-center justify-center">
          <SkillTree />
        </div>
        <div className="w-[600px] bg-white/90 rounded-2xl shadow-2xl p-6 overflow-y-auto">
          <CharacterSheet />
        </div>
      </div>
    </div>
  );
} 