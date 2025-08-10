"use client"

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MdListAlt, MdPeople, MdManageAccounts, MdLeaderboard } from "react-icons/md";
import { TbLogs } from "react-icons/tb";
import { BiLogOut, BiUser } from "react-icons/bi";
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setJumpPage } from "@/store/slice/pageSlice";
import { AnimatePresence, motion } from "framer-motion";
import { useSnackbar } from "notistack";
import axios from "axios";
import Image from "next/image";
import Loader from "./Loader";

const menuItems = [
    //{ label: "Dashboard", href: "/cms/dashboard", icon: <MdDashboard size={22} /> },
    { label: "User", href: "/cms/user", icon: <MdPeople size={22} />, permission: "user-management" },
    { label: "Role", href: "/cms/role", icon: <MdManageAccounts size={22} />, permission: "role-management" },
    { label: "Log", href: "/cms/activity-log", icon: <TbLogs size={22} />, permission: "log-management" },
    { label: "Lore", href: "/cms/lore", icon: <MdListAlt size={22} />, permission: "lore-management" },
    { label: "Entry", href: "/cms/entry", icon: <MdListAlt size={22} />, permission: "entry-management" },
    { label: "Lunex", href: "/cms/lunex", icon: <MdLeaderboard size={22} />, permission: "lunex-management" },
    { label: "Post", href: "/cms/post", icon: <MdListAlt size={22} />, permission: "post-management" },
];

const Shell = ({ children }: { children: React.ReactNode }) => {
    const { enqueueSnackbar } = useSnackbar();

    const dispatch = useDispatch();
    const jumpPage = useSelector((state: RootState) => state.page.jumpPage);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const pathname = usePathname();
    const router = useRouter();

    const logout = () => {
        dispatch(setJumpPage(true));
        localStorage.removeItem('cms_token');
        setUser(null);
        router.push('/cms/login');
        enqueueSnackbar('Logged out successfully', { variant: 'success' });
    };

    // 将权限过滤也放到useMemo中，避免每次渲染都重新计算
    const filteredMenuItems = useMemo(() => {
        if (!user?.permissions) return [];
        return menuItems.filter(item =>
            user.permissions.some((permission: any) => permission.name === item.permission)
        );
    }, [menuItems, user]);

    useEffect(() => {
        if (pathname !== currentPage) setCurrentPage(pathname)
    }, [pathname])

    useEffect(() => {
        if (!pathname.includes('/cms')) return;
        const token = localStorage.getItem('cms_token');
        const checkAuthStatus = async () => {
            if (token) {
                try {
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(response.data);
                } catch (error) {
                    localStorage.removeItem('cms_token');
                    dispatch(setJumpPage(true));
                    router.push('/cms/login');
                    enqueueSnackbar('Session expired, please login again', { variant: 'error' });
                }
            } else {
                dispatch(setJumpPage(true));
                router.push('/cms/login');
            }
        };
        checkAuthStatus();
    }, [pathname]);

    if (!pathname.includes('/cms') || pathname == '/cms/login') {
        return children;
    }

    return (<>
        <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
            <Loader />
            {/* Mobile menu button */}
            <button
                className="lg:hidden fixed top-6 left-8 z-50 p-2 rounded-3xl bg-slate-100 shadow-md"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-white to-gray-100 shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:relative z-40 flex flex-col justify-between`}>
                <div>
                    <div className="flex flex-col items-center py-8 border-b border-gray-200">
                        <Image src="/assets/images/TN7_Blurb.png" alt="TN7 Logo" width={80} height={80} className="mb-2" />
                    </div>
                    <nav className="flex flex-col gap-2 mt-6 px-4">
                        {filteredMenuItems.map(item => (
                            <button
                                key={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 transition-all duration-150 hover:bg-slate-100 
                                    ${currentPage === item.href ? 'bg-blue-50 font-bold shadow' : ''}
                                `}
                                onClick={() => {
                                    setIsMobileMenuOpen(false)
                                    dispatch(setJumpPage(true))
                                    setCurrentPage(item.href)
                                    router.push(item.href)
                                }}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="mb-4 px-4 text-xs text-gray-400 border-t border-gray-200 pt-4 text-center select-none">
                    TN7 CMS © {new Date().getFullYear()}
                </div>
            </div>

            {/* Main content */}
            <main className="p-4 bg-gray-100 h-screen overflow-y-auto flex flex-col gap-4 items-center w-full">
                <AnimatePresence mode="wait">
                    {jumpPage && <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-white/10 backdrop-blur-md z-30 flex items-center justify-center">
                        <CircularProgress size={32} />
                    </motion.div>}
                </AnimatePresence>
                {/* Header bar */}
                <div className="bg-white flex items-center justify-end px-4 py-2 rounded-3xl w-full max-w-[1024px] shadow-sm">
                    <BiUser size={22} className="mr-2" />
                    {user?.email && (
                        <span className="mr-4 text-gray-700 text-sm">{user?.email}</span>
                    )}
                    <button
                        onClick={() => setLogoutDialogOpen(true)}
                        className="duration-150 flex items-center text-gray-700 text-sm rounded-3xl px-4 py-2 bg-gray-200 hover:bg-gray-300 shadow-sm"
                    >
                        Logout
                        <BiLogOut size={22} className="ml-2" />
                    </button>
                </div>
                <div className="max-w-[1024px] w-full">
                    {children}
                </div>
            </main>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
            <Dialog
                open={logoutDialogOpen}
                onClose={() => setLogoutDialogOpen(false)}
            >
                <DialogTitle>Confirm Logout</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to logout?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <button
                        className="w-full bg-white border border-gray-300 hover:bg-gray-50 duration-300 rounded-xl text-gray-500 px-4 py-1 text-sm shadow-lg flex items-center justify-center gap-2 z-10"
                        onClick={() => setLogoutDialogOpen(false)}
                    >
                        CANCEL
                    </button>
                    <button
                        onClick={() => {
                            setLogoutDialogOpen(false);
                            logout();
                        }}
                        className={`bg-[#45b5d9] hover:bg-[#45b5d9]/80 duration-300 rounded-xl text-white px-4 py-1 text-sm shadow-lg flex items-center justify-center gap-2 z-10 w-full`}
                    >
                        LOGOUT
                    </button>
                </DialogActions>
            </Dialog>
        </div>
    </>)
}

export default Shell;