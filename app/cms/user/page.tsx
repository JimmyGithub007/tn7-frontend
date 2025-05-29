"use client"

import { useEffect, useState, useCallback } from "react"
import { Button, Drawer, TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment, Tooltip, Chip, CircularProgress } from "@mui/material"
import { useRouter } from 'next/navigation'
import { MdAdd, MdDelete, MdEdit, MdOutlinePassword, MdCloudUpload } from "react-icons/md"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { IoCloudUploadOutline, IoShareSocial } from "react-icons/io5"
import { FaDiscord, FaGlobe, FaInstagram, FaTwitter } from "react-icons/fa"
import CustomTable, { Column } from "@/components/CustomTable"
import Shell from "@/components/Shell"
import axios from 'axios'
import * as z from "zod"
import { useSnackbar } from 'notistack';
import { useDropzone } from 'react-dropzone';
import { IoIosImages } from "react-icons/io"

interface Role {
    id: string,
    name: string,
}

interface User {
    id: number
    name: string
    email: string | null
    wallet_address: string | null
    created_at: string
    roles: Role[]
    social_media?: { category: string, url: string }[]
    bio?: string | null,
    user_no?: string | null,
    profile_picture?: string | null,
}

const UserPage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [users, setUsers] = useState<User[]>([])
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [open, setOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const router = useRouter()

    const userSchema = z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email address"),
        wallet_address: z.string().optional(),
        password: z.string().refine(
            (val) => !val || val.length >= 6,
            "Password must be at least 6 characters"
        ).optional(),
        current_password: z.string().optional(),
        new_password: z.string().refine(
            (val) => !val || val.length >= 6,
            "Password must be at least 6 characters"
        ).optional(),
        new_password_confirmation: z.string().optional(),
        roles: z.array(z.string()),
        instagram: z.string().optional(),
        twitter: z.string().optional(),
        discord: z.string().optional(),
        website: z.string().optional(),
        bio: z.string().max(1000, "Bio is too long").optional(),
        profile_picture: z.any().optional(),
    }).refine((data) => {
        if (!editingUser) {
            return !!(data.password);
        }
        return true;
    }, {
        message: "Password is required",
        path: ["password"]
    }).refine((data) => {
        // If current password is filled, new password and confirmation are required
        if (data.current_password) {
            return !!(data.new_password && data.new_password_confirmation);
        }
        return true;
    }, {
        message: "New password are required when current password is provided",
        path: ["new_password"]
    }).refine((data) => {
        // If current password is filled, new password and confirmation are required
        if (data.new_password) {
            return !!(data.new_password_confirmation);
        }
        return true;
    }, {
        message: "New password confirmation is required",
        path: ["new_password_confirmation"]
    }).refine((data) => {
        // If new password is provided, it must match confirmation
        if (data.new_password && data.new_password_confirmation) {
            return data.new_password === data.new_password_confirmation;
        }
        return true;
    }, {
        message: "Passwords do not match",
        path: ["new_password_confirmation"]
    }).refine((data) => {
        if (data.new_password || data.new_password_confirmation) {
            return !!(data.current_password);
        }
        return true;
    }, {
        message: "Current password is required",
        path: ["current_password"]
    });

    type UserFormData = z.infer<typeof userSchema>;

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: '',
            email: '',
            wallet_address: '',
            password: '',
            current_password: '',
            new_password: '',
            new_password_confirmation: '',
            roles: [],
            instagram: '',
            twitter: '',
            discord: '',
            website: '',
            bio: ''
        }
    })

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                setError('No authentication token found')
                router.push('/cms/login')
                return
            }

            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            setUsers(response.data)
            setError(null)
        } catch (error: any) {
            console.error('Error fetching users:', error)
            if (error.response?.status === 401) {
                setError('Authentication failed. Please login again.')
                localStorage.removeItem('token')
                router.push('/cms/login')
            } else {
                setError('Failed to fetch users. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    const fetchRoles = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                setError('No authentication token found')
                router.push('/cms/login')
                return
            }

            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/roles`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            setRoles(response.data)
        } catch (error: any) {
            console.error('Error fetching roles:', error)
            if (error.response?.status === 401) {
                setError('Authentication failed. Please login again.')
                localStorage.removeItem('token')
                router.push('/cms/login')
            } else {
                setError('Failed to fetch roles. Please try again.')
            }
        }
    }

    const handleCreateUser = () => {
        setEditingUser(null)
        reset({
            name: '',
            email: '',
            wallet_address: '',
            password: '',
            current_password: '',
            new_password: '',
            new_password_confirmation: '',
            roles: [],
            instagram: '',
            twitter: '',
            discord: '',
            website: '',
            bio: ''
        })
        setOpen(true)
    }

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles[0]) {
            setImageFile(acceptedFiles[0]);
            setImagePreview(URL.createObjectURL(acceptedFiles[0]));
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif']
        },
        maxFiles: 1,
        maxSize: 5242880, // 5MB
    });

    const handleEdit = (user: User) => {
        setEditingUser(user)
        setImagePreview(user?.profile_picture ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${user.profile_picture}` : null);
        setImageFile(null);
        reset({
            name: user.name,
            email: user.email || '',
            wallet_address: user.wallet_address || '',
            password: '',
            current_password: '',
            new_password: '',
            new_password_confirmation: '',
            roles: user.roles.map(role => role.id),
            instagram: user.social_media?.find(sm => sm.category === 'instagram')?.url || '',
            twitter: user.social_media?.find(sm => sm.category === 'twitter')?.url || '',
            discord: user.social_media?.find(sm => sm.category === 'discord')?.url || '',
            website: user.social_media?.find(sm => sm.category === 'website')?.url || '',
            bio: user.bio || ''
        })
        setOpen(true)
    }

    const onSubmit = async (data: UserFormData) => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                setError('No authentication token found')
                router.push('/cms/login')
                return
            }

            const form = new FormData();
            form.append('name', data.name);
            form.append('email', data.email);
            form.append('wallet_address', data.wallet_address || '');
            form.append('roles', JSON.stringify(data.roles));
            form.append('instagram', data.instagram || '');
            form.append('twitter', data.twitter || '');
            form.append('discord', data.discord || '');
            form.append('website', data.website || '');
            form.append('bio', data.bio || '');

            if (imageFile) {
                const blob = new Blob([imageFile], { type: imageFile.type });
                form.append('profile_picture', blob, imageFile.name);
            }

            // Add password for new user
            if (!editingUser) {
                if (!data.password) {
                    setError('Password is required for new users')
                    return
                }
                form.append('password', data.password);
            }

            // Only include password fields if they are all filled
            if (data.current_password && data.new_password && data.new_password_confirmation) {
                form.append('current_password', data.current_password);
                form.append('new_password', data.new_password);
                form.append('new_password_confirmation', data.new_password_confirmation);
            }

            if (editingUser) {
                // Update existing user
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${editingUser.id}`,
                    form,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                )
                setUsers(users.map(user => user.id === editingUser.id ? response.data : user))
                enqueueSnackbar('User updated successfully', { variant: 'success' });
            } else {
                // Create new user
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`,
                    form,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                )
                setUsers([...users, response.data])
                enqueueSnackbar('User created successfully', { variant: 'success' });
            }

            setOpen(false)
            reset()
            setImageFile(null);
            setImagePreview(null);
            setError(null)
        } catch (error: any) {
            console.error('Error saving user:', error)
            if (error.response?.status === 422) {
                if (error.response.data.message === 'Current password is incorrect') {
                    setError(error.response.data.message)
                    enqueueSnackbar(error.response.data.message, { variant: 'error' });
                } else {
                    setError(error.response.data.message)
                    enqueueSnackbar(error.response.data.message, { variant: 'error' });
                }
            } else if (error.response?.status === 401) {
                setError('Authentication failed. Please login again.')
                localStorage.removeItem('token')
                router.push('/cms/login')
            } else {
                setError('Failed to save user. Please try again.')
                enqueueSnackbar('Failed to save user. Please try again.', { variant: 'error' });
            }
        }
    }

    const handleDelete = async (userId: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return

        try {
            const token = localStorage.getItem('token')
            if (!token) {
                setError('No authentication token found')
                router.push('/cms/login')
                return
            }

            await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            setUsers(users.filter(user => user.id !== userId))
            setError(null)
            enqueueSnackbar('User deleted successfully', { variant: 'success' });
        } catch (error: any) {
            console.error('Error deleting user:', error)
            if (error.response?.status === 401) {
                setError('Authentication failed. Please login again.')
                localStorage.removeItem('token')
                router.push('/cms/login')
            } else {
                setError('Failed to delete user. Please try again.')
                enqueueSnackbar('Failed to delete user. Please try again.', { variant: 'error' });
            }
        }
    }

    useEffect(() => {
        fetchUsers()
        fetchRoles()
    }, [])

    const userColumns: Column[] = [
        {
            id: "actions",
            name: "Actions",
            align: "left",
            sortable: false,
            actions: [
                {
                    label: "Edit",
                    onClick: (row) => handleEdit(row),
                    className: "bg-blue-500 hover:bg-blue-600 text-white",
                    icon: <MdEdit />
                },
                {
                    label: "Delete",
                    onClick: (row) => handleDelete(row.id),
                    className: "bg-red-500 hover:bg-red-600 text-white",
                    icon: <MdDelete />
                }
            ]
        },
        {
            id: "profile_picture",
            name: "Profile",
            sortable: false,
            align: "center",
            render: (value) => (
                <div className="w-10 h-10 rounded-full overflow-hidden">
                    {value ? (
                        <img 
                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${value}`} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No image</span>
                        </div>
                    )}
                </div>
            )
        },
        { id: "user_no", name: "User No", sortable: true, align: "left",
            render: (value) => (
                <div className="text-sm text-gray-500">
                    #{value}
                </div>
            )
        },
        { id: "name", name: "Name", sortable: true, align: "left" },
        { id: "email", name: "Email", sortable: true, align: "left" },
        {
            id: "social_media",
            name: "Social Media",
            sortable: false,
            align: "left",
            render: (value) => (
                <div className="flex gap-2">
                    {Array.isArray(value) && value.length > 0
                        ? value.map(sm => {
                            let icon = null;
                            if (sm.category === "instagram") icon = <FaInstagram className="text-pink-500" />;
                            if (sm.category === "twitter") icon = <FaTwitter className="text-blue-400" />;
                            if (sm.category === "discord") icon = <FaDiscord className="text-indigo-500" />;
                            if (sm.category === "website") icon = <FaGlobe className="text-gray-500" />;
                            return (
                                <Tooltip className="cursor-pointer duration-300 hover:opacity-80" key={sm.id} title={sm.url || ""} arrow>
                                    <span>{icon}</span>
                                </Tooltip>
                            );
                        })
                        : <span>-</span>
                    }
                </div>
            )
        },
        {
            id: "roles",
            name: "Roles",
            sortable: false,
            align: "center",
            render: (value) => (
                <div className="flex gap-1 flex-wrap">
                    {value.map((role: Role) => (
                        <Chip
                            key={role.id}
                            label={role.name}
                            size="small"
                            className="bg-blue-100 text-blue-800"
                        />
                    ))}
                </div>
            )
        },
        {
            id: "nfts",
            name: "NFTs",
            sortable: true,
            align: "right",
            render: () => 0
        },
        {
            id: "points",
            name: "Points",
            sortable: true,
            align: "right",
            render: () => 0
        },
        {
            id: "points",
            name: "Points",
            sortable: true,
            align: "right",
            render: () => 0
        },
        {
            id: "created_at",
            name: "Created At",
            sortable: true,
            align: "right",
            render: (value) => new Date(value).toLocaleDateString()
        },
        {
            id: "updated_at",
            name: "Updated At",
            sortable: true,
            align: "right",
            render: (value) => new Date(value).toLocaleDateString()
        },
    ];

    return (
        <Shell>
            <div className="flex h-16 justify-between items-center">
                <h1 className="text-2xl font-semibold">User Management</h1>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCreateUser}
                    startIcon={<MdAdd />}
                >
                    Add New User
                </Button>
            </div>
            <CustomTable columns={userColumns} data={users} pagination={true} loading={loading} />
            <Drawer
                anchor="right"
                open={open}
                onClose={() => {
                    setOpen(false)
                    reset()
                    setImageFile(null);
                    setImagePreview(null);
                }}
            >
                <div className="w-[400px] p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingUser ? 'Edit User #'+editingUser?.user_no : 'Create User'}
                    </h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="text-lg font-semibold flex items-center gap-2"><IoIosImages className="text-2xl" /> Profile Picture</div>
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
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Name"
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                />
                            )}
                        />
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                />
                            )}
                        />
                        <FormControl fullWidth>
                            <Controller
                                name="bio"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Bio"
                                        multiline
                                        minRows={3}
                                        maxRows={6}
                                        error={!!errors.bio}
                                        helperText={errors.bio?.message}
                                    />
                                )}
                            />
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Roles</InputLabel>
                            <Controller
                                name="roles"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        multiple
                                        label="Roles"
                                        error={!!errors.roles}
                                        value={field.value || []}
                                        onChange={(e) => {
                                            console.log(e.target.value);
                                            field.onChange(e.target.value);
                                        }}
                                    >
                                        {roles.map((role) => (
                                            <MenuItem key={role.id} value={role.id}>
                                                {role.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                        </FormControl>
                        <div className="border border-gray-200 flex flex-col gap-4 p-4 rounded-md shadow-sm">
                            <div className="text-lg font-semibold flex items-center gap-2"><IoShareSocial className="text-2xl" /> Social Media</div>
                            <Controller
                                name="instagram"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Instagram URL"
                                        error={!!errors.instagram}
                                        helperText={errors.instagram?.message}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FaInstagram />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                )}
                            />
                            <Controller
                                name="twitter"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Twitter URL"
                                        error={!!errors.twitter}
                                        helperText={errors.twitter?.message}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FaTwitter />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                )}
                            />
                            <Controller
                                name="discord"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Discord URL"
                                        error={!!errors.discord}
                                        helperText={errors.discord?.message}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FaDiscord />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                )}
                            />
                            <Controller
                                name="website"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Website URL"
                                        error={!!errors.website}
                                        helperText={errors.website?.message}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FaGlobe />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                )}
                            />
                        </div>
                        {!editingUser ?
                            <Controller
                                name="password"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Password"
                                        type="password"
                                        error={!!errors.password}
                                        helperText={errors.password?.message}
                                    />
                                )}
                            />
                            : (
                                <div className="border border-gray-200 flex flex-col gap-4 p-4 rounded-md shadow-sm">
                                    <div className="text-lg font-semibold flex items-center gap-2"><MdOutlinePassword className="text-2xl" /> Update Password</div>
                                    <Controller
                                        name="current_password"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                label="Current Password"
                                                type="password"
                                                error={!!errors.current_password}
                                                helperText={errors.current_password?.message}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="new_password"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                label="New Password"
                                                type="password"
                                                error={!!errors.new_password}
                                                helperText={errors.new_password?.message}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="new_password_confirmation"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                label="Confirm New Password"
                                                type="password"
                                                error={!!errors.new_password_confirmation}
                                                helperText={errors.new_password_confirmation?.message}
                                            />
                                        )}
                                    />
                                </div>
                            )}
                        <div className="flex gap-2">
                            <Button
                                className="w-full"
                                variant="outlined"
                                onClick={() => {
                                    setOpen(false)
                                    reset()
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="w-full"
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <CircularProgress size={20} /> : "Save"}
                            </Button>
                        </div>
                    </form>
                </div>
            </Drawer>
        </Shell>
    )
}

export default UserPage
