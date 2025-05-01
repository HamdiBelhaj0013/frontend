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
    Chip,
    Avatar,
    Fade,
    Tabs,
    Tab
} from "@mui/material";
import { useForm } from 'react-hook-form';
import AxiosInstance from './Axios.jsx';
import Dayjs from "dayjs";
import { useNavigate, Link } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { styled, useTheme, alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Form Fields
import MyDatePickerField from "./forms/MyDatePickerField.jsx";
import MyTextField from "./forms/MyTextField.jsx";
import MySelectField from "./forms/MySelectField.jsx";

// Icons
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
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

const ResetButton = styled(Button)(({ theme }) => ({
    borderRadius: '8px',
    padding: '10px 24px',
    fontWeight: 500,
    color: theme.palette.text.secondary,
    backgroundColor: 'transparent',
    border: `1px solid ${theme.palette.divider}`,
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
    transition: 'all 0.3s ease',
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

const CreateMember = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const navigate = useNavigate();
    const theme = useTheme();

    const schema = yup.object({
        name: yup.string().required('Name is required'),
        cin: yup.string()
            .matches(/^\d{8}$/, 'CIN must contain exactly 8 digits')
            .required('CIN is required'),
        address: yup.string().required('Address is required'),
        email: yup.string().email('Invalid email').required('Email is required'),
        nationality: yup.string().required('Nationality is required'),
        birth_date: yup.date().nullable().required('Birth date is required'),
        job: yup.string().required('Job is required'),
        joining_date: yup.date().nullable().required('Joining date is required'),
        role: yup.string().required('Role is required'),
    });

    const { handleSubmit, control, reset, watch, formState: { errors, isValid } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: '',
            cin: '',
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

// Update the submission function in CreateMember.jsx
    const submission = async (data) => {
        setLoading(true);
        setError(null);
        try {
            // Create the data object with all required fields
            const memberData = {
                ...data,
                birth_date: data.birth_date ? Dayjs(data.birth_date).format('YYYY-MM-DD') : null,
                joining_date: data.joining_date ? Dayjs(data.joining_date).format('YYYY-MM-DD') : null,
                needs_profile_completion: false
            };

            console.log("Submitting member data:", memberData);

            const response = await AxiosInstance.post('/api/member/', memberData);

            setSuccess(true);
            reset();
            setTimeout(() => {
                navigate('/members', {
                    state: {
                        success: true,
                        message: `Member "${data.name}" was created successfully`
                    }
                });
            }, 1500);
        } catch (err) {
            console.error('Error creating member:', err);

            // Handle different types of error responses
            let errorMessage;
            if (err.response) {
                if (typeof err.response.data === 'object') {
                    // Handle object errors (field-specific errors)
                    errorMessage = Object.entries(err.response.data)
                        .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                        .join('; ');
                } else if (err.response.data.error) {
                    // Handle error property
                    errorMessage = err.response.data.error;
                } else if (err.response.data.detail) {
                    // Handle detail property
                    errorMessage = err.response.data.detail;
                } else if (typeof err.response.data === 'string') {
                    // Handle string error
                    errorMessage = err.response.data;
                } else {
                    // Default error
                    errorMessage = 'An error occurred while creating the member. Please try again.';
                }
            } else {
                errorMessage = 'Network error. Please check your connection and try again.';
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const roleOptions = [
        { value: "Président", label: "Président" },
        { value: "Secrétaire générale", label: "Secrétaire générale" },
        { value: "Trésorier", label: "Trésorier" },
        { value: "Membre", label: "Membre" },
        { value: "Autre", label: "Autre" },
    ];

    const countries = [
        { value: "Afghanistan", label: "Afghanistan" },
        { value: "Albania", label: "Albania" },
        { value: "Algeria", label: "Algeria" },
        { value: "Andorra", label: "Andorra" },
        { value: "Angola", label: "Angola" },
        { value: "Antigua and Barbuda", label: "Antigua and Barbuda" },
        { value: "Argentina", label: "Argentina" },
        { value: "Armenia", label: "Armenia" },
        { value: "Australia", label: "Australia" },
        { value: "Austria", label: "Austria" },
        { value: "Azerbaijan", label: "Azerbaijan" },
        { value: "Bahamas", label: "Bahamas" },
        { value: "Bahrain", label: "Bahrain" },
        { value: "Bangladesh", label: "Bangladesh" },
        { value: "Barbados", label: "Barbados" },
        { value: "Belarus", label: "Belarus" },
        { value: "Belgium", label: "Belgium" },
        { value: "Belize", label: "Belize" },
        { value: "Benin", label: "Benin" },
        { value: "Bhutan", label: "Bhutan" },
        { value: "Bolivia", label: "Bolivia" },
        { value: "Bosnia and Herzegovina", label: "Bosnia and Herzegovina" },
        { value: "Botswana", label: "Botswana" },
        { value: "Brazil", label: "Brazil" },
        { value: "Brunei", label: "Brunei" },
        { value: "Bulgaria", label: "Bulgaria" },
        { value: "Burkina Faso", label: "Burkina Faso" },
        { value: "Burundi", label: "Burundi" },
        { value: "Cabo Verde", label: "Cabo Verde" },
        { value: "Cambodia", label: "Cambodia" },
        { value: "Cameroon", label: "Cameroon" },
        { value: "Canada", label: "Canada" },
        { value: "Central African Republic", label: "Central African Republic" },
        { value: "Chad", label: "Chad" },
        { value: "Chile", label: "Chile" },
        { value: "China", label: "China" },
        { value: "Colombia", label: "Colombia" },
        { value: "Comoros", label: "Comoros" },
        { value: "Congo", label: "Congo" },
        { value: "Congo (Democratic Republic)", label: "Congo (Democratic Republic)" },
        { value: "Costa Rica", label: "Costa Rica" },
        { value: "Croatia", label: "Croatia" },
        { value: "Cuba", label: "Cuba" },
        { value: "Cyprus", label: "Cyprus" },
        { value: "Czech Republic", label: "Czech Republic" },
        { value: "Denmark", label: "Denmark" },
        { value: "Djibouti", label: "Djibouti" },
        { value: "Dominica", label: "Dominica" },
        { value: "Dominican Republic", label: "Dominican Republic" },
        { value: "Ecuador", label: "Ecuador" },
        { value: "Egypt", label: "Egypt" },
        { value: "El Salvador", label: "El Salvador" },
        { value: "Equatorial Guinea", label: "Equatorial Guinea" },
        { value: "Eritrea", label: "Eritrea" },
        { value: "Estonia", label: "Estonia" },
        { value: "Eswatini", label: "Eswatini" },
        { value: "Ethiopia", label: "Ethiopia" },
        { value: "Fiji", label: "Fiji" },
        { value: "Finland", label: "Finland" },
        { value: "France", label: "France" },
        { value: "Gabon", label: "Gabon" },
        { value: "Gambia", label: "Gambia" },
        { value: "Georgia", label: "Georgia" },
        { value: "Germany", label: "Germany" },
        { value: "Ghana", label: "Ghana" },
        { value: "Greece", label: "Greece" },
        { value: "Grenada", label: "Grenada" },
        { value: "Guatemala", label: "Guatemala" },
        { value: "Guinea", label: "Guinea" },
        { value: "Guinea-Bissau", label: "Guinea-Bissau" },
        { value: "Guyana", label: "Guyana" },
        { value: "Haiti", label: "Haiti" },
        { value: "Honduras", label: "Honduras" },
        { value: "Hungary", label: "Hungary" },
        { value: "Iceland", label: "Iceland" },
        { value: "India", label: "India" },
        { value: "Indonesia", label: "Indonesia" },
        { value: "Iran", label: "Iran" },
        { value: "Iraq", label: "Iraq" },
        { value: "Ireland", label: "Ireland" },
        { value: "Palestine", label: "Palestine" },
        { value: "Italy", label: "Italy" },
        { value: "Jamaica", label: "Jamaica" },
        { value: "Japan", label: "Japan" },
        { value: "Jordan", label: "Jordan" },
        { value: "Kazakhstan", label: "Kazakhstan" },
        { value: "Kenya", label: "Kenya" },
        { value: "Kiribati", label: "Kiribati" },
        { value: "Korea (North)", label: "Korea (North)" },
        { value: "Korea (South)", label: "Korea (South)" },
        { value: "Kuwait", label: "Kuwait" },
        { value: "Kyrgyzstan", label: "Kyrgyzstan" },
        { value: "Laos", label: "Laos" },
        { value: "Latvia", label: "Latvia" },
        { value: "Lebanon", label: "Lebanon" },
        { value: "Lesotho", label: "Lesotho" },
        { value: "Liberia", label: "Liberia" },
        { value: "Libya", label: "Libya" },
        { value: "Liechtenstein", label: "Liechtenstein" },
        { value: "Lithuania", label: "Lithuania" },
        { value: "Luxembourg", label: "Luxembourg" },
        { value: "Madagascar", label: "Madagascar" },
        { value: "Malawi", label: "Malawi" },
        { value: "Malaysia", label: "Malaysia" },
        { value: "Maldives", label: "Maldives" },
        { value: "Mali", label: "Mali" },
        { value: "Malta", label: "Malta" },
        { value: "Marshall Islands", label: "Marshall Islands" },
        { value: "Mauritania", label: "Mauritania" },
        { value: "Mauritius", label: "Mauritius" },
        { value: "Mexico", label: "Mexico" },
        { value: "Micronesia", label: "Micronesia" },
        { value: "Moldova", label: "Moldova" },
        { value: "Monaco", label: "Monaco" },
        { value: "Mongolia", label: "Mongolia" },
        { value: "Montenegro", label: "Montenegro" },
        { value: "Morocco", label: "Morocco" },
        { value: "Mozambique", label: "Mozambique" },
        { value: "Myanmar", label: "Myanmar" },
        { value: "Namibia", label: "Namibia" },
        { value: "Nauru", label: "Nauru" },
        { value: "Nepal", label: "Nepal" },
        { value: "Netherlands", label: "Netherlands" },
        { value: "New Zealand", label: "New Zealand" },
        { value: "Nicaragua", label: "Nicaragua" },
        { value: "Niger", label: "Niger" },
        { value: "Nigeria", label: "Nigeria" },
        { value: "North Macedonia", label: "North Macedonia" },
        { value: "Norway", label: "Norway" },
        { value: "Oman", label: "Oman" },
        { value: "Pakistan", label: "Pakistan" },
        { value: "Palau", label: "Palau" },
        { value: "Panama", label: "Panama" },
        { value: "Papua New Guinea", label: "Papua New Guinea" },
        { value: "Paraguay", label: "Paraguay" },
        { value: "Peru", label: "Peru" },
        { value: "Philippines", label: "Philippines" },
        { value: "Poland", label: "Poland" },
        { value: "Portugal", label: "Portugal" },
        { value: "Qatar", label: "Qatar" },
        { value: "Romania", label: "Romania" },
        { value: "Russia", label: "Russia" },
        { value: "Rwanda", label: "Rwanda" },
        { value: "Saint Kitts and Nevis", label: "Saint Kitts and Nevis" },
        { value: "Saint Lucia", label: "Saint Lucia" },
        { value: "Saint Vincent and the Grenadines", label: "Saint Vincent and the Grenadines" },
        { value: "Samoa", label: "Samoa" },
        { value: "San Marino", label: "San Marino" },
        { value: "Sao Tome and Principe", label: "Sao Tome and Principe" },
        { value: "Saudi Arabia", label: "Saudi Arabia" },
        { value: "Senegal", label: "Senegal" },
        { value: "Serbia", label: "Serbia" },
        { value: "Seychelles", label: "Seychelles" },
        { value: "Sierra Leone", label: "Sierra Leone" },
        { value: "Singapore", label: "Singapore" },
        { value: "Slovakia", label: "Slovakia" },
        { value: "Slovenia", label: "Slovenia" },
        { value: "Solomon Islands", label: "Solomon Islands" },
        { value: "Somalia", label: "Somalia" },
        { value: "South Africa", label: "South Africa" },
        { value: "South Sudan", label: "South Sudan" },
        { value: "Spain", label: "Spain" },
        { value: "Sri Lanka", label: "Sri Lanka" },
        { value: "Sudan", label: "Sudan" },
        { value: "Suriname", label: "Suriname" },
        { value: "Sweden", label: "Sweden" },
        { value: "Switzerland", label: "Switzerland" },
        { value: "Syria", label: "Syria" },
        { value: "Taiwan", label: "Taiwan" },
        { value: "Tajikistan", label: "Tajikistan" },
        { value: "Tanzania", label: "Tanzania" },
        { value: "Thailand", label: "Thailand" },
        { value: "Timor-Leste", label: "Timor-Leste" },
        { value: "Togo", label: "Togo" },
        { value: "Tonga", label: "Tonga" },
        { value: "Trinidad and Tobago", label: "Trinidad and Tobago" },
        { value: "Tunisia", label: "Tunisia" },
        { value: "Turkey", label: "Turkey" },
        { value: "Turkmenistan", label: "Turkmenistan" },
        { value: "Tuvalu", label: "Tuvalu" },
        { value: "Uganda", label: "Uganda" },
        { value: "Ukraine", label: "Ukraine" },
        { value: "United Arab Emirates", label: "United Arab Emirates" },
        { value: "United Kingdom", label: "United Kingdom" },
        { value: "United States", label: "United States" },
        { value: "Uruguay", label: "Uruguay" },
        { value: "Uzbekistan", label: "Uzbekistan" },
        { value: "Vanuatu", label: "Vanuatu" },
        { value: "Vatican City", label: "Vatican City" },
        { value: "Venezuela", label: "Venezuela" },
        { value: "Vietnam", label: "Vietnam" },
        { value: "Yemen", label: "Yemen" },
        { value: "Zambia", label: "Zambia" },
        { value: "Zimbabwe", label: "Zimbabwe" }
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
                                    Create New Member
                                </Typography>
                                <Typography variant="subtitle2">
                                    Add a new member to your organization
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
                            {/* Tabs */}
                            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                                <Tabs
                                    value={tabValue}
                                    onChange={handleTabChange}
                                    aria-label="member creation tabs"
                                    indicatorColor="primary"
                                    textColor="primary"
                                >
                                    <StyledTab label="Personal Information" icon={<PersonIcon />} iconPosition="start" />
                                    <StyledTab label="Professional & Dates" icon={<WorkIcon />} iconPosition="start" />
                                </Tabs>
                            </Box>

                            <form onSubmit={handleSubmit(submission)}>
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
                                                <Grid item xs={12} md={6}>
                                                    <FormBox>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                            <PermIdentityIcon color="primary" sx={{ mr: 1 }} />
                                                            <Typography variant="subtitle2">CIN</Typography>
                                                        </Box>
                                                        <MyTextField
                                                            name="cin"
                                                            control={control}
                                                            placeholder="Enter CIN (8 digits)"
                                                            error={!!errors.cin}
                                                            helperText={errors.cin?.message}
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
                                        label="Fill in all required fields to create a new member"
                                    />
                                </Box>

                                {/* Action buttons */}
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                                    gap: 2,
                                    mt: 2
                                }}>
                                    <ResetButton
                                        onClick={() => reset()}
                                        variant="outlined"
                                    >
                                        Reset
                                    </ResetButton>

                                    <SubmitButton
                                        type="submit"
                                        variant="contained"
                                        disabled={loading || !isValid}
                                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                    >
                                        {loading ? 'Creating...' : success ? 'Created!' : 'Create Member'}
                                    </SubmitButton>
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
                    Member created successfully! Redirecting to members list...
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default CreateMember;