import React, { useState, useEffect } from 'react';
import { Box, Typography, InputAdornment, IconButton, MenuItem, Select, FormControl, InputLabel, Snackbar, Alert, Stepper, Step, StepLabel } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, AlternateEmail, Person, ArrowForward, ArrowBack } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AxiosInstance from './Axios';
import MyTextField from './forms/MyTextField';
import MyPassField from './forms/MyPassField';
import MyButton from './forms/MyButton';
import '../assets/Styles/Register.css';
import backgroundImage from "../assets/blue-stationery-table.jpg";
import logo from '../assets/logowhite.png';

const Register = () => {
    // Navigation and state hooks
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [registerError, setRegisterError] = useState("");
    const [associations, setAssociations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [activeStep, setActiveStep] = useState(0);

    // Steps for the registration process
    const steps = ['Account Details', 'Association'];

    // Fetch associations on component mount
    useEffect(() => {
        const fetchAssociations = async () => {
            try {
                const response = await AxiosInstance.get('/users/associations/');
                setAssociations(response.data);
            } catch (error) {
                console.error('Error fetching associations:', error);
                setRegisterError("Error fetching associations. Please try again later.");
            }
        };
        fetchAssociations();
    }, []);

    // UI event handlers
    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') return;
        setNotification({ ...notification, open: false });
    };

    // Form validation schema
    const schema = yup.object({
        fullName: yup.string()
            .required('Full name is required')
            .min(3, 'Full name must be at least 3 characters'),
        email: yup.string()
            .email('Invalid email address')
            .required('Email is required'),
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
        association: yup.number().nullable().required('Association is required'),
    });

    // Initialize form with react-hook-form
    const { control, handleSubmit, setValue, getValues, formState: { errors }, trigger } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            password2: '',
            association: null
        }
    });

    // Step navigation handlers
    const moveToNextStep = async () => {
        if (activeStep === 0) {
            const fieldsToValidate = ['fullName', 'email', 'password', 'password2'];
            const isValid = await trigger(fieldsToValidate);

            if (isValid) {
                setActiveStep(1);
            }
        }
    };

    const moveToPreviousStep = () => {
        setActiveStep(0);
    };

    // Form submission handler
    const onSubmit = async (data) => {
        // For the final step, we need to validate the association
        if (activeStep === 1) {
            const isAssociationValid = await trigger('association');
            if (!isAssociationValid) return;
        }

        setLoading(true);
        setRegisterError("");

        try {
            const response = await AxiosInstance.post('/users/register/', {
                email: data.email.trim().toLowerCase(),
                password: data.password,
                full_name: data.fullName.trim(),
                association_id: data.association,
            });

            setNotification({
                open: true,
                message: 'Registration successful! Redirecting to login...',
                severity: 'success'
            });

            // Small delay for better UX
            setTimeout(() => {
                navigate('/', {
                    state: {
                        message: 'Registration successful! Please log in.',
                        status: 'success'
                    }
                });
            }, 1500);

        } catch (error) {
            setLoading(false);
            console.error("Registration error:", error);

            const errorMessage = error.response?.data.message || "An unexpected error occurred";
            setRegisterError(errorMessage);

            setNotification({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        }
    };

    return (
        <div className="login-container">
            {/* Notification system */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    sx={{ width: '100%', fontWeight: 'medium' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>

            {/* Background and overlay */}
            <div className="background-image" style={{ backgroundImage: `url(${backgroundImage})` }} />
            <div className="gradient-overlay" />

            {/* Left panel with branding */}
            <div className="left-panel">
                <div className="welcome-content">
                    <Typography variant="h3" className="welcome-title">Create Your Account</Typography>
                    <div className="brand-container">
                        <img src={logo} alt="Company Logo" style={{ width: '80%', maxWidth: '500px', height: 'auto' }} />
                    </div>
                    <Typography variant="h6" className="welcome-subtitle">
                        Join our platform and unlock powerful features for your association
                    </Typography>

                    {/* Feature highlights */}
                    <div className="feature-highlights">
                        <Typography variant="body1" className="highlight-text">
                            "A platform designed to streamline association management"
                        </Typography>
                        <Typography variant="body2" className="highlight-author">
                            - John Doe, Association Manager
                        </Typography>
                    </div>
                </div>
            </div>

            {/* Right panel with registration form */}
            <div className="right-panel">
                <form onSubmit={handleSubmit(onSubmit)} className="login-card" data-testid="register-form" noValidate>
                    <Typography variant="h4" className="login-title">Sign Up 🚀</Typography>
                    <Typography className="login-subtitle" sx={{ mb: 3 }}>Complete the steps below to get started</Typography>

                    {registerError && (
                        <div className="error-message">
                            <span className="error-icon">!</span>
                            <span>{registerError}</span>
                        </div>
                    )}

                    {/* Stepper component */}
                    <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                        {steps.map((label, index) => (
                            <Step key={index}>
                                <StepLabel>
                                    <Typography sx={{ color: 'white', fontSize: '0.875rem' }}>{label}</Typography>
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {/* Step 1: Account Details */}
                    {activeStep === 0 && (
                        <Box>
                            {/* Full Name field */}
                            <Box className="input-group">
                                <MyTextField
                                    label="Full Name"
                                    name="fullName"
                                    control={control}
                                    fullWidth
                                    placeholder="John Doe"
                                    error={!!errors.fullName}
                                    helperText={errors.fullName?.message}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Person style={{ color: '#fff' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>

                            {/* Email field */}
                            <Box className="input-group">
                                <MyTextField
                                    label="Email address"
                                    name="email"
                                    control={control}
                                    fullWidth
                                    placeholder="your.email@example.com"
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email style={{ color: '#fff' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>

                            {/* Password field */}
                            <Box className="input-group">
                                <MyPassField
                                    label="Password"
                                    name="password"
                                    control={control}
                                    fullWidth
                                    type={showPassword ? "text" : "password"}
                                    error={!!errors.password}
                                    helperText={errors.password?.message}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock style={{ color: '#fff' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={togglePasswordVisibility}
                                                    className="visibility-toggle"
                                                    edge="end"
                                                    aria-label="toggle password visibility"
                                                    style={{ color: '#ffffff' }}
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>

                            {/* Confirm Password field */}
                            <Box className="input-group">
                                <MyPassField
                                    label="Confirm Password"
                                    name="password2"
                                    control={control}
                                    fullWidth
                                    type={showPassword ? "text" : "password"}
                                    error={!!errors.password2}
                                    helperText={errors.password2?.message}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock style={{ color: '#fff' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                        </Box>
                    )}

                    {/* Step 2: Association */}
                    {activeStep === 1 && (
                        <Box>
                            {/* Association field */}
                            <Box className="input-group">
                                <FormControl fullWidth error={!!errors.association}>
                                    <InputLabel style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Association</InputLabel>
                                    <Controller
                                        name="association"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                label="Association"
                                                style={{ color: '#fff' }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            backgroundColor: '#fff',
                                                            color: '#333'
                                                        }
                                                    }
                                                }}
                                            >
                                                {associations.map((association) => (
                                                    <MenuItem key={association.id} value={association.id}>
                                                        {association.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                    {errors.association && <Typography color="error" variant="body2">{errors.association.message}</Typography>}
                                </FormControl>
                            </Box>

                            {/* Association registration link */}
                            <Box className="association-link-container" sx={{ mt: 2, mb: 2 }}>
                                <Typography variant="body2" color="white" sx={{ mb: 1 }}>
                                    Don't see your association?
                                </Typography>
                                <Link to="/associationregister" className="association-link">
                                    <AlternateEmail style={{ marginRight: '8px', fontSize: '1rem' }} />
                                    Register Your Association
                                </Link>
                            </Box>
                        </Box>
                    )}

                    {/* Navigation buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                        {activeStep === 0 ? (
                            <div style={{ width: '100px' }}></div> // Empty space for alignment
                        ) : (
                            <button
                                type="button"
                                onClick={moveToPreviousStep}
                                className="back-button"
                                style={{
                                    padding: '8px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: 'transparent',
                                    color: 'white',
                                    border: '1px solid white',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                <ArrowBack style={{ marginRight: '8px' }} />
                                Back
                            </button>
                        )}

                        {activeStep === 0 ? (
                            <button
                                type="button"
                                onClick={moveToNextStep}
                                className="next-button"
                                style={{
                                    padding: '8px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: '#1976d2',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Next
                                <ArrowForward style={{ marginLeft: '8px' }} />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="submit-button"
                                disabled={loading}
                                style={{
                                    padding: '8px 24px',
                                    background: '#1976d2',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? "Signing Up..." : "Sign Up"}
                            </button>
                        )}
                    </Box>

                    {/* Login link */}
                    <div className="login-links" style={{ marginTop: '20px' }}>
                        <Link to="/">Already have an account? Log in</Link>
                    </div>
                </form>

                {/* Footer links */}
                <div className="login-footer">
                    <Link to="/help" className="footer-link">Help</Link>
                    <Link to="/privacy" className="footer-link">Privacy</Link>
                    <Link to="/terms" className="footer-link">Terms</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;