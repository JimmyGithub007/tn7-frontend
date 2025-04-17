"use client";

import { Canvas, useLoader } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Text } from "@react-three/drei";
import { setJumpPage } from "@/store/slice/pageSlice";
import { useRef, useState } from "react";
import * as THREE from 'three';

const ComicHitBox = ({ id, x, y }: { id: number, x: number, y: number }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const comicTexture = useLoader(THREE.TextureLoader, `/assets/images/comics/comicW${id}.png`);

    return <group
        position={[x, y, 1.04]}
        onClick={() => {
            if (id === 2) {
                dispatch(setJumpPage(true));
                const timeout = setTimeout(() => {
                    router.push("/comics/secretofthevalley");
                }, 200);
                return () => clearTimeout(timeout);
            }
        }}
    >
        <mesh>
            <planeGeometry args={[977 * 0.25, 906 * 0.25]} />
            <meshBasicMaterial map={comicTexture} transparent />
        </mesh>
        {
            id !== 2 && <Text
                font="/fonts/Impacted.ttf"
                position={[-20, 0, 0]}
                fontSize={25}
                color="#ffffff"
                anchorX="center"
                anchorY="top"
            >
                COMING SOON
            </Text>
        }
    </group>
}

const MAP_WIDTH = 1920;
const VIEWPORT_WIDTH = 500;

const Timeline = () => {
    const timelineBGTOP = useLoader(THREE.TextureLoader, `/assets/images/comics/timelineBGTOP.png`);
    const timelineBGBOTTOMTexture = useLoader(THREE.TextureLoader, `/assets/images/comics/timelineBGBOTTOM.png`);
    const timelineTexture = useLoader(THREE.TextureLoader, `/assets/images/comics/timeline.png`);

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

    return <group
        ref={group}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerMove={onPointerMove}
    >
        <mesh position={[0, 0, 1.01]}>
            <planeGeometry args={[1920, 1080]} />
            <meshBasicMaterial map={timelineBGBOTTOMTexture} transparent />
        </mesh>
        <mesh position={[0, 0, 1.02]}>
            <planeGeometry args={[1920, 1080]} />
            <meshBasicMaterial map={timelineBGTOP} transparent opacity={0.5} />
        </mesh>
        <mesh position={[0, 0, 1.03]}>
            <planeGeometry args={[1920, 140]} />
            <meshBasicMaterial map={timelineTexture} transparent opacity={0.5} />
        </mesh>
        {
            [
                { id: 1, x: -350, y: 200 },
                { id: 2, x: 400, y: 200 },
                { id: 3, x: 30, y: -200 }
            ].map((value, key) => (
                <ComicHitBox key={key} id={value.id} x={value.x} y={value.y} />
            ))
        }

    </group>
}

const MobileVersionComicTimeLineScene = () => {
    return <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 100] }}>
        <Timeline />
    </Canvas>
}

export default MobileVersionComicTimeLineScene;