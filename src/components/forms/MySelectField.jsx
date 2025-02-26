import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import FormHelperText from '@mui/material/FormHelperText';
import { Controller } from "react-hook-form";

export default function MySelectField(props) {
    const { label, name, control, width = '100%' } = props; // Default width to '100%' if not provided

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
                            value={value || ''} // Ensure value is not undefined
                            onChange={onChange}
                            error={!!error}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Completed">Completed</MenuItem>
                            <MenuItem value="In progress">In progress</MenuItem>
                        </Select>
                        {error && <FormHelperText>{error.message}</FormHelperText>}
                    </>
                )}
            />
        </FormControl>
    );
}
