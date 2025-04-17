'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrthographicCamera, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const tvs = [
  { id: 1, x: 10, y: 50, pX: 10, pY: 50, width: 710, height: 450 },
  { id: 2, x: -730, y: 77, pX: -600, pY: 77, width: 459, height: 357 },
  { id: 3, x: 492, y: 163, pX: 470, pY: 130, width: 188, height: 353 },
];

// 地图尺寸和拖动限制
const MAP_WIDTH = 1920;
const MAP_HEIGHT = 1080;
const VIEWPORT_WIDTH = 500;
const ANIMATION_FPS = 16;

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
    }, 1000 / ANIMATION_FPS);

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
    '/assets/images/home/cctv/cctv_1.png',
    '/assets/images/home/cctv/cctv_2.png',
    '/assets/images/home/cctv/cctv_3.png',
    '/assets/images/home/cctv/cctv_4.png',
    '/assets/images/home/cctv/cctv_5.png',
    '/assets/images/home/cctv/cctv_6.png',
    '/assets/images/home/cctv/cctv_7.png',
    '/assets/images/home/cctv/cctv_8.png',
    '/assets/images/home/cctv/cctv_9.png',
    '/assets/images/home/cctv/cctv_10.png',
    '/assets/images/home/cctv/cctv_11.png',
    '/assets/images/home/cctv/cctv_12.png',
    '/assets/images/home/cctv/cctv_11.png',
    '/assets/images/home/cctv/cctv_10.png',
    '/assets/images/home/cctv/cctv_9.png',
    '/assets/images/home/cctv/cctv_8.png',
    '/assets/images/home/cctv/cctv_7.png',
    '/assets/images/home/cctv/cctv_6.png',
    '/assets/images/home/cctv/cctv_5.png',
    '/assets/images/home/cctv/cctv_4.png',
    '/assets/images/home/cctv/cctv_3.png',
    '/assets/images/home/cctv/cctv_2.png',
  ]);

  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, 1000 / ANIMATION_FPS);

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
    '/assets/images/home/dot/dot_1.png',
    '/assets/images/home/dot/dot_2.png',
    '/assets/images/home/dot/dot_3.png',
    '/assets/images/home/dot/dot_4.png',
    '/assets/images/home/dot/dot_5.png',
    '/assets/images/home/dot/dot_6.png',
    '/assets/images/home/dot/dot_7.png',
    '/assets/images/home/dot/dot_8.png',
    '/assets/images/home/dot/dot_9.png',
    '/assets/images/home/dot/dot_10.png',
    '/assets/images/home/dot/dot_9.png',
    '/assets/images/home/dot/dot_8.png',
    '/assets/images/home/dot/dot_7.png',
    '/assets/images/home/dot/dot_6.png',
    '/assets/images/home/dot/dot_5.png',
    '/assets/images/home/dot/dot_4.png',
    '/assets/images/home/dot/dot_3.png',
    '/assets/images/home/dot/dot_2.png',
  ]);

  // 加载 outline 动画帧
  const outlineFrames = useLoader(THREE.TextureLoader, [
    '/assets/images/home/dot/dot_outline_1.png',
    '/assets/images/home/dot/dot_outline_2.png',
    '/assets/images/home/dot/dot_outline_3.png',
    '/assets/images/home/dot/dot_outline_4.png',
    '/assets/images/home/dot/dot_outline_5.png',
    '/assets/images/home/dot/dot_outline_6.png',
    '/assets/images/home/dot/dot_outline_7.png',
    '/assets/images/home/dot/dot_outline_8.png',
    '/assets/images/home/dot/dot_outline_9.png',
    '/assets/images/home/dot/dot_outline_10.png',
    '/assets/images/home/dot/dot_outline_11.png',
    '/assets/images/home/dot/dot_outline_12.png',
    '/assets/images/home/dot/dot_outline_13.png',
    '/assets/images/home/dot/dot_outline_14.png',
    '/assets/images/home/dot/dot_outline_15.png',
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
      const fullText =
        id === 1 ? "TN7 UNIVERSE" : id === 2 ? "LORE" : "WORLD MAP";
  
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
  
      return () => clearInterval(interval);
    } else {
      setDisplayText("");
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
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial map={dotFrames[dotFrameIndex]} transparent />
      </mesh>

      {/* outline 动画，略微放大一点点叠在底下或上面 */}
      <mesh position={[pX, pY, 2.01]}>
        <planeGeometry args={[60, 60]} />
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

const MapScene: React.FC<{ 
  setHoverTvId: (tvId: number) => void, 
  setTvData: (data: { id: number, name: string, x: number, y: number }[]) => void,
  tvData: { id: number, name: string, x: number, y: number }[],
  clickTV: (tvId: number) => void,
  onSceneReady: () => void,
}> = ({ setHoverTvId, setTvData, tvData, clickTV, onSceneReady }) => {
  const group = useRef<THREE.Group>(null);
  const ventsRef = useRef<THREE.Mesh>(null);
  const chairRef = useRef<THREE.Mesh>(null);

  const [isDragging, setDragging] = useState(false);
  const [lastX, setLastX] = useState(0);

  const onPointerDown = (e: any) => {
    setDragging(true);
    setLastX(e.clientX);
  };

  const onPointerUp = () => setDragging(false);

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
      if (ventsRef.current) {
        ventsRef.current.position.x -= actualDelta * 0.2; // slower and opposite
      }
      if (chairRef.current) {
        chairRef.current.position.x += actualDelta * 0.3; // a bit faster
      }

      setLastX(e.clientX);
    }
  };

  const ventsTexture = useLoader(THREE.TextureLoader, `/assets/images/home/vents.png`);
  const chairTexture = useLoader(THREE.TextureLoader, `/assets/images/home/chair.png`);

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
      
      {/* vents - further back */}
      <mesh ref={ventsRef} position={[0, 0, 2.02]}>
        <planeGeometry args={[MAP_WIDTH, MAP_HEIGHT]} />
        <meshBasicMaterial map={ventsTexture} transparent />
      </mesh>

      {/* chair - closer */}
      <mesh ref={chairRef} position={[0, -320, 2.03]}>
        <planeGeometry args={[162, 216]} />
        <meshBasicMaterial map={chairTexture} transparent />
      </mesh>

      <Fingers />
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
  return (
    <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 100] }}>
      <color attach="background" args={['#e0e0e0']} />
      <MapScene setHoverTvId={setHoverTvId} setTvData={setTvData} tvData={tvData} clickTV={clickTV} onSceneReady={onSceneReady} />
      <OrthographicCamera makeDefault position={[0, 0, 100]} />
    </Canvas>
  );
}

export default MobileVersionHomeScene;