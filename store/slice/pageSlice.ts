import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReactNode } from "react";

export interface statesProps {
    jumpPage: boolean,
}

const initialState: statesProps = {
    jumpPage: false,
}

export const pageSlice = createSlice({
    name: "page",
    initialState,
    reducers: {
        setJumpPage: (state, action: PayloadAction<boolean>) => {
            state.jumpPage = action.payload;
        },
    },
});

export const { setJumpPage } = pageSlice.actions;
export default pageSlice.reducer;