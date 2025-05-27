'use client';

import dynamic from 'next/dynamic';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

//dynamic import for ConnectButton
const ConnectButton = dynamic(
    () => import('@rainbow-me/rainbowkit').then(mod => mod.ConnectButton),
    { ssr: false }
);

const WalletLogin = () => {
    const { address, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const { disconnect } = useDisconnect();
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('token', token);
        setIsLoggedIn(!!token);
    }, []);

    const handleWalletLogin = async () => {
        if (!isConnected || !address) {
            alert('Please connect wallet first!');
            return;
        }

        try {
            setLoading(true);
            const message = 'Sign to login to NFT Website!';
            const signature = await signMessageAsync({ message });

            console.log('signature', signature);
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wallet-login`, {
                address,
                signature,
            });

            const token = response.data.access_token;
            console.log('Logged in, token:', token);

            localStorage.setItem('token', token);
            setIsLoggedIn(true);
        } catch (error) {
            console.error('Login failed', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        disconnect();
        //router.push('/');
    };

    //handle hydration error
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) return null;

    return (
        <main className="flex flex-col items-center justify-center min-h-screen gap-4">
            <ConnectButton />
            {isConnected && (
                <div className="flex flex-col gap-4">
                    {!isLoggedIn && (
                        <button
                            onClick={handleWalletLogin}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg"
                            disabled={loading}
                        >
                            {loading ? 'Signing...' : 'Wallet Login'}
                        </button>
                    )}
                    {isLoggedIn && (
                        <button
                            onClick={handleLogout}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg"
                        >
                            Logout
                        </button>
                    )}
                </div>
            )}
        </main>
    );
}

export default WalletLogin;
