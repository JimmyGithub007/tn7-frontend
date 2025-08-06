import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, createContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MdDashboard, MdShoppingCart, MdListAlt, MdPeople, MdSettings, MdManageAccounts, MdLeaderboard } from "react-icons/md";
import { TbLogs } from "react-icons/tb";
import { BiLogOut, BiUser } from "react-icons/bi";
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress } from "@mui/material";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setJumpPage } from "@/store/slice/pageSlice";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

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

    const { isAuthenticated, user, loading: authLoading, logout } = useAuth({ type: "cms" });

    const dispatch = useDispatch();
    const jumpPage = useSelector((state: RootState) => state.page.jumpPage);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    /*const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token')
            await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/logout`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    }
                }
            );

            localStorage.removeItem('token');
            localStorage.removeItem('user_email');
            localStorage.removeItem('roles');
            localStorage.removeItem('permissions');
            router.push('/cms/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };*/

    useEffect(() => {
        if (pathname !== currentPage) setCurrentPage(pathname)
    }, [pathname])

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/cms/login');
        }
    }, [authLoading, isAuthenticated, user, router])

    useEffect(() => {
        console.log("reload")
    }, [])

    return (<>
        <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
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
                        {menuItems.map(item => (
                            <button
                                key={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 transition-all duration-150 hover:bg-slate-100 
                                    ${currentPage === item.href ? 'bg-blue-50 font-bold shadow' : ''}
                                    ${user?.permissions?.some((permission: any) => permission.name === item.permission) ? '' : 'cursor-not-allowed opacity-50'}
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
                    <Button onClick={() => setLogoutDialogOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            setLogoutDialogOpen(false);
                            logout();
                        }}
                        color="primary"
                        variant="contained"
                    >
                        Logout
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    </>)
}

export default Shell;