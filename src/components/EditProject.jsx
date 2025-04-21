import React, { useState, useEffect } from 'react';
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
    Divider,
    Chip,
    useMediaQuery,
    Tabs,
    Tab,
    Fade
} from "@mui/material";
import { useForm } from 'react-hook-form';
import AxiosInstance from './Axios.jsx';
import Dayjs from "dayjs";
import { useNavigate, useParams, Link } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { styled, useTheme, alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Form Fields
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
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Styled components
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

const SaveButton = styled(Button)(({ theme }) => ({
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

const DeleteButton = styled(Button)(({ theme }) => ({
    backgroundColor: theme.palette.error.main,
    color: theme.palette.common.white,
    '&:hover': {
        backgroundColor: theme.palette.error.dark,
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)',
    },
    borderRadius: '8px',
    padding: '10px 24px',
    fontWeight: 600,
    transition: 'all 0.3s ease',
    '&:active': {
        transform: 'translateY(0)',
    }
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

const StyledTab = styled(Tab)(({ theme }) => ({
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.9rem',
    minHeight: 48,
    borderRadius: '8px 8px 0 0',
    '&.Mui-selected': {
        color: theme.palette.primary.main,
        fontWeight: 600,
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

const EditProject = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [projectData, setProjectData] = useState(null);

    // Form validation schema
    const schema = yup.object({
        name: yup.string().required('Name is required'),
        budget: yup.number()
            .typeError('Budget must be a number')
            .positive('Budget must be a positive number')
            .required('Budget is required'),
        start_date: yup.date().required('Start date is required'),
        end_date: yup.date()
            .required('End date is required')
            .min(yup.ref('start_date'),'The end date should be after the start date'),
        status: yup.string().required('Status is required'),
        description: yup.string().required('Description is required'),
    });

    const { handleSubmit, control, setValue, formState: { errors, isValid, isDirty } } = useForm({
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

    // Fetch project data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await AxiosInstance.get(`api/project/${id}`);
                const data = response.data;

                setValue("name", data.name);
                setValue("description", data.description);
                setValue("budget", data.budget);
                setValue("status", data.status);
                setValue("start_date", data.start_date ? Dayjs(data.start_date) : null);
                setValue("end_date", data.end_date ? Dayjs(data.end_date) : null);

                setProjectData(data);
            } catch (err) {
                console.error('Error fetching project:', err);
                setError('Failed to load project data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, setValue]);

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Form submission handler
    const onSubmit = async (data) => {
        setSaving(true);
        setError(null);

        try {
            await AxiosInstance.put(`api/project/${id}/`, {
                name: data.name,
                start_date: data.start_date ? Dayjs(data.start_date).format('YYYY-MM-DD') : null,
                end_date: data.end_date ? Dayjs(data.end_date).format('YYYY-MM-DD') : null,
                description: data.description,
                status: data.status,
                budget: parseFloat(data.budget),
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/projects', {
                    state: {
                        success: true,
                        message: `Project "${data.name}" was updated successfully`
                    }
                });
            }, 1500);
        } catch (err) {
            console.error('Error updating project:', err);
            setError(err.response?.data?.message || 'Failed to update project. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Status options
    const statusOptions = [
        { value: "Not Started", label: "Not Started" },
        { value: "In Progress", label: "In Progress" },
        { value: "Completed", label: "Completed" },
        { value: "On Hold", label: "On Hold" },
        { value: "Cancelled", label: "Cancelled" },
    ];

    // Animation variants
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
                        Back to Projects
                    </Button>

                    {/* Header */}
                    <motion.div variants={itemVariants}>
                        <HeaderContainer>
                            <BusinessIcon sx={{ mr: 2, fontSize: 28 }} />
                            <Box sx={{ zIndex: 1 }}>
                                <Typography variant="h5" component="h1" fontWeight="bold">
                                    Edit Project
                                </Typography>
                                <Typography variant="subtitle2">
                                    {projectData?.name ? `Editing: ${projectData.name}` : 'Update project details'}
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

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Alert
                            severity="error"
                            sx={{ mb: 3, borderRadius: '8px' }}
                            action={
                                <Button color="inherit" size="small" onClick={() => navigate('/projects')}>
                                    Go Back
                                </Button>
                            }
                        >
                            {error}
                        </Alert>
                    ) : (
                        <motion.div variants={itemVariants}>
                            <FormContainer elevation={0}>
                                {/* Tabs */}
                                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                                    <Tabs
                                        value={tabValue}
                                        onChange={handleTabChange}
                                        aria-label="project edit tabs"
                                        indicatorColor="primary"
                                        textColor="primary"
                                    >
                                        <StyledTab label="Project Details" icon={<BusinessIcon />} iconPosition="start" />
                                        <StyledTab label="Dates & Budget" icon={<AttachMoneyIcon />} iconPosition="start" />
                                    </Tabs>
                                </Box>

                                <form onSubmit={handleSubmit(onSubmit)}>
                                    {/* Tab Content */}
                                    <Box sx={{ mb: 3 }}>
                                        {/* Project Details Tab */}
                                        <Fade in={tabValue === 0} unmountOnExit>
                                            <Box hidden={tabValue !== 0}>
                                                <Grid container spacing={3}>
                                                    <Grid item xs={12}>
                                                        <FormBox>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                <BusinessIcon color="primary" sx={{ mr: 1 }} />
                                                                <Typography variant="subtitle2">Project Name</Typography>
                                                            </Box>
                                                            <MyTextField
                                                                name="name"
                                                                control={control}
                                                                placeholder="Enter project name"
                                                                error={!!errors.name}
                                                                helperText={errors.name?.message}
                                                            />
                                                        </FormBox>
                                                    </Grid>

                                                    <Grid item xs={12}>
                                                        <FormBox>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                <TaskAltIcon color="primary" sx={{ mr: 1 }} />
                                                                <Typography variant="subtitle2">Status</Typography>
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

                                                    <Grid item xs={12}>
                                                        <FormBox>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                                                                <Typography variant="subtitle2">Description</Typography>
                                                            </Box>
                                                            <MyMultilineField
                                                                name="description"
                                                                control={control}
                                                                placeholder="Enter project description"
                                                                rows={4}
                                                                error={!!errors.description}
                                                                helperText={errors.description?.message}
                                                            />
                                                        </FormBox>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </Fade>

                                        {/* Dates & Budget Tab */}
                                        <Fade in={tabValue === 1} unmountOnExit>
                                            <Box hidden={tabValue !== 1}>
                                                <Grid container spacing={3}>
                                                    <Grid item xs={12} sm={6}>
                                                        <FormBox>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                <CalendarTodayIcon color="primary" sx={{ mr: 1 }} />
                                                                <Typography variant="subtitle2">Start Date</Typography>
                                                            </Box>
                                                            <MyDatePickerField
                                                                name="start_date"
                                                                control={control}
                                                                error={!!errors.start_date}
                                                                helperText={errors.start_date?.message}
                                                            />
                                                        </FormBox>
                                                    </Grid>

                                                    <Grid item xs={12} sm={6}>
                                                        <FormBox>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                <EventIcon color="primary" sx={{ mr: 1 }} />
                                                                <Typography variant="subtitle2">End Date</Typography>
                                                            </Box>
                                                            <MyDatePickerField
                                                                name="end_date"
                                                                control={control}
                                                                error={!!errors.end_date}
                                                                helperText={errors.end_date?.message}
                                                            />
                                                        </FormBox>
                                                    </Grid>

                                                    <Grid item xs={12}>
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
                                                </Grid>
                                            </Box>
                                        </Fade>
                                    </Box>

                                    {/* Info message */}
                                    <Box sx={{ mb: 3 }}>
                                        <InfoChip
                                            icon={<InfoOutlinedIcon />}
                                            label="All changes will be applied immediately upon saving"
                                        />
                                    </Box>

                                    {/* Action buttons */}
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        flexWrap: { xs: 'wrap', sm: 'nowrap' },
                                        gap: 2
                                    }}>
                                        <DeleteButton
                                            startIcon={<DeleteIcon />}
                                            onClick={() => navigate(`/projects/delete/${id}`)}
                                        >
                                            Delete Project
                                        </DeleteButton>

                                        <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
                                            <Button
                                                variant="outlined"
                                                onClick={() => navigate('/projects')}
                                                sx={{ borderRadius: '8px' }}
                                            >
                                                Cancel
                                            </Button>

                                            <SaveButton
                                                type="submit"
                                                variant="contained"
                                                disabled={saving || !isValid || !isDirty}
                                                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                            >
                                                {saving ? 'Saving...' : success ? 'Saved!' : 'Save Changes'}
                                            </SaveButton>
                                        </Box>
                                    </Box>
                                </form>
                            </FormContainer>
                        </motion.div>
                    )}
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
                    Project updated successfully! Redirecting to projects list...
                </Alert>
            </Snackbar>
        </Container>
    );
};
export default EditProject;
