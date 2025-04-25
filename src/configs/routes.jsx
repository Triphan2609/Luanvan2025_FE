import { lazy } from "react";

const LoginPage = lazy(() => import("../pages/Login/index"));
const AppLayout = lazy(() => import("../components/layout/AppLayout"));
const Dashboard = lazy(() => import("../pages/Dashboard/index"));
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
const Promotion = lazy(() => import("../pages/Manager/Restaurant/Promotion/index"));
const MenuMain = lazy(() => import("../pages/Manager/Restaurant/Menu/MenuMain/index"));
const MenuSeasonal = lazy(() => import("../pages/Manager/Restaurant/Menu/MenuSeasonal/index"));

const Rooms = lazy(() => import("../pages/Manager/Hotel/Rooms/index"));
const RoomTypes = lazy(() => import("../pages/Manager/Hotel/RoomTypes/index"));
const Bookings = lazy(() => import("../pages/Manager/Hotel/Bookings/index"));

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
            { path: "/restaurant/promotions", element: <Promotion /> },
            { path: "/restaurant/menus-main", element: <MenuMain /> },
            { path: "/restaurant/menus-seasonal", element: <MenuSeasonal /> },
            {
                path: "/hotel/rooms",
                element: <Rooms />,
            },
            {
                path: "/hotel/room-types",
                element: <RoomTypes />,
            },
            {
                path: "/hotel/bookings",
                element: <Bookings />,
            },
        ],
    },
    {
        path: "*",
        element: <NotFoundPage />,
    },
];

export default routes;
