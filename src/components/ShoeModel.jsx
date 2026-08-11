import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';

export function ShoeModel({ color, type, ...props }) {
  const group = useRef();
  
  // Add some floating animation
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 0.5; // Rotate continuously
    group.current.position.y = Math.sin(t) * 0.1; // Bob up and down
  });

  return (
    <group ref={group} {...props} dispose={null} scale={1.5} position={[0, -0.5, 0]}>
      
      {/* AIR PHANTOM */}
      {type === 'phantom' && (
        <>
          <RoundedBox args={[1.8, 0.5, 0.8]} position={[0, 0, 0]} radius={0.1} smoothness={4}>
            <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
          </RoundedBox>
          <RoundedBox args={[1.85, 0.2, 0.85]} position={[0, -0.35, 0]} radius={0.05} smoothness={4}>
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </RoundedBox>
          <RoundedBox args={[0.7, 0.6, 0.7]} position={[-0.4, 0.5, 0]} radius={0.1} smoothness={4}>
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
          </RoundedBox>
        </>
      )}

      {/* LACED CLASSIC */}
      {type === 'classic' && (
        <>
          <RoundedBox args={[1.6, 0.6, 0.7]} position={[0, 0, 0]} radius={0.15} smoothness={4}>
            <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
          </RoundedBox>
          <RoundedBox args={[1.7, 0.25, 0.8]} position={[0, -0.4, 0]} radius={0.1} smoothness={4}>
            <meshStandardMaterial color="#e0e0e0" roughness={0.9} />
          </RoundedBox>
          <RoundedBox args={[0.8, 0.4, 0.6]} position={[-0.3, 0.4, 0]} radius={0.1} smoothness={4}>
            <meshStandardMaterial color="#ffffff" roughness={0.8} />
          </RoundedBox>
        </>
      )}

      {/* NEON RUNNER */}
      {type === 'runner' && (
        <>
          <RoundedBox args={[1.9, 0.4, 0.9]} position={[0, 0, 0]} radius={0.05} smoothness={4}>
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
          </RoundedBox>
          <RoundedBox args={[1.95, 0.3, 0.95]} position={[0, -0.35, 0]} radius={0.1} smoothness={4}>
            <meshStandardMaterial color="#333333" roughness={0.2} />
          </RoundedBox>
        </>
      )}

    </group>
  );
}
