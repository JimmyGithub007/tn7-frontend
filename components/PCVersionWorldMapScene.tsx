"use client"

import { useEffect, useCallback } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { useDispatch, useSelector } from "react-redux";
import { setUnityHover } from "@/store/slice/mouseSlice";

interface versionProps {
    setLoadingProgression: (state: number) => void;
    setBuildingId: (state: number) => void;
    setBuildingData: (state: ((prev: { id: number, name: string, x: number, y: number }[]) => { id: number, name: string, x: number, y: number }[]) | { id: number, name: string, x: number, y: number }[]) => void;
    setHoverBuildingId: (state: number) => void;
    setImageLoaded: (state: boolean) => void;
    message: { id: string, content: string };
}

const PCVersionWorldMapScene: React.FC<versionProps> = ({ setLoadingProgression, setBuildingId, setBuildingData, setHoverBuildingId, setImageLoaded, message }) => {
    const dispatch = useDispatch();
    const { unityProvider, loadingProgression, addEventListener, removeEventListener, sendMessage } = useUnityContext({
        loaderUrl: "/unity/build/WorldMapScene.loader.js",
        dataUrl: "/unity/build/WorldMapScene.data.unityweb",
        frameworkUrl: "/unity/build/WorldMapScene.framework.js.unityweb",
        codeUrl: "/unity/build/WorldMapScene.wasm.unityweb",
    });

    const handleClickBuilding = useCallback((buildingId: any) => {
        setBuildingId(buildingId)
        setImageLoaded(false)
    }, []);

    const handleHoverBuilding = useCallback((buildingData: any) => {
        const [buildingId, buildingX, buildingY] = buildingData.split(",");
        if(buildingId > 0) {
            setBuildingData(prev =>
                prev.map(item =>
                    item.id === parseInt(buildingId)
                        ? { ...item, x: parseInt(buildingX) - 100, y: window.innerHeight - parseInt(buildingY) - 100 } // Update the matching entry
                        : item // Keep the rest unchanged
                )
            );
        }
        setHoverBuildingId(parseInt(buildingId))
        dispatch(setUnityHover(parseInt(buildingId) > 0 ? true : false));
    }, []);

    const handleInitialBuilding = useCallback((buildingData: any) => {
        const [buildingId, buildingX, buildingY] = buildingData.split(",");
        setBuildingData(prev =>
            prev.map(item =>
                item.id === parseInt(buildingId)
                    ? { ...item, x: parseInt(buildingX) - 100, y: window.innerHeight - parseInt(buildingY) - 100 } // Update the matching entry
                    : item // Keep the rest unchanged
            )
        );
    }, []);

    useEffect(() => {
        setLoadingProgression(loadingProgression);
    }, [loadingProgression]);

    useEffect(() => {
        if(message.id !== "" && message.content !== "") sendMessage(message.id, message.content);
    }, [message]);

    useEffect(() => {
        addEventListener("ReactClickBuilding", handleClickBuilding);
        return () => {
            removeEventListener("ReactClickBuilding", handleClickBuilding);
        };
    }, [addEventListener, removeEventListener, handleClickBuilding]);

    useEffect(() => {
        addEventListener("ReactHoverBuilding", handleHoverBuilding);
        return () => {
            removeEventListener("ReactHoverBuilding", handleHoverBuilding);
        };
    }, [addEventListener, removeEventListener, handleHoverBuilding]);

    useEffect(() => {
        addEventListener("ReactInitialBuilding", handleInitialBuilding);
        return () => {
            removeEventListener("ReactInitialBuilding", handleInitialBuilding);
        };
    }, [addEventListener, removeEventListener, handleInitialBuilding]);

    return (<Unity className={`h-full w-full`} unityProvider={unityProvider} />);
}

export default PCVersionWorldMapScene;