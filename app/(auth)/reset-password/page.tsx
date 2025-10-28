'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CircularProgress } from '@mui/material';
import { Loader } from '@/components';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { setJumpPage } from '@/store/slice/pageSlice';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import Image from 'next/image';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';

type ResetPasswordForm = {
    email: string;
    password: string;
    confirmPassword: string;
};

const ResetPasswordPage = ({ searchParams }: { searchParams: { token: string } }) => {
    const { token } = searchParams;
    const { enqueueSnackbar } = useSnackbar();
    
    const router = useRouter();
    const dispatch = useDispatch();
    const { register, handleSubmit, formState: { errors }, setError } = useForm<ResetPasswordForm>();

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { isAuthenticated, loading: authLoading, user } = useAuth({ type: "user" });

    const onSubmit = async (data: ResetPasswordForm) => {
        if (data.password !== data.confirmPassword) {
            setError('confirmPassword', { message: 'New Password and Confirm Password do not match' });
            return;
        }

        console.log("token", token);
        setLoading(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reset-password`, {
                token: token,
                password: data.password,
                password_confirmation: data.confirmPassword,
            });
            enqueueSnackbar('Password reset successful', { variant: 'success' });
            router.push('/login');
        } catch (err: any) {
            enqueueSnackbar(err.response.data.message, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && user.id) {
            router.push(`/dashboard/${user.id}`);
        }
    }, [isAuthenticated, user]);

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
        <Loader src={`/assets/images/login/webp/loginBG_blur.webp`} alt="loading" />
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
                            <span className="text-xl font-bold">RESET PASSWORD</span>
                            <span className="text-sm text-gray-400">Enter your new password</span>
                        </div>
                    </div>
                    <div className="flex flex-col w-full">
                        <div>NEW PASSWORD*</div>
                        <div className="relative">
                            <input
                                autoComplete="password"
                                disabled={loading}
                                type={showPassword ? "text" : "password"}
                                {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters long' } })}
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
                    <div className="flex flex-col w-full">
                        <div className="flex flex-col w-full">
                            <div>CONFIRM PASSWORD*</div>
                            <div className="relative">
                                <input
                                    autoComplete="confirm-password"
                                    disabled={loading}
                                    type={showConfirmPassword ? "text" : "password"}
                                    {...register('confirmPassword', { required: 'Confirm Password is required', minLength: { value: 8, message: 'Confirm Password must be at least 8 characters long' } })}
                                    className="w-full bg-white/10 backdrop-blur-md text-white px-4 py-2 pr-10 rounded-md text-sm shadow-md"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                                    disabled={loading}
                                >
                                    {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                </button>
                            </div>
                            { errors.confirmPassword && <div className="text-red-500 text-xs">*{errors.confirmPassword.message}</div> }
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#45b5d9] hover:bg-[#45b5d9]/80 duration-300 rounded-xl text-white px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10"
                        disabled={loading}
                    >
                        {loading ? 'RESET PASSWORD...' : 'RESET PASSWORD'}
                        {loading && <CircularProgress size={20} />}
                    </button>   
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

export default ResetPasswordPage;