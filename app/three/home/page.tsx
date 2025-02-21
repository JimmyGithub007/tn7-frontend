"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { PerspectiveCamera, TextureLoader } from "three";
import { useLoader } from "@react-three/fiber";
import { Header } from "@/components";

const Plane = ({ texturePath, depthFactor }: { texturePath: string; depthFactor: number }) => {
  const ref = useRef<any>();
  const texture = useLoader(TextureLoader, texturePath);

  useFrame(({ size, camera, mouse }) => {
    const perspectiveCamera = camera as PerspectiveCamera;

    if (ref.current) {
      const viewportHeight = 2 * Math.tan((perspectiveCamera.fov * Math.PI) / 360) * perspectiveCamera.position.z; // Viewport height
      const viewportWidth = viewportHeight * (size.width / size.height); // Viewport width
      const textureAspect = texture.image.width / texture.image.height; // Texture aspect ratio

      // Match aspect ratio for "object-cover" effect
      if (viewportWidth / viewportHeight > textureAspect) {
        ref.current.scale.set(viewportWidth, viewportWidth / textureAspect, 1);
      } else {
        ref.current.scale.set(viewportHeight * textureAspect, viewportHeight, 1);
      }

      ref.current.position.x = mouse.x * depthFactor * viewportWidth;

      ref.current.scale.set(ref.current.scale.x * 1.05, ref.current.scale.y * 1.05, ref.current.scale.z);//apply size scale to 1.05
    }
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent={true} />
    </mesh>
  );
};

const HeroParallax = () => {
  return (
    <Canvas
        className="w-full h-screen bg-transparent"
        camera={{ position: [0, 0, 10], fov: 50 }}
    >
      <Plane texturePath="/assets/images/645825eaa3a38d2dc94b1601_BG.jpg" depthFactor={-0.02} /> 
      <Plane texturePath="/assets/images/645825eaa3a38dff924b161c_Train.png" depthFactor={-0.05} />
      <Plane texturePath="/assets/images/645825eaa3a38d227a4b164b_Bill-p-2600.png" depthFactor={-0.08} />
      <Plane texturePath="/assets/images/645825eaa3a38d46674b164e_Flynn.png" depthFactor={-0.1} />
      <Plane texturePath="/assets/images/645825eaa3a38d3d0d4b164d_Deer.png" depthFactor={-0.15} />
      <Plane texturePath="/assets/images/645825eaa3a38d8ab84b164c_Gin.png" depthFactor={-0.12} />
    </Canvas>
  );
};

const Home = () => {
    return (<div className="h-screen overflow-hidden w-full ">
        <Header />
        <HeroParallax />
    </div>)
}

export default Home;
