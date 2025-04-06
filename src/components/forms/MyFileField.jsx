import React from 'react';
import { TextField } from '@mui/material';
import { Controller } from 'react-hook-form';

const MyTextField = ({ name, control, label, defaultValue = '', rules = {}, ...props }) => {
    return (
        <Controller
            name={name}
            control={control}
            defaultValue={defaultValue}
            rules={rules}
            render={({ field, fieldState: { error } }) => (
                <TextField
                    {...field}
                    label={label}
                    error={!!error}
                    helperText={error ? error.message : ''}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    {...props}
                />
            )}
        />
    );
};

export default MyTextField;