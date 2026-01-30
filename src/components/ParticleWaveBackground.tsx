// components/AuroraBackground.tsx
'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';

function AuroraMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color('#0ea5e9') },
    uColor2: { value: new THREE.Color('#8b5cf6') },
    uColor3: { value: new THREE.Color('#06b6d4') },
    uIntensity: { value: 1.0 }, // Nouveau uniform pour l'intensité
  }), []);

  const vertexShader = `
    varying vec2 vUv;
    varying float vElevation;
    uniform float uTime;
    
    void main() {
      vUv = uv;
      
      vec3 pos = position;
      float elevation = sin(pos.x * 2.0 + uTime * 0.5) * 0.3 +
                       sin(pos.y * 1.5 + uTime * 0.3) * 0.2 +
                       sin((pos.x + pos.y) * 1.0 + uTime * 0.7) * 0.25;
      
      pos.z += elevation;
      vElevation = elevation;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    varying float vElevation;
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform float uIntensity;
    
    void main() {
      float mixStrength = (vElevation + 0.5) * 0.5 + sin(vUv.x * 3.14159 + uTime * 0.2) * 0.3;
      
      vec3 color = mix(uColor1, uColor2, smoothstep(0.0, 0.5, mixStrength));
      color = mix(color, uColor3, smoothstep(0.5, 1.0, mixStrength));
      
      // Augmenter l'intensité des couleurs
      color = color * uIntensity;
      
      float alpha = 0.4 + vElevation * 0.3;
      alpha *= smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
      alpha *= smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
      
      // Augmenter l'opacité pour le mode sombre
      gl_FragColor = vec4(color, alpha * 0.8);
    }
  `;

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      // Augmenter l'intensité en mode sombre
      materialRef.current.uniforms.uIntensity.value = 1.5;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-0.5, 0, 0.1]} position={[0, -1, -4]}>
      <planeGeometry args={[25, 15, 64, 64]} /> {/* Agrandi */}
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function StarField() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 1000; // Augmenté

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = -Math.random() * 20 - 2;
      siz[i] = Math.random() * 3 + 0.8; // Tailles augmentées
    }
    
    return [pos, siz];
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const time = state.clock.elapsedTime;
      
      for (let i = 0; i < count; i++) {
        const originalY = (Math.sin(i * 123.456) - 0.5) * 25;
        positions[i * 3 + 1] = originalY + Math.sin(time * 3 + i) * 0.03;
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05} // Augmenté
        color="#ffffff"
        transparent
        opacity={0.9} // Augmenté
        sizeAttenuation
      />
    </points>
  );
}

function NebulaClouds() {
  const cloudsRef = useRef<THREE.Group>(null);
  
  const clouds = useMemo(() => [
    { pos: [-5, 3, -10], size: 5, color: '#7c3aed', opacity: 0.08 },
    { pos: [6, -2, -12], size: 6, color: '#0ea5e9', opacity: 0.07 },
    { pos: [-3, -3, -8], size: 4, color: '#ec4899', opacity: 0.06 },
    { pos: [4, 4, -15], size: 7, color: '#06b6d4', opacity: 0.07 },
    { pos: [0, 0, -6], size: 4.5, color: '#8b5cf6', opacity: 0.09 },
  ], []);

  useFrame((state) => {
    if (cloudsRef.current) {
      const time = state.clock.elapsedTime;
      cloudsRef.current.children.forEach((cloud, i) => {
        cloud.position.x = clouds[i].pos[0] + Math.sin(time * 0.1 + i) * 0.8;
        cloud.position.y = clouds[i].pos[1] + Math.cos(time * 0.15 + i * 2) * 0.5;
        const scale = clouds[i].size * (1 + Math.sin(time * 0.2 + i * 3) * 0.15);
        cloud.scale.setScalar(scale);
      });
    }
  });

  return (
    <group ref={cloudsRef}>
      {clouds.map((cloud, i) => (
        <mesh key={i} position={cloud.pos as [number, number, number]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial
            color={cloud.color}
            transparent
            opacity={cloud.opacity}
          />
        </mesh>
      ))}
    </group>
  );
}

function GlowOrbs() {
  const orbsRef = useRef<THREE.Group>(null);
  
  const orbs = useMemo(() => [
    { position: [-4, 1, -5], size: 2.5, color: '#8b5cf6', speed: 0.5 },
    { position: [3, -1, -6], size: 3, color: '#ec4899', speed: 0.3 },
    { position: [0, 0, -4], size: 2, color: '#a855f7', speed: 0.7 },
    { position: [-2, -2, -7], size: 2.3, color: '#d946ef', speed: 0.4 },
    { position: [5, 2, -8], size: 3.5, color: '#6366f1', speed: 0.2 },
  ], []);

  useFrame((state) => {
    if (!orbsRef.current) return;
    const time = state.clock.elapsedTime;
    
    orbsRef.current.children.forEach((orb, i) => {
      const data = orbs[i];
      orb.position.x = data.position[0] + Math.sin(time * data.speed) * 0.8;
      orb.position.y = data.position[1] + Math.cos(time * data.speed * 1.5) * 0.5;
      
      const scale = 1 + Math.sin(time * data.speed * 2) * 0.2;
      orb.scale.setScalar(scale);
    });
  });

  return (
    <group ref={orbsRef}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={orb.position as [number, number, number]}>
          <sphereGeometry args={[orb.size, 32, 32]} />
          <meshBasicMaterial 
            color={orb.color} 
            transparent 
            opacity={0.12} // Augmenté
          />
        </mesh>
      ))}
    </group>
  );
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 200; // Augmenté

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = -Math.random() * 10 - 1;
      
      vel[i * 3] = (Math.random() - 0.5) * 0.015;
      vel[i * 3 + 1] = Math.random() * 0.025 + 0.008;
      vel[i * 3 + 2] = 0;
    }
    
    return [pos, vel];
  }, []);

  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        positions[i * 3] += velocities[i * 3];
        positions[i * 3 + 1] += velocities[i * 3 + 1];
        
        if (positions[i * 3 + 1] > 8) {
          positions[i * 3 + 1] = -8;
          positions[i * 3] = (Math.random() - 0.5) * 20;
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08} // Augmenté
        color="#a78bfa"
        transparent
        opacity={0.8} // Augmenté
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Scene() {
  return (
    <>
      {/* Utiliser un fond plus foncé mais pas noir pur */}
      <color attach="background" args={['#0a0a1a']} />
      <fog attach="fog" args={['#0a0a1a', 5, 25]} />
      
      {/* Ajouter plus de lumière */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#3b82f6" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      
      <StarField />
      <NebulaClouds />
      <GlowOrbs />
      <AuroraMesh />
      <FloatingParticles />
    </>
  );
}

export default function AuroraBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 65 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          alpha: false, // Désactiver l'alpha pour un fond solide
          powerPreference: "high-performance"
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}