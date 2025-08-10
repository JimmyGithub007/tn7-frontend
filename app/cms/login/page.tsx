"use client"

import { useForm, SubmitHandler } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/useAuth"

import CircularProgress from "@mui/material/CircularProgress"
import Image from "next/image"
import z from "zod"

type Inputs = {
    email: string
    password: string
}

const LoginPage = () => {
    const { login } = useAuth({ type: "cms" });
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Inputs>({
        resolver: zodResolver(z.object({
            email: z.string().email(),
            password: z.string().min(8),
        })),
        defaultValues: {
            email: "admin@example.com",
            password: "password",
        },
    })

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        setLoading(true)
        try {
            await login(data.email, data.password);
            router.push("/cms/user");
        } catch (err: any) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("cms_token");
            if (token) {
                router.push("/cms/user");
            }
        }
    }, [router]);

    return (
        <div className="fixed h-screen w-full overflow-hidden flex justify-center items-center">
            <Image id="background" className="absolute top-0 left-0 w-full h-full object-cover" alt="" width={5760} height={3260} src={`/assets/images/entry/entryBG.png`} priority />
            <Image alt="logo"
                className="fixed left-8 top-0 w-20 sm:w-26 mx-auto"
                width={920} height={384} src={`/assets/images/TN7_Blurb.png`} priority quality={50}
            />
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
                <div className="relative text-white flex flex-col gap-4 items-center justify-center w-full text-white">
                    <Image className="absolute left-0 top-0 w-full h-full" alt=""
                        height={1272} width={1425} src={`/assets/images/entry/entryContentCenterCardFrame.png`}
                        placeholder="blur"
                        blurDataURL={`/assets/images/entry/entryContentCenterCardFrame.png`}
                    />
                    <div className="flex flex-col gap-4 w-[80%] overflow-y-auto px-2 py-4 max-h-[calc(100vh-100px)] z-10 filter-bar">
                        <div className="text-2xl font-bold text-center">TN7 CMS</div>
                        <div className="flex items-center gap-2">
                            <div className="bg-white w-2 h-10"></div>
                            <div className="flex flex-col items-start">
                                <span className="text-xl font-bold">LOGIN</span>
                                <span className="text-sm text-gray-400">Enter your account details</span>
                            </div>
                        </div>
                        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
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
                        </form>
                        <div className="flex flex-col gap-2 text-xs text-center">
                            <span className="">Please contact the admin to get access to the CMS</span>
                            <span className="">© 2025 TN7. All rights reserved.</span>
                        </div>  
                    </div>                  
                </div>
                <Image alt=""
                    height={198} width={1425} src={`/assets/images/entry/entryContentBottomCardFrame.png`}
                    placeholder="blur"
                    blurDataURL={`/assets/images/entry/entryContentBottomCardFrame.png`}
                />
            </motion.div>
        </div>
    )
}

export default LoginPage
