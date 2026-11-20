import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeWaterDropletProps {
  className?: string;
  particleCount?: number;
  interactive?: boolean;
}

export const ThreeWaterDroplet: React.FC<ThreeWaterDropletProps> = ({
  className = "w-full h-[400px]",
  particleCount = 1800,
  interactive = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 400;
    const height = containerRef.current.clientHeight || 400;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 2. Geometry: Tear-drop deformed sphere of particles
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorCyan = new THREE.Color(0x22d3ee);
    const colorDeepBlue = new THREE.Color(0x0879d9);
    const colorAqua = new THREE.Color(0x38bdf8);

    for (let i = 0; i < particleCount; i++) {
      // Golden spiral distribution on sphere
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;

      let r = 1.35;
      let x = r * Math.sin(phi) * Math.cos(theta);
      let y = r * Math.cos(phi);
      let z = r * Math.sin(phi) * Math.sin(theta);

      // Elongate top to give droplet / teardrop profile
      if (y > 0) {
        y *= 1.45;
        const taper = 1.0 - (y / 2.0) * 0.45;
        x *= Math.max(0.1, taper);
        z *= Math.max(0.1, taper);
      } else {
        // Round bottom droplet bulb
        y *= 0.95;
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      // Color gradient from bottom deep blue to top luminous cyan
      const mixRatio = (y + 1.2) / 2.6;
      const vertexColor = colorDeepBlue.clone().lerp(colorCyan, Math.max(0, Math.min(1, mixRatio)));
      if (Math.random() > 0.85) {
        vertexColor.lerp(colorAqua, 0.5);
      }

      colors[i * 3] = vertexColor.r;
      colors[i * 3 + 1] = vertexColor.g;
      colors[i * 3 + 2] = vertexColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle texture canvas for soft glowing circular particle
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.3, 'rgba(56,189,248,0.8)');
      gradient.addColorStop(0.7, 'rgba(8,121,217,0.3)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.075,
      map: particleTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Inner glowing core sphere
    const coreGeo = new THREE.SphereGeometry(0.7, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x0879d9,
      transparent: true,
      opacity: 0.25,
      wireframe: true
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (event: MouseEvent) => {
      if (!interactive || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop with ripple & wave displacement
    let clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Fluid rotation
      particles.rotation.y = elapsedTime * 0.25 + mouseX * 0.5;
      particles.rotation.x = Math.sin(elapsedTime * 0.2) * 0.15 + mouseY * 0.2;
      coreMesh.rotation.y = -elapsedTime * 0.3;

      // Subtle pulse and water wave distortion on vertices
      const posAttr = geometry.attributes.position;
      const posArray = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];

        // Harmonic wave formulas
        const wave = Math.sin(elapsedTime * 2.5 + oy * 3.0) * 0.045 +
                     Math.cos(elapsedTime * 1.8 + ox * 3.0) * 0.035;

        posArray[i * 3] = ox + ox * wave;
        posArray[i * 3 + 1] = oy + wave * 0.5;
        posArray[i * 3 + 2] = oz + oz * wave;
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      renderer.dispose();
    };
  }, [particleCount, interactive]);

  return <div ref={containerRef} className={className} />;
};
