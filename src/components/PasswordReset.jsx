import '../login.css'; // Use the same styling as Login
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Axios from './Axios.jsx';
import MyPassField from './forms/MyPassField';
import MyButton from './forms/MyButton';
import MyMessage from './Message';

const PasswordReset = () => {
    const navigate = useNavigate();
    const { handleSubmit, control, watch } = useForm();
    const { token } = useParams();
    const [showMessage, setShowMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const submission = async (data) => {
        setErrorMessage("");
        setLoading(true);

        if (data.password !== data.password2) {
            setErrorMessage("Passwords do not match!");
            setLoading(false);
            return;
        }

        try {
            await Axios.post(`/auth/password_reset/confirm/`, {
                password: data.password,
                token: token,
            });

            setShowMessage(true);
            setTimeout(() => {
                navigate('/');
            }, 5000);
        } catch (error) {
            setErrorMessage("Invalid or expired token. Please request a new reset link.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="floating-elements"></div>
            <form onSubmit={handleSubmit(submission)} className="login-card">
                <Typography variant="h4" className="login-title">Reset Your Password 🔑</Typography>
                <Typography className="login-subtitle">Enter a new password below</Typography>

                {showMessage && <MyMessage text="Your password has been reset! Redirecting to login..." color="#69C9AB" />}
                {errorMessage && <Typography className="error-message">{errorMessage}</Typography>}

                <Box className="input-group">
                    <MyPassField label="New Password" name="password" control={control} fullWidth />
                </Box>

                <Box className="input-group">
                    <MyPassField label="Confirm Password" name="password2" control={control} fullWidth />
                </Box>

                <MyButton label="Reset Password" type="submit" disabled={loading} className="login-btn" />
                <div>
                    <Typography>OR</Typography>
                </div>

                <Typography className="login-links">Remember your password? <a href="/">Login Again</a></Typography>
            </form>
        </div>
    );
};

export default PasswordReset;
