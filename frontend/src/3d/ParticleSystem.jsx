import * as THREE from 'three';

class ParticleSystem {
  constructor() {
    this.count = 2000;
    this.createParticles();
    this.velocities = [];
    this.initializeVelocities();
  }

  createParticles() {
    const geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);

    for (let i = 0; i < this.count; i++) {
      // Random positions in a sphere
      const radius = 15 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = Math.sin(phi) * Math.cos(theta) * radius;
      const y = Math.sin(phi) * Math.sin(theta) * radius * 0.5; // Flatten vertically
      const z = Math.cos(phi) * radius;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Colors based on position
      const color = new THREE.Color();
      const hue = (theta / (Math.PI * 2) + 0.5) % 1.0;
      color.setHSL(hue, 0.8, 0.5 + (y / 20) * 0.3);

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
  }

  initializeVelocities() {
    for (let i = 0; i < this.count; i++) {
      this.velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      });
    }
  }

  update(delta, emotion) {
    const positions = this.particles.geometry.attributes.position.array;
    
    // Adjust particle behavior based on emotion
    let speedFactor = 1.0;
    let colorFactor = 1.0;
    
    switch (emotion) {
      case 'stressed':
        speedFactor = 2.0;
        colorFactor = 1.5;
        break;
      case 'bored':
        speedFactor = 0.3;
        colorFactor = 0.5;
        break;
      case 'focused':
        speedFactor = 0.8;
        colorFactor = 1.2;
        break;
      case 'happy':
        speedFactor = 1.5;
        colorFactor = 1.3;
        break;
    }

    for (let i = 0; i < this.count; i++) {
      // Update positions with emotion-based speed
      positions[i * 3] += this.velocities[i].x * delta * 30 * speedFactor;
      positions[i * 3 + 1] += this.velocities[i].y * delta * 30 * speedFactor;
      positions[i * 3 + 2] += this.velocities[i].z * delta * 30 * speedFactor;

      // Boundary check and reset
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      
      const distance = Math.sqrt(x*x + y*y + z*z);
      if (distance > 25) {
        // Reset to inner sphere
        const radius = 15 + Math.random() * 5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
        positions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * radius * 0.5;
        positions[i * 3 + 2] = Math.cos(phi) * radius;
        
        // Reset velocity
        this.velocities[i] = {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02
        };
      }
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
    
    // Slowly rotate the entire system
    this.particles.rotation.y += delta * 0.05 * speedFactor;
    this.particles.rotation.x += delta * 0.02;
  }

  dispose() {
    this.particles.geometry.dispose();
    this.particles.material.dispose();
  }
}

export default ParticleSystem;