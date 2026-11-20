import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ChatbotDroplet3DProps {
  size?: number;
}

export const ChatbotDroplet3D: React.FC<ChatbotDroplet3DProps> = ({ size = 44 }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 2.8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Droplet geometry
    const geometry = new THREE.SphereGeometry(0.85, 24, 24);
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i);
      if (y > 0) {
        pos.setY(i, y * 1.35);
        const taper = Math.max(0.1, 1.0 - (y / 1.5) * 0.4);
        pos.setX(i, pos.getX(i) * taper);
        pos.setZ(i, pos.getZ(i) * taper);
      }
    }
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({
      color: 0x0879D9,
      emissive: 0x22D3EE,
      emissiveIntensity: 0.35,
      specular: 0x38BDF8,
      shininess: 90,
      transparent: true,
      opacity: 0.88,
    });

    const droplet = new THREE.Mesh(geometry, material);
    scene.add(droplet);

    const light = new THREE.DirectionalLight(0xffffff, 2.5);
    light.position.set(2, 4, 3);
    scene.add(light);

    const ambLight = new THREE.AmbientLight(0x0879D9, 1.2);
    scene.add(ambLight);

    let frameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      droplet.rotation.y = t * 1.2;
      droplet.position.y = Math.sin(t * 3.0) * 0.08;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [size]);

  return <div ref={mountRef} style={{ width: size, height: size }} className="shrink-0" />;
};
