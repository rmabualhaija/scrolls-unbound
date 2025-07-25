import { Handle, Position } from 'reactflow';
import { useSkillTreeStore, prerequisitesMet, getTotalNodePoints } from '../store/skillTreeStore';
import type { SkillNode as SkillNodeType } from '../types/skillTree';

interface SkillNodeProps {
  data: SkillNodeType;
}

const colorMap: Record<string, string> = {
  red: '#ef4444',    // Tailwind red-500
  green: '#22c55e',  // Tailwind green-500
  blue: '#3b82f6',   // Tailwind blue-500
  gray: '#6b7280',   // Tailwind gray-500
};

export const SkillNode = ({ data }: SkillNodeProps) => {
  const { character, nodes } = useSkillTreeStore();
  const totalNodePoints = getTotalNodePoints(character.nodePoints, character.freeNodePoints);
  const points = totalNodePoints[data.id] || 0;

  const bgColor = colorMap[data.color] || colorMap.gray;

  const locked = !prerequisitesMet(data, nodes, totalNodePoints, character.points || { red: 0, green: 0, blue: 0 });
  console.log(`Node ${data.name} (id: ${data.id}) locked:`, locked, 'prerequisites:', data.prerequisites);

  return (
    <div className="flex flex-col items-center transform transition-all duration-200 hover:scale-105">
      <Handle type="target" position={Position.Top} />
      <div
        className={`relative w-48 h-36 rounded-xl border border-black/20 flex flex-col items-center justify-center text-center text-white mb-2 transition-all duration-200 shadow-lg/40 hover:shadow-2xl backdrop-blur-md bg-white/20 cursor-pointer
          ${locked ? 'opacity-60 grayscale-[60%] cursor-not-allowed pointer-events-none' : 'hover:scale-105'}`}
        style={{ 
          backgroundColor: bgColor, 
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
        }}
      >
        {/* Lock Icon Overlay */}
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="opacity-80">
              <rect x="5" y="11" width="14" height="8" rx="2" fill="#fff" fillOpacity="0.7" />
              <rect x="5" y="11" width="14" height="8" rx="2" stroke="#334155" strokeWidth="1.5" />
              <path d="M8 11V8a4 4 0 1 1 8 0v3" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="15" r="1.5" fill="#334155" />
            </svg>
          </div>
        )}
        <div className="text-xl font-bold mb-1 drop-shadow-sm z-20">{data.name}</div>
        <div className="text-xs font-semibold mb-1 opacity-80 z-20">Tier {data.tier} &bull; Cost: {data.cost}</div>
        <div className="text-xs mb-1 z-20">HP Bonus: <span className="font-semibold">{data.hpBonus}</span></div>
        <div className="text-xs mb-1 z-20">Points: <span className="font-semibold">{points}</span></div>
        {locked && data.prerequisites && (
          <div className="text-xs text-red-200 mt-1 px-2 z-20">
            <div className="font-semibold mb-1">Requires:</div>
            {data.prerequisites.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-1">
                {group.prerequisites.map(prereq => {
                  const prereqNode = nodes.find(n => n.id === prereq.id);
                  return (
                    <div key={prereq.id} className="text-[10px] leading-tight">
                      {prereq.points} points in {prereqNode?.name || prereq.id}
                      <span className="text-red-300">
                        ({(totalNodePoints && totalNodePoints[prereq.id]) || 0}/{prereq.points})
                      </span>
                    </div>
                  );
                })}
                {group.prerequisites.length > 1 && (
                  <div className="text-[9px] text-red-300 italic">
                    ({group.relationship})
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}; 