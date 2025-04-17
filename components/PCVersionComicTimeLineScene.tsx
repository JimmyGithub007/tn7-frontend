"use client"

import { useEffect, useCallback } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { useDispatch } from "react-redux";
import { setUnityHover } from "@/store/slice/mouseSlice";

interface versionProps {
    setLoadingProgression: (state: number) => void;
    setHoverComicId: (state: number) => void;
    clickComic: (state: number) => void;
}

const PCVersionComicTimeLineScene: React.FC<versionProps> = ({ setLoadingProgression, setHoverComicId, clickComic }) => {
    const dispatch = useDispatch();

    const { unityProvider, loadingProgression, addEventListener, removeEventListener } = useUnityContext({
        loaderUrl: "/unity/build/ComicTimeLineScene.loader.js",
        dataUrl: "/unity/build/ComicTimeLineScene.data.unityweb",
        frameworkUrl: "/unity/build/ComicTimeLineScene.framework.js.unityweb",
        codeUrl: "/unity/build/ComicTimeLineScene.wasm.unityweb",
    });

    const handleHoverComic = useCallback((comicData: any) => {
        const [comicId, comicX, comicY] = comicData.split(",");
        setHoverComicId(parseInt(comicId))
        dispatch(setUnityHover(parseInt(comicId) > 0 ? true : false));
    }, []);

    const handleClickComic = useCallback((comicId: any) => {
        clickComic(parseInt(comicId));
    }, []);

    useEffect(() => {
        setLoadingProgression(loadingProgression);
    }, [loadingProgression]);

    useEffect(() => {
        addEventListener("ReactHoverComic", handleHoverComic);
        return () => {
            removeEventListener("ReactHoverComic", handleHoverComic);
        };
    }, [addEventListener, removeEventListener, handleHoverComic]);

    useEffect(() => {
        addEventListener("ReactClickComic", handleClickComic);
        return () => {
            removeEventListener("ReactClickComic", handleClickComic);
        };
    }, [addEventListener, removeEventListener, handleClickComic]);

    return (<Unity className={`h-full w-full`} unityProvider={unityProvider} />);
}

export default PCVersionComicTimeLineScene;