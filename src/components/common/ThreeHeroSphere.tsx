import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Props {
  className?: string;
}

export const ThreeHeroSphere: React.FC<Props> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 6.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for entire sphere & orbital system
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Central Abstract Core Sphere (Wireframe & Inner Glowing Dodecahedron)
    const sphereGeo = new THREE.IcosahedronGeometry(1.6, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9, // Tailwind cyan/sky-500
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.Mesh(sphereGeo, wireMat);
    mainGroup.add(wireMesh);

    const innerGeo = new THREE.DodecahedronGeometry(1.0, 0);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false,
      transparent: true,
      opacity: 0.65,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerMesh);

    // 2. Orbital Rings
    const ringGeo1 = new THREE.RingGeometry(2.3, 2.34, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    mainGroup.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(2.7, 2.74, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xa855f7, // purple
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 6;
    mainGroup.add(ring2);

    // 3. 5 Orbiting Data Nodes (Patients, Triage, Doctors, AI, Safety)
    const nodeColors = [
      0x38bdf8, // Patients (Sky)
      0xf59e0b, // Triage (Amber)
      0x10b981, // Doctors (Emerald)
      0x8b5cf6, // AI (Violet)
      0xef4444, // Safety (Rose)
    ];

    const nodes: THREE.Mesh[] = [];
    const nodeDistance = 2.4;

    nodeColors.forEach((col, idx) => {
      const nodeGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.6,
        roughness: 0.3,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      mainGroup.add(nodeMesh);
      nodes.push(nodeMesh);
    });

    // 4. Subtle Floating Particle Points
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 6;
      particlePositions[i + 1] = (Math.random() - 0.5) * 5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 4;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.04,
      transparent: true,
      opacity: 0.5,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    mainGroup.add(particlePoints);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 2.5, 10);
    pointLight.position.set(3, 3, 4);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xa855f7, 2, 10);
    pointLight2.position.set(-3, -2, -3);
    scene.add(pointLight2);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const speed = prefersReducedMotion ? 0.05 : 0.6;

      // Rotate group gently
      mainGroup.rotation.y = elapsedTime * 0.25 * speed;
      mainGroup.rotation.x = Math.sin(elapsedTime * 0.15) * 0.12 * speed;

      // Pulse inner core
      const pulse = 1 + Math.sin(elapsedTime * 1.5) * 0.04;
      innerMesh.scale.set(pulse, pulse, pulse);
      innerMesh.rotation.y += 0.005;
      innerMesh.rotation.z += 0.003;

      wireMesh.rotation.y -= 0.002;

      // Orbit the 5 nodes
      nodes.forEach((node, i) => {
        const offset = (i * (Math.PI * 2)) / nodes.length;
        const angle = elapsedTime * 0.45 * speed + offset;
        const x = Math.cos(angle) * (nodeDistance + Math.sin(elapsedTime * 0.8 + i) * 0.15);
        const z = Math.sin(angle) * (nodeDistance + Math.cos(elapsedTime * 0.8 + i) * 0.15);
        const y = Math.sin(angle * 2 + i) * 0.55;
        node.position.set(x, y, z);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize handling via ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;
        if (width && height) {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }
    });

    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sphereGeo.dispose();
      innerGeo.dispose();
      ringGeo1.dispose();
      ringGeo2.dispose();
      particleGeo.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`relative w-full h-full min-h-[220px] flex items-center justify-center overflow-hidden ${className}`}>
      <div ref={containerRef} className="w-full h-full absolute inset-0 pointer-events-none" />
    </div>
  );
};
