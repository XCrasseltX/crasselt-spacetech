// /components/StaticStarBuffer.ts
import * as THREE from 'three';

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

export function generateStaticStars(count = 1500): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  const starVertices: number[] = [];
  const starColors: number[] = [];

  for (let i = 0; i < count; i++) {
    const radius = Math.pow(Math.random(), 2) * 600;
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.random() * Math.PI / 2;

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = -Math.abs(radius * Math.cos(phi));

    starVertices.push(x, y, z);

    const color = getRandomStarColor();
    starColors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));

  const material = new THREE.PointsMaterial({
    size: 1.5,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    vertexColors: true,
    map: new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png'),
    alphaTest: 0.5,
  });

  return new THREE.Points(geometry, material);
}
