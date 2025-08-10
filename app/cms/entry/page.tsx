"use client";

import { useEffect, useState } from "react";
import { Drawer, TextField } from "@mui/material";
import { MdCancel, MdEdit } from "react-icons/md";
import { FaCheck, FaClipboardList } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { TbCancel } from "react-icons/tb";
import { useCreateBlockNote } from "@blocknote/react";

import axios from "axios";
import CustomTable, { Column } from "@/components/(widgets)/CustomTable";
import Shell from "@/components/Shell";
import { useDispatch } from "react-redux";
import { setContent, setIsOpen } from "@/store/slice/dialogSlice";
import { useForm } from "react-hook-form";
import { setJumpPage } from "@/store/slice/pageSlice";

interface Entry {
    id: string;
    entry_no: string;
    title: string;
    content: string;
    status: number;
    author: { id: string; name: string };
    category?: { id: string; name: string };
    media_url: string;
    media_type: string;
    reason: string;
    created_at: string;
}

const defaultForm = {
    title: "",
    content: "",
    media_url: "",
    media_type: "",
    status: 0,
    author: "",
    category: "",
    reason: ""
};

const EntryPage = () => {
    const dispatch = useDispatch();
    const editor = useCreateBlockNote();
    const [entries, setEntries] = useState<Entry[]>([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [form, setForm] = useState<any>(defaultForm);
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
    const [stats, setStats] = useState<any>({});

    const { register, handleSubmit, formState: { errors }, reset } = useForm<any>({
        defaultValues: {
            reason: ""
        }
    });

    // 获取所有条目
    const fetchEntries = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("cms_token");
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/entry-list/admin`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            });
            setEntries(res.data.entries);
            setStats(res.data.stats);
        } catch (e) {
            // 错误处理
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEdit = async (entry: Entry) => {
        setEditingEntry(entry);

        // 检查 content 是否已经是 HTML 格式
        let htmlContent = entry.content;
        if (entry.content.startsWith('[') || entry.content.startsWith('{')) {
            try {
                // 如果是 JSON 格式，转换为 HTML
                const content = JSON.parse(entry.content);
                htmlContent = await editor.blocksToHTMLLossy(content);
                htmlContent = htmlContent.toString();
            } catch (error) {
                console.error('解析 content 失败:', error);
                htmlContent = entry.content; // 如果解析失败，使用原始内容
            }
        }

        setForm({
            title: entry.title,
            content: htmlContent,
            status: entry.status,
            author: entry.author?.name || "",
            category: entry.category || "",
            media_url: entry.media_url || "",
            media_type: entry.media_type || "",
            reason: ""
        });
        setDrawerOpen(true);
    };

    const handleFormChange = (e: any) => {
        const { name, value } = e.target;
        setForm((prev: any) => ({ ...prev, [name]: value }));
    };

    const onSubmit = async (data: any, status: string) => {
        if (status === 'rejected' && !data.reason) {
            return;
        }

        const token = localStorage.getItem("cms_token");
        try {
            if (editingEntry) {
                // Edit
                const res = await axios.post(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/entry-process/${editingEntry.id}/${status}`,
                    { reason: data.reason || "" },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setEntries((prev) =>
                    prev.map((item) => (item.id === editingEntry.id ? res.data : item))
                );
            }
        } catch (e) {
            // 错误处理
            console.error(e);
        } finally {
            dispatch(setIsOpen(false));
            setDrawerOpen(false);
            setEditingEntry(null);
            setForm(defaultForm);
            reset();
        }
    };

    useEffect(() => {
        fetchEntries();
    }, []);

    // 表格列定义
    const columns: Column[] = [
        {
            id: "actions",
            name: "Actions",
            align: "left",
            sortable: false,
            actions: [
                {
                    label: "Edit",
                    onClick: (row) => handleOpenEdit(row),
                    className: "bg-[#45b5d9] hover:bg-[#45b5d9]/80 duration-300 rounded-xl text-white shadow-md",
                    icon: <MdEdit />
                },
            ]
        },
        { id: "entry_no", name: "Entry No", sortable: true, align: "left" },
        { id: "title", name: "Title", sortable: true, align: "left" },
        { id: "author", name: "Author", sortable: false, align: "left", render: (value) => value?.name || "-" },
        { id: "category", name: "Category", sortable: false, align: "left", render: (value) => value.toUpperCase() },
        { id: "status", name: "Status", sortable: true, align: "center", render: (value: string) => value.toUpperCase() },
        { id: "created_at", name: "Created At", sortable: true, align: "center", render: (value) => new Date(value).toLocaleString() },
    ];

    useEffect(() => {
        dispatch(setJumpPage(false))
    }, [])

    return (
        <>
            <div className="flex h-16 justify-between items-center">
                <h1 className="text-2xl font-semibold">Entry Management</h1>
            </div>
            <div className="grid grid-cols-3 gap-4 my-4">
                <div className="bg-white flex flex-col items-center justify-center h-36 p-4 rounded-lg shadow-md relative overflow-hidden hover:scale-105 duration-300 delay-100">
                    <span>PENDING</span>
                    <span className="text-4xl font-bold">{stats.pending}</span>
                    <FaClipboardList size={100} className="absolute -bottom-4 -right-4 text-slate-100" />
                </div>
                <div className="bg-white flex flex-col items-center justify-center h-36 p-4 rounded-lg shadow-md relative overflow-hidden hover:scale-105 duration-300 delay-100">
                    <span>APPROVED</span>
                    <span className="text-4xl font-bold">{stats.approved}</span>
                    <FaCheckCircle size={100} className="absolute -bottom-4 -right-4 text-slate-100" />
                </div>
                <div className="bg-white flex flex-col items-center justify-center h-36 p-4 rounded-lg shadow-md relative overflow-hidden hover:scale-105 duration-300 delay-100">
                    <span>REJECTED</span>
                    <span className="text-4xl font-bold">{stats.rejected}</span>
                    <TbCancel size={120} className="absolute -bottom-6 -right-6 text-slate-100" />
                </div>
            </div>
            <CustomTable columns={columns} data={entries} pagination={true} />
            <Drawer anchor="right" open={drawerOpen} onClose={() => {
                setDrawerOpen(false);
                setForm(defaultForm);
            }}>
                <div className="w-[400px] p-6">
                    <h2 className="text-xl font-semibold mb-4"># {editingEntry?.entry_no}</h2>
                    <form className="space-y-4">
                        <TextField
                            fullWidth
                            label="Title"
                            name="title"
                            value={form.title}
                            onChange={handleFormChange}
                            disabled={true}
                        />
                        <div className="flex flex-col gap-2 bg-black rounded-lg shadow-md overflow-hidden">
                            {/* 渲染媒体内容 */}
                            {form.category === "artwork" && form.media_type === "image" && form.media_url && (
                                <img
                                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${form.media_url}`}
                                    alt="entry media"
                                    className="mt-2 max-w-full"
                                />
                            )}
                            {form.category === "artwork" && form.media_type === "video" && form.media_url && (
                                <video
                                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${form.media_url}`}
                                    controls
                                    className="mt-2 max-w-full"
                                />
                            )}
                            <div className="text-white p-4" dangerouslySetInnerHTML={{ __html: form.content }} />
                        </div>
                        <TextField
                            fullWidth
                            label="Status"
                            name="status"
                            value={form.status}
                            onChange={handleFormChange}
                            disabled={true}
                        />
                        <TextField
                            fullWidth
                            label="Author"
                            name="author"
                            value={form.author}
                            onChange={handleFormChange}
                            disabled={true}
                        />
                        <TextField
                            fullWidth
                            label="Category"
                            name="category"
                            value={form.category}
                            onChange={handleFormChange}
                            disabled={true}
                        />
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-2">
                                <button type="button" onClick={() => onSubmit(form, "approved")} disabled={form.status !== 'pending'} className={`w-full ${form.status !== 'pending' ? 'bg-[#45b5d9]/30 cursor-not-allowed' : 'bg-[#45b5d9] hover:bg-[#45b5d9]/80'} duration-300 rounded-xl text-white px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10`}>
                                    APPROVE <FaCheck />
                                </button>
                                <button type="button" onClick={() => {
                                    setDrawerOpen(false);
                                    dispatch(setIsOpen(true));
                                    dispatch(setContent(<form onSubmit={handleSubmit((data) => onSubmit(data, "rejected"))} className="bg-white flex flex-col gap-4 p-4 rounded-lg shadow-md w-full lg:w-[400px]">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-sm text-gray-500">Please enter the reason for rejecting this entry*</span>
                                            <textarea 
                                                className={`w-full p-2 rounded-lg border border-gray-300`} 
                                                rows={4} 
                                                {...register('reason', { required: true, minLength: 10 })} 
                                            />
                                            {errors.reason && <span className="text-red-500 text-sm">Reason is required and must be at least 10 characters long</span>}
                                        </div>
                                        <div className="flex gap-2 lg:flex-row flex-col">
                                            <button type="button" className="w-full bg-white border border-gray-300 hover:bg-gray-50 duration-300 rounded-xl text-gray-500 px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10" onClick={() => dispatch(setIsOpen(false))}>
                                                CANCEL
                                            </button>
                                            <button type="submit" className="w-full bg-red-500 hover:bg-red-500/80 duration-300 rounded-xl text-white px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10">
                                                CONFIRM REJECT
                                            </button>
                                        </div>
                                    </form>));
                                }} disabled={form.status !== 'pending'} className={`w-full ${form.status !== 'pending' ? 'bg-red-500/30 cursor-not-allowed' : 'bg-red-500 hover:bg-red-500/80'} duration-300 rounded-xl text-white px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10`}>
                                    REJECT <MdCancel />
                                </button>
                            </div>
                            <button type="button" className="w-full bg-white border border-gray-300 hover:bg-gray-50 duration-300 rounded-xl text-gray-500 px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10" onClick={() => setDrawerOpen(false)}>
                                CANCEL
                            </button>
                        </div>
                    </form>
                </div>
            </Drawer>
        </>
    );
};

export default EntryPage;
