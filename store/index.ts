import { configureStore } from "@reduxjs/toolkit";
import dialogReducer from "./slice/dialogSlice";

const store = configureStore({
    reducer: {
        dialog: dialogReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export default store;