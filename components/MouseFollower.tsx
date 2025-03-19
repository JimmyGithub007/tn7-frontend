"use client";

import { RootState } from "@/store";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setWebHover } from "@/store/slice/mouseSlice";
import Image from "next/image";

const MouseFollower = () => {
  const { isWebHover, isUnityHover } = useSelector((state: RootState) => state.mouse);
  const dispatch = useDispatch();

  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorRef2 = useRef<HTMLDivElement>(null);
  const posX = useRef(0);
  const posY = useRef(0);
  const posY2 = useRef(0);
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 检测是否是移动端
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent));
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX.current = event.clientX;
      mouseY.current = event.clientY;
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) return;

    const updatePosition = () => {
      posX.current += (mouseX.current - posX.current - 87) * 0.15;
      posY.current += (mouseY.current - posY.current - 100) * 0.15;
      posY2.current += (mouseY.current - posY2.current + 17) * 0.15;

      const transformStyle = `translate3d(${posX.current}px, ${posY.current}px, 0)`;
      const transformStyle2 = `translate3d(${posX.current}px, ${posY2.current}px, 0)`;

      if (cursorRef.current) cursorRef.current.style.transform = transformStyle;
      if (cursorRef2.current) cursorRef2.current.style.transform = transformStyle2;

      requestAnimationFrame(updatePosition);
    };

    updatePosition();
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX.current = event.clientX;
      mouseY.current = event.clientY;

      const elements = document.elementsFromPoint(event.clientX, event.clientY);
      dispatch(setWebHover(elements.some((el) =>
        el.classList.contains("target") ||
        el.tagName === "A" ||
        el.tagName === "BUTTON"
      )));
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile]);

  return (
    <>
      {/* 背景模糊效果 */}
      {/*<div
        ref={cursorRef}
        className={`mix-blend-color pointer-events-none fixed left-0 top-0 w-[200px] -translate-x-1/2 -translate-y-1/2 z-[100] transition-opacity ${
          isMobile ? "hidden" : "opacity-100"
        }`}
      >
        <div className={`duration-300 aspect-square overflow-hidden rounded-full ${
          isWebHover || isUnityHover ? "blur-lg scale-[1.4]" : "blur-md scale-[0.5]"
        }`}>
          <div className="h-full w-full animate-glow bg-gradient-to-r from-cyan-700 to-amber-600"></div>
        </div>
      </div>*/}

      {/* 自定义光标 */}
      <div
        ref={cursorRef2}
        className={`pointer-events-none fixed left-0 top-0 w-[200px] -translate-x-1/2 -translate-y-1/2 z-[100] transition-opacity ${
          isMobile ? "hidden" : "opacity-100"
        }`}
      >
        <Image
          src="/assets/images/icons/cursor.png"
          className={`absolute duration-300 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${isWebHover || isUnityHover ? "hue-rotate-90" : "" }`}
          unoptimized
          alt="Cursor"
          width={40}
          height={40}
        />
      </div>
    </>
  );
};

export default MouseFollower;
