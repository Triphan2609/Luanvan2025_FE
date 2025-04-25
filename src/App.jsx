import { Suspense } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Spin } from "antd";
import routes from "./configs/routes";
import useAuth from "./hooks/useAuth";

function App() {
    const { isAuthenticated } = useAuth(); // Hook tự tạo để kiểm tra đăng nhập

    return (
        <BrowserRouter>
            <Suspense fallback={<Spin size="large" fullscreen />}>
                <Routes>
                    {routes.map((route, index) => {
                        if (route.public) {
                            return <Route key={index} path={route.path} element={route.element} />;
                        }

                        return (
                            <Route
                                key={index}
                                path={route.path}
                                element={isAuthenticated ? route.element : <Navigate to="/login" replace />}
                            >
                                {route.children?.map((childRoute, childIndex) => (
                                    <Route key={childIndex} index={childRoute.index} path={childRoute.path} element={childRoute.element} />
                                ))}
                            </Route>
                        );
                    })}
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;
