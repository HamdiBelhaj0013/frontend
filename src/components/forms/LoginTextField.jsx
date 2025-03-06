import React from "react";
import TextField from "@mui/material/TextField";
import { Controller } from "react-hook-form";

export default function LoginTextField({ label, name, control }) {
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
                    size="large" // 🟢 Makes the field smaller
                />
            )}
        />
    );
}
