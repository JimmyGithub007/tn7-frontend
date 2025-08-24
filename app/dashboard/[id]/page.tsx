"use client";

import { EntryDialog, Header, Loader } from "@/components";
import { useEffect, useState, useRef, useCallback } from "react";
import { TbEdit } from "react-icons/tb";
import { FaCheck, FaInstagram, FaSpinner, FaUpload, FaUser, FaXTwitter } from "react-icons/fa6";
import { AnimatePresence, motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { useRouter, useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setContent, setIsOpen } from "@/store/slice/dialogSlice";
import { IoIosClose } from "react-icons/io";
import { Pixelify_Sans, Rubik_Distressed } from "next/font/google";
import { MdAddCircle } from "react-icons/md";
import { useAuth } from "@/hooks/useAuth";
import { setJumpPage } from "@/store/slice/pageSlice";
import { useDropzone } from 'react-dropzone';
import { AnimatedCounter } from  'react-animated-counter';

import Image from "next/image";
import axios from "axios";

const pixelify_sans = Pixelify_Sans({ subsets: ["latin"], weight: "400" });
const rubik_distressed = Rubik_Distressed({ subsets: ["latin"], weight: "400" });

type citizenProps = {
    code: number;
    background: string;
    body: string;
    eyes: string;
    tattoo: string | null;
    clothes: string;
    headgear: string | null;
    facegear: string | null;
    eyes_flare: string | null;
    hair: string | null;
    weapon: string | null;
};

const Citizens: citizenProps[] = [
    { code: 10032, background: "BG-2", body: "M_BODY_ANGRY_2", eyes: "M_GREY", tattoo: null, clothes: "CLOTHES-4-GREY", headgear: null, facegear: null, eyes_flare: null, hair: "HAIR-5", weapon: "WEAPON-14" },
    { code: 10040, background: "BG-5", body: "M_BODY_ANGRY_2", eyes: "M_PURPLE", tattoo: null, clothes: "CLOTHES-3", headgear: "HEADGEAR-9", facegear: null, eyes_flare: null, hair: "HAIR-11-BLACK", weapon: "WEAPON-1" },
    { code: 10083, background: "BG-6", body: "M_BODY_ANGRY_2", eyes: "M_PURPLE", tattoo: null, clothes: "CLOTHES-31", headgear: null, facegear: null, eyes_flare: null, hair: "HAIR-3", weapon: "WEAPON-11" },
    { code: 10111, background: "BG-1", body: "M_BODY_ANGRY_2", eyes: "M_RED", tattoo: null, clothes: "CLOTHES-17", headgear: "HEADGEAR-4", facegear: null, eyes_flare: null, hair: "HAIR-11-BLACK", weapon: "WEAPON-7" },
];

const BGColors = [
    { background: "BG-1", bg_color: "#3c487f", card_color: "#455495", text_color: "#ffffff" },
    { background: "BG-2", bg_color: "#1b4850", card_color: "#205e68", text_color: "#ffffff" },
    { background: "BG-3", bg_color: "#5c2a61", card_color: "#82398a", text_color: "#ffffff" },
    { background: "BG-4", bg_color: "#415432", card_color: "#4d653b", text_color: "#ffffff" },
    { background: "BG-5", bg_color: "#3b4244", card_color: "#4b5456", text_color: "#ffffff" },
    { background: "BG-6", bg_color: "#57471d", card_color: "#6b5825", text_color: "#ffffff" }
];

type User = {
    id: string;
    name: string;
    email: string | null;
    profile_picture?: string | null;
    bio?: string | null;
    instagram_connected?: boolean;
    facebook_connected?: boolean;
    instagram_username?: string | null;
    facebook_username?: string | null;
    social_media?: Array<{
        id: string;
        category: string;
        social_id: string;
        username: string;
        token: string;
        refresh_token?: string;
        created_at: string;
        updated_at: string;
    }>;
    followers?: Array<any>;
    followings?: Array<any>;
    entries_stats?: {
        draft: number;
        pending: number;
        approved: number;
        rejected: number;
        total: number;
    };
    // 你可以加更多字段
};

// 生成 code_verifier 和 code_challenge 的工具函数
function base64urlencode(arrayBuffer: ArrayBuffer) {
    let str = '';
    const bytes = new Uint8Array(arrayBuffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        str += String.fromCharCode(bytes[i]);
    }
    let base64 = btoa(str);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generateCodeChallenge(codeVerifier: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return base64urlencode(digest);
}

const DashboardPage = () => {
    const profileCard = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch();
    const router = useRouter();
    const { isAuthenticated, user: authUser, loading: authLoading } = useAuth({ type: "user" });
    const { id } = useParams();
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [entryCategory, setEntryCategory] = useState<string>('story');
    const [isOpenEntryModal, setIsOpenEntryModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingEntry, setEditingEntry] = useState<any>(null);
    const [profileCardWidth, setProfileCardWidth] = useState<number>(0);
    const [profileCardTop, setProfileCardTop] = useState<number>(0);
    // State for temporary file handling
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isOpenDialog, setIsOpenDialog] = useState(false);

    const handleRemoveFile = () => {
        // Here we just clear the frontend state. 
        // The backend will clean up the orphaned temp file later.
        setProfileImageFile(null);
        setPreviewUrl(null);
    };

    const handleConnectInstagram = async () => {
        const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
        const redirectUri = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/callback/instagram`;
        const state = crypto.randomUUID();

        const scope = "user_profile,user_media";
        const url = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${state}`;
        window.location.href = url;
    };

    const handleDisconnectInstagram = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/social/instagram/disconnect`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                // 刷新用户信息
                window.location.reload();
            } else {
                console.error('Disconnect failed');
            }
        } catch (error) {
            console.error('Disconnect failed:', error);
        }
    };

    const handleConnectTwitter = async () => {
        const clientId = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID;
        const redirectUri = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/callback/twitter`;
        const state = crypto.randomUUID();

        // 生成 code_verifier
        const codeVerifier = Array.from(window.crypto.getRandomValues(new Uint8Array(64)))
            .map(b => b.toString(16).padStart(2, '0')).join('');
        localStorage.setItem('twitter_code_verifier', codeVerifier);

        // 生成 code_challenge
        const codeChallenge = await generateCodeChallenge(codeVerifier);

        const scope = "tweet.read users.read";
        const url = `https://x.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
        window.location.href = url;
    };

    const handleDisconnectTwitter = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/social/twitter/disconnect`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                // 刷新用户信息
                window.location.reload();
            } else {
                console.error('Disconnect failed');
            }
        } catch (error) {
            console.error('Disconnect failed:', error);
        }
    };

    const handleFollow = async () => {
        const token = localStorage.getItem("token");
        const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/follow`, {
            followed_id: id
        }, { headers: { Authorization: token ? `Bearer ${token}` : "" } });
        fetchUser();
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles[0]) {
            setProfileImageFile(acceptedFiles[0]);
            setPreviewUrl(URL.createObjectURL(acceptedFiles[0]));
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif']
        },
        maxFiles: 1,
        maxSize: 5242880, // 5MB
    });

    const handleProfilePictureUpload = async () => {
        if (!profileImageFile) return;

        setIsUploading(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append('file', profileImageFile);

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload/profile-picture`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                }
            );
            setIsOpenDialog(false);
            handleRemoveFile();
            fetchUser();
        } catch (err) {
            setUploadError("File upload failed. Please try again.");
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            setUser(res.data);
        } catch (e: any) {
            setError(e?.response?.data?.message || "Failed to fetch user");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        } else if (isAuthenticated && authUser?.id === id && !authUser?.completed) {
            window.location.href = '/profile/setup';
        }
    }, [authLoading, isAuthenticated, router, authUser, id]);

    useEffect(() => {
        if (id) fetchUser();//fetch user info according to id
    }, [id]);

    // calculate profile card width and top for profile image
    useEffect(() => {
        // 初始化时计算宽度
        const calculateProfileCardWidth = () => {
            console.log("test")
            const w = profileCard.current?.clientWidth ? profileCard.current?.clientWidth * 89 / 100 : 0;
            const top = profileCard.current?.clientWidth ? profileCard.current?.clientWidth * 5.5 / 100 : 0;
            setProfileCardWidth(w || 0);
            setProfileCardTop(top || 0);
        }
        calculateProfileCardWidth();

        // 监听 resize 事件
        window.addEventListener("resize", calculateProfileCardWidth);

        // 清除监听器
        return () => {
            window.removeEventListener("resize", calculateProfileCardWidth);
        };
    }, [profileCard.current]);

    if (authLoading || !isAuthenticated || (isAuthenticated && authUser?.id === id && !authUser?.completed)) {
        return <div className="bg-black h-screen w-full"></div>;
    }

    return (<div className="fixed h-screen w-full overflow-hidden flex justify-center items-center">
        <Image id="background" className="absolute top-0 left-0 w-full h-full object-cover" alt="" width={5760} height={3260} src={`/assets/images/entry/entryBG.png`} priority />
        <Header />
        <Loader />
        <div className="flex flex-col max-w-[1280px]">
            <Image alt=""
                height={277} width={4608} src={`/assets/images/entry/entryListTopCardFrame.png`}
                placeholder="blur"
                blurDataURL={`/assets/images/entry/entryListTopCardFrame.png`}
            />
            <div className="relative flex flex-col items-center justify-center h-[calc(100vh-200px)] max-h-[600px] py-8">
                <Image className="absolute left-0 top-0 w-full h-full" alt=""
                    height={1272} width={1425} src={`/assets/images/entry/entryListCenterCardFrame.png`}
                    placeholder="blur"
                    blurDataURL={`/assets/images/entry/entryListCenterCardFrame.png`}
                />
                <div className="gap-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 w-[85%] z-10 overflow-y-auto filter-bar">
                    <div ref={profileCard} className="col-span-1 relative w-full min-h-[600px] h-full">
                        <Image className="absolute top-0 left-0 w-full h-full" alt=""
                            height={2276} width={1258} src={`/assets/images/share/middleVerticalFrame.png`}
                            placeholder="blur"
                            blurDataURL={`/assets/images/share/middleVerticalFrame.png`}
                        />
                        <div className="flex flex-col items-center gap-4 text-white z-[50] absolute top-0 left-0 w-full h-full px-8" style={{ paddingTop: profileCardTop, paddingBottom: profileCardTop }}>
                            <div className="bg-black/80 backdrop-blur-md flex items-center justify-center rounded-2xl overflow-hidden relative shadow-md overflow-hidden"
                                style={{ width: profileCardWidth, height: profileCardWidth }}
                            >
                                {user?.profile_picture ? <Image className="w-full h-full object-cover hover:scale-105 duration-300" alt=""
                                    height={2276} width={1258} src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${user.profile_picture}`}
                                    placeholder="blur"
                                    blurDataURL={`/assets/images/share/webp/profilePictureBlur.webp`}
                                /> : <div className="flex items-center justify-center">
                                    <div className="text-white text-2xl font-bold">NO PROFILE PICTURE</div>
                                </div>}
                                <button onClick={() => {
                                    setIsOpenDialog(true);
                                }} className="absolute duration-300 top-2 right-2 bg-white rounded-full p-1 shadow-md hover:opacity-80 text-black">
                                    <TbEdit className="text-2xl" />
                                </button>
                            </div>
                            <div className="bg-[#45b5d9]/80 flex items-center justify-center rounded-xl text-md font-bold h-8 w-full text-white">
                                <div className="flex items-center gap-2">
                                    <div>RANK #</div>
                                    <AnimatedCounter value={1000} color="white" fontSize="16px" includeCommas={true} includeDecimals={false} />
                                </div>
                            </div>
                            <div className="text-center text-lg md:text-xl font-bold text-white">{user?.name}</div>
                            {authUser && authUser?.id !== id &&
                                <button onClick={handleFollow} className={`bg-white/20 backdrop-blur-sm duration-300 flex hover:bg-white/30 items-center justify-center text-white gap-2 h-8 px-4 rounded-2xl shadow-md text-xs`}>
                                    <FaUser />
                                    {user?.followers?.some((follower: any) => follower.follower_id === authUser?.id) ? 'Following' : 'Follow'}
                                    {user?.followers?.some((follower: any) => follower.follower_id === authUser?.id) && <FaCheck />}
                                </button>
                            }
                            <div className="grid grid-cols-2 gap-4 text-white text-sm">
                                <div className="flex flex-col gap-2 items-center justify-center">
                                    <div>FOLLOWERS</div>
                                    <AnimatedCounter value={user?.followers?.length} color="white" fontSize="14px" includeCommas={true} includeDecimals={false} />
                                </div>
                                <div className="flex flex-col gap-2 items-center justify-center">
                                    <div>FOLLOWING</div>
                                    <AnimatedCounter value={user?.followings?.length} color="white" fontSize="14px" includeCommas={true} includeDecimals={false} />
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-3 w-full">
                                {user?.social_media?.find(sm => sm.category === 'twitter') ? (
                                    // Connected
                                    <div className="flex items-center gap-2 text-green-400">
                                        <FaXTwitter />
                                        <span>@{user.social_media.find(sm => sm.category === 'twitter')?.username}</span>
                                        <span className="text-xs">Connected</span>
                                        <button
                                            onClick={handleDisconnectTwitter}
                                            className="text-red-400 hover:text-red-300 text-xs ml-2"
                                        >
                                            Disconnect
                                        </button>
                                    </div>
                                ) : (
                                    // Not connected
                                    <button onClick={handleConnectTwitter} className="bg-white/20 backdrop-blur-sm duration-300 flex hover:bg-white/30 items-center justify-center text-white gap-4 h-8 w-40 rounded-lg shadow-md">
                                        <FaXTwitter />
                                        CONNECT
                                    </button>
                                )}
                                {user?.social_media?.find(sm => sm.category === 'instagram') ? (
                                    // Connected
                                    <div className="flex items-center gap-2 text-green-400">
                                        <FaInstagram />
                                        <span>{user.social_media.find(sm => sm.category === 'instagram')?.username}</span>
                                        <span className="text-xs">Connected</span>
                                        <button
                                            onClick={handleDisconnectInstagram}
                                            className="text-red-400 hover:text-red-300 text-xs ml-2"
                                        >
                                            Disconnect
                                        </button>
                                    </div>
                                ) : (
                                    // Not connected
                                    <button onClick={handleConnectInstagram} className="bg-white/20 backdrop-blur-sm duration-300 flex hover:bg-white/30 items-center justify-center text-white gap-4 h-8 w-40 rounded-lg shadow-md">
                                        <FaInstagram />
                                        CONNECT
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1 xl:col-span-2 flex flex-col gap-4">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 h-full">
                            <div className="flex flex-col gap-2 items-center justify-center h-full w-full p-6 relative min-h-[200px]">
                                <Image className="absolute top-0 left-0 w-full h-full" alt=""
                                    height={2276} width={1258} src={`/assets/images/share/smallFrame.png`}
                                    placeholder="blur"
                                    blurDataURL={`/assets/images/share/smallFrame.png`}
                                />
                                <div className="text-white text-lg font-bold">LUNEX POINTS</div>
                                <div className="bg-no-repeat bg-contain bg-center w-full h-full flex items-center justify-center z-10" style={{ backgroundImage: `url(/assets/images/share/lunex.png)` }}>
                                    <AnimatedCounter value={1000} color="white" fontSize="32px" includeCommas={true} includeDecimals={false} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 items-center justify-center h-full w-full py-6 relative min-h-[200px]">
                                <Image className="absolute top-0 left-0 w-full h-full" alt=""
                                    height={2276} width={1258} src={`/assets/images/share/smallFrame.png`}
                                    placeholder="blur"
                                    blurDataURL={`/assets/images/share/smallFrame.png`}
                                />
                                <div className="text-white text-lg font-bold">BADGES</div>
                                <div className="flex flex-wrap gap-2 p-4 z-10">
                                    <Image className="cursor-pointer hover:scale-105 duration-300" alt="" width={50} height={50} src={`/assets/images/lore/badges/webp/b1.webp`} />
                                    <Image className="cursor-pointer hover:scale-105 duration-300" alt="" width={50} height={50} src={`/assets/images/lore/badges/webp/b2.webp`} />
                                    <Image className="cursor-pointer hover:scale-105 duration-300" alt="" width={50} height={50} src={`/assets/images/lore/badges/webp/b3.webp`} />
                                    <Image className="cursor-pointer hover:scale-105 duration-300" alt="" width={50} height={50} src={`/assets/images/lore/badges/webp/b4.webp`} />
                                    <Image className="cursor-pointer hover:scale-105 duration-300" alt="" width={50} height={50} src={`/assets/images/lore/badges/webp/b5.webp`} />
                                    <Image className="cursor-pointer hover:scale-105 duration-300" alt="" width={50} height={50} src={`/assets/images/lore/badges/webp/b6.webp`} />
                                    <Image className="cursor-pointer hover:scale-105 duration-300" alt="" width={50} height={50} src={`/assets/images/lore/badges/webp/b7.webp`} />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="bg-[#45b5d9]/80 flex items-center justify-center rounded-xl text-md font-bold h-8 w-36 text-white">CHARACTERS</div>
                            <div className="flex gap-4 overflow-x-auto overflow-y-hidden filter-bar">
                                <button onClick={() => router.push('/citizen')} className="bg-[#45b5d9] duration-300 flex hover:bg-[#45b5d9]/80 min-w-[100px] h-[100px] items-center justify-center text-white text-center text-sm rounded-lg shadow-md">
                                    GET YOUR <br /> CHARACTERS
                                </button>
                                {Citizens.map((c, key) => (
                                    <Image
                                        key={key}
                                        alt="10032"
                                        className="cursor-pointer duration-300 rounded-xl hover:scale-[1.05] w-[100px] h-[100px] shadow-md shadow-slate-800/50"
                                        width={1080}
                                        height={1080}
                                        src={`/assets/images/citizens/${c.code}.png`}
                                        onClick={() => {
                                            dispatch(setContent(
                                                <div className="flex flex-col lg:flex-row max-h-[calc(100vh-20px)] max-w-[500px] lg:max-w-[1024px] xl:max-w-[1280px] overflow-y-auto relative">
                                                    <button onClick={() => dispatch(setIsOpen(false))} className="absolute duration-200 p-2 right-4 rounded-full hover:bg-slate-50 hover:shadow-sm top-4 text-4xl">
                                                        <IoIosClose />
                                                    </button>
                                                    <Image
                                                        alt={c.code.toString()}
                                                        className="lg:w-[50%]"
                                                        width={1080}
                                                        height={1080}
                                                        src={`/assets/images/citizens/${c.code}.png`}
                                                    />
                                                    <div className={`flex flex-col gap-2 p-8 w-full text-white`} style={{
                                                        backgroundColor: BGColors.find(e => e.background === c.background)?.bg_color
                                                    }}>
                                                        <div className="text-slate-300">TN7 NFTs Main Collection</div>
                                                        <div className={`font-bold text-3xl ${pixelify_sans.className}`}>No. {c.code}</div>
                                                        <div className="flex gap-4 items-center">
                                                            <div className="flex flex-col">
                                                                <div className="text-slate-300 text-xs">RANK</div>
                                                                <AnimatedCounter value={1000} color="white" fontSize="16px" includeCommas={true} includeDecimals={false} />
                                                            </div>
                                                        </div>
                                                        <div id="attributes" className="gap-4 grid grid-cols-1 lg:grid-cols-2">
                                                            {
                                                                [
                                                                    { name: "BACKGROUND", image: "background", type: "background" as keyof citizenProps },
                                                                    { name: "BODY", image: "upper-body", type: "body" as keyof citizenProps },
                                                                    { name: "EYES", image: "eye-makeup", type: "eyes" as keyof citizenProps },
                                                                    { name: "TATTOO", image: "tattoo", type: "tattoo" as keyof citizenProps },
                                                                    { name: "CLOTHES", image: "hood", type: "clothes" as keyof citizenProps },
                                                                    { name: "HEADGEAR", image: "helmet", type: "headgear" as keyof citizenProps }
                                                                ].map((attr, index) => (
                                                                    c[attr.type] !== null ?
                                                                        <div key={index} className={`duration-300 flex gap-2 hover:scale-105 items-center p-4 rounded-md shadow-md`}
                                                                            style={{ backgroundColor: BGColors.find(e => e.background === c.background)?.card_color }}
                                                                        >
                                                                            <Image className="w-6 h-6" alt="" width={512} height={512} src={`/assets/images/icons/${attr.image}.png`} />
                                                                            <div className="flex flex-col text-xs ">
                                                                                <span className="text-slate-300">{attr.name}</span>
                                                                                <span className="font-bold">{c[attr.type]}</span>
                                                                            </div>
                                                                        </div> : null
                                                                ))
                                                            }
                                                        </div>
                                                        <div>

                                                        </div>
                                                    </div>
                                                </div>
                                            ));
                                            dispatch(setIsOpen(true));
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="h-full min-h-[200px] overflow-hidden relative w-full">
                            <Image className="absolute top-0 left-0 w-full h-full" alt=""
                                height={877} width={2570} src={`/assets/images/share/middleFrame.png`}
                                placeholder="blur"
                                blurDataURL={`/assets/images/share/middleFrame.png`}
                            />
                            <Image className="absolute top-0 left-0 w-full h-full" alt=""
                                height={877} width={2570} src={`/assets/images/entry/entryMiddleFrameBG.png`}
                                placeholder="blur"
                                blurDataURL={`/assets/images/share/middleFrame.png`}
                            />
                            <div className="absolute top-0 left-0 flex flex-col items-center justify-center h-full w-full gap-4 z-10">
                                {
                                    authUser && authUser?.id === id ? (
                                        <div className="flex items-center justify-center gap-8">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="text-white text-sm">Drafts</div>
                                                <AnimatedCounter value={user?.entries_stats?.draft} color="white" fontSize="14px" includeCommas={true} includeDecimals={false} />
                                            </div>
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="text-white text-sm">Pending</div>
                                                <AnimatedCounter value={user?.entries_stats?.pending} color="white" fontSize="14px" includeCommas={true} includeDecimals={false} />
                                            </div>
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="text-white text-sm">Approved</div>
                                                <AnimatedCounter value={user?.entries_stats?.approved} color="white" fontSize="14px" includeCommas={true} includeDecimals={false} />
                                            </div>
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="text-white text-sm">Rejected</div>
                                                <AnimatedCounter value={user?.entries_stats?.rejected} color="white" fontSize="14px" includeCommas={true} includeDecimals={false} />
                                            </div>
                                        </div>
                                    ) : (<div className="flex flex-col items-center justify-center gap-2">
                                        <div className="text-white text-sm">WELCOME TO</div>
                                        <div className="text-white text-lg sm:text-xl md:text-2xl font-bold">{user?.name}&apos;s UNIVERSE</div>
                                    </div>)
                                }
                                <div className="flex gap-2">
                                    {
                                        authUser && authUser?.id === id &&
                                        <button onClick={() => {
                                            //resetForm();
                                            setIsOpenEntryModal(true);
                                        }} className="bg-[#45b5d9] duration-300 flex items-center hover:bg-[#45b5d9]/80 gap-2 rounded-xl text-sm font-bold text-white py-1 px-4 shadow-md"><MdAddCircle /> NEW ENTRY</button>
                                    }
                                    <button onClick={() => {
                                        dispatch(setJumpPage(true));
                                        const timeout = setTimeout(() => {
                                            router.push(`/entry/private/story`);
                                        }, 200);
                                        return () => clearTimeout(timeout);
                                    }} className="bg-[#45b5d9] duration-300 flex items-center hover:bg-[#45b5d9]/80 gap-2 rounded-xl text-sm font-bold text-white py-1 px-4 shadow-md">ENTER</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Image alt=""
                height={277} width={4608} src={`/assets/images/entry/entryListBottomCardFrame.png`}
                placeholder="blur"
                blurDataURL={`/assets/images/entry/entryListBottomCardFrame.png`}
            />
        </div>
        <EntryDialog isOpenEntryModal={isOpenEntryModal} setIsOpenEntryModal={() => {
            setIsOpenEntryModal(false);
            fetchUser();
        }} entryId={"new"} />
        <AnimatePresence>
            {isOpenDialog && (
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    transition={{ duration: 0.3 }}
                    className={`fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-black/50 backdrop-blur-md text-white`}
                >
                    <div className="flex flex-col gap-4 bg-white/20 backdrop-blur-sm rounded-2xl p-4 group relative">
                        <div {...getRootProps()} className={`duration-300 flex flex-col items-center overflow-hidden justify-center h-60 w-60 border-2 border-dashed rounded-md text-center cursor-pointer ${isDragActive ? 'opacity-50' : 'hover:opacity-50'}`}>
                            <input {...getInputProps()} />
                            {isUploading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <FaSpinner className="animate-spin text-2xl" />
                                    Uploading...
                                </div>
                            ) : (
                                previewUrl ? (
                                    <Image src={previewUrl} alt="Preview" width={400} height={300} className="w-full h-auto max-h-[250px] object-contain rounded-lg" />
                                ) : (
                                    <div className={`flex flex-col items-center justify-center gap-2`}>
                                        <FaUpload className="text-2xl" />
                                        UPLOAD YOUR <br /> PROFILE PICTURE
                                    </div>
                                )
                            )}
                        </div>
                        {previewUrl && (
                            <button type="button" onClick={() => handleProfilePictureUpload()} className="bg-[#45b5d9] duration-300 flex items-center hover:bg-[#45b5d9]/80 justify-center text-white gap-4 h-8 w-full rounded-lg shadow-md mt-4">
                                UPLOAD
                            </button>
                        )}
                        {previewUrl && (
                            <button
                                type="button"
                                onClick={handleRemoveFile}
                                className="absolute duration-300 top-6 right-6 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <IoClose size={20} />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpenDialog(false);
                                handleRemoveFile();
                            }} className="bg-white/20 backdrop-blur-sm duration-300 flex hover:bg-white/30 items-center justify-center text-white gap-4 h-8 w-full rounded-lg shadow-md">
                            CLOSE
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>);
};

export default DashboardPage;

