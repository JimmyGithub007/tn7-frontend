import { configureStore } from "@reduxjs/toolkit";
import dialogReducer from "./slice/dialogSlice";
import mouseReducer from "./slice/mouseSlice";

const store = configureStore({
    reducer: {
        dialog: dialogReducer,
        mouse: mouseReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export default store;