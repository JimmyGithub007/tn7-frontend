"use client";

import { useEffect, useState } from "react";
import { BiEdit, BiTrash } from "react-icons/bi";
import { useRouter } from "next/navigation";
import { Drawer, TextField, Button, Chip, FormControl, InputLabel, Select, MenuItem, CircularProgress, Autocomplete } from "@mui/material";
import { MdAdd } from "react-icons/md";
import Shell from "@/components/Shell";
import axios from "axios";
import CustomTable, { Column } from "@/components/(widgets)/CustomTable";
import dynamic from 'next/dynamic';
import * as Emoji from "react-quill-emoji";
import "react-quill-emoji/dist/quill-emoji.css";
import { Quill } from "react-quill";
import "./quill-custom.css";
import { unstable_noStore as noStore } from 'next/cache';   

// Dynamically import Quill to avoid SSR issues
//const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
//import 'react-quill/dist/quill.snow.css';
import { setJumpPage } from "@/store/slice/pageSlice";
import { useDispatch } from "react-redux";
// Assuming a shared custom quill css exists or will be created
// import "./quill-custom.css"; 

//Quill.register("modules/emoji", Emoji);

interface Post {
    id: number;
    title: string;
    type: 'blog' | 'announcement' | 'notification';
    status: 'draft' | 'published' | 'scheduled';
    published_at: string;
}

interface PostFormData {
    title: string;
    body: string;
    type: 'blog' | 'announcement' | 'notification';
    status: 'draft' | 'published' | 'scheduled';
    published_at: string | null;
    cta_text: string;
    cta_link: string;
    writer: string;
    meta_tags: string[];
    order: number;
}

const PostManagementPage = () => {
    noStore();

    const dispatch = useDispatch();
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [open, setOpen] = useState<boolean>(false);
    const [editingPost, setEditingPost] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<PostFormData>({
        title: '',
        body: '',
        type: 'blog',
        status: 'draft',
        published_at: null,
        cta_text: '',
        cta_link: '',
        writer: '',
        meta_tags: [],
        order: 0,
    });

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image'],
            ['emoji'],
            ['clean']
        ],
        "emoji-toolbar": true,
        "emoji-textarea": false,
        "emoji-shortname": true,
    };

    const columns: Column[] = [
        {
            id: 'actions',
            name: 'Actions',
            align: 'left',
            sortable: false,
            actions: [
                {
                    label: 'Edit',
                    onClick: (row) => handleEdit(row),
                    className: 'bg-blue-500 hover:bg-blue-600 text-white',
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
            id: "type",
            name: "Type",
            sortable: true,
            align: "center",
            render: (value) => {
                let color: "primary" | "secondary" | "default" = "default";
                if (value === 'blog') color = 'primary';
                if (value === 'announcement') color = 'secondary';
                return <Chip size="small" label={value} color={color} />;
            }
        },
        {
            id: "status",
            name: "Status",
            sortable: true,
            align: "center",
            render: (value) => {
                let color: "success" | "warning" | "default" = "default";
                if (value === 'published') color = 'success';
                if (value === 'scheduled') color = 'warning';
                return <Chip size="small" label={value} color={color} />;
            }
        },
        { id: "published_at", name: "Published At", sortable: true, align: "right", render: (value) => value ? new Date(value).toLocaleString() : 'N/A' },
        { id: "order", name: "Order", sortable: true, align: "right" },
    ];

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('cms_token');
            if (!token) {
                router.push('/cms/login');
                return;
            }
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const resetForm = () => {
        setFormData({
            title: '',
            body: '',
            type: 'blog',
            status: 'draft',
            published_at: null,
            cta_text: '',
            cta_link: '',
            writer: '',
            meta_tags: [],
            order: 0,
        });
    };

    const handleCreate = () => {
        setEditingPost(null);
        resetForm();
        setOpen(true);
    };

    const handleEdit = (post: any) => {
        setEditingPost(post);
        setFormData({
            title: post.title,
            body: post.body,
            type: post.type,
            status: post.status,
            published_at: post.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : null,
            cta_text: post.cta_text || '',
            cta_link: post.cta_link || '',
            writer: post.writer || '',
            meta_tags: post.meta_tags || [],
            order: post.order || 0,
        });
        setOpen(true);
    };

    const handleDelete = async (post: Post) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                const token = localStorage.getItem('cms_token');
                if (!token) {
                    router.push('/cms/login');
                    return;
                }
                await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts/${post.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                fetchPosts(); // Refresh list
            } catch (error) {
                console.error('Error deleting post:', error);
                alert('Failed to delete post.');
            }
        }
    };

    const handleCloseDrawer = () => {
        setOpen(false);
        setEditingPost(null);
        resetForm();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const token = localStorage.getItem('cms_token');
        if (!token) {
            router.push('/cms/login');
            setSaving(false);
            return;
        }

        const submissionData = { ...formData };

        try {
            if (editingPost) {
                // Update
                await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts/${editingPost.id}`, submissionData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                // Create
                await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts`, submissionData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
            fetchPosts();
            handleCloseDrawer();
        } catch (error) {
            console.error('Error saving post:', error);
            alert('Failed to save post.');
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        dispatch(setJumpPage(false))
    }, [])

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Post Management</h1>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<MdAdd />}
                    onClick={handleCreate}
                >
                    Create Post
                </Button>
            </div>
            <CustomTable columns={columns} data={posts} loading={loading} />

            <Drawer anchor="right" open={open} onClose={handleCloseDrawer}>
                <div className="w-[400px] p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingPost ? 'Edit Post' : 'Create Post'}
                    </h2>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <TextField label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} fullWidth required />

                        <div>
                            <InputLabel shrink>Body</InputLabel>
                            {/*<ReactQuill
                                theme="snow"
                                value={formData.body}
                                onChange={(value) => setFormData({ ...formData, body: value })}
                                modules={quillModules}
                                className="quill-editor"
                            />*/}
                            <textarea value={formData.body} onChange={(e) => setFormData({ ...formData, body: e.target.value })} className="w-full h-full" />
                        </div>

                        <FormControl fullWidth required>
                            <InputLabel>Type</InputLabel>
                            <Select value={formData.type} label="Type" onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}>
                                <MenuItem value="blog">Blog</MenuItem>
                                <MenuItem value="announcement">Announcement</MenuItem>
                                <MenuItem value="notification">Notification</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth required>
                            <InputLabel>Status</InputLabel>
                            <Select value={formData.status} label="Status" onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}>
                                <MenuItem value="draft">Draft</MenuItem>
                                <MenuItem value="published">Published</MenuItem>
                                <MenuItem value="scheduled">Scheduled</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Published At"
                            type="datetime-local"
                            value={formData.published_at || ''}
                            onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />

                        {formData.type === 'blog' && (
                            <>
                                <TextField label="Writer" value={formData.writer} onChange={(e) => setFormData({ ...formData, writer: e.target.value })} fullWidth />
                                <Autocomplete
                                    multiple
                                    id="meta-tags-input"
                                    options={[]}
                                    value={formData.meta_tags}
                                    freeSolo
                                    onChange={(event, newValue) => {
                                        setFormData({ ...formData, meta_tags: newValue });
                                    }}
                                    renderTags={(value: readonly string[], getTagProps) =>
                                        value.map((option: string, index: number) => (
                                            <div key={index}>
                                                <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                                            </div>
                                        ))
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="outlined"
                                            label="Meta Tags"
                                            placeholder="Type and press Enter"
                                        />
                                    )}
                                />
                            </>
                        )}

                        {(formData.type === 'announcement' || formData.type === 'notification') && (
                            <>
                                <TextField label="CTA Text" value={formData.cta_text} onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })} fullWidth />
                                <TextField label="CTA Link" value={formData.cta_link} onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })} fullWidth />
                            </>
                        )}

                        <TextField label="Order" type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })} fullWidth />

                        <div className="flex gap-2 mt-6">
                            <Button className="w-full" variant="outlined" onClick={handleCloseDrawer} disabled={saving}>Cancel</Button>
                            <Button className="w-full" type="submit" variant="contained" color="primary" disabled={saving}>
                                {saving ? <CircularProgress size={24} /> : 'Save'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Drawer>
        </>
    );
};

export default PostManagementPage; 