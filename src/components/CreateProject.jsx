import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Snackbar,
    Alert,
    Grid,
    Paper,
    Container,
    IconButton,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Divider,
    Chip,
    Fade,
    Tooltip,
    useMediaQuery
} from "@mui/material";
import { useForm } from 'react-hook-form';
import AxiosInstance from './Axios.jsx';
import Dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { styled, useTheme, alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import MyDatePickerField from "./forms/MyDatePickerField.jsx";
import MyTextField from "./forms/MyTextField.jsx";
import MyMultilineField from "./forms/MyMultilineField.jsx";
import MySelectField from "./forms/MySelectField.jsx";

// Icons
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventIcon from '@mui/icons-material/Event';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import GroupIcon from '@mui/icons-material/Group';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

const FormContainer = styled(Paper)(({ theme }) => ({
    borderRadius: '12px',
    padding: theme.spacing(3),
    boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
    backgroundColor: theme.palette.background.paper,
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    margin: '0 auto',
    maxWidth: '100%',
    position: 'relative',
    transition: 'transform 0.3s, box-shadow 0.3s',
    overflow: 'hidden',
    '&:hover': {
        boxShadow: '0 4px 25px rgba(0, 0, 0, 0.12)',
    }
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    padding: theme.spacing(2, 3),
    borderRadius: '8px',
    marginBottom: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
        zIndex: 0,
    }
}));

const SubmitButton = styled(Button)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)',
    },
    borderRadius: '8px',
    padding: '10px 24px',
    fontWeight: 600,
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    '&:active': {
        transform: 'translateY(0)',
    }
}));

const BackButton = styled(Button)(({ theme }) => ({
    borderRadius: '8px',
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
    padding: '10px 24px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
}));

const FormBox = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    '& .MuiFormControl-root': {
        width: '100%',
    },
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        transition: 'transform 0.2s ease',
    },
    '& .MuiFormLabel-root': {
        color: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.8) : theme.palette.primary.main,
    }
}));

const StyledStepLabel = styled(StepLabel)(({ theme }) => ({
    '& .MuiStepLabel-label': {
        fontWeight: 500,
    },
    '& .MuiStepLabel-label.Mui-active': {
        color: theme.palette.primary.main,
        fontWeight: 600,
    },
    '& .MuiStepLabel-iconContainer': {
        paddingRight: theme.spacing(1.5),
    }
}));

const InfoChip = styled(Chip)(({ theme }) => ({
    backgroundColor: alpha(theme.palette.info.main, 0.1),
    color: theme.palette.info.main,
    borderRadius: '16px',
    fontWeight: 500,
    '& .MuiChip-icon': {
        color: theme.palette.info.main,
    }
}));

const StepContentWrapper = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2, 0, 3, 2),
}));

const CreateProject = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const schema = yup.object({
        name: yup.string().required('Le nom est requis'),
        budget: yup.number()
            .typeError('Le budget doit être un nombre')
            .positive('Le budget doit être un nombre positif')
            .required('Le budget est requis'),
        start_date: yup.date().required('La date de début est requise'),
        end_date: yup.date()
            .required('La date de fin est requise')
            .min(yup.ref('start_date'), 'La date de fin doit être postérieure à la date de début'),
        status: yup.string().required('Le statut est requis'),
        description: yup.string().required('La description est requise'),
    });


    const { handleSubmit, control, reset, formState: { errors, isValid, isDirty } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: '',
            description: '',
            budget: '',
            status: '',
            start_date: null,
            end_date: null,
        },
        mode: 'onChange'
    });

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const submission = async (data) => {
        setLoading(true);
        setError(null);
        try {
            await AxiosInstance.post('api/project/', {
                name: data.name,
                start_date: data.start_date ? Dayjs(data.start_date).format('YYYY-MM-DD') : null,
                end_date: data.end_date ? Dayjs(data.end_date).format('YYYY-MM-DD') : null,
                description: data.description,
                status: data.status,
                budget: data.budget,
            });
            setSuccess(true);
            setTimeout(() => {
                reset();
                navigate('/projects', { state: { success: true } });
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const statusOptions = [
        { value: "Non commencé", label: "Non commencé" },
        { value: "En cours", label: "En cours" },
        { value: "Terminé", label: "Terminé" },
        { value: "En pause", label: "En pause" },
        { value: "Annulé", label: "Annulé" },
    ];

    const steps = [
        {
            label: 'Informations sur le projet',
            description: 'Entrez les détails de base du projet',
            icon: <BusinessIcon color="primary" />,
            fields: (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <FormBox>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <BusinessIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="subtitle2">Nom du projet</Typography>
                            </Box>
                            <MyTextField
                                name="name"
                                control={control}
                                placeholder="Entrez le nom du projet"
                                error={!!errors.name}
                                helperText={errors.name?.message}
                            />
                        </FormBox>
                    </Grid>

                    <Grid item xs={12}>
                        <FormBox>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="subtitle2">Description</Typography>
                            </Box>
                            <MyMultilineField
                                name="description"
                                control={control}
                                placeholder="Entrez la description du projet"
                                rows={4}
                                error={!!errors.description}
                                helperText={errors.description?.message}
                            />
                        </FormBox>
                    </Grid>
                </Grid>
            )
        },
        {
            label: 'Calendrier et budget',
            description: 'Définir le calendrier et le budget du projet',
            icon: <AttachMoneyIcon color="primary" />,
            fields: (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <FormBox>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <CalendarTodayIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="subtitle2">Date de début</Typography>
                            </Box>
                            <MyDatePickerField
                                name="start_date"
                                control={control}
                                error={!!errors.start_date}
                                helperText={errors.start_date?.message}
                            />
                        </FormBox>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormBox>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <EventIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="subtitle2">Date Fin</Typography>
                            </Box>
                            <MyDatePickerField
                                name="end_date"
                                control={control}
                                error={!!errors.end_date}
                                helperText={errors.end_date?.message}
                            />
                        </FormBox>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormBox>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="subtitle2">Budget</Typography>
                            </Box>
                            <MyTextField
                                name="budget"
                                control={control}
                                placeholder="Enter budget amount"
                                error={!!errors.budget}
                                helperText={errors.budget?.message}
                            />
                        </FormBox>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormBox>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <TaskAltIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="subtitle2">Statut</Typography>
                            </Box>
                            <MySelectField
                                name="status"
                                control={control}
                                options={statusOptions}
                                error={!!errors.status}
                                helperText={errors.status?.message}
                            />
                        </FormBox>
                    </Grid>
                </Grid>
            )
        },
        {
            label: 'Vérifier et soumettre',
            description: 'Examiner les détails du projet avant la soumission',
            icon: <CheckCircleIcon color="primary" />,
            fields: (
                <Box sx={{ py: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Examinez votre projet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Veuillez vérifier les détails de votre projet ci-dessous avant de le soumettre. Vous pourrez y revenir pour apporter des modifications si nécessaire.
                    </Typography>

                    <InfoChip
                        icon={<InfoOutlinedIcon />}
                        label="Tous les champs seront modifiables après création"
                        sx={{ mb: 3 }}
                    />

                    <Box sx={{
                        p: 2,
                        borderRadius: '8px',
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                        mb: 3
                    }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Nom du projet
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {control._formValues.name || 'Not provided'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Budget
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {control._formValues.budget ? `${control._formValues.budget} TND` : 'Not provided'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Date de début
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {control._formValues.start_date ? Dayjs(control._formValues.start_date).format('YYYY-MM-DD') : 'Not provided'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Date de fin
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {control._formValues.end_date ? Dayjs(control._formValues.end_date).format('YYYY-MM-DD') : 'Not provided'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Statut du Projet
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {control._formValues.status || 'Not provided'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Description
                                </Typography>
                                <Typography variant="body2">
                                    {control._formValues.description || 'Not provided'}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            )
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <Container maxWidth="lg">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <Box sx={{ maxWidth: 1000, margin: '0 auto' }}>
                    {/* Back button */}
                    <Button
                        component={motion.button}
                        variants={itemVariants}
                        onClick={() => navigate('/projects')}
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            mb: 2,
                            fontWeight: 500,
                            color: theme.palette.text.secondary,
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            }
                        }}
                    >
                        Retour aux projets
                    </Button>

                    {/* Header */}
                    <motion.div variants={itemVariants}>
                        <HeaderContainer>
                            <BusinessIcon sx={{ mr: 2, fontSize: 28 }} />
                            <Box sx={{ zIndex: 1 }}>
                                <Typography variant="h5" component="h1" fontWeight="bold">
                                    Créer un nouveau projet
                                </Typography>
                                <Typography variant="subtitle2">
                                    Saisissez les détails pour créer un nouveau projet pour votre organisation
                                </Typography>
                            </Box>
                            {/* Decorative circles */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: -20,
                                    right: -20,
                                    width: 100,
                                    height: 100,
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.1)',
                                    zIndex: 0
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: -30,
                                    right: 100,
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.1)',
                                    zIndex: 0
                                }}
                            />
                        </HeaderContainer>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <FormContainer elevation={0}>
                            <form onSubmit={handleSubmit(submission)}>
                                {/* Desktop Stepper - Horizontal */}
                                {!isMobile && (
                                    <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                                        {steps.map((step, index) => (
                                            <Step key={step.label}>
                                                <StyledStepLabel StepIconProps={{
                                                    icon: step.icon
                                                }}>
                                                    {step.label}
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        {step.description}
                                                    </Typography>
                                                </StyledStepLabel>
                                            </Step>
                                        ))}
                                    </Stepper>
                                )}

                                {/* Mobile Stepper - Vertical */}
                                {isMobile && (
                                    <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 3 }}>
                                        {steps.map((step, index) => (
                                            <Step key={step.label}>
                                                <StyledStepLabel StepIconProps={{
                                                    icon: index + 1
                                                }}>
                                                    {step.label}
                                                </StyledStepLabel>
                                                {activeStep === index && (
                                                    <StepContent>
                                                        <StepContentWrapper>
                                                            {step.fields}
                                                        </StepContentWrapper>
                                                    </StepContent>
                                                )}
                                            </Step>
                                        ))}
                                    </Stepper>
                                )}

                                {/* Form content for desktop */}
                                {!isMobile && (
                                    <Fade in={true} timeout={500}>
                                        <Box sx={{ mt: 2, mb: 4 }}>
                                            {steps[activeStep].fields}
                                        </Box>
                                    </Fade>
                                )}

                                {/* Navigation buttons */}
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    mt: isMobile ? 0 : 2
                                }}>
                                    <BackButton
                                        disabled={activeStep === 0 || loading}
                                        onClick={handleBack}
                                        startIcon={<NavigateBeforeIcon />}
                                    >
                                        Précédente
                                    </BackButton>
                                    <Box>
                                        <Button
                                            onClick={() => reset()}
                                            sx={{
                                                mr: 2,
                                                borderRadius: '8px',
                                                border: `1px solid ${theme.palette.divider}`,
                                                color: theme.palette.text.secondary,
                                            }}
                                            disabled={loading || !isDirty}
                                        >
                                            Réinitialiser
                                        </Button>

                                        {activeStep === steps.length - 1 ? (
                                            <SubmitButton
                                                variant="contained"
                                                type="submit"
                                                disabled={loading || !isValid}
                                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                                            >
                                                {loading ? 'Creating...' : success ? 'Created!' : 'Create Project'}
                                            </SubmitButton>
                                        ) : (
                                            <SubmitButton
                                                variant="contained"
                                                onClick={handleNext}
                                                disabled={
                                                    (activeStep === 0 && (!control._formValues.name || !control._formValues.description)) ||
                                                    (activeStep === 1 && (!control._formValues.start_date || !control._formValues.end_date || !control._formValues.budget || !control._formValues.status))
                                                }
                                                endIcon={<NavigateNextIcon />}
                                            >
                                                Continuer
                                            </SubmitButton>
                                        )}
                                    </Box>
                                </Box>
                            </form>
                        </FormContainer>
                    </motion.div>
                </Box>
            </motion.div>

            {/* Error Notification */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity="error"
                    onClose={() => setError(null)}
                    sx={{ width: '100%', borderRadius: '8px' }}
                    action={
                        <IconButton
                            size="small"
                            aria-label="close"
                            color="inherit"
                            onClick={() => setError(null)}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    }
                >
                    {error}
                </Alert>
            </Snackbar>

            {/* Success Notification */}
            <Snackbar
                open={success}
                autoHideDuration={3000}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity="success"
                    sx={{ width: '100%', borderRadius: '8px' }}
                >
                    Project created successfully! Redirecting to projects list...
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default CreateProject;