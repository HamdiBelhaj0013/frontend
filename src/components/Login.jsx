import { React, useState } from 'react';
import { Box, Typography, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Axios from './Axios.jsx';
import MyTextField from './forms/MyTextField';
import MyPassField from './forms/MyPassField';
import MyButton from './forms/MyButton';
import '../login.css';

const Login = () => {
    const navigate = useNavigate();
    const { handleSubmit, control, setError } = useForm();
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState("");

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const handleLogin = async (data) => {
        setLoginError(""); // Reset error message
        try {
            const response = await Axios.post('/users/login/', {
                email: data.email.trim().toLowerCase(),
                password: data.password,
            });

            localStorage.setItem('Token', response.data.token);
            navigate('/home');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setError("email", { type: "manual", message: "Invalid email or password" });
                setError("password", { type: "manual", message: "Invalid email or password" });
                setLoginError("❌ Invalid email or password. Please try again.");
            } else {
                setLoginError("⚠️ An unexpected error occurred. Please try again later.");
            }
        }
    };

    return (
        <div className="login-container">
            <div className="floating-elements"></div>
            <form onSubmit={handleSubmit(handleLogin)} className="login-card">
                <Typography variant="h4" className="login-title">Welcome Back! 🚀</Typography>
                <Typography className="login-subtitle">Log in to explore amazing features</Typography>

                {loginError && (
                    <Typography className="error-message">
                        {loginError}
                    </Typography>
                )}

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

                <MyButton label="Log In" type="submit" className="login-btn" />

                <Box className="login-links">
                    <Link to="/request/password_reset">Forgot password?</Link>
                    <Link to="/register">Create an account</Link>
                </Box>
            </form>
        </div>
    );
};

export default Login;
