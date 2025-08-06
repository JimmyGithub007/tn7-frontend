// app/auth/twitter/callback/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const Callback = ({ params }: { params: { category: string } }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { category } = params;

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // 从 URL 获取 code 和 state
                const code = searchParams.get('code');
                const state = searchParams.get('state');

                if (!code) {
                    throw new Error(`No code received from ${category}`);
                }

                // 构建请求体
                const requestBody: any = {
                    code,
                    state
                };

                // 只有 Twitter 需要 code_verifier
                if (category === 'twitter') {
                    const codeVerifier = localStorage.getItem('twitter_code_verifier');
                    if (!codeVerifier) {
                        throw new Error('No code verifier found');
                    }
                    requestBody.code_verifier = codeVerifier;
                }

                // 调用后端 API
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/social/${category}/callback`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(requestBody)
                });

                const data = await response.json();

                console.log("data", data);

                if (!response.ok) {
                    throw new Error(data.error || `Failed to connect ${category}`);
                }

                // 清除 code_verifier（只有 Twitter 需要）
                if (category === 'twitter') {
                    localStorage.removeItem('twitter_code_verifier');
                }

                // 显示成功消息
                const platformName = category === 'twitter' ? 'Twitter' : 'Instagram';
                alert(`${platformName} 连接成功！`);

                // 跳转回 dashboard
                router.push('/dashboard/' + data.user.id);

            } catch (error: any) {
                console.error(`${category} callback error:`, error);
                alert('连接失败：' + error.message);
                router.push('/dashboard');
            }
        };

        handleCallback();
    }, [router, searchParams, category]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center text-white">
                <h1 className="text-2xl font-bold mb-4">Connecting to {category === 'twitter' ? 'Twitter' : 'Instagram'}...</h1>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            </div>
        </div>
    );
}

export default Callback;