import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Search, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Navigation } from '@/components/Navigation';
import { RouteGuard } from '@/components/RouteGuard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PersonNode } from '@/components/tree/PersonNode';
import { UnionNode } from '@/components/tree/UnionNode';
import { buildFamilyTree } from '@/lib/treeLayout';

const nodeTypes = {
  personNode: PersonNode,
  unionNode: UnionNode,
};

function TreeContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  
  const { data: people, isLoading: peopleLoading } = trpc.people.getAll.useQuery();
  const { data: partnerships, isLoading: partnershipsLoading } = trpc.partnerships.getAll.useQuery();
  const { data: partnershipChildren, isLoading: childrenLoading } = trpc.partnerships.getAllChildren.useQuery();
  
  const isLoading = peopleLoading || partnershipsLoading || childrenLoading;
  
  // Build tree structure
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!people || !partnerships || !partnershipChildren) {
      return { initialNodes: [], initialEdges: [] };
    }
    
    const { nodes, edges } = buildFamilyTree(people, partnerships, partnershipChildren);
    return { initialNodes: nodes, initialEdges: edges };
  }, [people, partnerships, partnershipChildren]);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Update nodes when initial nodes change
  useMemo(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);
  
  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery || !people) return [];
    const query = searchQuery.toLowerCase();
    return people.filter(
      (p: any) =>
        p.firstName.toLowerCase().includes(query) ||
        p.lastName.toLowerCase().includes(query)
    );
  }, [searchQuery, people]);
  
  // Highlight selected node
  const highlightedNodes = useMemo(() => {
    if (!selectedPersonId) return nodes;
    
    return nodes.map(node => {
      if (node.id === `person-${selectedPersonId}`) {
        return {
          ...node,
          style: {
            ...node.style,
            border: '3px solid #8B0000',
            boxShadow: '0 0 20px rgba(139, 0, 0, 0.5)',
          },
        };
      }
      return node;
    });
  }, [nodes, selectedPersonId]);
  
  // Focus on person
  const focusOnPerson = useCallback(
    (personId: number) => {
      setSelectedPersonId(personId);
      const node = nodes.find(n => n.id === `person-${personId}`);
      if (node) {
        // Zoom to node (this would require ReactFlow instance ref)
        // For now, just highlight it
      }
    },
    [nodes]
  );
  
  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-[#3D5A40] mb-4" />
            <p className="text-[#5A6B5F]">Loading family tree...</p>
          </div>
        </div>
      </>
    );
  }
  
  if (!people || people.length === 0) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
          <Alert>
            <AlertDescription>No family members found. Add people in the Admin panel first.</AlertDescription>
          </Alert>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Navigation />
      <div className="h-screen bg-[#FAF7F2] flex flex-col">
        {/* Header */}
        <header className="border-b border-[#3D5A40]/10 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-3xl font-serif font-bold text-[#2C3E3C] mb-3">Family Tree</h1>
            
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6B5F]" />
              <Input
                type="text"
                placeholder="Search family members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-[#3D5A40]/20 focus:border-[#3D5A40]"
              />
              
              {/* Search Results Dropdown */}
              {searchQuery && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-[#3D5A40]/20 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((person: any) => (
                    <button
                      key={person.id}
                      onClick={() => {
                        focusOnPerson(person.id);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#F5F5F0] transition-colors"
                    >
                      <p className="font-medium text-[#2C3E3C]">
                        {person.firstName} {person.lastName}
                      </p>
                      {person.birthDate && (
                        <p className="text-sm text-[#5A6B5F]">
                          Born {new Date(person.birthDate).getFullYear()}
                        </p>
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
          <ReactFlow
            nodes={highlightedNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.1}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          >
            <Background color="#5A6B5F" gap={16} />
            <Controls className="bg-white border-[#3D5A40]/20" />
            <MiniMap
              nodeColor={(node) => {
                if (node.type === 'unionNode') return '#3D5A40';
                if (node.id === `person-${selectedPersonId}`) return '#8B0000';
                return '#5A6B5F';
              }}
              className="bg-white border-[#3D5A40]/20"
            />
          </ReactFlow>
        </div>
      </div>
    </>
  );
}

export default function Tree() {
  return (
    <RouteGuard requireAuth requireApproval>
      <TreeContent />
    </RouteGuard>
  );
}
