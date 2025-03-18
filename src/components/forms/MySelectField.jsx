import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import FormHelperText from '@mui/material/FormHelperText';
import { Controller } from "react-hook-form";

export default function MySelectField(props) {
    const { label, name, control, width = '100%', options = [] } = props; // Add options prop

    return (
        <FormControl variant="standard" sx={{ width }}>
            <InputLabel id={`${name}-label`}>{label}</InputLabel>
            <Controller
                name={name}
                control={control}
                render={({
                             field: { onChange, value },
                             fieldState: { error },
                         }) => (
                    <>
                        <Select
                            labelId={`${name}-label`}
                            id={`${name}-select`}
                            value={value || ''}
                            onChange={onChange}
                            error={!!error}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {options.map((option, index) => (
                                <MenuItem key={index} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                        {error && <FormHelperText>{error.message}</FormHelperText>}
                    </>
                )}
            />
        </FormControl>
    );
}
