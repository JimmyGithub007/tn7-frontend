'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrthographicCamera, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring } from '@react-spring/three';

const buildings = [
    { id: 1, x: -489, y: 213, pX: -489, pY: 213, width: 136.25, height: 160 },
    { id: 2, x: -251, y: 262, pX: -251, pY: 262, width: 116.75, height: 238 },
    { id: 3, x: -380, y: 15, pX: -380, pY: 15, width: 544.5, height: 144.5 },
    { id: 4, x: 125, y: 255, pX: 125, pY: 255, width: 121, height: 92.5 },
    { id: 5, x: 345, y: 217, pX: 330, pY: 217, width: 217.5, height: 208.5 },
    { id: 6, x: 520, y: 234, pX: 520, pY: 234, width: 124.5, height: 264.5 },
    { id: 7, x: 241, y: -67, pX: 250, pY: -67, width: 468.25, height: 117.5 },
    { id: 8, x: 330, y: -170, pX: 330, pY: -170, width: 252.5, height: 176.5 },
    { id: 9, x: 580, y: -255, pX: 588, pY: -255, width: 148.5, height: 92.5 },
];

// 地图尺寸和拖动限制
const MAP_WIDTH = 1920;
const MAP_HEIGHT = 1080;
const VIEWPORT_WIDTH = 500;

const PARTICLE_COUNT = 500;

export const SteamParticles = ({ position = [0, 0, 0], type="" }: { position: [ number, number, number ], type:string }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const smokeTexture = useLoader(THREE.TextureLoader, '/assets/images/worldmap/smoke_01.png');

  // 初始化粒子数据
  const particles = useMemo(() => {
    const positions = [];
    const speeds = [];
    const sizes = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // 位置随机分布在一个小圆形范围内
      const x = (Math.random() - 0.5) * 40;
      const y = Math.random() * 20;
      const z = (Math.random() - 0.5) * 40;
      positions.push(x, y, z);
      speeds.push(0.2 + Math.random() * 0.2); // 上升速度
      sizes.push(5 + Math.random() * 10); // 粒子大小
    }

    return { positions: new Float32Array(positions), speeds, sizes };
  }, []);

  useFrame(() => {
    if (!pointsRef.current) return; // ✅ 安全判断
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      positions[idx + 1] += particles.speeds[i]; // y轴上升
      positions[idx] += 0.15; // 使粒子向右飘动

      // 超过一定高度就重置
      if (positions[idx + 1] > 200) {
        positions[idx + 1] = 0;
        positions[idx] = (Math.random() - 0.5) * 40;
        positions[idx + 2] = (Math.random() - 0.5) * 40;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points position={position} ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        map={smokeTexture}
        color={type === "green" ? "#ccdc4b" : "#c6c6c6"}
        size={type === "green" ? 100 : 50}
        sizeAttenuation
        transparent
        opacity={0.1}
        depthWrite={false}
      />
    </points>
  );
};

const Fingers = () => {
    const [fingerFrameIndex, setFingerFrameIndex] = useState(0);
    const fingerFrames = useLoader(THREE.TextureLoader, [       
         ...Array.from({ length: 15 }, (_, i) =>
            `/assets/images/worldmap/fingers/scroll_finger (${i + 1}).png`
        )
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setFingerFrameIndex((prev) => (prev + 1) % fingerFrames.length);
        }, 100);
        return () => clearInterval(interval);
    }, [fingerFrames.length]);

    return (<group position={[0, -200, 2.05]}>
        <mesh>
            <planeGeometry args={[60, 60]} />
            <meshBasicMaterial map={fingerFrames[fingerFrameIndex]} transparent />
        </mesh>
        <Text
            position={[0, -40, 0]}
            fontSize={14}
            color="#ffffff"
            anchorX="center"
            anchorY="top"
        >
            swipe to left / right
        </Text>
    </group>)
}

const BuildingHitbox = ({ setHoverBuildingId, setBuildingData, buildingData, clickBuilding, setTargetPosition, setTargetZoom, loadingPercentage, id, buildingId, x, y, pX, pY, width, height }: {
    setHoverBuildingId: (buildingId: number) => void,
    setBuildingData: (data: { id: number, name: string, x: number, y: number }[]) => void,
    buildingData: { id: number, name: string, x: number, y: number }[],
    clickBuilding: (buildingId: number) => void,
    setTargetPosition: (data: [number, number, number]) => void,
    setTargetZoom: (zoom: number) => void,
    id: number, x: number, y: number, pX: number, pY: number, width: number, height: number,
    buildingId: number,
    loadingPercentage: number,
}) => {
    const ref = useRef<THREE.Mesh>(null!);
    const [hovered, setHovered] = useState(false);

    const handleClick = (e:any) => {
        clickBuilding(id);
        e.stopPropagation();
        const pos = e.point;
        if(pos.y > 200) pos.y = 200;
        else if(pos.y < -200) pos.y = -200;
        setTargetPosition([pos.x, pos.y, 100]);
        setTargetZoom(1.5);
    };

    const dotFrames = useLoader(THREE.TextureLoader, [
        ...Array.from({ length: 10 }, (_, i) =>
            `/assets/images/home/dot/dot_${i + 1}.png`
        ),
        ...Array.from({ length: 8 }, (_, i) =>
            `/assets/images/home/dot/dot_${9 - i}.png`
        ),
    ]);

    // 加载 outline 动画帧
    const outlineFrames = useLoader(THREE.TextureLoader, [
        ...Array.from({ length: 15 }, (_, i) =>
            `/assets/images/home/dot/dot_outline_${i + 1}.png`
        ),
    ]);

    const tvFrames = useLoader(THREE.TextureLoader, id === 9 ? [
        // 正序 b9_green_1.png → b9_green_16.png
        ...Array.from({ length: 16 }, (_, i) =>
            `/assets/images/worldmap/buildings/b9/b9_green_${i + 1}.png`
        ),
        // 反序 b9_green_15.png → b9_green_2.png
        ...Array.from({ length: 15 }, (_, i) =>
            `/assets/images/worldmap/buildings/b9/b9_green_${15 - i}.png`
        ),
    ] : [`/assets/images/worldmap/buildings/b${id}.png`]);

    const hoverTexture = useLoader(THREE.TextureLoader, `/assets/images/worldmap/buildings/b${id}_w.png`);

    const [dotFrameIndex, setDotFrameIndex] = useState(0);
    const [dotOutlineFrameIndex, setDotOutlineFrameIndex] = useState(0);
    const [tvFrameIndex, setTvFrameIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setDotFrameIndex((prev) => (prev + 1) % dotFrames.length);
        }, 100);
        return () => clearInterval(interval);
    }, [dotFrames.length]);

    useEffect(() => {
        const interval = setInterval(() => {
            setDotOutlineFrameIndex((prev) => (prev + 1) % outlineFrames.length);
        }, 100);
        return () => clearInterval(interval);
    }, [outlineFrames.length]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTvFrameIndex((prev) => (prev + 1) % tvFrames.length);
        }, 100);
        return () => clearInterval(interval);
    }, [tvFrames.length]);

    return (
        <>
            {/* 点击区域 */}
            <mesh
                ref={ref}
                position={[x, y, 1.01]}
                onPointerOver={() => {
                    setHovered(true);
                    setHoverBuildingId(Number(id));
                    setBuildingData(
                        buildingData.map(item =>
                            item.id === id
                                ? { ...item, x: pX, y: pY } // Update the matching entry
                                : item // Keep the rest unchanged
                        )
                    );
                }}
                onPointerOut={() => setHovered(false)}
                onClick={handleClick}
            >
                <planeGeometry args={[width, height]} />
                <meshBasicMaterial map={tvFrames[tvFrameIndex]} transparent />
            </mesh>

            {(hovered || buildingId === id) && (
                <mesh position={[x, y, 1]}>
                    <planeGeometry args={[width * 1.03, height * 1.03]} />
                    <meshBasicMaterial map={hoverTexture} transparent />
                </mesh>
            )}

            {/* dot 本体动画 */}
            {
                loadingPercentage === 100 && <mesh position={[pX, pY, 2]}>
                    <planeGeometry args={[50, 50]} />
                    <meshBasicMaterial map={dotFrames[dotFrameIndex]} transparent />
                </mesh>
            }

            {/* outline 动画，略微放大一点点叠在底下或上面 */}
            {
                loadingPercentage === 100 && <mesh position={[pX, pY, 2.01]}>
                    <planeGeometry args={[60, 60]} />
                    <meshBasicMaterial map={outlineFrames[dotOutlineFrameIndex]} transparent />
                </mesh>
            }
        </>
    );
};

const MapScene: React.FC<{
    setHoverBuildingId: (buildingId: number) => void,
    setBuildingData: (data: { id: number, name: string, x: number, y: number }[]) => void,
    buildingData: { id: number, name: string, x: number, y: number }[],
    clickBuilding: (buildingId: number) => void,
    cameraRef: any,
    buildingId: number,
    onSceneReady: () => void,
    loadingPercentage: number,
    isDragging: boolean,
    setIsDragging: (isDragging: boolean) => void,
}> = ({ setHoverBuildingId, setBuildingData, buildingData, clickBuilding, cameraRef, buildingId, onSceneReady, loadingPercentage, isDragging, setIsDragging }) => {
    const group = useRef<THREE.Group>(null);
    const word1Ref = useRef<THREE.Mesh>(null);
    const word2Ref = useRef<THREE.Mesh>(null);
    const word3Ref = useRef<THREE.Mesh>(null);
    const whiteCloud1Ref = useRef<THREE.Mesh>(null);
    const whiteCloud2Ref = useRef<THREE.Mesh>(null);

    const [lastX, setLastX] = useState(0);

    const onPointerDown = (e: any) => {
        setIsDragging(true);
        setLastX(e.clientX);
    };

    const onPointerUp = () => setIsDragging(false);

    const onPointerMove = (e: any) => {
        if (isDragging && group.current) {
            const deltaX = e.clientX - lastX;

            // Main group move
            let nextX = group.current.position.x + deltaX;

            const halfMap = MAP_WIDTH / 2;
            const halfView = VIEWPORT_WIDTH / 2;
            const minX = -(halfMap - halfView);
            const maxX = halfMap - halfView;

            // 阻力拖拽
            if (nextX < minX) {
                const exceeded = minX - nextX;
                nextX = minX - exceeded * 0.3;
            } else if (nextX > maxX) {
                const exceeded = nextX - maxX;
                nextX = maxX + exceeded * 0.3;
            }

            const actualDelta = nextX - group.current.position.x;
            group.current.position.x = nextX;
      
            // Parallax logic: opposite direction, different speeds
            if (word1Ref.current && word2Ref.current && word3Ref.current && whiteCloud1Ref.current && whiteCloud2Ref.current) {
                word1Ref.current.position.x -= actualDelta * 0.1;
                word2Ref.current.position.x -= actualDelta * 0.1;
                word3Ref.current.position.x -= actualDelta * 0.1;
                whiteCloud1Ref.current.position.x -= actualDelta * 0.2;
                whiteCloud2Ref.current.position.x += actualDelta * 0.2;
            }

            setLastX(e.clientX);
        }
    };

    const riverFrames = useLoader(THREE.TextureLoader, [
        ...Array.from({ length: 1 }, (_, i) =>
            `/assets/images/worldmap/rivers/river (${i + 1}).webp`
        ),
        `/assets/images/worldmap/rivers/river (2).webp`
    ]);

    const [riverFrameIndex, setRiverFrameIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setRiverFrameIndex((prev) => (prev + 1) % riverFrames.length);
        }, 100);
        return () => clearInterval(interval);
    }, [riverFrames.length]);

    const m2Texture = useLoader(THREE.TextureLoader, `/assets/images/worldmap/mountains/m2.png`);
    const m3Texture = useLoader(THREE.TextureLoader, `/assets/images/worldmap/mountains/m3.png`);
    const m4Texture = useLoader(THREE.TextureLoader, `/assets/images/worldmap/mountains/m4.png`);
    const m5Texture = useLoader(THREE.TextureLoader, `/assets/images/worldmap/mountains/m5.png`);
    const m8Texture = useLoader(THREE.TextureLoader, `/assets/images/worldmap/mountains/m8.png`);
    const m9Texture = useLoader(THREE.TextureLoader, `/assets/images/worldmap/mountains/m9.png`);

    const word1Texture = useLoader(THREE.TextureLoader, `/assets/images/worldmap/word/synthcity.png`);
    const word2Texture = useLoader(THREE.TextureLoader, `/assets/images/worldmap/word/cybervalley.png`);
    const word3Texture = useLoader(THREE.TextureLoader, `/assets/images/worldmap/word/newhelm.png`);

    const cloudTexture = useLoader(THREE.TextureLoader, `/assets/images/worldmap/cloud1.png`);
    const wCloud01Texture = useLoader(THREE.TextureLoader, `/assets/images/worldmap/white_cloud_01.png`);
    const wCloud02Texture = useLoader(THREE.TextureLoader, `/assets/images/worldmap/white_cloud_02.png`);
    const vignetteTexture = useLoader(THREE.TextureLoader, `/assets/images/worldmap/vignette.png`);

    // 默认值
    const defaultZoom = 1;
    const defaultPosition: [number, number, number] = [0, 0, 100];

    const [targetZoom, setTargetZoom] = useState(defaultZoom);
    const [targetPosition, setTargetPosition] = useState<[number, number, number]>(defaultPosition);

    const spring = useSpring({
        zoom: targetZoom,
        position: targetPosition,
        config: { mass: 1, tension: 100, friction: 14 },
    });

    useFrame(() => {
        if (cameraRef.current) {
            const { position, zoom } = spring;
            cameraRef.current.zoom = zoom.get();
            const [x, y, z] = position.get();
            cameraRef.current.position.set(x, y, z);
            cameraRef.current.updateProjectionMatrix();
        }
    });

    useEffect(() => {
        if(buildingId === 0) {
            setTargetZoom(1);
            setTargetPosition([0, 0, 100]);
        }
    }, [buildingId])

    useEffect(() => {
        if (riverFrames && cloudTexture && word1Texture && word2Texture && word3Texture) {
            onSceneReady();
        }
    }, [riverFrames, cloudTexture, word1Texture, word2Texture, word3Texture]);

    return (
        <group
            ref={group}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerMove={onPointerMove}
        >
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[MAP_WIDTH, MAP_HEIGHT]} />
                <meshBasicMaterial map={riverFrames[riverFrameIndex]} transparent />
            </mesh>
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[MAP_WIDTH, MAP_HEIGHT]} />
                <meshBasicMaterial map={useLoader(THREE.TextureLoader, `/assets/images/worldmap/worldmap.png`)} transparent />
            </mesh>
            <mesh ref={word1Ref} position={[-480, 300, 0]}>
                <planeGeometry args={[724*0.6, 67*0.6]} />
                <meshBasicMaterial map={word1Texture} transparent opacity={0.4} />
            </mesh>

            <mesh ref={word2Ref} position={[290, 320, 0]}>
                <planeGeometry args={[750*0.6, 67*0.6]} />
                <meshBasicMaterial map={word2Texture} transparent opacity={0.4} />
            </mesh>

            <mesh ref={word3Ref} position={[400, 0, 0]}>
                <planeGeometry args={[724*0.6, 67*0.6]} />
                <meshBasicMaterial map={word3Texture} transparent opacity={0.4} />
            </mesh>

            {buildings.map((b) => (
                <BuildingHitbox 
                    setHoverBuildingId={setHoverBuildingId} 
                    setBuildingData={setBuildingData} 
                    buildingData={buildingData} clickBuilding={clickBuilding} 
                    setTargetPosition={setTargetPosition} 
                    setTargetZoom={setTargetZoom} 
                    buildingId={buildingId}
                    loadingPercentage={loadingPercentage}
                    key={b.id} {...b} 
                />
            ))}
            <SteamParticles position={[580, -240, 2.03]} type="green" />
            <SteamParticles position={[300, -240, 2.03]} type="gray" />
            <SteamParticles position={[200, -100, 2.03]} type="gray" />
            <SteamParticles position={[500, -100, 2.03]} type="gray" />

            <mesh position={[-600, -350, 2.03]}>
                <planeGeometry args={[675, 313]} />
                <meshBasicMaterial map={m3Texture} transparent />
            </mesh>
            <mesh position={[-400, -350, 2.03]}>
                <planeGeometry args={[494, 188]} />
                <meshBasicMaterial map={m8Texture} transparent />
            </mesh>
            <mesh position={[-200, -350, 2.03]}>
                <planeGeometry args={[494, 188]} />
                <meshBasicMaterial map={m2Texture} transparent />
            </mesh>

            <mesh position={[0, -350, 2.03]}>
                <planeGeometry args={[678, 316]} />
                <meshBasicMaterial map={m9Texture} transparent />
            </mesh>
            <mesh position={[-100, -350, 2.03]}>
                <planeGeometry args={[565, 250]} />
                <meshBasicMaterial map={m4Texture} transparent />
            </mesh>
            <mesh position={[600, -350, 2.03]}>
                <planeGeometry args={[697, 359]} />
                <meshBasicMaterial map={m5Texture} transparent />
            </mesh>

            <mesh position={[0, 0, 2.04]}>
                <planeGeometry args={[MAP_WIDTH, MAP_HEIGHT]} />
                <meshBasicMaterial map={cloudTexture} transparent opacity={0.5} />
            </mesh>
            <mesh ref={whiteCloud1Ref} position={[0, 0, 2.04]}>
                <planeGeometry args={[MAP_WIDTH, MAP_HEIGHT]} />
                <meshBasicMaterial map={wCloud01Texture} transparent opacity={0.5} />
            </mesh>
            <mesh ref={whiteCloud2Ref} position={[0, 0, 2.04]}>
                <planeGeometry args={[MAP_WIDTH, MAP_HEIGHT]} />
                <meshBasicMaterial map={wCloud02Texture} transparent opacity={0.5} />
            </mesh>

            <mesh position={[-600, 0, 2.05]} rotation={[0, 0, -Math.PI / 2]}>
                <planeGeometry args={[1920, 1068]} />
                <meshBasicMaterial map={vignetteTexture} transparent />
            </mesh>
            <mesh position={[600, 0, 2.05]} rotation={[0, 0, Math.PI / 2]}>
                <planeGeometry args={[1920, 1068]} />
                <meshBasicMaterial map={vignetteTexture} transparent />
            </mesh>
            <mesh position={[0, 100, 2.05]} scale={[1, -1, 1]}>
                <planeGeometry args={[1920, 1068]} />
                <meshBasicMaterial map={vignetteTexture} transparent opacity={0.9} />
            </mesh>
            <mesh position={[0, -50, 2.05]}>
                <planeGeometry args={[1920, 1068]} />
                <meshBasicMaterial map={vignetteTexture} transparent opacity={0.9} />
            </mesh>
        </group>
    );
};

const MobileVersionWorldMapScene: React.FC<{
    setHoverBuildingId: (buildingId: number) => void,
    setBuildingData: (data: { id: number, name: string, x: number, y: number }[]) => void,
    buildingData: { id: number, name: string, x: number, y: number }[],
    clickBuilding: (buildingId: number) => void,
    buildingId: number,
    onSceneReady: () => void,
    loadingPercentage: number,
}> = ({ setHoverBuildingId, setBuildingData, buildingData, clickBuilding, buildingId, onSceneReady, loadingPercentage }) => {
    const cameraRef = useRef<THREE.OrthographicCamera>(null!);
    const [ isDragging, setIsDragging ] = useState(false);
    return (
        <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 100] }}>
            <color attach="background" args={['#000000']} />
            <MapScene 
                onSceneReady={onSceneReady} 
                loadingPercentage={loadingPercentage} 
                setHoverBuildingId={setHoverBuildingId} 
                setBuildingData={setBuildingData} 
                buildingData={buildingData} 
                clickBuilding={clickBuilding} 
                cameraRef={cameraRef} 
                buildingId={buildingId}
                setIsDragging={setIsDragging}
                isDragging={isDragging}
            />
            { !isDragging && loadingPercentage === 100 && buildingId === 0 && <Fingers /> }
            <OrthographicCamera ref={cameraRef} makeDefault position={[0, 0, 100]} zoom={1} />
        </Canvas>
    );
}

export default MobileVersionWorldMapScene;