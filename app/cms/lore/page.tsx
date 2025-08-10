"use client"

import { useEffect, useState, useCallback } from "react";
import { BiEdit, BiTrash } from "react-icons/bi";
import { IoCloudUploadOutline } from "react-icons/io5";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { Drawer, TextField, Button, FormControl, InputLabel, Select, MenuItem, Chip, CircularProgress } from "@mui/material";

import Shell from "@/components/Shell";
import axios from "axios";
import CustomTable, { Column } from "@/components/(widgets)/CustomTable";
import dynamic from 'next/dynamic';

// Import Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import "./quill-custom.css";
import { MdAdd } from "react-icons/md";
import { setJumpPage } from "@/store/slice/pageSlice";
import { useDispatch } from "react-redux";

const tabs = [
    {
        id: 0,
        name: "Categories",
    },
    {
        id: 1,
        name: "Listed Item",
    },
]

interface LoreFormData {
    title: string;
    status: string;
    sorted_index: number;
}

interface LoreItemFormData {
    lore_id: string;
    title: string;
    content: string;
    status: string;
    sorted_index: number;
}

const LoreManagementPage = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const [tabId, setTabId] = useState<number>(0);
    const [lores, setLores] = useState<any[]>([]);
    const [loreItems, setLoreItems] = useState<any[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const [editingLore, setEditingLore] = useState<any>(null);
    const [editingLoreItem, setEditingLoreItem] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState<LoreFormData>({
        title: '',
        status: 'active',
        sorted_index: 0
    });
    const [loreItemFormData, setLoreItemFormData] = useState<LoreItemFormData>({
        lore_id: '',
        title: '',
        content: '',
        status: 'active',
        sorted_index: 0
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isCreatingLoreItem, setIsCreatingLoreItem] = useState(false);
    const [saving, setSaving] = useState(false);

    const loresColumns: Column[] = [
        {
            id: 'actions',
            name: 'Actions',
            align: 'left',
            sortable: false,
            actions: [
                {
                    label: 'Edit',
                    onClick: (row) => handleEdit(row),
                    className: 'bg-[#45b5d9] hover:bg-[#45b5d9]/80 duration-300 rounded-xl text-white shadow-md',
                    icon: <BiEdit />
                },
                {
                    label: 'Delete',
                    onClick: (row) => handleDelete(row),
                    className: 'bg-red-500 hover:bg-red-600 text-white',
                    icon: <BiTrash />
                }
            ]
        },
        { id: "title", name: "Title", sortable: true, align: "left" },
        { 
            id: "status", 
            name: "Status", 
            sortable: true, 
            align: "center",
            render: (value) => <Chip size="small" variant="outlined" label={value == "active" ? 'Active' : 'Inactive'} color={value == "active" ? 'success' : 'error'} />
        },
        { id: "sorted_index", name: "Sorted Index", sortable: true, align: "right" },
    ];

    const loreItemsColumns: Column[] = [
        {
            id: 'actions',
            name: 'Actions',
            align: 'left',
            sortable: false,
            actions: [
                {
                    label: 'Edit',
                    onClick: (row) => handleEditLoreItem(row),
                    className: 'bg-blue-500 hover:bg-blue-600 text-white',
                    icon: <BiEdit />
                },
                {
                    label: 'Delete',
                    onClick: (row) => handleDeleteLoreItem(row),
                    className: 'bg-red-500 hover:bg-red-600 text-white',
                    icon: <BiTrash />
                }
            ]
        },
        { id: "title", name: "Title", sortable: true, align: "left" },
        { id: "category", name: "Category", sortable: true, align: "left" },
        {
            id: "image",
            name: "Image",
            sortable: false,
            align: "center",
            render: (value) =>
                value ? (
                    <a href={`${process.env.NEXT_PUBLIC_BACKEND_URL}${value}`} target="_blank" rel="noopener noreferrer">
                        <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${value}`} alt="lore item" className="w-10 h-10 object-cover rounded-sm shadow-lg" />
                    </a>
                ) : null
        },
        { 
            id: "status", 
            name: "Status", 
            sortable: true, 
            align: "center",
            render: (value) => <Chip size="small" variant="outlined" label={value == "active" ? 'Active' : 'Inactive'} color={value == "active" ? 'success' : 'error'} />
        },
        { id: "sorted_index", name: "Sorted Index", sortable: true, align: "right" },
    ];

    const handleEdit = (row: any) => {
        setEditingLore(row);
        setFormData({
            title: row.title,
            status: row.status,
            sorted_index: row.sorted_index
        });
        setOpen(true);
    }

    const handleEditLoreItem = (row: any) => {
        setEditingLoreItem(row);
        setLoreItemFormData({
            lore_id: row.lore_id,
            title: row.title,
            content: row.content,
            status: row.status,
            sorted_index: row.sorted_index
        });
        setImagePreview(process.env.NEXT_PUBLIC_BACKEND_URL + row.image || null);
        setImageFile(null);
        setOpen(true);
    }

    const handleDelete = async (row: any) => {
        if (window.confirm('Are you sure you want to delete this lore?')) {
            try {
                const token = localStorage.getItem('cms_token');
                if (!token) {
                    router.push('/cms/login');
                    return;
                }

                await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lores/${row.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                // Refresh the list
                fetchLores(token);
            } catch (error) {
                console.error('Error deleting lore:', error);
                alert('Failed to delete lore');
            }
        }
    }

    const handleDeleteLoreItem = async (row: any) => {
        if (window.confirm('Are you sure you want to delete this lore item?')) {
            try {
                const token = localStorage.getItem('cms_token');
                if (!token) {
                    router.push('/cms/login');
                    return;
                }

                await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lore-items/${row.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                // Refresh the list
                fetchLoreItems(token);
            } catch (error) {
                console.error('Error deleting lore item:', error);
                alert('Failed to delete lore item');
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('cms_token');
            if (!token) {
                router.push('/cms/login');
                return;
            }

            // Update existing lore
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lores/${editingLore.id}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update the local state with the response data
            setLores(prevLores => 
                prevLores.map(lore => 
                    lore.id === editingLore.id ? response.data : lore
                )
            );

            // Close drawer and reset form
            setOpen(false);
            resetForm();
        } catch (error) {
            console.error('Error saving lore:', error);
            alert('Failed to save lore');
        } finally {
            setSaving(false);
        }
    }

    const handleCreateLoreItem = () => {
        setEditingLoreItem(null);
        setLoreItemFormData({
            lore_id: '',
            title: '',
            content: '',
            status: 'active',
            sorted_index: 0
        });
        setImageFile(null);
        setImagePreview(null);
        setIsCreatingLoreItem(true);
        setOpen(true);
    };

    const handleLoreItemSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('cms_token');
            if (!token) {
                router.push('/cms/login');
                return;
            }

            const form = new FormData();
            form.append('lore_id', loreItemFormData.lore_id);
            form.append('title', loreItemFormData.title);
            form.append('content', loreItemFormData.content);
            form.append('status', loreItemFormData.status.toString());
            form.append('sorted_index', loreItemFormData.sorted_index.toString());
            if (imageFile) {
                form.append('image', imageFile);
            }

            let response;
            if (isCreatingLoreItem) {
                response = await axios.post(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lore-items`,
                    form,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
            } else {
                response = await axios.post(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lore-items/${editingLoreItem.id}?_method=PUT`,
                    form,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
            }

            if (isCreatingLoreItem) {
                setLoreItems(prevItems => [response.data, ...prevItems]);
            } else {
                setLoreItems(prevItems =>
                    prevItems.map(item =>
                        item.id === editingLoreItem.id ? response.data : item
                    )
                );
            }

            setOpen(false);
            setIsCreatingLoreItem(false);
            resetLoreItemForm();
        } catch (error) {
            console.error('Error saving lore item:', error);
            alert('Failed to save lore item');
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setEditingLore(null);
        setFormData({
            title: '',
            status: 'active',
            sorted_index: 0
        });
    }

    const resetLoreItemForm = () => {
        setEditingLoreItem(null);
        setLoreItemFormData({
            lore_id: '',
            title: '',
            content: '',
            status: 'active',
            sorted_index: 0
        });
        setImageFile(null);
        setImagePreview(null);
    }

    const fetchLores = async (token: string) => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lores`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            setLores(response.data);
        } catch (error) {
            console.error('Error fetching lores:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLoreItems = async (token: string) => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lore-items`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            setLoreItems(response.data);
        } catch (error) {
            console.error('Error fetching lore items:', error);
        } finally {
            setLoading(false);
        }
    };

    // Dropzone for image upload
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles[0]) {
            setImageFile(acceptedFiles[0]);
            setImagePreview(URL.createObjectURL(acceptedFiles[0]));
        }
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false
    });

    // Preprocess loreItems to add a category field for the table
    const loreItemsWithCategory = loreItems.map(item => ({
        ...item,
        category: item.lore?.title || "-"
    }));

    useEffect(() => {
        const token = localStorage.getItem('cms_token');
        if (!token) {
            router.push('/cms/login');
            return;
        }

        if (tabId == 0) {
            fetchLores(token);
        } else {
            fetchLoreItems(token);
        }
    }, [tabId]);

    useEffect(() => {
        dispatch(setJumpPage(false))
    }, [])

    return (<>
        <div className="flex h-16 justify-between items-center">
            <h1 className="text-2xl font-semibold">Lore Management</h1>
            {tabId === 1 && (
                <button className={`bg-[#45b5d9] hover:bg-[#45b5d9]/80 duration-300 rounded-xl text-white px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10`}
                    onClick={() => handleCreateLoreItem()}
                >
                    <MdAdd /> Add New Lore
                </button>
            )}
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
            tabId == 0 ? (
                <CustomTable columns={loresColumns} data={lores} pagination={true} loading={loading} />
            ) : (
                <CustomTable columns={loreItemsColumns} data={loreItemsWithCategory} pagination={true} loading={loading} />
            )
        }
        <Drawer
            anchor="right"
            open={open}
            onClose={() => {
                setOpen(false);
                setIsCreatingLoreItem(false);
                if (tabId === 0) {
                    resetForm();
                } else {
                    resetLoreItemForm();
                }
            }}
        >
            <div className="w-[400px] p-6">
                <h2 className="text-xl font-semibold mb-4">
                    {tabId === 0 ? 'Edit Lore' : isCreatingLoreItem ? 'Create Lore Item' : 'Edit Lore Item'}
                </h2>
                {tabId === 0 ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <TextField
                            fullWidth
                            label="Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={formData.status}
                                label="Status"
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <MenuItem value={"active"}>Active</MenuItem>
                                <MenuItem value={"inactive"}>Inactive</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Sorted Index"
                            type="number"
                            value={formData.sorted_index}
                            onChange={(e) => setFormData({ ...formData, sorted_index: Number(e.target.value) })}
                            required
                        />
                        <div className="flex gap-2 mt-6">
                            <button
                                type="button"
                                className="w-full bg-white border border-gray-300 hover:bg-gray-50 duration-300 rounded-xl text-gray-500 px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10"
                                onClick={() => {
                                    setOpen(false);
                                    resetForm();
                                }}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                className="w-full bg-[#45b5d9] hover:bg-[#45b5d9]/80 duration-300 rounded-xl text-white px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10"
                                type="submit"
                                disabled={saving}
                            >
                                {saving ? <CircularProgress size={20} /> : "Save"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleLoreItemSubmit} className="space-y-4">
                        <FormControl fullWidth>
                            <InputLabel>Lore</InputLabel>
                            <Select
                                value={loreItemFormData.lore_id}
                                label="Lore"
                                onChange={(e) => setLoreItemFormData({ ...loreItemFormData, lore_id: e.target.value })}
                                required
                            >
                                {lores.map((lore) => (
                                    <MenuItem key={lore.id} value={lore.id}>
                                        {lore.title}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Title"
                            value={loreItemFormData.title}
                            onChange={(e) => setLoreItemFormData({ ...loreItemFormData, title: e.target.value })}
                            required
                        />
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Content</label>
                            <div>
                                <ReactQuill
                                    theme="snow"
                                    value={loreItemFormData.content}
                                    onChange={(content: string) => setLoreItemFormData({ ...loreItemFormData, content })}
                                    modules={{
                                        toolbar: [
                                            [{ 'header': [false] }],
                                            ['bold', 'italic', 'underline', 'strike'],
                                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                            [{ 'color': [] }, { 'background': [] }],
                                            ['link'],
                                            ['clean']
                                        ]
                                    }}
                                    className="quill-editor"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Image</label>
                            <div {...getRootProps()} className={`border-2 border-dashed rounded p-4 text-center cursor-pointer ${isDragActive ? 'border-blue-500' : 'border-gray-300'}`}> 
                                <input {...getInputProps()} />
                                {isDragActive ? (
                                    <p>Drop the image here ...</p>
                                ) : (
                                    <p>Drag &apos;n&apos; drop an image here, or click to select</p>
                                )}
                                {imagePreview ? (
                                    <div className="mt-2">
                                        <img src={imagePreview} alt="Preview" className="mx-auto w-32 h-32 object-cover rounded" />
                                    </div>
                                ) : (
                                    <IoCloudUploadOutline className="text-gray-500 w-32 h-32 mx-auto" />
                                )}
                            </div>
                        </div>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={loreItemFormData.status}
                                label="Status"
                                onChange={(e) => setLoreItemFormData({ ...loreItemFormData, status: e.target.value })}
                            >
                                <MenuItem value={"active"}>Active</MenuItem>
                                <MenuItem value={"inactive"}>Inactive</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Sorted Index"
                            type="number"
                            value={loreItemFormData.sorted_index}
                            onChange={(e) => setLoreItemFormData({ ...loreItemFormData, sorted_index: Number(e.target.value) })}
                            required
                        />
                        <div className="flex gap-2 mt-6">
                            <button
                                type="button"
                                className="w-full bg-white border border-gray-300 hover:bg-gray-50 duration-300 rounded-xl text-gray-500 px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10"
                                onClick={() => {
                                    setOpen(false);
                                    resetLoreItemForm();
                                }}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                className="w-full bg-[#45b5d9] hover:bg-[#45b5d9]/80 duration-300 rounded-xl text-white px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10"
                                type="submit"
                                disabled={saving}
                            >
                                {saving ? <CircularProgress size={20} /> : "Save"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </Drawer>
    </>)
}

export default LoreManagementPage;
