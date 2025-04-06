import { React, useState, useEffect } from 'react';
import { Box, Typography, IconButton, InputAdornment, CircularProgress, Checkbox, FormControlLabel, Alert, Snackbar } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, AlternateEmail, Dashboard, Assignment, Assessment, AutoAwesome } from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import Axios from './Axios.jsx';
import FormField from './forms/FormField';
import MyButton from './forms/MyButton';
import '../assets/Styles/login.css';
import backgroundImage from '../assets/blue-stationery-table.jpg';
import logo from '../assets/logowhite.png';

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

        } catch (error) {
            setLoading(false);
            console.error("Login Error:", error);

            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        setError("email", { type: "manual", message: "Email ou mot de passe incorrect" });
                        setError("password", { type: "manual", message: "Email ou mot de passe incorrect" });
                        setLoginError("Les identifiants saisis ne correspondent pas à nos enregistrements. Veuillez vérifier et réessayer.");
                        break;
                    case 429:
                        setLoginError("Compte temporairement verrouillé en raison de trop nombreuses tentatives échouées. Veuillez patienter quelques minutes ou réinitialiser votre mot de passe.");
                        break;
                    case 403:
                        setLoginError("Votre compte a été suspendu. Veuillez contacter l'assistance pour obtenir de l'aide.");
                        break;
                    default:
                        setLoginError(error.response.data.message || "Échec de l'authentification. Veuillez réessayer plus tard.");
                }
            } else if (error.request) {
                setLoginError("Erreur réseau. Veuillez vérifier votre connexion et réessayer.");
            } else {
                setLoginError("Échec de l'authentification. Veuillez vérifier vos identifiants et réessayer.");
            }
        }
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