"use client"

import { useEffect, useState, useCallback, useContext } from "react"
import { Button, Drawer, TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment, Tooltip, Chip, CircularProgress } from "@mui/material"
import { useRouter } from 'next/navigation'
import { MdAdd, MdDelete, MdEdit, MdOutlinePassword, MdCloudUpload, MdAdminPanelSettings, MdRemoveCircleOutline } from "react-icons/md"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { IoCloudUploadOutline } from "react-icons/io5"
import CustomTable, { Column } from "@/components/(widgets)/CustomTable"
import axios from 'axios'
import * as z from "zod"
import { useSnackbar } from 'notistack';
import { useDropzone } from 'react-dropzone';
import { IoIosImages } from "react-icons/io"
import { FaUserGear } from "react-icons/fa6"
import { setJumpPage } from "@/store/slice/pageSlice"
import { useDispatch } from "react-redux"

interface Role {
    id: string,
    name: string,
}

interface User {
    id: number
    name: string
    email: string | null
    created_at: string
    roles: Role[]
    bio?: string | null,
    user_no?: string | null,
    profile_picture?: string | null,
}

const tabs = [
    {
        id: 0,
        name: "User",
    },
    {
        id: 1,
        name: "Admin",
    },
]

const UserPage = () => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [tabId, setTabId] = useState(0);
    const router = useRouter();

    const userSchema = z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email address"),
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
            password: '',
            current_password: '',
            new_password: '',
            new_password_confirmation: '',
            roles: [],
            bio: ''
        }
    })

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('cms_token')
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users-list/${tabId === 0 ? 'user' : 'admin'}`, {
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
        } finally {
            setLoading(false)
        }
    }

    const fetchRoles = async () => {
        try {
            const token = localStorage.getItem('cms_token')
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
        }
    }

    const handleCreateUser = () => {
        setEditingUser(null)
        reset({
            name: '',
            email: '',
            password: '',
            current_password: '',
            new_password: '',
            new_password_confirmation: '',
            roles: [],
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
            password: '',
            current_password: '',
            new_password: '',
            new_password_confirmation: '',
            roles: user.roles.map(role => role.id),
            bio: user.bio || ''
        })
        setOpen(true)
    }

    const onSubmit = async (data: UserFormData) => {
        try {
            const token = localStorage.getItem('cms_token')

            const form = new FormData();
            form.append('name', data.name);
            form.append('email', data.email);
            form.append('roles', JSON.stringify(data.roles));
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
                enqueueSnackbar(`${tabId === 0 ? 'User' : 'Admin'} updated successfully`, { variant: 'success' });
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
                enqueueSnackbar(`${tabId === 0 ? 'User' : 'Admin'} created successfully`, { variant: 'success' });
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
                localStorage.removeItem('cms_token')
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
            const token = localStorage.getItem('cms_token')

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
                localStorage.removeItem('cms_token')
                router.push('/cms/login')
            } else {
                setError('Failed to delete user. Please try again.')
                enqueueSnackbar('Failed to delete user. Please try again.', { variant: 'error' });
            }
        }
    }

    useEffect(() => {
        setLoading(true);
        fetchUsers();
    }, [tabId])

    useEffect(() => {
        fetchRoles();
    }, [])

    useEffect(() => {
        dispatch(setJumpPage(false));
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
                    className: "bg-[#45b5d9] hover:bg-[#45b5d9]/80 duration-300 rounded-xl text-white shadow-md",
                    icon: <MdEdit />
                },
                {
                    label: "Inactivate",
                    onClick: (row) => handleDelete(row.id),
                    className: "duration-300 bg-red-500 hover:bg-red-500/80 rounded-xl text-white shadow-md",
                    icon: <MdRemoveCircleOutline />
                }
            ]
        },
        {
            id: "profile_picture",
            name: "Profile",
            sortable: false,
            align: "center",
            render: (value) => (
                <div className="w-10 h-10 rounded-full overflow-hidden hover:scale-110 duration-300 shadow-md cursor-pointer">
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

    const adminColumns: Column[] = [
        {
            id: "actions",
            name: "Actions",
            align: "left",
            sortable: false,
            actions: [
                {
                    label: "Edit",
                    onClick: (row) => handleEdit(row),
                    className: "bg-[#45b5d9] hover:bg-[#45b5d9]/80 duration-300 rounded-xl text-white shadow-md",
                    icon: <MdEdit />
                },
                {
                    label: "Inactivate",
                    onClick: (row) => handleDelete(row.id),
                    className: "duration-300 bg-red-500 hover:bg-red-500/80 rounded-xl text-white shadow-md",
                    icon: <MdRemoveCircleOutline />
                }
            ]
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
        <>
            <div className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 mb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`duration-300 flex items-center gap-2 p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 ${tabId === tab.id ? 'text-gray-600 bg-gray-50' : ''}`}
                        onClick={() => setTabId(tab.id)}
                    >
                        {tab.id === 0 ? <FaUserGear /> : <MdAdminPanelSettings />} {tab.name}
                    </button>
                ))}
            </div>
            <div className="flex h-16 justify-between items-center">
                <h1 className="text-2xl font-semibold">{tabId === 0 ? "User" : "Admin"} Management</h1>
                {
                    tabId === 1 && (
                        <button className={`bg-[#45b5d9] hover:bg-[#45b5d9]/80 duration-300 rounded-xl text-white px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10`}
                            onClick={handleCreateUser}
                        >
                            <MdAdd /> Add New Admin
                        </button>
                    )
                }
            </div>
            {
                tabId === 0 ? (
                    <CustomTable columns={userColumns} data={users} pagination={true} loading={loading} />
                ) : (
                    <CustomTable columns={adminColumns} data={users} pagination={true} loading={loading} />
                )
            }
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
                        {editingUser ? `Edit ${tabId === 0 ? 'User' : 'Admin'} #${editingUser?.user_no}` : `Create ${tabId === 0 ? 'User' : 'Admin'}`}
                    </h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {   tabId === 0 && (
                            <div className="flex flex-col gap-4">
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
                            </div>
                        )}
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
                        {
                            tabId === 0 && (
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
                        )}
                        {   
                            tabId === 1 && (
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
                            )
                        }
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
                            <button
                                type="button"
                                className="w-full bg-white border border-gray-300 hover:bg-gray-50 duration-300 rounded-xl text-gray-500 px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10"
                                onClick={() => {
                                    setOpen(false)
                                    reset()
                                }}
                            >
                                CANCEL
                            </button>
                            <button
                                type="submit"
                                className={`bg-[#45b5d9] hover:bg-[#45b5d9]/80 duration-300 rounded-xl text-white px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10 w-full`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <CircularProgress size={20} /> : "SAVE"}
                            </button>
                        </div>
                    </form>
                </div>
            </Drawer>
        </>
    )
}

export default UserPage
