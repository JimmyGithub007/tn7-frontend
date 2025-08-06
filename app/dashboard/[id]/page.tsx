"use client";

import { EntryDialog, Header, Loader } from "@/components";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { TbArrowBackUp, TbEdit } from "react-icons/tb";
import axios from "axios";
import { FaCheck, FaInstagram, FaUser, FaXTwitter } from "react-icons/fa6";
import { LuImageUp } from "react-icons/lu";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { RiVideoUploadLine } from "react-icons/ri";
import { AnimatePresence, motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { Chip } from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setContent, setIsOpen } from "@/store/slice/dialogSlice";
import { IoIosClose } from "react-icons/io";
import { Pixelify_Sans, Rubik_Distressed } from "next/font/google";
import { RootState } from "@/store";
import { MdAddCircle } from "react-icons/md";
import { BiTrash } from "react-icons/bi";
import { useAuth } from "@/hooks/useAuth";
import { setJumpPage } from "@/store/slice/pageSlice";

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
    const editor = useCreateBlockNote();
    const { isAuthenticated, user: authUser, loading: authLoading } = useAuth({ type: "user" });
    const { id } = useParams();
    const [imgHeight, setImgHeight] = useState<number>(0);
    const [imgWidth, setImgWidth] = useState<number>(0);
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
    const [tempFilePath, setTempFilePath] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileType, setFileType] = useState<'image' | 'video' | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setValue } = useForm({
        defaultValues: {
            title: "",
        }
    });

    const [entries, setEntries] = useState<any[]>([]);

    const fetchUserEntries = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/entries/user`, {}, {
                headers: { Authorization: token ? `Bearer ${token}` : "" }
            });
            console.log(res.data);
            setEntries(res.data);
        } catch (error) {
            console.error("Failed to fetch user entries:", error);
        }
    };

    const handleUploadClick = (type: 'image' | 'video') => {
        if (fileInputRef.current) {
            fileInputRef.current.accept = type === 'image' ? 'image/*' : 'video/*';
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadError(null);
        setFileType(file.type.startsWith('image') ? 'image' : 'video');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload/temp`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                }
            );

            // Store both the temporary path and the full preview URL
            setTempFilePath(response.data.temp_path);
            setPreviewUrl(response.data.preview_url);

        } catch (err) {
            setUploadError("File upload failed. Please try again.");
            console.error(err);
        } finally {
            setIsUploading(false);
        }

        if (event.target) {
            event.target.value = '';
        }
    };

    const handleRemoveFile = () => {
        // Here we just clear the frontend state. 
        // The backend will clean up the orphaned temp file later.
        setTempFilePath(null);
        setPreviewUrl(null);
        setFileType(null);
    };

    const handleEditEntry = async (entry: any) => {
        try {
            // Fetch the full entry data
            const token = localStorage.getItem("token");
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/entries/${entry.id}`, {
                headers: { Authorization: token ? `Bearer ${token}` : "" }
            });
            
            const entryData = response.data;
            
            // Set editing state
            setIsEditing(true);
            setEditingEntry(entryData);
            
            // Set form values
            setValue('title', entryData.title);
            setEntryCategory(entryData.category || 'story');
            
            // Set file data if exists
            if (entryData.media_url) {
                setPreviewUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${entryData.media_url}`);
                setFileType(entryData.media_type);
                // Don't set tempFilePath for existing files, as they're already stored
            }
            
            // Set editor content
            if (entryData.content) {
                const content = typeof entryData.content === 'string' ? JSON.parse(entryData.content) : entryData.content;
                editor.replaceBlocks(editor.topLevelBlocks, content);
            }
            
            setIsOpenEntryModal(true);
        } catch (error) {
            console.error("Failed to fetch entry for editing:", error);
            alert("Failed to load entry for editing");
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setEditingEntry(null);
        setTempFilePath(null);
        setPreviewUrl(null);
        setFileType(null);
        setEntryCategory('story');
        reset();
        editor.replaceBlocks(editor.topLevelBlocks, []);
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

    const calculateImgHeight = () => {
        if (window.innerWidth < 640) {
            setIsMobile(true);

            const maxH = (window.innerWidth * 2260 / 1379);
            const H = Math.min(window.innerHeight - 120, maxH);
            setImgHeight(H);
            setImgWidth(H * 1379 / 2260);
        } else {
            setIsMobile(false);
            const maxW = ((window.innerHeight - 80) * 2260 / 1379);
            const W = Math.min(window.innerWidth * 0.8, maxW);
            setImgHeight(W * 1379 / 2260);
            setImgWidth(W);
        }
    };

    const handleFollow = async () => {
        const token = localStorage.getItem("token");
        const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/follow`, {
            followed_id: id
        }, { headers: { Authorization: token ? `Bearer ${token}` : "" } });
        fetchUser();
    };

    const handleDeleteConfirm = (entry: any) => {
        const token = localStorage.getItem("token");
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/entries/${entry.id}`, { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : "" } }).then(() => {
            fetchUserEntries();
        });
    }

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
            router.push('/profile/setup');
        }
    }, [authLoading, isAuthenticated, router, authUser, id]);

    useEffect(() => {
        if (id) fetchUser();//fetch user info according to id
    }, [id]);

    /*useEffect(() => {
        fetchUserEntries();
    }, []);*/

    useEffect(() => {
        // 初始化时计算高度
        calculateImgHeight();

        // 监听 resize 事件
        window.addEventListener("resize", calculateImgHeight);

        // 清除监听器
        return () => {
            window.removeEventListener("resize", calculateImgHeight);
        };
    }, []);

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
            <div className="relative flex flex-col items-center justify-center h-[calc(100vh-200px)] max-h-[600px] py-8"
                //style={{ height: imgHeight, width: imgWidth }}
            >
                <Image className="absolute left-0 top-0 w-full h-full" alt=""
                    height={1272} width={1425} src={`/assets/images/entry/entryListCenterCardFrame.png`}
                    placeholder="blur"
                    blurDataURL={`/assets/images/entry/entryListCenterCardFrame.png`}
                />

                {/*<Image className="absolute invisible sm:visible" alt=""
                    height={1379} width={2260} src={`/assets/images/entry/entryFrameHorizontal.png`}
                    placeholder="blur"
                    blurDataURL={`/assets/images/entry/entryFrameHorizontal.png`}
                />*/}
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
                                    blurDataURL={`${process.env.NEXT_PUBLIC_BACKEND_URL}${user.profile_picture}`}
                                /> : <div className="flex items-center justify-center">
                                    <div className="text-white text-2xl font-bold">NO PROFILE PICTURE</div>
                                </div>}
                                <button disabled={true} className="absolute cursor-not-allowed duration-300 top-2 right-2 bg-white rounded-full p-1 shadow-md hover:opacity-80 text-black">
                                    <TbEdit className="text-2xl" />
                                </button>
                            </div>
                            <div className="bg-[#45b5d9]/80 flex items-center justify-center rounded-xl text-md font-bold h-8 w-full text-white">RANK #</div>
                            <div className="text-center text-lg md:text-xl font-bold text-white">{user?.name}</div>
                            {authUser && authUser?.id !== id &&
                                <button onClick={handleFollow} className={`bg-white/20 backdrop-blur-sm duration-300 flex hover:bg-white/30 items-center justify-center text-white gap-2 h-8 px-4 rounded-2xl shadow-md text-xs`}>
                                    <FaUser />
                                    {user?.followers?.some((follower: any) => follower.follower_id === authUser?.id) ? 'Following' : 'Follow'}
                                    {user?.followers?.some((follower: any) => follower.follower_id === authUser?.id) && <FaCheck />}
                                </button>
                            }
                            <div className="grid grid-cols-2 gap-4 text-white text-sm">
                                <div className="flex flex-col items-center justify-center">
                                    <div>FOLLOWERS</div>
                                    <div>{user?.followers?.length}</div>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <div>FOLLOWING</div>
                                    <div>{user?.followings?.length}</div>
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
                                    <div className="text-white text-4xl font-bold">0</div>
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
                                                                <div className={`font-bold text-xl ${rubik_distressed.className}`}>1000</div>
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
                            {/*authUser && authUser?.id === id ?
                                <div className="flex flex-col gap-2 absolute top-0 left-0 w-full h-full p-4">
                                    <div className="flex items-center justify-between">
                                        <button onClick={() => {
                                            resetForm();
                                            setIsOpenEntryModal(true);
                                        }} className="bg-[#45b5d9] duration-300 flex items-center hover:bg-[#45b5d9]/80 gap-2 rounded-xl text-sm font-bold text-white py-1 px-4 shadow-md"><MdAddCircle /> NEW ENTRY</button>
                                        <button onClick={() => router.push(`/entry/stories`)} className="bg-[#45b5d9] duration-300 hover:bg-[#45b5d9]/80 gap-2 rounded-xl text-sm font-bold text-white py-1 px-4 shadow-md">VIEW ENTRIES</button>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm flex flex-col gap-2 p-4 rounded-xl h-full shadow-md overflow-y-auto filter-bar">
                                        {entries.length > 0 ? (
                                            entries.map(entry => (
                                                <div key={entry.id} className="bg-black/20 p-3 rounded-lg flex justify-between items-center shadow-md">
                                                    <span className="text-white truncate pr-4">{entry.title}</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-white text-xs border-2 border-white rounded-lg py-1 px-2 shadow-md">{entry.status}</div>
                                                        <button className="text-white hover:text-gray-300" onClick={() => handleEditEntry(entry)}>
                                                            <TbEdit />
                                                        </button>
                                                        <button className="text-red-500 hover:text-red-300" onClick={() => handleDelete(entry)}>
                                                            <BiTrash />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center text-white/50 italic">No entries</div>
                                        )}
                                    </div>
                                </div>
                            */} 
                            <div className="absolute top-0 left-0 flex flex-col items-center justify-center h-full w-full gap-4 z-10">
                                {
                                    authUser && authUser?.id === id ? (
                                        <div className="flex items-center justify-center gap-8">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="text-white text-sm">Drafts</div> 
                                                <div className="text-white text-lg sm:text-xl md:text-2xl font-bold">{user?.entries_stats?.draft}</div>
                                            </div>
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="text-white text-sm">Pending</div> 
                                                <div className="text-white text-lg sm:text-xl md:text-2xl font-bold">{user?.entries_stats?.pending}</div>
                                            </div>
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="text-white text-sm">Approved</div> 
                                                <div className="text-white text-lg sm:text-xl md:text-2xl font-bold">{user?.entries_stats?.approved}</div>  
                                            </div>
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="text-white text-sm">Rejected</div> 
                                                <div className="text-white text-lg sm:text-xl md:text-2xl font-bold">{user?.entries_stats?.rejected}</div>  
                                            </div>
                                        </div>
                                    ) : (<div className="flex flex-col items-center justify-center gap-2">
                                        <div className="text-white text-sm">WELCOME TO</div>
                                        <div className="text-white text-lg sm:text-xl md:text-2xl font-bold">{user?.name}'s UNIVERSE</div>
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
                                            router.push(`/entry/stories/story`);
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
        <EntryDialog isOpenEntryModal={isOpenEntryModal} setIsOpenEntryModal={setIsOpenEntryModal} entryId={"new"} />
    </div>);
};

export default DashboardPage;

