'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { CircularProgress } from '@mui/material';
import { Loader } from '@/components';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { setJumpPage } from '@/store/slice/pageSlice';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';;
import { useAccount, useSignMessage } from 'wagmi';
import axios from 'axios';
import dynamic from 'next/dynamic'
import Image from 'next/image';

// Dynamic import for ConnectButton to avoid SSR issues
const ConnectButton = dynamic(
    () => import('@rainbow-me/rainbowkit').then(mod => mod.ConnectButton),
    { ssr: false }
);

type LoginForm = {
    email: string;
    password: string;
};

const LoginPage = () => {
    const { enqueueSnackbar } = useSnackbar();
    
    const router = useRouter();
    const dispatch = useDispatch();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<LoginForm>();
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [sentEmail, setSentEmail] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showWalletLogin, setShowWalletLogin] = useState(false);

    const [loading, setLoading] = useState(false);
    const [walletLoading, setWalletLoading] = useState(false);
    const { isAuthenticated, loading: authLoading, login, user, walletLogin } = useAuth({ type: "user" });
    
    // Wallet hooks
    const { address, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();

    const onSubmit = async (data: LoginForm) => {
        if (sentEmail || loading) {
            return;
        }
        setLoading(true);
        try {
            if (showForgotPassword) {
                await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/forgot-password`, {
                    email: data.email,
                });
                enqueueSnackbar('Reset email sent', { variant: 'success' });
                setSentEmail(true);
            } else {
                const res = await login(data.email, data.password);
                enqueueSnackbar('Login successful', { variant: 'success' });
                router.push(`/dashboard/${res.id}`);
            }
        } catch (err: any) {
            console.log("loginerr", err);
            if (err.response.data.message) {
                enqueueSnackbar(err.response.data.message, { variant: 'error' });
            } else {
                enqueueSnackbar('Login failed', { variant: 'error' });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && user.id) {
            router.push(`/dashboard/${user.id}`);
        }
    }, [isAuthenticated, user]);

    // Handle wallet login
    const handleWalletLogin = useCallback(async () => {
        if (!isConnected || !address) {
            enqueueSnackbar('Please connect wallet first', { variant: 'warning' });
            return;
        }

        try {
            setWalletLoading(true);
            const message = 'Sign to login to NFT Website!';
            const signature = await signMessageAsync({ message });
            
            const res = await walletLogin(address, signature);
            enqueueSnackbar('Wallet login successful', { variant: 'success' });
            
            // Check if user needs to complete profile setup
            if (!res?.completed) {
                dispatch(setJumpPage(true));
                setTimeout(() => {
                    router.push(`/profile/setup`);
                }, 500);
            } else {
                router.push(`/dashboard/${res.id}`);
            }
        } catch (err: any) {
            console.log("wallet login err", err);
            if (err.response?.data?.message) {
                enqueueSnackbar(err.response.data.message, { variant: 'error' });
            } else {
                enqueueSnackbar('Wallet login failed', { variant: 'error' });
            }
        } finally {
            setWalletLoading(false);
        }
    }, [isConnected, address, signMessageAsync, walletLogin, enqueueSnackbar, dispatch, router]);


    useEffect(() => {
        dispatch(setJumpPage(false));
    }, []);

    if (authLoading || isAuthenticated) {
        return (
            <div className="bg-black h-screen w-full"></div>
        );
    }

    return (<div className="fixed h-screen w-full overflow-hidden flex justify-center items-center">
        <Image id="background" className="absolute top-0 left-0 w-full h-full object-cover" alt="" width={5760} height={3260} src={`/assets/images/login/webp/loginBG.webp`} priority />
        {/* <Loader src={`/assets/images/login/webp/loginBG_blur.webp`} alt="loading" /> */}
        <Loader />
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative w-full sm:max-w-[300px] md:max-w-[400px] flex flex-col items-center justify-center">
            <Image alt=""
                height={198} width={1425} src={`/assets/images/entry/entryContentTopCardFrame.png`}
                placeholder="blur"
                blurDataURL={`/assets/images/entry/entryContentTopCardFrame.png`}
            />
            <form onSubmit={handleSubmit(onSubmit)} className="relative text-white flex flex-col gap-4 items-center justify-center w-full">
                <Image className="absolute left-0 top-0 w-full h-full" alt=""
                    height={1272} width={1425} src={`/assets/images/entry/entryContentCenterCardFrame.png`}
                    placeholder="blur"
                    blurDataURL={`/assets/images/entry/entryContentCenterCardFrame.png`}
                />
                <div className="flex flex-col gap-4 w-[80%] overflow-y-auto px-2 py-4 max-h-[calc(100vh-100px)] z-10 filter-bar">
                    <div className="flex items-center gap-2">
                        <div className="bg-white w-2 h-10"></div>
                        <div className="flex flex-col items-start">
                            <span className="text-xl font-bold">
                                {showWalletLogin ? 'WALLET LOGIN' : showForgotPassword ? 'FORGOT PASSWORD' : 'LOGIN'}
                            </span>
                            <span className="text-sm text-gray-400">
                                {showWalletLogin ? 'Connect your wallet to sign in' : showForgotPassword ? 'Enter your email to reset password' : 'Enter your account details'}
                            </span>
                        </div>
                    </div>
                    
                    {showWalletLogin ? (
                        // Wallet Login UI
                        <div className="flex flex-col gap-4 w-full">
                            <div className="flex justify-center">
                                <ConnectButton />
                            </div>
                            {isConnected && (
                                <button
                                    type="button"
                                    onClick={handleWalletLogin}
                                    disabled={walletLoading}
                                    className="w-full bg-[#45b5d9] duration-300 rounded-xl text-white px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 hover:bg-[#45b5d9]/80"
                                >
                                    {walletLoading ? 'SIGNING IN...' : 'SIGN IN WITH WALLET'}
                                    {walletLoading && <CircularProgress size={20} />}
                                </button>
                            )}
                            <button
                                type="button"
                                className="text-xs text-gray-400 hover:text-white duration-300 text-center"
                                onClick={() => {
                                    setShowWalletLogin(false);
                                }}
                            >
                                Back to email login
                            </button>
                            <div className="text-sm text-center">
                                Don&apos;t have an account?{' '}
                                <button type="button" className="text-[#45b5d9] hover:text-[#45b5d9]/80 duration-300" onClick={() => {
                                    dispatch(setJumpPage(true));
                                    const timeout = setTimeout(() => {
                                        router.push(`/register`);
                                    }, 500);
                                    return () => clearTimeout(timeout);
                                }}>
                                    REGISTER
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Email Login UI
                        <>
                            <div className="flex flex-col gap-2 w-full">
                                {sentEmail && (
                                    <div className="text-xs text-gray-400">Reset email sent to your email address. Please check your inbox and follow the instructions to reset your password.</div>
                                )}
                                <div>EMAIL*</div>
                                <input
                                    autoComplete="email"
                                    disabled={loading || sentEmail}
                                    type="email"
                                    {...register('email', { required: 'Email is required' })}
                                    className="w-full bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-md text-sm shadow-md"
                                />
                                { errors.email && <div className="text-red-500 text-xs">*{errors.email.message}</div> }
                            </div>
                            {!showForgotPassword && (
                                <div className="flex flex-col w-full">
                                    <div>PASSWORD*</div>
                                    <div className="relative">
                                        <input
                                            autoComplete="current-password"
                                            disabled={loading}
                                            type={showPassword ? "text" : "password"}
                                            {...register('password', { required: 'Password is required' })}
                                            className="w-full bg-white/10 backdrop-blur-md text-white px-4 py-2 pr-10 rounded-md text-sm shadow-md"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                                            disabled={loading}
                                        >
                                            {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                        </button>
                                    </div>
                                    { errors.password && <div className="text-red-500 text-xs">*{errors.password.message}</div> }
                                </div>
                            )}
                            <button
                                type="submit"
                                className={`w-full bg-[#45b5d9] duration-300 rounded-xl text-white px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10 ${sentEmail ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#45b5d9]/80'}`}
                                disabled={loading || sentEmail}
                            >
                                {loading ? `${showForgotPassword ? 'SENDING RESET EMAIL...' : 'LOGGING IN...'}` : showForgotPassword ? 'SEND RESET EMAIL' : 'LOGIN'}
                                {loading && <CircularProgress size={20} />}
                            </button>
                            {!showForgotPassword && (
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 my-2">
                                        <div className="flex-1 h-px bg-gray-600"></div>
                                        <span className="text-xs text-gray-400">OR</span>
                                        <div className="flex-1 h-px bg-gray-600"></div>
                                    </div>
                                    <button
                                        type="button"
                                        className="w-full bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-md text-sm shadow-md hover:bg-white/20 duration-300 flex items-center justify-center gap-2"
                                        onClick={() => setShowWalletLogin(true)}
                                        disabled={loading}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        CONNECT WALLET
                                    </button>
                                    <button
                                        type="button"
                                        className="text-[#45b5d9] hover:text-[#45b5d9]/80 duration-300 text-sm"
                                        onClick={() => {
                                            setShowForgotPassword(true);
                                            reset();
                                        }}
                                    >
                                        FORGOT PASSWORD?
                                    </button>
                                    <div className="text-sm text-center">
                                        Don&apos;t have an account?{' '}
                                        <button type="button" className="text-[#45b5d9] hover:text-[#45b5d9]/80 duration-300" onClick={() => {
                                            dispatch(setJumpPage(true));
                                            const timeout = setTimeout(() => {
                                                router.push(`/register`);
                                            }, 500);
                                            return () => clearTimeout(timeout);
                                        }}>
                                            REGISTER
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </form>
            <Image alt=""
                height={198} width={1425} src={`/assets/images/entry/entryContentBottomCardFrame.png`}
                placeholder="blur"
                blurDataURL={`/assets/images/entry/entryContentBottomCardFrame.png`}
            />
        </motion.div>
    </div>
    );
};

export default LoginPage;