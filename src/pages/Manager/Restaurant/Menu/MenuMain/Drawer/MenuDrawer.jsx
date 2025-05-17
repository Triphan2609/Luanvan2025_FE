import React, { useState } from "react";
import {
    Drawer,
    Descriptions,
    Button,
    Space,
    Tag,
    Table,
    Typography,
    Divider,
    Statistic,
    Row,
    Col,
    List,
    Upload,
    message,
} from "antd";
import {
    EditOutlined,
    ShoppingOutlined,
    DollarOutlined,
    DragOutlined,
    UploadOutlined,
    DownloadOutlined,
} from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import * as XLSX from "xlsx";
import { menuApi } from "../../../../../../api/menuApi";

const { Title } = Typography;

const formatVND = (value) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value);

export default function MenuDrawer({
    visible,
    onClose,
    menu,
    onEdit,
    allFoods = [],
    onUpdate,
}) {
    const [dishes, setDishes] = useState(
        Array.isArray(menu?.foods) ? menu.foods : []
    );
    const [loadingOrder, setLoadingOrder] = useState(false);

    React.useEffect(() => {
        setDishes(Array.isArray(menu?.foods) ? menu.foods : []);
    }, [menu]);

    if (!menu) return null;

    const menuFoods = dishes;
    const totalPrice = menuFoods.reduce(
        (sum, food) => sum + (Number(food.price) || 0),
        0
    );

    const handleDragEnd = async (result) => {
        if (!result.destination) return;
        const items = Array.from(dishes);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setDishes(items);
        setLoadingOrder(true);
        try {
            await menuApi.updateFoodOrder(
                menu.id,
                items.map((f) => f.id)
            );
        } catch (error) {
            // Optionally: Hiển thị message lỗi
        } finally {
            setLoadingOrder(false);
        }
    };

    const handleExport = () => {
        try {
            const exportData = dishes.map((dish, index) => ({
                STT: index + 1,
                "Tên món": dish.name,
                Giá: dish.price,
                "Mô tả": dish.description,
                "Danh mục": dish.category,
                "Trạng thái": dish.isActive ? "Đang phục vụ" : "Ngừng phục vụ",
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Thực đơn");
            XLSX.writeFile(wb, `${menu.name}_thuc_don.xlsx`);
            message.success("Xuất thực đơn thành công!");
        } catch (error) {
            message.error("Lỗi khi xuất thực đơn!");
        }
    };

    const handleImport = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                // Chuyển đổi dữ liệu Excel thành định dạng món ăn
                const importedDishes = jsonData.map((item) => ({
                    name: item["Tên món"],
                    price: item["Giá"],
                    description: item["Mô tả"],
                    category: item["Danh mục"],
                    isActive: item["Trạng thái"] === "Đang phục vụ",
                }));

                setDishes(importedDishes);
                onUpdate(menu.id, { dishes: importedDishes });
                message.success("Import thực đơn thành công!");
            } catch (error) {
                message.error("Lỗi khi import thực đơn!");
            }
        };
        reader.readAsArrayBuffer(file);
        return false;
    };

    const columns = [
        {
            title: "STT",
            width: 60,
            render: (_, __, index) => index + 1,
        },
        {
            title: "Tên món",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Giá",
            dataIndex: "price",
            key: "price",
            align: "right",
            render: (price) => formatVND(Number(price) || 0),
        },
    ];

    const DraggableContainer = (props) => (
        <Droppable droppableId="table-body">
            {(provided) => (
                <tbody
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    {...props}
                >
                    {props.children}
                    {provided.placeholder}
                </tbody>
            )}
        </Droppable>
    );

    const DraggableBodyRow = (props) => {
        const { index, className, style, ...restProps } = props;
        // Nếu index là undefined (row header/footer) hoặc không có item, render row thường
        if (typeof index !== "number" || !dishes[index] || !dishes[index].id) {
            return <tr className={className} style={style} {...restProps} />;
        }
        const rowId = String(dishes[index].id);
        return (
            <Draggable draggableId={rowId} index={index} key={rowId}>
                {(provided, snapshot) => (
                    <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={className}
                        style={{
                            ...style,
                            ...provided.draggableProps.style,
                            background: snapshot.isDragging
                                ? "#fafafa"
                                : undefined,
                        }}
                    >
                        {restProps.children}
                    </tr>
                )}
            </Draggable>
        );
    };

    return (
        <Drawer
            title={menu.name}
            placement="right"
            onClose={onClose}
            open={visible}
            width={700}
            extra={
                <Space>
                    <Upload
                        accept=".xlsx,.xls"
                        beforeUpload={handleImport}
                        showUploadList={false}
                    >
                        <Button icon={<UploadOutlined />}>Import Excel</Button>
                    </Upload>
                    <Button icon={<DownloadOutlined />} onClick={handleExport}>
                        Export Excel
                    </Button>
                </Space>
            }
        >
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <Statistic
                        title="Số món ăn"
                        value={menuFoods.length}
                        prefix={<ShoppingOutlined />}
                    />
                </Col>
                <Col span={12}>
                    <Statistic
                        title="Tổng giá trị"
                        value={formatVND(totalPrice)}
                        prefix={<DollarOutlined />}
                    />
                </Col>
            </Row>

            <Divider />

            <Descriptions column={1} bordered>
                <Descriptions.Item label="Trạng thái">
                    <Tag color={menu.status ? "green" : "red"}>
                        {menu.status ? "Đang hiển thị" : "Đã ẩn"}
                    </Tag>
                </Descriptions.Item>
                {menu.type === "COMBO" && (
                    <Descriptions.Item label="Giá combo">
                        {menu.price ? formatVND(menu.price) : "Chưa cập nhật"}
                    </Descriptions.Item>
                )}
                <Descriptions.Item label="Mô tả">
                    {menu.description || "Không có mô tả"}
                </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Danh sách món ăn</Divider>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Table
                    dataSource={menuFoods}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    locale={{ emptyText: "No data" }}
                    loading={loadingOrder}
                    components={{
                        body: {
                            wrapper: DraggableContainer,
                            row: DraggableBodyRow,
                        },
                    }}
                />
            </DragDropContext>
        </Drawer>
    );
}
