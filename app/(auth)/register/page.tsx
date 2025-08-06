'use client';

import { useForm } from 'react-hook-form';
import { Header, Loader } from '@/components';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { setJumpPage } from '@/store/slice/pageSlice';
import { useDispatch } from 'react-redux';
import { CircularProgress } from '@mui/material';
import Image from 'next/image';
import ReCAPTCHA from "react-google-recaptcha";

type RegisterForm = {
    email: string;
    password: string;
    password2: string;
};

const RegisterPage = () => {
    const router = useRouter();
    const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
    const [loading, setLoading] = useState(false);
    const { isAuthenticated, loading: authLoading, register: registerUser, redirectToDashboard } = useAuth({ type: "user" });
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const dispatch = useDispatch();

    const onSubmit = async (data: RegisterForm) => {
        if (!recaptchaToken) {
            return;
        }
        if (data.password !== data.password2) {
            return;
        }
        setLoading(true);
        try {
            await registerUser(data.email, data.password, data.email.split('@')[0], recaptchaToken || "");
            router.push('/profile/setup');
        } catch (err: any) {
            console.log(err?.response?.data?.message || 'Registration failed');
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
        <div className="relative w-full sm:max-w-[400px] md:max-w-[500px] flex flex-col items-center justify-center">
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
                <div className="flex flex-col gap-4 w-[70%] overflow-x-hidden overflow-y-auto px-2 max-h-[calc(100vh-100px)] z-10 filter-bar">
                    <div className="text-2xl font-bold text-center">REGISTER</div>
                    <div className="flex flex-col w-full">
                        <div>EMAIL*</div>
                        <input
                            disabled={loading}
                            type="email"
                            {...register('email', { required: 'Email is required' })}
                            className={`w-full bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-md text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                        { errors.email && <div className="text-red-500 text-xs">*{errors.email.message}</div> }
                    </div>
                    <div className="flex flex-col w-full">
                        <div>PASSWORD*</div>
                        <input
                            disabled={loading}
                            type="password"
                            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                            className={`w-full bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-md text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                        { errors.password && <div className="text-red-500 text-xs">*{errors.password.message}</div> }
                    </div>
                    <div className="flex flex-col w-full">
                        <div>CONFIRM PASSWORD*</div>
                        <input
                            disabled={loading}
                            type="password"
                            {...register('password2', {
                                required: 'Please confirm your password',
                                validate: value => value === watch('password') || 'Passwords do not match'
                            })}
                            className={`w-full bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-md text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                    { errors.password2 && <div className="text-red-500 text-xs">*{errors.password2.message}</div> }
                    </div>
                    {loading && (
                        <div className="flex flex-col w-full">
                            <ReCAPTCHA
                                ref={recaptchaRef}
                                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                                onChange={token => setRecaptchaToken(token)}
                                theme="dark"
                            />
                            {!recaptchaToken && <div className="text-red-500 text-xs">*Please verify you are human</div>}
                        </div>
                    )}
                    <button
                        type="submit"
                        className={`w-full bg-[#45b5d9] hover:bg-[#45b5d9]/80 duration-300 rounded-xl text-white px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'REGISTERING...' : 'REGISTER'}
                        {loading && <CircularProgress size={20} />}
                    </button>
                    <div className="flex gap-2 justify-center text-sm w-full">
                        Already have an account?
                        <button type="button" className="text-[#45b5d9] hover:text-[#45b5d9]/80 duration-300" onClick={() => {
                            dispatch(setJumpPage(true));
                            const timeout = setTimeout(() => {
                                router.push(`/login`);
                            }, 200);
                            return () => clearTimeout(timeout);
                        }}>
                            LOGIN
                        </button>
                    </div>
                </div>
            </form>
            <Image alt=""
                height={198} width={1425} src={`/assets/images/entry/entryContentBottomCardFrame.png`}
                placeholder="blur"
                blurDataURL={`/assets/images/entry/entryContentBottomCardFrame.png`}
            />
        </div>
    </div>);
};

export default RegisterPage;