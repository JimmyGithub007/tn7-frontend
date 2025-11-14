'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { WagmiProvider, createConfig } from 'wagmi';
import { mainnet, polygon, arbitrum } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { useMemo } from 'react';

const WalletProviders = ({ children }: { children: React.ReactNode }) => {
    const { connectors } = useMemo(() => getDefaultWallets({
        appName: 'TN7',
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
    }), []);

    const config = useMemo(() => createConfig({
        chains: [mainnet, polygon, arbitrum],
        connectors,
        transports: {
            [mainnet.id]: http(),
            [polygon.id]: http(),
            [arbitrum.id]: http(),
        },
    }), [connectors]);

    const queryClient = useMemo(() => new QueryClient({
        defaultOptions: {
            queries: {
                retry: 3,
                retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            },
        },
    }), []);

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    initialChain={mainnet}
                    showRecentTransactions={true}
                    modalSize="compact"
                    locale="en"
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

export default WalletProviders;
