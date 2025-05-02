import dayjs from "dayjs";

/**
 * Định dạng ngày tháng theo kiểu Việt Nam
 * @param {string|Date} date - Ngày cần định dạng
 * @returns {string} - Chuỗi ngày đã định dạng
 */
export const formatDate = (date) => {
    if (!date) return "";

    try {
        return dayjs(date).format("DD/MM/YYYY");
    } catch (error) {
        return "";
    }
};

/**
 * Định dạng ngày tháng có cả giờ
 * @param {string|Date} datetime - Ngày giờ cần định dạng
 * @returns {string} - Chuỗi ngày giờ đã định dạng
 */
export const formatDateTime = (datetime) => {
    if (!datetime) return "";

    try {
        return dayjs(datetime).format("DD/MM/YYYY HH:mm");
    } catch (error) {
        return "";
    }
};

/**
 * Chuyển đổi ngày sang chuỗi định dạng ISO cho API
 * @param {string|Date|dayjs} date - Ngày cần chuyển đổi
 * @returns {string} - Chuỗi ngày định dạng ISO YYYY-MM-DD
 */
export const toISODateString = (date) => {
    if (!date) return null;

    try {
        return dayjs(date).format("YYYY-MM-DD");
    } catch (error) {
        return null;
    }
};

/**
 * Tính tuổi từ ngày sinh
 * @param {string|Date} birthdate - Ngày sinh
 * @returns {number} - Tuổi
 */
export const calculateAge = (birthdate) => {
    if (!birthdate) return null;

    try {
        const today = dayjs();
        const birthDay = dayjs(birthdate);

        return today.diff(birthDay, "year");
    } catch (error) {
        return null;
    }
};

/**
 * Kiểm tra xem một ngày có phải là ngày trong quá khứ
 * @param {string|Date} date - Ngày cần kiểm tra
 * @returns {boolean} - true nếu là ngày trong quá khứ
 */
export const isPastDate = (date) => {
    if (!date) return false;

    try {
        const today = dayjs().startOf("day");
        const checkDate = dayjs(date).startOf("day");

        return checkDate.isBefore(today);
    } catch (error) {
        return false;
    }
};

/**
 * Tính số ngày giữa hai ngày
 * @param {string|Date} startDate - Ngày bắt đầu
 * @param {string|Date} endDate - Ngày kết thúc
 * @returns {number} - Số ngày
 */
export const daysBetween = (startDate, endDate) => {
    if (!startDate || !endDate) return null;

    try {
        const start = dayjs(startDate);
        const end = dayjs(endDate);

        return end.diff(start, "day");
    } catch (error) {
        return null;
    }
};
