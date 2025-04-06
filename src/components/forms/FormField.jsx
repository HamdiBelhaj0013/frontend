import React from "react";
import TextField from "@mui/material/TextField";
import { Controller } from "react-hook-form";

/**
 * FormField - A unified form field component that handles both text and password inputs
 *
 * @param {Object} props - Component props
 * @param {string} props.label - Input field label
 * @param {string} props.name - Field name for form control
 * @param {Object} props.control - React Hook Form control object
 * @param {boolean} props.fullWidth - Whether the field should take full width
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.error - Error state
 * @param {string} props.helperText - Helper text or error message
 * @param {Object} props.InputProps - Props for the Input component
 * @param {Object} props.sx - Style overrides
 * @param {string} props.type - Input type (text, password, email, etc)
 */
export default function FormField({
                                      label,
                                      name,
                                      control,
                                      fullWidth = true,
                                      placeholder = "",
                                      error,
                                      helperText,
                                      InputProps = {},
                                      sx = {},
                                      type = "text",
                                      ...rest
                                  }) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value }, fieldState: { error: fieldError } }) => (
                <TextField
                    onChange={onChange}
                    value={value || ''}
                    label={label}
                    variant="outlined"
                    fullWidth={fullWidth}
                    placeholder={placeholder}
                    className="form-field"
                    error={error || !!fieldError}
                    helperText={helperText || fieldError?.message}
                    type={type}
                    size="medium"
                    InputProps={{
                        sx: {
                            '& input': {
                                padding: '12px 14px',
                            },
                            ...InputProps.sx
                        },
                        ...InputProps
                    }}
                    sx={{
                        '& .MuiInputBase-root': {
                            borderRadius: '8px',
                        },
                        '& .MuiInputBase-input': {
                            color: '#111',
                        },
                        '& .MuiInputLabel-root': {
                            color: '#555',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#bdbdbd',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#0d47a1',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#0d47a1',
                        },
                        ...sx
                    }}
                    {...rest}
                />
            )}
        />
    );
}