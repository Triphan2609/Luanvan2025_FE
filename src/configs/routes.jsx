import { lazy } from "react";
import ProtectedRoute from "../components/common/ProtectedRoute";

const LoginPage = lazy(() => import("../pages/Login/index"));
const AppLayout = lazy(() => import("../components/layout/AppLayout"));
const Dashboard = lazy(() => import("../pages/Dashboard/index"));
const ProfilePage = lazy(() => import("../pages/Profile/index"));
const NotFoundPage = lazy(() => import("../pages/Notfound/index"));
const Branches = lazy(() => import("../pages/Info/Branches/index"));
const Service = lazy(() => import("../pages/Info/Service/index"));
const Area = lazy(() => import("../pages/Info/Area/index"));

const Table = lazy(() => import("../pages/Manager/Restaurant/Table/index"));
const PaymentRestaurant = lazy(() =>
    import("../pages/Manager/Restaurant/Payment/index")
);
const InvoiceRestaurant = lazy(() =>
    import("../pages/Manager/Restaurant/Payment/Invoice/index")
);
const FoodList = lazy(() =>
    import("../pages/Manager/Restaurant/ListFood/index")
);
const ServiceRestaurant = lazy(() =>
    import("../pages/Manager/Restaurant/Service/index")
);
const Reservation = lazy(() =>
    import("../pages/Manager/Restaurant/Reservation/index")
);
const Promotion = lazy(() =>
    import("../pages/Manager/Restaurant/Promotion/index")
);
const MenuMain = lazy(() =>
    import("../pages/Manager/Restaurant/Menu/MenuMain/index")
);
const MenuSeasonal = lazy(() =>
    import("../pages/Manager/Restaurant/Menu/MenuSeasonal/index")
);

const Rooms = lazy(() => import("../pages/Manager/Hotel/Rooms/index"));
const RoomTypes = lazy(() => import("../pages/Manager/Hotel/RoomTypes/index"));
const RoomStuffs = lazy(() => import("../pages/Manager/Hotel/Stuff/index"));
const Bookings = lazy(() => import("../pages/Manager/Hotel/Bookings/index"));
const PaymentHotel = lazy(() => import("../pages/Manager/Hotel/Payment/index"));
const InvoiceHotel = lazy(() =>
    import("../pages/Manager/Hotel/Payment/Invoice/index")
);

const CustomerList = lazy(() =>
    import("../pages/Manager/Customer/ListCustomer/index")
);
const MembershipCard = lazy(() =>
    import("../pages/Manager/Customer/MembershipCard/index")
);
const Feedback = lazy(() => import("../pages/Manager/Customer/Feedback/index"));

const EmployeeList = lazy(() =>
    import("../pages/Manager/Employee/ListEmployee/index")
);
const EmployeePosition = lazy(() =>
    import("../pages/Manager/Employee/Position/index")
);
const WorkingTime = lazy(() =>
    import("../pages/Manager/Employee/WorkingTime/index")
);
const SalaryConfig = lazy(() =>
    import("../pages/Manager/Employee/SalaryConfig/index")
);
const Payroll = lazy(() => import("../pages/Manager/Employee/Payroll/index"));
const PayrollDashboard = lazy(() =>
    import("../pages/Manager/Employee/PayrollDashboard/index")
);
const PayrollAttendance = lazy(() =>
    import("../pages/Manager/Employee/PayrollAttendance/index")
);

const Revenue = lazy(() => import("../pages/Report/Revenue"));
const ServiceUsageReport = lazy(() =>
    import("../pages/Report/ServiceUsageReport")
);
const FinancialReport = lazy(() => import("../pages/Report/FinancialReport"));

const AccountManagement = lazy(() => import("../pages/System/Accounts/index"));
const Permissions = lazy(() => import("../pages/System/Permissions"));

const routes = [
    {
        path: "/login",
        element: <LoginPage />,
        public: true,
    },
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <AppLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <Dashboard />,
            },

            { path: "/profile", element: <ProfilePage /> },

            { path: "/info/branches", element: <Branches /> },
            { path: "/info/services", element: <Service /> },
            { path: "/info/areas", element: <Area /> },

            { path: "/restaurant/tables", element: <Table /> },
            { path: "/restaurant/payment", element: <PaymentRestaurant /> },
            {
                path: "/restaurant/payment/invoice/:id",
                element: <InvoiceRestaurant />,
            },
            { path: "/restaurant/foods", element: <FoodList /> },
            {
                path: "/restaurant/table-services",
                element: <ServiceRestaurant />,
            },
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
                path: "/hotel/room-stuffs",
                element: <RoomStuffs />,
            },
            {
                path: "/hotel/bookings",
                element: <Bookings />,
            },
            {
                path: "/hotel/payment",
                element: <PaymentHotel />,
            },
            {
                path: "/hotel/payment/invoice/:id",
                element: <InvoiceHotel />,
            },

            {
                path: "/customer/list-customer",
                element: <CustomerList />,
            },
            {
                path: "/customer/list-membership-card",
                element: <MembershipCard />,
            },
            {
                path: "/customer/feedback",
                element: <Feedback />,
            },

            {
                path: "/employees/list",
                element: <EmployeeList />,
            },
            {
                path: "/employees/positions",
                element: <EmployeePosition />,
            },
            {
                path: "/employees/working-time",
                element: <WorkingTime />,
            },
            {
                path: "/employees/salary-config",
                element: <SalaryConfig />,
            },
            {
                path: "/employees/payroll",
                element: <Payroll />,
            },
            {
                path: "/employees/payroll-dashboard",
                element: <PayrollDashboard />,
            },
            {
                path: "/employees/payroll-attendance",
                element: <PayrollAttendance />,
            },

            {
                path: "/reports/revenue",
                element: <Revenue />,
            },
            {
                path: "/reports/service-usage",
                element: <ServiceUsageReport />,
            },
            {
                path: "/reports/financial",
                element: <FinancialReport />,
            },

            {
                path: "/systems/accounts",
                element: <AccountManagement />,
            },
            {
                path: "/systems/permissions",
                element: <Permissions />,
            },
        ],
    },

    {
        path: "*",
        element: <NotFoundPage />,
    },
];

export default routes;
