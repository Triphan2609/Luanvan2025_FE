import { lazy } from "react";

const LoginPage = lazy(() => import("../pages/Login/index"));
const AppLayout = lazy(() => import("../components/layout/AppLayout"));
const Dashboard = lazy(() => import("../pages/Dashboard/index"));
const Rooms = lazy(() => import("../pages/Rooms/index"));
const ProfilePage = lazy(() => import("../pages/Profile/index"));
const NotFoundPage = lazy(() => import("../pages/Notfound/index"));
const InfoPage = lazy(() => import("../pages/Info/Basic/index"));
const Brands = lazy(() => import("../pages/Info/Brands/index"));
const Service = lazy(() => import("../pages/Info/Service/index"));
const Area = lazy(() => import("../pages/Info/Area/index"));
const Table = lazy(() => import("../pages/Manager/Restaurant/Table/index"));
const PaymentRestaurant = lazy(() => import("../pages/Manager/Restaurant/Payment/index"));
const FoodList = lazy(() => import("../pages/Manager/Restaurant/ListFood/index"));
const Reservation = lazy(() => import("../pages/Manager/Restaurant/Reservation/index"));

const routes = [
    {
        path: "/login",
        element: <LoginPage />,
        public: true,
    },
    {
        path: "/",
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: <Dashboard />,
            },
            { path: "/profile", element: <ProfilePage /> },
            { path: "/info/basic", element: <InfoPage /> },
            { path: "/info/branches", element: <Brands /> },
            { path: "/info/services", element: <Service /> },
            { path: "/info/area", element: <Area /> },

            { path: "/restaurant/tables", element: <Table /> },
            { path: "/restaurant/payment", element: <PaymentRestaurant /> },
            { path: "/restaurant/foods", element: <FoodList /> },
            { path: "/restaurant/services", element: <PaymentRestaurant /> },
            { path: "/restaurant/reservations", element: <Reservation /> },

            {
                path: "/rooms",
                element: <Rooms />,
            },
        ],
    },
    {
        path: "*",
        element: <NotFoundPage />,
    },
];

export default routes;
