import React from "react";
import { Modal, Input } from "antd";

const OrderNoteModal = ({
    visible,
    item,
    value,
    onChange,
    onClose,
    onSave,
}) => {
    return (
        <Modal
            title={`Ghi chú cho món: ${item?.name || ""}`}
            open={visible}
            onOk={onSave}
            onCancel={onClose}
            width={500}
            okText="Lưu"
            cancelText="Hủy"
        >
            <Input.TextArea
                rows={3}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Ví dụ: Ít cay, không hành, mang về..."
            />
        </Modal>
    );
};

export default OrderNoteModal;
