import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    InputAdornment,
    CircularProgress,
    Alert,
    Snackbar,
    Paper,
    Divider,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Tooltip,
    Fade,
    Chip,
    Badge,
    LinearProgress
} from '@mui/material';
import {
    Email,
    Business,
    UploadFile,
    CheckCircle,
    Error,
    PendingActions,
    ArticleOutlined,
    CloudUpload,
    VerifiedUser,
    FactCheck,
    AutoAwesome,
    FindInPage,
    GradingOutlined,
    InfoOutlined
} from '@mui/icons-material';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import AxiosInstance from './Axios';
import FormField from './forms/FormField';
import MyButton from './forms/MyButton';
import { Link } from 'react-router-dom';
import '../assets/Styles/login.css';
import backgroundImage from '../assets/blue-stationery-table.jpg';
import logo from '../assets/logowhite.png';

// Form validation schema
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
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [registeredAssociation, setRegisteredAssociation] = useState(null);
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [showVerificationStatus, setShowVerificationStatus] = useState(false);
    const [verificationProgress, setVerificationProgress] = useState(0);
    const [activeStep, setActiveStep] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState({
        cin_recto: null,
        cin_verso: null,
        rne_document: null
    });

    const { handleSubmit, control, formState: { errors }, watch, reset } = useForm({
        resolver: yupResolver(schema),
    });

    // Watch for file uploads to update UI
    const cinRecto = watch("cin_recto");
    const cinVerso = watch("cin_verso");
    const rneDocument = watch("rne_document");

    // Update uploaded files state when form values change
    useEffect(() => {
        setUploadedFiles({
            cin_recto: cinRecto,
            cin_verso: cinVerso,
            rne_document: rneDocument
        });
    }, [cinRecto, cinVerso, rneDocument]);

    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') return;
        setNotification({ ...notification, open: false });
    };

    // Function to check the verification status of an association
// Function to check the verification status of an association
    const checkVerificationStatus = async (associationId) => {
        try {
            const response = await AxiosInstance.get(`/verification/association-verification/${associationId}/`);
            // Update state with the new status
            setVerificationStatus(response.data);
            return response.data;
        } catch (error) {
            console.error("Error checking verification status:", error);
            return null;
        }
    };

    // Effect to check verification status periodically if we have a registered association
// Effect to check verification status periodically if it's pending
    useEffect(() => {
        let statusCheckInterval;
        let progressInterval;

        if (registeredAssociation && showVerificationStatus) {
            // If verification status is already failed or verified, set progress accordingly
            if (verificationStatus?.verification_status === 'failed' ||
                verificationStatus?.verification_status === 'verified') {
                setVerificationProgress(100);
                return; // Don't set up intervals for checking
            }

            // Only for pending status: simulate verification progress
            progressInterval = setInterval(() => {
                setVerificationProgress(prev => {
                    if (prev < 95) return prev + 5; // Only go up to 95% for pending
                    clearInterval(progressInterval);
                    return 95; // Pending stays at 95% until complete
                });
            }, 700);

            // Only check periodically if status is pending
            if (verificationStatus?.verification_status === 'pending') {
                // Set up interval for checking pending status
                statusCheckInterval = setInterval(async () => {
                    try {
                        const result = await checkVerificationStatus(registeredAssociation.id);

                        // If verification is complete, stop checking
                        if (result && result.verification_status !== 'pending') {
                            clearInterval(statusCheckInterval);
                            clearInterval(progressInterval);
                            setVerificationProgress(100);

                            // Update notification based on verification result
                            setNotification({
                                open: true,
                                message: result.verification_status === 'verified' ?
                                    'Vérification réussie!' :
                                    'La vérification a échoué. Veuillez consulter les détails.',
                                severity: result.verification_status === 'verified' ? 'success' : 'error'
                            });
                        }
                    } catch (error) {
                        console.error("Error checking verification status:", error);
                    }
                }, 5000); // Check every 5 seconds
            }

            return () => {
                if (statusCheckInterval) clearInterval(statusCheckInterval);
                if (progressInterval) clearInterval(progressInterval);
            };
        }
    }, [registeredAssociation, showVerificationStatus, verificationStatus]);

    const handleRegister = async (data) => {
        setLoading(true);
        setRegisterError("");
        setActiveStep(4); // Move to the submission step

        const formDataObj = new FormData();

        // Add each field individually to FormData
        formDataObj.append('name', data.name);
        formDataObj.append('email', data.email);
        formDataObj.append('matricule_fiscal', data.matricule_fiscal);

        // Handle file fields separately
        if (data.cin_recto) formDataObj.append('cin_recto', data.cin_recto);
        if (data.cin_verso) formDataObj.append('cin_verso', data.cin_verso);
        if (data.rne_document) formDataObj.append('rne_document', data.rne_document);

        try {
            const response = await AxiosInstance.post('/users/register-association/', formDataObj, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Store the registered association data from response
            // The response already includes verification status from the backend
            const associationData = response.data;
            setRegisteredAssociation(associationData);

            // Set verification status directly from response
            setVerificationStatus({
                verification_status: associationData.verification_status,
                verification_notes: associationData.verification_notes,
                verification_date: associationData.verification_date
            });

            // Show verification status panel
            setShowVerificationStatus(true);

            // Set appropriate notification based on verification status
            if (associationData.verification_status === 'failed') {
                setNotification({
                    open: true,
                    message: 'Enregistrement soumis, mais la vérification a échoué. Vérifiez les détails d\'erreur.',
                    severity: 'error'
                });
                // Set progress to 100% for failed verification
                setVerificationProgress(100);
            } else if (associationData.verification_status === 'verified') {
                setNotification({
                    open: true,
                    message: 'Association enregistrée et vérifiée avec succès!',
                    severity: 'success'
                });
                // Set progress to 100% for successful verification
                setVerificationProgress(100);
            } else {
                // Handle pending verification
                setNotification({
                    open: true,
                    message: 'Association enregistrée. Vérification en attente...',
                    severity: 'info'
                });
                // Keep progress animation for pending verification
            }

            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error("Registration error:", error.response?.data || error);

            // More detailed error message
            const errorMessage = error.response?.data?.detail ||
                error.response?.data?.error ||
                error.message ||
                "Failed to register association. Please try again.";

            setRegisterError(`❌ ${errorMessage}`);
            setActiveStep(3); // Go back to files step on error
        }
    };

    // Helper function to get color based on verification status
    const getStatusColor = (status) => {
        switch(status) {
            case 'verified': return '#4caf50';
            case 'failed': return '#f44336';
            case 'pending': return '#ff9800';
            default: return '#757575';
        }
    };

    // Helper function to get icon based on verification status
    const getStatusIcon = (status) => {
        switch(status) {
            case 'verified': return <CheckCircle sx={{ color: '#4caf50', fontSize: 40 }} />;
            case 'failed': return <Error sx={{ color: '#f44336', fontSize: 40 }} />;
            case 'pending': return <PendingActions sx={{ color: '#ff9800', fontSize: 40 }} />;
            default: return null;
        }
    };

    // Get percentage of form completion
    const getCompletionPercentage = () => {
        const fields = ['name', 'email', 'matricule_fiscal', 'cin_recto', 'cin_verso', 'rne_document'];
        const completed = fields.filter(field => watch(field)).length;
        return Math.round((completed / fields.length) * 100);
    };

    // Handle step navigation
    const handleNextStep = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBackStep = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    // Function to provide guidance based on verification status
    const getVerificationGuidance = (status) => {
        switch (status) {
            case 'verified':
                return (
                    <Alert severity="success" sx={{ mt: 3, borderLeft: '5px solid #2e7d32', backgroundColor: '#e8f5e9' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                            ✅ Vérification Réussie
                        </Typography>
                        <Typography variant="body2">
                            Félicitations ! Votre association a été <strong>vérifiée avec succès</strong>.
                            Vous pouvez maintenant vous connecter avec les informations fournies.
                        </Typography>
                    </Alert>
                );

            case 'failed':
                return (
                    <Alert
                        severity="error"
                        variant="outlined"
                        icon={<Error sx={{ fontSize: 30 }} />}
                        sx={{
                            mt: 3,
                            borderLeft: '6px solid #d32f2f',
                            backgroundColor: '#ffebee',
                            p: 2,
                            borderRadius: 2
                        }}
                    >
                        <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 700, mb: 1 }}>
                            ❌ Vérification Échouée
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            Merci de vérifier les éléments suivants :
                        </Typography>
                        <Box component="ul" sx={{ pl: 3 }}>
                            <li>Matricule fiscal : <strong>{registeredAssociation?.matricule_fiscal || 'N/A'}</strong></li>
                            <li>Documents clairement lisibles</li>
                            <li>Carte d'identité & RNE valides et à jour</li>
                        </Box>
                        <Typography variant="body2" sx={{ mt: 2, fontWeight: 500 }}>
                            ➡️ Veuillez créer une nouvelle demande avec des documents corrigés.
                        </Typography>

                        {verificationStatus?.verification_notes && (
                            <Box sx={{ mt: 2, p: 2, backgroundColor: '#ffcdd2', borderRadius: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                    💡 Détails supplémentaires :
                                </Typography>
                                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                    {verificationStatus.verification_notes}
                                </Typography>
                            </Box>
                        )}
                    </Alert>
                );

            case 'pending':
                return (
                    <Alert
                        severity="info"
                        sx={{
                            mt: 3,
                            borderLeft: '5px solid #0288d1',
                            backgroundColor: '#e1f5fe',
                            color: '#01579b'
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            ⏳ Vérification en cours
                        </Typography>
                        <Typography variant="body2">
                            Votre demande est en cours de vérification. Vous serez notifié une fois le processus terminé.
                        </Typography>
                    </Alert>
                );

            default:
                return null;
        }
    };


    // Component for retry button functionality
    const RetryRegistrationButton = () => {
        if (verificationStatus?.verification_status !== 'failed') return null;

        return (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    Pour réessayer avec de nouveaux documents :
                </Typography>
                <MyButton
                    label="Nouvelle demande"
                    onClick={() => {
                        setRegisteredAssociation(null);
                        setShowVerificationStatus(false);
                        setVerificationStatus(null);
                        setVerificationProgress(0);
                        setActiveStep(0);
                        reset(); // clear form data
                    }}
                    sx={{
                        minWidth: 220,
                        backgroundColor: '#d32f2f',
                        color: '#fff',
                        fontWeight: 600,
                        '&:hover': {
                            backgroundColor: '#b71c1c',
                        }
                    }}
                    endIcon={<AutoAwesome />}
                />
            </Box>
        );
    };


    // Registration steps
    const steps = [
        {
            label: 'Informations de base',
            description: 'Entrez les informations de base de votre association',
            fields: ['name', 'email', 'matricule_fiscal'],
            icon: <Business />
        },
        {
            label: 'Carte d\'identité (Recto)',
            description: 'Téléchargez le recto de votre carte d\'identité',
            fields: ['cin_recto'],
            icon: <ArticleOutlined />
        },
        {
            label: 'Carte d\'identité (Verso)',
            description: 'Téléchargez le verso de votre carte d\'identité',
            fields: ['cin_verso'],
            icon: <ArticleOutlined />
        },
        {
            label: 'Document RNE',
            description: 'Téléchargez votre document RNE pour la vérification',
            fields: ['rne_document'],
            icon: <FactCheck />
        },
        {
            label: 'Soumission',
            description: 'Vérification des documents et enregistrement',
            icon: <GradingOutlined />
        }
    ];

    // Helper to check if current step is valid and can proceed
    const canProceed = () => {
        const currentFields = steps[activeStep].fields || [];
        return currentFields.every(field => !errors[field] && watch(field));
    };

    // Custom file input component
    const FileInput = ({ name, label, description, control, errors }) => (
        <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>{label}</Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>{description}</Typography>

            <Controller
                name={name}
                control={control}
                defaultValue={null}
                render={({ field: { onChange, value } }) => (
                    <Box
                        sx={{
                            border: '2px dashed',
                            borderColor: errors[name] ? '#f44336' : (value ? '#4caf50' : '#0d47a1'),
                            borderRadius: 2,
                            p: 3,
                            textAlign: 'center',
                            transition: 'all 0.3s ease',
                            backgroundColor: value ? 'rgba(76, 175, 80, 0.05)' : 'transparent',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {value ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <CheckCircle sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                                <Typography>{value.name}</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {(value.size / 1024).toFixed(2)} KB
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Chip
                                        label="Changer le fichier"
                                        onClick={() => document.getElementById(`file-input-${name}`).click()}
                                        icon={<CloudUpload />}
                                        color="primary"
                                        variant="outlined"
                                    />
                                </Box>
                            </motion.div>
                        ) : (
                            <>
                                <CloudUpload sx={{ fontSize: 40, color: '#0d47a1', mb: 1 }} />
                                <Typography>Déposez votre fichier ici ou cliquez pour parcourir</Typography>
                            </>
                        )}
                        <input
                            id={`file-input-${name}`}
                            type="file"
                            onChange={(e) => onChange(e.target.files[0])}
                            style={{
                                opacity: 0,
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                cursor: 'pointer'
                            }}
                        />
                    </Box>
                )}
            />
            {errors[name] && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                    {errors[name].message}
                </Typography>
            )}
        </Box>
    );

    // Verification dashboard - more advanced and interactive
    const VerificationDashboard = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Typography variant="h4" sx={{ mb: 4, color: '#0d47a1', fontWeight: 'bold', textAlign: 'center' }}>
                Vérification des Documents
            </Typography>

            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 4, backgroundColor: '#f8faff' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <AutoAwesome sx={{ fontSize: 32, color: '#0d47a1', mr: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
                        {registeredAssociation?.name || 'Votre association'}
                    </Typography>
                </Box>

                <Divider sx={{ mb: 4 }} />

                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                            verificationStatus?.verification_status === 'verified' ? (
                                <CheckCircle sx={{ color: '#4caf50', fontSize: 28 }} />
                            ) : verificationStatus?.verification_status === 'failed' ? (
                                <Error sx={{ color: '#f44336', fontSize: 28 }} />
                            ) : (
                                <PendingActions sx={{ color: '#ff9800', fontSize: 28 }} />
                            )
                        }
                    >
                        <Box
                            sx={{
                                position: 'relative',
                                width: 120,
                                height: 120,
                                borderRadius: '50%',
                                backgroundColor: '#e0f2f1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto',
                            }}
                        >
                            <CircularProgress
                                variant="determinate"
                                value={verificationProgress}
                                size={120}
                                thickness={4}
                                sx={{
                                    position: 'absolute',
                                    color: getStatusColor(verificationStatus?.verification_status),
                                    animationDuration: '1.5s',
                                }}
                            />
                            <VerifiedUser sx={{ fontSize: 50, color: '#0d47a1' }} />
                        </Box>
                    </Badge>

                    <Typography
                        variant="h6"
                        sx={{
                            mt: 3,
                            fontWeight: 'bold',
                            color: getStatusColor(verificationStatus?.verification_status),
                            textTransform: 'uppercase',
                            letterSpacing: 1
                        }}
                    >
                        {verificationStatus?.verification_status === 'verified' ? 'Vérifié' :
                            verificationStatus?.verification_status === 'failed' ? 'Échec de Vérification' :
                                'Vérification en cours'}
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, backgroundColor: 'white' }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                            Détails de la vérification
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2">Matricule Fiscal:</Typography>
                                <Chip
                                    label={registeredAssociation?.matricule_fiscal?.toUpperCase() || 'N/A'}
                                    variant="outlined"
                                    color="primary"
                                />
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2">État de l'extraction:</Typography>
                                <Chip
                                    icon={verificationStatus?.verification_status === 'verified' ? <CheckCircle /> :
                                        verificationStatus?.verification_status === 'failed' ? <Error /> :
                                            <PendingActions />}
                                    label={verificationStatus?.verification_status === 'verified' ? 'Réussi' :
                                        verificationStatus?.verification_status === 'failed' ? 'Échoué' :
                                            'En cours'}
                                    variant="filled"
                                    color={verificationStatus?.verification_status === 'verified' ? 'success' :
                                        verificationStatus?.verification_status === 'failed' ? 'error' :
                                            'warning'}
                                />
                            </Box>

                            {verificationStatus?.verification_date && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2">Date de vérification:</Typography>
                                    <Chip
                                        label={new Date(verificationStatus.verification_date).toLocaleString()}
                                        variant="outlined"
                                    />
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Box>

                <AnimatePresence>
                    {verificationStatus?.verification_notes && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Alert
                                severity={verificationStatus.verification_status === 'verified' ? 'success' :
                                    verificationStatus.verification_status === 'failed' ? 'error' : 'info'}
                                variant="filled"
                                sx={{ mb: 3 }}
                            >
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Notes:</Typography>
                                <Typography variant="body2">
                                    {verificationStatus.verification_notes}
                                </Typography>
                            </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Add verification guidance */}
                {getVerificationGuidance(verificationStatus?.verification_status)}

                {/* Add retry button for failed verifications */}
                <RetryRegistrationButton />

                {verificationStatus?.verification_status === 'pending' && (
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                            Notre IA analyse vos documents... Cette opération peut prendre quelques minutes.
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                            <FindInPage sx={{ color: '#0d47a1', mr: 1 }} />
                            <Typography variant="caption">Extraction et validation des données</Typography>
                        </Box>
                    </Box>
                )}

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <MyButton
                        label="Retour à la connexion"
                        component={Link}
                        to="/"
                        className="login-btn"
                        sx={{ minWidth: 200 }}
                    />
                </Box>
            </Paper>

            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: 'text.secondary' }}>
                La vérification est effectuée par notre système d'intelligence artificielle qui extrait les informations
                de vos documents et valide leur conformité avec les exigences légales.
            </Typography>
        </motion.div>
    );

    // AI document verification animation component
    const AiVerificationAnimation = () => (
        <Box sx={{ position: 'relative', mt: 3, mb: 3, height: 60 }}>
            <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{
                    x: [0, 50, 100, 150, 200],
                    opacity: [1, 1, 1, 0.8, 0]
                }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <ArticleOutlined sx={{ color: '#0d47a1', fontSize: 28 }} />
            </motion.div>

            <motion.div
                animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{
                    position: 'absolute',
                    left: '45%',
                    top: 0,
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <AutoAwesome sx={{ color: '#ff9800', fontSize: 28 }} />
            </motion.div>

            <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{
                    x: [200, 150, 100, 50, 0],
                    opacity: [0, 0.8, 1, 1, 1]
                }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <VerifiedUser sx={{ color: '#4caf50', fontSize: 28 }} />
            </motion.div>
        </Box>
    );

    return (
        <div className="login-container">
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                TransitionComponent={Fade}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    variant="filled"
                    sx={{ width: '100%', fontWeight: 'medium' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>

            <div className="background-image" style={{ backgroundImage: `url(${backgroundImage})` }} />
            <div className="gradient-overlay" />

            {/* Left Panel */}
            <div className="left-panel">
                <div className="welcome-content">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Typography variant="h3" className="welcome-title">Rejoindre notre réseau</Typography>
                    </motion.div>

                    <motion.div
                        className="brand-container"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <img src={logo} alt="myOrg Logo" style={{ width: '80%', maxWidth: '500px', height: 'auto' }} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        <Typography variant="h6" className="welcome-subtitle">
                            Enregistrez votre association et commencez à interagir avec notre communauté.
                        </Typography>
                    </motion.div>

                    {/* Features Box */}
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
                                textAlign: 'center'
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                            >
                                <Business sx={{ fontSize: 48, color: '#fff', mb: 2 }} />
                            </motion.div>
                            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
                                Bénéfices de l'inscription
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#fff' }}>
                                Accédez à nos outils de gestion spécialisés pour les associations tunisiennes,
                                conformes à la législation en vigueur.
                            </Typography>
                        </Box>
                    </motion.div>

                    {/* AI Verification Feature */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 1.2 }}
                    >
                        <Box
                            sx={{
                                mt: 4,
                                p: 3,
                                borderRadius: '12px',
                                backgroundColor: 'rgba(76, 175, 80, 0.3)',
                                backdropFilter: 'blur(10px)',
                                minHeight: '100px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center'
                            }}
                        >
                            <motion.div
                                animate={{
                                    rotate: [0, 10, 0, -10, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    repeatType: "loop"
                                }}
                            >
                                <AutoAwesome sx={{ fontSize: 40, color: '#fff', mb: 1 }} />
                            </motion.div>
                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
                                Vérification Intelligente
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#fff' }}>
                                Notre système IA analyse vos documents et extrait automatiquement les informations
                                nécessaires pour une validation rapide et efficace.
                            </Typography>
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
                                backdropFilter: 'blur(5px)'
                            }}
                        >
                            <Typography variant="body2" sx={{ color: '#fff', fontStyle: 'italic', textAlign: 'center' }}>
                                Plateforme conforme à la législation tunisienne pour la gestion des associations
                            </Typography>
                        </Box>
                    </motion.div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="right-panel">
                {showVerificationStatus && verificationStatus ? (
                    // Show enhanced verification dashboard after registration
                    <motion.div
                        className="login-card"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                    >
                        <VerificationDashboard />
                    </motion.div>
                ) : (
                    // Registration form with stepper
                    <motion.div
                        className="login-card"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 100 }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            <Typography variant="h4" className="login-title">Enregistrement Association 🏢</Typography>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.7 }}
                        >
                            <Typography className="login-subtitle">Créez votre compte organisation</Typography>
                        </motion.div>

                        {/* Progress indicator */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 3 }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={getCompletionPercentage()}
                                    sx={{
                                        height: 10,
                                        borderRadius: 5,
                                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: '#4caf50',
                                            borderRadius: 5
                                        }
                                    }}
                                />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {getCompletionPercentage()}%
                            </Typography>
                        </Box>

                        {registerError && (
                            <motion.div
                                className="error-message"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <span className="error-icon">!</span>
                                <span>{registerError}</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit(handleRegister)}>
                            <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 3 }}>
                                {steps.map((step, index) => (
                                    <Step key={step.label}>
                                        <StepLabel
                                            StepIconProps={{
                                                icon: step.icon,
                                                completed: index < activeStep
                                            }}
                                        >
                                            {step.label}
                                        </StepLabel>
                                        <StepContent>
                                            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                                                {step.description}
                                            </Typography>

                                            {index === 0 && (
                                                <>
                                                    {/* Association Name Field */}
                                                    <Box className="input-group" sx={{ mb: 3 }}>
                                                        <FormField
                                                            label="Nom de l'association"
                                                            name="name"
                                                            control={control}
                                                            fullWidth
                                                            placeholder="Entrez le nom de votre association"
                                                            error={!!errors.name}
                                                            helperText={errors.name?.message}
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <Business style={{ color: '#0d47a1' }} />
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                        />
                                                    </Box>

                                                    {/* Email Field */}
                                                    <Box className="input-group" sx={{ mb: 3 }}>
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

                                                    {/* Matricule Fiscal Field */}
                                                    <Box className="input-group">
                                                        <FormField
                                                            label="Matricule Fiscal"
                                                            name="matricule_fiscal"
                                                            control={control}
                                                            fullWidth
                                                            placeholder="Format: ABC123E"
                                                            error={!!errors.matricule_fiscal}
                                                            helperText={errors.matricule_fiscal?.message}
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <span style={{ color: '#0d47a1', fontWeight: 'bold' }}>MF</span>
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                        />

                                                    </Box>
                                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                                                        Ce matricule sera vérifié automatiquement dans votre document RNE.
                                                    </Typography>
                                                </>
                                            )}

                                            {index === 1 && (
                                                <FileInput
                                                    name="cin_recto"
                                                    label="Carte d'identité (Recto)"
                                                    description="Téléchargez le recto de votre carte d'identité nationale"
                                                    control={control}
                                                    errors={errors}
                                                />
                                            )}

                                            {index === 2 && (
                                                <FileInput
                                                    name="cin_verso"
                                                    label="Carte d'identité (Verso)"
                                                    description="Téléchargez le verso de votre carte d'identité nationale"
                                                    control={control}
                                                    errors={errors}
                                                />
                                            )}

                                            {index === 3 && (
                                                <FileInput
                                                    name="rne_document"
                                                    label="Document RNE"
                                                    description="Téléchargez votre document du Registre National des Entreprises pour vérification"
                                                    control={control}
                                                    errors={errors}
                                                />
                                            )}

                                            {index === 4 && (
                                                <Box sx={{ textAlign: 'center', py: 2 }}>
                                                    {loading ? (
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                            <CircularProgress size={50} sx={{ mb: 2 }} />
                                                            <Typography variant="body1">
                                                                Traitement de votre demande...
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                                                                Téléchargement et analyse des documents
                                                            </Typography>
                                                            <AiVerificationAnimation />
                                                        </Box>
                                                    ) : (
                                                        <Alert
                                                            severity="info"
                                                            variant="filled"
                                                            icon={<InfoOutlined fontSize="large" />}
                                                            sx={{
                                                                mb: 2,
                                                                fontWeight: 'bold',
                                                                fontSize: '1rem',
                                                                borderLeft: '4px solid #0d47a1'
                                                            }}
                                                        >
                                                            <strong>IMPORTANT:</strong> Vérifiez que toutes les informations sont correctes avant de soumettre.
                                                        </Alert>
                                                    )}
                                                </Box>
                                            )}

                                            <Box sx={{ mb: 2, mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                                                <MyButton
                                                    label="Retour"
                                                    onClick={handleBackStep}
                                                    disabled={index === 0 || loading}
                                                    sx={{ mr: 1 }}
                                                />

                                                {index === steps.length - 1 ? (
                                                    <MyButton
                                                        label={loading ? <CircularProgress size={24} color="inherit" /> : "Enregistrer"}
                                                        type="submit"
                                                        className="login-btn"
                                                        disabled={loading}
                                                    />
                                                ) : (
                                                    <MyButton
                                                        label="Suivant"
                                                        onClick={handleNextStep}
                                                        disabled={!canProceed() || loading}
                                                        className="login-btn"
                                                    />
                                                )}
                                            </Box>
                                        </StepContent>
                                    </Step>
                                ))}
                            </Stepper>

                            {/* Back to Login Link */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <Typography className="signup-prompt" sx={{ textAlign: 'center', mt: 3 }}>
                                    <Link to="/" className="signup-link">Retour à la connexion</Link>
                                </Typography>
                            </motion.div>
                        </form>
                    </motion.div>
                )}
            </div>

            {/* Floating Animation Elements */}
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

            {/* AI Verification Floating Element */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: '30%',
                    left: '10%',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.7), rgba(129, 199, 132, 0.7))',
                    zIndex: 1,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                animate={{
                    x: [0, 10, 0, -10, 0],
                    scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <AutoAwesome style={{ color: 'white', fontSize: 20 }} />
            </motion.div>

            {/* Another Floating Element */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: '15%',
                    right: '15%',
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.7), rgba(255, 193, 7, 0.7))',
                    zIndex: 1,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
                }}
                animate={{
                    y: [0, 15, 0],
                    opacity: [0.7, 1, 0.7]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Document Verification Progress Animation */}
            {loading && (
                <motion.div
                    style={{
                        position: 'absolute',
                        bottom: '15%',
                        left: '5%',
                        right: '5%',
                        height: 3,
                        background: 'linear-gradient(90deg, #4caf50, #2196f3)',
                        zIndex: 2,
                        borderRadius: 2
                    }}
                    initial={{ width: 0, x: 0, opacity: 0 }}
                    animate={{
                        opacity: [0, 1, 1, 1, 0],
                        x: ['0%', '100%']
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            )}
        </div>
    );
};

export default RegisterAssociation;