'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrthographicCamera, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const tvs = [
  { id: 1, x: 10, y: 50, pX: 10, pY: 50, width: 710, height: 450 },
  { id: 2, x: -730, y: 77, pX: -600, pY: 77, width: 459, height: 357 },
  { id: 3, x: 492, y: 163, pX: 470, pY: 130, width: 188, height: 353 },
  { id: 4, x: -700, y: -220, pX: -670, pY: -190, width: 269, height: 283 },
];

// 地图尺寸和拖动限制
const MAP_WIDTH = 1920;
const MAP_HEIGHT = 1080;
const VIEWPORT_WIDTH = 500;

const PARTICLE_COUNT = 100;

export const SteamParticles = ({ position = [0, 0, 0] }: { position: [ number, number, number ] }) => {
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
      speeds.push(0.2 + Math.random() * 0.5); // 上升速度
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
        color={0xffffff}
        size={40}
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

const Map = ({ onSceneReady }: { onSceneReady: () => void }) => {
  const frames = useLoader(THREE.TextureLoader, [
    '/assets/images/home/tvBG_1.png',
    '/assets/images/home/tvBG_2.png',
  ]);

  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, 1000 / 16);

    return () => clearInterval(interval);
  }, [frames.length]);

  useEffect(() => {
    if (frames) {
      onSceneReady();
    }
  }, [frames]);

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[MAP_WIDTH, MAP_HEIGHT]} />
      <meshBasicMaterial map={frames[frameIndex]} />
    </mesh>
  );
}

const CCTV = () => {
  const frames = useLoader(THREE.TextureLoader, [
    ...Array.from({ length: 12 }, (_, i) =>
      `/assets/images/home/cctv/cctv_${i + 1}.png`
    ),
    ...Array.from({ length: 10 }, (_, i) =>
      `/assets/images/home/cctv/cctv_${11 - i}.png`
    ),
  ]);

  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, 1000 / 10);

    return () => clearInterval(interval);
  }, [frames.length]);

  return (
    <mesh position={[640, 380, 1.01]}>
      <planeGeometry args={[120, 120]} />
      <meshBasicMaterial map={frames[frameIndex]} transparent />
    </mesh>
  );
}

const TvHitbox = ({ setHoverTvId, setTvData, tvData, clickTV, id, x, y, pX, pY, width, height }: {
  setHoverTvId: (tvId: number) => void, 
  setTvData: (data: { id: number, name: string, x: number, y: number }[]) => void,
  tvData: { id: number, name: string, x: number, y: number }[],
  clickTV: (tvId: number) => void,
  id: number, x: number, y: number, pX: number, pY: number, width: number, height: number
}) => {
  const ref = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    clickTV(id);
  };

  // 加载 dot 动画帧
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

  const tvFrames = useLoader(THREE.TextureLoader, [
    `/assets/images/home/tv/${id}_tv_1.png`,
    `/assets/images/home/tv/${id}_tv_2.png`,
  ]);

  const hoverTexture = useLoader(THREE.TextureLoader, `/assets/images/home/tv/${id}_tv_w.png`);

  const [dotFrameIndex, setDotFrameIndex] = useState(0);
  const [dotOutlineFrameIndex, setDotOutlineFrameIndex] = useState(0);
  const [tvFrameIndex, setTvFrameIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (hovered) {
      // 改变鼠标光标为指针
      document.body.style.cursor = 'pointer';
      
      const fullText =
        id === 1 ? "TN7 UNIVERSE" : id === 2 ? "LORE" : id === 3 ? "WORLD MAP" : "CITIZEN";
  
      const glitchFrames:any = [];
      for (let i = 1; i <= fullText.length; i++) {
        // 每帧用部分正确文本 + 随机乱码拼接
        const partial = fullText.slice(0, i);
        const junk = Array(fullText.length - i)
          .fill(0)
          .map(() =>
            String.fromCharCode(33 + Math.floor(Math.random() * 94))
          ) // ASCII 33 ~ 126
          .join("");
        glitchFrames.push(partial + junk);
      }
  
      let frame = 0;
      const interval = setInterval(() => {
        setDisplayText(glitchFrames[frame]);
        frame++;
        if (frame >= glitchFrames.length) clearInterval(interval);
      }, 50); // 每帧 50ms
  
      return () => {
        clearInterval(interval);
        document.body.style.cursor = 'default';
      };
    } else {
      setDisplayText("");
      document.body.style.cursor = 'default';
    }
  }, [hovered, id]);  

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

  // 组件卸载时恢复光标
  useEffect(() => {
    return () => {
      document.body.style.cursor = 'default';
    };
  }, []);

  return (
    <>
      {/* 点击区域 */}
      <mesh
        ref={ref}
        position={[x, y, 1.01]}
        onPointerOver={() => { 
          setHovered(true); 
          setHoverTvId(Number(id));
          setTvData(
            tvData.map(item =>
              item.id === id
                ? { ...item, x: pX, y: 200 } // Update the matching entry
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

      {hovered && (
        <mesh position={[x, y, 1]}>
          <planeGeometry args={[width*1.02, height*1.02]} />
          <meshBasicMaterial map={hoverTexture} transparent />
        </mesh>
      )}

      {/* dot 本体动画 */}
      <mesh position={[pX, pY, 2]}>
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial map={dotFrames[dotFrameIndex]} transparent />
      </mesh>

      {/* outline 动画，略微放大一点点叠在底下或上面 */}
      <mesh position={[pX, pY, 2.01]}>
        <planeGeometry args={[70, 70]} />
        <meshBasicMaterial map={outlineFrames[dotOutlineFrameIndex]} transparent />
      </mesh>
      {hovered && (
        <Text
            font="/fonts/Impacted.ttf"
            position={[pX, pY+100, 2.02]}
            fontSize={40}
            color="#ffffff"
            anchorX="center"
            anchorY="top"
        >
            {displayText}
        </Text>
      )}
    </>
  );
};

// 统一的移动设备检测函数
const checkIsMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || (typeof window !== 'undefined' && window.innerWidth <= 768);
};

const MapScene: React.FC<{ 
  setHoverTvId: (tvId: number) => void, 
  setTvData: (data: { id: number, name: string, x: number, y: number }[]) => void,
  tvData: { id: number, name: string, x: number, y: number }[],
  clickTV: (tvId: number) => void,
  onSceneReady: () => void,
  isDragging: boolean,
  setIsDragging: (isDragging: boolean) => void,
  isMobile: boolean,
}> = ({ setHoverTvId, setTvData, tvData, clickTV, onSceneReady, isDragging, setIsDragging, isMobile }) => {
  const group = useRef<THREE.Group>(null);
  const ventsRef = useRef<THREE.Mesh>(null);
  const chairRef = useRef<THREE.Mesh>(null);
  const [lastX, setLastX] = useState(0);
  const targetX = useRef(0); // 用于平滑过渡的目标位置

  // 桌面版：使用 useFrame 实现鼠标视差效果（不需要按下）
  useFrame(({ mouse, size }) => {
    if (!isMobile && group.current) {
      // 计算视差移动范围
      const halfMap = MAP_WIDTH / 2;
      const halfView = VIEWPORT_WIDTH / 2;
      const maxOffset = halfMap - halfView;
      
      // 根据鼠标位置计算目标位置（mouse.x 范围是 -1 到 1）
      // 负号表示反向：鼠标向右移动时，地图向左移动
      targetX.current = mouse.x * maxOffset * -0.2; // 0.2 是视差强度，可以调整

      // 平滑过渡到目标位置
      const currentX = group.current.position.x;
      const lerpFactor = 0.1; // 平滑系数，可以调整
      const nextX = currentX + (targetX.current - currentX) * lerpFactor;

      // 应用边界限制
      let clampedX = nextX;
      if (clampedX < -maxOffset) {
        const exceeded = -maxOffset - clampedX;
        clampedX = -maxOffset - exceeded * 0.3;
      } else if (clampedX > maxOffset) {
        const exceeded = clampedX - maxOffset;
        clampedX = maxOffset + exceeded * 0.3;
      }

      const actualDelta = clampedX - currentX;
      group.current.position.x = clampedX;

      // Parallax logic: opposite direction, different speeds
      if (ventsRef.current) {
        ventsRef.current.position.x -= actualDelta * 0.2;
      }
      if (chairRef.current) {
        chairRef.current.position.x += actualDelta * 0.3;
      }
    }
  });

  const onPointerDown = (e: any) => {
    // 移动设备：支持触摸拖动
    if (isMobile && e.pointerType === 'mouse') {
      // 手机版忽略鼠标事件
      return;
    }
    if (isMobile) {
      setIsDragging(true);
      setLastX(e.clientX);
    }
    // 桌面版不需要处理按下事件，因为使用 useFrame 的 mouse
  };

  const onPointerUp = () => {
    if (isMobile) {
      setIsDragging(false);
    }
  };

  const onPointerMove = (e: any) => {
    // 只在移动设备拖动时处理
    if (isMobile && isDragging && group.current) {
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
      if (ventsRef.current) {
        ventsRef.current.position.x -= actualDelta * 0.2;
      }
      if (chairRef.current) {
        chairRef.current.position.x += actualDelta * 0.3;
      }

      setLastX(e.clientX);
    }
  };

  const ventsTexture = useLoader(THREE.TextureLoader, `/assets/images/home/vents.png`);
  const chairTexture = useLoader(THREE.TextureLoader, `/assets/images/home/chair.png`);

  const vignetteTexture = useLoader(THREE.TextureLoader, `/assets/images/worldmap/vignette.png`);

  const [ mapReady, setMapReady ] = useState<boolean>(false);

  useEffect(() => {
    if(mapReady && ventsTexture && chairTexture) {
      onSceneReady();
    }
  }, [mapReady, ventsTexture, chairTexture])

  return (
    <group
      ref={group}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
    >
      <Map onSceneReady={() => setMapReady(true) } />
      {tvs.map((b) => (
        <TvHitbox setHoverTvId={setHoverTvId} setTvData={setTvData} tvData={tvData} clickTV={clickTV} key={b.id} {...b} />
      ))}
      <CCTV />
      <mesh ref={ventsRef} position={[0, 0, 2.02]}>
        <planeGeometry args={[MAP_WIDTH, MAP_HEIGHT]} />
        <meshBasicMaterial map={ventsTexture} transparent />
      </mesh>
      <mesh ref={chairRef} position={[0, -430, 2.03]}>
        <planeGeometry args={[162*1.05, 216*1.05]} />
        <meshBasicMaterial map={chairTexture} transparent />
      </mesh>
      <SteamParticles position={[-360, -320, 2.04]} />
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
        <meshBasicMaterial map={vignetteTexture} transparent opacity={0.2} />
      </mesh>
      <mesh position={[0, -50, 2.05]}>
        <planeGeometry args={[1920, 1068]} />
        <meshBasicMaterial map={vignetteTexture} transparent opacity={0.2} />
      </mesh>
    </group>
  );
};

const MobileVersionHomeScene: React.FC<{ 
  setHoverTvId: (tvId: number) => void, 
  setTvData: (data: { id: number, name: string, x: number, y: number }[]) => void,
  tvData: { id: number, name: string, x: number, y: number }[],
  clickTV: (tvId: number) => void,
  onSceneReady: () => void,
}> = ({ setHoverTvId, setTvData, tvData, clickTV, onSceneReady }) => {
  const [ isDragging, setIsDragging ] = useState(false);
  const [ isMobile, setIsMobile ] = useState(false);

  // 检测是否为移动设备（使用统一的检测函数）
  useEffect(() => {
    const updateMobile = () => {
      setIsMobile(checkIsMobile());
    };
    updateMobile();
    window.addEventListener('resize', updateMobile);
    return () => window.removeEventListener('resize', updateMobile);
  }, []);

  return (
    <Canvas orthographic>
      <color attach="background" args={['#000000']} />
      <MapScene setHoverTvId={setHoverTvId} setTvData={setTvData} tvData={tvData} clickTV={clickTV} onSceneReady={onSceneReady} setIsDragging={setIsDragging} isDragging={isDragging} isMobile={isMobile} />
      { isMobile && !isDragging && <Fingers /> }
      <OrthographicCamera makeDefault position={[0, 0, 100]} zoom={1.1} />
    </Canvas>
  );
}

export default MobileVersionHomeScene;