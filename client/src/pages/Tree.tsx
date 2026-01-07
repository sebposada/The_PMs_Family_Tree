import { useState, useMemo, useCallback, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { trpc } from '../lib/trpc';
import { useAuth } from '../_core/hooks/useAuth';
import { getLoginUrl } from '../const';
import { Link } from 'wouter';

interface PersonData {
  id: number;
  firstName: string;
  lastName: string;
  birthDate?: Date | string | null;
  deathDate?: Date | string | null;
  primaryPhotoUrl?: string | null;
}

// Custom person node component
function PersonNode({ data }: { data: PersonData }) {
  const birthYear = data.birthDate ? new Date(data.birthDate).getFullYear() : null;
  const deathYear = data.deathDate ? new Date(data.deathDate).getFullYear() : null;
  
  const dateRange = birthYear
    ? deathYear
      ? `${birthYear}–${deathYear}`
      : birthYear.toString()
    : '';

  return (
    <div className="w-[160px] bg-white rounded-lg shadow-md border-2 border-[#3D5A40]/20 hover:border-[#3D5A40] hover:shadow-lg transition-all">
      {/* Photo */}
      <div className="relative w-full h-[100px] bg-[#E8EDE9] rounded-t-lg overflow-hidden">
        {data.primaryPhotoUrl ? (
          <img
            src={data.primaryPhotoUrl}
            alt={`${data.firstName} ${data.lastName}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-[#3D5A40]/30"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2">
        <h3 className="font-semibold text-[#3D5A40] text-xs truncate">
          {data.firstName} {data.lastName}
        </h3>
        {dateRange && (
          <p className="text-[10px] text-[#5A6B5F] mt-1">{dateRange}</p>
        )}
      </div>
    </div>
  );
}

const nodeTypes = {
  person: PersonNode,
};

export default function Tree() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data
  const { data: people = [], isLoading: peopleLoading } = trpc.people.getAll.useQuery();
  const { data: partnerships = [], isLoading: partnershipsLoading } = trpc.partnerships.getAll.useQuery();
  const { data: partnershipChildren = [], isLoading: childrenLoading } = trpc.partnerships.getAllChildren.useQuery();

  console.log('Tree data:', { people: people.length, partnerships: partnerships.length, children: partnershipChildren.length });
  console.log('Loading states:', { peopleLoading, partnershipsLoading, childrenLoading });

  // Build tree layout
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    console.log('useMemo triggered, people.length:', people.length);
    if (!people.length) {
      console.log('No people, returning empty nodes');
      return { nodes: [], edges: [] };
    }

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Create a map of person ID to their partnerships
    const personToPartnerships = new Map<number, number[]>();
    partnerships.forEach(ps => {
      if (!personToPartnerships.has(ps.partner1Id)) {
        personToPartnerships.set(ps.partner1Id, []);
      }
      if (!personToPartnerships.has(ps.partner2Id)) {
        personToPartnerships.set(ps.partner2Id, []);
      }
      personToPartnerships.get(ps.partner1Id)!.push(ps.id);
      personToPartnerships.get(ps.partner2Id)!.push(ps.id);
    });

    // Create a map of person ID to their children
    const personToChildren = new Map<number, number[]>();
    partnershipChildren.forEach((pc: any) => {
      const partnership = partnerships.find(p => p.id === pc.partnershipId);
      if (partnership) {
        if (!personToChildren.has(partnership.partner1Id)) {
          personToChildren.set(partnership.partner1Id, []);
        }
        if (!personToChildren.has(partnership.partner2Id)) {
          personToChildren.set(partnership.partner2Id, []);
        }
        personToChildren.get(partnership.partner1Id)!.push(pc.childId);
        personToChildren.get(partnership.partner2Id)!.push(pc.childId);
      }
    });

    // Find root people (those who are not children of any partnership)
    const allChildrenIds = new Set(partnershipChildren.map((pc: any) => pc.childId));
    const rootPeople = people.filter(p => !allChildrenIds.has(p.id));

    // Simple grid layout
    let currentY = 0;
    const GENERATION_GAP = 250;
    const SIBLING_GAP = 200;
    const processedPeople = new Set<number>();

    // Process people generation by generation
    const processGeneration = (peopleInGeneration: typeof people, y: number) => {
      let x = 0;
      
      peopleInGeneration.forEach((person, index) => {
        if (processedPeople.has(person.id)) return;
        
        processedPeople.add(person.id);
        
        // Add person node
        nodes.push({
          id: `person-${person.id}`,
          type: 'person',
          position: { x, y },
          data: person,
        });

        // Find their children for next generation
        const children = personToChildren.get(person.id) || [];
        children.forEach(childId => {
          edges.push({
            id: `edge-${person.id}-${childId}`,
            source: `person-${person.id}`,
            target: `person-${childId}`,
            type: 'smoothstep',
            style: { stroke: '#3D5A40', strokeWidth: 2 },
          });
        });

        x += SIBLING_GAP;
      });

      // Return children for next generation
      const nextGen = new Set<number>();
      peopleInGeneration.forEach(person => {
        const children = personToChildren.get(person.id) || [];
        children.forEach(childId => nextGen.add(childId));
      });
      
      return Array.from(nextGen).map(id => people.find(p => p.id === id)!).filter(Boolean);
    };

    // Start with root generation
    let currentGeneration = rootPeople;
    while (currentGeneration.length > 0) {
      currentGeneration = processGeneration(currentGeneration, currentY);
      currentY += GENERATION_GAP;
    }

    // Add any remaining people who weren't connected
    let x = 0;
    people.forEach(person => {
      if (!processedPeople.has(person.id)) {
        nodes.push({
          id: `person-${person.id}`,
          type: 'person',
          position: { x, y: currentY },
          data: person,
        });
        x += SIBLING_GAP;
      }
    });

    console.log('Generated nodes:', nodes.length, 'edges:', edges.length);
    return { nodes, edges };
  }, [people, partnerships, partnershipChildren]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when data changes
  useEffect(() => {
    console.log('useEffect: updating nodes and edges', initialNodes.length, initialEdges.length);
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Search functionality
  const filteredPeople = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return people.filter(p =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(query)
    );
  }, [people, searchQuery]);

  const onNodeClick = useCallback((_event: any, node: Node) => {
    console.log('Clicked node:', node);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F7F6] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#3D5A40] mb-4">
            Family Tree
          </h1>
          <p className="text-[#5A6B5F] mb-6">
            Please log in to view the family tree
          </p>
          <a
            href={getLoginUrl()}
            className="inline-block px-6 py-3 bg-[#3D5A40] text-white rounded-lg hover:bg-[#2D4A30] transition-colors"
          >
            Log In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7F6] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#3D5A40]/10 p-4">
        <div className="container flex items-center justify-between">
          <div>
            <Link href="/" className="text-2xl font-bold text-[#3D5A40] hover:text-[#2D4A30]">
              The PMs Family Archive
            </Link>
            <p className="text-sm text-[#5A6B5F] mt-1">Family Tree Visualization</p>
          </div>

          {/* Search */}
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search family members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-[#3D5A40]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D5A40]/30"
            />
            {searchQuery && filteredPeople.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#3D5A40]/20 rounded-lg shadow-lg max-h-64 overflow-y-auto z-10">
                {filteredPeople.map((person) => (
                  <button
                    key={person.id}
                    className="w-full px-4 py-2 text-left hover:bg-[#E8EDE9] transition-colors"
                    onClick={() => {
                      setSearchQuery('');
                    }}
                  >
                    <div className="font-medium text-[#3D5A40]">
                      {person.firstName} {person.lastName}
                    </div>
                    {person.birthDate && (
                      <div className="text-xs text-[#5A6B5F]">
                        {new Date(person.birthDate).getFullYear()}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tree Visualization */}
      <div className="flex-1">
        {nodes.length > 0 ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.1}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          >
            <Background />
            <Controls />
            <MiniMap nodeColor="#3D5A40" />
          </ReactFlow>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3D5A40] mx-auto mb-4"></div>
              <p className="text-[#5A6B5F]">Loading family tree...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
