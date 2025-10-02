// /shaders/gravitationalLens.ts
import * as THREE from 'three';


export const GravitationalLensShader = {
    uniforms: {
        tDiffuse: { value: null },
        resolution: { value: new THREE.Vector2() },
        lensCenter: { value: new THREE.Vector2(0.5, 0.5) },
        strength: { value: 0.03 },
        holeRadius: { value: 0.1 },
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        uniform vec2 lensCenter;
        uniform float strength;
        uniform float holeRadius;


        varying vec2 vUv;


        void main() {
        vec2 delta = (vUv - lensCenter) * vec2(resolution.x / resolution.y, 1.0);
        float dist = length(delta);
        vec2 tangent = vec2(-delta.y, delta.x);
        float ring = smoothstep(holeRadius, holeRadius + 0.01, dist);
        float distortion = strength * ring * exp(-dist * 25.0);
        vec2 offset = normalize(tangent) * distortion;
        vec2 uvOffset = clamp(vUv + offset, vec2(0.0), vec2(1.0));
        gl_FragColor = texture2D(tDiffuse, uvOffset);
        }
    `,
};