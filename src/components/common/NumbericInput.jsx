import React from "react";
import { Input, Tooltip } from "antd";

const formatNumber = (value) => new Intl.NumberFormat().format(Number(value));

const NumericInput = ({ value = "", onChange, placeholder = "Input a number", maxLength = 16, tooltipTitle, ...restProps }) => {
    const handleChange = (e) => {
        const { value: inputValue } = e.target;
        const reg = /^-?\d*(\.\d*)?$/;
        if (reg.test(inputValue) || inputValue === "" || inputValue === "-") {
            onChange(inputValue);
        }
    };

    const handleBlur = () => {
        let valueTemp = value;
        if (valueTemp.charAt(valueTemp.length - 1) === "." || valueTemp === "-") {
            valueTemp = valueTemp.slice(0, -1);
        }
        onChange(valueTemp.replace(/^0*(\d+)/, "$1"));
    };

    const defaultTitle = value ? (value !== "-" ? formatNumber(value) : "-") : "Input a number";

    return (
        <Tooltip trigger={["focus"]} title={tooltipTitle ?? defaultTitle} placement="topLeft" classNames={{ root: "numeric-input" }}>
            <Input
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                maxLength={maxLength}
                {...restProps}
            />
        </Tooltip>
    );
};

export default NumericInput;
