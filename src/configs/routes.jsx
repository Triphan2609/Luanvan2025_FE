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
const TableByArea = lazy(() =>
    import("../pages/Manager/Restaurant/Table/TableByArea")
);
const RestaurantAreas = lazy(() =>
    import("../pages/Manager/Restaurant/Areas/index")
);
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
const FrontDeskBooking = lazy(() =>
    import("../pages/Manager/Hotel/FrontDesk/index")
);
const Amenities = lazy(() => import("../pages/Manager/Hotel/Amenities/index"));
const Floors = lazy(() => import("../pages/Manager/Hotel/Floors/index"));
const PaymentHotel = lazy(() => import("../pages/Manager/Hotel/Payment/index"));
const InvoiceHotel = lazy(() =>
    import("../pages/Manager/Hotel/Payment/Invoice/index")
);
const HotelPaymentManagement = lazy(() =>
    import("../pages/Manager/Hotel/PaymentManagement/index")
);

const CustomerList = lazy(() =>
    import("../pages/Manager/Customer/ListCustomer/index")
);
const MembershipCard = lazy(() =>
    import("../pages/Manager/Customer/MembershipCard/index")
);
const RewardManagement = lazy(() =>
    import("../pages/Manager/Customer/Rewards/index")
);
const Feedback = lazy(() => import("../pages/Manager/Customer/Feedback/index"));
const PaymentManagement = lazy(() =>
    import("../pages/Manager/Customer/PaymentManagement/index")
);

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
const Attendance = lazy(() =>
    import("../pages/Manager/Employee/Attendance/index")
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
            { path: "/restaurant/table-by-area", element: <TableByArea /> },
            { path: "/restaurant/areas", element: <RestaurantAreas /> },
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
                path: "/hotel/front-desk",
                element: <FrontDeskBooking />,
            },
            {
                path: "/hotel/amenities",
                element: <Amenities />,
            },
            {
                path: "/hotel/floors",
                element: <Floors />,
            },
            {
                path: "/hotel/payment",
                element: <PaymentHotel />,
            },
            {
                path: "/hotel/payment/:bookingId",
                element: <PaymentHotel />,
            },
            {
                path: "/hotel/payment/invoice/:id",
                element: <InvoiceHotel />,
            },
            {
                path: "/hotel/invoice/:id",
                element: <InvoiceHotel />,
            },
            {
                path: "/hotel/payment-management",
                element: <HotelPaymentManagement />,
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
                path: "/customer/rewards",
                element: <RewardManagement />,
            },
            {
                path: "/customer/feedback",
                element: <Feedback />,
            },
            {
                path: "/customer/payment-management",
                element: <PaymentManagement />,
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
                path: "/employees/attendance",
                element: <Attendance />,
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
