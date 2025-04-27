import { React, useState, useEffect } from 'react';
import { Box, Typography, IconButton, InputAdornment, CircularProgress, Checkbox, FormControlLabel, Alert, Snackbar } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, AlternateEmail, Dashboard, Assignment, Assessment, AutoAwesome } from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import Axios from './Axios.jsx';
import { Button } from '@mui/material';
import FormField from './forms/FormField';
import MyButton from './forms/MyButton';
import '../assets/Styles/login.css';
import backgroundImage from '../assets/blue-stationery-table.jpg';
import logo from '../assets/logowhite.png';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
// Form validation schema
const loginSchema = yup.object().shape({
    email: yup
        .string()
        .email('Format email invalide')
        .required('Email est requis'),
    password: yup
        .string()
        .required('Mot de passe est requis')
});

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { handleSubmit, control, setError, formState: { errors } } = useForm({
        resolver: yupResolver(loginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [featureIndex, setFeatureIndex] = useState(0);

    // Platform features for the dynamic display
    const platformFeatures = [
        {
            icon: <Dashboard sx={{ fontSize: 36, color: '#fff', mb: 1 }} />,
            title: "Tableau de bord personnalisé",
            description: "Accédez rapidement à vos projets, tâches et documents dans une interface intuitive."
        },
        {
            icon: <Assignment sx={{ fontSize: 36, color: '#fff', mb: 1 }} />,
            title: "Gestion des projets",
            description: "Création, suivi et validation des projets avec attribution des responsabilités."
        },
        {
            icon: <Assessment sx={{ fontSize: 36, color: '#fff', mb: 1 }} />,
            title: "Rapports financiers",
            description: "Générez automatiquement des rapports financiers conformes à la législation tunisienne."
        },
        {
            icon: <AutoAwesome sx={{ fontSize: 36, color: '#fff', mb: 1 }} />,
            title: "Assistant administratif",
            description: "Chatbot intelligent pour vous guider dans vos tâches administratives quotidiennes."
        }
    ];

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const message = params.get('message');

        if (message) {
            setNotification({
                open: true,
                message: decodeURIComponent(message),
                severity: params.get('status') === 'error' ? 'error' : 'success'
            });
        }

        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setRememberMe(true);
        }

        // Rotate through features every 6 seconds
        const featureInterval = setInterval(() => {
            setFeatureIndex(prev => (prev + 1) % platformFeatures.length);
        }, 6000);

        return () => clearInterval(featureInterval);
    }, [location]);

    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') return;
        setNotification({ ...notification, open: false });
    };

    const handleRememberMeChange = (event) => {
        setRememberMe(event.target.checked);
    };

    const handleLogin = async (data) => {
        setLoading(true);
        setLoginError("");

        try {
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', data.email.trim().toLowerCase());
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            const response = await Axios.post('/users/login/', {
                email: data.email.trim().toLowerCase(),
                password: data.password,
            });

            localStorage.setItem('Token', response.data.token);

            if (response.data.user) {
                localStorage.setItem('UserInfo', JSON.stringify(response.data.user));
            }

            localStorage.setItem('loginTimestamp', Date.now());

            setNotification({
                open: true,
                message: 'Connexion réussie! Redirection vers le tableau de bord...',
                severity: 'success'
            });

            setTimeout(() => {
                navigate('/home');
            }, 1000);

        }

            // Replace the catch block in handleLogin function with this enhanced version

        catch (error) {
            setLoading(false);
            console.error("Login Error:", error);

            // More detailed debugging
            console.log("Error full object:", error);
            console.log("Error response exists:", !!error.response);
            console.log("Error response status:", error.response?.status);

            // Add more detailed logging to see exactly what's in the response
            if (error.response && error.response.data) {
                console.log("Response data type:", typeof error.response.data);
                console.log("Raw response data:", error.response.data);

                // If it's a string, log it directly
                if (typeof error.response.data === 'string') {
                    console.log("Response data as string:", error.response.data);
                    // Try to parse it if it looks like JSON with single quotes
                    if (error.response.data.includes("'error':")) {
                        try {
                            const fixedJson = error.response.data.replace(/'/g, '"');
                            const parsedData = JSON.parse(fixedJson);
                            console.log("Parsed from string:", parsedData);
                        } catch (e) {
                            console.log("Couldn't parse response data:", e);
                        }
                    }
                }
                // If it's an object, log its structure
                else if (typeof error.response.data === 'object') {
                    console.log("Response data keys:", Object.keys(error.response.data));
                    console.log("Error field exists:", 'error' in error.response.data);
                    if ('error' in error.response.data) {
                        console.log("Error field value:", error.response.data.error);
                    }
                }
            }

            // EXTRA ROBUST VALIDATION MESSAGE DETECTION
            // First check for the 403 status code
            if (error.response && error.response.status === 403) {
                console.log("403 Forbidden detected - Checking for validation message");

                let messageToCheck = "";
                const responseData = error.response.data;

                // Handle different response formats
                if (typeof responseData === 'string') {
                    messageToCheck = responseData;
                    // Try to extract error message from JSON-like string with single quotes
                    if (responseData.includes("'error':")) {
                        try {
                            const fixedJson = responseData.replace(/'/g, '"');
                            const parsedData = JSON.parse(fixedJson);
                            if (parsedData.error) {
                                messageToCheck = parsedData.error;
                            }
                        } catch (e) {
                            console.log("String parse attempt failed:", e);
                        }
                    }
                } else if (responseData && typeof responseData === 'object') {
                    // Object format - extract from error field or stringify the whole object
                    messageToCheck = responseData.error || responseData.message || responseData.detail || JSON.stringify(responseData);
                }

                console.log("Message being checked for validation keywords:", messageToCheck);

                // Super comprehensive keyword check
                const validationKeywords = ['pending', 'validation', 'approval', 'wait for', 'administrator', 'verify'];
                const containsValidationKeyword = validationKeywords.some(keyword =>
                    messageToCheck.toLowerCase().includes(keyword.toLowerCase())
                );

                console.log("Contains validation keyword:", containsValidationKeyword);

                // Force direct check for the exact error message we're expecting
                const isExactValidationMessage = messageToCheck.includes("Your account is pending validation");
                console.log("Contains exact validation message:", isExactValidationMessage);

                // Trigger validation message display for 403 + validation message
                if (containsValidationKeyword || isExactValidationMessage) {
                    console.log("SETTING VALIDATION PENDING MESSAGE");
                    setLoginError("🌟 Votre compte est en cours de validation! 🌟\n\nUn administrateur examinera votre inscription très bientôt. Vous recevrez une notification dès que votre compte sera approuvé.");

                    setNotification({
                        open: true,
                        message: "Patience est une vertu! Votre compte est en attente d'approbation. Nous vous enverrons un email dès que vous pourrez accéder à la plateforme.",
                        severity: 'info'
                    });

                    return;
                }
            }

            // Process other error types
            if (error.response) {
                // Extract error message from response
                const responseData = error.response.data;
                let errorMessage = "";

                if (typeof responseData === 'string') {
                    errorMessage = responseData;
                    // Try to extract error message from JSON-like string
                    if (responseData.includes("'error':") || responseData.includes('"error":')) {
                        try {
                            const fixedJson = responseData.replace(/'/g, '"');
                            const parsedData = JSON.parse(fixedJson);
                            if (parsedData.error) {
                                errorMessage = parsedData.error;
                            }
                        } catch (e) {
                            // Keep original string if parsing fails
                        }
                    }
                } else if (responseData && typeof responseData === 'object') {
                    errorMessage = responseData.error || responseData.message || responseData.detail || "";
                }

                console.log("Final extracted error message:", errorMessage);

                // Handle specific status codes
                switch (error.response.status) {
                    case 401:
                        setError("email", { type: "manual", message: "Email ou mot de passe incorrect" });
                        setError("password", { type: "manual", message: "Email ou mot de passe incorrect" });
                        setLoginError("Les identifiants saisis ne correspondent pas à nos enregistrements. Veuillez vérifier et réessayer.");
                        break;
                    case 403:
                        // If we get here, it's a 403 that's not for pending validation
                        setLoginError(errorMessage || "Accès refusé. Veuillez contacter l'administrateur.");
                        break;
                    case 429:
                        setLoginError("Compte temporairement verrouillé en raison de trop nombreuses tentatives échouées. Veuillez patienter quelques minutes ou réinitialiser votre mot de passe.");
                        break;
                    default:
                        setLoginError(errorMessage || "Échec de l'authentification. Veuillez vérifier vos identifiants et réessayer.");
                }
            } else if (error.request) {
                setLoginError("Erreur réseau. Veuillez vérifier votre connexion et réessayer.");
            } else {
                setLoginError("Échec de l'authentification. Veuillez vérifier vos identifiants et réessayer.");
            }
        }
    };
    const PendingUserMessage = () => {
        // Add debug logging
        console.log("PendingUserMessage - loginError value:", loginError);

        // Enhanced detection - check for star emoji OR validation keywords
        const hasStarEmoji = loginError && loginError.includes('🌟');
        const hasValidationKeywords = loginError && (
            loginError.toLowerCase().includes('validation') ||
            loginError.toLowerCase().includes('pending') ||
            loginError.toLowerCase().includes('approval') ||
            loginError.toLowerCase().includes('attente') ||
            loginError.toLowerCase().includes('administrator')
        );

        console.log("Should render based on emoji:", hasStarEmoji);
        console.log("Should render based on keywords:", hasValidationKeywords);

        // Show message if either condition is true
        if (!hasStarEmoji && !hasValidationKeywords) {
            console.log("PendingUserMessage - Not rendering");
            return null;
        }

        console.log("PendingUserMessage - Rendering validation message");

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    padding: '20px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    border: '1px dashed #2196f3',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}
            >
                <motion.div
                    animate={{
                        y: [0, -5, 0],
                        rotate: [0, 3, 0, -3, 0]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "loop"
                    }}
                    style={{ display: 'inline-block', marginBottom: '10px' }}
                >
                    <Typography variant="h5" style={{ color: '#2196f3', fontWeight: 'bold' }}>
                        🌟 Votre compte est presque prêt! 🌟
                    </Typography>
                </motion.div>

                <Typography variant="body1" style={{ color: '#333', marginBottom: '15px' }}>
                    Un administrateur examine actuellement votre inscription.
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <HourglassEmptyIcon style={{ color: '#2196f3', fontSize: '2rem', marginRight: '5px' }} />
                    </motion.div>
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                    >
                        <HourglassEmptyIcon style={{ color: '#2196f3', fontSize: '2rem', marginRight: '5px' }} />
                    </motion.div>
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                    >
                        <HourglassEmptyIcon style={{ color: '#2196f3', fontSize: '2rem' }} />
                    </motion.div>
                </Box>

                <Typography variant="body2" style={{ color: '#555' }}>
                    Nous vous enverrons un email dès que vous pourrez accéder à la plateforme.
                </Typography>
            </motion.div>
        );
    };

    const currentFeature = platformFeatures[featureIndex];

    return (
        <div className="login-container">
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

            <div className="background-image" style={{ backgroundImage: `url(${backgroundImage})` }} />
            <div className="gradient-overlay" />

            <div className="left-panel">
                <div className="welcome-content">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Typography variant="h3" className="welcome-title">Bienvenue sur myOrg</Typography>
                    </motion.div>
                    <motion.div
                        className="brand-container"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <img src={logo} alt="BINA Logo" style={{ width: '80%', maxWidth: '500px', height: 'auto' }} />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        <Typography variant="h6" className="welcome-subtitle">
                            Votre solution pour la gestion des associations en Tunisie
                        </Typography>
                    </motion.div>

                    {/* Dynamic Feature Showcase */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.9 }}
                    >
                        <Box
                            sx={{
                                mt: 4,
                                p: 3,
                                borderRadius: '12px',
                                backgroundColor: 'rgba(13, 71, 161, 0.4)',
                                backdropFilter: 'blur(10px)',
                                minHeight: '220px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                overflow: 'hidden',
                                position: 'relative'
                            }}
                        >
                            <motion.div
                                key={featureIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    width: '100%'
                                }}
                            >
                                <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        duration: 0.5,
                                        type: "spring",
                                        stiffness: 200
                                    }}
                                    sx={{ mb: 2 }}
                                >
                                    {currentFeature.icon}
                                </motion.div>
                                <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
                                    {currentFeature.title}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#fff' }}>
                                    {currentFeature.description}
                                </Typography>
                            </motion.div>
                        </Box>
                    </motion.div>

                    {/* Dots indicator for features */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.2 }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            {platformFeatures.map((_, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ scale: 1.2 }}
                                    animate={{
                                        scale: idx === featureIndex ? 1.2 : 1,
                                        backgroundColor: idx === featureIndex ? '#fff' : 'rgba(255,255,255,0.5)'
                                    }}
                                    transition={{ duration: 0.3 }}
                                    style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        margin: '0 5px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setFeatureIndex(idx)}
                                />
                            ))}
                        </Box>
                    </motion.div>

                    {/* Compliance notice */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.5 }}
                    >
                        <Box
                            sx={{
                                mt: 4,
                                p: 2,
                                borderRadius: '8px',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(5px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        >
                            <Typography variant="body2" sx={{ color: '#fff', fontStyle: 'italic', textAlign: 'center' }}>
                                Plateforme conforme à la législation tunisienne pour la gestion des associations
                            </Typography>
                        </Box>
                    </motion.div>
                </div>
            </div>

            <div className="right-panel">
                <motion.form
                    onSubmit={handleSubmit(handleLogin)}
                    className="login-card"
                    data-testid="login-form"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 100 }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <Typography variant="h4" className="login-title">Connexion</Typography>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                    >
                        <Typography className="login-subtitle">Accédez à votre tableau de bord personnalisé</Typography>
                    </motion.div>

                    {loginError && (
                        (loginError.includes('🌟') ||
                            loginError.toLowerCase().includes('validation') ||
                            loginError.toLowerCase().includes('pending') ||
                            loginError.toLowerCase().includes('approval') ||
                            loginError.toLowerCase().includes('administrator')) ? (
                            <PendingUserMessage />
                        ) : (
                            <motion.div
                                className="error-message"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <span className="error-icon">!</span>
                                <span>{loginError}</span>
                            </motion.div>
                        )
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.9 }}
                    >
                        <Box className="input-group">
                            <FormField
                                label="Adresse email"
                                name="email"
                                type="email"
                                control={control}
                                fullWidth
                                placeholder="votre.email@exemple.com"
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email style={{ color: '#0d47a1' }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 1.1 }}
                    >
                        <Box className="input-group">
                            <FormField
                                label="Mot de passe"
                                name="password"
                                control={control}
                                fullWidth
                                placeholder="Entrez votre mot de passe"
                                type={showPassword ? "text" : "password"}
                                error={!!errors.password}
                                helperText={errors.password?.message}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock style={{ color: '#0d47a1' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={togglePasswordVisibility}
                                                className="visibility-toggle"
                                                edge="end"
                                                aria-label="toggle password visibility"
                                                style={{ color: '#000000' }}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                    </motion.div>

                    <motion.div
                        className="remember-forgot"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.3 }}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={rememberMe}
                                    onChange={handleRememberMeChange}
                                    color="primary"
                                    size="small"
                                />
                            }
                            label={<span style={{ color: '#000000', fontWeight: 600 }}>Se souvenir de moi</span>}
                        />
                        <Link to="/request/password_reset" className="forgot-link">Mot de passe oublié?</Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 1.5 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <MyButton
                            label={loading ? <CircularProgress size={24} color="inherit" /> : "Connexion"}
                            type="submit"
                            className="login-btn"
                            disabled={loading}
                            fullWidth
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.7 }}
                    >
                        <Typography className="signup-prompt">
                            Pas encore de compte? <Link to="/register" className="signup-link">S'inscrire</Link>
                        </Typography>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 1.9 }}
                        whileHover={{ scale: 1.05 }}
                    >
                        <Box className="association-link-container">
                            <Link to="/associationregister" className="association-link">
                                <AlternateEmail style={{ marginRight: '8px', fontSize: '1rem' }} />
                                Enregistrer votre association
                            </Link>
                        </Box>
                    </motion.div>
                </motion.form>
            </div>

            {/* Add a floating animation element for visual interest */}
            <motion.div
                style={{
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(13, 71, 161, 0.7), rgba(33, 150, 243, 0.7))',
                    zIndex: 1,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}
                animate={{
                    y: [0, -15, 0],
                    rotate: [0, 10, -10, 0]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Add smaller floating elements */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: '25%',
                    left: '15%',
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.3)',
                    zIndex: 1
                }}
                animate={{
                    y: [0, -30, 0],
                    x: [0, 15, 0],
                    opacity: [0.3, 0.7, 0.3]
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <motion.div
                style={{
                    position: 'absolute',
                    bottom: '30%',
                    left: '60%',
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'rgba(13, 71, 161, 0.3)',
                    zIndex: 1
                }}
                animate={{
                    y: [0, 40, 0],
                    x: [0, -20, 0],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        </div>
    );
};

export default Login;