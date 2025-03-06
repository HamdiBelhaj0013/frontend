import { useState } from 'react';
import { Box, Typography, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AxiosInstance from './Axios';
import MyTextField from './forms/MyTextField';
import MyPassField from './forms/MyPassField';
import MyButton from './forms/MyButton';
import '../login.css'; // Ensure styles match login page

const Register = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [registerError, setRegisterError] = useState("");

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const schema = yup.object({
        email: yup.string().email('Invalid email address').required('Email is required'),
        password: yup.string()
            .required('Password is required')
            .min(8, 'Password must be at least 8 characters')
            .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
            .matches(/[a-z]/, 'Must contain at least one lowercase letter')
            .matches(/[0-9]/, 'Must contain at least one number')
            .matches(/[!@#$%^&*(),.?":;{}|<>+]/, 'Must contain at least one special character'),
        password2: yup.string()
            .required('Password confirmation is required')
            .oneOf([yup.ref('password'), null], 'Passwords must match'),
    });

    const { handleSubmit, control, setError } = useForm({ resolver: yupResolver(schema) });

    const handleRegister = async (data) => {
        setRegisterError(""); // Reset error message
        try {
            await AxiosInstance.post('/users/register/', {
                email: data.email,
                password: data.password,
            });
            navigate('/');
        } catch (error) {
            if (error.response) {
                setRegisterError(error.response.data.message || "An error occurred. Try again.");
            } else {
                setRegisterError("An unexpected error occurred. Please try again later.");
            }
        }
    };

    return (
        <div className="login-container"> {/* Same container class as Login */}
            <div className="floating-elements"></div>
            <form onSubmit={handleSubmit(handleRegister)} className="login-card">
                <Typography variant="h4" className="login-title">Create an Account 🚀</Typography>
                <Typography className="login-subtitle">Sign up and explore amazing features</Typography>

                {registerError && <Typography className="error-message">{registerError}</Typography>}

                <Box className="input-group">
                    <InputAdornment position="start">
                        <Email className="input-icon" />
                    </InputAdornment>
                    <MyTextField label="Email" name="email" control={control} fullWidth />
                </Box>

                <Box className="input-group">
                    <InputAdornment position="start">
                        <Lock className="input-icon" />
                    </InputAdornment>
                    <MyPassField
                        label="Password"
                        name="password"
                        control={control}
                        fullWidth
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={togglePasswordVisibility}>
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <Box className="input-group">
                    <InputAdornment position="start">
                        <Lock className="input-icon" />
                    </InputAdornment>
                    <MyPassField
                        label="Confirm Password"
                        name="password2"
                        control={control}
                        fullWidth
                    />
                </Box>

                <MyButton label="Sign Up" type="submit" className="login-btn" />

                <Box className="login-links">
                    <Link to="/">Already have an account? Log in</Link>
                </Box>
            </form>
        </div>
    );
};

export default Register;
