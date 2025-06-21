import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useSkillTreeStore } from '../store/skillTreeStore';
import { SkillNode } from './SkillNode';
import type { SkillNode as SkillNodeType } from '../types/skillTree';

const nodeTypes: NodeTypes = {
  skillNode: SkillNode,
};

const colorMap: Record<string, string> = {
  red: '#ef4444',
  green: '#22c55e',
  blue: '#3b82f6',
  gray: '#6b7280',
};

function prerequisitesMet(
  node: SkillNodeType,
  nodes: SkillNodeType[],
  nodePoints: Record<string, number>
): boolean {
  if (!node.prerequisites || node.prerequisites.length === 0) return true;
  return node.prerequisites.every((prereq: { id: string; points: number }) => {
    const prereqNode = nodes.find((n: SkillNodeType) => n.id === prereq.id);
    return prereqNode && (nodePoints[prereq.id] || 0) >= prereq.points;
  });
}

export const SkillTree: React.FC = () => {
  const { nodes: storeNodes, character } = useSkillTreeStore();

  // Transform SkillNode objects into ReactFlow Node objects
  const flowNodes = useMemo(() => storeNodes.map((node: SkillNodeType) => ({
    id: node.id,
    type: 'skillNode',
    position: node.position,
    data: node,
  })), [storeNodes]);

  // Generate edges with color-coding and locked/unlocked styling
  const flowEdges = useMemo(() => {
    const edges: Edge[] = [];
    storeNodes.forEach((targetNode: SkillNodeType) => {
      if (targetNode.prerequisites) {
        targetNode.prerequisites.forEach((prereq: { id: string; points: number }) => {
          const sourceNode = storeNodes.find((n: SkillNodeType) => n.id === prereq.id);
          if (!sourceNode) return;
          const isUnlocked = prerequisitesMet(targetNode, storeNodes, character.nodePoints);
          edges.push({
            id: `${prereq.id}->${targetNode.id}`,
            source: prereq.id,
            target: targetNode.id,
            type: 'smoothstep',
            animated: isUnlocked,
            style: {
              stroke: colorMap[targetNode.color] || colorMap.gray,
              strokeWidth: isUnlocked ? 3 : 2,
              opacity: isUnlocked ? 1 : 0.4,
              strokeDasharray: isUnlocked ? '0' : '6,6',
              filter: isUnlocked ? 'drop-shadow(0 0 6px ' + (colorMap[targetNode.color] || colorMap.gray) + ')' : 'none',
            },
          });
        });
      }
    });
    return edges;
  }, [storeNodes, character.nodePoints]);

  const { investPoint, removePoint } = useSkillTreeStore();
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const nodeId = node.id;
    if (event.altKey) {
      removePoint(nodeId);
    } else {
      investPoint(nodeId);
    }
  }, [investPoint, removePoint]);

  return (
    <div
      className="w-full h-full"
      style={{ width: '100%', height: '100vh', minHeight: 600 }}
    >
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}; 