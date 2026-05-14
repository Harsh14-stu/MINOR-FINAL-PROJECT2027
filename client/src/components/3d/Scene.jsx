import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, PerspectiveCamera, OrbitControls } from '@react-three/drei';

const CyberNode = ({ position, color, shape }) => {
  const meshRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(time / 4) + position[0];
    meshRef.current.rotation.y = Math.cos(time / 4) + position[1];
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh position={position} ref={meshRef}>
        {shape === 'box' && <boxGeometry args={[1, 1, 1]} />}
        {shape === 'sphere' && <sphereGeometry args={[0.8, 32, 32]} />}
        {shape === 'torus' && <torusGeometry args={[0.6, 0.2, 16, 100]} />}
        {shape === 'octahedron' && <octahedronGeometry args={[1]} />}
        
        <meshPhysicalMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.2}
          wireframe={shape === 'box'}
        />
      </mesh>
    </Float>
  );
};

const ConnectingLines = () => {
  // Simple abstract lines in the background
  return (
    <group position={[0, 0, -10]}>
      <mesh>
        <torusGeometry args={[15, 0.02, 16, 100]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.1} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[20, 0.02, 16, 100]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.1} />
      </mesh>
    </group>
  );
};

const Scene = () => {
  return (
    <div className="absolute inset-0 z-0 bg-gray-950 pointer-events-none">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={45} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#06b6d4" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        <spotLight position={[0, 15, 0]} penumbra={1} intensity={2} color="#8b5cf6" />
        
        <Stars radius={50} depth={50} count={3000} factor={4} saturation={1} fade speed={1} />
        
        <ConnectingLines />

        {/* Floating background geometries */}
        <CyberNode position={[-8, 4, -5]} color="#06b6d4" shape="octahedron" />
        <CyberNode position={[8, -3, -8]} color="#3b82f6" shape="torus" />
        <CyberNode position={[-5, -5, -4]} color="#8b5cf6" shape="sphere" />
        <CyberNode position={[6, 5, -6]} color="#0ea5e9" shape="box" />
        
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#030712_100%)] opacity-80" />
    </div>
  );
};

export default Scene;
