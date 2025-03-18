import { React, useState } from 'react';
import { Box, Typography, IconButton, InputAdornment, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Axios from './Axios.jsx';
import MyTextField from './forms/MyTextField';
import MyPassField from './forms/MyPassField';
import MyButton from './forms/MyButton';
import '../login.css';
import backgroundImage from '../assets/blue-stationery-table.jpg';

const Login = () => {
    const navigate = useNavigate();
    const { handleSubmit, control, setError } = useForm();
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [loading, setLoading] = useState(false);

    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

    const handleLogin = async (data) => {
        setLoading(true);
        setLoginError("");

        try {
            const response = await Axios.post('/users/login/', {
                email: data.email.trim().toLowerCase(),
                password: data.password,
            });

            localStorage.setItem('Token', response.data.token);
            navigate('/home');

        } catch (error) {
            setLoading(false);
            console.error("Login Error:", error);

            if (error.response) {
                if (error.response.status === 401) {
                    setError("email", { type: "manual", message: "Invalid email or password" });
                    setError("password", { type: "manual", message: "Invalid email or password" });
                    setLoginError("❌ Invalid email or password. Please try again.");
                } else {
                    setLoginError(`⚠️ Error: ${error.response.data.message || "Something went wrong. Try again later."}`);
                }
            } else {
                setLoginError("⚠️ Network error. Please check your connection and try again.");
            }
        }
    };

    return (
        <div className="login-container">
            <div className="background-image" style={{ backgroundImage: `url(${backgroundImage})` }} />
            <div className="gradient-overlay" />
            <div className="left-panel">
                <Typography variant="h3">Welcome to Your Account Portal</Typography>
                <Typography variant="h6">Securely access your dashboard to manage settings and review updates.</Typography>
            </div>
            <div className="right-panel">
                <form onSubmit={handleSubmit(handleLogin)} className="login-card">
                    <Typography variant="h4" className="login-title">Sign In to Your Account</Typography>
                    <Typography className="login-subtitle">Enter your credentials to access your personalized dashboard</Typography>

                    {loginError && <Typography className="error-message">{loginError}</Typography>}

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
                            type={showPassword ? "text" : "password"}
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

                    <MyButton
                        label={loading ? <CircularProgress size={24} color="inherit" /> : "Log In"}
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                    />

                    <Box className="login-links">
                        <Link to="/request/password_reset">Forgot password?</Link>
                        <Link to="/register">Create an account</Link>
                    </Box>
                    <Box className="or-container">
                        <Typography variant="body2" component="p" className="or-text">
                            OR
                        </Typography>
                        <Box className="register-link-container">
                            <Link to="/associationregister" className="register-link">
                                <Typography variant="button">
                                    Register Your Association to Join
                                </Typography>
                            </Link>
                        </Box>
                    </Box>
                </form>
            </div>
        </div>
    );
};

export default Login;
