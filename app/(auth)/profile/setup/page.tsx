"use client";
import { Header, Loader } from "@/components";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
    CircularProgress,
    Avatar,
} from "@mui/material";
import { FaInstagram, FaUpload, FaSpinner, FaXTwitter } from "react-icons/fa6";
import { IoCloseCircle } from "react-icons/io5";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { MdWallet } from "react-icons/md";
import { useAuth } from "@/hooks/useAuth";
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useDropzone } from "react-dropzone";
import { enqueueSnackbar } from "notistack";

type ProfileForm = {
    name: string;
    email: string;
    bio?: string;
};

const ProfileSetupPage = () => {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const [isLoading, setIsLoading] = useState(false);
    const { signMessageAsync } = useSignMessage();
    const { openConnectModal } = useConnectModal();
    const { isAuthenticated, user, loading: authLoading, login, redirectToDashboard, walletLogin } = useAuth({ type: "user" });
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    const { control, handleSubmit, setError, setValue, watch, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
        defaultValues: {
            name: "",
            email: "",
            bio: "",
        }
    });
    const [serverError, setServerError] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

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

    const handleWalletConnect = async () => {
        if (!isConnected || !address) {
            alert('Please connect wallet first!');
            return;
        }

        try {
            setIsLoading(true);
            const message = 'Sign to login to NFT Website!';
            const signature = await signMessageAsync({ message });
            const token = localStorage.getItem("token");
            if (!token) {
                alert('Please login first!');
                return;
            }
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/wallet-connect`, {
                address: address,
                signature: signature,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.message) {
                alert(res.data.message);
            }
        } catch (error) {
            console.error('Login failed', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle hydration error
    useEffect(() => {
        setMounted(true);
    }, []);

    // 获取当前用户信息，自动填充 email
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            setIsLoading(true);
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.email) {
                    setValue("name", res.data.name);
                    setValue("email", res.data.email);
                }
            } catch (e) {
                // 可选：处理异常
                console.log(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, [setValue, router]);

    // Username uniqueness check
    const checkUsername = async (name: string) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return false;
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/check-username`, {
                name: name
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data.available;
        } catch {
            return false;
        }
    };

    const onSubmit = async (data: ProfileForm) => {
        setServerError("");
        console.log("data", data);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setServerError("Not logged in");
                return;
            }
            // Username uniqueness
            const isUnique = await checkUsername(data.name);
            if (!isUnique) {
                setError("name", { message: "Username already taken" });
                enqueueSnackbar(`${data.name} is already taken , please try another one`, { variant: 'error' });
                return;
            }
            // Get current user
            const meRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const userId = meRes.data.id;

            // Build form data
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("email", data.email);
            if (profileImageFile) formData.append("profile_picture", profileImageFile);
            if (data.bio) formData.append("bio", data.bio);
            //if (data.avatar && data.avatar.length) formData.append("profile_picture", data.avatar[0]);

            // Update user
            await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );
            router.push(`/dashboard/${userId}`);
        } catch (err: any) {
            setServerError(err?.response?.data?.message || "Profile update failed");
        }
    };

    useEffect(() => {
        if (mounted && isAuthenticated && user && user.completed) {
            router.push(`/dashboard/${user.id}`);
        }
    }, [mounted, isAuthenticated, user, router]);

    return (
        <div className="fixed h-screen w-full flex justify-center">
            <Image id="background" className="absolute top-0 left-0 w-full h-full object-cover" alt="" width={5760} height={3260} src={`/assets/images/entry/entryBG.png`} priority />
            <Header />
            <Loader />
            <div className="relative w-full sm:max-w-[300px] md:max-w-[400px] flex flex-col items-center justify-center">
                <Image alt=""
                    height={198} width={1425} src={`/assets/images/entry/entryContentTopCardFrame.png`}
                    placeholder="blur"
                    blurDataURL={`/assets/images/entry/entryContentTopCardFrame.png`}
                />
                <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data" className="relative text-white w-full flex items-center justify-center">
                    <Image className="absolute left-0 top-0 w-full h-full" alt=""
                        height={1272} width={1425} src={`/assets/images/entry/entryContentCenterCardFrame.png`}
                        placeholder="blur"
                        blurDataURL={`/assets/images/entry/entryContentCenterCardFrame.png`}
                    />
                    <div className="flex flex-col gap-4 w-[80%] overflow-x-hidden overflow-y-auto max-h-[calc(100vh-100px)] px-2 py-4 z-10 filter-bar">
                        <div className="flex items-center gap-2">
                            <div className="bg-white w-2 h-10"></div>
                            <div className="flex flex-col items-start">
                                <span className="text-xl font-bold">PROFILE SETUP</span>
                                <span className="text-sm text-gray-400">Complete your profile to start using the platform</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-4 z-10">
                            <div className="flex flex-col w-full">
                                <div>DISPLAY NAME*</div>
                                <Controller
                                    disabled={isLoading}
                                    name="name"
                                    control={control}
                                    rules={{ required: "Display Name is required" }}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            className={`${isLoading && "animate-pulse cursor-not-allowed"} w-full bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-md text-sm shadow-md`}
                                            placeholder="Please enter your display name"
                                        />
                                    )}
                                />
                            </div>
                            <div className="flex flex-col items-center">
                                <div {...getRootProps()} className={`bg-white/10 backdrop-blur-md duration-300 flex flex-col items-center overflow-hidden justify-center h-28 w-28 border-2 border-dashed rounded-xl text-center cursor-pointer ${isDragActive ? 'opacity-50' : 'hover:opacity-50'}`}>
                                    <input {...getInputProps()} />
                                    {
                                        previewUrl ? (
                                            <Image src={previewUrl} alt="Preview" width={400} height={300} className="w-full h-auto max-h-[250px] object-contain rounded-lg" />
                                        ) : (
                                            <div className={`flex flex-col items-center justify-center gap-2 text-xs`}>
                                                <FaUpload className="text-2xl" />
                                                UPLOAD YOUR <br /> PROFILE PICTURE
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col z-10">
                            <div>EMAIL*</div>
                            <Controller
                                name="email"
                                control={control}
                                rules={{ required: "Email is required" }}
                                render={({ field }) => (
                                    <input
                                        disabled={isLoading}
                                        type="email"
                                        autoComplete="email"
                                        {...field}
                                        className={`${isLoading && "animate-pulse cursor-not-allowed"} w-full bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-md text-sm shadow-md`}
                                        placeholder="Please enter your email"
                                    />
                                )}
                            />
                        </div>
                        <div className="flex flex-col z-10">
                            <div>BIO (Optional)</div>
                            <Controller
                                name="bio"
                                control={control}
                                render={({ field }) => (
                                    <textarea
                                        {...field}
                                        className="w-full bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-md text-sm shadow-md"
                                        placeholder="Please enter your bio"
                                    />
                                )}
                            />
                        </div>
                        <div className="flex flex-col z-10">
                            <div>SOCIALS (Optional)</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button type="button" onClick={() => { }} className="bg-white/20 backdrop-blur-sm duration-300 flex hover:bg-white/30 items-center justify-center text-white gap-4 h-8 w-full rounded-xl shadow-md">
                                    <FaXTwitter />
                                    CONNECT
                                </button>
                                <button onClick={() => { }} className="bg-white/20 backdrop-blur-sm duration-300 flex hover:bg-white/30 items-center justify-center text-white gap-4 h-8 w-full rounded-xl shadow-md">
                                    <FaInstagram />
                                    CONNECT
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col z-10">
                            <div>WALLET (Optional)</div>
                            <div>
                                {
                                    !mounted ? (
                                        <div className="bg-white/20 backdrop-blur-sm duration-300 flex items-center justify-center text-white gap-4 h-8 w-full rounded-xl shadow-md">
                                            <FaSpinner className="animate-spin" />
                                            Loading...
                                        </div>
                                    ) : !isConnected ? (
                                        <button
                                            type="button"
                                            onClick={openConnectModal}
                                            className="bg-white/20 backdrop-blur-sm duration-300 flex hover:bg-white/30 items-center justify-center text-white gap-4 h-8 w-full rounded-xl shadow-md">
                                            <MdWallet className="text-2xl" />
                                            Connect Wallet
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => !isLoading && disconnect()}
                                            className={`bg-white/20 backdrop-blur-sm duration-300 flex hover:bg-white/30 items-center justify-center text-white gap-4 h-8 w-full rounded-xl shadow-md ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                                        >
                                            {isLoading ? 'Connecting...' : address?.slice(0, 6)}...{address?.slice(-4)}
                                            <IoCloseCircle />
                                        </button>
                                    )
                                }
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="bg-[#45b5d9] hover:bg-[#45b5d9]/80 duration-300 rounded-xl text-white px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "SAVING..." : "SAVE CHANGES"}
                            {isSubmitting && <CircularProgress size={20} />}
                        </button>
                    </div>
                </form>
                <Image alt=""
                    height={198} width={1425} src={`/assets/images/entry/entryContentBottomCardFrame.png`}
                    placeholder="blur"
                    blurDataURL={`/assets/images/entry/entryContentBottomCardFrame.png`}
                />
            </div>
        </div>
    );
};

export default ProfileSetupPage;