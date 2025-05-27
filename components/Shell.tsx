import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MdDashboard, MdShoppingCart, MdListAlt, MdPeople, MdSettings, MdManageAccounts } from "react-icons/md";
import { TbLogs } from "react-icons/tb";
import { BiLogOut, BiUser } from "react-icons/bi";
import { Button } from "@mui/material";

const menuItems = [
    //{ label: "Dashboard", href: "/cms/dashboard", icon: <MdDashboard size={22} /> },
    { label: "User", href: "/cms/user", icon: <MdPeople size={22} /> },
    { label: "Role", href: "/cms/role", icon: <MdManageAccounts size={22} /> },
    //{ label: "Log", href: "/cms/audit-log", icon: <TbLogs size={22} /> },
    { label: "Lore", href: "/cms/lore", icon: <MdListAlt size={22} /> },
    { label: "Entry", href: "/cms/entry", icon: <MdListAlt size={22} /> },
];

const Shell = ({ children }: { children: React.ReactNode }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const router = useRouter();

    // Get user email from localStorage (or you can fetch from API if you have user info endpoint)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const email = localStorage.getItem('user_email');
            setUserEmail(email);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('roles');
        localStorage.removeItem('permissions');
        router.push('/cms/login');
    };

    return (
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
            <div className={`fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-white to-gray-100 shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:relative z-40 flex flex-col justify-between`}>
                <div>
                    <div className="flex flex-col items-center py-8 border-b border-gray-200">
                        <Image src="/assets/images/TN7_Blurb.png" alt="TN7 Logo" width={80} height={80} className="mb-2" />
                    </div>
                    <nav className="flex flex-col gap-2 mt-6 px-4">
                        {menuItems.map(item => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 transition-all duration-150 hover:bg-slate-100 ${
                                    pathname === item.href ? 'bg-blue-50 font-bold shadow' : ''
                                }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="mb-4 px-4 text-xs text-gray-400 border-t border-gray-200 pt-4 text-center select-none">
                    TN7 CMS © {new Date().getFullYear()}
                </div>
            </div>

            {/* Main content */}
            <main className="p-4 bg-gray-100 h-screen overflow-y-auto flex flex-col gap-4 items-center w-full">
                {/* Header bar */}
                <div className="bg-white flex items-center justify-end px-4 py-2 rounded-3xl w-full max-w-[1024px] shadow-sm">
                    <BiUser size={22} className="mr-2" />
                    {userEmail && (
                        <span className="mr-4 text-gray-700 text-sm">{userEmail}</span>
                    )}
                    <button
                        onClick={handleLogout}
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
        </div>
    )
}

export default Shell;