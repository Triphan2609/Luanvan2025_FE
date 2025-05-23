import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./store/store";
import App from "./App.jsx";
import { ConfigProvider } from "antd";
import "./index.css";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <ConfigProvider>
                    <App />
                </ConfigProvider>
            </PersistGate>
        </Provider>
    </StrictMode>
);
