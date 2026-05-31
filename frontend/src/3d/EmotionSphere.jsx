import * as THREE from 'three';

class EmotionSphere {
  constructor() {
    this.createSphere();
    this.createGlow();
    this.currentColor = new THREE.Color(0x4466ff);
    this.targetColor = new THREE.Color(0x4466ff);
    this.pulseIntensity = 0;
  }

  createSphere() {
    // Main sphere geometry with more detail
    const geometry = new THREE.SphereGeometry(1.5, 64, 64);
    
    // Custom shader material for better visual effects
    const material = new THREE.MeshStandardMaterial({
      color: 0x4466ff,
      emissive: 0x112244,
      roughness: 0.2,
      metalness: 0.3,
      emissiveIntensity: 0.5
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    // Add floating particles inside the sphere
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      // Random positions within sphere
      const r = Math.random() * 1.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      particlePositions[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      particlePositions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
      particlePositions[i * 3 + 2] = Math.cos(phi) * r;
    }
    
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.03,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    
    this.innerParticles = new THREE.Points(particleGeo, particleMat);
    this.mesh.add(this.innerParticles);
  }

  createGlow() {
    // Outer glow effect using a larger transparent sphere
    const glowGeometry = new THREE.SphereGeometry(1.8, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x4466ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    
    this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    this.mesh.add(this.glowMesh);
  }

  update(emotion, delta) {
    // Update colors based on emotion
    this.updateEmotionColor(emotion);
    
    // Smooth color transition
    this.mesh.material.color.lerp(this.targetColor, 0.05);
    this.glowMesh.material.color.lerp(this.targetColor, 0.05);
    
    // Update glow intensity based on emotion intensity
    const intensity = emotion === 'happy' ? 0.3 : 
                      emotion === 'stressed' ? 0.4 :
                      emotion === 'bored' ? 0.1 :
                      emotion === 'focused' ? 0.25 : 0.15;
    
    this.glowMesh.material.opacity = intensity;
    
    // Pulse effect
    this.pulseIntensity += delta * 2;
    const pulse = Math.sin(this.pulseIntensity) * 0.05 + 1;
    this.mesh.scale.set(pulse, pulse, pulse);
    
    // Rotate inner particles
    if (this.innerParticles) {
      this.innerParticles.rotation.y += delta * 0.2;
      this.innerParticles.rotation.x += delta * 0.1;
    }
  }

  updateEmotionColor(emotion) {
    switch (emotion) {
      case 'happy':
        this.targetColor.setHex(0xffaa44);
        break;
      case 'sad':
        this.targetColor.setHex(0x4466aa);
        break;
      case 'angry':
        this.targetColor.setHex(0xff4433);
        break;
      case 'stressed':
        this.targetColor.setHex(0xaa44ff);
        break;
      case 'bored':
        this.targetColor.setHex(0x88aaff);
        break;
      case 'focused':
        this.targetColor.setHex(0x44ffaa);
        break;
      default:
        this.targetColor.setHex(0x4466ff);
    }
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.glowMesh.geometry.dispose();
    this.glowMesh.material.dispose();
    if (this.innerParticles) {
      this.innerParticles.geometry.dispose();
      this.innerParticles.material.dispose();
    }
  }
}

export default EmotionSphere;