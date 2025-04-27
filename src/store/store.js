import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Sử dụng localStorage
import authReducer from "./authSlice";
import { combineReducers } from "redux";

// Cấu hình redux-persist
const persistConfig = {
    key: "root", // Key để lưu trữ trong localStorage
    storage, // Sử dụng localStorage
    whitelist: ["auth"], // Chỉ lưu trữ slice "auth"
};

// Kết hợp các reducer
const rootReducer = combineReducers({
    auth: authReducer,
});

// Tạo persist reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Tạo store
const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Bỏ qua kiểm tra tuần tự hóa cho redux-persist
        }),
});

// Tạo persistor
export const persistor = persistStore(store);

export default store;
