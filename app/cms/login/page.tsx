"use client"

import { useForm, SubmitHandler } from "react-hook-form"
import { TextField, Button } from "@mui/material"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import Image from "next/image"
import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { motion } from "framer-motion"
import CircularProgress from "@mui/material/CircularProgress"

type Inputs = {
    email: string
    password: string
}

const LoginPage = () => {
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
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login`, data)
            const { access_token, user } = response.data
            
            // Store the token
            localStorage.setItem('token', access_token)
            // Store user info
            localStorage.setItem('user_email', user.email)
            localStorage.setItem('roles', JSON.stringify(user.roles || []))
            localStorage.setItem('permissions', JSON.stringify(user.permissions || []))
            
            // Redirect to user management page
            router.push('/cms/user')
        } catch (error) {
            console.error('Login failed:', error)
            alert('Login failed. Please check your credentials.')
            setLoading(false);
        }
    }

    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (token) {
                router.push("/cms/user");
            }
        }
    }, [router]);

    return (
        <div className={`bg-slate-50 flex flex-col items-center justify-center h-screen`} style={{ backgroundImage: `url(${`/assets/images/cms/cms-login-bg.jpg`})` }}>
            <div className="absolute inset-0 backdrop-blur-md bg-white/20 filter-bar"></div>
            <Image alt="logo"
                className="fixed left-8 top-0 w-20 sm:w-26 mx-auto"
                width={920} height={384} src={`/assets/images/TN7_Blurb.png`} priority quality={50}
            />
            <motion.div className="bg-white md:w-96 flex flex-col gap-8 p-8 rounded-lg shadow-md z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-4xl font-bold text-red-800 text-center">TN7 CMS</h1>
                <h2 className="text-2xl font-bold text-gray-800 text-center">Sign in to your account</h2>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                    <TextField 
                        label="Email*" 
                        type="email"
                        {...register("email", { required: true })} 
                        error={!!errors.email}
                    />
                    {errors.email && <span className="text-red-500 text-xs">Email is required</span>}
                    <TextField 
                        label="Password*" 
                        type="password"
                        {...register("password", { required: true })} 
                        error={!!errors.password}
                    />
                    {errors.password && <span className="text-red-500 text-xs">Password is required</span>}
                    <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>
                <div className="flex flex-col gap-2 text-xs text-center text-gray-400">
                    <span className="">Please contact the admin to get access to the CMS</span>
                    <span className="">© 2025 TN7. All rights reserved.</span>
                </div>
            </motion.div>
        </div>
    )
}

export default LoginPage
