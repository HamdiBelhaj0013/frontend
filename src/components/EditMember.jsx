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
    Fade,
    Avatar
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
import MySelectField from "./forms/MySelectField.jsx";

// Icons
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import PublicIcon from '@mui/icons-material/Public';
import WorkIcon from '@mui/icons-material/Work';
import CakeIcon from '@mui/icons-material/Cake';
import EventIcon from '@mui/icons-material/Event';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import '../assets/Styles/CreateMember.css';

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

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
    width: 100,
    height: 100,
    backgroundColor: alpha(theme.palette.primary.main, 0.9),
    color: theme.palette.common.white,
    fontSize: '2.5rem',
    fontWeight: 'bold',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    margin: '0 auto 20px auto',
}));

const EditMember = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [memberData, setMemberData] = useState(null);

    // Form validation schema
    const schema = yup.object({
        name: yup.string().required('Name is required'),
        address: yup.string().required('Address is required'),
        email: yup.string().email('Invalid email').required('Email is required'),
        nationality: yup.string().required('Nationality is required'),
        birth_date: yup.date().nullable().required('Birth date is required'),
        job: yup.string().required('Job is required'),
        joining_date: yup.date().nullable().required('Joining date is required'),
        role: yup.string().required('Role is required'),
    });

    const { handleSubmit, control, setValue, watch, formState: { errors, isValid, isDirty } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: '',
            address: '',
            email: '',
            nationality: '',
            birth_date: null,
            job: '',
            joining_date: null,
            role: '',
        },
        mode: 'onChange'
    });

    // Helper function to get initials from name
    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Fetch member data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await AxiosInstance.get(`/api/member/${id}`);
                const data = response.data;

                setValue("name", data.name);
                setValue("address", data.address);
                setValue("email", data.email);
                setValue("nationality", data.nationality);
                setValue("job", data.job);
                setValue("role", data.role);
                setValue("birth_date", data.birth_date ? Dayjs(data.birth_date) : null);
                setValue("joining_date", data.joining_date ? Dayjs(data.joining_date) : null);

                setMemberData(data);
            } catch (err) {
                console.error('Error fetching member:', err);
                setError('Failed to load member data. Please try again.');
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
            await AxiosInstance.put(`/api/member/${id}/`, {
                ...data,
                birth_date: data.birth_date ? Dayjs(data.birth_date).format('YYYY-MM-DD') : null,
                joining_date: data.joining_date ? Dayjs(data.joining_date).format('YYYY-MM-DD') : null,
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/members', {
                    state: {
                        success: true,
                        message: `Member "${data.name}" was updated successfully`
                    }
                });
            }, 1500);
        } catch (err) {
            console.error('Error updating member:', err);
            setError(err.response?.data?.message || 'Failed to update member. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Role options
    const roleOptions = [
        { value: "Président", label: "Président" },
        { value: "Secrétaire générale", label: "Secrétaire générale" },
        { value: "Trésorier", label: "Trésorier" },
        { value: "Membre", label: "Membre" },
        { value: "Autre", label: "Autre" },
    ];

    // Countries for nationality selection
    const countries = [
        { value: "Afghanistan", label: "Afghanistan" },
        { value: "Albania", label: "Albania" },
        { value: "Algeria", label: "Algeria" },
        { value: "Tunisia", label: "Tunisia" },
        // Reduced list for brevity - you would include all countries in your actual implementation
        { value: "United Kingdom", label: "United Kingdom" },
        { value: "United States", label: "United States" },
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
                        onClick={() => navigate('/members')}
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
                        Back to Members
                    </Button>

                    {/* Header */}
                    <motion.div variants={itemVariants}>
                        <HeaderContainer>
                            <PersonIcon sx={{ mr: 2, fontSize: 28 }} />
                            <Box sx={{ zIndex: 1 }}>
                                <Typography variant="h5" component="h1" fontWeight="bold">
                                    Edit Member
                                </Typography>
                                <Typography variant="subtitle2">
                                    {memberData?.name ? `Editing: ${memberData.name}` : 'Update member details'}
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
                                <Button color="inherit" size="small" onClick={() => navigate('/members')}>
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
                                        aria-label="member edit tabs"
                                        indicatorColor="primary"
                                        textColor="primary"
                                    >
                                        <StyledTab label="Personal Information" icon={<PersonIcon />} iconPosition="start" />
                                        <StyledTab label="Professional & Dates" icon={<WorkIcon />} iconPosition="start" />
                                    </Tabs>
                                </Box>

                                <form onSubmit={handleSubmit(onSubmit)}>
                                    {/* Profile Avatar */}
                                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                                        <ProfileAvatar>
                                            {getInitials(watch('name'))}
                                        </ProfileAvatar>
                                    </Box>

                                    {/* Tab Content */}
                                    <Box sx={{ mb: 3 }}>
                                        {/* Personal Information Tab */}
                                        <Fade in={tabValue === 0} unmountOnExit>
                                            <Box hidden={tabValue !== 0}>
                                                <Grid container spacing={3}>
                                                    <Grid item xs={12} md={6}>
                                                        <FormBox>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                <PersonIcon color="primary" sx={{ mr: 1 }} />
                                                                <Typography variant="subtitle2">Full Name</Typography>
                                                            </Box>
                                                            <MyTextField
                                                                name="name"
                                                                control={control}
                                                                placeholder="Enter full name"
                                                                error={!!errors.name}
                                                                helperText={errors.name?.message}
                                                            />
                                                        </FormBox>
                                                    </Grid>

                                                    <Grid item xs={12} md={6}>
                                                        <FormBox>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                <EmailIcon color="primary" sx={{ mr: 1 }} />
                                                                <Typography variant="subtitle2">Email</Typography>
                                                            </Box>
                                                            <MyTextField
                                                                name="email"
                                                                control={control}
                                                                placeholder="Enter email address"
                                                                error={!!errors.email}
                                                                helperText={errors.email?.message}
                                                            />
                                                        </FormBox>
                                                    </Grid>

                                                    <Grid item xs={12}>
                                                        <FormBox>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                <HomeIcon color="primary" sx={{ mr: 1 }} />
                                                                <Typography variant="subtitle2">Address</Typography>
                                                            </Box>
                                                            <MyTextField
                                                                name="address"
                                                                control={control}
                                                                placeholder="Enter residential address"
                                                                error={!!errors.address}
                                                                helperText={errors.address?.message}
                                                            />
                                                        </FormBox>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </Fade>

                                        {/* Professional & Dates Tab */}
                                        <Fade in={tabValue === 1} unmountOnExit>
                                            <Box hidden={tabValue !== 1}>
                                                <Grid container spacing={3}>
                                                    <Grid item xs={12} md={6}>
                                                        <FormBox>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                <PublicIcon color="primary" sx={{ mr: 1 }} />
                                                                <Typography variant="subtitle2">Nationality</Typography>
                                                            </Box>
                                                            <MySelectField
                                                                name="nationality"
                                                                control={control}
                                                                options={countries}
                                                                error={!!errors.nationality}
                                                                helperText={errors.nationality?.message}
                                                            />
                                                        </FormBox>
                                                    </Grid>

                                                    <Grid item xs={12} md={6}>
                                                        <FormBox>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                <WorkIcon color="primary" sx={{ mr: 1 }} />
                                                                <Typography variant="subtitle2">Job</Typography>
                                                            </Box>
                                                            <MyTextField
                                                                name="job"
                                                                control={control}
                                                                placeholder="Enter job title"
                                                                error={!!errors.job}
                                                                helperText={errors.job?.message}
                                                            />
                                                        </FormBox>
                                                    </Grid>

                                                    <Grid item xs={12} md={6}>
                                                        <FormBox>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                <AdminPanelSettingsIcon color="primary" sx={{ mr: 1 }} />
                                                                <Typography variant="subtitle2">Role</Typography>
                                                            </Box>
                                                            <MySelectField
                                                                name="role"
                                                                control={control}
                                                                options={roleOptions}
                                                                error={!!errors.role}
                                                                helperText={errors.role?.message}
                                                            />
                                                        </FormBox>
                                                    </Grid>

                                                    <Grid item xs={12} md={6}>
                                                        <FormBox>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                <CakeIcon color="primary" sx={{ mr: 1 }} />
                                                                <Typography variant="subtitle2">Birth Date</Typography>
                                                            </Box>
                                                            <MyDatePickerField
                                                                name="birth_date"
                                                                control={control}
                                                                error={!!errors.birth_date}
                                                                helperText={errors.birth_date?.message}
                                                            />
                                                        </FormBox>
                                                    </Grid>

                                                    <Grid item xs={12} md={6}>
                                                        <FormBox>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                <EventIcon color="primary" sx={{ mr: 1 }} />
                                                                <Typography variant="subtitle2">Joining Date</Typography>
                                                            </Box>
                                                            <MyDatePickerField
                                                                name="joining_date"
                                                                control={control}
                                                                error={!!errors.joining_date}
                                                                helperText={errors.joining_date?.message}
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
                                            onClick={() => navigate(`/member/delete/${id}`)}
                                        >
                                            Delete Member
                                        </DeleteButton>

                                        <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
                                            <Button
                                                variant="outlined"
                                                onClick={() => navigate('/members')}
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
                    Member updated successfully! Redirecting to members list...
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default EditMember;