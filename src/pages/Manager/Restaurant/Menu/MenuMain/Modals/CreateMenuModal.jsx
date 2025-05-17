import React from "react";
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

const CreateMenuModal = ({ visible, onCancel, onSubmit }) => {
    const [form] = Form.useForm();
    const [branches, setBranches] = React.useState([]);
    const [foods, setFoods] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [menuType, setMenuType] = React.useState("REGULAR");

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [branchesData, foodsResponse] = await Promise.all([
                    getRestaurantBranches(),
                    foodApi.getAllFoods(),
                ]);
                setBranches(branchesData);
                setFoods(
                    Array.isArray(foodsResponse.data) ? foodsResponse.data : []
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

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values);
            form.resetFields();
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    return (
        <Modal
            title="Thêm menu mới"
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
                    initialValue={true}
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
                    <Select mode="multiple">
                        {Array.isArray(foods) &&
                            foods.map((food) => (
                                <Select.Option key={food.id} value={food.id}>
                                    {food.name}
                                </Select.Option>
                            ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="type"
                    label="Loại thực đơn"
                    initialValue="REGULAR"
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

export default CreateMenuModal;
