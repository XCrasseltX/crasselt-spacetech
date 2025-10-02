// /components/BlackHole.ts
import * as THREE from 'three';

export function createBlackHole(position: THREE.Vector3): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(20, 64, 64);
  const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position); // 👈 this line was missing
  return mesh;
}
