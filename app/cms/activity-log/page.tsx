"use client"

import { useEffect, useState } from "react"
import Shell from "@/components/Shell"
import CustomTable, { Column } from "@/components/(widgets)/CustomTable"
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { setJumpPage } from "@/store/slice/pageSlice"
import { useDispatch } from "react-redux"

interface ActivityLog {
    id: number
    log_name: string
    description: string
    subject_type: string
    subject_id: string
    causer_type: string | null
    causer_id: string | null
    properties: any
    created_at: string
}

const ActivityLogPage = () => {
    const dispatch = useDispatch();
    const [logs, setLogs] = useState<ActivityLog[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const fetchActivityLogs = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                setError('No authentication token found')
                router.push('/cms/login')
                return
            }
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/activity-logs`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            setLogs(response.data)
            setError(null)
        } catch (error: any) {
            if (error.response?.status === 401) {
                setError('Authentication failed. Please login again.')
                localStorage.removeItem('token')
                router.push('/cms/login')
            } else {
                setError(error.response?.data?.message || 'Failed to fetch activity logs. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchActivityLogs()
    }, [])

    const columns: Column[] = [
        {
            id: "created_at",
            name: "Activity Log Time",
            sortable: true,
            align: "left",
            render: (value) => new Date(value).toLocaleString()
        },
        {
            id: "log_name",
            name: "Activity Log Name",
            sortable: true,
            align: "left"
        },
        {
            id: "description",
            name: "Event",
            sortable: true,
            align: "left"
        },
        {
            id: "subject_type",
            name: "Subject Type",
            sortable: true,
            align: "left"
        },
        {
            id: "causer_type",
            name: "Causer Type",
            sortable: true,
            align: "left"
        },
        {
            id: "causer",
            name: "Causer",
            sortable: false,
            align: "left",
            render: (row: any) => {
                if (row && row.name) return row.name;
                return <span className="text-gray-400">-</span>;
            }
        },
        {
            id: "properties",
            name: "Old Value",
            sortable: false,
            align: "left",
            render: (row: any) => {
                console.log(row)
                if (!row) return <span className="text-gray-400">-</span>;
                const old = row.old || row.attributes_before || null;
                return <pre className="bg-red-50 text-xs rounded p-1 mb-1">{JSON.stringify(old, null, 2)}</pre>;
            }
        },
        {
            id: "properties",
            name: "New Value",
            sortable: false,
            align: "left",
            render: (row: any) => {
                if (!row) return <span className="text-gray-400">-</span>;
                const attributes = row.attributes || row.new || row;
                return <pre className="bg-green-50 text-xs rounded p-1 mb-1">{JSON.stringify(attributes, null, 2)}</pre>;
            }
        }
    ];

    useEffect(() => {
        dispatch(setJumpPage(false))
    }, [])

    return (
        <Shell>
            <div className="flex h-16 justify-between items-center">
                <h1 className="text-2xl font-semibold">Activity Logs</h1>
            </div>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            <CustomTable columns={columns} data={logs} pagination={true} loading={loading} />
        </Shell>
    )
}

export default ActivityLogPage 