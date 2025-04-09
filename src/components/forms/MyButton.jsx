import React from 'react';
import { Button } from '@mui/material';

/**
 * Enhanced button component with consistent styling
 */
const MyButton = ({
                      label,
                      type = 'button',
                      onClick,
                      fullWidth = false,
                      disabled = false,
                      variant = 'contained',
                      color = 'primary',
                      className = '',
                      size = 'medium',
                      startIcon = null,
                      endIcon = null,
                      sx = {},
                      ...rest
                  }) => {
    return (
        <Button
            type={type}
            onClick={onClick}
            fullWidth={fullWidth}
            disabled={disabled}
            variant={variant}
            color={color}
            className={className}
            size={size}
            startIcon={startIcon}
            endIcon={endIcon}
            sx={{
                textTransform: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                boxShadow: variant === 'contained' ? '0 4px 8px rgba(13, 71, 161, 0.3)' : 'none',
                padding: '8px 24px',
                height: '48px',
                ...sx
            }}
            {...rest}
        >
            {label}
        </Button>
    );
};

export default MyButton;