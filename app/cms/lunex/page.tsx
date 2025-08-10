"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Drawer, TextField, Button, IconButton, Chip, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { MdAdd, MdDelete, MdRefresh } from "react-icons/md";

import Shell from "@/components/Shell";
import { useDispatch } from "react-redux";
import { setJumpPage } from "@/store/slice/pageSlice";
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { motion } from "framer-motion";
import CustomTable, { Column } from "@/components/(widgets)/CustomTable";
import axios from "axios";
import { useSnackbar } from "notistack";

const tabs = [
    {
        id: 0,
        name: "Lunex Transaction History",
    },
    {
        id: 1,
        name: "Auto Assign Lunex Rule Settings",
    },
    {
        id: 2,
        name: "Manual Assign Lunex",
    },
]

const AssignLunexForm = ({ setOpen, open, onSuccess }: { setOpen: (open: boolean) => void, open: boolean, onSuccess: () => void }) => {

    const [users, setUsers] = useState<any[]>([]);
    const { control, handleSubmit, formState: { errors }, reset, watch, getValues } = useForm({
        defaultValues: {
            user: '',
            points: 0,
            description: ''
        }
    });

    const onSubmit = async (data: any) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lunex/assign`, {
                user_id: data.user,
                points: data.points,
                description: data.description
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })
            if (response.data.success) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error assigning lunex:', error);
        } finally {
            setOpen(false);
            reset();
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('cms_token');

            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users-list/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })
            setUsers(response.data);
        }
        if (open) {
            fetchUsers();
        }
    }, [open]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
            <FormControl fullWidth required>
                <InputLabel>User</InputLabel>
                <Controller
                    name="user"
                    control={control}
                    render={({ field }) => <Select {...field} label="User" fullWidth>
                        {users.map((user) => (
                            <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
                        ))}
                    </Select>}
                />
            </FormControl>
            <Controller
                name="points"
                control={control}
                render={({ field }) => <TextField {...field} label="Points" required />}
            />
            <Controller
                name="description"
                control={control}
                render={({ field }) => <TextField {...field} label="Description" multiline rows={4} required />}
            />
            <div className="flex gap-2">
                <button type="button" className="w-full bg-white border border-gray-300 hover:bg-gray-50 duration-300 rounded-xl text-gray-500 px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10" onClick={() => setOpen(false)}>
                    CANCEL
                </button>
                <button type="submit" className="w-full bg-[#45b5d9] hover:bg-[#45b5d9]/80 duration-300 rounded-xl text-white px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10">
                    ASSIGN
                </button>
            </div>
        </form>
    )
}

const LunexManagementPage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();
    const dispatch = useDispatch();
    const [tabId, setTabId] = useState<number>(0);
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [manualAssignTransactions, setManualAssignTransactions] = useState<any[]>([]);

    const transactionColumns: Column[] = [
        { id: 'user', name: 'User', sortable: true, align: 'left', render: (value) => value.name },
        { id: 'points', name: 'Lunex Points', sortable: true, align: 'right' },
        { id: 'description', name: 'Description', sortable: true, align: 'left' },
        { id: 'type', name: 'Type', sortable: true, align: 'left' },
        { id: 'created_at', name: 'Transaction Date', sortable: true, align: 'center', render: (value) => new Date(value).toLocaleString() },
    ];

    const manualAssignColumns: Column[] = [
        { id: 'user', name: 'User', sortable: true, align: 'left', render: (value) => value.name },
        { id: 'points', name: 'Lunex Points', sortable: true, align: 'right' },
        { id: 'description', name: 'Description', sortable: true, align: 'left' },
        { id: 'assigned_by', name: 'Assigned By', sortable: true, align: 'left', render: (value) => value.name },
        { id: 'created_at', name: 'Transaction Date', sortable: true, align: 'center', render: (value) => new Date(value).toLocaleString() },
    ];

    const { control, handleSubmit, formState: { errors }, reset, watch, getValues } = useForm({
        defaultValues: {
            entrySubmissionConditions: [
                {
                    characters: 0,
                    points: 0,
                    type: "submission"
                }
            ],
            multiplierConditions: [
                {
                    multiplier: 1,
                    nft_count: 0,
                    type: "nft_holder"
                }
            ]
        }
    });

    const { fields: entrySubmissionFields, append: entrySubmissionAppend, remove: entrySubmissionRemove } = useFieldArray({
        control,
        name: "entrySubmissionConditions"
    });

    const { fields: multiplierFields, append: multiplierAppend, remove: multiplierRemove } = useFieldArray({
        control,
        name: "multiplierConditions"
    });

    const handleAssignLunex = async () => {
        setOpen(true);
    };

    const addEntrySubmissionCondition = () => {
        entrySubmissionAppend({
            characters: 0,
            points: 0,
            type: "submission"
        });
    };

    const addMultiplierCondition = () => {
        multiplierAppend({
            multiplier: 1,
            nft_count: 0,
            type: "nft_holder"
        });
    };

    const removeEntrySubmissionCondition = (index: number) => {
        entrySubmissionRemove(index);
    };

    const removeMultiplierCondition = (index: number) => {
        multiplierRemove(index);
    };

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('cms_token');
            if (!token) {
                router.push('/cms/login');
                return;
            }

            // Save conditions to backend
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lunex/conditions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ entrySubmissionConditions: data.entrySubmissionConditions, multiplierConditions: data.multiplierConditions })
            });

            if (!response.ok) {
                throw new Error('Failed to save conditions');
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message || 'Failed to save conditions');
            }

            alert('Conditions saved successfully!');
        } catch (error) {
            console.error('Error saving conditions:', error);
            alert('Failed to save conditions');
        } finally {
            setLoading(false);
        }
    };

    const loadTransactions = async (type: string) => {
        setTableLoading(true);
        const token = localStorage.getItem('cms_token');
        if (!token) {
            router.push('/cms/login');
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lunex/transactions/${type}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            }); 
            if (response.ok) {
                const data = await response.json();
                if (data.transactions && data.transactions.length > 0) {
                    if (type == 'all') {
                        setTransactions(data.transactions);
                    } else if (type == 'manual') {
                        setManualAssignTransactions(data.transactions);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setTableLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('cms_token');
        if (!token) {
            router.push('/cms/login');
            return;
        }

        // Load existing conditions
        const loadConditions = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lunex/conditions`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.submission && data.submission.length > 0) {
                        // Transform the data to match the form structure
                        const transformedConditions = data.submission.map((condition: any) => ({
                            characters: condition.characters,
                            points: condition.points,
                            type: "submission"
                        }));
                        reset({ entrySubmissionConditions: transformedConditions });
                    } else {
                        reset({ entrySubmissionConditions: [
                            {
                                characters: 0,
                                points: 0,
                                type: "submission"
                            }
                        ] });
                    }
                    if (data.nft_holder && data.nft_holder.length > 0) {
                        const transformedConditions = data.nft_holder.map((condition: any) => ({
                            multiplier: condition.multiplier,
                            nft_count: condition.nft_count,
                            type: "nft_holder"
                        }));
                        reset({ multiplierConditions: transformedConditions, entrySubmissionConditions: getValues('entrySubmissionConditions') });
                    } else {
                        reset({ multiplierConditions: [
                            {
                                multiplier: 1,
                                nft_count: 0,
                                type: "nft_holder"
                            }
                        ], entrySubmissionConditions: getValues('entrySubmissionConditions') });
                    }
                }
            } catch (error) {
                console.error('Error loading conditions:', error);
            }
        };

        reset({ entrySubmissionConditions: [], multiplierConditions: [] });
        if (tabId === 0) {
            loadTransactions('all');
        } else if (tabId === 1) {
            loadConditions();
        } else {
            loadTransactions('manual');
        }
    }, [tabId]);

    useEffect(() => {
        dispatch(setJumpPage(false))
    }, []);

    return (<>
        <div className="flex h-16 justify-between items-center">
            <h1 className="text-2xl font-semibold">Lunex Management</h1>
        </div>
        <div className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 mb-2">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`duration-300 flex items-center gap-2 p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 ${tabId === tab.id ? 'text-gray-600 bg-gray-50' : ''}`}
                    onClick={() => setTabId(tab.id)}
                >
                    {tab.name}
                </button>
            ))}
        </div>
        {
            tabId == 0 && <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <CustomTable columns={transactionColumns} data={transactions} pagination={true} loading={tableLoading} />
            </motion.div>
        }
        {
            tabId == 1 && <div className="flex flex-col gap-4 py-2">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Entry Submission Conditions</h2>
                        <button type="button" className={`bg-[#45b5d9] hover:bg-[#45b5d9]/80 duration-300 rounded-xl text-white px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10`}
                            onClick={addEntrySubmissionCondition}
                        >
                            <MdAdd /> Add Condition
                        </button>
                    </div>
                    {entrySubmissionFields.length > 0 && entrySubmissionFields.map((field, index) => (
                        <motion.div
                            key={field.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-md font-medium"># {index + 1}</h3>
                                <IconButton
                                    onClick={() => removeEntrySubmissionCondition(index)}
                                    color="error"
                                    size="small"
                                >
                                    <MdDelete />
                                </IconButton>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Controller
                                     name={`entrySubmissionConditions.${index}.characters`}
                                     control={control}
                                     rules={{ 
                                         required: "Characters is required",
                                         min: { value: 0, message: "Characters must be at least 0" }
                                     }}
                                     render={({ field }) => (
                                         <TextField
                                             {...field}
                                             type="number"
                                             fullWidth
                                             label="Characters (min: 0)"
                                             placeholder="1000"
                                             inputProps={{ 
                                                 min: 0,
                                                 onBlur: (e) => {
                                                     const value = parseInt(e.target.value);
                                                     if (value < 0) {
                                                         field.onChange(0);
                                                     }
                                                 }
                                             }}
                                             error={!!errors.entrySubmissionConditions?.[index]?.characters}
                                             helperText={errors.entrySubmissionConditions?.[index]?.characters?.message}
                                         />
                                     )}
                                 />
                                <Controller
                                     name={`entrySubmissionConditions.${index}.points`}
                                     control={control}
                                     rules={{ 
                                         required: "Points is required",
                                         min: { value: 0, message: "Points must be at least 0" }
                                     }}
                                     render={({ field }) => (
                                         <TextField
                                             {...field}
                                             type="number"
                                             fullWidth
                                             label="Lunex Points (min: 0)"
                                             placeholder="10"
                                             inputProps={{ 
                                                 min: 0,
                                                 onBlur: (e) => {
                                                     const value = parseInt(e.target.value);
                                                     if (value < 0) {
                                                         field.onChange(0);
                                                     }
                                                 }
                                             }}
                                             error={!!errors.entrySubmissionConditions?.[index]?.points}
                                             helperText={errors.entrySubmissionConditions?.[index]?.points?.message}
                                         />
                                     )}
                                 />
                            </div>
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    <strong>Rule:</strong> If user submits a entry with less than&nbsp;
                                    {watch(`entrySubmissionConditions.${index}.characters`)} characters,
                                    they will receive {watch(`entrySubmissionConditions.${index}.points`) || 0} Lunex points when approved.
                                </p>
                            </div>
                        </motion.div>
                    ))}
                    <div className="h-px bg-gray-200 my-4"></div>
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Multiplier Conditions</h2>
                        <button type="button" className={`bg-[#45b5d9] hover:bg-[#45b5d9]/80 duration-300 rounded-xl text-white px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10`}
                            onClick={addMultiplierCondition}
                        >
                            <MdAdd /> Add Condition
                        </button>
                    </div>
                    {multiplierFields.length > 0 && multiplierFields.map((field, index) => (
                        <motion.div
                            key={field.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-md font-medium"># {index + 1}</h3>
                                <IconButton
                                    onClick={() => removeMultiplierCondition(index)}
                                    color="error"
                                    size="small"
                                >
                                    <MdDelete />
                                </IconButton>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Controller
                                     name={`multiplierConditions.${index}.nft_count`}
                                     control={control}
                                     rules={{ 
                                         required: "NFT Count is required",
                                         min: { value: 0, message: "NFT Count must be at least 0" }
                                     }}
                                     render={({ field }) => (
                                         <TextField
                                             {...field}
                                             type="number"
                                             fullWidth
                                             label="NFT Count (min: 0)"
                                             placeholder="10"
                                             inputProps={{ 
                                                 min: 0,
                                                 onBlur: (e) => {
                                                     const value = parseInt(e.target.value);
                                                     if (value < 0) {
                                                         field.onChange(0);
                                                     }
                                                 }
                                             }}
                                             error={!!errors.multiplierConditions?.[index]?.nft_count}
                                             helperText={errors.multiplierConditions?.[index]?.nft_count?.message}
                                         />
                                     )}
                                 />
                                <Controller
                                     name={`multiplierConditions.${index}.multiplier`}
                                     control={control}
                                     rules={{ 
                                         required: "Multiplier is required",
                                         min: { value: 1, message: "Multiplier must be at least 1" }
                                     }}
                                     render={({ field }) => (
                                         <TextField
                                             {...field}
                                             type="number"
                                             fullWidth
                                             label="Multiplier (min: 1)"
                                             placeholder="10"
                                             inputProps={{ 
                                                 min: 1,
                                                 onBlur: (e) => {
                                                     const value = parseInt(e.target.value);
                                                     if (value < 1) {
                                                         field.onChange(1);
                                                     }
                                                 }
                                             }}
                                             error={!!errors.multiplierConditions?.[index]?.multiplier}
                                             helperText={errors.multiplierConditions?.[index]?.multiplier?.message}
                                         />
                                     )}
                                 />
                            </div>
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    <strong>Rule:</strong> If user holds&nbsp;
                                    {watch(`multiplierConditions.${index}.nft_count`)} NFTs,
                                    they will receive {watch(`multiplierConditions.${index}.multiplier`)}x Lunex points when approved.
                                </p>
                            </div>
                        </motion.div>
                    ))}
                    {(entrySubmissionFields.length > 0 || multiplierFields.length > 0) && (
                        <div className="flex justify-end gap-4 mt-6">
                            <button disabled={loading} className={`${loading ? 'bg-[#45b5d9]/50' : 'bg-[#45b5d9] hover:bg-[#45b5d9]/80'} duration-300 rounded-xl text-white px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10`}
                                onClick={handleSubmit(onSubmit)}
                            >
                                {loading ? <><MdRefresh className="animate-spin" /> Saving...</> : 'Save Conditions'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        }
        {
            tabId == 2 && <div className="flex flex-col gap-4 py-2 items-end">
                <button className={`bg-[#45b5d9] hover:bg-[#45b5d9]/80 duration-300 rounded-xl text-white px-4 py-2 text-sm shadow-lg flex items-center justify-center gap-2 z-10`}
                    onClick={() => handleAssignLunex()}
                >
                    <MdAdd /> Assign Lunex
                </button>
                <motion.div
                    className="w-full"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <CustomTable columns={manualAssignColumns} data={manualAssignTransactions} pagination={true} loading={tableLoading} />
                </motion.div>
            </div>
        }
        <Drawer
            anchor="right"
            open={open}
            onClose={() => {
                setOpen(false);
            }}
        >
            <div className="w-[400px] p-6">
                <h2 className="text-xl font-semibold mb-4">Assign Lunex</h2>
                <AssignLunexForm setOpen={setOpen} open={open} onSuccess={() => {
                    loadTransactions('manual');
                    enqueueSnackbar('Lunex assigned successfully', { variant: 'success' });
                }} />
            </div>
        </Drawer>
    </>)
}

export default LunexManagementPage;
