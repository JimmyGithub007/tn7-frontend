"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { LuImageUp } from "react-icons/lu";
import { RiVideoUploadLine } from "react-icons/ri";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote, SuggestionMenuController, getDefaultReactSlashMenuItems } from "@blocknote/react";
import axios from "axios";
import Image from "next/image";

// Uploads a file to the backend and returns the URL to the uploaded file
const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem("token");
    const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload/temp`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: token ? `Bearer ${token}` : "",
            },
        }
    );

    // Return the preview URL from the backend response
    return response.data.preview_url;
}

const EntryDialog = ({ isOpenEntryModal, setIsOpenEntryModal, entryId }: { isOpenEntryModal: boolean, setIsOpenEntryModal: (isOpen: boolean) => void, entryId: string }) => {

    const editor = useCreateBlockNote({
        uploadFile,
        initialContent: [
            {}
        ],
    });

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

    const [isEditing, setIsEditing] = useState(false);
    const [entryCategory, setEntryCategory] = useState('story');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [editingEntry, setEditingEntry] = useState<any>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tempFilePath, setTempFilePath] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onSubmit = async (data: any, status?: string) => {
        const contentJSON = editor.topLevelBlocks;
        const payload = {
            title: data.title,
            content: contentJSON,
            category: entryCategory,
            file_type: fileType,
            temp_file_path: tempFilePath,
            status: status,
        };

        // If editing and no new file uploaded, keep the existing media
        if (isEditing && editingEntry && !tempFilePath && editingEntry.media_url) {
            payload.temp_file_path = null; // Don't send temp_file_path if keeping existing file
        }

        try {
            const token = localStorage.getItem("token");
            
            if (isEditing && editingEntry) {
                // Update existing entry
                await axios.put(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/entries/${editingEntry.id}`,
                    payload,
                    { headers: { Authorization: token ? `Bearer ${token}` : "" } }
                );
            } else {
                // Create new entry
                await axios.post(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/entries/store`,
                    payload,
                    { headers: { Authorization: token ? `Bearer ${token}` : "" } }
                );
            }
            
            //resetForm();
            //fetchUserEntries();
        } catch (error) {
            alert("Save failed, please try again!");
            console.error("Failed to save entry:", error);
        } finally {
            setIsOpenEntryModal(false);
        }
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadError(null);
        setFileType(file.type.startsWith('image') ? 'image' : 'video');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload/temp`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                }
            );

            // Store both the temporary path and the full preview URL
            setTempFilePath(response.data.temp_path);
            setPreviewUrl(response.data.preview_url);

        } catch (err) {
            setUploadError("File upload failed. Please try again.");
            console.error(err);
        } finally {
            setIsUploading(false);
        }

        if (event.target) {
            event.target.value = '';
        }
    };

    const handleRemoveFile = () => {
        setTempFilePath(null);
        setPreviewUrl(null);
        setFileType(null);
    };

    const handleUploadClick = (type: 'image' | 'video') => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    useEffect(() => {
        const handleEditEntry = async (entryId: string) => {
            try {
                // Fetch the full entry data
                const token = localStorage.getItem("token");
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/entries/${entryId}`, {
                    headers: { Authorization: token ? `Bearer ${token}` : "" }
                });

                const entryData = response.data;
                console.log(entryData);

                // Set editing state
                setIsEditing(true);
                setEditingEntry(entryData);

                // Set form values
                setValue('title', entryData.title);
                setEntryCategory(entryData.category || 'story');

                // Set file data if exists
                if (entryData.media_url) {
                    setPreviewUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${entryData.media_url}`);
                    setFileType(entryData.media_type);
                    // Don't set tempFilePath for existing files, as they're already stored
                }

                // Set editor content
                if (entryData.content) {
                    const content = typeof entryData.content === 'string' ? JSON.parse(entryData.content) : entryData.content;
                    editor.replaceBlocks(editor.topLevelBlocks, content);
                }

                setIsOpenEntryModal(true);
            } catch (error) {
                console.error("Failed to fetch entry for editing:", error);
                alert("Failed to load entry for editing");
            }
        };

        if (isOpenEntryModal && entryId !== "new") {
            handleEditEntry(entryId);
        }
    }, [isOpenEntryModal, entryId]);

    return (<AnimatePresence>
        {isOpenEntryModal &&
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ duration: 0.5 }}
                className="absolute bg-black/50 bottom-0 left-0 w-full h-full flex items-center justify-center z-50">
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    transition={{ duration: 0.2, delay: 0.2 }}
                    id="modal"
                >
                    <form onSubmit={handleSubmit((data) => onSubmit(data, 'draft'))} className="bg-[#1f1f1f] flex flex-col gap-4 p-4 rounded-xl w-[400px] shadow-lg relative">
                        <div className="text-white text-lg font-bold text-center">
                            {isEditing ? 'EDIT ENTRY' : 'NEW ENTRY'}
                        </div>
                        <input
                            type="text"
                            placeholder="Title"
                            className="bg-black/20 backdrop-blur-sm text-white py-2 px-4 rounded-xl"
                            {...register("title", { required: "Title is required" })}
                        />
                        {errors.title && <span className="text-red-400 text-xs">{errors.title.message as string}</span>}

                        <div className="bg-white/20 backdrop-blur-sm text-white flex justify-center items-center rounded-lg w-full overflow-hidden relative">
                            {/* 滑动的背景指示器 */}
                            <motion.div
                                className="absolute top-0 left-0 h-full bg-white/30 rounded-lg"
                                initial={false}
                                animate={{
                                    x: entryCategory === 'story' ? '0%' : '100%',
                                    width: '50%'
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30
                                }}
                            />

                            <button
                                className={`w-1/2 flex items-center justify-center relative z-10 transition-colors duration-200 py-2 ${entryCategory === 'story' ? 'text-white' : 'text-white/70'}`}
                                onClick={() => setEntryCategory('story')}
                                type="button"
                            >
                                STORIES
                            </button>
                            <button
                                className={`w-1/2 flex items-center justify-center relative z-10 transition-colors duration-200 py-2 ${entryCategory === 'artwork' ? 'text-white' : 'text-white/70'}`}
                                onClick={() => setEntryCategory('artwork')}
                                type="button"
                            >
                                ARTWORK
                            </button>
                        </div>
                        <div className="flex flex-col gap-2 min-h-[388px] max-h-[calc(100vh-300px)] overflow-y-auto">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <AnimatePresence>
                                {entryCategory === 'artwork' &&
                                    <motion.div
                                        key="artwork-panel"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="pb-2">
                                            {isUploading ? (
                                                <div className="h-[100px] flex items-center justify-center">
                                                    <p className="text-white">Uploading...</p>
                                                </div>
                                            ) : previewUrl ? (
                                                <div className="relative group">
                                                    {fileType === 'image' ? (
                                                        <Image src={previewUrl} alt="Preview" width={400} height={300} className="w-full h-auto max-h-[250px] object-contain rounded-lg" />
                                                    ) : (
                                                        <video src={previewUrl} controls className="w-full h-auto max-h-[250px] rounded-lg" />
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveFile}
                                                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <IoClose size={20} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="h-[100px] grid grid-cols-2 gap-2">
                                                    <div onClick={() => handleUploadClick('image')} className="bg-white/20 cursor-pointer duration-300 flex flex-col gap-2 items-center justify-center rounded-xl hover:bg-white/30 shadow-md">
                                                        <LuImageUp className="text-white text-2xl" />
                                                        <div className="text-white text-sm">{isEditing ? 'CHANGE IMAGE' : 'UPLOAD IMAGE'}</div>
                                                    </div>
                                                    <div onClick={() => handleUploadClick('video')} className="bg-white/20 cursor-pointer duration-300 flex flex-col gap-2 items-center justify-center rounded-xl hover:bg-white/30 shadow-md">
                                                        <RiVideoUploadLine className="text-white text-3xl" />
                                                        <div className="text-white text-sm">{isEditing ? 'CHANGE VIDEO' : 'UPLOAD VIDEO'}</div>
                                                    </div>
                                                </div>
                                            )}
                                            {uploadError && <p className="text-red-500 text-xs mt-2">{uploadError}</p>}
                                        </div>
                                    </motion.div>
                                }
                            </AnimatePresence>
                            <BlockNoteView
                                editor={editor}
                                slashMenu={false}
                            >
                                <SuggestionMenuController
                                    triggerCharacter="/"
                                    getItems={async (query: string) => {
                                        // 获取默认的斜杠菜单项
                                        const defaultItems = getDefaultReactSlashMenuItems(editor);
                                        
                                        // 当 category 是 artwork 时，过滤掉媒体相关的菜单项
                                        if (entryCategory === 'artwork') {
                                            const filteredItems = defaultItems.filter(item => 
                                                !['image', 'video', 'audio', 'file'].includes(item.title.toLowerCase())
                                            );
                                            return filteredItems;
                                        }
                                        
                                        // 否则返回所有默认菜单项
                                        return defaultItems;
                                    }}
                                />
                            </BlockNoteView>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full p-4 z-10">
                            <button
                                type="button"
                                onClick={handleSubmit((data) => onSubmit(data, 'draft'))}
                                disabled={isSubmitting || isUploading}
                                className="bg-white/20 backdrop-blur-sm duration-300 text-white flex justify-center items-center gap-4 h-8 w-20 rounded-lg w-full disabled:opacity-50 hover:bg-white/30"
                            >
                                {isEditing ? 'UPDATE DRAFT' : 'SAVE AS DRAFT'}
                            </button>
                            <button
                                onClick={handleSubmit((data) => onSubmit(data, 'pending'))}
                                disabled={isSubmitting || isUploading}
                                className="bg-[#45b5d9] duration-300 text-white flex justify-center items-center gap-4 h-8 w-20 rounded-lg w-full disabled:opacity-50 hover:bg-[#45b5d9]/80"
                            >
                                {isEditing ? 'UPDATE & SUBMIT' : 'SAVE & SUBMIT'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpenEntryModal(false);
                                    //resetForm();
                                }}
                                className="bg-white/20 backdrop-blur-sm col-span-2  duration-300 text-white flex justify-center items-center gap-4 h-8 w-20 rounded-lg w-full hover:bg-white/30">
                                CLOSE
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        }
    </AnimatePresence>);
};

export default EntryDialog;