import React, { useState, useEffect } from "react";
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    TimePicker,
    InputNumber,
    Popconfirm,
    message,
    Card,
    Typography,
    Row,
    Col,
    Tag,
    Drawer,
    Descriptions,
    Tabs,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ScheduleOutlined,
} from "@ant-design/icons";
import { reservationApi, tableApi } from "../../../../api/restaurantApi";
import moment from "moment";
import "moment/locale/vi";
import locale from "antd/es/date-picker/locale/vi_VN";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const ReservationStatus = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    NO_SHOW: "no_show",
};

const RestaurantReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [tables, setTables] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentReservation, setCurrentReservation] = useState(null);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [form] = Form.useForm();
    const [branches, setBranches] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
    const [filters, setFilters] = useState({
        date: "",
        status: "",
        customerId: "",
        branchId: "",
    });

    useEffect(() => {
        fetchReservations();
        fetchTables();
        fetchCustomers();
        fetchBranches();
    }, [pagination.current, pagination.pageSize, filters, activeTab]);

    const fetchReservations = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.current,
                limit: pagination.pageSize,
                ...filters,
            };

            if (activeTab !== "all") {
                params.status = activeTab;
            }

            const response = await reservationApi.getAllReservations(params);
            setReservations(response.data);
            setPagination({
                ...pagination,
                total: response.total,
            });
        } catch (error) {
            message.error("Không thể tải danh sách đặt bàn!");
            console.error("Error fetching reservations:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTables = async () => {
        try {
            const response = await tableApi.getAllTables({ limit: 100 });
            setTables(response.data);
        } catch (error) {
            message.error("Không thể tải danh sách bàn!");
            console.error("Error fetching tables:", error);
        }
    };

    const fetchCustomers = async () => {
        // Mock customer data until customer API is integrated
        setCustomers([
            { id: "1", name: "Nguyễn Văn A", phone: "0901234567" },
            { id: "2", name: "Trần Thị B", phone: "0909876543" },
        ]);
    };

    const fetchBranches = async () => {
        // Mock data until branch API is integrated
        setBranches([
            { id: "1", name: "Chi nhánh 1" },
            { id: "2", name: "Chi nhánh 2" },
        ]);
    };

    const showModal = (record = null) => {
        setCurrentReservation(record);
        setIsEditing(!!record);
        setIsModalVisible(true);

        if (record) {
            form.setFieldsValue({
                reservationDate: moment(record.reservationDate),
                reservationTime: moment(record.reservationTime, "HH:mm"),
                guestCount: record.guestCount,
                specialRequests: record.specialRequests,
                status: record.status,
                customerId: record.customerId,
                tableIds: record.tables?.map((table) => table.id) || [],
                estimatedDuration: record.estimatedDuration,
                branchId: record.branchId,
            });
        } else {
            form.resetFields();
            form.setFieldsValue({
                reservationDate: moment(),
                reservationTime: moment().add(1, "hour").startOf("hour"),
                status: ReservationStatus.PENDING,
                guestCount: 2,
                estimatedDuration: 120,
            });
        }
    };

    const showDrawer = (record) => {
        setSelectedReservation(record);
        setIsDrawerVisible(true);
    };

    const closeDrawer = () => {
        setIsDrawerVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // Format date and time
            const formattedValues = {
                ...values,
                reservationDate: values.reservationDate.format("YYYY-MM-DD"),
                reservationTime: values.reservationTime.format("HH:mm"),
            };

            if (isEditing) {
                await reservationApi.updateReservation(
                    currentReservation.id,
                    formattedValues
                );
                message.success("Đặt bàn đã được cập nhật!");
            } else {
                await reservationApi.createReservation(formattedValues);
                message.success("Đặt bàn đã được tạo!");
            }

            setIsModalVisible(false);
            fetchReservations();
        } catch (error) {
            message.error("Có lỗi xảy ra!");
            console.error("Error submitting reservation:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await reservationApi.deleteReservation(id);
            message.success("Đặt bàn đã được xóa!");
            fetchReservations();
        } catch (error) {
            message.error("Không thể xóa đặt bàn!");
            console.error("Error deleting reservation:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            setLoading(true);
            await reservationApi.changeReservationStatus(id, status);
            message.success(
                `Trạng thái đã được cập nhật thành ${getStatusText(status)}!`
            );
            fetchReservations();
        } catch (error) {
            message.error("Không thể cập nhật trạng thái!");
            console.error("Error updating reservation status:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (pagination, filters, sorter) => {
        setPagination(pagination);
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleDateRangeChange = (dates) => {
        if (dates && dates[0] && dates[1]) {
            const formattedDate = `${dates[0].format(
                "YYYY-MM-DD"
            )},${dates[1].format("YYYY-MM-DD")}`;
            handleFilterChange("date", formattedDate);
        } else {
            handleFilterChange("date", "");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case ReservationStatus.PENDING:
                return "blue";
            case ReservationStatus.CONFIRMED:
                return "green";
            case ReservationStatus.COMPLETED:
                return "cyan";
            case ReservationStatus.CANCELLED:
                return "red";
            case ReservationStatus.NO_SHOW:
                return "orange";
            default:
                return "default";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case ReservationStatus.PENDING:
                return "Chờ xác nhận";
            case ReservationStatus.CONFIRMED:
                return "Đã xác nhận";
            case ReservationStatus.COMPLETED:
                return "Hoàn thành";
            case ReservationStatus.CANCELLED:
                return "Đã hủy";
            case ReservationStatus.NO_SHOW:
                return "Không đến";
            default:
                return "Không xác định";
        }
    };

    const getCustomerName = (customerId) => {
        const customer = customers.find((c) => c.id === customerId);
        return customer ? customer.name : "Không xác định";
    };

    const getCustomerPhone = (customerId) => {
        const customer = customers.find((c) => c.id === customerId);
        return customer ? customer.phone : "Không có";
    };

    const getTableNames = (tableIds) => {
        if (!tableIds || tableIds.length === 0) return "Không có";

        return tableIds
            .map((id) => {
                const table = tables.find((t) => t.id === id);
                return table ? table.tableNumber : id;
            })
            .join(", ");
    };

    const columns = [
        {
            title: "Mã đặt bàn",
            dataIndex: "reservationNumber",
            key: "reservationNumber",
            width: "10%",
        },
        {
            title: "Khách hàng",
            dataIndex: "customerId",
            key: "customerId",
            width: "15%",
            render: (customerId) => getCustomerName(customerId),
        },
        {
            title: "Ngày đặt",
            dataIndex: "reservationDate",
            key: "reservationDate",
            width: "10%",
            render: (date) => moment(date).format("DD/MM/YYYY"),
            sorter: true,
        },
        {
            title: "Giờ đặt",
            dataIndex: "reservationTime",
            key: "reservationTime",
            width: "8%",
        },
        {
            title: "Số khách",
            dataIndex: "guestCount",
            key: "guestCount",
            width: "7%",
            sorter: true,
        },
        {
            title: "Bàn",
            dataIndex: "tables",
            key: "tables",
            width: "10%",
            render: (tables) =>
                tables && tables.length > 0
                    ? tables.map((table) => table.tableNumber).join(", ")
                    : "Chưa chỉ định",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: "10%",
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            width: "20%",
            render: (_, record) => (
                <Space size="small">
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => showDrawer(record)}
                        size="small"
                    />
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                        size="small"
                    />
                    {record.status === ReservationStatus.PENDING && (
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={() =>
                                handleStatusChange(
                                    record.id,
                                    ReservationStatus.CONFIRMED
                                )
                            }
                            size="small"
                            style={{
                                backgroundColor: "#52c41a",
                                borderColor: "#52c41a",
                            }}
                        />
                    )}
                    {(record.status === ReservationStatus.PENDING ||
                        record.status === ReservationStatus.CONFIRMED) && (
                        <Button
                            type="primary"
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={() =>
                                handleStatusChange(
                                    record.id,
                                    ReservationStatus.CANCELLED
                                )
                            }
                            size="small"
                        />
                    )}
                    {record.status === ReservationStatus.CONFIRMED && (
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={() =>
                                handleStatusChange(
                                    record.id,
                                    ReservationStatus.COMPLETED
                                )
                            }
                            size="small"
                            style={{
                                backgroundColor: "#13c2c2",
                                borderColor: "#13c2c2",
                            }}
                        />
                    )}
                    <Popconfirm
                        title="Bạn có chắc muốn xóa đặt bàn này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Title level={3}>Quản lý Đặt bàn Nhà hàng</Title>

            <Tabs activeKey={activeTab} onChange={handleTabChange} type="card">
                <TabPane tab="Tất cả" key="all" />
                <TabPane tab="Chờ xác nhận" key={ReservationStatus.PENDING} />
                <TabPane tab="Đã xác nhận" key={ReservationStatus.CONFIRMED} />
                <TabPane tab="Hoàn thành" key={ReservationStatus.COMPLETED} />
                <TabPane tab="Đã hủy" key={ReservationStatus.CANCELLED} />
                <TabPane tab="Không đến" key={ReservationStatus.NO_SHOW} />
            </Tabs>

            <Card>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} md={6}>
                        <RangePicker
                            locale={locale}
                            style={{ width: "100%" }}
                            placeholder={["Từ ngày", "Đến ngày"]}
                            onChange={handleDateRangeChange}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Select
                            placeholder="Chọn khách hàng"
                            allowClear
                            style={{ width: "100%" }}
                            onChange={(value) =>
                                handleFilterChange("customerId", value)
                            }
                        >
                            {customers.map((customer) => (
                                <Option key={customer.id} value={customer.id}>
                                    {customer.name} - {customer.phone}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Select
                            placeholder="Chọn chi nhánh"
                            allowClear
                            style={{ width: "100%" }}
                            onChange={(value) =>
                                handleFilterChange("branchId", value)
                            }
                        >
                            {branches.map((branch) => (
                                <Option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => showModal()}
                            style={{ float: "right" }}
                        >
                            Thêm đặt bàn mới
                        </Button>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={reservations}
                    rowKey="id"
                    pagination={pagination}
                    loading={loading}
                    onChange={handleTableChange}
                    scroll={{ x: 1200 }}
                />
            </Card>

            <Modal
                title={isEditing ? "Chỉnh sửa đặt bàn" : "Thêm đặt bàn mới"}
                visible={isModalVisible}
                onCancel={handleCancel}
                onOk={handleSubmit}
                confirmLoading={loading}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        reservationDate: moment(),
                        reservationTime: moment()
                            .add(1, "hour")
                            .startOf("hour"),
                        status: ReservationStatus.PENDING,
                        guestCount: 2,
                        estimatedDuration: 120,
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="reservationDate"
                                label="Ngày đặt bàn"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn ngày đặt bàn!",
                                    },
                                ]}
                            >
                                <DatePicker
                                    locale={locale}
                                    style={{ width: "100%" }}
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="reservationTime"
                                label="Giờ đặt bàn"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn giờ đặt bàn!",
                                    },
                                ]}
                            >
                                <TimePicker
                                    style={{ width: "100%" }}
                                    format="HH:mm"
                                    minuteStep={15}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="customerId"
                                label="Khách hàng"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn khách hàng!",
                                    },
                                ]}
                            >
                                <Select placeholder="Chọn khách hàng">
                                    {customers.map((customer) => (
                                        <Option
                                            key={customer.id}
                                            value={customer.id}
                                        >
                                            {customer.name} - {customer.phone}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="guestCount"
                                label="Số khách"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập số khách!",
                                    },
                                ]}
                            >
                                <InputNumber
                                    min={1}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="tableIds"
                        label="Bàn"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn ít nhất một bàn!",
                            },
                        ]}
                    >
                        <Select
                            placeholder="Chọn bàn"
                            mode="multiple"
                            optionFilterProp="children"
                            showSearch
                            filterOption={(input, option) =>
                                option.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {tables.map((table) => (
                                <Option key={table.id} value={table.id}>
                                    {table.tableNumber} - {table.capacity} người
                                    {table.isVIP ? " - VIP" : ""}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="estimatedDuration"
                                label="Thời gian dự kiến (phút)"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Vui lòng nhập thời gian dự kiến!",
                                    },
                                ]}
                            >
                                <InputNumber
                                    min={15}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="Trạng thái"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn trạng thái!",
                                    },
                                ]}
                            >
                                <Select placeholder="Chọn trạng thái">
                                    <Option value={ReservationStatus.PENDING}>
                                        Chờ xác nhận
                                    </Option>
                                    <Option value={ReservationStatus.CONFIRMED}>
                                        Đã xác nhận
                                    </Option>
                                    <Option value={ReservationStatus.COMPLETED}>
                                        Hoàn thành
                                    </Option>
                                    <Option value={ReservationStatus.CANCELLED}>
                                        Đã hủy
                                    </Option>
                                    <Option value={ReservationStatus.NO_SHOW}>
                                        Không đến
                                    </Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="specialRequests" label="Yêu cầu đặc biệt">
                        <TextArea
                            rows={3}
                            placeholder="Nhập yêu cầu đặc biệt của khách hàng"
                        />
                    </Form.Item>

                    <Form.Item
                        name="branchId"
                        label="Chi nhánh"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn chi nhánh!",
                            },
                        ]}
                    >
                        <Select placeholder="Chọn chi nhánh">
                            {branches.map((branch) => (
                                <Option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            <Drawer
                title="Chi tiết đặt bàn"
                placement="right"
                width={500}
                onClose={closeDrawer}
                visible={isDrawerVisible}
            >
                {selectedReservation && (
                    <div>
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Mã đặt bàn">
                                {selectedReservation.reservationNumber}
                            </Descriptions.Item>
                            <Descriptions.Item label="Khách hàng">
                                {getCustomerName(
                                    selectedReservation.customerId
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                {getCustomerPhone(
                                    selectedReservation.customerId
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày đặt">
                                <CalendarOutlined />{" "}
                                {moment(
                                    selectedReservation.reservationDate
                                ).format("DD/MM/YYYY")}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giờ đặt">
                                <ClockCircleOutlined />{" "}
                                {selectedReservation.reservationTime}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số khách">
                                <UserOutlined />{" "}
                                {selectedReservation.guestCount} người
                            </Descriptions.Item>
                            <Descriptions.Item label="Bàn đặt">
                                {selectedReservation.tables &&
                                selectedReservation.tables.length > 0
                                    ? selectedReservation.tables
                                          .map((table) => table.tableNumber)
                                          .join(", ")
                                    : "Chưa chỉ định"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian dự kiến">
                                <ScheduleOutlined />{" "}
                                {selectedReservation.estimatedDuration
                                    ? `${selectedReservation.estimatedDuration} phút`
                                    : "Không xác định"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag
                                    color={getStatusColor(
                                        selectedReservation.status
                                    )}
                                >
                                    {getStatusText(selectedReservation.status)}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Yêu cầu đặc biệt">
                                {selectedReservation.specialRequests ||
                                    "Không có"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Chi nhánh">
                                {branches.find(
                                    (b) => b.id === selectedReservation.branchId
                                )?.name || "Không xác định"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {moment(selectedReservation.createdAt).format(
                                    "DD/MM/YYYY HH:mm"
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cập nhật gần nhất">
                                {moment(selectedReservation.updatedAt).format(
                                    "DD/MM/YYYY HH:mm"
                                )}
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginTop: 24 }}>
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    onClick={() => {
                                        closeDrawer();
                                        showModal(selectedReservation);
                                    }}
                                >
                                    Chỉnh sửa
                                </Button>

                                {selectedReservation.status ===
                                    ReservationStatus.PENDING && (
                                    <Button
                                        type="primary"
                                        icon={<CheckCircleOutlined />}
                                        onClick={() => {
                                            handleStatusChange(
                                                selectedReservation.id,
                                                ReservationStatus.CONFIRMED
                                            );
                                            closeDrawer();
                                        }}
                                        style={{
                                            backgroundColor: "#52c41a",
                                            borderColor: "#52c41a",
                                        }}
                                    >
                                        Xác nhận
                                    </Button>
                                )}

                                {(selectedReservation.status ===
                                    ReservationStatus.PENDING ||
                                    selectedReservation.status ===
                                        ReservationStatus.CONFIRMED) && (
                                    <Button
                                        type="primary"
                                        danger
                                        icon={<CloseCircleOutlined />}
                                        onClick={() => {
                                            handleStatusChange(
                                                selectedReservation.id,
                                                ReservationStatus.CANCELLED
                                            );
                                            closeDrawer();
                                        }}
                                    >
                                        Hủy đặt bàn
                                    </Button>
                                )}

                                {selectedReservation.status ===
                                    ReservationStatus.CONFIRMED && (
                                    <Button
                                        type="primary"
                                        icon={<CheckCircleOutlined />}
                                        onClick={() => {
                                            handleStatusChange(
                                                selectedReservation.id,
                                                ReservationStatus.COMPLETED
                                            );
                                            closeDrawer();
                                        }}
                                        style={{
                                            backgroundColor: "#13c2c2",
                                            borderColor: "#13c2c2",
                                        }}
                                    >
                                        Hoàn thành
                                    </Button>
                                )}
                            </Space>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default RestaurantReservations;
