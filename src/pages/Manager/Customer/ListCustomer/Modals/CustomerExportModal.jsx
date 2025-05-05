import React, { useState, useEffect } from "react";
import {
    Modal,
    Button,
    Form,
    Radio,
    Checkbox,
    Select,
    Space,
    Divider,
    Table,
    Typography,
    Input,
    Tooltip,
    Alert,
    Row,
    Col,
    Tag,
} from "antd";
import {
    FileExcelOutlined,
    FileTextOutlined,
    SettingOutlined,
    EyeOutlined,
    DownloadOutlined,
    FilterOutlined,
} from "@ant-design/icons";
import { exportToExcel, exportToCSV } from "../../../../../utils/exportUtils";

const { Text, Title } = Typography;
const { Option } = Select;

/**
 * Modal xuất dữ liệu khách hàng với tùy chọn nâng cao
 */
const CustomerExportModal = ({
    open,
    onCancel,
    data = [],
    title = "Xuất dữ liệu khách hàng",
    fileName = "danh_sach_khach_hang",
    branches = [],
    customerTypes = {},
    customerStatuses = {},
}) => {
    const [form] = Form.useForm();
    const [exportFormat, setExportFormat] = useState("excel");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [previewData, setPreviewData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [customFileName, setCustomFileName] = useState(fileName);
    const [includeHeader, setIncludeHeader] = useState(true);
    const [filters, setFilters] = useState({
        status: undefined,
        type: undefined,
        branchId: undefined,
        minBookings: undefined,
        maxBookings: undefined,
        minSpent: undefined,
        maxSpent: undefined,
    });

    // Định nghĩa các cột cho dữ liệu khách hàng
    const customerColumns = [
        { key: "customer_code", title: "Mã KH", dataIndex: "customer_code" },
        { key: "name", title: "Họ và tên", dataIndex: "name" },
        { key: "phone", title: "Số điện thoại", dataIndex: "phone" },
        { key: "email", title: "Email", dataIndex: "email" },
        { key: "idNumber", title: "CCCD/Passport", dataIndex: "idNumber" },
        { key: "address", title: "Địa chỉ", dataIndex: "address" },
        { key: "branch", title: "Chi nhánh", dataIndex: ["branch", "name"] },
        { key: "type", title: "Loại khách hàng", dataIndex: "type" },
        { key: "status", title: "Trạng thái", dataIndex: "status" },
        {
            key: "totalBookings",
            title: "Số lần đặt",
            dataIndex: "totalBookings",
        },
        { key: "totalSpent", title: "Tổng chi tiêu", dataIndex: "totalSpent" },
        { key: "birthday", title: "Ngày sinh", dataIndex: "birthday" },
        { key: "createdAt", title: "Ngày tạo", dataIndex: "createdAt" },
        { key: "note", title: "Ghi chú", dataIndex: "note" },
    ];

    // Lọc dữ liệu theo bộ lọc
    const applyFilters = (sourceData) => {
        if (!sourceData || sourceData.length === 0) return [];

        return sourceData.filter((item) => {
            // Lọc theo trạng thái
            if (filters.status && item.status !== filters.status) {
                return false;
            }

            // Lọc theo loại khách hàng
            if (filters.type && item.type !== filters.type) {
                return false;
            }

            // Lọc theo chi nhánh
            if (
                filters.branchId &&
                String(item.branchId) !== String(filters.branchId) &&
                (!item.branch ||
                    String(item.branch.id) !== String(filters.branchId))
            ) {
                return false;
            }

            // Lọc theo số lần đặt
            if (
                filters.minBookings !== undefined &&
                filters.minBookings !== null &&
                (item.totalBookings === undefined ||
                    item.totalBookings < filters.minBookings)
            ) {
                return false;
            }

            if (
                filters.maxBookings !== undefined &&
                filters.maxBookings !== null &&
                item.totalBookings !== undefined &&
                item.totalBookings > filters.maxBookings
            ) {
                return false;
            }

            // Lọc theo tổng chi tiêu
            if (
                filters.minSpent !== undefined &&
                filters.minSpent !== null &&
                (item.totalSpent === undefined ||
                    item.totalSpent < filters.minSpent)
            ) {
                return false;
            }

            if (
                filters.maxSpent !== undefined &&
                filters.maxSpent !== null &&
                item.totalSpent !== undefined &&
                item.totalSpent > filters.maxSpent
            ) {
                return false;
            }

            return true;
        });
    };

    // Cập nhật dữ liệu khi thay đổi bộ lọc
    useEffect(() => {
        const filtered = applyFilters(data);
        setFilteredData(filtered);

        // Cập nhật dữ liệu xem trước
        setPreviewData(filtered.slice(0, 5));
    }, [data, filters]);

    // Set các cột mặc định được chọn khi component khởi tạo
    useEffect(() => {
        if (data && data.length > 0) {
            const columns = customerColumns;
            setSelectedColumns(columns.map((col) => col.key));

            // Tạo dữ liệu xem trước từ 5 dòng đầu tiên
            const filtered = applyFilters(data);
            setFilteredData(filtered);
            setPreviewData(filtered.slice(0, 5));
        }
    }, [data]);

    // Xử lý khi thay đổi lựa chọn cột
    const handleColumnsChange = (checkedValues) => {
        setSelectedColumns(checkedValues);
    };

    // Xử lý khi thay đổi bộ lọc
    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // Xử lý khi submit form
    const handleSubmit = () => {
        form.validateFields().then((values) => {
            // Chuẩn bị tùy chọn xuất
            const exportOptions = {
                type: "customers",
                columns: selectedColumns,
                includeHeader: includeHeader,
            };

            // Xuất dữ liệu theo định dạng đã chọn
            if (exportFormat === "excel") {
                exportToExcel(filteredData, customFileName, exportOptions);
            } else {
                exportToCSV(filteredData, customFileName, exportOptions);
            }

            onCancel();
        });
    };

    // Tạo các checkbox cho việc chọn cột
    const renderColumnCheckboxes = () => {
        return (
            <Checkbox.Group
                style={{ width: "100%" }}
                value={selectedColumns}
                onChange={handleColumnsChange}
            >
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {customerColumns.map((column) => (
                        <div
                            key={column.key}
                            style={{ width: "25%", marginBottom: 8 }}
                        >
                            <Checkbox value={column.key}>
                                {column.title}
                            </Checkbox>
                        </div>
                    ))}
                </div>
            </Checkbox.Group>
        );
    };

    // Định dạng tiền tệ
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value || 0);
    };

    // Định dạng ngày
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
    };

    // Chuẩn bị các cột để hiển thị xem trước
    const previewColumns = customerColumns
        .filter((col) => selectedColumns.includes(col.key))
        .map((col) => ({
            ...col,
            render: (text, record) => {
                // Xử lý trường hợp cột là chi nhánh
                if (col.key === "branch") {
                    return record.branch?.name || "";
                }

                // Xử lý trường hợp dataIndex là mảng (đường dẫn lồng nhau)
                if (Array.isArray(col.dataIndex)) {
                    let value = record;
                    for (const path of col.dataIndex) {
                        value = value?.[path];
                        if (value === undefined) break;
                    }
                    return value;
                }

                // Hiển thị loại khách hàng
                if (col.key === "type") {
                    const typeText =
                        text === "vip" ? "Khách VIP" : "Khách thường";
                    const typeColor = text === "vip" ? "#722ed1" : "#52c41a";
                    return <Tag color={typeColor}>{typeText}</Tag>;
                }

                // Hiển thị trạng thái
                if (col.key === "status") {
                    const statusText =
                        text === "active" ? "Đang hoạt động" : "Đã khóa";
                    const statusColor =
                        text === "active" ? "#52c41a" : "#ff4d4f";
                    return <Tag color={statusColor}>{statusText}</Tag>;
                }

                // Hiển thị tổng chi tiêu
                if (col.key === "totalSpent") {
                    return formatCurrency(text);
                }

                // Hiển thị các ngày tháng
                if (col.key === "birthday" || col.key === "createdAt") {
                    return formatDate(text);
                }

                return text;
            },
        }));

    return (
        <Modal
            title={<div style={{ textAlign: "center" }}>{title}</div>}
            open={open}
            onCancel={onCancel}
            width={900}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleSubmit}
                    disabled={filteredData.length === 0}
                >
                    Xuất dữ liệu ({filteredData.length} bản ghi)
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical">
                <Alert
                    message="Tùy chỉnh xuất dữ liệu khách hàng"
                    description="Bạn có thể tùy chỉnh thông tin xuất và xem trước dữ liệu trước khi xuất."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Định dạng tệp">
                            <Radio.Group
                                value={exportFormat}
                                onChange={(e) =>
                                    setExportFormat(e.target.value)
                                }
                                buttonStyle="solid"
                            >
                                <Radio.Button value="excel">
                                    <FileExcelOutlined /> Excel (.xlsx)
                                </Radio.Button>
                                <Radio.Button value="csv">
                                    <FileTextOutlined /> CSV (.csv)
                                </Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Tên tệp xuất">
                            <Input
                                placeholder="Nhập tên tệp"
                                value={customFileName}
                                onChange={(e) =>
                                    setCustomFileName(e.target.value)
                                }
                                suffix={
                                    exportFormat === "excel" ? ".xlsx" : ".csv"
                                }
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider>
                    <Space>
                        <FilterOutlined />
                        <span
                            style={{ cursor: "pointer" }}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            Bộ lọc dữ liệu {showFilters ? "(ẩn)" : "(hiện)"}
                        </span>
                    </Space>
                </Divider>

                {showFilters && (
                    <>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={8}>
                                <Form.Item label="Trạng thái">
                                    <Select
                                        placeholder="Tất cả trạng thái"
                                        value={filters.status}
                                        onChange={(value) =>
                                            handleFilterChange("status", value)
                                        }
                                        allowClear
                                        style={{ width: "100%" }}
                                    >
                                        <Option value="active">
                                            Đang hoạt động
                                        </Option>
                                        <Option value="blocked">Đã khóa</Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item label="Loại khách hàng">
                                    <Select
                                        placeholder="Tất cả loại"
                                        value={filters.type}
                                        onChange={(value) =>
                                            handleFilterChange("type", value)
                                        }
                                        allowClear
                                        style={{ width: "100%" }}
                                    >
                                        <Option value="normal">
                                            Khách thường
                                        </Option>
                                        <Option value="vip">Khách VIP</Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item label="Chi nhánh">
                                    <Select
                                        placeholder="Tất cả chi nhánh"
                                        value={filters.branchId}
                                        onChange={(value) =>
                                            handleFilterChange(
                                                "branchId",
                                                value
                                            )
                                        }
                                        allowClear
                                        style={{ width: "100%" }}
                                    >
                                        {branches.map((branch) => (
                                            <Option
                                                key={branch.id}
                                                value={branch.id}
                                            >
                                                {branch.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={12}>
                                <Form.Item label="Số lần đặt">
                                    <Input.Group compact>
                                        <Input
                                            style={{ width: "50%" }}
                                            placeholder="Tối thiểu"
                                            type="number"
                                            min={0}
                                            value={filters.minBookings}
                                            onChange={(e) =>
                                                handleFilterChange(
                                                    "minBookings",
                                                    e.target.value
                                                        ? Number(e.target.value)
                                                        : undefined
                                                )
                                            }
                                        />
                                        <Input
                                            style={{ width: "50%" }}
                                            placeholder="Tối đa"
                                            type="number"
                                            min={0}
                                            value={filters.maxBookings}
                                            onChange={(e) =>
                                                handleFilterChange(
                                                    "maxBookings",
                                                    e.target.value
                                                        ? Number(e.target.value)
                                                        : undefined
                                                )
                                            }
                                        />
                                    </Input.Group>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Tổng chi tiêu (VNĐ)">
                                    <Input.Group compact>
                                        <Input
                                            style={{ width: "50%" }}
                                            placeholder="Tối thiểu"
                                            type="number"
                                            min={0}
                                            value={filters.minSpent}
                                            onChange={(e) =>
                                                handleFilterChange(
                                                    "minSpent",
                                                    e.target.value
                                                        ? Number(e.target.value)
                                                        : undefined
                                                )
                                            }
                                        />
                                        <Input
                                            style={{ width: "50%" }}
                                            placeholder="Tối đa"
                                            type="number"
                                            min={0}
                                            value={filters.maxSpent}
                                            onChange={(e) =>
                                                handleFilterChange(
                                                    "maxSpent",
                                                    e.target.value
                                                        ? Number(e.target.value)
                                                        : undefined
                                                )
                                            }
                                        />
                                    </Input.Group>
                                </Form.Item>
                            </Col>
                        </Row>
                    </>
                )}

                <Divider>
                    <Space>
                        <SettingOutlined />
                        <span
                            style={{ cursor: "pointer" }}
                            onClick={() => setShowAdvanced(!showAdvanced)}
                        >
                            Tùy chọn nâng cao {showAdvanced ? "(ẩn)" : "(hiện)"}
                        </span>
                    </Space>
                </Divider>

                {showAdvanced && (
                    <>
                        <Form.Item label="Các cột cần xuất">
                            <div style={{ marginBottom: 8 }}>
                                <Space>
                                    <Button
                                        size="small"
                                        onClick={() =>
                                            setSelectedColumns(
                                                customerColumns.map(
                                                    (col) => col.key
                                                )
                                            )
                                        }
                                    >
                                        Chọn tất cả
                                    </Button>
                                    <Button
                                        size="small"
                                        onClick={() => setSelectedColumns([])}
                                    >
                                        Bỏ chọn tất cả
                                    </Button>
                                </Space>
                            </div>
                            {renderColumnCheckboxes()}
                        </Form.Item>

                        <Form.Item label="Tùy chọn khác">
                            <Checkbox
                                checked={includeHeader}
                                onChange={(e) =>
                                    setIncludeHeader(e.target.checked)
                                }
                            >
                                Bao gồm tiêu đề cột
                            </Checkbox>
                        </Form.Item>
                    </>
                )}

                <Divider>
                    <Space>
                        <EyeOutlined />
                        <span>Xem trước dữ liệu</span>
                    </Space>
                </Divider>

                <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">
                        Hiển thị {Math.min(5, filteredData.length)} bản ghi đầu
                        tiên trong tổng số {filteredData.length} bản ghi đã lọc
                        {filteredData.length !== data.length &&
                            ` (từ ${data.length} bản ghi ban đầu)`}
                    </Text>
                </div>

                {filteredData.length === 0 ? (
                    <Alert
                        type="warning"
                        message="Không có dữ liệu"
                        description="Không có dữ liệu nào thỏa mãn điều kiện lọc. Vui lòng thay đổi bộ lọc."
                        showIcon
                    />
                ) : (
                    <Table
                        columns={previewColumns}
                        dataSource={previewData}
                        rowKey={(record) =>
                            record.id ||
                            record.customer_code ||
                            Math.random().toString()
                        }
                        size="small"
                        pagination={false}
                        scroll={{ x: "max-content" }}
                    />
                )}
            </Form>
        </Modal>
    );
};

export default CustomerExportModal;
