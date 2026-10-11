import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { CampusLocation, RouteResult } from '../types/campus';
import { MEWAR_CAMPUS_LOCATIONS } from '../data/mewarCampusData';
import { CAMPUS_PATH_RIBBONS, CAMPUS_LAWN_PATCHES } from '../data/campusPaths';

interface ThreeCanvasProps {
  locations: CampusLocation[];
  selectedLocation: CampusLocation | null;
  onSelectLocation: (location: CampusLocation) => void;
  activeRoute: RouteResult | null;
  cameraPreset: 'isometric' | 'top_down' | 'reset' | null;
  onAzimuthChange: (angleDeg: number) => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  activeRoute,
  cameraPreset,
  onAzimuthChange
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Mesh registries for raycasting and highlights
  const buildingMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const badgesGroupRef = useRef<THREE.Group | null>(null);
  const routeGroupRef = useRef<THREE.Group | null>(null);

  // Animation state
  const targetCamPosRef = useRef<THREE.Vector3 | null>(null);
  const targetLookAtRef = useRef<THREE.Vector3 | null>(null);
  const animProgressRef = useRef<number>(1);
  const startCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const startLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3());

  // Route pulse animation
  const routePulseMeshRef = useRef<THREE.Mesh | null>(null);
  const routeCurveRef = useRef<THREE.CatmullRomCurve3 | null>(null);

  // Hover detection
  const hoveredBuildingIdRef = useRef<string | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(-999, -999));

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a1128');
    scene.fog = new THREE.FogExp2('#0a1128', 0.0032);
    sceneRef.current = scene;

    // --- 2. CAMERA SETUP ---
    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(38, width / height, 1, 1000);
    camera.position.set(-70, 95, 125);
    cameraRef.current = camera;

    // --- 3. RENDERER SETUP ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- 4. CONTROLS SETUP ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.08;
    controls.minDistance = 20;
    controls.maxDistance = 280;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // --- 5. LIGHTING ---
    const ambientLight = new THREE.AmbientLight('#2a4365', 1.3);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight('#f8fafc', 2.1);
    sunLight.position.set(-70, 120, 60);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 320;
    sunLight.shadow.camera.left = -95;
    sunLight.shadow.camera.right = 95;
    sunLight.shadow.camera.top = 115;
    sunLight.shadow.camera.bottom = -115;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const cyanRimLight = new THREE.DirectionalLight('#00f0ff', 1.3);
    cyanRimLight.position.set(80, 50, -80);
    scene.add(cyanRimLight);

    const blueHemisphere = new THREE.HemisphereLight('#38bdf8', '#0f172a', 0.85);
    scene.add(blueHemisphere);

    // --- 6. FLOATING ISLAND WITH WARM YELLOW CAMPUS GROUND ---
    createFloatingIsland(scene);

    // --- 7. GREEN LAWN PATCHES ---
    createLawnPatches(scene);

    // --- 8. CONTINUOUS WHITE WALKING PATHS & WEST ROAD ---
    createPedestrianPathNetwork(scene);

    // --- 9. SPORTS GROUNDS ---
    createSportsGrounds(scene);

    // --- 10. BUILDINGS ---
    createBuildings(scene, locations, buildingMeshesRef.current);

    // --- 11. TREES & FOLIAGE ---
    createFoliageAndProps(scene);

    // --- 12. BILLBOARD BADGES GROUP ---
    const badgesGroup = new THREE.Group();
    scene.add(badgesGroup);
    badgesGroupRef.current = badgesGroup;
    createBillboardBadges(badgesGroup, locations);

    // --- 13. ROUTE GROUP ---
    const routeGroup = new THREE.Group();
    scene.add(routeGroup);
    routeGroupRef.current = routeGroup;

    // --- 14. ATMOSPHERE ---
    createBackgroundAtmosphere(scene);

    // --- 15. RESIZE LISTENER ---
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // --- 16. RAYCASTING LISTENERS ---
    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleClick = () => {
      if (!cameraRef.current || !sceneRef.current) return;
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

      const interactiveMeshes: THREE.Object3D[] = [];
      buildingMeshesRef.current.forEach(group => {
        group.traverse(child => {
          if (child instanceof THREE.Mesh && child.userData.locationId) {
            interactiveMeshes.push(child);
          }
        });
      });

      const intersects = raycasterRef.current.intersectObjects(interactiveMeshes, false);
      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const locId = hitMesh.userData.locationId;
        const found = MEWAR_CAMPUS_LOCATIONS.find(loc => loc.id === locId);
        if (found) {
          onSelectLocation(found);
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);

    // --- 17. RENDER LOOP ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth camera transition
      if (animProgressRef.current < 1 && targetCamPosRef.current && targetLookAtRef.current) {
        animProgressRef.current += delta * 1.6;
        const t = Math.min(1, animProgressRef.current);
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        camera.position.lerpVectors(startCamPosRef.current, targetCamPosRef.current, ease);
        controls.target.lerpVectors(startLookAtRef.current, targetLookAtRef.current, ease);
      }

      controls.update();

      const azimuth = controls.getAzimuthalAngle();
      onAzimuthChange(THREE.MathUtils.radToDeg(azimuth));

      // Route pulse traveling along the spline
      if (routePulseMeshRef.current && routeCurveRef.current) {
        const loopTime = (elapsed * 0.35) % 1;
        const pointOnCurve = routeCurveRef.current.getPointAt(loopTime);
        routePulseMeshRef.current.position.copy(pointOnCurve);
      }

      // Billboard badges face camera
      if (badgesGroupRef.current) {
        badgesGroupRef.current.children.forEach(sprite => {
          sprite.quaternion.copy(camera.quaternion);
        });
      }

      // Hover Raycasting
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const interactiveMeshes: THREE.Object3D[] = [];
      buildingMeshesRef.current.forEach(group => {
        group.traverse(child => {
          if (child instanceof THREE.Mesh && child.userData.locationId) {
            interactiveMeshes.push(child);
          }
        });
      });
      const hits = raycasterRef.current.intersectObjects(interactiveMeshes, false);
      const newHoverId = hits.length > 0 ? hits[0].object.userData.locationId : null;

      if (newHoverId !== hoveredBuildingIdRef.current) {
        hoveredBuildingIdRef.current = newHoverId;
        renderer.domElement.style.cursor = newHoverId ? 'pointer' : 'default';
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleClick);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Handle Camera Presets
  useEffect(() => {
    if (!controlsRef.current || !cameraRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    startCamPosRef.current.copy(camera.position);
    startLookAtRef.current.copy(controls.target);

    if (cameraPreset === 'isometric') {
      targetCamPosRef.current = new THREE.Vector3(-70, 95, 125);
      targetLookAtRef.current = new THREE.Vector3(0, 0, 0);
      animProgressRef.current = 0;
    } else if (cameraPreset === 'top_down') {
      targetCamPosRef.current = new THREE.Vector3(0, 175, 4);
      targetLookAtRef.current = new THREE.Vector3(0, 0, 0);
      animProgressRef.current = 0;
    } else if (cameraPreset === 'reset') {
      targetCamPosRef.current = new THREE.Vector3(-70, 95, 125);
      targetLookAtRef.current = new THREE.Vector3(0, 0, 0);
      animProgressRef.current = 0;
    }
  }, [cameraPreset]);

  // Focus on Selected Location
  useEffect(() => {
    if (!selectedLocation || !controlsRef.current || !cameraRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    const [bx, by, bz] = selectedLocation.position;
    startCamPosRef.current.copy(camera.position);
    startLookAtRef.current.copy(controls.target);

    targetLookAtRef.current = new THREE.Vector3(bx, by + 2, bz);
    targetCamPosRef.current = new THREE.Vector3(bx - 28, by + 34, bz + 42);
    animProgressRef.current = 0;

    // Highlight selected building
    buildingMeshesRef.current.forEach((group, id) => {
      const isSelected = id === selectedLocation.id;
      group.traverse(child => {
        if (child instanceof THREE.Mesh && child.userData.baseMaterial) {
          if (isSelected) {
            child.material = new THREE.MeshStandardMaterial({
              color: '#00f0ff',
              emissive: '#0284c7',
              emissiveIntensity: 0.5,
              roughness: 0.2
            });
          } else {
            child.material = child.userData.baseMaterial;
          }
        }
      });
    });
  }, [selectedLocation]);

  // Render 3D Route Line strictly following pedestrian walking paths!
  useEffect(() => {
    if (!routeGroupRef.current || !sceneRef.current) return;
    const routeGroup = routeGroupRef.current;

    // Clear previous route
    while (routeGroup.children.length > 0) {
      const obj = routeGroup.children[0];
      routeGroup.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    }

    if (!activeRoute || activeRoute.points.length < 2) {
      routeCurveRef.current = null;
      routePulseMeshRef.current = null;
      return;
    }

    // Coordinates follow the path nodes at height y = 0.45
    const vectors = activeRoute.points.map(p => new THREE.Vector3(p[0], 0.45, p[2]));
    const curve = new THREE.CatmullRomCurve3(vectors);
    routeCurveRef.current = curve;

    // Glowing Neon Cyan Route Line
    const tubeGeometry = new THREE.TubeGeometry(curve, Math.max(64, vectors.length * 16), 0.5, 12, false);
    const tubeMaterial = new THREE.MeshStandardMaterial({
      color: '#00f0ff',
      emissive: '#00f0ff',
      emissiveIntensity: 1.4,
      roughness: 0.1,
      metalness: 0.4
    });
    const routeTube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    routeGroup.add(routeTube);

    // Glowing Pulse Particle traveling along the path
    const pulseGeo = new THREE.SphereGeometry(1.3, 16, 16);
    const pulseMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
    routeGroup.add(pulseMesh);
    routePulseMeshRef.current = pulseMesh;

    // Start Pin (A)
    const startPos = vectors[0];
    const startPin = createPinMarker('A', '#10b981', startPos);
    routeGroup.add(startPin);

    // Destination Pin (B)
    const destPos = vectors[vectors.length - 1];
    const destPin = createPinMarker('B', '#00f0ff', destPos);
    routeGroup.add(destPin);

  }, [activeRoute]);

  return <div ref={mountRef} className="w-full h-full relative overflow-hidden select-none" />;
};

/* =========================================================================
   PROCEDURAL 3D ASSET GENERATORS (REPRODUCING THE ORIGINAL MAP LAYOUT)
   ========================================================================= */

// 1. Floating Island Terrain with Warm Sandy-Yellow Campus Base
function createFloatingIsland(scene: THREE.Scene) {
  const islandGroup = new THREE.Group();

  // Elongated island boundary matching the reference image!
  const islandShape = new THREE.Shape();
  islandShape.moveTo(-38, -95);
  islandShape.lineTo(38, -95);
  islandShape.lineTo(46, -30);
  islandShape.lineTo(44, 40);
  islandShape.lineTo(40, 95);
  islandShape.lineTo(-10, 100);
  islandShape.lineTo(-35, 95);
  islandShape.lineTo(-44, 40);
  islandShape.lineTo(-44, -30);
  islandShape.closePath();

  // Island top ground: Warm Sandy-Yellow Paving Ground (as in reference map)
  const topGeo = new THREE.ShapeGeometry(islandShape);
  const topMat = new THREE.MeshStandardMaterial({
    color: '#dfc285', // Warm ochre-yellow campus ground matching original map
    roughness: 0.9,
    metalness: 0.05
  });
  const topMesh = new THREE.Mesh(topGeo, topMat);
  topMesh.rotation.x = -Math.PI / 2;
  topMesh.position.y = 0;
  topMesh.receiveShadow = true;
  islandGroup.add(topMesh);

  // Deep rocky cliff underbelly
  const extrudeSettings = {
    steps: 1,
    depth: 18,
    bevelEnabled: true,
    bevelThickness: 6,
    bevelSize: 4,
    bevelSegments: 3
  };
  const underGeo = new THREE.ExtrudeGeometry(islandShape, extrudeSettings);
  const rockMat = new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.95,
    metalness: 0.15
  });
  const underMesh = new THREE.Mesh(underGeo, rockMat);
  underMesh.rotation.x = Math.PI / 2;
  underMesh.position.y = 0;
  underMesh.castShadow = true;
  islandGroup.add(underMesh);

  // Futuristic Cyan Island Edge Glow
  const edgeGeo = new THREE.EdgesGeometry(topGeo);
  const edgeMat = new THREE.LineBasicMaterial({ color: '#00f0ff', linewidth: 2 });
  const edgeLine = new THREE.LineSegments(edgeGeo, edgeMat);
  edgeLine.rotation.x = -Math.PI / 2;
  edgeLine.position.y = 0.05;
  islandGroup.add(edgeLine);

  scene.add(islandGroup);
}

// 2. Green Lawn Islands (Contrasting with the warm yellow ground)
function createLawnPatches(scene: THREE.Scene) {
  const lawnGroup = new THREE.Group();
  const lawnMat = new THREE.MeshStandardMaterial({
    color: '#38a169', // Rich vibrant green lawn
    roughness: 0.8,
    metalness: 0.05
  });

  CAMPUS_LAWN_PATCHES.forEach(patch => {
    const shape = new THREE.Shape();
    patch.points.forEach(([x, z], idx) => {
      if (idx === 0) shape.moveTo(x, z);
      else shape.lineTo(x, z);
    });
    shape.closePath();

    const geo = new THREE.ShapeGeometry(shape);
    const mesh = new THREE.Mesh(geo, lawnMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.06; // Slightly above yellow base
    mesh.receiveShadow = true;
    lawnGroup.add(mesh);
  });

  scene.add(lawnGroup);
}

// 3. Continuous White Walking Paths & West Perimeter Road
function createPedestrianPathNetwork(scene: THREE.Scene) {
  const pathGroup = new THREE.Group();

  // 3A. West Perimeter Asphalt Road
  const roadGeo = new THREE.PlaneGeometry(8, 175);
  const roadMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.65 });
  const roadMesh = new THREE.Mesh(roadGeo, roadMat);
  roadMesh.rotation.x = -Math.PI / 2;
  roadMesh.position.set(-34, 0.09, 5);
  roadMesh.receiveShadow = true;
  pathGroup.add(roadMesh);

  // Road Lane Dividers
  for (let z = -75; z <= 85; z += 6) {
    const dashGeo = new THREE.PlaneGeometry(0.45, 3.2);
    const dashMat = new THREE.MeshBasicMaterial({ color: '#f8fafc' });
    const dash = new THREE.Mesh(dashGeo, dashMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(-34, 0.12, z);
    pathGroup.add(dash);
  }

  // 3B. Continuous White Walking Paths (Rendered at y = 0.15 above ground to prevent z-fighting!)
  const whitePathMat = new THREE.MeshStandardMaterial({
    color: '#ffffff', // Crisp white walking paths as in the reference image
    roughness: 0.35,
    metalness: 0.05
  });

  CAMPUS_PATH_RIBBONS.forEach(ribbon => {
    for (let i = 0; i < ribbon.points.length - 1; i++) {
      const [x1, z1] = ribbon.points[i];
      const [x2, z2] = ribbon.points[i + 1];

      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.sqrt(dx * dx + dz * dz);
      if (len < 0.01) continue;

      const angle = Math.atan2(dz, dx);
      const segGeo = new THREE.PlaneGeometry(len, ribbon.width);
      const segMesh = new THREE.Mesh(segGeo, whitePathMat);
      segMesh.rotation.x = -Math.PI / 2;
      segMesh.rotation.z = -angle;
      segMesh.position.set((x1 + x2) / 2, 0.14, (z1 + z2) / 2);
      segMesh.receiveShadow = true;
      pathGroup.add(segMesh);

      // Rounded junction cap at points
      const capGeo = new THREE.CircleGeometry(ribbon.width / 2, 16);
      const capMesh = new THREE.Mesh(capGeo, whitePathMat);
      capMesh.rotation.x = -Math.PI / 2;
      capMesh.position.set(x1, 0.141, z1);
      capMesh.receiveShadow = true;
      pathGroup.add(capMesh);
    }
  });

  scene.add(pathGroup);
}

// 4. Sports Grounds (Football & Cricket)
function createSportsGrounds(scene: THREE.Scene) {
  const sportsGroup = new THREE.Group();

  // Football Ground (Pitch, Lines, Goals)
  const fbGround = new THREE.Group();
  fbGround.position.set(-6, 0.15, 24);

  const fbTurfGeo = new THREE.PlaneGeometry(18, 26);
  const fbTurfMat = new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.5 });
  const fbTurf = new THREE.Mesh(fbTurfGeo, fbTurfMat);
  fbTurf.rotation.x = -Math.PI / 2;
  fbTurf.receiveShadow = true;
  fbGround.add(fbTurf);

  const fbBorderGeo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(16.5, 24));
  const whiteLineMat = new THREE.LineBasicMaterial({ color: '#ffffff' });
  const fbBorder = new THREE.LineSegments(fbBorderGeo, whiteLineMat);
  fbBorder.rotation.x = -Math.PI / 2;
  fbBorder.position.y = 0.02;
  fbGround.add(fbBorder);

  const centerCircleGeo = new THREE.RingGeometry(2.8, 3.0, 32);
  const centerCircle = new THREE.Mesh(centerCircleGeo, new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide }));
  centerCircle.rotation.x = -Math.PI / 2;
  centerCircle.position.y = 0.02;
  fbGround.add(centerCircle);

  sportsGroup.add(fbGround);

  // Cricket Ground (Circular Oval, Boundary Rope, Pitch)
  const crkGround = new THREE.Group();
  crkGround.position.set(-2, 0.15, 58);

  const crkCircleGeo = new THREE.CircleGeometry(12, 48);
  const crkMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.55 });
  const crkTurf = new THREE.Mesh(crkCircleGeo, crkMat);
  crkTurf.rotation.x = -Math.PI / 2;
  crkTurf.receiveShadow = true;
  crkGround.add(crkTurf);

  const boundaryGeo = new THREE.RingGeometry(11.6, 11.9, 48);
  const boundaryMesh = new THREE.Mesh(boundaryGeo, new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide }));
  boundaryMesh.rotation.x = -Math.PI / 2;
  boundaryMesh.position.y = 0.02;
  crkGround.add(boundaryMesh);

  const pitchGeo = new THREE.PlaneGeometry(3.5, 8.5);
  const pitchMat = new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.9 });
  const pitchMesh = new THREE.Mesh(pitchGeo, pitchMat);
  pitchMesh.rotation.x = -Math.PI / 2;
  pitchMesh.position.y = 0.03;
  crkGround.add(pitchMesh);

  sportsGroup.add(crkGround);

  scene.add(sportsGroup);
}

// 5. Buildings accurately positioned on their plots
function createBuildings(
  scene: THREE.Scene,
  locations: CampusLocation[],
  registry: Map<string, THREE.Group>
) {
  const buildingGroup = new THREE.Group();

  const wallMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.45, metalness: 0.1 });
  const roofMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.7 });

  locations.forEach(loc => {
    // Skip sports grounds and park centers handled as landscape
    if (loc.id === 'football_ground' || loc.id === 'cricket_ground' || loc.id === 'park' || loc.id === 'law_park') {
      return;
    }

    const bGroup = new THREE.Group();
    bGroup.position.set(...loc.position);

    const [w, h, d] = loc.size;

    if (loc.shape === 'u_shape') {
      // Large iconic U-shaped Engineering Block with inner courtyard!
      const leftWing = createBoxMesh(w * 0.28, h, d, wallMat, loc.id);
      leftWing.position.set(-w * 0.36, h / 2, 0);
      bGroup.add(leftWing);

      const rightWing = createBoxMesh(w * 0.28, h, d, wallMat, loc.id);
      rightWing.position.set(w * 0.36, h / 2, 0);
      bGroup.add(rightWing);

      const northWing = createBoxMesh(w * 0.72, h, d * 0.28, wallMat, loc.id);
      northWing.position.set(0, h / 2, -d * 0.36);
      bGroup.add(northWing);

      // Glass Courtyard
      const courtGeo = new THREE.PlaneGeometry(w * 0.44, d * 0.5);
      const courtMat = new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.1, metalness: 0.9 });
      const courtMesh = new THREE.Mesh(courtGeo, courtMat);
      courtMesh.rotation.x = -Math.PI / 2;
      courtMesh.position.set(0, 0.18, d * 0.1);
      bGroup.add(courtMesh);

    } else if (loc.shape === 'dome') {
      // Temple
      const baseMesh = createBoxMesh(w, h * 0.6, d, wallMat, loc.id);
      baseMesh.position.y = (h * 0.6) / 2;
      bGroup.add(baseMesh);

      const domeGeo = new THREE.SphereGeometry(w * 0.45, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const domeMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.3, metalness: 0.6 });
      const domeMesh = new THREE.Mesh(domeGeo, domeMat);
      domeMesh.position.y = h * 0.6;
      bGroup.add(domeMesh);

      const rampGeo = new THREE.BoxGeometry(2, 0.4, 4.5);
      const rampMat = new THREE.MeshStandardMaterial({ color: '#94a3b8' });
      const rampMesh = new THREE.Mesh(rampGeo, rampMat);
      rampMesh.rotation.x = 0.15;
      rampMesh.position.set(-w * 0.4, 0.2, d * 0.5);
      bGroup.add(rampMesh);

    } else {
      // Standard multi-story block
      const mainBuilding = createBoxMesh(w, h, d, wallMat, loc.id);
      mainBuilding.position.y = h / 2;
      bGroup.add(mainBuilding);

      const roofMesh = new THREE.Mesh(new THREE.BoxGeometry(w * 0.94, 0.5, d * 0.94), roofMat);
      roofMesh.position.y = h + 0.25;
      bGroup.add(roofMesh);

      const porchGeo = new THREE.BoxGeometry(w * 0.4, 0.3, 3);
      const porchMat = new THREE.MeshStandardMaterial({ color: loc.color, roughness: 0.3 });
      const porchMesh = new THREE.Mesh(porchGeo, porchMat);
      porchMesh.position.set(0, 0.15, d / 2 + 1.2);
      bGroup.add(porchMesh);

      if (loc.id === 'hospital') {
        const crossGeoH = new THREE.BoxGeometry(3.5, 0.2, 1.2);
        const crossGeoV = new THREE.BoxGeometry(1.2, 0.2, 3.5);
        const crossMat = new THREE.MeshBasicMaterial({ color: '#ef4444' });
        const crossH = new THREE.Mesh(crossGeoH, crossMat);
        const crossV = new THREE.Mesh(crossGeoV, crossMat);
        crossH.position.y = h + 0.6;
        crossV.position.y = h + 0.6;
        bGroup.add(crossH);
        bGroup.add(crossV);
      }
    }

    registry.set(loc.id, bGroup);
    buildingGroup.add(bGroup);
  });

  scene.add(buildingGroup);
}

function createBoxMesh(w: number, h: number, d: number, mat: THREE.Material, locId: string): THREE.Mesh {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { locationId: locId, baseMaterial: mat };
  return mesh;
}

// 6. Foliage & Low-Poly Trees in Park and Lawn Areas
function createFoliageAndProps(scene: THREE.Scene) {
  const foliageGroup = new THREE.Group();

  const trunkMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 });
  const foliageMat1 = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.8 });
  const foliageMat2 = new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.8 });

  const treeLocations: [number, number][] = [
    // Park area cluster
    [-12, -54], [-6, -52], [-11, -47], [-5, -45], [-14, -50],
    // Law park area cluster
    [13, 16], [17, 24], [13, 28], [18, 16],
    // Roadside tree avenue
    [-30, -78], [-30, -60], [-30, -35], [-30, -5], [-30, 25], [-30, 50], [-30, 75],
    // Temple & Quad margin
    [2, -48], [10, -42], [-1, -38],
    // Sports perimeter
    [-17, 24], [-17, 30], [-17, 58], [10, 58], [10, 48],
    // South Quad
    [1, 75], [16, 75], [20, 85]
  ];

  treeLocations.forEach(([tx, tz], i) => {
    const isPine = i % 2 === 0;
    const tree = new THREE.Group();
    tree.position.set(tx, 0, tz);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 2.2, 6), trunkMat);
    trunk.position.y = 1.1;
    trunk.castShadow = true;
    tree.add(trunk);

    if (isPine) {
      for (let s = 0; s < 3; s++) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(2.4 - s * 0.5, 2.5, 6), foliageMat1);
        cone.position.y = 2.4 + s * 1.3;
        cone.castShadow = true;
        tree.add(cone);
      }
    } else {
      const sphere = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2, 1), foliageMat2);
      sphere.position.y = 3.2;
      sphere.castShadow = true;
      tree.add(sphere);
    }

    foliageGroup.add(tree);
  });

  scene.add(foliageGroup);
}

// 7. Billboard Badges matching reference icon labels
function createBillboardBadges(group: THREE.Group, locations: CampusLocation[]) {
  locations.forEach(loc => {
    const [x, , z] = loc.position;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 84;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'rgba(10, 15, 29, 0.88)';
    ctx.strokeStyle = loc.color;
    ctx.lineWidth = 4;
    roundRect(ctx, 4, 4, 248, 76, 22);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = loc.color;
    ctx.beginPath();
    ctx.arc(42, 42, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const iconChar = getIconSymbol(loc.iconType);
    ctx.fillText(iconChar, 42, 42);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(truncateText(loc.name, 16), 76, 44);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);

    const badgeY = loc.shape === 'compound' || loc.shape === 'circle' ? 6.5 : loc.size[1] + 5.5;
    sprite.position.set(x, badgeY, z);
    sprite.scale.set(13, 4.3, 1);
    group.add(sprite);
  });
}

function truncateText(str: string, maxLen: number) {
  return str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str;
}

function getIconSymbol(type: string): string {
  switch (type) {
    case 'bed': return '🛏️';
    case 'cross': return '➕';
    case 'utensils': return '🍴';
    case 'tree': return '🌲';
    case 'building': return '🏛️';
    case 'gear': return '⚙️';
    case 'graduation': return '🎓';
    case 'monitor': return '💻';
    case 'ball': return '⚽';
    case 'cricket': return '🏏';
    default: return '📍';
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// 8. Atmosphere: Floating Rocks
function createBackgroundAtmosphere(scene: THREE.Scene) {
  const atmoGroup = new THREE.Group();

  const rockPositions: [number, number, number, number][] = [
    [-65, 20, -90, 8],
    [55, 30, -85, 10],
    [-70, -10, 20, 12],
    [65, 15, 60, 9],
    [-55, 10, 80, 11]
  ];

  const floatRockMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.9 });
  rockPositions.forEach(([rx, ry, rz, rsize]) => {
    const geo = new THREE.DodecahedronGeometry(rsize, 0);
    const rock = new THREE.Mesh(geo, floatRockMat);
    rock.position.set(rx, ry, rz);
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    atmoGroup.add(rock);
  });

  scene.add(atmoGroup);
}

// 9. Route Markers
function createPinMarker(letter: string, colorHex: string, pos: THREE.Vector3): THREE.Group {
  const pinGroup = new THREE.Group();
  pinGroup.position.copy(pos);

  const headGeo = new THREE.SphereGeometry(1.6, 16, 16);
  const headMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 0.7
  });
  const headMesh = new THREE.Mesh(headGeo, headMat);
  headMesh.position.y = 3.5;
  pinGroup.add(headMesh);

  const needleGeo = new THREE.CylinderGeometry(0.2, 0.05, 3.5, 8);
  const needleMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const needleMesh = new THREE.Mesh(needleGeo, needleMat);
  needleMesh.position.y = 1.75;
  pinGroup.add(needleMesh);

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, 32, 32);
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false }));
    sprite.position.y = 3.5;
    sprite.scale.set(2.2, 2.2, 1);
    pinGroup.add(sprite);
  }

  return pinGroup;
}
