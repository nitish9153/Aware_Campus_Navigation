import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RotateCcw, ZoomIn, ZoomOut, Play, Pause, Compass, Info } from 'lucide-react';
import type { BuildingFloor, FloorRoom, IndoorRouteResult } from '../types/indoor';

interface KumbahHostel3DViewProps {
  floor: BuildingFloor;
  selectedRoom: FloorRoom | null;
  onSelectRoom: (room: FloorRoom) => void;
  activeRoute: IndoorRouteResult | null;
  startPointId?: string;
}

export const KumbahHostel3DView: React.FC<KumbahHostel3DViewProps> = ({
  floor,
  selectedRoom,
  onSelectRoom,
  activeRoute
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [hoveredRoomName, setHoveredRoomName] = useState<string | null>(null);

  // References to Three.js instances for UI controls
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsStateRef = useRef({
    isDragging: false,
    prevMouseX: 0,
    prevMouseY: 0,
    rotationX: 0.55, // Pitch
    rotationY: -0.65, // Yaw (isometric tilt)
    distance: 48,
    target: new THREE.Vector3(0, 0, 0),
    autoRotate: false
  });

  const roomMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const routeLineRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const pulseUniformsRef = useRef<{ time: { value: number } }>({ time: { value: 0 } });

  // Update auto rotate ref
  useEffect(() => {
    controlsStateRef.current.autoRotate = isAutoRotating;
  }, [isAutoRotating]);

  // Main Three.js Scene Setup
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16); // Deep slate navy
    sceneRef.current = scene;

    // Subtle atmospheric fog
    scene.fog = new THREE.FogExp2(0x090d16, 0.012);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.5, 300);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xe0f2fe, 1.4);
    dirLight1.position.set(25, 45, 20);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.6);
    dirLight2.position.set(-25, 30, -20);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x06b6d4, 1.5, 60);
    pointLight.position.set(0, 15, 0);
    scene.add(pointLight);

    // 5. Build Architectural Kumbah Ground Floor 3D Model
    // Building Dimensions in 3D world units:
    // Corresponds to the isometric layout:
    // Corridor length = 46 units (X axis: -23 to +23)
    // Width = 14 units (Z axis: -7 to +7)
    // Z < 0: Top row (Odd rooms 1, 3, 5, 7, 9, 11, 13, 15)
    // Z > 0: Bottom row (Even rooms 2, 4, 6, 8, 10, 12, 14, 16)
    // Z = 0: Central Corridor

    // Floor Base Slab
    const slabGeo = new THREE.BoxGeometry(50, 0.8, 18);
    const slabMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.2
    });
    const slabMesh = new THREE.Mesh(slabGeo, slabMat);
    slabMesh.position.y = -0.4;
    slabMesh.receiveShadow = true;
    scene.add(slabMesh);

    // Corridor Floor Strip
    const corridorGeo = new THREE.PlaneGeometry(42, 3.6);
    const corridorMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.6,
      metalness: 0.1
    });
    const corridorMesh = new THREE.Mesh(corridorGeo, corridorMat);
    corridorMesh.rotation.x = -Math.PI / 2;
    corridorMesh.position.y = 0.02;
    corridorMesh.receiveShadow = true;
    scene.add(corridorMesh);

    // Grid Floor Guide on corridor
    const gridHelper = new THREE.GridHelper(44, 22, 0x0ea5e9, 0x1e293b);
    gridHelper.position.y = 0.03;
    scene.add(gridHelper);

    // Helper to create a room
    const createRoom3D = (
      roomData: FloorRoom,
      xPos: number,
      zPos: number,
      rWidth: number,
      rDepth: number,
      isOddRow: boolean
    ) => {
      const roomGroup = new THREE.Group();
      roomGroup.position.set(xPos, 0, zPos);

      // Room Floor with floorboard color
      const floorTileMat = new THREE.MeshStandardMaterial({
        color: isOddRow ? 0xf1f5f9 : 0xf8fafc,
        roughness: 0.5
      });
      const roomFloorGeo = new THREE.PlaneGeometry(rWidth - 0.2, rDepth - 0.2);
      const roomFloor = new THREE.Mesh(roomFloorGeo, floorTileMat);
      roomFloor.rotation.x = -Math.PI / 2;
      roomFloor.position.y = 0.02;
      roomFloor.receiveShadow = true;
      roomGroup.add(roomFloor);

      const wallHeight = 2.4;
      const wallThickness = 0.25;
      const innerWallMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.8
      });

      // Back Wall
      const backWallGeo = new THREE.BoxGeometry(rWidth, wallHeight, wallThickness);
      const backWall = new THREE.Mesh(backWallGeo, innerWallMat);
      backWall.position.set(0, wallHeight / 2, isOddRow ? -rDepth / 2 : rDepth / 2);
      backWall.castShadow = true;
      backWall.receiveShadow = true;
      roomGroup.add(backWall);

      // Left Wall
      const sideWallGeo = new THREE.BoxGeometry(wallThickness, wallHeight, rDepth);
      const leftWall = new THREE.Mesh(sideWallGeo, innerWallMat);
      leftWall.position.set(-rWidth / 2, wallHeight / 2, 0);
      leftWall.castShadow = true;
      roomGroup.add(leftWall);

      // Right Wall
      const rightWall = new THREE.Mesh(sideWallGeo, innerWallMat);
      rightWall.position.set(rWidth / 2, wallHeight / 2, 0);
      rightWall.castShadow = true;
      roomGroup.add(rightWall);

      // Front Wall with Door Gap
      const doorWidth = 1.0;
      const frontPartWidth = (rWidth - doorWidth) / 2;
      const frontWallGeo = new THREE.BoxGeometry(frontPartWidth, wallHeight, wallThickness);

      // Door opening is placed toward corridor
      const frontZ = isOddRow ? rDepth / 2 : -rDepth / 2;
      const frontPart1 = new THREE.Mesh(frontWallGeo, innerWallMat);
      frontPart1.position.set(-rWidth / 4 - doorWidth / 4, wallHeight / 2, frontZ);
      roomGroup.add(frontPart1);

      // Door frame badge / lintel
      const lintelGeo = new THREE.BoxGeometry(doorWidth, wallHeight - 1.8, wallThickness);
      const lintel = new THREE.Mesh(lintelGeo, innerWallMat);
      lintel.position.set(rWidth / 4 - doorWidth / 4, wallHeight - 0.3, frontZ);
      roomGroup.add(lintel);

      // Door Leaf (Brown wooden door slightly ajar like in 3D illustration)
      const doorMat = new THREE.MeshStandardMaterial({ color: 0x5c2c16, roughness: 0.6 });
      const doorLeafGeo = new THREE.BoxGeometry(0.8, 1.8, 0.08);
      const doorLeaf = new THREE.Mesh(doorLeafGeo, doorMat);
      doorLeaf.position.set(rWidth / 4 - doorWidth / 4 - 0.2, 0.9, frontZ + (isOddRow ? 0.3 : -0.3));
      doorLeaf.rotation.y = isOddRow ? 0.6 : -0.6;
      roomGroup.add(doorLeaf);

      // Interactive Click Target Box (Bounding volume for raycasting)
      const hitBoxGeo = new THREE.BoxGeometry(rWidth, wallHeight + 1, rDepth);
      const hitBoxMat = new THREE.MeshBasicMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.0,
        depthWrite: false
      });
      const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
      hitBox.position.y = (wallHeight + 1) / 2;
      hitBox.userData = { roomId: roomData.id, room: roomData, type: 'room' };
      roomGroup.add(hitBox);
      roomMeshesRef.current.set(roomData.id, hitBox);

      // 3D Room Number Placard (Canvas Sprite)
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(64, 64, 56, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(roomData.roomNumber, 64, 64);

      const spriteMap = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: spriteMap, depthTest: false });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(1.4, 1.4, 1.4);
      sprite.position.set(0, wallHeight + 1.2, 0);
      roomGroup.add(sprite);

      scene.add(roomGroup);
      return { group: roomGroup, hitBox, sprite };
    };

    // Helper to create Washrooms
    const createWashroom3D = (
      roomData: FloorRoom,
      xPos: number,
      zPos: number,
      wWidth: number,
      wDepth: number,
      label: string
    ) => {
      const wrGroup = new THREE.Group();
      wrGroup.position.set(xPos, 0, zPos);

      // Cyan / Blue Tiled Floor
      const wrFloorMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.3 });
      const wrFloorGeo = new THREE.PlaneGeometry(wWidth, wDepth);
      const wrFloor = new THREE.Mesh(wrFloorGeo, wrFloorMat);
      wrFloor.rotation.x = -Math.PI / 2;
      wrFloor.position.y = 0.02;
      wrGroup.add(wrFloor);

      // Walls
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.7 });
      const wallGeo = new THREE.BoxGeometry(wWidth, 2.2, 0.25);
      const backWall = new THREE.Mesh(wallGeo, wallMat);
      backWall.position.set(0, 1.1, -wDepth / 2);
      wrGroup.add(backWall);

      const sideWallGeo = new THREE.BoxGeometry(0.25, 2.2, wDepth);
      const leftWall = new THREE.Mesh(sideWallGeo, wallMat);
      leftWall.position.set(-wWidth / 2, 1.1, 0);
      wrGroup.add(leftWall);

      const rightWall = new THREE.Mesh(sideWallGeo, wallMat);
      rightWall.position.set(wWidth / 2, 1.1, 0);
      wrGroup.add(rightWall);

      // Basin & Mirror Mockup
      const basinMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
      const basin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.8), basinMat);
      basin.position.set(0, 0.35, -wDepth / 2 + 0.6);
      wrGroup.add(basin);

      // HitBox
      const hitBox = new THREE.Mesh(
        new THREE.BoxGeometry(wWidth, 3, wDepth),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.0 })
      );
      hitBox.position.y = 1.5;
      hitBox.userData = { roomId: roomData.id, room: roomData, type: 'washroom' };
      wrGroup.add(hitBox);
      roomMeshesRef.current.set(roomData.id, hitBox);

      // Badge Sprite
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 100;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#1e3a8a';
      ctx.roundRect(10, 10, 236, 80, 20);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#60a5fa';
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 128, 50);

      const spriteMap = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: spriteMap, depthTest: false }));
      sprite.scale.set(3.2, 1.2, 1.2);
      sprite.position.set(0, 3.2, 0);
      wrGroup.add(sprite);

      scene.add(wrGroup);
    };

    // Helper to create Entrance Portico
    const createEntrance3D = () => {
      const entGroup = new THREE.Group();
      // Between Room 7 & Room 9 (around X = 1.0, Z = -5.0)
      entGroup.position.set(1.0, 0, -5.2);

      // Entrance Threshold Archway
      const archMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
      const postGeo = new THREE.BoxGeometry(0.35, 3.0, 0.35);
      const post1 = new THREE.Mesh(postGeo, archMat);
      post1.position.set(-1.4, 1.5, 0);
      entGroup.add(post1);

      const post2 = new THREE.Mesh(postGeo, archMat);
      post2.position.set(1.4, 1.5, 0);
      entGroup.add(post2);

      const beam = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.4, 0.35), archMat);
      beam.position.set(0, 3.0, 0);
      entGroup.add(beam);

      // Entrance Arrow Badge
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 100;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#0369a1';
      ctx.roundRect(10, 10, 236, 80, 20);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#38bdf8';
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 38px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⬇ Entrance', 128, 50);

      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthTest: false })
      );
      sprite.scale.set(3.2, 1.2, 1.2);
      sprite.position.set(0, 4.2, 0);
      entGroup.add(sprite);

      // Entrance HitBox
      const entHitBox = new THREE.Mesh(
        new THREE.BoxGeometry(3.5, 3.5, 2),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.0 })
      );
      entHitBox.position.y = 1.7;
      entHitBox.userData = { roomId: 'entrance', type: 'entrance' };
      entGroup.add(entHitBox);
      roomMeshesRef.current.set('entrance', entHitBox);

      scene.add(entGroup);
    };

    // Lay out the 16 Rooms matching the reference image:
    // Top Row: Rooms 1, 3, 5, 7, 9, 11, 13, 15 (Z = -4.5)
    // Bottom Row: Rooms 2, 4, 6, 8, 10, 12, 14, 16 (Z = +4.5)
    const oddRoomOrder = ['room_kumba_1', 'room_kumba_3', 'room_kumba_5', 'room_kumba_7', 'room_kumba_9', 'room_kumba_11', 'room_kumba_13', 'room_kumba_15'];
    const evenRoomOrder = ['room_kumba_2', 'room_kumba_4', 'room_kumba_6', 'room_kumba_8', 'room_kumba_10', 'room_kumba_12', 'room_kumba_14', 'room_kumba_16'];

    const roomWidth = 4.2;
    const roomDepth = 4.8;

    // Top Row (Odd)
    // Rooms 1..7 on the left of entrance, Rooms 9..15 on the right of entrance
    const topXCoords = [-17.0, -12.2, -7.4, -2.6, 4.6, 9.4, 14.2, 19.0];
    oddRoomOrder.forEach((rId, idx) => {
      const roomData = floor.rooms.find(r => r.id === rId);
      if (roomData) {
        createRoom3D(roomData, topXCoords[idx], -4.8, roomWidth, roomDepth, true);
      }
    });

    // Bottom Row (Even)
    const bottomXCoords = [-14.5, -9.7, -4.9, -0.1, 4.7, 9.5, 14.3, 19.1];
    evenRoomOrder.forEach((rId, idx) => {
      const roomData = floor.rooms.find(r => r.id === rId);
      if (roomData) {
        createRoom3D(roomData, bottomXCoords[idx], 4.8, roomWidth, roomDepth, false);
      }
    });

    // West Washroom (Left End: X = -21.0, Z = 1.0)
    const westWR = floor.rooms.find(r => r.id === 'room_kumba_washroom_west');
    if (westWR) {
      createWashroom3D(westWR, -21.0, 1.2, 4.5, 7.5, 'Washroom (W)');
    }

    // East Washroom (Right End: X = 22.0, Z = -3.5)
    const eastWR = floor.rooms.find(r => r.id === 'room_kumba_washroom_east');
    if (eastWR) {
      createWashroom3D(eastWR, 22.2, -3.5, 3.8, 6.0, 'Washroom (E)');
    }

    // Entrance
    createEntrance3D();

    // 6. Camera Position & Animation Loop
    const updateCamera = () => {
      const { rotationX, rotationY, distance, target } = controlsStateRef.current;
      const x = target.x + distance * Math.cos(rotationX) * Math.sin(rotationY);
      const y = target.y + distance * Math.sin(rotationX);
      const z = target.z + distance * Math.cos(rotationX) * Math.cos(rotationY);
      camera.position.set(x, y, z);
      camera.lookAt(target);
    };

    updateCamera();

    let clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      pulseUniformsRef.current.time.value += delta;

      if (controlsStateRef.current.autoRotate) {
        controlsStateRef.current.rotationY += 0.005;
        updateCamera();
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Mouse Interaction for Rotation & Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      controlsStateRef.current.isDragging = true;
      controlsStateRef.current.prevMouseX = e.clientX;
      controlsStateRef.current.prevMouseY = e.clientY;
    };

    const onPointerMove = (e: MouseEvent) => {
      if (controlsStateRef.current.isDragging) {
        const dx = e.clientX - controlsStateRef.current.prevMouseX;
        const dy = e.clientY - controlsStateRef.current.prevMouseY;
        controlsStateRef.current.prevMouseX = e.clientX;
        controlsStateRef.current.prevMouseY = e.clientY;

        controlsStateRef.current.rotationY -= dx * 0.008;
        controlsStateRef.current.rotationX = Math.max(
          0.15,
          Math.min(1.4, controlsStateRef.current.rotationX + dy * 0.008)
        );
        updateCamera();
      } else {
        // Raycast for hover tooltip
        const rect = container.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const meshes = Array.from(roomMeshesRef.current.values());
        const intersects = raycaster.intersectObjects(meshes, true);
        if (intersects.length > 0) {
          const uData = intersects[0].object.userData;
          if (uData.room) {
            setHoveredRoomName(uData.room.name);
          } else if (uData.type === 'entrance') {
            setHoveredRoomName('Hostel Ground Floor Entrance');
          }
        } else {
          setHoveredRoomName(null);
        }
      }
    };

    const onPointerUp = (e: MouseEvent) => {
      const wasDrag =
        Math.abs(e.clientX - controlsStateRef.current.prevMouseX) > 4 ||
        Math.abs(e.clientY - controlsStateRef.current.prevMouseY) > 4;

      controlsStateRef.current.isDragging = false;

      // If clicked without substantial dragging, select room!
      if (!wasDrag) {
        const rect = container.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const meshes = Array.from(roomMeshesRef.current.values());
        const intersects = raycaster.intersectObjects(meshes, true);
        if (intersects.length > 0) {
          const uData = intersects[0].object.userData;
          if (uData.room) {
            onSelectRoom(uData.room);
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      controlsStateRef.current.distance = Math.max(
        15,
        Math.min(90, controlsStateRef.current.distance + e.deltaY * 0.04)
      );
      updateCamera();
    };

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      container.removeEventListener('wheel', onWheel);

      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
      }
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
    };
  }, [floor, onSelectRoom]);

  // Update 3D Highlight when selectedRoom changes
  useEffect(() => {
    roomMeshesRef.current.forEach((mesh, rId) => {
      const mat = mesh.material as THREE.MeshBasicMaterial;
      if (selectedRoom && rId === selectedRoom.id) {
        mat.color.setHex(0x06b6d4); // Cyan glow
        mat.opacity = 0.35;
      } else {
        mat.opacity = 0.0;
      }
    });
  }, [selectedRoom]);

  // Map 2D percentage coordinates to 3D scene units
  // X: 0% -> -24, 100% -> +24
  // Y: 0% -> -8 (Z axis), 100% -> +8 (Z axis)
  const map2DTo3D = useCallback((pctX: number, pctY: number): THREE.Vector3 => {
    const x3D = (pctX - 50) * 0.46;
    const z3D = (pctY - 50) * 0.16;
    return new THREE.Vector3(x3D, 0.4, z3D);
  }, []);

  // Draw 3D Route Curve Ribbon
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Remove old route ribbon
    if (routeLineRef.current) {
      scene.remove(routeLineRef.current);
      routeLineRef.current = null;
    }

    if (!activeRoute || activeRoute.status === 'unverified') return;

    const floorPath = activeRoute.floorPaths.find(fp => fp.floorId === floor.id);
    if (!floorPath || floorPath.coordinates.length < 2) return;

    const routeGroup = new THREE.Group();

    // Convert 2D waypoints to 3D Points
    const points3D: THREE.Vector3[] = floorPath.coordinates.map(pt => map2DTo3D(pt[0], pt[1]));

    // Build smooth 3D tube along corridor
    const curve = new THREE.CatmullRomCurve3(points3D, false, 'catmullrom', 0.2);
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.28, 8, false);

    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    routeGroup.add(tubeMesh);

    // Add Start Checkpoint Pin
    const startPoint = points3D[0];
    const startPinMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669 });
    const startPin = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.2, 16), startPinMat);
    startPin.rotation.x = Math.PI;
    startPin.position.set(startPoint.x, 1.5, startPoint.z);
    routeGroup.add(startPin);

    // Add Destination Checkpoint Pin
    const endPoint = points3D[points3D.length - 1];
    const destPinMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626 });
    const destPin = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.4, 16), destPinMat);
    destPin.rotation.x = Math.PI;
    destPin.position.set(endPoint.x, 1.8, endPoint.z);
    routeGroup.add(destPin);

    scene.add(routeGroup);
    routeLineRef.current = routeGroup;
  }, [activeRoute, floor.id, map2DTo3D]);

  // UI Control handlers
  const handleResetCamera = () => {
    controlsStateRef.current.rotationX = 0.55;
    controlsStateRef.current.rotationY = -0.65;
    controlsStateRef.current.distance = 48;
    controlsStateRef.current.target.set(0, 0, 0);
  };

  const handleZoom = (inOut: 'in' | 'out') => {
    const delta = inOut === 'in' ? -8 : 8;
    controlsStateRef.current.distance = Math.max(15, Math.min(90, controlsStateRef.current.distance + delta));
  };

  return (
    <div className="relative w-full h-full min-h-[420px] bg-slate-950 rounded-2xl overflow-hidden select-none">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => handleZoom('in')}
          className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl border border-slate-700/80 shadow-xl backdrop-blur transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-cyan-400" />
        </button>
        <button
          onClick={() => handleZoom('out')}
          className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl border border-slate-700/80 shadow-xl backdrop-blur transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-cyan-400" />
        </button>
        <button
          onClick={handleResetCamera}
          className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl border border-slate-700/80 shadow-xl backdrop-blur transition-all"
          title="Reset 3D Perspective"
        >
          <RotateCcw className="w-4 h-4 text-blue-400" />
        </button>
        <button
          onClick={() => setIsAutoRotating(v => !v)}
          className={`p-2.5 rounded-xl border shadow-xl backdrop-blur transition-all ${
            isAutoRotating
              ? 'bg-cyan-600/90 text-white border-cyan-400'
              : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700/80'
          }`}
          title={isAutoRotating ? 'Pause Auto Rotation' : 'Enable 360° Orbit'}
        >
          {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>

      {/* 3D View Helper Overlay */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-[11px] font-bold text-slate-200 flex items-center gap-1.5 shadow-lg">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>Three.js 3D View • Click rooms to navigate</span>
        </div>
        {hoveredRoomName && (
          <div className="px-3 py-1.5 rounded-xl bg-cyan-950/90 backdrop-blur-md border border-cyan-500/50 text-[11px] font-extrabold text-cyan-200 animate-in fade-in shadow-lg">
            {hoveredRoomName}
          </div>
        )}
      </div>

      {/* Model Disclaimer Badge */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 backdrop-blur pointer-events-none">
        <Info className="w-3 h-3 text-cyan-400" />
        <span>Architectural 3D model synced with calibrated Ground Floor layout</span>
      </div>
    </div>
  );
};
