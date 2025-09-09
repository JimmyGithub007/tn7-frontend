import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface statesProps {
    info: any,
    isAuthenticated: boolean,
}

const initialState: statesProps = {
    info: null,
    isAuthenticated: false,
}

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<any>) => {
            state.info = action.payload;
        },
        setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
            state.isAuthenticated = action.payload;
        },
    },
});

export const { setUser, setIsAuthenticated } = userSlice.actions;
export default userSlice.reducer;