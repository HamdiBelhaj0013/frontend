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
import { useNavigate, Link } from 'react-router-dom';
import AxiosInstance from '../Axios.jsx';
import { motion } from 'framer-motion';

// Styled components
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
    { value: 'regular', label: 'Regular Monthly Meeting' },
    { value: 'board', label: 'Board Meeting' },
    { value: 'extraordinary', label: 'Extraordinary Meeting' },
    { value: 'general_assembly', label: 'General Assembly' },
    { value: 'committee', label: 'Committee Meeting' },
    { value: 'other', label: 'Other' },
];

const NOTIFICATION_METHODS = [
    { value: 'email', label: 'Email Only' },
    { value: 'platform', label: 'Platform Only' },
    { value: 'both', label: 'Both Email and Platform' },
];

const steps = ['Basic Information', 'Schedule & Location', 'Additional Options', 'Review & Create'];

const MeetingCreateForm = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
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
        location: '',
        is_virtual: false,
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
    const defaultAgenda = `1. Welcome and Introduction
2. Approval of Previous Meeting Minutes
3. Financial Update
4. Project Updates
5. New Business
6. Open Discussion
7. Action Items Review
8. Next Meeting Date`;

    // Field validation errors
    const [errors, setErrors] = useState({});

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

        // Initialize meeting link when virtual meeting is selected
        if (name === 'is_virtual' && checked && !formData.meeting_link) {
            setFormData({
                ...formData,
                [name]: checked,
                meeting_link: 'https://meet.google.com/'
            });
        }

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
                newErrors.title = 'Meeting title is required';
                isValid = false;
            }
            if (!formData.meeting_type) {
                newErrors.meeting_type = 'Meeting type is required';
                isValid = false;
            }
        }

        // Step 2 validation
        else if (activeStep === 1) {
            if (!formData.start_date) {
                newErrors.start_date = 'Start date is required';
                isValid = false;
            }
            if (!formData.end_date) {
                newErrors.end_date = 'End date is required';
                isValid = false;
            }
            if (formData.end_date && formData.start_date && moment(formData.end_date).isBefore(moment(formData.start_date))) {
                newErrors.end_date = 'End date must be after start date';
                isValid = false;
            }
            if (!formData.is_virtual && !formData.location.trim()) {
                newErrors.location = 'Location is required for in-person meetings';
                isValid = false;
            }
            if (formData.is_virtual && !formData.meeting_link.trim()) {
                newErrors.meeting_link = 'Meeting link is required for virtual meetings';
                isValid = false;
            }
        }

        // Step 3 validation
        else if (activeStep === 2) {
            if (formData.is_recurring) {
                const recurrence = formData.recurrence_pattern;
                if (!recurrence.frequency) {
                    newErrors.frequency = 'Frequency is required';
                    isValid = false;
                }
                if (!recurrence.interval || recurrence.interval < 1) {
                    newErrors.interval = 'Interval must be at least 1';
                    isValid = false;
                }
                if (recurrence.frequency === 'monthly' && (!recurrence.day_of_month || recurrence.day_of_month < 1 || recurrence.day_of_month > 28)) {
                    newErrors.day_of_month = 'Day of month must be between 1 and 28';
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
                    console.log("Retrieved association ID from localStorage:", associationId);
                } catch (e) {
                    console.error("Error parsing user data from localStorage:", e);
                }
            }

            // If association ID is still not available, fetch user profile
            if (!associationId) {
                try {
                    console.log("Association ID not found in localStorage, fetching user profile...");
                    const userProfileResponse = await AxiosInstance.get('/users/profile/');
                    associationId = userProfileResponse.data.association?.id;
                    console.log("Retrieved association ID from profile API:", associationId);
                } catch (profileErr) {
                    console.error("Error fetching user profile:", profileErr);
                    throw new Error("Unable to determine your association. Please log in again.");
                }
            }

            if (!associationId) {
                throw new Error("Your account is not associated with any organization. Please contact an administrator.");
            }

            // Prepare form data for API
            const requestData = {
                ...formData,
                start_date: formData.start_date.toISOString(),
                end_date: formData.end_date.toISOString(),
                association: associationId
            };

            console.log("Sending request data:", requestData);

            const response = await AxiosInstance.post('/meetings/meetings/', requestData);
            console.log("Meeting created successfully:", response.data);
            setSuccess(true);

            // Navigate to the new meeting after a brief delay
            setTimeout(() => {
                navigate(`/meetings/${response.data.id}`);
            }, 1500);
        } catch (err) {
            console.error('Error creating meeting:', err);

            // More detailed error logging
            if (err.response) {
                console.error("Server responded with error:", {
                    status: err.response.status,
                    headers: err.response.headers,
                    data: err.response.data
                });
            } else if (err.request) {
                console.error("No response received:", err.request);
            } else {
                console.error("Request setup error:", err.message);
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
                errorMessage = "Unknown error occurred. Please check console for details.";
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
                    title: 'Meeting Recurrence',
                    content: 'Setting up a recurring meeting will automatically create future meetings based on the pattern you define. You can choose the frequency (monthly, weekly, etc.), interval, and how many instances to create. This is useful for regular scheduled meetings like board meetings or team check-ins.'
                };
            case 'virtual':
                return {
                    title: 'Virtual Meetings',
                    content: 'Virtual meetings require a meeting link where attendees can join remotely. You can use services like Zoom, Google Meet, or Microsoft Teams, and paste the meeting URL here. Make sure to test your link before sharing it with attendees.'
                };
            case 'notifications':
                return {
                    title: 'Notification Methods',
                    content: 'Choose how attendees will be notified about this meeting. Email notifications will be sent to their registered email address. Platform notifications will appear in their dashboard when they log in. For important meetings, we recommend using both methods.'
                };
            default:
                return {
                    title: 'Help',
                    content: 'This form allows you to create a new meeting for your association. Fill in the required information across all steps, then review and submit your meeting details.'
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
                        label="Meeting Title"
                        value={formData.title}
                        onChange={handleInputChange}
                        fullWidth
                        required
                        error={!!errors.title}
                        helperText={errors.title}
                        placeholder="e.g., Monthly Board Meeting - April 2025"
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required error={!!errors.meeting_type}>
                        <InputLabel>Meeting Type</InputLabel>
                        <Select
                            name="meeting_type"
                            value={formData.meeting_type}
                            onChange={handleInputChange}
                            label="Meeting Type"
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
                        placeholder="Brief description of the meeting purpose and goals"
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        name="agenda"
                        label="Agenda"
                        value={formData.agenda}
                        onChange={handleInputChange}
                        fullWidth
                        multiline
                        rows={6}
                        placeholder="Enter meeting agenda items"
                        helperText={
                            <Button
                                size="small"
                                onClick={() => setFormData({...formData, agenda: defaultAgenda})}
                                sx={{ mt: 1 }}
                            >
                                Use Default Template
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
                            label="Start Date & Time"
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
                            label="End Date & Time"
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

                <Grid item xs={12}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.is_virtual}
                                onChange={handleSwitchChange}
                                name="is_virtual"
                                color="primary"
                            />
                        }
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography>Virtual Meeting</Typography>
                                <Tooltip title="Help with virtual meetings">
                                    <IconButton size="small" onClick={() => showHelp('virtual')}>
                                        <HelpOutline fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        }
                    />
                </Grid>

                {formData.is_virtual ? (
                    <Grid item xs={12}>
                        <TextField
                            name="meeting_link"
                            label="Meeting Link"
                            value={formData.meeting_link}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            error={!!errors.meeting_link}
                            helperText={errors.meeting_link}
                            placeholder="e.g., https://zoom.us/j/123456789"
                            InputProps={{
                                startAdornment: <Language sx={{ color: 'action.active', mr: 1 }} />,
                            }}
                        />
                    </Grid>
                ) : (
                    <Grid item xs={12}>
                        <TextField
                            name="location"
                            label="Meeting Location"
                            value={formData.location}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            error={!!errors.location}
                            helperText={errors.location}
                            placeholder="e.g., Conference Room A, Main Office"
                            InputProps={{
                                startAdornment: <LocationOn sx={{ color: 'action.active', mr: 1 }} />,
                            }}
                        />
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
                                    Recurring Meeting
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Tooltip title="Help with recurrence settings">
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
                                                <InputLabel>Frequency</InputLabel>
                                                <Select
                                                    name="frequency"
                                                    value={formData.recurrence_pattern.frequency}
                                                    onChange={handleRecurrenceChange}
                                                    label="Frequency"
                                                >
                                                    <MenuItem value="daily">Daily</MenuItem>
                                                    <MenuItem value="weekly">Weekly</MenuItem>
                                                    <MenuItem value="monthly">Monthly</MenuItem>
                                                </Select>
                                                {errors.frequency && <FormHelperText>{errors.frequency}</FormHelperText>}
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                name="interval"
                                                label="Interval"
                                                type="number"
                                                value={formData.recurrence_pattern.interval}
                                                onChange={handleRecurrenceChange}
                                                fullWidth
                                                required
                                                inputProps={{ min: 1, max: 12 }}
                                                error={!!errors.interval}
                                                helperText={errors.interval || `Repeat every ${formData.recurrence_pattern.interval} ${formData.recurrence_pattern.frequency.slice(0, -2) + (formData.recurrence_pattern.interval > 1 ? 's' : '')}`}
                                            />
                                        </Grid>

                                        {formData.recurrence_pattern.frequency === 'monthly' && (
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    name="day_of_month"
                                                    label="Day of Month"
                                                    type="number"
                                                    value={formData.recurrence_pattern.day_of_month}
                                                    onChange={handleRecurrenceChange}
                                                    fullWidth
                                                    required
                                                    inputProps={{ min: 1, max: 28 }}
                                                    error={!!errors.day_of_month}
                                                    helperText={errors.day_of_month || "Choose between 1-28 to ensure valid dates for all months"}
                                                />
                                            </Grid>
                                        )}

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                name="end_after"
                                                label="End After"
                                                type="number"
                                                value={formData.recurrence_pattern.end_after}
                                                onChange={handleRecurrenceChange}
                                                fullWidth
                                                required
                                                inputProps={{ min: 1, max: 24 }}
                                                helperText={`Creates ${formData.recurrence_pattern.end_after} instances of this meeting`}
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
                                    Notification Settings
                                </Typography>
                                <Tooltip title="Help with notifications">
                                    <IconButton size="small" onClick={() => showHelp('notifications')}>
                                        <HelpOutline fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Notification Method</InputLabel>
                                        <Select
                                            name="notification_method"
                                            value={formData.notification_method}
                                            onChange={handleInputChange}
                                            label="Notification Method"
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
                                        label="Reminder Days Before"
                                        type="number"
                                        value={formData.reminder_days_before}
                                        onChange={handleInputChange}
                                        fullWidth
                                        inputProps={{ min: 1, max: 14 }}
                                        helperText={`Send reminder ${formData.reminder_days_before} days before the meeting`}
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
        return (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        Please review the meeting details below before creating the meeting. All attendees will be notified based on your notification settings.
                    </Alert>
                </Grid>

                {/* Basic Information */}
                <Grid item xs={12} md={6}>
                    <StyledCard>
                        <CardContent>
                            <SectionTitle variant="h6">
                                Basic Information
                            </SectionTitle>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ mb: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Title
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
                                Schedule & Location
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
                                        Time
                                    </Typography>
                                    <Typography variant="body1">
                                        {formData.start_date.format('h:mm A')} - {formData.end_date.format('h:mm A')}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
                                {formData.is_virtual ? (
                                    <VideoCall sx={{ color: theme.palette.primary.main, mr: 1, mt: 0.5 }} fontSize="small" />
                                ) : (
                                    <LocationOn sx={{ color: theme.palette.primary.main, mr: 1, mt: 0.5 }} fontSize="small" />
                                )}
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        {formData.is_virtual ? 'Virtual Meeting' : 'Location'}
                                    </Typography>
                                    <Typography variant="body1">
                                        {formData.is_virtual ? formData.meeting_link : formData.location}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </StyledCard>
                </Grid>

                {/* Additional Options */}
                <Grid item xs={12}>
                    <StyledCard>
                        <CardContent>
                            <SectionTitle variant="h6">
                                Additional Options
                            </SectionTitle>
                            <Divider sx={{ mb: 2 }} />

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Recurring Meeting
                                        </Typography>
                                        <Typography variant="body1">
                                            {formData.is_recurring ? (
                                                <>
                                                    <Chip
                                                        size="small"
                                                        color="primary"
                                                        label="Enabled"
                                                        sx={{ mr: 1 }}
                                                    />
                                                    {`Repeats ${formData.recurrence_pattern.frequency} (every ${formData.recurrence_pattern.interval} ${formData.recurrence_pattern.frequency === 'monthly' ? 'month' : formData.recurrence_pattern.frequency.slice(0, -2)}${formData.recurrence_pattern.interval > 1 ? 's' : ''})`}
                                                </>
                                            ) : (
                                                <Chip size="small" label="Not recurring" />
                                            )}
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Notification Settings
                                        </Typography>
                                        <Typography variant="body1">
                                            {NOTIFICATION_METHODS.find(m => m.value === formData.notification_method)?.label || formData.notification_method}
                                            {`, ${formData.reminder_days_before} ${formData.reminder_days_before === 1 ? 'day' : 'days'} before meeting`}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            {/* Agenda (if provided) */}
                            {formData.agenda && (
                                <>
                                    <Box sx={{ mt: 3, mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Agenda
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
                        Back to Meetings
                    </Button>
                </motion.div>

                {/* Header */}
                <motion.div variants={itemVariants}>
                    <HeaderContainer elevation={0}>
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                Create New Meeting
                            </Typography>
                            <Typography variant="body1">
                                Schedule a new meeting and notify all relevant members
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
                            Meeting created successfully! Redirecting to meeting details...
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
                                    Back
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleNext}
                                    disabled={loading || success}
                                    endIcon={activeStep === steps.length - 1 ? <Check /> : null}
                                >
                                    {activeStep === steps.length - 1 ? 'Create Meeting' : 'Next'}
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
                    Create Meeting
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to create this meeting?
                        {formData.is_recurring && ' This will set up a recurring meeting series.'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setOpenConfirmDialog(false)}
                        color="inherit"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        color="primary"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    >
                        {loading ? 'Creating...' : 'Create Meeting'}
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
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default MeetingCreateForm;