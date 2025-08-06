'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CircularProgress } from '@mui/material';
import { Header, Loader } from '@/components';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { setJumpPage } from '@/store/slice/pageSlice';
import { useDispatch } from 'react-redux';

type LoginForm = {
    email: string;
    password: string;
};

const LoginPage = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

    const [loading, setLoading] = useState(false);
    const { isAuthenticated, loading: authLoading, login, redirectToDashboard } = useAuth({ type: "user" });

    const onSubmit = async (data: LoginForm) => {
        setLoading(true);
        try {
            await login(data.email, data.password);
            redirectToDashboard();
        } catch (err: any) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            redirectToDashboard();
        }
    }, [isAuthenticated, redirectToDashboard]);

    if (authLoading || isAuthenticated) {
        return (
            <div className="bg-black h-screen w-full"></div>
        );
    }

    return (<div className="fixed h-screen w-full overflow-hidden flex justify-center items-center">
        <Image id="background" className="absolute top-0 left-0 w-full h-full object-cover" alt="" width={5760} height={3260} src={`/assets/images/entry/entryBG.png`} priority />
        <Header />
        <Loader />
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative w-full sm:max-w-[400px] md:max-w-[500px] flex flex-col items-center justify-center">
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
                <div className="flex flex-col gap-4 w-[70%] overflow-y-auto px-2 max-h-[calc(100vh-100px)] z-10 filter-bar">
                    <div className="text-2xl font-bold text-center">LOGIN</div>
                    <div className="flex flex-col w-full">
                        <div>EMAIL*</div>
                        <input
                            autoComplete="email"
                            disabled={loading}
                            type="email"
                            {...register('email', { required: 'Email is required' })}
                            className="w-full bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-md text-sm shadow-md"
                        />
                        { errors.email && <div className="text-red-500 text-xs">*{errors.email.message}</div> }
                    </div>
                    <div className="flex flex-col w-full">
                        <div>PASSWORD*</div>
                        <input
                            autoComplete="current-password"
                            disabled={loading}
                            type="password"
                            {...register('password', { required: 'Password is required' })}
                            className="w-full bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-md text-sm shadow-md"
                        />
                        { errors.password && <div className="text-red-500 text-xs">*{errors.password.message}</div> }
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#45b5d9] hover:bg-[#45b5d9]/80 duration-300 rounded-xl text-white px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10"
                        disabled={loading}
                    >
                        {loading ? 'LOGGING IN...' : 'LOGIN'}
                        {loading && <CircularProgress size={20} />}
                    </button>
                    <div className="text-sm text-center">
                        Don&apos;t have an account?{' '}
                        <button type="button" className="text-[#45b5d9] hover:text-[#45b5d9]/80 duration-300" onClick={() => {
                            dispatch(setJumpPage(true));
                            const timeout = setTimeout(() => {
                                router.push(`/register`);
                            }, 200);
                            return () => clearTimeout(timeout);
                        }}>
                            REGISTER
                        </button>
                    </div>
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