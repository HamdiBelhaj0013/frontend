import { useState } from 'react';
import { Box, Typography, InputAdornment, IconButton } from '@mui/material';
import { Email, Business, UploadFile } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AxiosInstance from './Axios';
import MyTextField from './forms/MyTextField';
import MyButton from './forms/MyButton';
import '../login.css';

const schema = yup.object({
    name: yup.string().required('Association name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    matricule_fiscal: yup.string().required('Matricule fiscal is required'),
    cin_recto: yup.mixed().required('CIN Recto is required'),
    cin_verso: yup.mixed().required('CIN Verso is required'),
    rne_document: yup.mixed().required('RNE Document is required')
});

const RegisterAssociation = () => {
    const [registerError, setRegisterError] = useState("");
    const { handleSubmit, control, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const handleRegister = async (data) => {
        setRegisterError("");
        const formDataObj = new FormData();
        Object.keys(data).forEach((key) => {
            formDataObj.append(key, data[key]);
        });

        try {
            await AxiosInstance.post('/users/register-association/', formDataObj, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Association registered successfully!');
        } catch (error) {
            setRegisterError("Failed to register association. Please try again.");
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit(handleRegister)} className="login-card">
                <Typography variant="h4" className="login-title">Register Association 🚀</Typography>
                {registerError && <Typography className="error-message">{registerError}</Typography>}

                <Box className="input-group">
                    <InputAdornment position="start"><Business /></InputAdornment>
                    <MyTextField label="Association Name" name="name" control={control} fullWidth error={!!errors.name} helperText={errors.name?.message} />
                </Box>

                <Box className="input-group">
                    <InputAdornment position="start"><Email /></InputAdornment>
                    <MyTextField label="Email" name="email" control={control} fullWidth error={!!errors.email} helperText={errors.email?.message} />
                </Box>

                <Box className="input-group">
                    <MyTextField label="Matricule Fiscal" name="matricule_fiscal" control={control} fullWidth error={!!errors.matricule_fiscal} helperText={errors.matricule_fiscal?.message} />
                </Box>

                {/* File Upload Fields */}
                {['cin_recto', 'cin_verso', 'rne_document'].map((field) => (
                    <Box key={field} className="input-group">
                        <InputAdornment position="start"><UploadFile /></InputAdornment>
                        <Controller
                            name={field}
                            control={control}
                            defaultValue={null}
                            render={({ field: { onChange } }) => (
                                <input type="file" onChange={(e) => onChange(e.target.files[0])} className="form-control" />
                            )}
                        />
                        {errors[field] && <Typography color="error">{errors[field].message}</Typography>}
                    </Box>
                ))}

                <MyButton label="Register" type="submit" className="login-btn" />
            </form>
        </div>
    );
};

export default RegisterAssociation;
