import '../login.css'; // Ensure consistency with Login page
import { useState } from 'react';
import { Box, Typography, InputAdornment } from '@mui/material';
import { Email } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Axios from './Axios.jsx';
import MyTextField from './forms/MyTextField';
import MyButton from './forms/MyButton';
import MyMessage from './Message';

const PasswordResetRequest = () => {
    const { handleSubmit, control } = useForm();
    const [showMessage, setShowMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const submission = async (data) => {
        setErrorMessage(""); // Reset error state
        try {
            await Axios.post('auth/password_reset/', { email: data.email });
            setShowMessage(true);
        } catch (error) {
            setErrorMessage("An error occurred. Please try again.");
        }
    };

    return (
        <div className="login-container"> {/* Same as Login Page */}
            <div className="floating-elements"></div>
            <form onSubmit={handleSubmit(submission)} className="login-card">
                <Typography variant="h4" className="login-title">Forgot Password? 🔑</Typography>
                <Typography className="login-subtitle">Enter your email to receive reset instructions</Typography>

                {showMessage && <MyMessage text="If your email exists, you will receive a reset link." color="#69C9AB" />}
                {errorMessage && <Typography className="error-message">{errorMessage}</Typography>}

                <Box className="input-group">
                    <InputAdornment position="start">
                        <Email className="input-icon" />
                    </InputAdornment>
                    <MyTextField label="Email" name="email" control={control} fullWidth />
                </Box>

                <MyButton label="Send Reset Link" type="submit" className="login-btn" />

                <Box className="login-links">
                    <Link to="/">Back to Login</Link>
                </Box>
            </form>
        </div>
    );
};

export default PasswordResetRequest;
