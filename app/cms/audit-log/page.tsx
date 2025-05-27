"use client"

import { useEffect, useState } from "react"
import Shell from "@/components/Shell"
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material"
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface AuditLog {
    id: number
    user_id: number
    action: string
    entity_type: string
    entity_id: number
    old_value: string | null
    new_value: string | null
    created_at: string
    user: {
        name: string
    }
}

const AuditLogPage = () => {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const fetchAuditLogs = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                setError('No authentication token found')
                router.push('/cms/login')
                return
            }

            console.log('Fetching audit logs...')
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/audit-logs`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            console.log('Audit logs response:', response.data)
            setLogs(response.data)
            setError(null)
        } catch (error: any) {
            console.error('Error fetching audit logs:', error)
            if (error.response?.status === 401) {
                setError('Authentication failed. Please login again.')
                localStorage.removeItem('token')
                router.push('/cms/login')
            } else {
                setError(error.response?.data?.message || 'Failed to fetch audit logs. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    const createTestLogs = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                setError('No authentication token found')
                router.push('/cms/login')
                return
            }

            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/audit-logs/test`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            
            // 刷新日志列表
            fetchAuditLogs()
        } catch (error: any) {
            console.error('Error creating test logs:', error)
            setError(error.response?.data?.message || 'Failed to create test logs. Please try again.')
        }
    }

    useEffect(() => {
        fetchAuditLogs()
    }, [])

    if (loading) {
        return (
            <Shell>
                <div className="p-4">Loading...</div>
            </Shell>
        )
    }

    return (
        <Shell>
            <div className="space-y-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Audit Logs</h1>
                    <Button variant="contained" onClick={createTestLogs}>Create Test Logs</Button>
                </div>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                <div className="overflow-x-auto">
                    <TableContainer component={Paper} className="rounded-xl shadow">
                        <Table>
                            <TableHead className="bg-gray-50">
                                <TableRow>
                                    <TableCell>Time</TableCell>
                                    <TableCell>User</TableCell>
                                    <TableCell>Action</TableCell>
                                    <TableCell>Entity Type</TableCell>
                                    <TableCell>Entity ID</TableCell>
                                    <TableCell>Changes</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            {new Date(log.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell>{log.user.name}</TableCell>
                                        <TableCell>{log.action}</TableCell>
                                        <TableCell>{log.entity_type}</TableCell>
                                        <TableCell>{log.entity_id}</TableCell>
                                        <TableCell>
                                            {log.old_value && log.new_value ? (
                                                <div className="text-sm">
                                                    <div className="text-red-600">- {JSON.stringify(log.old_value)}</div>
                                                    <div className="text-green-600">+ {JSON.stringify(log.new_value)}</div>
                                                </div>
                                            ) : (
                                                log.new_value || log.old_value || '-'
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>
        </Shell>
    )
}

export default AuditLogPage 