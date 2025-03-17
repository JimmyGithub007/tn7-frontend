import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface statesProps {
    isUnityHover: boolean,
    isWebHover: boolean,
}

const initialState: statesProps = {
    isUnityHover: false,
    isWebHover: false,
}

export const mouseSlice = createSlice({
    name: "mouse",
    initialState,
    reducers: {
        setUnityHover: (state, action: PayloadAction<boolean>) => {
            state.isUnityHover = action.payload;
        },
        setWebHover: (state, action: PayloadAction<boolean>) => {
            state.isWebHover = action.payload;
        },
    },
});

export const { setUnityHover, setWebHover } = mouseSlice.actions;
export default mouseSlice.reducer;