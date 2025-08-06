import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export const useAuth = ({ type = "user" }: { type?: "user" | "cms" }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuthStatus = async () => {
            const token = type === "cms" ? localStorage.getItem('cms_token') : localStorage.getItem('token');
            if (token) {
                console.log("checkauthtoken", token);
                try {
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log("response", response.data);
                    setUser(response.data);
                    setIsAuthenticated(true);
                } catch (err) {
                    console.log("checkautherr", err);
                    /*console.log("err", err);
                    // token无效，清除localStorage
                    if (type === "cms") {
                        localStorage.removeItem('cms_token');
                    } else {
                        localStorage.removeItem('token');
                    }
                    setUser(null);
                    setIsAuthenticated(false);*/
                }
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
            setLoading(false);
        };

        checkAuthStatus();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login`, {
                email,
                password
            });

            const roles = res.data.user.roles;

            if (type === "cms" && roles.length > 0) {
                console.log("roles", roles.length);
                localStorage.setItem('cms_token', res.data.access_token);
            } else {
                localStorage.setItem('token', res.data.access_token);
            }
            
            setUser(res.data.user);
            setIsAuthenticated(true);
            return res.data.user;
        } catch (error) {
            throw error;
        }
    };

    const register = async (email: string, password: string, name: string, recaptchaToken: string) => {
        console.log("register", email, password, name, recaptchaToken);
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/register`, {
                email,
                password,
                name,
                recaptchaToken
            });
            localStorage.setItem('token', res.data.access_token);
            
            // 获取用户信息
            const userResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/me`, {
                headers: { Authorization: `Bearer ${res.data.access_token}` }
            });
            setUser(userResponse.data);
            setIsAuthenticated(true);
            return userResponse.data;
        } catch (error) {
            throw error;
        }
    };

    const walletLogin = async (address: string, signature: string) => {
        console.log("walletLogin", address, signature);
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wallet-login`, {
                address,
                signature
            });
            localStorage.setItem('token', res.data.access_token);
            
            // 获取用户信息
            const userResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/me`, {
                headers: { Authorization: `Bearer ${res.data.access_token}` }
            });
            setUser(userResponse.data);
            setIsAuthenticated(true);
            return userResponse.data;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        if (type === "cms") {
            localStorage.removeItem('cms_token');
        } else {
            localStorage.removeItem('token');
        }
        setUser(null);
        setIsAuthenticated(false);
    };

    const redirectToDashboard = () => {
        if (user?.id) {
            router.push(`/dashboard/${user.id}`);
        }
    };

    return {
        isAuthenticated,
        user,
        loading,
        login,
        register,
        walletLogin,
        logout,
        redirectToDashboard
    };
}; 