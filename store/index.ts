import { configureStore } from "@reduxjs/toolkit";
import dialogReducer from "./slice/dialogSlice";
import mouseReducer from "./slice/mouseSlice";
import pageReducer from "./slice/pageSlice";
import userReducer from "./slice/userSlice";
const store = configureStore({
    reducer: {
        dialog: dialogReducer,
        mouse: mouseReducer,
        page: pageReducer,
        user: userReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export default store;