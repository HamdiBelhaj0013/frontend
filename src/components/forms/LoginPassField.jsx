import React from "react";
import TextField from "@mui/material/TextField";
import { Controller } from "react-hook-form";

export default function LoginPassField({ label, name, control, InputProps }) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextField
                    onChange={onChange}
                    value={value}
                    label={label}
                    variant="outlined"
                    className="login-input"
                    error={!!error}
                    helperText={error?.message}
                    type="password"
                    size="small" // 🟢 Reduces field size
                    InputProps={InputProps}
                />
            )}
        />
    );
}
