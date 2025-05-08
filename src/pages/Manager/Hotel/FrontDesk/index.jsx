import React, { useState, useEffect, useMemo } from "react";
import {
    Card,
    Select,
    Row,
    Col,
    Tag,
    Button,
    Space,
    Typography,
    Empty,
    Input,
    Divider,
    Badge,
    message,
    Alert,
    Statistic,
    Tabs,
    DatePicker,
    Calendar,
    Modal,
    Tooltip,
    Spin,
    Drawer,
    Popover,
    Radio,
    Descriptions,
    List,
    Form,
} from "antd";
import {
    HomeOutlined,
    SearchOutlined,
    PlusOutlined,
    ReloadOutlined,
    AppstoreOutlined,
    BankOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SyncOutlined,
    ClockCircleOutlined,
    InfoCircleOutlined,
    CalendarOutlined,
    UserAddOutlined,
    PhoneOutlined,
    UserOutlined,
    ToolOutlined,
    DownloadOutlined,
    FilterOutlined,
    EyeOutlined,
    WifiOutlined,
    CoffeeOutlined,
    EnvironmentOutlined,
    DesktopOutlined,
    CloudOutlined,
    BarsOutlined,
    CheckSquareOutlined,
    StopOutlined,
    CreditCardOutlined,
    DollarOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import FrontDeskBookingModal from "./Modals/FrontDeskBookingModal";
import BookingDetailDrawer from "./Drawer/BookingDetailDrawer";
import CustomerSelectModal from "./Modals/CustomerSelectModal";
import AddCustomerModal from "./Modals/AddCustomerModal";
import {
    getRooms,
    getRoomStats,
    getFloors,
    getFloorsByBranch,
    updateRoomStatus,
} from "../../../../api/roomsApi";
import { getRoomTypes } from "../../../../api/roomTypesApi";
import { getHotelBranches } from "../../../../api/branchesApi";
import { getAmenities } from "../../../../api/amenitiesApi";
import {
    createBooking,
    getBookings,
    getBookingById,
    getRoomAvailabilityCalendar,
    checkInBooking,
    checkOutBooking,
    checkOutAndSetAvailable,
    confirmBooking,
    cancelBooking,
    deleteBooking,
} from "../../../../api/bookingsApi";
import { getCustomers, createCustomer } from "../../../../api/customersApi";
import { createPayment, getPaymentMethods } from "../../../../api/paymentsApi";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import "./fontdesk.css";
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const roomStatuses = {
    Available: { color: "#52c41a", text: "Còn trống" },
    Booked: { color: "#f5222d", text: "Đã đặt" },
    Cleaning: { color: "#faad14", text: "Đang dọn" },
    Maintenance: { color: "#1890ff", text: "Bảo trì" },
};

export default function FrontDeskBooking() {
    const navigate = useNavigate();
    const location = useLocation();
    const [rooms, setRooms] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [floors, setFloors] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedFloor, setSelectedFloor] = useState(0);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("Available");
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [selectedBranchName, setSelectedBranchName] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        booked: 0,
        cleaning: 0,
        maintenance: 0,
    });
    const [dateRange, setDateRange] = useState([
        dayjs(),
        dayjs().add(7, "day"),
    ]);
    // Thêm state mới dành riêng cho đặt phòng
    const [bookingDateRange, setBookingDateRange] = useState([
        dayjs(),
        dayjs().add(1, "day"),
    ]);
    const [isCalendarView, setIsCalendarView] = useState(false);
    const [availabilityCalendar, setAvailabilityCalendar] = useState([]);
    const [isCustomerSelectModalOpen, setIsCustomerSelectModalOpen] =
        useState(false);
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [activeTab, setActiveTab] = useState("1");

    // Thêm các state mới cho tính năng nâng cao
    const [calendarSearchKeyword, setCalendarSearchKeyword] = useState("");
    const [filteredCalendarRooms, setFilteredCalendarRooms] = useState([]);
    const [calendarViewMode, setCalendarViewMode] = useState("all"); // all, available, booked
    const [amenities, setAmenities] = useState([]);
    const [isRoomDetailVisible, setIsRoomDetailVisible] = useState(false);
    const [roomDetailData, setRoomDetailData] = useState(null);
    const [isFilterDrawerVisible, setIsFilterDrawerVisible] = useState(false);

    // Detect URL parameter view=calendar to switch to calendar view
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const viewParam = searchParams.get("view");

        if (viewParam === "calendar") {
            setActiveTab("2");
            setIsCalendarView(true);
        }
    }, [location]);

    // Fetch data on component mount
    useEffect(() => {
        fetchBranches();
        fetchCustomers();
        fetchPaymentMethods();
    }, []);

    // Fetch floors and room types when branch is selected
    useEffect(() => {
        if (selectedBranch) {
            fetchFloorsByBranch(selectedBranch);
            fetchRoomTypes();
            // Also reload customers when branch changes
            fetchCustomers();
        }
    }, [selectedBranch]);

    // Fetch rooms when filters change
    useEffect(() => {
        if (selectedBranch) {
            fetchRooms();
        }
    }, [
        selectedFloor,
        selectedType,
        selectedStatus,
        selectedBranch,
        searchKeyword,
    ]);

    // Fetch availability calendar when date range or branch changes
    useEffect(() => {
        if (selectedBranch && isCalendarView) {
            fetchAvailabilityCalendar();
        }
    }, [
        dateRange,
        selectedBranch,
        selectedFloor,
        selectedType,
        isCalendarView,
    ]);

    // Thêm useEffect để lọc phòng trong lịch đặt phòng
    useEffect(() => {
        if (availabilityCalendar.length > 0) {
            let filtered = [...availabilityCalendar];

            // Lọc theo từ khóa
            if (calendarSearchKeyword) {
                filtered = filtered.filter(
                    (roomData) =>
                        roomData.room.roomCode
                            .toLowerCase()
                            .includes(calendarSearchKeyword.toLowerCase()) ||
                        roomData.room.roomType.name
                            .toLowerCase()
                            .includes(calendarSearchKeyword.toLowerCase())
                );
            }

            // Lọc theo trạng thái đặt phòng
            if (calendarViewMode === "available") {
                filtered = filtered.filter((roomData) =>
                    roomData.availability.some((day) => day.available)
                );
            } else if (calendarViewMode === "booked") {
                filtered = filtered.filter((roomData) =>
                    roomData.availability.some(
                        (day) => !day.available && day.booking
                    )
                );
            }

            setFilteredCalendarRooms(filtered);
        } else {
            setFilteredCalendarRooms([]);
        }
    }, [availabilityCalendar, calendarSearchKeyword, calendarViewMode]);

    useEffect(() => {
        fetchAmenities();
    }, []);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const response = await getHotelBranches();
            const hotelBranches = Array.isArray(response) ? response : [];
            setBranches(hotelBranches);

            // Auto-select the first branch if no branch is selected
            if (hotelBranches.length > 0 && !selectedBranch) {
                setSelectedBranch(hotelBranches[0].id);
                setSelectedBranchName(hotelBranches[0].name);
            }
        } catch (error) {
            console.error("Failed to fetch hotel branches:", error);
            message.error("Không thể tải danh sách chi nhánh khách sạn");
        } finally {
            setLoading(false);
        }
    };

    const fetchFloorsByBranch = async (branchId) => {
        try {
            setLoading(true);
            const data = await getFloorsByBranch(branchId);
            const formattedFloors = [
                { id: 0, name: "Tất cả tầng" },
                ...data.map((floor) => ({
                    id: floor.id,
                    floorNumber: floor.floorNumber,
                    name: floor.name,
                    description: floor.description,
                    branchId: floor.branchId,
                })),
            ];
            setFloors(formattedFloors);
            setSelectedFloor(0); // Reset to "All floors" when branch changes
        } catch (error) {
            console.error("Failed to fetch floors for branch:", error);
            message.error("Không thể tải danh sách tầng cho chi nhánh này");
            setFloors([{ id: 0, name: "Tất cả tầng" }]);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoomTypes = async () => {
        try {
            const data = await getRoomTypes();
            setRoomTypes([{ id: null, name: "Tất cả loại phòng" }, ...data]);
        } catch (error) {
            console.error("Failed to fetch room types:", error);
            message.error("Không thể tải danh sách loại phòng");
        }
    };

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            // Filter customers by selected branch if available
            const params = selectedBranch ? { branchId: selectedBranch } : {};
            console.log("Fetching customers with params:", params);

            const response = await getCustomers(params);

            // Kiểm tra cấu trúc dữ liệu trả về
            if (Array.isArray(response)) {
                // Nếu response đã là mảng
                setCustomers(response);
                console.log("Fetched customers array:", response.length);
            } else if (response && Array.isArray(response.data)) {
                // Nếu response là object có thuộc tính data là mảng
                setCustomers(response.data);
                console.log(
                    "Fetched customers from response.data:",
                    response.data.length
                );
            } else {
                // Trường hợp không xác định được cấu trúc dữ liệu
                console.error("Invalid customers data structure:", response);
                setCustomers([]);
                message.error("Dữ liệu khách hàng không hợp lệ");
            }
        } catch (error) {
            console.error("Failed to fetch customers:", error);
            message.error("Không thể tải danh sách khách hàng");
            setCustomers([]); // Đảm bảo customers luôn là một mảng
        } finally {
            setLoading(false);
        }
    };

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const params = {};

            if (selectedFloor > 0) {
                params.floorId = selectedFloor;
                console.log(`Filtering by floor ID: ${selectedFloor}`);
            }

            if (selectedType) {
                params.roomTypeId = selectedType;
            }

            if (selectedStatus) {
                params.status = selectedStatus;
            }

            if (selectedBranch) {
                params.branchId = selectedBranch;
            }

            if (searchKeyword) {
                params.search = searchKeyword;
            }

            console.log("Fetching rooms with params:", params);
            const data = await getRooms(params);
            console.log(`Received ${data.length} rooms from API`);

            // Xử lý dữ liệu tiện nghi cho mỗi phòng
            const processedRooms = data.map((room) => {
                // Kiểm tra và chuẩn hóa dữ liệu tiện nghi
                let amenities = room.amenities;

                // Đảm bảo amenities luôn là mảng
                if (!amenities) {
                    amenities = [];
                } else if (typeof amenities === "string") {
                    // Nếu là chuỗi, chuyển đổi thành mảng
                    amenities = amenities.split(",").map((item) => item.trim());
                }

                // Trả về phòng với tiện nghi đã được xử lý
                return {
                    ...room,
                    amenities,
                };
            });

            console.log(
                "Processed rooms with formatted amenities:",
                processedRooms.slice(0, 2)
            );
            setRooms(processedRooms);

            // Fetch room stats with the same filters
            const statsData = await getRoomStats(params);
            setStats(statsData);
        } catch (error) {
            message.error("Không thể tải dữ liệu phòng!");
            console.error("Error fetching rooms:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailabilityCalendar = async (forceRefresh = false) => {
        try {
            setLoading(true);
            console.log("Fetching availability calendar...");

            // Kiểm tra nếu chưa chọn chi nhánh
            if (!selectedBranch) {
                return;
            }

            // Lấy các tham số lọc
            const params = {
                branchId: selectedBranch,
                floorId: selectedFloor || undefined,
                roomTypeId: selectedType || undefined,
                startDate: dateRange[0].format("YYYY-MM-DD"),
                endDate: dateRange[1].format("YYYY-MM-DD"),
                forceRefresh: forceRefresh, // Thêm flag để backend biết đây là yêu cầu làm mới toàn bộ dữ liệu
            };

            console.log("Fetching availability with params:", params);

            // Gọi API lấy dữ liệu
            const calendarData = await getRoomAvailabilityCalendar(params);

            console.log("Calendar response:", calendarData);

            // Xử lý dữ liệu trả về
            if (Array.isArray(calendarData)) {
                // Format dữ liệu phòng và lịch đặt
                const formattedCalendarData = calendarData.map((roomData) => {
                    // Xử lý dữ liệu ngày trước khi hiển thị
                    const formattedAvailability =
                        roomData.availability?.map((dayData) => {
                            const formattedDate = dayjs(dayData.date).toDate();
                            const dateStr =
                                dayjs(formattedDate).format("YYYY-MM-DD");

                            // Ghi nhật ký chi tiết để debug
                            if (roomData.room.roomCode === "P101") {
                                console.log(`P101 Date ${dateStr}:`, {
                                    available: dayData.available,
                                    booking: dayData.booking
                                        ? {
                                              id: dayData.booking.id,
                                              status: dayData.booking.status,
                                          }
                                        : null,
                                });
                            }

                            // Nếu available là false mà không có booking, thì thật sự phòng không khả dụng
                            // do trạng thái phòng, không phải do đã đặt
                            const roomStatus =
                                !dayData.available && !dayData.booking
                                    ? roomData.room.status
                                    : null;

                            // Xác định trạng thái dọn dẹp đặc biệt
                            let isCleaningDay = false;

                            // Kiểm tra trạng thái dọn dẹp
                            if (roomData.room.status === "Cleaning") {
                                // So sánh chính xác ngày hiện tại với ngày dọn dẹp
                                const currentDateStr = dayjs(
                                    dayData.date
                                ).format("YYYY-MM-DD");

                                // Kiểm tra với cleaningDate từ thông tin phòng
                                if (roomData.room.cleaningDate) {
                                    // So sánh chuỗi dạng YYYY-MM-DD để tránh lỗi timezone
                                    isCleaningDay =
                                        currentDateStr ===
                                        roomData.room.cleaningDate;

                                    // Log chi tiết nếu là phòng đang theo dõi
                                    if (
                                        ["P102", "P103", "P104"].includes(
                                            roomData.room.roomCode
                                        )
                                    ) {
                                        console.log(
                                            `Room ${roomData.room.roomCode}, Date: ${currentDateStr}, ` +
                                                `cleaningDate: ${roomData.room.cleaningDate}, ` +
                                                `isCleaningDay: ${isCleaningDay}, ` +
                                                `status: ${roomData.room.status}`
                                        );
                                    }
                                } else {
                                    // Nếu không có cleaningDate, mặc định là ngày hiện tại
                                    isCleaningDay = dayjs(dayData.date).isSame(
                                        dayjs(),
                                        "day"
                                    );
                                }
                            }

                            return {
                                ...dayData,
                                date: formattedDate,
                                dateStr, // Thêm trường dateStr để dễ dàng debug
                                roomStatus, // Thêm trạng thái phòng nếu không available và không có booking
                                isCleaningDay, // Thêm flag để xác định ngày dọn dẹp
                                // Đảm bảo booking nếu có đầy đủ thông tin
                                booking: dayData.booking
                                    ? {
                                          ...dayData.booking,
                                          // Đảm bảo có đủ thông tin customer để hiển thị trong tooltip
                                          customer: dayData.booking
                                              .customer || {
                                              name: "Khách hàng",
                                              phone: "",
                                          },
                                          // Đảm bảo thông tin ngày check-in, check-out
                                          checkIn:
                                              dayData.booking.checkInDate ||
                                              dayData.booking.checkIn,
                                          checkOut:
                                              dayData.booking.checkOutDate ||
                                              dayData.booking.checkOut,
                                      }
                                    : null,
                            };
                        }) || [];

                    return {
                        ...roomData,
                        availability: formattedAvailability,
                    };
                });

                setAvailabilityCalendar(formattedCalendarData);

                console.log(
                    "Calendar data processed:",
                    formattedCalendarData.length,
                    "rooms"
                );

                // Kiểm tra dữ liệu phòng P101 sau khi xử lý
                const p101Data = formattedCalendarData.find(
                    (room) => room.room.roomCode === "P101"
                );
                if (p101Data) {
                    console.log(
                        "P101 availability data:",
                        p101Data.availability
                    );
                }
            } else {
                console.error("Invalid calendar data:", calendarData);
                setAvailabilityCalendar([]);
            }
        } catch (error) {
            console.error("Error fetching availability calendar:", error);
            message.error(
                "Không thể tải lịch đặt phòng: " +
                    (error.message || "Lỗi không xác định")
            );
            setAvailabilityCalendar([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchAmenities = async () => {
        try {
            console.log("Fetching amenities...");
            const data = await getAmenities();

            if (!data || !Array.isArray(data)) {
                console.error("Invalid amenities data format:", data);
                message.error("Dữ liệu tiện nghi không hợp lệ");
                setAmenities([]);
                return;
            }

            console.log("Fetched amenities successfully:", data);
            setAmenities(data);
        } catch (error) {
            console.error("Error fetching amenities:", error);
            message.error(
                "Không thể tải danh sách tiện nghi: " +
                    (error.message || "Lỗi không xác định")
            );
            setAmenities([]);
        }
    };

    const fetchPaymentMethods = async () => {
        try {
            setLoading(true);
            const methods = await getPaymentMethods();
            setPaymentMethods(methods);
        } catch (error) {
            console.error("Failed to fetch payment methods:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoomClick = (room) => {
        setSelectedRoom(room);
        // Thiết lập khoảng thời gian đặt phòng mặc định (hôm nay đến ngày mai)
        setBookingDateRange([dayjs(), dayjs().add(1, "day")]);
        setIsBookingModalOpen(true);
    };

    const handleBookingSubmit = async (bookingData) => {
        try {
            setLoading(true);
            console.log("Submitting booking data:", bookingData);

            const newBooking = await createBooking(bookingData);
            message.success("Đặt phòng thành công!");

            // Đóng modal đặt phòng
            setIsBookingModalOpen(false);

            // Reset các state liên quan đến form đặt phòng
            setSelectedRoom(null);
            setSelectedCustomer(null);
            setBookingDateRange([dayjs(), dayjs().add(1, "day")]);

            // Chỉ refresh dữ liệu phòng nếu đang ở chế độ xem danh sách
            if (!isCalendarView) {
                fetchRooms();
            }

            // Tải chi tiết đặt phòng và hiển thị
            const bookingDetails = await getBookingById(newBooking.id);
            setSelectedBooking(bookingDetails);
            setIsDetailDrawerOpen(true);

            // Nếu đang ở chế độ lịch, luôn tải lại toàn bộ lịch với forceRefresh=true
            if (isCalendarView) {
                console.log("Refreshing calendar with forceRefresh=true");
                await fetchAvailabilityCalendar(true);
            }
        } catch (error) {
            console.error("Failed to create booking:", error);
            message.error("Đặt phòng thất bại: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCustomerSelect = (customer) => {
        setSelectedCustomer(customer);
        setIsCustomerSelectModalOpen(false);
    };

    const handleAddCustomer = async (customerData) => {
        try {
            setLoading(true);

            // Ensure we have the correct branch ID
            const dataToSubmit = {
                ...customerData,
                branchId: customerData.branchId || selectedBranch,
            };

            console.log("Submitting customer data:", dataToSubmit);

            // Call the API to create a new customer
            const response = await createCustomer(dataToSubmit);

            if (response) {
                message.success("Thêm khách hàng mới thành công!");

                // Close the modal
                setIsAddCustomerModalOpen(false);

                // Add the new customer to our local state
                const newCustomer = response;
                const updatedCustomers = Array.isArray(customers)
                    ? [...customers, newCustomer]
                    : [newCustomer];

                setCustomers(updatedCustomers);

                // Select the newly created customer
                setSelectedCustomer(newCustomer);

                // If we're in the booking modal flow, open it with the new customer
                if (selectedRoom) {
                    // The booking modal will pick up the new selectedCustomer
                    console.log("Selected new customer:", newCustomer);
                }

                // Refresh customers list
                fetchCustomers();
            } else {
                message.error(
                    "Không thể thêm khách hàng: Phản hồi từ máy chủ không hợp lệ"
                );
            }
        } catch (error) {
            console.error("Error adding customer:", error);

            let errorMessage = "Lỗi khi thêm khách hàng";
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResetFilters = () => {
        setSelectedFloor(0);
        setSelectedType(null);
        setSelectedStatus("Available");
        setSearchKeyword("");
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
        if (key === "2") {
            setIsCalendarView(true);
            // Force refresh calendar when switching to calendar view
            fetchAvailabilityCalendar(true);
        } else {
            setIsCalendarView(false);
            // Refresh rooms list when switching to list view
            fetchRooms();
        }
    };

    const handleDateRangeChange = (dates) => {
        if (dates && dates.length === 2) {
            setDateRange(dates);
        }
    };

    const handleCheckIn = async (bookingId) => {
        try {
            setLoading(true);
            const updatedBooking = await checkInBooking(bookingId);
            message.success("Check-in thành công!");

            // Refresh booking details
            setSelectedBooking(updatedBooking);

            // Cập nhật lại lịch đặt phòng nếu đang ở chế độ calendar view
            if (isCalendarView) {
                console.log(
                    "Refreshing calendar after check-in with forceRefresh=true"
                );
                await fetchAvailabilityCalendar(true);
            }
        } catch (error) {
            console.error("Failed to check in:", error);
            message.error("Check-in thất bại: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async (bookingId) => {
        try {
            setLoading(true);

            // Lấy thông tin booking để hiển thị chi tiết
            const bookingDetails = await getBookingById(bookingId);

            // Gọi API mới checkout và set status phòng về available luôn (bỏ qua trạng thái dọn)
            await checkOutAndSetAvailable(bookingId);

            // Chuyển hướng đến trang thanh toán
            navigate(`/hotel/payment/${bookingId}`);
        } catch (error) {
            console.error("Failed to prepare checkout:", error);
            message.error(
                "Không thể chuẩn bị thông tin thanh toán: " +
                    (error.message || "Lỗi không xác định")
            );
        } finally {
            setLoading(false);
        }
    };

    // Thêm hàm xử lý hủy đặt phòng
    const handleCancelBooking = async (bookingId, reason) => {
        try {
            setLoading(true);
            const updatedBooking = await cancelBooking(bookingId, reason);
            message.success("Đã hủy đặt phòng thành công!");

            // Cập nhật thông tin booking sau khi hủy
            setSelectedBooking(updatedBooking);

            // Cập nhật lại lịch đặt phòng nếu đang ở chế độ calendar view
            if (isCalendarView) {
                console.log(
                    "Refreshing calendar after cancelling booking with forceRefresh=true"
                );
                await fetchAvailabilityCalendar(true);
            }
        } catch (error) {
            console.error("Failed to cancel booking:", error);
            message.error(
                "Hủy đặt phòng thất bại: " +
                    (error.message || "Lỗi không xác định")
            );
        } finally {
            setLoading(false);
        }
    };

    // Thêm hàm xử lý xóa đặt phòng
    const handleDeleteBooking = async (bookingId) => {
        try {
            setLoading(true);
            await deleteBooking(bookingId);
            message.success("Đã xóa đặt phòng thành công!");

            // Đóng drawer khi xóa thành công
            setIsDetailDrawerOpen(false);
            setSelectedBooking(null);

            // Cập nhật lại lịch đặt phòng nếu đang ở chế độ calendar view
            if (isCalendarView) {
                console.log(
                    "Refreshing calendar after deleting booking with forceRefresh=true"
                );
                await fetchAvailabilityCalendar(true);
            } else {
                // Nếu không ở chế độ lịch, tải lại lịch
                fetchAvailabilityCalendar(true);
            }
        } catch (error) {
            console.error("Failed to delete booking:", error);
            message.error(
                "Xóa đặt phòng thất bại: " +
                    (error.message || "Lỗi không xác định")
            );
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý khi thay đổi bộ lọc nhanh ngày
    // const handleQuickDateFilterChange = (value) => { ... }

    // Hàm xem chi tiết phòng
    const handleViewRoomDetail = async (room) => {
        try {
            console.log("Viewing room details for:", room);

            // Kiểm tra và đảm bảo amenities là mảng
            let initialRoom = { ...room };
            if (!initialRoom.amenities) {
                initialRoom.amenities = [];
            } else if (typeof initialRoom.amenities === "string") {
                // Nếu là chuỗi, chuyển đổi thành mảng
                initialRoom.amenities = initialRoom.amenities
                    .split(",")
                    .map((item) => item.trim());
            }

            setRoomDetailData(initialRoom); // Gán dữ liệu ban đầu để hiển thị ngay
            setIsRoomDetailVisible(true);

            // Lấy danh sách đặt phòng của phòng này
            try {
                // Gọi API để lấy lịch sử đặt phòng
                const bookingHistory = await getBookings({
                    roomId: room.id,
                    sort: "desc",
                    limit: 5, // Chỉ lấy 5 lịch sử gần nhất
                });

                // Cập nhật lại dữ liệu phòng với lịch sử thực tế
                setRoomDetailData({
                    ...initialRoom,
                    bookingHistory: bookingHistory.map((booking) => ({
                        id: booking.id,
                        customerName: booking.customer?.name || "Khách hàng",
                        checkIn: booking.checkIn,
                        checkOut: booking.checkOut,
                        status: booking.status,
                    })),
                });
            } catch (error) {
                console.error("Error fetching booking history:", error);
                // Nếu lỗi, sử dụng mảng rỗng
                setRoomDetailData({
                    ...initialRoom,
                    bookingHistory: [],
                });
                message.warning("Không thể tải lịch sử đặt phòng");
            }
        } catch (error) {
            console.error("Error loading room details:", error);
            message.error("Không thể tải thông tin chi tiết phòng");
        }
    };

    // Render các tiện nghi của phòng dựa trên dữ liệu thực tế
    const renderRoomAmenities = (roomAmenities = []) => {
        console.log("Room amenities data:", roomAmenities);
        console.log("Available amenities:", amenities);

        // Nếu không có dữ liệu tiện nghi
        if (!roomAmenities || roomAmenities.length === 0) {
            return <Empty description="Không có tiện nghi nào" />;
        }

        // Kiểm tra định dạng dữ liệu của roomAmenities
        let amenityValues = roomAmenities;

        // Nếu roomAmenities là chuỗi (có thể là chuỗi phân tách bởi dấu phẩy), chuyển thành mảng
        if (typeof roomAmenities === "string") {
            amenityValues = roomAmenities.split(",").map((item) => item.trim());
        }

        console.log("Processed amenity values:", amenityValues);

        // Lọc các tiện nghi từ danh sách amenities theo giá trị trong amenityValues
        const roomAmenityObjects = amenities.filter((amenity) => {
            const amenityInRoom = amenityValues.includes(amenity.value);
            console.log(
                `Checking amenity ${amenity.name} (${amenity.value}): ${amenityInRoom}`
            );
            return amenityInRoom;
        });

        console.log("Found matching amenities:", roomAmenityObjects);

        // Nếu không tìm thấy tiện nghi nào phù hợp, có thể là vấn đề về định dạng dữ liệu
        if (roomAmenityObjects.length === 0) {
            // Hiển thị tất cả các giá trị tiện nghi từ phòng như là tag đơn giản
            return (
                <Space wrap size="middle">
                    {amenityValues.map((value, index) => (
                        <Tag color="blue" key={index}>
                            {value}
                        </Tag>
                    ))}
                </Space>
            );
        }

        // Hiển thị các tiện nghi đã lọc
        return (
            <Space wrap size="middle">
                {roomAmenityObjects.map((amenity) => (
                    <Tag color="blue" key={amenity.id}>
                        {amenity.name}
                    </Tag>
                ))}
            </Space>
        );
    };

    // Hàm xuất dữ liệu lịch đặt phòng ra Excel
    const handleExportCalendarData = () => {
        try {
            // Tạo mảng dữ liệu cho file Excel
            const exportData = [];

            // Thêm header
            const headers = ["Mã phòng", "Loại phòng", "Giá", "Sức chứa"];

            // Thêm header cho các ngày
            const startDate = dateRange[0];
            const endDate = dateRange[1];
            const daysDiff = endDate.diff(startDate, "day") + 1;

            for (let i = 0; i < daysDiff; i++) {
                headers.push(startDate.add(i, "day").format("DD/MM/YYYY"));
            }

            exportData.push(headers);

            // Thêm dữ liệu phòng
            filteredCalendarRooms.forEach((roomData) => {
                const row = [
                    roomData.room.roomCode,
                    roomData.room.roomType.name,
                    roomData.room.price?.toLocaleString() + "đ",
                    roomData.room.capacity || 2,
                ];

                // Thêm thông tin tình trạng đặt phòng cho mỗi ngày
                roomData.availability.forEach((dayData) => {
                    if (dayData.available) {
                        row.push("Trống");
                    } else if (dayData.booking) {
                        row.push(`Đã đặt (${dayData.booking.customer.name})`);
                    } else if (roomData.room.status === "Maintenance") {
                        row.push("Bảo trì");
                    } else if (roomData.room.status === "Cleaning") {
                        row.push("Đang dọn");
                    } else {
                        row.push("Không khả dụng");
                    }
                });

                exportData.push(row);
            });

            // Tạo workbook và worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(exportData);

            // Thêm worksheet vào workbook
            XLSX.utils.book_append_sheet(wb, ws, "Lịch đặt phòng");

            // Tạo filename với ngày giờ hiện tại
            const fileName = `lich-dat-phong-${dayjs().format(
                "DDMMYYYY_HHmmss"
            )}.xlsx`;

            // Xuất file
            XLSX.writeFile(wb, fileName);

            message.success("Xuất dữ liệu thành công!");
        } catch (error) {
            console.error("Error exporting calendar data:", error);
            message.error("Lỗi khi xuất dữ liệu!");
        }
    };

    // Define a handler for branch selection
    const handleBranchChange = (branchId) => {
        setSelectedBranch(branchId);

        // Find the branch name
        const selectedBranchObj = branches.find(
            (branch) => branch.id === branchId
        );
        if (selectedBranchObj) {
            setSelectedBranchName(selectedBranchObj.name);
        }
    };

    const renderFilters = () => (
        <Space direction="vertical" style={{ width: "100%" }}>
            <Space wrap>
                <Select
                    value={selectedBranch}
                    onChange={handleBranchChange}
                    placeholder="Chọn chi nhánh"
                    style={{ width: 180 }}
                    options={branches.map((branch) => ({
                        value: branch.id,
                        label: branch.name,
                    }))}
                />

                <Select
                    value={selectedFloor}
                    onChange={setSelectedFloor}
                    placeholder="Chọn tầng"
                    style={{ width: 150 }}
                    options={floors.map((floor) => ({
                        value: floor.id,
                        label: floor.name,
                    }))}
                />

                <Select
                    value={selectedType}
                    onChange={setSelectedType}
                    placeholder="Chọn loại phòng"
                    style={{ width: 180 }}
                    allowClear
                    options={roomTypes.map((type) => ({
                        value: type.id,
                        label: type.name,
                    }))}
                />

                <Select
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    placeholder="Trạng thái"
                    style={{ width: 150 }}
                    options={Object.entries(roomStatuses).map(
                        ([key, value]) => ({
                            value: key,
                            label: (
                                <Space>
                                    <Badge color={value.color} />
                                    {value.text}
                                </Space>
                            ),
                        })
                    )}
                />

                <Input
                    prefix={<SearchOutlined />}
                    placeholder="Tìm kiếm phòng"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    style={{ width: 200 }}
                    allowClear
                />

                <Button icon={<ReloadOutlined />} onClick={handleResetFilters}>
                    Đặt lại
                </Button>
            </Space>
        </Space>
    );

    const renderRoomsByFloor = () => {
        // Nếu không có phòng, trả về Empty
        if (rooms.length === 0) {
            return (
                <Empty description="Không tìm thấy phòng nào phù hợp với bộ lọc" />
            );
        }

        // Nếu chọn một tầng cụ thể (selectedFloor > 0), chỉ hiển thị phòng của tầng đó
        if (selectedFloor > 0) {
            const selectedFloorInfo = floors.find(
                (floor) => floor.id === selectedFloor
            );
            const floorName = selectedFloorInfo
                ? selectedFloorInfo.name
                : "Tầng đã chọn";

            // Lọc lại phòng theo tầng để đảm bảo chỉ hiển thị phòng thuộc tầng đã chọn
            const filteredRooms = rooms.filter((room) => {
                // Kiểm tra phòng đang xét có floorId trùng với tầng đã chọn không
                return room.floorId === selectedFloor;
            });

            console.log(
                `Filtered ${filteredRooms.length} rooms in floor ${selectedFloor}`
            );

            if (filteredRooms.length === 0) {
                return (
                    <Empty description="Không tìm thấy phòng nào ở tầng đã chọn" />
                );
            }

            return (
                <div>
                    <Title level={5}>{floorName}</Title>
                    <Row gutter={[16, 16]}>
                        {filteredRooms.map((room) => (
                            <Col
                                key={room.id}
                                xs={24}
                                sm={12}
                                md={8}
                                lg={6}
                                xl={4}
                            >
                                <Card
                                    hoverable
                                    className="room-card"
                                    onClick={() => handleRoomClick(room)}
                                    style={{
                                        borderLeft: `3px solid ${
                                            roomStatuses[room.status]?.color ||
                                            "#ccc"
                                        }`,
                                    }}
                                >
                                    <Space
                                        direction="vertical"
                                        style={{ width: "100%" }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Text strong>{room.roomCode}</Text>
                                            <Space>
                                                <Tooltip title="Xem chi tiết phòng">
                                                    <Button
                                                        type="text"
                                                        size="small"
                                                        icon={
                                                            <InfoCircleOutlined />
                                                        }
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewRoomDetail(
                                                                room
                                                            );
                                                        }}
                                                    />
                                                </Tooltip>
                                                <Badge
                                                    color={
                                                        roomStatuses[
                                                            room.status
                                                        ]?.color
                                                    }
                                                    text={
                                                        roomStatuses[
                                                            room.status
                                                        ]?.text
                                                    }
                                                />
                                            </Space>
                                        </div>
                                        <Divider style={{ margin: "8px 0" }} />
                                        <div>
                                            <Space>
                                                <HomeOutlined />
                                                <Text>
                                                    {room.roomType.name}
                                                </Text>
                                            </Space>
                                        </div>
                                        <div>
                                            <Space>
                                                <TeamOutlined />
                                                <Text>
                                                    {room.capacity} người
                                                </Text>
                                            </Space>
                                        </div>
                                        <div>
                                            <Space>
                                                <BankOutlined />
                                                <Text type="success">
                                                    {room.price.toLocaleString()}
                                                    đ/đêm
                                                </Text>
                                            </Space>
                                        </div>

                                        {/* Hiển thị số lượng tiện nghi */}
                                        {room.amenities &&
                                            room.amenities.length > 0 && (
                                                <div
                                                    style={{ marginTop: "5px" }}
                                                >
                                                    <Tooltip title="Xem chi tiết tiện nghi">
                                                        <Tag
                                                            color="processing"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleViewRoomDetail(
                                                                    room
                                                                );
                                                            }}
                                                        >
                                                            <Space>
                                                                <WifiOutlined />
                                                                {Array.isArray(
                                                                    room.amenities
                                                                )
                                                                    ? `${room.amenities.length} tiện nghi`
                                                                    : typeof room.amenities ===
                                                                      "string"
                                                                    ? `${
                                                                          room.amenities.split(
                                                                              ","
                                                                          )
                                                                              .length
                                                                      } tiện nghi`
                                                                    : "0 tiện nghi"}
                                                            </Space>
                                                        </Tag>
                                                    </Tooltip>
                                                </div>
                                            )}
                                    </Space>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    <Divider />
                </div>
            );
        }

        // Nếu hiển thị tất cả tầng, nhóm phòng theo tầng
        const groupedRooms = {};

        rooms.forEach((room) => {
            const floorKey = room.floorDetails
                ? room.floorDetails.name
                : "Tất cả tầng";
            if (!groupedRooms[floorKey]) {
                groupedRooms[floorKey] = [];
            }
            groupedRooms[floorKey].push(room);
        });

        return Object.keys(groupedRooms).map((floorName) => (
            <div key={floorName}>
                <Title level={5}>{floorName}</Title>
                <Row gutter={[16, 16]}>
                    {groupedRooms[floorName].map((room) => (
                        <Col key={room.id} xs={24} sm={12} md={8} lg={6} xl={4}>
                            <Card
                                hoverable
                                className="room-card"
                                onClick={() => handleRoomClick(room)}
                                style={{
                                    borderLeft: `3px solid ${
                                        roomStatuses[room.status]?.color ||
                                        "#ccc"
                                    }`,
                                }}
                            >
                                <Space
                                    direction="vertical"
                                    style={{ width: "100%" }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Text strong>{room.roomCode}</Text>
                                        <Space>
                                            <Tooltip title="Xem chi tiết phòng">
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    icon={
                                                        <InfoCircleOutlined />
                                                    }
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewRoomDetail(
                                                            room
                                                        );
                                                    }}
                                                />
                                            </Tooltip>
                                            <Badge
                                                color={
                                                    roomStatuses[room.status]
                                                        ?.color
                                                }
                                                text={
                                                    roomStatuses[room.status]
                                                        ?.text
                                                }
                                            />
                                        </Space>
                                    </div>
                                    <Divider style={{ margin: "8px 0" }} />
                                    <div>
                                        <Space>
                                            <HomeOutlined />
                                            <Text>{room.roomType.name}</Text>
                                        </Space>
                                    </div>
                                    <div>
                                        <Space>
                                            <TeamOutlined />
                                            <Text>{room.capacity} người</Text>
                                        </Space>
                                    </div>
                                    <div>
                                        <Space>
                                            <BankOutlined />
                                            <Text type="success">
                                                {room.price.toLocaleString()}
                                                đ/đêm
                                            </Text>
                                        </Space>
                                    </div>

                                    {/* Hiển thị số lượng tiện nghi */}
                                    {room.amenities &&
                                        room.amenities.length > 0 && (
                                            <div style={{ marginTop: "5px" }}>
                                                <Tooltip title="Xem chi tiết tiện nghi">
                                                    <Tag
                                                        color="processing"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewRoomDetail(
                                                                room
                                                            );
                                                        }}
                                                    >
                                                        <Space>
                                                            <WifiOutlined />
                                                            {Array.isArray(
                                                                room.amenities
                                                            )
                                                                ? `${room.amenities.length} tiện nghi`
                                                                : typeof room.amenities ===
                                                                  "string"
                                                                ? `${
                                                                      room.amenities.split(
                                                                          ","
                                                                      ).length
                                                                  } tiện nghi`
                                                                : "0 tiện nghi"}
                                                        </Space>
                                                    </Tag>
                                                </Tooltip>
                                            </div>
                                        )}
                                </Space>
                            </Card>
                        </Col>
                    ))}
                </Row>
                <Divider />
            </div>
        ));
    };

    const renderAvailabilityCalendar = () => {
        const startDate = dateRange[0];
        const endDate = dateRange[1];
        const daysDiff = endDate.diff(startDate, "day") + 1;

        // Generate dates array
        const dates = [];
        for (let i = 0; i < daysDiff; i++) {
            dates.push(startDate.add(i, "day"));
        }

        // Đếm số phòng theo từng trạng thái trong khoảng thời gian đã chọn
        const totalRooms = availabilityCalendar.length;
        const roomStats = {
            available: 0,
            booked: 0,
            maintenance: 0,
            cleaning: 0,
        };

        availabilityCalendar.forEach((roomData) => {
            const availableDays = roomData.availability.filter(
                (day) => day.available
            ).length;
            const bookedDays = roomData.availability.filter(
                (day) => !day.available && day.booking
            ).length;

            if (availableDays === roomData.availability.length) {
                roomStats.available++;
            } else if (bookedDays > 0) {
                roomStats.booked++;
            } else if (roomData.room.status === "Maintenance") {
                roomStats.maintenance++;
            } else if (roomData.room.status === "Cleaning") {
                roomStats.cleaning++;
            }
        });

        // Kiểm tra trạng thái của việc tải dữ liệu
        const isLoading = loading || availabilityCalendar.length === 0;
        const isEmptyData = !loading && availabilityCalendar.length === 0;

        return (
            <div className="calendar-container">
                <Row gutter={[8, 24]}>
                    <Col md={24} lg={8}>
                        <Card className="calendar-sidebar">
                            <div className="calendar-controls">
                                <h3>Chọn khoảng thời gian</h3>
                                <RangePicker
                                    value={dateRange}
                                    onChange={handleDateRangeChange}
                                    format="DD/MM/YYYY"
                                    style={{ width: "100%", marginBottom: 16 }}
                                    allowClear={false}
                                    disabledDate={(current) =>
                                        current &&
                                        current < dayjs().startOf("day")
                                    }
                                />

                                <Divider dashed />

                                <h3>Thống kê phòng</h3>
                                <div className="calendar-stats">
                                    <Statistic
                                        title="Tổng số phòng"
                                        value={totalRooms}
                                        style={{ marginBottom: 8 }}
                                    />
                                    <Row gutter={[8, 8]}>
                                        <Col span={12}>
                                            <Card
                                                size="small"
                                                className="stat-card available-stat"
                                            >
                                                <Statistic
                                                    title="Còn trống"
                                                    value={roomStats.available}
                                                    valueStyle={{
                                                        color: "#52c41a",
                                                    }}
                                                />
                                            </Card>
                                        </Col>
                                        <Col span={12}>
                                            <Card
                                                size="small"
                                                className="stat-card booked-stat"
                                            >
                                                <Statistic
                                                    title="Đã đặt"
                                                    value={roomStats.booked}
                                                    valueStyle={{
                                                        color: "#f5222d",
                                                    }}
                                                />
                                            </Card>
                                        </Col>
                                        <Col span={12}>
                                            <Card
                                                size="small"
                                                className="stat-card cleaning-stat"
                                            >
                                                <Statistic
                                                    title="Đang dọn"
                                                    value={roomStats.cleaning}
                                                    valueStyle={{
                                                        color: "#faad14",
                                                    }}
                                                />
                                            </Card>
                                        </Col>
                                        <Col span={12}>
                                            <Card
                                                size="small"
                                                className="stat-card maintenance-stat"
                                            >
                                                <Statistic
                                                    title="Bảo trì"
                                                    value={
                                                        roomStats.maintenance
                                                    }
                                                    valueStyle={{
                                                        color: "#1890ff",
                                                    }}
                                                />
                                            </Card>
                                        </Col>
                                    </Row>
                                </div>

                                <Divider dashed />

                                <h3>Chú thích</h3>
                                <div className="calendar-legend">
                                    <div className="legend-item">
                                        <Badge
                                            color="#389e0d"
                                            text="Có thể đặt"
                                        />
                                    </div>
                                    <div className="legend-item">
                                        <Badge
                                            color="#faad14"
                                            text="Chờ xác nhận"
                                        />
                                    </div>
                                    <div className="legend-item">
                                        <Badge
                                            color="#1890ff"
                                            text="Đã xác nhận"
                                        />
                                    </div>
                                    <div className="legend-item">
                                        <Badge
                                            color="#52c41a"
                                            text="Đã check-in"
                                        />
                                    </div>
                                    <div className="legend-item">
                                        <Badge
                                            color="#8c8c8c"
                                            text="Đã check-out"
                                        />
                                    </div>
                                    <div className="legend-item">
                                        <Badge
                                            color="#f5222d"
                                            text="Đã hủy/Từ chối"
                                        />
                                    </div>
                                    <div className="legend-item">
                                        <Badge
                                            color="#1890ff"
                                            text="Đang bảo trì"
                                        />
                                    </div>
                                    <div className="legend-item">
                                        <Badge
                                            color="#faad14"
                                            text="Đang dọn"
                                        />
                                    </div>
                                </div>

                                <Divider dashed />

                                <h3>Lọc phòng</h3>
                                <div className="calendar-filter">
                                    <Radio.Group
                                        value={calendarViewMode}
                                        onChange={(e) =>
                                            setCalendarViewMode(e.target.value)
                                        }
                                        buttonStyle="solid"
                                        style={{
                                            width: "100%",
                                            marginBottom: 16,
                                        }}
                                    >
                                        <Radio.Button
                                            value="all"
                                            style={{
                                                width: "33.3%",
                                                textAlign: "center",
                                            }}
                                        >
                                            Tất cả
                                        </Radio.Button>
                                        <Radio.Button
                                            value="available"
                                            style={{
                                                width: "33.3%",
                                                textAlign: "center",
                                            }}
                                        >
                                            Còn trống
                                        </Radio.Button>
                                        <Radio.Button
                                            value="booked"
                                            style={{
                                                width: "33.3%",
                                                textAlign: "center",
                                            }}
                                        >
                                            Đã đặt
                                        </Radio.Button>
                                    </Radio.Group>
                                </div>

                                <Divider dashed />

                                <div className="calendar-tips">
                                    <Alert
                                        message="Hướng dẫn đặt phòng"
                                        description={
                                            <>
                                                <p>
                                                    • Nhấp vào ô màu xanh để đặt
                                                    phòng cho ngày được chọn.
                                                </p>
                                                <p>
                                                    • Một phòng có thể được đặt
                                                    cho nhiều ngày khác nhau.
                                                </p>
                                            </>
                                        }
                                        type="info"
                                        showIcon
                                    />
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col md={24} lg={16}>
                        <Card
                            className="calendar-main"
                            title="Lịch đặt phòng"
                            extra={
                                <Space>
                                    <Input.Search
                                        placeholder="Tìm phòng..."
                                        style={{ width: 200 }}
                                        allowClear
                                        value={calendarSearchKeyword}
                                        onChange={(e) =>
                                            setCalendarSearchKeyword(
                                                e.target.value
                                            )
                                        }
                                        onSearch={(value) =>
                                            setCalendarSearchKeyword(value)
                                        }
                                    />
                                    <Tooltip title="Xuất Excel">
                                        <Button
                                            type="primary"
                                            icon={<DownloadOutlined />}
                                            onClick={handleExportCalendarData}
                                        />
                                    </Tooltip>
                                    <Tooltip title="Làm mới">
                                        <Button
                                            type="primary"
                                            icon={<ReloadOutlined />}
                                            onClick={() =>
                                                fetchAvailabilityCalendar(true)
                                            }
                                            loading={loading}
                                        />
                                    </Tooltip>
                                </Space>
                            }
                        >
                            {isLoading ? (
                                <div className="calendar-loading">
                                    <Spin
                                        size="large"
                                        tip="Đang tải dữ liệu..."
                                    />
                                </div>
                            ) : filteredCalendarRooms.length === 0 ? (
                                <Empty description="Không tìm thấy phòng nào phù hợp với bộ lọc" />
                            ) : (
                                <div className="calendar-table-container">
                                    <table className="availability-calendar">
                                        <thead>
                                            <tr className="calendar-header">
                                                <th className="room-column">
                                                    Phòng
                                                </th>
                                                {dates.map((date) => {
                                                    const isToday =
                                                        date.format(
                                                            "YYYY-MM-DD"
                                                        ) ===
                                                        dayjs().format(
                                                            "YYYY-MM-DD"
                                                        );
                                                    const isWeekend =
                                                        date.day() === 0 ||
                                                        date.day() === 6;

                                                    return (
                                                        <th
                                                            key={date.format(
                                                                "YYYY-MM-DD"
                                                            )}
                                                            className={`date-column ${
                                                                isToday
                                                                    ? "today-column"
                                                                    : ""
                                                            } ${
                                                                isWeekend
                                                                    ? "weekend-column"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <div className="date-header">
                                                                <div className="date-day">
                                                                    {date.format(
                                                                        "DD"
                                                                    )}
                                                                </div>
                                                                <div className="date-month">
                                                                    {date.format(
                                                                        "MM"
                                                                    )}
                                                                </div>
                                                                <div className="date-weekday">
                                                                    {date.format(
                                                                        "ddd"
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </th>
                                                    );
                                                })}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredCalendarRooms.map(
                                                (roomData) => (
                                                    <tr
                                                        key={roomData.room.id}
                                                        className="room-row"
                                                    >
                                                        <td className="room-info-cell">
                                                            <div className="room-info">
                                                                <div className="room-code">
                                                                    {
                                                                        roomData
                                                                            .room
                                                                            .roomCode
                                                                    }
                                                                </div>
                                                                <div className="room-type">
                                                                    {
                                                                        roomData
                                                                            .room
                                                                            .roomType
                                                                            .name
                                                                    }
                                                                </div>
                                                                <div className="room-capacity">
                                                                    <TeamOutlined />{" "}
                                                                    {roomData
                                                                        .room
                                                                        .capacity ||
                                                                        2}{" "}
                                                                    người
                                                                </div>
                                                                <div className="room-price">
                                                                    <BankOutlined />{" "}
                                                                    {roomData.room.price?.toLocaleString()}
                                                                    đ/đêm
                                                                </div>
                                                            </div>
                                                        </td>
                                                        {roomData.availability.map(
                                                            (dayData) => {
                                                                const dateKey =
                                                                    dayjs(
                                                                        dayData.date
                                                                    ).format(
                                                                        "YYYY-MM-DD"
                                                                    );
                                                                const isToday =
                                                                    dateKey ===
                                                                    dayjs().format(
                                                                        "YYYY-MM-DD"
                                                                    );
                                                                const isWeekend =
                                                                    dayjs(
                                                                        dayData.date
                                                                    ).day() ===
                                                                        0 ||
                                                                    dayjs(
                                                                        dayData.date
                                                                    ).day() ===
                                                                        6;
                                                                const isPastDate =
                                                                    dayjs(
                                                                        dayData.date
                                                                    ).isBefore(
                                                                        dayjs(),
                                                                        "day"
                                                                    );

                                                                let statusClass =
                                                                    "cell-unavailable";
                                                                let statusIcon =
                                                                    (
                                                                        <CloseCircleOutlined
                                                                            style={{
                                                                                color: "#f5222d",
                                                                            }}
                                                                        />
                                                                    );
                                                                let cellTitle =
                                                                    "Không có sẵn";

                                                                // Nếu phòng có thể đặt
                                                                if (
                                                                    dayData.available
                                                                ) {
                                                                    statusClass =
                                                                        "cell-available";
                                                                    statusIcon =
                                                                        (
                                                                            <CheckCircleOutlined
                                                                                style={{
                                                                                    color: "#389e0d",
                                                                                    fontSize:
                                                                                        "18px",
                                                                                }}
                                                                            />
                                                                        );
                                                                    cellTitle =
                                                                        "Có thể đặt phòng";
                                                                }
                                                                // Nếu phòng có booking
                                                                else if (
                                                                    dayData.booking
                                                                ) {
                                                                    // Phân biệt chi tiết từng trạng thái booking
                                                                    switch (
                                                                        dayData
                                                                            .booking
                                                                            .status
                                                                    ) {
                                                                        case "pending":
                                                                            statusClass =
                                                                                "cell-booked cell-pending";
                                                                            statusIcon =
                                                                                (
                                                                                    <ClockCircleOutlined
                                                                                        style={{
                                                                                            color: "#faad14",
                                                                                            fontSize:
                                                                                                "20px",
                                                                                        }}
                                                                                    />
                                                                                );
                                                                            cellTitle = `Chờ xác nhận: ${dayData.booking.customer.name}`;
                                                                            break;
                                                                        case "confirmed":
                                                                            statusClass =
                                                                                "cell-booked cell-confirmed";
                                                                            statusIcon =
                                                                                (
                                                                                    <CheckCircleOutlined
                                                                                        style={{
                                                                                            color: "#1890ff",
                                                                                            fontSize:
                                                                                                "18px",
                                                                                        }}
                                                                                    />
                                                                                );
                                                                            cellTitle = `Đã xác nhận: ${dayData.booking.customer.name}`;
                                                                            break;
                                                                        case "checkedIn":
                                                                            statusClass =
                                                                                "cell-booked cell-checked-in";
                                                                            statusIcon =
                                                                                (
                                                                                    <UserOutlined
                                                                                        style={{
                                                                                            color: "#52c41a",
                                                                                            fontSize:
                                                                                                "18px",
                                                                                        }}
                                                                                    />
                                                                                );
                                                                            cellTitle = `Đã check-in: ${dayData.booking.customer.name}`;
                                                                            break;
                                                                        case "checkedOut":
                                                                            statusClass =
                                                                                "cell-booked cell-checked-out";
                                                                            statusIcon =
                                                                                (
                                                                                    <CheckSquareOutlined
                                                                                        style={{
                                                                                            color: "#8c8c8c",
                                                                                            fontSize:
                                                                                                "18px",
                                                                                        }}
                                                                                    />
                                                                                );
                                                                            cellTitle = `Đã check-out: ${dayData.booking.customer.name}`;
                                                                            break;
                                                                        case "cancelled":
                                                                            statusClass =
                                                                                "cell-booked cell-cancelled";
                                                                            statusIcon =
                                                                                (
                                                                                    <CloseCircleOutlined
                                                                                        style={{
                                                                                            color: "#f5222d",
                                                                                            fontSize:
                                                                                                "18px",
                                                                                        }}
                                                                                    />
                                                                                );
                                                                            cellTitle = `Đã hủy: ${dayData.booking.customer.name}`;
                                                                            break;
                                                                        case "rejected":
                                                                            statusClass =
                                                                                "cell-booked cell-rejected";
                                                                            statusIcon =
                                                                                (
                                                                                    <StopOutlined
                                                                                        style={{
                                                                                            color: "#f5222d",
                                                                                            fontSize:
                                                                                                "18px",
                                                                                        }}
                                                                                    />
                                                                                );
                                                                            cellTitle = `Từ chối: ${dayData.booking.customer.name}`;
                                                                            break;
                                                                        default:
                                                                            statusClass =
                                                                                "cell-booked";
                                                                            statusIcon =
                                                                                (
                                                                                    <UserOutlined
                                                                                        style={{
                                                                                            color: "#f5222d",
                                                                                            fontSize:
                                                                                                "18px",
                                                                                        }}
                                                                                    />
                                                                                );
                                                                            cellTitle = `Đã đặt bởi: ${dayData.booking.customer.name}`;
                                                                    }
                                                                }
                                                                // Nếu phòng đang được bảo trì
                                                                else if (
                                                                    roomData
                                                                        .room
                                                                        .status ===
                                                                        "Maintenance" ||
                                                                    dayData.roomStatus ===
                                                                        "Maintenance"
                                                                ) {
                                                                    statusClass =
                                                                        "cell-maintenance";
                                                                    statusIcon =
                                                                        (
                                                                            <ToolOutlined
                                                                                style={{
                                                                                    color: "#1890ff",
                                                                                    fontSize:
                                                                                        "18px",
                                                                                }}
                                                                            />
                                                                        );
                                                                    cellTitle =
                                                                        "Đang bảo trì";
                                                                }
                                                                // Nếu phòng đang được dọn dẹp
                                                                else if (
                                                                    (roomData
                                                                        .room
                                                                        .status ===
                                                                        "Cleaning" ||
                                                                        dayData.roomStatus ===
                                                                            "Cleaning") &&
                                                                    dayData.isCleaningDay
                                                                ) {
                                                                    // Log chi tiết khi render cell cho các phòng đang theo dõi
                                                                    if (
                                                                        [
                                                                            "P102",
                                                                            "P103",
                                                                            "P104",
                                                                        ].includes(
                                                                            roomData
                                                                                .room
                                                                                .roomCode
                                                                        )
                                                                    ) {
                                                                        console.log(
                                                                            `Rendering cleaning cell for ${
                                                                                roomData
                                                                                    .room
                                                                                    .roomCode
                                                                            } on ${dayjs(
                                                                                dayData.date
                                                                            ).format(
                                                                                "YYYY-MM-DD"
                                                                            )}, cleaningDate=${
                                                                                roomData
                                                                                    .room
                                                                                    .cleaningDate
                                                                            }`
                                                                        );
                                                                    }

                                                                    statusClass =
                                                                        "cell-cleaning";
                                                                    statusIcon =
                                                                        (
                                                                            <SyncOutlined
                                                                                style={{
                                                                                    color: "#faad14",
                                                                                    fontSize:
                                                                                        "18px",
                                                                                }}
                                                                            />
                                                                        );
                                                                    cellTitle =
                                                                        "Đang dọn dẹp";
                                                                }
                                                                // Nếu ngày không available nhưng không phải do booking hay trạng thái phòng đặc biệt
                                                                else {
                                                                    statusClass =
                                                                        "cell-unavailable";
                                                                    statusIcon =
                                                                        (
                                                                            <CloseCircleOutlined
                                                                                style={{
                                                                                    color: "#8c8c8c",
                                                                                    fontSize:
                                                                                        "18px",
                                                                                }}
                                                                            />
                                                                        );
                                                                    cellTitle =
                                                                        "Không có sẵn";
                                                                }

                                                                // Thêm class cho ngày quá khứ
                                                                if (
                                                                    isPastDate
                                                                ) {
                                                                    statusClass +=
                                                                        " cell-past-date";
                                                                }

                                                                return (
                                                                    <td
                                                                        key={
                                                                            dateKey
                                                                        }
                                                                        className={`calendar-cell ${statusClass} ${
                                                                            isToday
                                                                                ? "today-cell"
                                                                                : ""
                                                                        } ${
                                                                            isWeekend
                                                                                ? "weekend-cell"
                                                                                : ""
                                                                        }`}
                                                                        onClick={() => {
                                                                            // Chỉ cho phép đặt phòng cho ngày hiện tại và tương lai nếu phòng có sẵn
                                                                            if (
                                                                                dayData.available &&
                                                                                !isPastDate
                                                                            ) {
                                                                                // Thiết lập phòng đã chọn
                                                                                setSelectedRoom(
                                                                                    roomData.room
                                                                                );

                                                                                // Thiết lập bookingDateRange chính xác cho ngày được chọn
                                                                                // Đặt kết thúc là ngày hôm sau của ngày được chọn
                                                                                const currentDate =
                                                                                    dayjs(
                                                                                        dayData.date
                                                                                    );
                                                                                const nextDate =
                                                                                    currentDate.add(
                                                                                        1,
                                                                                        "day"
                                                                                    );
                                                                                setBookingDateRange(
                                                                                    [
                                                                                        currentDate,
                                                                                        nextDate,
                                                                                    ]
                                                                                );

                                                                                // Log để debug
                                                                                console.log(
                                                                                    `Selected booking date: ${currentDate.format(
                                                                                        "YYYY-MM-DD"
                                                                                    )} - ${nextDate.format(
                                                                                        "YYYY-MM-DD"
                                                                                    )}`
                                                                                );

                                                                                // Mở modal đặt phòng
                                                                                setIsBookingModalOpen(
                                                                                    true
                                                                                );
                                                                            } else if (
                                                                                dayData.booking
                                                                            ) {
                                                                                // Hiển thị thông tin chi tiết đặt phòng
                                                                                showBookingDetails(
                                                                                    dayData.booking
                                                                                );
                                                                            } else {
                                                                                // Thông báo khi người dùng cố gắng đặt phòng không khả dụng
                                                                                if (
                                                                                    isPastDate
                                                                                ) {
                                                                                    message.warning(
                                                                                        "Không thể đặt phòng cho ngày trong quá khứ"
                                                                                    );
                                                                                } else {
                                                                                    message.warning(
                                                                                        "Phòng này không khả dụng cho ngày được chọn"
                                                                                    );
                                                                                }
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Tooltip
                                                                            title={
                                                                                cellTitle
                                                                            }
                                                                        >
                                                                            {
                                                                                statusIcon
                                                                            }
                                                                        </Tooltip>
                                                                    </td>
                                                                );
                                                            }
                                                        )}
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    };

    // Hàm xử lý khi đóng modal đặt phòng
    const handleCloseBookingModal = () => {
        // Đóng modal
        setIsBookingModalOpen(false);

        // Reset các state liên quan đến form đặt phòng
        setSelectedRoom(null);
        setSelectedCustomer(null);
        setBookingDateRange([dayjs(), dayjs().add(1, "day")]);
    };

    // Thêm hàm xử lý xác nhận đặt phòng
    const handleConfirmBooking = async (bookingId) => {
        try {
            setLoading(true);
            const updatedBooking = await confirmBooking(bookingId);
            message.success("Đặt phòng đã được xác nhận thành công!");

            // Cập nhật thông tin booking sau khi xác nhận
            setSelectedBooking(updatedBooking);

            // Đảm bảo drawer vẫn mở sau khi xác nhận đặt phòng
            setIsDetailDrawerOpen(true);

            // Cập nhật lại lịch đặt phòng nếu đang ở chế độ calendar view
            if (isCalendarView) {
                console.log(
                    "Refreshing calendar after confirming booking with forceRefresh=true"
                );
                await fetchAvailabilityCalendar(true);
            }
        } catch (error) {
            console.error("Failed to confirm booking:", error);
            message.error(
                "Xác nhận đặt phòng thất bại: " +
                    (error.message || "Lỗi không xác định")
            );
        } finally {
            setLoading(false);
        }
    };

    // Thêm hàm để tải thông tin chi tiết đặt phòng
    const showBookingDetails = async (booking) => {
        try {
            setLoading(true);
            console.log("Opening booking details for:", booking);

            // Nếu booking không có đủ thông tin chi tiết, tải lại từ API
            if (!booking.room || !booking.customer) {
                console.log("Loading full booking details from API");
                const bookingDetail = await getBookingById(booking.id);
                setSelectedBooking(bookingDetail);
            } else {
                // Nếu đã có đủ thông tin thì dùng trực tiếp
                setSelectedBooking(booking);
            }

            // Mở drawer hiển thị chi tiết
            setIsDetailDrawerOpen(true);
        } catch (error) {
            console.error("Failed to get booking details:", error);
            message.error("Không thể tải thông tin chi tiết đặt phòng");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card
            title={
                <Space>
                    <HomeOutlined />
                    <span>Đặt phòng - Quầy lễ tân</span>
                </Space>
            }
            extra={
                <Space>
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={() => setIsAddCustomerModalOpen(true)}
                    >
                        Thêm khách hàng
                    </Button>
                </Space>
            }
        >
            {renderFilters()}

            <Divider />

            <Tabs activeKey={activeTab} onChange={handleTabChange}>
                <TabPane
                    tab={
                        <span>
                            <AppstoreOutlined />
                            Danh sách phòng
                        </span>
                    }
                    key="1"
                >
                    {rooms.length > 0 ? (
                        renderRoomsByFloor()
                    ) : (
                        <Empty description="Không tìm thấy phòng nào phù hợp với bộ lọc" />
                    )}
                </TabPane>
                <TabPane
                    tab={
                        <span>
                            <CalendarOutlined />
                            Lịch đặt phòng
                        </span>
                    }
                    key="2"
                >
                    {renderAvailabilityCalendar()}
                </TabPane>
            </Tabs>

            <FrontDeskBookingModal
                open={isBookingModalOpen}
                onCancel={handleCloseBookingModal}
                onOpenCustomerSelect={() => setIsCustomerSelectModalOpen(true)}
                onSubmit={handleBookingSubmit}
                room={selectedRoom}
                booking={bookingDateRange}
                selectedCustomer={selectedCustomer}
                onClearCustomer={() => setSelectedCustomer(null)}
            />

            <BookingDetailDrawer
                open={isDetailDrawerOpen}
                onClose={() => setIsDetailDrawerOpen(false)}
                booking={selectedBooking}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
                onConfirm={handleConfirmBooking}
                onCancel={handleCancelBooking}
                onDelete={handleDeleteBooking}
            />

            <CustomerSelectModal
                open={isCustomerSelectModalOpen}
                onCancel={() => setIsCustomerSelectModalOpen(false)}
                customers={customers}
                onSelect={handleCustomerSelect}
                onAddNew={() => {
                    setIsCustomerSelectModalOpen(false);
                    setIsAddCustomerModalOpen(true);
                }}
                branchName={selectedBranchName}
            />

            <AddCustomerModal
                open={isAddCustomerModalOpen}
                onCancel={() => setIsAddCustomerModalOpen(false)}
                onSubmit={handleAddCustomer}
                branchId={selectedBranch}
            />

            {/* Drawer hiển thị chi tiết phòng */}
            <Drawer
                title={
                    <Space>
                        <HomeOutlined />
                        <span>Chi tiết phòng {roomDetailData?.roomCode}</span>
                    </Space>
                }
                width={500}
                placement="right"
                onClose={() => setIsRoomDetailVisible(false)}
                open={isRoomDetailVisible}
                extra={
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => {
                                setIsRoomDetailVisible(false);
                                if (roomDetailData) {
                                    handleRoomClick(roomDetailData);
                                }
                            }}
                        >
                            Đặt phòng
                        </Button>
                    </Space>
                }
            >
                {roomDetailData ? (
                    <div className="room-detail-content">
                        <Card>
                            <Space
                                direction="vertical"
                                size="large"
                                style={{ width: "100%" }}
                            >
                                {/* Thông tin cơ bản */}
                                <div>
                                    <Title level={5}>Thông tin cơ bản</Title>
                                    <Descriptions bordered column={1}>
                                        <Descriptions.Item label="Mã phòng">
                                            {roomDetailData.roomCode}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Loại phòng">
                                            {roomDetailData.roomType?.name}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Tầng">
                                            {roomDetailData.floorDetails?.name}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Sức chứa">
                                            {roomDetailData.capacity} người
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Giá">
                                            <Text type="success">
                                                {roomDetailData.price?.toLocaleString()}
                                                đ/đêm
                                            </Text>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Trạng thái">
                                            <Badge
                                                status={
                                                    roomStatuses[
                                                        roomDetailData.status
                                                    ]?.color === "#52c41a"
                                                        ? "success"
                                                        : roomStatuses[
                                                              roomDetailData
                                                                  .status
                                                          ]?.color === "#f5222d"
                                                        ? "error"
                                                        : roomStatuses[
                                                              roomDetailData
                                                                  .status
                                                          ]?.color === "#faad14"
                                                        ? "warning"
                                                        : "processing"
                                                }
                                                text={
                                                    roomStatuses[
                                                        roomDetailData.status
                                                    ]?.text
                                                }
                                            />
                                        </Descriptions.Item>
                                    </Descriptions>
                                </div>

                                {/* Tiện nghi */}
                                <div>
                                    <Title level={5}>Tiện nghi phòng</Title>
                                    {renderRoomAmenities(
                                        roomDetailData.amenities
                                    )}
                                </div>

                                {/* Mô tả phòng */}
                                <div>
                                    <Title level={5}>Mô tả phòng</Title>
                                    <Text>
                                        {roomDetailData.description ||
                                            `Phòng ${roomDetailData.roomCode} là phòng ${roomDetailData.roomType?.name} 
                                        thoáng mát với đầy đủ tiện nghi hiện đại. Phòng có thể phục vụ tối đa 
                                        ${roomDetailData.capacity} người với không gian rộng rãi, thiết kế hiện đại.`}
                                    </Text>
                                </div>

                                {/* Lịch sử đặt phòng */}
                                <div>
                                    <Title level={5}>
                                        Lịch sử đặt phòng gần đây
                                    </Title>
                                    {roomDetailData.bookingHistory &&
                                    roomDetailData.bookingHistory.length > 0 ? (
                                        <List
                                            size="small"
                                            bordered
                                            dataSource={
                                                roomDetailData.bookingHistory ||
                                                []
                                            }
                                            renderItem={(booking) => (
                                                <List.Item>
                                                    <Space direction="vertical">
                                                        <Text>
                                                            <UserOutlined />{" "}
                                                            {
                                                                booking.customerName
                                                            }
                                                        </Text>
                                                        <Text type="secondary">
                                                            <CalendarOutlined />{" "}
                                                            {dayjs(
                                                                booking.checkIn
                                                            ).format(
                                                                "DD/MM/YYYY"
                                                            )}{" "}
                                                            -{" "}
                                                            {dayjs(
                                                                booking.checkOut
                                                            ).format(
                                                                "DD/MM/YYYY"
                                                            )}
                                                        </Text>
                                                    </Space>
                                                </List.Item>
                                            )}
                                        />
                                    ) : (
                                        <Empty description="Chưa có lịch sử đặt phòng" />
                                    )}
                                </div>
                            </Space>
                        </Card>
                    </div>
                ) : (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                        <Spin size="large" />
                        <div style={{ marginTop: 16 }}>
                            Đang tải thông tin phòng...
                        </div>
                    </div>
                )}
            </Drawer>

            {/* CSS for the availability calendar */}

            {/* REMOVE Payment Modal from here */}
        </Card>
    );
}
