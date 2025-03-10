import { useState, useEffect } from 'react';
import { Box, Typography, InputAdornment, IconButton, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AxiosInstance from './Axios';
import MyTextField from './forms/MyTextField';
import MyPassField from './forms/MyPassField';
import MyButton from './forms/MyButton';
import '../login.css';

const Register = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [registerError, setRegisterError] = useState("");
    const [associations, setAssociations] = useState([]);

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
        association: yup.object().nullable().required('Association is required'),
    });

    const { handleSubmit, control, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            association: null
        }
    });

    const handleRegister = async (data) => {
        setRegisterError(""); // Clear any previous errors

        // Log data to ensure it's formatted correctly
        console.log("Form data being sent:", data);

        try {
            const response = await AxiosInstance.post('/users/register/', {
                email: data.email,
                password: data.password,
                association_id: data.association?.id, // Send only the association ID
            });

            navigate('/'); // Redirect to homepage on successful registration
        } catch (error) {
            console.error("Registration error:", error);

            // Handle errors returned from the backend
            if (error.response) {
                setRegisterError(error.response.data.message || "Registration failed");
            } else {
                setRegisterError("An unexpected error occurred");
            }
        }
    };

    return (
        <div className="login-container">
            <div className="floating-elements"></div>
            <form onSubmit={handleSubmit(handleRegister)} className="login-card">
                <Typography variant="h4" className="login-title">Create an Account 🚀</Typography>
                <Typography className="login-subtitle">Sign up and explore amazing features</Typography>

                {registerError && <Typography className="error-message">{registerError}</Typography>}

                <Box className="input-group">
                    <InputAdornment position="start">
                        <Email className="input-icon" />
                    </InputAdornment>
                    <MyTextField
                        label="Email"
                        name="email"
                        control={control}
                        fullWidth
                        error={!!errors.email}
                        helperText={errors.email?.message}
                    />
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
                        error={!!errors.password}
                        helperText={errors.password?.message}
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
                        error={!!errors.password2}
                        helperText={errors.password2?.message}
                    />
                </Box>

                <Box className="input-group">
                    <FormControl fullWidth error={!!errors.association}>
                        <InputLabel>Association</InputLabel>
                        <Controller
                            name="association"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    value={field.value?.id || ''} // Ensuring association is valid
                                    onChange={(e) => {
                                        const selectedAssoc = associations.find(
                                            assoc => assoc.id === e.target.value
                                        );
                                        field.onChange(selectedAssoc);
                                    }}
                                    label="Association"
                                >
                                    {associations.map((association) => (
                                        <MenuItem key={association.id} value={association.id}>
                                            {association.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                        {errors.association && (
                            <Typography color="error" variant="body2">
                                {errors.association.message}
                            </Typography>
                        )}
                    </FormControl>
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
