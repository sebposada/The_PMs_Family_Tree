import { Handle, Position } from '@xyflow/react';

export function UnionNode() {
  return (
    <div className="relative">
      {/* Top handles for incoming edges (from partners) */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="partner1"
        className="w-2 h-2 !bg-[#3D5A40] !left-[25%]" 
      />
      <Handle 
        type="target" 
        position={Position.Top} 
        id="partner2"
        className="w-2 h-2 !bg-[#3D5A40] !left-[75%]" 
      />
      
      {/* Union node visual */}
      <div className="w-5 h-5 rounded-full bg-[#3D5A40] border-2 border-white shadow-md" />
      
      {/* Bottom handle for outgoing edges (to children) */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-2 h-2 !bg-[#3D5A40]" 
      />
    </div>
  );
}
