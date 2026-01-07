import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';

export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  birthDate?: Date | string | null;
  deathDate?: Date | string | null;
  primaryPhotoUrl?: string | null;
}

export interface Partnership {
  id: number;
  partner1Id: number;
  partner2Id: number;
}

export interface PartnershipChild {
  partnershipId: number;
  childId: number;
}

const NODE_WIDTH = 180;
const NODE_HEIGHT = 220;
const UNION_NODE_SIZE = 20;

export function buildFamilyTree(
  people: Person[],
  partnerships: Partnership[],
  partnershipChildren: PartnershipChild[]
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  const peopleMap = new Map(people.map(p => [p.id, p]));
  const childToParentship = new Map<number, number>();
  
  // Map children to their partnerships
  partnershipChildren.forEach(pc => {
    childToParentship.set(pc.childId, pc.partnershipId);
  });
  
  // Find root people (those who are not children in any partnership)
  const childIds = new Set(partnershipChildren.map(pc => pc.childId));
  const rootPeople = people.filter(p => !childIds.has(p.id));
  
  // Create person nodes
  people.forEach(person => {
    nodes.push({
      id: `person-${person.id}`,
      type: 'personNode',
      data: { person },
      position: { x: 0, y: 0 },
    });
  });
  
  // Create union nodes for partnerships and edges
  partnerships.forEach(partnership => {
    const unionId = `union-${partnership.id}`;
    
    // Create union node
    nodes.push({
      id: unionId,
      type: 'unionNode',
      data: { partnership },
      position: { x: 0, y: 0 },
    });
    
    // Connect partners to union
    edges.push({
      id: `${partnership.partner1Id}-${unionId}`,
      source: `person-${partnership.partner1Id}`,
      target: unionId,
      type: 'smoothstep',
      style: { stroke: '#5A6B5F', strokeWidth: 2 },
    });
    
    edges.push({
      id: `${partnership.partner2Id}-${unionId}`,
      source: `person-${partnership.partner2Id}`,
      target: unionId,
      type: 'smoothstep',
      style: { stroke: '#5A6B5F', strokeWidth: 2 },
    });
    
    // Connect union to children
    const children = partnershipChildren
      .filter(pc => pc.partnershipId === partnership.id)
      .map(pc => pc.childId);
    
    children.forEach(childId => {
      edges.push({
        id: `${unionId}-${childId}`,
        source: unionId,
        target: `person-${childId}`,
        type: 'smoothstep',
        style: { stroke: '#5A6B5F', strokeWidth: 2 },
      });
    });
  });
  
  // Use Dagre for automatic layout
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ 
    rankdir: 'TB', // Top to bottom
    nodesep: 80,
    ranksep: 120,
    marginx: 50,
    marginy: 50,
  });
  
  // Add nodes to dagre
  nodes.forEach(node => {
    const width = node.type === 'unionNode' ? UNION_NODE_SIZE : NODE_WIDTH;
    const height = node.type === 'unionNode' ? UNION_NODE_SIZE : NODE_HEIGHT;
    dagreGraph.setNode(node.id, { width, height });
  });
  
  // Add edges to dagre
  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
  
  // Calculate layout
  dagre.layout(dagreGraph);
  
  // Apply calculated positions
  nodes.forEach(node => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const width = node.type === 'unionNode' ? UNION_NODE_SIZE : NODE_WIDTH;
    const height = node.type === 'unionNode' ? UNION_NODE_SIZE : NODE_HEIGHT;
    
    node.position = {
      x: nodeWithPosition.x - width / 2,
      y: nodeWithPosition.y - height / 2,
    };
  });
  
  return { nodes, edges };
}

export function getYearFromDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  try {
    if (date instanceof Date) {
      return date.getFullYear().toString();
    }
    return new Date(date).getFullYear().toString();
  } catch {
    return '';
  }
}
