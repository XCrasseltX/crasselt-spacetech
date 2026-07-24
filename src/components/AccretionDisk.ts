// /components/AccretionDisk.ts
import * as THREE from 'three';

export function createAccretionDisk(position: THREE.Vector3): THREE.Mesh {
  const geometry = new THREE.TorusGeometry(40, 10, 40, 128); // normal torus
  const material = new THREE.MeshBasicMaterial({
    color: 0xff9933,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);

  // Position in space
  mesh.position.copy(position);

  // Make it look more like a CD: flatten it
  mesh.scale.set(1, 1, 0.1);
  mesh.rotation.x = Math.PI / -2.3;
  mesh.rotation.z = 0.3;

  return mesh;
}
