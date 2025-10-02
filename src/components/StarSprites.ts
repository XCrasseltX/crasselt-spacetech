// /components/StarSprites.ts
import * as THREE from 'three';

export function createStarField(scene: THREE.Scene, count = 500) {
  const loader = new THREE.TextureLoader();
  const texture = loader.load('https://threejs.org/examples/textures/sprites/disc.png');

  const stars: {
    sprite: THREE.Sprite;
    baseSize: number;
    flickerPhase: number;
    colorPhase?: number;
    isFancy?: boolean;
  }[] = [];

  for (let i = 0; i < count; i++) {
    const material = new THREE.SpriteMaterial({
      map: texture,
      color: getRandomStarColor(),
      transparent: true,
      opacity: 0.8,
    });

    const sprite = new THREE.Sprite(material);
    const radius = Math.pow(Math.random(), 2) * 600;
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.random() * Math.PI / 2;

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = -Math.abs(radius * Math.cos(phi));
    sprite.position.set(x, y, z);

    const isFancy = Math.random() < 0.2;
    const baseSize = Math.random() * 1.5 + 0.5;
    const flickerPhase = Math.random() * Math.PI * 2;
    const colorPhase = Math.random() * Math.PI * 2;

    sprite.scale.setScalar(baseSize);
    scene.add(sprite);

    stars.push({ sprite, baseSize, flickerPhase, isFancy, colorPhase: isFancy ? colorPhase : undefined });
  }

  return () => {
    const now = Date.now() * 0.001;
    for (const star of stars) {
      const flicker = 0.5 + 0.5 * Math.sin(now + star.flickerPhase);
      star.sprite.scale.setScalar(star.baseSize * flicker);

      if (star.isFancy) {
        const t = (Math.sin(now + star.colorPhase!) + 1) / 2;
        const r = 0.6 + 0.4 * Math.sin(t * Math.PI * 3);
        const g = 0.6 + 0.4 * Math.sin(t * Math.PI * 3 + (2 * Math.PI / 3));
        const b = 0.6 + 0.4 * Math.sin(t * Math.PI * 3 + (4 * Math.PI / 3));
        star.sprite.material.color.setRGB(r, g, b);
      }
    }
  };
}

function getRandomStarColor(): THREE.Color {
  const chance = Math.random();
  if (chance < 0.1) return new THREE.Color(`rgb(${90 + Math.random() * 20}, ${140 + Math.random() * 30}, ${180 + Math.random() * 30})`);
  else if (chance < 0.5) return new THREE.Color(`rgb(${200 + Math.random() * 30}, ${170 + Math.random() * 40}, ${90 + Math.random() * 20})`);
  else if (chance < 0.6) return new THREE.Color(`rgb(${200 + Math.random() * 40}, ${70 + Math.random() * 30}, ${70 + Math.random() * 30})`);
  else {
    const b = 170 + Math.random() * 40;
    return new THREE.Color(`rgb(${b}, ${b}, ${b})`);
  }
}
