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
const GENERATION_VERTICAL_SPACING = 350; // Vertical space between generations
const HORIZONTAL_SPACING = 200; // Horizontal space between people

interface FamilyCluster {
  people: Set<number>;
  generation: number;
}

/**
 * Calculate generation level for each person based on parent-child relationships
 */
function calculateGenerations(
  people: Person[],
  partnerships: Partnership[],
  partnershipChildren: PartnershipChild[]
): Map<number, number> {
  const generations = new Map<number, number>();
  
  // Build child -> parents mapping
  const childToParentship = new Map<number, number>();
  partnershipChildren.forEach(pc => {
    childToParentship.set(pc.childId, pc.partnershipId);
  });
  
  // Find root people (no parents in the dataset)
  const childIds = new Set(partnershipChildren.map(pc => pc.childId));
  const rootPeople = people.filter(p => !childIds.has(p.id));
  
  // Assign generation 1 to root people
  rootPeople.forEach(person => {
    generations.set(person.id, 1);
  });
  
  // BFS to assign generations to descendants
  const queue = [...rootPeople.map(p => p.id)];
  const visited = new Set<number>(queue);
  
  while (queue.length > 0) {
    const personId = queue.shift()!;
    const currentGen = generations.get(personId)!;
    
    // Find all partnerships where this person is a parent
    const parentPartnerships = partnerships.filter(
      p => p.partner1Id === personId || p.partner2Id === personId
    );
    
    // Find all children from these partnerships
    parentPartnerships.forEach(partnership => {
      const children = partnershipChildren
        .filter(pc => pc.partnershipId === partnership.id)
        .map(pc => pc.childId);
      
      children.forEach(childId => {
        if (!visited.has(childId)) {
          visited.add(childId);
          generations.set(childId, currentGen + 1);
          queue.push(childId);
        }
      });
    });
  }
  
  // For any people not yet assigned, use birth year as fallback
  people.forEach(person => {
    if (!generations.has(person.id)) {
      const birthYear = getYearFromDateAsNumber(person.birthDate);
      if (birthYear) {
        const estimatedGen = Math.floor((birthYear - 1880) / 30) + 1;
        generations.set(person.id, Math.max(1, estimatedGen));
      } else {
        generations.set(person.id, 3);
      }
    }
  });
  
  return generations;
}

/**
 * Build family clusters - groups of related people who should be positioned near each other
 */
function buildFamilyClusters(
  people: Person[],
  partnerships: Partnership[],
  partnershipChildren: PartnershipChild[],
  generations: Map<number, number>
): FamilyCluster[] {
  const clusters: FamilyCluster[] = [];
  const assigned = new Set<number>();
  
  // Group by generation first
  const peopleByGen = new Map<number, Person[]>();
  people.forEach(p => {
    const gen = generations.get(p.id) || 1;
    const genPeople = peopleByGen.get(gen) || [];
    genPeople.push(p);
    peopleByGen.set(gen, genPeople);
  });
  
  // For each generation, create clusters based on partnerships
  peopleByGen.forEach((genPeople, gen) => {
    genPeople.forEach(person => {
      if (assigned.has(person.id)) return;
      
      // Find all partners of this person
      const personPartnerships = partnerships.filter(
        p => p.partner1Id === person.id || p.partner2Id === person.id
      );
      
      if (personPartnerships.length > 0) {
        // Create a cluster with this person and their partners
        const cluster: FamilyCluster = {
          people: new Set([person.id]),
          generation: gen,
        };
        
        personPartnerships.forEach(p => {
          const partnerId = p.partner1Id === person.id ? p.partner2Id : p.partner1Id;
          if (generations.get(partnerId) === gen) {
            cluster.people.add(partnerId);
            assigned.add(partnerId);
          }
        });
        
        assigned.add(person.id);
        clusters.push(cluster);
      } else {
        // Single person cluster
        clusters.push({
          people: new Set([person.id]),
          generation: gen,
        });
        assigned.add(person.id);
      }
    });
  });
  
  return clusters;
}

export function buildFamilyTree(
  people: Person[],
  partnerships: Partnership[],
  partnershipChildren: PartnershipChild[]
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  // Calculate generation levels
  const generations = calculateGenerations(people, partnerships, partnershipChildren);
  
  // Build family clusters
  const clusters = buildFamilyClusters(people, partnerships, partnershipChildren, generations);
  
  // Group clusters by generation
  const clustersByGen = new Map<number, FamilyCluster[]>();
  clusters.forEach(cluster => {
    const genClusters = clustersByGen.get(cluster.generation) || [];
    genClusters.push(cluster);
    clustersByGen.set(cluster.generation, genClusters);
  });
  
  // Position people within clusters
  const personPositions = new Map<number, { x: number; y: number }>();
  const peopleMap = new Map(people.map(p => [p.id, p]));
  
  clustersByGen.forEach((genClusters, gen) => {
    const y = (gen - 1) * GENERATION_VERTICAL_SPACING + 100;
    
    // Calculate total width needed for this generation
    const totalPeople = genClusters.reduce((sum, c) => sum + c.people.size, 0);
    const totalWidth = totalPeople * HORIZONTAL_SPACING;
    let currentX = -totalWidth / 2;
    
    genClusters.forEach(cluster => {
      // Sort people in cluster by last name
      const clusterPeople = Array.from(cluster.people)
        .map(id => peopleMap.get(id)!)
        .filter(p => p)
        .sort((a, b) => {
          const lastNameCompare = a.lastName.localeCompare(b.lastName);
          if (lastNameCompare !== 0) return lastNameCompare;
          return a.firstName.localeCompare(b.firstName);
        });
      
      clusterPeople.forEach(person => {
        personPositions.set(person.id, { x: currentX, y });
        
        nodes.push({
          id: `person-${person.id}`,
          type: 'personNode',
          data: { person, generation: gen },
          position: { x: currentX, y },
        });
        
        currentX += HORIZONTAL_SPACING;
      });
    });
  });
  
  // Create union nodes for partnerships
  partnerships.forEach(partnership => {
    const unionId = `union-${partnership.id}`;
    
    const pos1 = personPositions.get(partnership.partner1Id);
    const pos2 = personPositions.get(partnership.partner2Id);
    
    if (pos1 && pos2) {
      const unionX = (pos1.x + pos2.x) / 2;
      const unionY = Math.max(pos1.y, pos2.y) + NODE_HEIGHT / 2 + 40;
      
      const gen1 = generations.get(partnership.partner1Id) || 1;
      const gen2 = generations.get(partnership.partner2Id) || 1;
      const unionGen = Math.max(gen1, gen2);
      
      nodes.push({
        id: unionId,
        type: 'unionNode',
        data: { partnership, generation: unionGen },
        position: { x: unionX, y: unionY },
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
    }
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

function getYearFromDateAsNumber(date: string | Date | null | undefined): number | null {
  if (!date) return null;
  try {
    if (date instanceof Date) {
      return date.getFullYear();
    }
    return new Date(date).getFullYear();
  } catch {
    return null;
  }
}
