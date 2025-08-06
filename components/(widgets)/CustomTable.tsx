"use client";

import { useMemo, useState } from "react";
import { BiChevronRight, BiSortZA, BiSortAlt2, BiSortAZ } from "react-icons/bi";
import { BiChevronLeft } from "react-icons/bi";
import { Table, TableCell, TableHead, TableRow, TableBody, TableContainer, Paper } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

interface Action {
    label: string;
    onClick: (row: any) => void;
    className?: string;
    icon?: React.ReactNode;
}

export interface Column {
    id: string | number;
    name: string;
    sortable?: boolean;
    align?: 'left' | 'right' | 'center';
    render?: (value: any) => React.ReactNode;
    actions?: Action[];
}

interface CustomTableProps {
    columns: Column[];
    data: any[];
    pagination?: boolean;
    loading?: boolean;
}

const CustomTable = ({ columns, data, pagination = true, loading = false }: CustomTableProps) => {
    const rowsPerPage: number = 10;
    const [ order, setOrder ] = useState<{
        direction: string | null,
        id: string | number | null
    }>({ direction: null, id: null });
    const [ pageNum, setPageNum ] = useState<number>(0);

    const handleSort = (orderId: string | number) => {
        let direction: string | null = 'asc';
        if(order.id === orderId) {
            if(order.direction === 'asc') {
                direction = 'desc'
            } else if(order.direction === 'desc') {
                direction = null;
            }
        }
        setOrder({ direction, id: direction ? orderId : null });
    }

    const disableBtn1 = useMemo(() => {
        if(pageNum === 0) return true;
        return false;
    }, [pageNum]);

    const disableBtn2 = useMemo(() => {
        if(pageNum * rowsPerPage + rowsPerPage >= data.length) return true;
        return false;
    }, [pageNum, rowsPerPage, data]);

    const sortedData = useMemo(() => {
        if (!order.direction || order.id === null) return data;
        
        return [...data].sort((a: any, b: any) => {
            const aValue = a[order.id as string | number];
            const bValue = b[order.id as string | number];
            
            if (order.direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }, [data, order]);

    const renderActions = (actions: Action[] | undefined, row: any) => {
        if (!actions) return null;
        
        return (
            <div className="flex gap-2 justify-end">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={() => action.onClick(row)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                            action.className || 'bg-indigo-500 hover:bg-indigo-600 text-white'
                        }`}
                    >
                        <div className="flex items-center gap-1">
                            {action.icon}
                            {action.label}
                        </div>
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full">
            <TableContainer component={Paper} className="rounded-xl shadow w-full overflow-x-auto filter-bar">
                <Table className="w-full">
                    <TableHead className="bg-gray-50 text-gray-700 uppercase">
                        <TableRow>
                            {
                                columns.map((col: Column, key: number) => (
                                    <TableCell 
                                        className={`${col.sortable && "cursor-pointer hover:bg-gray-100"} px-6 py-3 whitespace-nowrap ${
                                            col.actions ? 'sticky left-0 z-10 bg-gray-50 w-[200px]' : 'w-full'
                                        }`} 
                                        key={key} 
                                        onClick={() => { col.sortable && handleSort(col.id) }}
                                    >
                                        <div className={`flex items-center ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-between'} gap-2`}>
                                            <span className="truncate">{col.name}</span>
                                            {col.sortable && (
                                                order.id === col.id && order.direction ?
                                                (order.direction === 'asc' ? <BiSortAZ className="flex-shrink-0" /> : <BiSortZA className="flex-shrink-0" />) : 
                                                <BiSortAlt2 className="flex-shrink-0" />
                                            )}
                                        </div>
                                    </TableCell>
                                ))
                            }                    
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center">
                                    <CircularProgress size={32} />
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center">
                                    <span className="text-gray-400">No data found</span>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedData
                            .slice(pageNum * rowsPerPage, pageNum * rowsPerPage + rowsPerPage)
                            .map((row: any, k1: number) => {
                                const k = k1+(pageNum * rowsPerPage);
                                return <TableRow className="bg-white border-b hover:bg-gray-50" key={k}>
                                    {
                                        columns.map((col: Column, k2: number) => (
                                            <TableCell 
                                                className={`px-6 py-4 ${
                                                    col.actions ? 'sticky left-0 z-10 bg-white w-[200px]' : 'w-full'
                                                }`} 
                                                align={col.align}
                                                key={k2}
                                            >
                                                {col.actions ? renderActions(col.actions, row) : 
                                                 col.render ? col.render(row[col.id]) : row[col.id]}
                                            </TableCell>
                                        ))
                                    }
                                </TableRow>
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            {
                pagination && <div className="flex justify-between pt-4">
                    <div className="flex gap-2">
                        <button disabled={disableBtn1} className={`${disableBtn1 ? "bg-[#45b5d9]/50 cursor-not-allowed" : "bg-[#45b5d9] cursor-pointer hover:bg-[#45b5d9]/80"} duration-300 p-1 rounded-full shadow-md`} onClick={() => setPageNum(pageNum-1) }>
                            <BiChevronLeft className="text-2xl text-white" />
                        </button>
                        <button disabled={disableBtn2} className={`${disableBtn2 ? "bg-[#45b5d9]/50 cursor-not-allowed" : "bg-[#45b5d9] cursor-pointer hover:bg-[#45b5d9]/80"} duration-300 p-1 rounded-full shadow-md`} onClick={() => setPageNum(pageNum+1) }>
                            <BiChevronRight className="text-2xl text-white" />
                        </button>                    
                    </div>
                </div>
            }
        </div>
    )
}

export default CustomTable;