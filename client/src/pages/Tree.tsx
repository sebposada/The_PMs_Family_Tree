import { useState, useMemo } from 'react';
import { FamilyTree, BasicPersonCard } from '@alexbrand09/famtreejs';
import '@alexbrand09/famtreejs/styles.css';
import type { FamilyTreeData, NodeComponentProps } from '@alexbrand09/famtreejs';
import { trpc } from '../lib/trpc';
import { useAuth } from '../_core/hooks/useAuth';
import { getLoginUrl } from '../const';
import { Link } from 'wouter';

interface PersonData {
  firstName: string;
  lastName: string;
  birthDate?: Date | string | null;
  deathDate?: Date | string | null;
  primaryPhotoUrl?: string | null;
}

// Custom person card component matching our design
function CustomPersonCard({ data, isSelected, isHovered }: NodeComponentProps<PersonData>) {
  const birthYear = data.birthDate ? new Date(data.birthDate).getFullYear() : null;
  const deathYear = data.deathDate ? new Date(data.deathDate).getFullYear() : null;
  
  const dateRange = birthYear
    ? deathYear
      ? `${birthYear}–${deathYear}`
      : birthYear.toString()
    : '';

  return (
    <div
      className={`
        w-[180px] bg-white rounded-lg shadow-md border-2 transition-all
        ${isSelected ? 'border-[#3D5A40] shadow-lg' : 'border-[#3D5A40]/20'}
        ${isHovered ? 'shadow-xl scale-105' : ''}
      `}
    >
      {/* Photo */}
      <div className="relative w-full h-[120px] bg-[#E8EDE9] rounded-t-lg overflow-hidden">
        {data.primaryPhotoUrl ? (
          <img
            src={data.primaryPhotoUrl}
            alt={`${data.firstName} ${data.lastName}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-[#3D5A40]/30"
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
      <div className="p-3">
        <h3 className="font-semibold text-[#3D5A40] text-sm truncate">
          {data.firstName} {data.lastName}
        </h3>
        {dateRange && (
          <p className="text-xs text-[#5A6B5F] mt-1">{dateRange}</p>
        )}
      </div>
    </div>
  );
}

export default function Tree() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data
  const { data: people = [] } = trpc.people.getAll.useQuery();
  const { data: partnerships = [] } = trpc.partnerships.getAll.useQuery();
  const { data: partnershipChildren = [] } = trpc.partnerships.getAllChildren.useQuery();

  // Transform data to famtreejs format
  const treeData: FamilyTreeData<PersonData> | null = useMemo(() => {
    if (!people.length || !partnerships.length) return null;

    return {
      people: people.map(p => ({
        id: p.id.toString(),
        data: {
          firstName: p.firstName,
          lastName: p.lastName,
          birthDate: p.birthDate,
          deathDate: p.deathDate,
          primaryPhotoUrl: p.primaryPhotoUrl,
        },
      })),
      partnerships: partnerships.map(ps => ({
        id: ps.id.toString(),
        partnerIds: [ps.partner1Id.toString(), ps.partner2Id.toString()],
        childIds: partnershipChildren
          .filter((pc: any) => pc.partnershipId === ps.id)
          .map((pc: any) => pc.childId.toString()),
      })),
    };
  }, [people, partnerships, partnershipChildren]);

  // Search functionality
  const filteredPeople = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return people.filter(p =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(query)
    );
  }, [people, searchQuery]);

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
                      // Center on this person
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
      <div className="flex-1 relative">
        {treeData ? (
          <FamilyTree
            data={treeData}
            nodeComponent={CustomPersonCard}
            orientation="top-down"
            theme="light"
            spacing={{
              generation: 300,
              siblings: 100,
              partners: 60,
            }}
            initialZoom={0.8}
            minZoom={0.3}
            maxZoom={2}
            onPersonClick={(id, data) => {
              console.log('Clicked person:', id, data);
            }}
          />
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
