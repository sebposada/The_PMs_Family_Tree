import { Handle, Position } from '@xyflow/react';
import { User } from 'lucide-react';
import { useLocation } from 'wouter';
import type { Person } from '@/lib/treeLayout';
import { getYearFromDate } from '@/lib/treeLayout';

interface PersonNodeProps {
  data: {
    person: Person;
  };
}

export function PersonNode({ data }: PersonNodeProps) {
  const { person } = data;
  const [, setLocation] = useLocation();
  
  const birthYear = getYearFromDate(person.birthDate);
  const deathYear = getYearFromDate(person.deathDate);
  const years = birthYear || deathYear ? `${birthYear}${birthYear && deathYear ? '–' : ''}${deathYear}` : '';
  
  const handleClick = () => {
    setLocation(`/people/${person.id}`);
  };
  
  return (
    <div
      onClick={handleClick}
      className="bg-white border-2 border-[#3D5A40] rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer w-[180px]"
    >
      {/* Top handle for incoming edges (from parents) */}
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-[#3D5A40]" />
      
      <div className="p-3">
        {/* Photo */}
        <div className="w-20 h-20 mx-auto mb-2 rounded-full overflow-hidden bg-[#F5F5F0] flex items-center justify-center">
          {person.primaryPhotoUrl ? (
            <img
              src={person.primaryPhotoUrl}
              alt={`${person.firstName} ${person.lastName}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-[#5A6B5F]" />
          )}
        </div>
        
        {/* Name */}
        <div className="text-center">
          <p className="font-serif font-semibold text-[#2C3E3C] text-sm leading-tight">
            {person.firstName}
          </p>
          <p className="font-serif font-semibold text-[#2C3E3C] text-sm leading-tight">
            {person.lastName}
          </p>
        </div>
        
        {/* Years */}
        {years && (
          <p className="text-center text-xs text-[#5A6B5F] mt-1">
            {years}
          </p>
        )}
      </div>
      
      {/* Bottom handle for outgoing edges (to children) */}
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-[#3D5A40]" />
    </div>
  );
}
