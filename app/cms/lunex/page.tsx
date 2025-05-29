"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Drawer } from "@mui/material";

import Shell from "@/components/Shell";

const tabs = [
    {
        id: 0,
        name: "Leaderboard",
    },
    {
        id: 1,
        name: "Auto Assign Lunex",
    },
    {
        id: 2,
        name: "Manual Assign Lunex",
    },
]


const LunexManagementPage = () => {
    const router = useRouter();
    const [tabId, setTabId] = useState<number>(0);
    const [open, setOpen] = useState<boolean>(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/cms/login');
            return;
        }


    }, [tabId]);

    return (<Shell>
        <div className="flex h-16 justify-between items-center">
            <h1 className="text-2xl font-semibold">Lunex Management</h1>
        </div>
        <div className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 mb-2">
            {tabs.map((tab) => (
                <button 
                    key={tab.id}
                    className={`inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 ${tabId === tab.id ? 'text-gray-600 bg-gray-50' : ''}`} 
                    onClick={() => setTabId(tab.id)}
                >
                    {tab.name}
                </button>
            ))}
        </div>
        {
            tabId == 0 && <></>
        }
        <Drawer
            anchor="right"
            open={open}
            onClose={() => {
                setOpen(false);
            }}
        >
            <div className="w-[400px] p-6">
                <h2 className="text-xl font-semibold mb-4">
                  
                </h2>
            </div>
        </Drawer>
    </Shell>)
}

export default LunexManagementPage;
