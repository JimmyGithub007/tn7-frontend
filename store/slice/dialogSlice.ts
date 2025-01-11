import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReactNode } from "react";

export interface statesProps {
    isOpen: boolean,
    content: ReactNode
}

const initialState: statesProps = {
    isOpen: false,
    content: null
}

export const dialogSlice = createSlice({
    name: "dialog",
    initialState,
    reducers: {
        setIsOpen: (state, action: PayloadAction<boolean>) => {
            state.isOpen = action.payload;
        },
        setContent: (state, action: PayloadAction<ReactNode>) => {
            state.content = action.payload;
        }, 
    },
});

export const { setIsOpen, setContent } = dialogSlice.actions;
export default dialogSlice.reducer;