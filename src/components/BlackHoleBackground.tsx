// /components/GalaxyBackground.tsx
'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

import { GravitationalLensShader } from '../shaders/gravitationalLens';
import { createAccretionDisk } from './AccretionDisk';
import { createBlackHole } from './BlackHole';
import { createStarField } from './StarSprites';
import { generateStaticStars } from './StaticStarBuffer';

export default function GalaxyBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(50, 0, 200);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Schwarzes Loch und Akkretionsscheibe
    const blackHolePos = new THREE.Vector3(70, 0, 100);
    const blackHole = createBlackHole(blackHolePos);
    const accretionDisk = createAccretionDisk(blackHolePos);
    scene.add(blackHole);
    scene.add(accretionDisk);

    // Sterne
    const stars = generateStaticStars();
    scene.add(stars);
    const updateSprites = createStarField(scene, 1000);

    // Shader Postprocessing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const lensPass = new ShaderPass(GravitationalLensShader);
    composer.addPass(lensPass);

    lensPass.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);

    const screenPos = blackHole.position.clone().project(camera);
    lensPass.uniforms.lensCenter.value.set((screenPos.x + 1) / 2, (screenPos.y + 1) / 2);
    lensPass.uniforms.strength.value = 3;
    lensPass.uniforms.holeRadius.value = 0.11;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      stars.rotation.z += 0.0006;
      updateSprites();

      // 👇 Update lens center based on actual position
      const screenPos = blackHole.position.clone().project(camera);
      lensPass.uniforms.lensCenter.value.set(
        (screenPos.x + 1) / 2,
        (screenPos.y + 1) / 2
      );

      composer.render();
      accretionDisk.rotation.z += 0.002;
    };

    animate();

    // Resize handling
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      lensPass.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }} />;
}


/*  
'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

function getRandomStarColor(): THREE.Color {
  const chance = Math.random();

  if (chance < 0.1) {
    const r = 90 + Math.random() * 20;
    const g = 140 + Math.random() * 30;
    const b = 180 + Math.random() * 30;
    return new THREE.Color(`rgb(${r}, ${g}, ${b})`);
  } else if (chance < 0.5) {
    const r = 200 + Math.random() * 30;
    const g = 170 + Math.random() * 40;
    const b = 90 + Math.random() * 20;
    return new THREE.Color(`rgb(${r}, ${g}, ${b})`);
  } else if (chance < 0.6) {
    const r = 200 + Math.random() * 40;
    const g = 70 + Math.random() * 30;
    const b = 70 + Math.random() * 30;
    return new THREE.Color(`rgb(${r}, ${g}, ${b})`);
  } else {
    const brightness = 170 + Math.random() * 40;
    return new THREE.Color(`rgb(${brightness}, ${brightness}, ${brightness})`);
  }
}

function createStarField(scene: THREE.Scene, count = 500) {
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

    stars.push({
      sprite,
      baseSize,
      flickerPhase,
      isFancy,
      colorPhase: isFancy ? colorPhase : undefined,
    });
  }

  const update = () => {
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

  return update;
}

export default function GalaxyBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(50, 0, 200);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Schwarzes Loch
    const blackHoleGeometry = new THREE.SphereGeometry(20, 64, 64);
    const blackHoleMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);
    blackHole.position.set(50, 0, 100);
    scene.add(blackHole);

    const accretionGeometry = new THREE.PlaneGeometry(80, 80, 64, 64);

    const accretionMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(1.0, 0.6, 0.1) }, // orangene Flammenfarbe
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        varying vec2 vUv;

        void main() {
          float dist = distance(vUv, vec2(0.5));
          float ring = smoothstep(0.35, 0.4, dist) - smoothstep(0.4, 0.45, dist);

          float flicker = 0.8 + 0.2 * sin(20.0 * dist - time * 3.0);

          gl_FragColor = vec4(color * flicker, ring * flicker);
        }
      `,
    });

    const accretionDisk = new THREE.Mesh(accretionGeometry, accretionMaterial);
    accretionDisk.position.copy(blackHole.position);
    accretionDisk.rotation.x = Math.PI / 2.5; // oder 2.8
    accretionDisk.rotation.z = 0.3; // leichter seitlicher Tilt
    scene.add(accretionDisk);

    const GravitationalLensShader = {
      uniforms: {
        tDiffuse: { value: null },
        resolution: { value: new THREE.Vector2() },
        lensCenter: { value: new THREE.Vector2(0.5, 0.5) },
        strength: { value: 0.03 },
        holeRadius: { value: 0.1 }, // 🧠 HIER
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
          // Korrigiertes Seitenverhältnis
          vec2 delta = (vUv - lensCenter) * vec2(resolution.x / resolution.y, 1.0);
          float dist = length(delta);

          // Tangentialvektor (90° Drehung)
          vec2 tangent = vec2(-delta.y, delta.x);

          // Optionaler innerer Ring (keine Verzerrung im Zentrum)
          float ring = smoothstep(holeRadius, holeRadius + 0.01, dist);

          // Verzerrung – kleiner bei größerem Abstand
          float distortion = strength * ring * exp(-dist * 25.0);

          // Lichtkrümmung entlang der Tangente
          vec2 offset = normalize(tangent) * distortion;

          // Sicherstellen, dass du im gültigen Texturbereich bleibst
          vec2 uvOffset = clamp(vUv + offset, vec2(0.0), vec2(1.0));

          // Finaler Pixel
          gl_FragColor = texture2D(tDiffuse, uvOffset);
        }
      `,
    };


    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const lensPass = new ShaderPass(GravitationalLensShader);
    composer.addPass(lensPass);

    lensPass.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);

    const worldPosition = new THREE.Vector3();
    blackHole.getWorldPosition(worldPosition);
    camera.updateMatrixWorld();
    const screenPos = worldPosition.clone().project(camera);

    lensPass.uniforms.lensCenter.value.set(
      (screenPos.x +1) /2,
      (screenPos.y +1) /2,
      (screenPos.z +1) /2
    );
    lensPass.uniforms.strength.value = 3; // sichtbarer Effekt
    lensPass.uniforms.holeRadius.value = 0.11; // "Loch-Maske"


    // BufferGeometry-Sterne (statisch, nicht animiert)
    const starCount = 1500;
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      size: 1.5,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
      vertexColors: true,
      map: new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png'),
      alphaTest: 0.5,
    });

    const starVertices: number[] = [];
    const starColors: number[] = [];

    for (let i = 0; i < starCount; i++) {
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

    starGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(starVertices, 3)
    );
    starGeometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(starColors, 3)
    );

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Sprite-Sterne mit Animation
    const updateSprites = createStarField(scene, 1000);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      stars.rotation.z += 0.0006;
      updateSprites();
      composer.render();
      accretionMaterial.uniforms.time.value = performance.now() * 0.001;
      accretionDisk.rotation.z += 0.002; // fancy Rotation
    };

    animate();

    // Resize handling
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }} />
  );
}
*/


/*'use client';
import { useRef, useEffect } from 'react';

function getRandomStarColor(): string {
  const chance = Math.random();

  if (chance < 0.1) {
    // 🔵 Blau-Töne (heiß)
    const r = Math.floor(90 + Math.random() * 20);
    const g = Math.floor(140 + Math.random() * 30);
    const b = Math.floor(180 + Math.random() * 30); 
    return `rgb(${r}, ${g}, ${b})`;

  } else if (chance < 0.5) {
    // 🟡 Gelb/Orange-Töne (mittelwarm)
    const r = Math.floor(200 + Math.random() * 30);  // 230–255
    const g = Math.floor(170 + Math.random() * 40);  // 180–240
    const b = Math.floor(90 + Math.random() * 20);   // 80–120
    return `rgb(${r}, ${g}, ${b})`;

  } else if (chance < 0.6) {
    // 🔴 Rottöne (kühl, alt)
    const r = Math.floor(200 + Math.random() * 40);  // 220–255
    const g = Math.floor(70 + Math.random() * 30);   // 50–100
    const b = Math.floor(70 + Math.random() * 30);   // 50–100
    return `rgb(${r}, ${g}, ${b})`;

  } else {
    // ⚪ Weiß bis hellgrau (Standard)
    const brightness = Math.floor(170 + Math.random() * 40); // 180–255
    return `rgb(${brightness}, ${brightness}, ${brightness})`;
  }
}

export default function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;

    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height / 2;

    const CenterHoleX = centerX;
    const CenterHoleY = centerY;

    const radiusX = 300; // Ellipsenbreite
    const radiusY = 100; // Ellipsenhöhe
    const rotation = -30 * (Math.PI / 180); // -30° in Radiant

    const outerStars = 400;
    const galaxyStars = 450
    const coreStars = 600;

    type Star = {
        r: number;
        angle: number;
        size: number;
        baseSize: number;
        color: string;
        speed: number;
        layer: 'core' | 'galaxy' | 'outer';
        x?: number;
        y?: number;
        flickerPhase?: number;
        };

    const stars: Star[] = [];

    // Galaxy stars
    for (let i = 0; i < galaxyStars; i++) {
        const r = Math.sqrt(Math.random());
        const angle = Math.random() * 2 * Math.PI;
        stars.push({
            r,
            angle,
            size: Math.random() * 1.5 + 0.3,
            baseSize: Math.random() * 1.5 + 0.5,
            color: getRandomStarColor(),
            speed: 0.001 + Math.random() * 0.001,
            layer: 'galaxy',
            flickerPhase: Math.random() * Math.PI * 2,
        });
    }

    // Core stars
    for (let i = 0; i < coreStars; i++) {
        const r = Math.sqrt(Math.random());
        const angle = Math.random() * 2 * Math.PI;
        stars.push({
            r,
            angle,
            size: Math.random() * 1.5 + 0.3,
            baseSize: Math.random() * 1.5 + 0.5,
            color: getRandomStarColor(),
            speed: 0.002 + Math.random() * 0.001,
            layer: 'core',
            flickerPhase: Math.random() * Math.PI * 2,
        });
    }
    // Outer stars (static)
    for (let i = 0; i < outerStars; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;

        const dx = x - centerX;
        const dy = y - centerY;
        const rotatedX = dx * Math.cos(-rotation) - dy * Math.sin(-rotation);
        const rotatedY = dx * Math.sin(-rotation) + dy * Math.cos(-rotation);
        const insideEllipse =
        (rotatedX ** 2) / (radiusX ** 2) + (rotatedY ** 2) / (radiusY ** 2) < 1;
        if (insideEllipse) continue;

        stars.push({
            r: 0,
            angle: 0,
            size: Math.random() * 1.5 + 0.5,
            baseSize: Math.random() * 1.5 + 0.5,
            color: getRandomStarColor(),
            speed: 0,
            layer: 'outer',
            x,
            y,
            flickerPhase: Math.random() * Math.PI * 2,
        });
    }
    let animationId: number;

    function animate() {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, width, height);
        // Nebel (zentraler Glow)
        const nebula = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radiusX );
        nebula.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        nebula.addColorStop(0.4, 'rgba(180, 150, 255, 0.08)');
        nebula.addColorStop(0.8, 'rgba(100, 100, 255, 0.02)');
        nebula.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = nebula;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX * 0.3, radiusY * 0.3, rotation, 0, Math.PI * 2);
        ctx.fill();

        // Zweiter Nebel-Layer
        const cloud2 = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radiusX);
        cloud2.addColorStop(0, 'rgba(255, 200, 255, 0.08)');
        cloud2.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = cloud2;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX * 1, radiusY * 1, rotation, 0, Math.PI * 2);
        ctx.fill();

        for (const star of stars) {
        if (star.layer === 'outer') {
            // Zappeln (minimal)
            const jitterX = (Math.random() - 0.5) * 0.3;
            const jitterY = (Math.random() - 0.5) * 0.3;

            // Flackern
            const flicker = 0.5 + 0.5 * Math.sin(Date.now() * 0.002 + star.flickerPhase!);
            const size = star.baseSize * flicker;

            ctx.fillStyle = star.color;
            ctx.beginPath();
            ctx.arc(star.x! + jitterX, star.y! + jitterY, size, 0, Math.PI * 2);
            ctx.fill();
            continue;
        }
        else
        {
           star.angle += star.speed;

            const rX = star.layer === 'core' ? radiusX / 3 : radiusX;
            const rY = star.layer === 'core' ? radiusY / 2 : radiusY;

            const x = star.r * rX * Math.cos(star.angle);
            const y = star.r * rY * Math.sin(star.angle);

            const rotatedX = x * Math.cos(rotation) - y * Math.sin(rotation);
            const rotatedY = x * Math.sin(rotation) + y * Math.cos(rotation);

            const finalX = centerX + rotatedX;
            const finalY = centerY + rotatedY;

            const dx = finalX - CenterHoleX;
            const dy = finalY - CenterHoleY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let drawX = finalX;
            let drawY = finalY;

            if (dist < 200 && dist > 10) { // Nicht mitten durchs Loch
                const lensStrength = 2000; // Rumprobieren!
                const factor = 1 + lensStrength / (dist * dist);
                drawX = CenterHoleX + dx * factor;
                drawY = CenterHoleY + dy * factor;
            }

            const flicker = 0.5 + 0.5 * Math.sin(Date.now() * 0.002 + star.flickerPhase!);
            const size = star.baseSize * flicker;

            ctx.fillStyle = star.color;
            ctx.beginPath();
            ctx.arc(drawX, drawY, size, 0, Math.PI * 2);
            ctx.fill(); 
        }
        }

        // Lichtverzerrung simulieren (Einstein-Ring)
        ctx.save();
        ctx.translate(CenterHoleX, CenterHoleY);

        const lensGradient = ctx.createRadialGradient(0, 0, 30, 0, 0, 50);
        lensGradient.addColorStop(0.0, 'rgba(255, 255, 255, 0.05)');
        lensGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        lensGradient.addColorStop(0.9, 'rgba(200, 200, 255, 0.05)');
        lensGradient.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = lensGradient;
        ctx.beginPath();
        ctx.arc(0, 0, 50, 0, Math.PI * 2);
        ctx.fill();

        // Weißer Ring (Einstein-Ring)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 70, 0, Math.PI * 2);
        ctx.stroke();

        // Zentrales schwarzes Loch
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(0, 0, 60, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        animationId = requestAnimationFrame(animate);
    }

    animate();

    return () => cancelAnimationFrame(animationId);
    }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1,
        width: '100%',
        height: '100%',
        backgroundColor: 'black',
      }}
    />
  );
}*/

