import { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Spin, ConfigProvider, App as AntdApp } from "antd";
import routes from "./configs/routes";

function App() {
    return (
        <ConfigProvider>
            <AntdApp>
                <BrowserRouter>
                    <Suspense fallback={<Spin size="large" fullscreen />}>
                        <Routes>
                            {routes.map((route, index) => (
                                <Route key={index} path={route.path} element={route.element}>
                                    {route.children?.map((childRoute, childIndex) => (
                                        <Route
                                            key={childIndex}
                                            index={childRoute.index}
                                            path={childRoute.path}
                                            element={childRoute.element}
                                        />
                                    ))}
                                </Route>
                            ))}
                        </Routes>
                    </Suspense>
                </BrowserRouter>
            </AntdApp>
        </ConfigProvider>
    );
}

export default App;
