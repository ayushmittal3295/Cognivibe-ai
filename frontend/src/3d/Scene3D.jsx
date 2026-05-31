import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useStore } from '../store/useStore';
import EmotionSphere from './EmotionSphere';
import ParticleSystem from './ParticleSystem';

const Scene3D = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const emotionSphereRef = useRef(null);
  const particleSystemRef = useRef(null);
  const animationFrameRef = useRef(null);

  const { currentMood, theme } = useStore();

  useEffect(() => {
    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    sceneRef.current = scene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 10);
    cameraRef.current = camera;

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 5;
    controls.maxDistance = 20;
    controlsRef.current = controls;

    // Lighting
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);

    // Main directional light
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    dirLight.receiveShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    const d = 10;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 15;
    scene.add(dirLight);

    // Fill lights
    const fillLight1 = new THREE.PointLight(0x4466ff, 0.5);
    fillLight1.position.set(-5, 3, 5);
    scene.add(fillLight1);

    const fillLight2 = new THREE.PointLight(0xff6644, 0.5);
    fillLight2.position.set(5, 1, 5);
    scene.add(fillLight2);

    // Create emotion sphere
    const emotionSphere = new EmotionSphere();
    emotionSphere.mesh.position.y = 2;
    scene.add(emotionSphere.mesh);
    emotionSphereRef.current = emotionSphere;

    // Create particle system
    const particleSystem = new ParticleSystem();
    scene.add(particleSystem.particles);
    particleSystemRef.current = particleSystem;

    // Add a subtle grid floor
    const gridHelper = new THREE.GridHelper(20, 20, 0x4466ff, 0x2244aa);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Add floating orbs around the main sphere
    const orbCount = 8;
    const orbs = [];
    for (let i = 0; i < orbCount; i++) {
      const geometry = new THREE.SphereGeometry(0.1, 16, 16);
      const material = new THREE.MeshStandardMaterial({
        color: 0x4466ff,
        emissive: 0x112233,
        roughness: 0.2,
        metalness: 0.8
      });
      const orb = new THREE.Mesh(geometry, material);
      
      const angle = (i / orbCount) * Math.PI * 2;
      const radius = 3.5;
      orb.position.set(
        Math.cos(angle) * radius,
        2 + Math.sin(angle * 2) * 0.5,
        Math.sin(angle) * radius
      );
      
      scene.add(orb);
      orbs.push({ mesh: orb, angle, radius, speed: 0.5 + Math.random() * 0.5 });
    }

    // Animation loop
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const elapsedTime = performance.now() * 0.001; // seconds

      // Update emotion sphere based on current mood
      if (emotionSphereRef.current) {
        emotionSphereRef.current.update(currentMood?.emotion, delta);
      }

      // Update particle system
      if (particleSystemRef.current) {
        particleSystemRef.current.update(delta, currentMood?.emotion);
      }

      // Animate floating orbs
      orbs.forEach((orb, i) => {
        orb.angle += delta * orb.speed * 0.5;
        orb.mesh.position.x = Math.cos(orb.angle) * orb.radius;
        orb.mesh.position.z = Math.sin(orb.angle) * orb.radius;
        orb.mesh.position.y = 2 + Math.sin(orb.angle * 2) * 0.5;
        
        // Rotate orbs
        orb.mesh.rotation.x += 0.01;
        orb.mesh.rotation.y += 0.02;
      });

      // Update controls
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Render
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (emotionSphereRef.current) {
        emotionSphereRef.current.dispose();
      }
      if (particleSystemRef.current) {
        particleSystemRef.current.dispose();
      }
    };
  }, []);

  // FIXED: Added pointer-events-none to allow clicking through to UI
  return <div ref={mountRef} className="fixed inset-0 -z-10 pointer-events-none" />;
};

export default Scene3D;