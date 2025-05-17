import React, { useEffect } from "react";
import { Modal, Form, Input, Switch, Select, message, InputNumber } from "antd";
import { getRestaurantBranches } from "../../../../../../api/branchesApi";
import { foodApi } from "../../../../../../api/restaurantApi";

const MENU_TYPES = [
    { label: "Thực đơn chính", value: "REGULAR" },
    { label: "Thực đơn theo mùa", value: "SEASONAL" },
    { label: "Combo món ăn", value: "COMBO" },
];

const SEASONS = [
    { label: "Xuân", value: "SPRING" },
    { label: "Hạ", value: "SUMMER" },
    { label: "Thu", value: "AUTUMN" },
    { label: "Đông", value: "WINTER" },
];

const EditMenuModal = ({ visible, menu, onCancel, onSubmit }) => {
    const [form] = Form.useForm();
    const [branches, setBranches] = React.useState([]);
    const [foods, setFoods] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [menuType, setMenuType] = React.useState("REGULAR");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [branchesData, foodsResponse] = await Promise.all([
                    getRestaurantBranches(),
                    foodApi.getAllFoods(),
                ]);
                setBranches(branchesData);
                // Đảm bảo foods là một mảng
                setFoods(
                    Array.isArray(foodsResponse?.data) ? foodsResponse.data : []
                );
            } catch (error) {
                console.error("Error fetching data:", error);
                message.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (menu) {
            form.setFieldsValue({
                name: menu.name,
                description: menu.description,
                isActive: menu.isActive,
                branchId: menu.branch?.id,
                foodIds: menu.foods?.map((food) => food.id),
                type: menu.type || "REGULAR",
                season: menu.season,
                price: menu.price,
            });
            setMenuType(menu.type || "REGULAR");
        }
    }, [menu, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values);
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    return (
        <Modal
            title="Chỉnh sửa menu"
            open={visible}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="Tên menu"
                    rules={[
                        { required: true, message: "Vui lòng nhập tên menu" },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                    <Input.TextArea />
                </Form.Item>

                <Form.Item
                    name="isActive"
                    label="Trạng thái"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>

                <Form.Item
                    name="branchId"
                    label="Chi nhánh"
                    rules={[
                        { required: true, message: "Vui lòng chọn chi nhánh" },
                    ]}
                >
                    <Select>
                        {branches.map((branch) => (
                            <Select.Option key={branch.id} value={branch.id}>
                                {branch.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="foodIds"
                    label="Món ăn"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng chọn ít nhất một món ăn",
                        },
                    ]}
                >
                    <Select mode="multiple" placeholder="Chọn món ăn">
                        {Array.isArray(foods) &&
                            foods.map((food) => (
                                <Select.Option key={food.id} value={food.id}>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <span>{food.name}</span>
                                        <span
                                            style={{
                                                color: "#888",
                                                fontSize: 12,
                                                marginLeft: 8,
                                            }}
                                        >
                                            {food.price
                                                ? new Intl.NumberFormat(
                                                      "vi-VN",
                                                      {
                                                          style: "currency",
                                                          currency: "VND",
                                                      }
                                                  ).format(food.price)
                                                : ""}
                                        </span>
                                    </div>
                                </Select.Option>
                            ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="type"
                    label="Loại thực đơn"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng chọn loại thực đơn",
                        },
                    ]}
                >
                    <Select
                        options={MENU_TYPES}
                        onChange={(val) => {
                            setMenuType(val);
                            form.setFieldsValue({
                                season: undefined,
                                price: undefined,
                            });
                        }}
                    />
                </Form.Item>

                {menuType === "SEASONAL" && (
                    <Form.Item
                        name="season"
                        label="Mùa"
                        rules={[
                            { required: true, message: "Vui lòng chọn mùa" },
                        ]}
                    >
                        <Select options={SEASONS} />
                    </Form.Item>
                )}

                {menuType === "COMBO" && (
                    <Form.Item
                        name="price"
                        label="Giá combo"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập giá combo",
                            },
                        ]}
                    >
                        <InputNumber style={{ width: "100%" }} min={0} />
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
};

export default EditMenuModal;
