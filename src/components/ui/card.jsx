import React from "react";
import clsx from "clsx";

/**
 * Card - khung bo góc + đổ bóng
 */
export function Card({ className, children, ...props }) {
    return (
        <div className={clsx("rounded-2xl shadow-md bg-white p-4 border border-gray-100", className)} {...props}>
            {children}
        </div>
    );
}

/**
 * CardContent - nội dung bên trong card
 */
export function CardContent({ className, children, ...props }) {
    return (
        <div className={clsx("mt-2", className)} {...props}>
            {children}
        </div>
    );
}
