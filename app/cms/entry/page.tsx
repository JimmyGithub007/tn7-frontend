"use client";

import { useEffect, useState } from "react";
import CustomTable, { Column } from "@/components/CustomTable";
import { Button, Drawer, TextField, MenuItem, FormControl, InputLabel, Select } from "@mui/material";
import axios from "axios";
import Shell from "@/components/Shell";
import { MdCancel } from "react-icons/md";
import { FaClipboardList } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { TbCancel } from "react-icons/tb";

interface Entry {
    id: string;
    entry_no: string;
    title: string;
    content: string;
    status: number;
    author: { id: string; name: string };
    category?: { id: string; name: string };
    created_at: string;
}

const statusMap = {
    0: "Draft",
    1: "Pending",
    2: "Approved",
    3: "Rejected"
};

const defaultForm = {
    title: "",
    content: "",
    status: 0,
    author_id: "",
    category_id: ""
};

const EntryPage = () => {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [form, setForm] = useState<any>(defaultForm);
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
    // TODO: Replace with your actual author/category list
    const [authors, setAuthors] = useState<{id: string, name: string}[]>([]);
    const [categories, setCategories] = useState<{id: string, name: string}[]>([
        { id: "1", name: "Text Base Story" },
        { id: "2", name: "Image" },
        { id: "3", name: "Video" },
    ]);

    // 获取所有条目
    const fetchEntries = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/entries`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEntries(res.data);
        } catch (e) {
            // 错误处理
        } finally {
            setLoading(false);
        }
    };

    // 获取所有用户作为作者选项
    const fetchAuthors = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // 假设后端返回的 user 有 id 和 name 字段
            setAuthors(res.data.map((u: any) => ({ id: u.id, name: u.name })));
        } catch (e) {
            // 错误处理
        }
    };

    // 删除条目
    const handleDelete = async (id: string) => {
        if (!confirm("确定要删除该条目吗？")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/entries/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEntries(entries.filter(e => e.id !== id));
        } catch (e) {
            // 错误处理
        }
    };

    const handleOpenCreate = () => {
        setEditingEntry(null);
        setForm(defaultForm);
        setDrawerOpen(true);
    };

    const handleOpenEdit = (entry: Entry) => {
        setEditingEntry(entry);
        setForm({
            title: entry.title,
            content: entry.content,
            status: entry.status,
            author_id: entry.author?.id || "",
            category_id: entry.category?.id || ""
        });
        setDrawerOpen(true);
    };

    const handleFormChange = (e: any) => {
        const { name, value } = e.target;
        setForm((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        try {
            if (editingEntry) {
                // Edit
                const res = await axios.put(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/entries/${editingEntry.id}`,
                    form,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setEntries((prev) =>
                    prev.map((item) => (item.id === editingEntry.id ? res.data : item))
                );
            } else {
                // Create
                const res = await axios.post(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/entries`,
                    form,
                    { headers: { 
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    } }
                );
                setEntries((prev) => [res.data, ...prev]);
            }
            setDrawerOpen(false);
            setEditingEntry(null);
            setForm(defaultForm);
        } catch (e) {
            // 错误处理
            console.error(e);
        }
    };

    useEffect(() => {
        fetchEntries();
        fetchAuthors();
        // TODO: fetchCategories();
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
                    className: "bg-blue-500 hover:bg-blue-600 text-white"
                }
            ]
        },
        { id: "entry_no", name: "Entry No", sortable: true, align: "left" },
        { id: "title", name: "Title", sortable: true, align: "left" },
        { id: "author", name: "Author", sortable: false, align: "left", render: (value) => value?.name || "-" },
        { id: "category", name: "Category", sortable: false, align: "left", render: (value) => value?.name || "-" },
        { id: "status", name: "Status", sortable: true, align: "center", render: (value: number) => statusMap[value as keyof typeof statusMap] },
        { id: "created_at", name: "Created At", sortable: true, align: "center", render: (value) => new Date(value).toLocaleString() },
    ];

    return (
        <Shell>
            <div className="flex h-16 justify-between items-center">
                <h1 className="text-2xl font-semibold">Entry Management</h1>
            </div>
            <div className="grid grid-cols-3 gap-4 my-4">
                <div className="bg-white flex flex-col items-center justify-center h-36 p-4 rounded-lg shadow-sm relative overflow-hidden">
                    <span>Pending</span>
                    <span className="text-4xl font-bold">0</span>
                    <FaClipboardList size={100} className="absolute -bottom-4 -right-4 text-slate-100" />
                </div>
                <div className="bg-white flex flex-col items-center justify-center h-36 p-4 rounded-lg shadow-sm relative overflow-hidden">
                    <span>Approved</span>
                    <span className="text-4xl font-bold">0</span>
                    <FaCheckCircle size={100} className="absolute -bottom-4 -right-4 text-slate-100" />
                </div>
                <div className="bg-white flex flex-col items-center justify-center h-36 p-4 rounded-lg shadow-sm relative overflow-hidden">
                    <span>Rejected</span>
                    <span className="text-4xl font-bold">0</span>
                    <TbCancel size={120} className="absolute -bottom-6 -right-6 text-slate-100" />
                </div>
            </div>
            <CustomTable columns={columns} data={entries} pagination={true} />
            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <div className="w-[400px] p-6">
                    <h2 className="text-xl font-semibold mb-4"># {editingEntry?.entry_no}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <TextField
                            fullWidth
                            label="Title"
                            name="title"
                            value={form.title}
                            onChange={handleFormChange}
                            disabled={true}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Content"
                            name="content"
                            value={form.content}
                            onChange={handleFormChange}
                            multiline
                            rows={4}
                            required
                        />
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                value={form.status}
                                label="Status"
                                onChange={handleFormChange}
                                disabled={true}
                            >
                                <MenuItem value={1}>Pending</MenuItem>
                                <MenuItem value={2}>Approved</MenuItem>
                                <MenuItem value={3}>Rejected</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Author</InputLabel>
                            <Select
                                name="author_id"
                                value={form.author_id}
                                label="Author"
                                onChange={handleFormChange}
                                required
                                disabled={true}
                            >
                                {authors.map((a) => (
                                    <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                name="category_id"
                                value={form.category_id}
                                label="Category"
                                onChange={handleFormChange}
                                disabled={true}
                            >
                                <MenuItem value="">None</MenuItem>
                                {categories.map((c) => (
                                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-2">
                                <Button disabled={true} className="w-full" type="submit" variant="contained" color="primary">
                                    Approve
                                </Button>
                                <Button disabled={true} className="w-full" type="submit" variant="contained" color="error">
                                    Reject
                                </Button>
                            </div>
                            <Button variant="outlined" onClick={() => setDrawerOpen(false)}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </Drawer>
        </Shell>
    );
};

export default EntryPage;
