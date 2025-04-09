import React, { forwardRef } from 'react';
import { TextField, MenuItem } from '@mui/material';
import { Controller } from 'react-hook-form';

/**
 * FormField component for handling text, password, email and select inputs
 * Using forwardRef to fix the ref warning
 */
const FormField = forwardRef(({
                                  name,
                                  label,
                                  control, // This is crucial for the Controller
                                  type = 'text',
                                  placeholder,
                                  fullWidth = true,
                                  required = false,
                                  error = false,
                                  helperText = '',
                                  InputProps = {},
                                  disabled = false,
                                  select = false,
                                  children,
                                  ...rest
                              }, ref) => {
    // Check if control is provided, if not, just render a normal TextField
    if (!control) {
        return (
            <TextField
                name={name}
                label={label}
                type={type}
                placeholder={placeholder}
                variant="outlined"
                fullWidth={fullWidth}
                required={required}
                error={error}
                helperText={helperText}
                disabled={disabled}
                InputLabelProps={{ shrink: true }}
                InputProps={InputProps}
                select={select}
                ref={ref}
                {...rest}
            >
                {children}
            </TextField>
        );
    }

    // If control is provided, use Controller
    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <TextField
                    {...field}
                    {...rest}
                    label={label}
                    type={type}
                    placeholder={placeholder}
                    variant="outlined"
                    fullWidth={fullWidth}
                    required={required}
                    error={error}
                    helperText={helperText}
                    disabled={disabled}
                    InputLabelProps={{ shrink: true }}
                    InputProps={InputProps}
                    select={select}
                    ref={ref}
                >
                    {children}
                </TextField>
            )}
        />
    );
});

// Add display name for debugging
FormField.displayName = 'FormField';

export default FormField;