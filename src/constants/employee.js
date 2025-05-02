export const EMPLOYEE_STATUS = {
    ACTIVE: "active",
    ON_LEAVE: "on_leave",
    INACTIVE: "inactive",
};

export const EMPLOYEE_STATUS_LABELS = {
    [EMPLOYEE_STATUS.ACTIVE]: "Đang làm việc",
    [EMPLOYEE_STATUS.ON_LEAVE]: "Nghỉ phép",
    [EMPLOYEE_STATUS.INACTIVE]: "Ngừng làm việc",
};

export const EMPLOYEE_STATUS_COLORS = {
    [EMPLOYEE_STATUS.ACTIVE]: "success",
    [EMPLOYEE_STATUS.ON_LEAVE]: "warning",
    [EMPLOYEE_STATUS.INACTIVE]: "error",
};

// Các trường bắt buộc khi tạo/cập nhật nhân viên
export const REQUIRED_EMPLOYEE_FIELDS = [
    "employee_code",
    "name",
    "email",
    "phone",
    "join_date",
    "department_id",
    "role_id",
];

// Các trường tùy chọn
export const OPTIONAL_EMPLOYEE_FIELDS = [
    "address",
    "avatar",
    "birthday",
    "status",
];

// Định dạng ngày tháng
export const DATE_FORMAT = "YYYY-MM-DD";

// Giới hạn kích thước file ảnh (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Các định dạng file ảnh được chấp nhận
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];
