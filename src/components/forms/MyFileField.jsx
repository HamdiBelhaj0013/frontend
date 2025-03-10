// src/components/forms/MyFileField.jsx
import React from 'react';
import { TextField } from '@mui/material';

const MyFileField = ({ label, name, control, ...props }) => {
    return (
        <TextField
            {...props}
            type="file"
            name={name}
            label={label}
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
        />
    );
};

export default MyFileField;
