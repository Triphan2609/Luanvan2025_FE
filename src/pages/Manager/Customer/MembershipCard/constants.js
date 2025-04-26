export const CARD_TYPE = {
    SILVER: "silver",
    GOLD: "gold",
    PLATINUM: "platinum",
};

export const CARD_STATUS = {
    ACTIVE: "active",
    EXPIRED: "expired",
    BLOCKED: "blocked",
};

export const POINT_TYPE = {
    EARN: "earn",
    REDEEM: "redeem",
    EXPIRE: "expire",
};

export const TYPE_CONFIGS = {
    [CARD_TYPE.SILVER]: {
        name: "Bạc",
        color: "#C0C0C0",
        minSpent: 5000000,
        pointRate: 1, // 1 point per 10,000 VND
        benefits: ["Tích 1 điểm/10,000đ", "Giảm 5% dịch vụ"],
    },
    [CARD_TYPE.GOLD]: {
        name: "Vàng",
        color: "#FFD700",
        minSpent: 15000000,
        pointRate: 1.5,
        benefits: ["Tích 1.5 điểm/10,000đ", "Giảm 10% dịch vụ", "Ưu tiên đặt phòng"],
    },
    [CARD_TYPE.PLATINUM]: {
        name: "Bạch kim",
        color: "#E5E4E2",
        minSpent: 30000000,
        pointRate: 2,
        benefits: ["Tích 2 điểm/10,000đ", "Giảm 15% dịch vụ", "Ưu tiên đặt phòng", "Dịch vụ VIP"],
    },
};
