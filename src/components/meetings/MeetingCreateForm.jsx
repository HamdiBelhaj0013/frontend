import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Paper,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Switch,
    FormControlLabel,
    Divider,
    Chip,
    Alert,
    Stepper,
    Step,
    StepLabel,
    CircularProgress,
    IconButton,
    Tooltip,
    Container,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    RadioGroup,
    Radio,
} from '@mui/material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import {
    Event,
    LocationOn,
    AccessTime,
    Description,
    People,
    ArrowBack,
    Add,
    Check,
    CalendarMonth,
    Save,
    Loop,
    Language,
    Notifications,
    Schedule,
    VideoCall,
    Edit,
    DeleteOutline,
    InfoOutlined,
    HelpOutline
} from '@mui/icons-material';
import { useNavigate, Link, useParams } from 'react-router-dom';
import AxiosInstance from '../Axios.jsx';
import { motion } from 'framer-motion';
import { usePermissions } from '../../contexts/PermissionsContext';

// Styled components remain the same
const HeaderContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #4a6bd8, #3949AB)',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    height: '100%',
}));

const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    height: '100%',
    transition: 'all 0.2s ease',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.12)',
    }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
    position: 'relative',
    '&:after': {
        content: '""',
        position: 'absolute',
        bottom: -4,
        left: 0,
        width: 40,
        height: 3,
        backgroundColor: theme.palette.primary.main,
        borderRadius: 3
    }
}));

const MEETING_TYPES = [
    { value: 'regular', label: 'Réunion Mensuelle Ordinaire' },
    { value: 'board', label: 'Réunion du Conseil' },
    { value: 'extraordinary', label: 'Réunion Extraordinaire' },
    { value: 'general_assembly', label: 'Assemblée Générale' },
    { value: 'committee', label: 'Réunion de Comité' },
    { value: 'other', label: 'Autre' },
];

const MEETING_FORMATS = [
    { value: 'in_person', label: 'Présentiel Uniquement' },
    { value: 'virtual', label: 'Virtuel Uniquement' },
    { value: 'hybrid', label: 'Hybride (Présentiel & Virtuel)' },
];

const NOTIFICATION_METHODS = [
    { value: 'email', label: 'Email Uniquement' },
    { value: 'platform', label: 'Plateforme Uniquement' },
    { value: 'both', label: 'Email et Plateforme' },
];

const steps = ['Informations de Base', 'Horaire & Lieu', 'Options Supplémentaires', 'Révision & Création'];

const MeetingCreateForm = ({ isEditMode = false, meetingId = null }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { can, RESOURCES, ACTIONS } = usePermissions();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [helpDialogOpen, setHelpDialogOpen] = useState(false);
    const [helpTopic, setHelpTopic] = useState('');

    // Form fields state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        meeting_type: 'regular',
        start_date: moment().add(1, 'day').set({ hour: 10, minute: 0, second: 0 }),
        end_date: moment().add(1, 'day').set({ hour: 12, minute: 0, second: 0 }),
        meeting_format: 'in_person', // New field for meeting format
        location: '',
        meeting_link: '',
        agenda: '',
        is_recurring: false,
        recurrence_pattern: {
            frequency: 'monthly',
            interval: 1,
            day_of_month: moment().date(),
            end_after: 12
        },
        notification_method: 'both',
        reminder_days_before: 2
    });

    // Default agenda template
    const defaultAgenda = `1. Accueil et Introduction
2. Approbation du Procès-Verbal de la Réunion Précédente
3. Mise à Jour Financière
4. Mises à Jour des Projets
5. Nouveaux Sujets
6. Discussion Ouverte
7. Révision des Points d'Action
8. Date de la Prochaine Réunion`;

    // Field validation errors
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEditMode && meetingId) {
            const fetchMeetingData = async () => {
                try {
                    setInitialLoading(true);
                    setError(null);

                    console.log(`Récupération des données de la réunion pour ID: ${meetingId}`);

                    // Fetch meeting data
                    const response = await AxiosInstance.get(`/meetings/meetings/${meetingId}/`);
                    const meetingData = response.data;

                    console.log("Données de réunion récupérées:", meetingData);

                    // Determine meeting format from existing data
                    let meetingFormat = 'in_person';
                    if (meetingData.is_virtual) {
                        meetingFormat = meetingData.location ? 'hybrid' : 'virtual';
                    }

                    // Convert to form data format
                    setFormData({
                        title: meetingData.title || '',
                        description: meetingData.description || '',
                        meeting_type: meetingData.meeting_type || 'regular',
                        start_date: moment(meetingData.start_date),
                        end_date: moment(meetingData.end_date),
                        meeting_format: meetingFormat,
                        location: meetingData.location || '',
                        meeting_link: meetingData.meeting_link || '',
                        agenda: meetingData.agenda || '',
                        is_recurring: meetingData.is_recurring || false,
                        recurrence_pattern: meetingData.recurrence_pattern || {
                            frequency: 'monthly',
                            interval: 1,
                            day_of_month: moment(meetingData.start_date).date(),
                            end_after: 12
                        },
                        notification_method: meetingData.notification_method || 'both',
                        reminder_days_before: meetingData.reminder_days_before || 2
                    });

                    setInitialLoading(false);
                } catch (err) {
                    console.error('Erreur lors de la récupération des données de réunion:', err);

                    // Log more detailed error info
                    if (err.response) {
                        console.error("Erreur de réponse:", err.response.status, err.response.data);
                    } else if (err.request) {
                        console.error("Erreur de requête:", err.request);
                    } else {
                        console.error("Message d'erreur:", err.message);
                    }

                    setError('Échec du chargement des données de réunion. Veuillez réessayer.');
                    setInitialLoading(false);
                }
            };

            fetchMeetingData();
        }
    }, [isEditMode, meetingId]);

    // Handle text field changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear error when field is edited
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    // Handle switch field changes
    const handleSwitchChange = (e) => {
        const { name, checked } = e.target;
        setFormData({ ...formData, [name]: checked });

        // Initialize agenda if empty
        if (name === 'is_recurring' && checked && !formData.agenda) {
            setFormData({
                ...formData,
                [name]: checked,
                agenda: defaultAgenda
            });
        }
    };

    // Handle date changes
    const handleDateChange = (name, value) => {
        setFormData({ ...formData, [name]: value });

        // If start date changes, adjust end date to be 2 hours later
        if (name === 'start_date') {
            const newEndDate = moment(value).add(2, 'hours');
            setFormData({
                ...formData,
                [name]: value,
                end_date: newEndDate
            });
        }

        // Clear error when field is edited
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    // Handle recurrence pattern changes
    const handleRecurrenceChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            recurrence_pattern: {
                ...formData.recurrence_pattern,
                [name]: value
            }
        });
    };

    // Validate form fields for current step
    const validateStep = () => {
        const newErrors = {};
        let isValid = true;

        // Step 1 validation
        if (activeStep === 0) {
            if (!formData.title.trim()) {
                newErrors.title = 'Le titre de la réunion est requis';
                isValid = false;
            }
            if (!formData.meeting_type) {
                newErrors.meeting_type = 'Le type de réunion est requis';
                isValid = false;
            }
        }

        // Step 2 validation
        else if (activeStep === 1) {
            if (!formData.start_date) {
                newErrors.start_date = 'La date de début est requise';
                isValid = false;
            }
            if (!formData.end_date) {
                newErrors.end_date = 'La date de fin est requise';
                isValid = false;
            }
            if (formData.end_date && formData.start_date && moment(formData.end_date).isBefore(moment(formData.start_date))) {
                newErrors.end_date = 'La date de fin doit être postérieure à la date de début';
                isValid = false;
            }

            // Validate based on meeting format
            if (formData.meeting_format === 'in_person' || formData.meeting_format === 'hybrid') {
                if (!formData.location.trim()) {
                    newErrors.location = 'Le lieu est requis pour les réunions en présentiel ou hybrides';
                    isValid = false;
                }
            }

            if (formData.meeting_format === 'virtual' || formData.meeting_format === 'hybrid') {
                if (!formData.meeting_link.trim()) {
                    newErrors.meeting_link = 'Le lien de réunion est requis pour les réunions virtuelles ou hybrides';
                    isValid = false;
                }
            }
        }

        // Step 3 validation
        else if (activeStep === 2) {
            if (formData.is_recurring) {
                const recurrence = formData.recurrence_pattern;
                if (!recurrence.frequency) {
                    newErrors.frequency = 'La fréquence est requise';
                    isValid = false;
                }
                if (!recurrence.interval || recurrence.interval < 1) {
                    newErrors.interval = 'L\'intervalle doit être d\'au moins 1';
                    isValid = false;
                }
                if (recurrence.frequency === 'monthly' && (!recurrence.day_of_month || recurrence.day_of_month < 1 || recurrence.day_of_month > 28)) {
                    newErrors.day_of_month = 'Le jour du mois doit être entre 1 et 28';
                    isValid = false;
                }
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    // Handle next step
    const handleNext = () => {
        if (validateStep()) {
            if (activeStep === steps.length - 1) {
                setOpenConfirmDialog(true);
            } else {
                setActiveStep((prevStep) => prevStep + 1);
            }
        }
    };

    // Handle back step
    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);
            setOpenConfirmDialog(false);

            // First try to get user from localStorage
            let associationId = null;
            const userStr = localStorage.getItem('user');

            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    associationId = user?.association?.id;
                    console.log("ID d'association récupéré depuis localStorage:", associationId);
                } catch (e) {
                    console.error("Erreur d'analyse des données utilisateur depuis localStorage:", e);
                }
            }

            // If association ID is still not available, fetch user profile
            if (!associationId) {
                try {
                    console.log("ID d'association non trouvé dans localStorage, récupération du profil utilisateur...");
                    const userProfileResponse = await AxiosInstance.get('/users/profile/');
                    associationId = userProfileResponse.data.association?.id;
                    console.log("ID d'association récupéré depuis l'API de profil:", associationId);
                } catch (profileErr) {
                    console.error("Erreur lors de la récupération du profil utilisateur:", profileErr);
                    throw new Error("Impossible de déterminer votre association. Veuillez vous reconnecter.");
                }
            }

            if (!associationId) {
                throw new Error("Votre compte n'est associé à aucune organisation. Veuillez contacter un administrateur.");
            }

            // Prepare form data for API - convert meeting_format to is_virtual for API compatibility
            const requestData = {
                ...formData,
                start_date: formData.start_date.toISOString(),
                end_date: formData.end_date.toISOString(),
                association: associationId,
                is_virtual: formData.meeting_format === 'virtual' || formData.meeting_format === 'hybrid'
            };

            console.log("Envoi des données de requête:", requestData);

            let response;
            if (isEditMode) {
                // Update existing meeting
                response = await AxiosInstance.put(`/meetings/meetings/${meetingId}/`, requestData);
                console.log("Réunion mise à jour avec succès:", response.data);
            } else {
                // Create new meeting
                response = await AxiosInstance.post('/meetings/meetings/', requestData);
                console.log("Réunion créée avec succès:", response.data);
            }

            setSuccess(true);

            // Navigate to the meeting details after a brief delay
            setTimeout(() => {
                navigate(`/meetings/${isEditMode ? meetingId : response.data.id}`);
            }, 1500);
        } catch (err) {
            console.error(`Erreur lors de ${isEditMode ? 'la mise à jour' : 'la création'} de la réunion:`, err);

            // More detailed error logging
            if (err.response) {
                console.error("Le serveur a répondu avec une erreur:", {
                    status: err.response.status,
                    headers: err.response.headers,
                    data: err.response.data
                });
            } else if (err.request) {
                console.error("Aucune réponse reçue:", err.request);
            } else {
                console.error("Erreur de configuration de la requête:", err.message);
            }

            let errorMessage;
            if (err.response?.data) {
                if (typeof err.response.data === 'object') {
                    errorMessage = Object.entries(err.response.data)
                        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
                        .join(', ');
                } else {
                    errorMessage = err.response.data;
                }
            } else if (err.message) {
                errorMessage = err.message;
            } else {
                errorMessage = "Une erreur inconnue s'est produite. Veuillez consulter la console pour plus de détails.";
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Show help dialog for specific topics
    const showHelp = (topic) => {
        setHelpTopic(topic);
        setHelpDialogOpen(true);
    };

    // Get help content based on topic
    const getHelpContent = () => {
        switch (helpTopic) {
            case 'recurrence':
                return {
                    title: 'Récurrence de Réunion',
                    content: 'La configuration d\'une réunion récurrente créera automatiquement des réunions futures selon le modèle que vous définissez. Vous pouvez choisir la fréquence (mensuelle, hebdomadaire, etc.), l\'intervalle et le nombre d\'instances à créer. Ceci est utile pour les réunions régulières programmées comme les réunions du conseil ou les points d\'équipe.'
                };
            case 'virtual':
                return {
                    title: 'Réunions Virtuelles',
                    content: 'Les réunions virtuelles nécessitent un lien de réunion où les participants peuvent se joindre à distance. Vous pouvez utiliser des services comme Zoom, Google Meet ou Microsoft Teams, et coller l\'URL de la réunion ici. Assurez-vous de tester votre lien avant de le partager avec les participants.'
                };
            case 'hybrid':
                return {
                    title: 'Réunions Hybrides',
                    content: 'Les réunions hybrides combinent des éléments en présentiel et virtuels. Les participants en présentiel se réunissent à un emplacement physique, tandis que les participants à distance rejoignent via le lien de réunion. Ce format offre de la flexibilité pour les membres de l\'équipe qui ne peuvent pas assister en personne. Assurez-vous que votre lieu physique et votre lien de réunion sont clairement spécifiés pour accommoder tous les participants.'
                };
            case 'notifications':
                return {
                    title: 'Méthodes de Notification',
                    content: 'Choisissez comment les participants seront notifiés de cette réunion. Les notifications par e-mail seront envoyées à leur adresse e-mail enregistrée. Les notifications de plateforme apparaîtront dans leur tableau de bord lorsqu\'ils se connecteront. Pour les réunions importantes, nous recommandons d\'utiliser les deux méthodes.'
                };
            default:
                return {
                    title: 'Aide',
                    content: 'Ce formulaire vous permet de créer une nouvelle réunion pour votre association. Remplissez les informations requises à toutes les étapes, puis révisez et soumettez les détails de votre réunion.'
                };
        }
    };

    // Motion animation variants
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

    // Render form steps
    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return renderBasicInfoStep();
            case 1:
                return renderScheduleStep();
            case 2:
                return renderOptionsStep();
            case 3:
                return renderReviewStep();
            default:
                return null;
        }
    };

    // Step 1: Basic information
    const renderBasicInfoStep = () => {
        return (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField
                        name="title"
                        label="Titre de la Réunion"
                        value={formData.title}
                        onChange={handleInputChange}
                        fullWidth
                        required
                        error={!!errors.title}
                        helperText={errors.title}
                        placeholder="ex., Réunion Mensuelle du Conseil - Avril 2025"
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required error={!!errors.meeting_type}>
                        <InputLabel>Type de Réunion</InputLabel>
                        <Select
                            name="meeting_type"
                            value={formData.meeting_type}
                            onChange={handleInputChange}
                            label="Type de Réunion"
                        >
                            {MEETING_TYPES.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                    {type.label}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.meeting_type && <FormHelperText>{errors.meeting_type}</FormHelperText>}
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        name="description"
                        label="Description"
                        value={formData.description}
                        onChange={handleInputChange}
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Brève description de l'objectif et des buts de la réunion"
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        name="agenda"
                        label="Ordre du Jour"
                        value={formData.agenda}
                        onChange={handleInputChange}
                        fullWidth
                        multiline
                        rows={6}
                        placeholder="Saisissez les points de l'ordre du jour"
                        helperText={
                            <Button
                                size="small"
                                onClick={() => setFormData({...formData, agenda: defaultAgenda})}
                                sx={{ mt: 1 }}
                            >
                                Utiliser le Modèle par Défaut
                            </Button>
                        }
                    />
                </Grid>
            </Grid>
        );
    };

    // Step 2: Schedule & Location
    const renderScheduleStep = () => {
        return (
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterMoment}>
                        <DateTimePicker
                            label="Date & Heure de Début"
                            value={formData.start_date}
                            onChange={(newValue) => handleDateChange('start_date', newValue)}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    required: true,
                                    error: !!errors.start_date,
                                    helperText: errors.start_date
                                }
                            }}
                        />
                    </LocalizationProvider>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterMoment}>
                        <DateTimePicker
                            label="Date & Heure de Fin"
                            value={formData.end_date}
                            onChange={(newValue) => handleDateChange('end_date', newValue)}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    required: true,
                                    error: !!errors.end_date,
                                    helperText: errors.end_date
                                }
                            }}
                        />
                    </LocalizationProvider>
                </Grid>

                {/* Meeting Format Selection */}
                <Grid item xs={12}>
                    <FormControl component="fieldset" sx={{ width: '100%' }}>
                        <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                            Format de Réunion
                            <Tooltip title="Aide sur les formats de réunion">
                                <IconButton size="small" onClick={() => showHelp('hybrid')} sx={{ ml: 1 }}>
                                    <HelpOutline fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Typography>

                        <RadioGroup
                            row
                            name="meeting_format"
                            value={formData.meeting_format}
                            onChange={handleInputChange}
                        >
                            {MEETING_FORMATS.map((format) => (
                                <FormControlLabel
                                    key={format.value}
                                    value={format.value}
                                    control={<Radio />}
                                    label={format.label}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>
                </Grid>

                {/* Conditionally show location field for in-person or hybrid meetings */}
                {(formData.meeting_format === 'in_person' || formData.meeting_format === 'hybrid') && (
                    <Grid item xs={12}>
                        <TextField
                            name="location"
                            label="Lieu de la Réunion"
                            value={formData.location}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            error={!!errors.location}
                            helperText={errors.location}
                            placeholder="ex., Salle de Conférence A, Bureau Principal"
                            InputProps={{
                                startAdornment: <LocationOn sx={{ color: 'action.active', mr: 1 }} />,
                            }}
                        />
                    </Grid>
                )}

                {/* Conditionally show meeting link field for virtual or hybrid meetings */}
                {(formData.meeting_format === 'virtual' || formData.meeting_format === 'hybrid') && (
                    <Grid item xs={12}>
                        <TextField
                            name="meeting_link"
                            label="Lien de Réunion"
                            value={formData.meeting_link}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            error={!!errors.meeting_link}
                            helperText={errors.meeting_link}
                            placeholder="ex., https://zoom.us/j/123456789"
                            InputProps={{
                                startAdornment: <Language sx={{ color: 'action.active', mr: 1 }} />,
                            }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            {formData.meeting_format === 'hybrid'
                                ? "Les participants à distance utiliseront ce lien tandis que les autres assisteront en personne."
                                : "Tous les participants rejoindront la réunion via ce lien."}
                        </Typography>
                    </Grid>
                )}
            </Grid>
        );
    };

    // Step 3: Additional Options
    const renderOptionsStep = () => {
        return (
            <Grid container spacing={3}>
                {/* Recurring Meeting Option */}
                <Grid item xs={12}>
                    <StyledCard>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Réunion Récurrente
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Tooltip title="Aide sur les paramètres de récurrence">
                                        <IconButton size="small" onClick={() => showHelp('recurrence')}>
                                            <HelpOutline fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.is_recurring}
                                                onChange={handleSwitchChange}
                                                name="is_recurring"
                                                color="primary"
                                            />
                                        }
                                        label=""
                                    />
                                </Box>
                            </Box>

                            {formData.is_recurring && (
                                <Box sx={{ mt: 2 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth required error={!!errors.frequency}>
                                                <InputLabel>Fréquence</InputLabel>
                                                <Select
                                                    name="frequency"
                                                    value={formData.recurrence_pattern.frequency}
                                                    onChange={handleRecurrenceChange}
                                                    label="Fréquence"
                                                >
                                                    <MenuItem value="daily">Quotidienne</MenuItem>
                                                    <MenuItem value="weekly">Hebdomadaire</MenuItem>
                                                    <MenuItem value="monthly">Mensuelle</MenuItem>
                                                </Select>
                                                {errors.frequency && <FormHelperText>{errors.frequency}</FormHelperText>}
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                name="interval"
                                                label="Intervalle"
                                                type="number"
                                                value={formData.recurrence_pattern.interval}
                                                onChange={handleRecurrenceChange}
                                                fullWidth
                                                required
                                                inputProps={{ min: 1, max: 12 }}
                                                error={!!errors.interval}
                                                helperText={errors.interval || `Répéter tous les ${formData.recurrence_pattern.interval} ${formData.recurrence_pattern.frequency === 'daily' ? 'jours' : formData.recurrence_pattern.frequency === 'weekly' ? 'semaines' : 'mois'}`}
                                            />
                                        </Grid>

                                        {formData.recurrence_pattern.frequency === 'monthly' && (
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    name="day_of_month"
                                                    label="Jour du Mois"
                                                    type="number"
                                                    value={formData.recurrence_pattern.day_of_month}
                                                    onChange={handleRecurrenceChange}
                                                    fullWidth
                                                    required
                                                    inputProps={{ min: 1, max: 28 }}
                                                    error={!!errors.day_of_month}
                                                    helperText={errors.day_of_month || "Choisissez entre 1-28 pour garantir des dates valides pour tous les mois"}
                                                />
                                            </Grid>
                                        )}

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                name="end_after"
                                                label="Terminer Après"
                                                type="number"
                                                value={formData.recurrence_pattern.end_after}
                                                onChange={handleRecurrenceChange}
                                                fullWidth
                                                required
                                                inputProps={{ min: 1, max: 24 }}
                                                helperText={`Crée ${formData.recurrence_pattern.end_after} occurrences de cette réunion`}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}
                        </CardContent>
                    </StyledCard>
                </Grid>

                {/* Notification Settings */}
                <Grid item xs={12}>
                    <StyledCard>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Paramètres de Notification
                                </Typography>
                                <Tooltip title="Aide sur les notifications">
                                    <IconButton size="small" onClick={() => showHelp('notifications')}>
                                        <HelpOutline fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Méthode de Notification</InputLabel>
                                        <Select
                                            name="notification_method"
                                            value={formData.notification_method}
                                            onChange={handleInputChange}
                                            label="Méthode de Notification"
                                        >
                                            {NOTIFICATION_METHODS.map((method) => (
                                                <MenuItem key={method.value} value={method.value}>
                                                    {method.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="reminder_days_before"
                                        label="Jours de Rappel Avant"
                                        type="number"
                                        value={formData.reminder_days_before}
                                        onChange={handleInputChange}
                                        fullWidth
                                        inputProps={{ min: 1, max: 14 }}
                                        helperText={`Envoyer un rappel ${formData.reminder_days_before} jours avant la réunion`}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </StyledCard>
                </Grid>
            </Grid>
        );
    };

    // Step 4: Review
    const renderReviewStep = () => {
        // Get the meeting format display label
        const getMeetingFormatLabel = () => {
            const format = MEETING_FORMATS.find(f => f.value === formData.meeting_format);
            return format ? format.label : formData.meeting_format;
        };

        return (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        Veuillez vérifier les détails de la réunion ci-dessous avant de {isEditMode ? 'mettre à jour' : 'créer'} la réunion. Tous les participants seront notifiés selon vos paramètres de notification.
                    </Alert>
                </Grid>

                {/* Basic Information */}
                <Grid item xs={12} md={6}>
                    <StyledCard>
                        <CardContent>
                            <SectionTitle variant="h6">
                                Informations de Base
                            </SectionTitle>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ mb: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Titre
                                </Typography>
                                <Typography variant="body1" fontWeight="medium">
                                    {formData.title}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Type
                                </Typography>
                                <Typography variant="body1">
                                    {MEETING_TYPES.find(t => t.value === formData.meeting_type)?.label || formData.meeting_type}
                                </Typography>
                            </Box>

                            {formData.description && (
                                <Box sx={{ mb: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Description
                                    </Typography>
                                    <Typography variant="body2">
                                        {formData.description}
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </StyledCard>
                </Grid>

                {/* Schedule & Location */}
                <Grid item xs={12} md={6}>
                    <StyledCard>
                        <CardContent>
                            <SectionTitle variant="h6">
                                Horaire & Lieu
                            </SectionTitle>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
                                <CalendarMonth sx={{ color: theme.palette.primary.main, mr: 1, mt: 0.5 }} fontSize="small" />
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Date
                                    </Typography>
                                    <Typography variant="body1">
                                        {formData.start_date.format('dddd, MMMM D, YYYY')}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
                                <AccessTime sx={{ color: theme.palette.primary.main, mr: 1, mt: 0.5 }} fontSize="small" />
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Heure
                                    </Typography>
                                    <Typography variant="body1">
                                        {formData.start_date.format('h:mm A')} - {formData.end_date.format('h:mm A')}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Format de Réunion
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        {getMeetingFormatLabel()}
                                    </Typography>
                                </Box>
                            </Box>

                            {(formData.meeting_format === 'in_person' || formData.meeting_format === 'hybrid') && (
                                <Box sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
                                    <LocationOn sx={{ color: theme.palette.primary.main, mr: 1, mt: 0.5 }} fontSize="small" />
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Lieu
                                        </Typography>
                                        <Typography variant="body1">
                                            {formData.location}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {(formData.meeting_format === 'virtual' || formData.meeting_format === 'hybrid') && (
                                <Box sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
                                    <VideoCall sx={{ color: theme.palette.primary.main, mr: 1, mt: 0.5 }} fontSize="small" />
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Lien de Réunion
                                        </Typography>
                                        <Typography variant="body1">
                                            {formData.meeting_link}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </CardContent>
                    </StyledCard>
                </Grid>

                {/* Additional Options */}
                <Grid item xs={12}>
                    <StyledCard>
                        <CardContent>
                            <SectionTitle variant="h6">
                                Options Supplémentaires
                            </SectionTitle>
                            <Divider sx={{ mb: 2 }} />

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Réunion Récurrente
                                        </Typography>
                                        <Typography variant="body1">
                                            {formData.is_recurring ? (
                                                <>
                                                    <Chip
                                                        size="small"
                                                        color="primary"
                                                        label="Activée"
                                                        sx={{ mr: 1 }}
                                                    />
                                                    {`Répète ${formData.recurrence_pattern.frequency === 'daily' ? 'quotidiennement' : formData.recurrence_pattern.frequency === 'weekly' ? 'hebdomadairement' : 'mensuellement'} (chaque ${formData.recurrence_pattern.interval} ${formData.recurrence_pattern.frequency === 'daily' ? 'jour' : formData.recurrence_pattern.frequency === 'weekly' ? 'semaine' : 'mois'}${formData.recurrence_pattern.interval > 1 ? 's' : ''})`}
                                                </>
                                            ) : (
                                                <Chip size="small" label="Non récurrente" />
                                            )}
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Paramètres de Notification
                                        </Typography>
                                        <Typography variant="body1">
                                            {NOTIFICATION_METHODS.find(m => m.value === formData.notification_method)?.label || formData.notification_method}
                                            {`, ${formData.reminder_days_before} ${formData.reminder_days_before === 1 ? 'jour' : 'jours'} avant la réunion`}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            {/* Agenda (if provided) */}
                            {formData.agenda && (
                                <>
                                    <Box sx={{ mt: 3, mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Ordre du Jour
                                        </Typography>
                                        <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), mt: 1, borderRadius: 2 }}>
                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                                {formData.agenda}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                </>
                            )}
                        </CardContent>
                    </StyledCard>
                </Grid>
            </Grid>
        );
    };

    if (initialLoading) {
        return (
            <Container maxWidth="md">
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '60vh'
                    }}
                >
                    <CircularProgress size={60} thickness={4} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Chargement des détails de la réunion...
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Back button */}
                <motion.div variants={itemVariants}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/meetings')}
                        sx={{
                            mb: 2,
                            fontWeight: 500,
                            color: theme.palette.text.secondary,
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            }
                        }}
                    >
                        Retour aux Réunions
                    </Button>
                </motion.div>

                {/* Header */}
                <motion.div variants={itemVariants}>
                    <HeaderContainer elevation={0}>
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                {isEditMode ? 'Modifier la Réunion' : 'Créer une Nouvelle Réunion'}
                            </Typography>
                            <Typography variant="body1">
                                {isEditMode
                                    ? 'Mettre à jour les détails de la réunion et notifier tous les membres concernés'
                                    : 'Planifier une nouvelle réunion et notifier tous les membres concernés'}
                            </Typography>
                        </Box>

                        {/* Decorative circles */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: -50,
                                right: -50,
                                width: 200,
                                height: 200,
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
                                width: 100,
                                height: 100,
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                zIndex: 0
                            }}
                        />
                    </HeaderContainer>
                </motion.div>

                {/* Success Message */}
                {success && (
                    <motion.div variants={itemVariants}>
                        <Alert
                            severity="success"
                            sx={{ mb: 3 }}
                            action={
                                <CircularProgress size={20} thickness={5} />
                            }
                        >
                            Réunion {isEditMode ? 'mise à jour' : 'créée'} avec succès ! Redirection vers les détails de la réunion...
                        </Alert>
                    </motion.div>
                )}

                {/* Error Message */}
                {error && (
                    <motion.div variants={itemVariants}>
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    </motion.div>
                )}

                {/* Stepper */}
                <motion.div variants={itemVariants}>
                    <StyledPaper sx={{ mb: 3 }}>
                        <Stepper activeStep={activeStep} alternativeLabel>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </StyledPaper>
                </motion.div>

                {/* Form Content */}
                <motion.div variants={itemVariants}>
                    <StyledPaper>
                        <form>
                            {renderStepContent()}

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                                <Button
                                    disabled={activeStep === 0 || loading || success}
                                    onClick={handleBack}
                                    variant="outlined"
                                >
                                    Retour
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleNext}
                                    disabled={loading || success}
                                    endIcon={activeStep === steps.length - 1 ? <Check /> : null}
                                >
                                    {activeStep === steps.length - 1 ? (isEditMode ? 'Mettre à Jour la Réunion' : 'Créer la Réunion') : 'Suivant'}
                                </Button>
                            </Box>
                        </form>
                    </StyledPaper>
                </motion.div>
            </motion.div>

            {/* Confirmation Dialog */}
            <Dialog
                open={openConfirmDialog}
                onClose={() => setOpenConfirmDialog(false)}
                aria-labelledby="confirm-meeting-dialog-title"
                PaperProps={{
                    sx: { borderRadius: '12px' }
                }}
            >
                <DialogTitle id="confirm-meeting-dialog-title">
                    {isEditMode ? 'Mettre à Jour la Réunion' : 'Créer la Réunion'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Êtes-vous sûr de vouloir {isEditMode ? 'mettre à jour' : 'créer'} cette réunion ?
                        {formData.is_recurring && !isEditMode && ' Cela configurera une série de réunions récurrentes.'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setOpenConfirmDialog(false)}
                        color="inherit"
                        disabled={loading}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        color="primary"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    >
                        {loading ? (isEditMode ? 'Mise à jour...' : 'Création...') : (isEditMode ? 'Mettre à Jour' : 'Créer')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Help Dialog */}
            <Dialog
                open={helpDialogOpen}
                onClose={() => setHelpDialogOpen(false)}
                aria-labelledby="help-dialog-title"
                PaperProps={{
                    sx: { borderRadius: '12px' }
                }}
            >
                <DialogTitle id="help-dialog-title">
                    {getHelpContent().title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {getHelpContent().content}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setHelpDialogOpen(false)} color="primary">
                        Fermer
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default MeetingCreateForm;