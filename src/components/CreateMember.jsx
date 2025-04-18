import { React, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Snackbar,
    Alert,
    Grid,
    Paper,
    Container
} from "@mui/material";
import { useForm } from 'react-hook-form';
import AxiosInstance from './Axios.jsx';
import Dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { styled, useTheme } from '@mui/material/styles';
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

import '../assets/Styles/CreateMember.css';

// Styled components
const FormContainer = styled(Paper)(({ theme }) => ({
    borderRadius: '8px',
    padding: theme.spacing(3),
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
    backgroundColor: '#fff',
    borderLeft: '4px solid #00897B',
    margin: '0 auto',
    maxWidth: '100%',
    position: 'relative'
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
    backgroundColor: '#00897B',
    color: '#fff',
    padding: theme.spacing(2, 3),
    borderRadius: '4px',
    marginBottom: theme.spacing(3),
    display: 'flex',
    alignItems: 'center'
}));

const SubmitButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#00897B',
    '&:hover': {
        backgroundColor: '#00695C',
    },
    borderRadius: '4px',
}));

const ResetButton = styled(Button)(({ theme }) => ({
    borderRadius: '4px',
    border: '1px solid #e0e0e0',
    color: '#757575',
    backgroundColor: '#fff',
    '&:hover': {
        backgroundColor: '#f5f5f5',
    },
}));

const FormBox = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    '& .MuiFormControl-root': {
        width: '100%',
    },
    '& .MuiOutlinedInput-root': {
        borderRadius: '4px',
    }
}));

const CreateMember = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const theme = useTheme();

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

    const { handleSubmit, control, reset, formState: { errors, isValid } } = useForm({
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

    const submission = async (data) => {
        setLoading(true);
        setError(null);
        try {
            await AxiosInstance.post('/api/member/', {
                ...data,
                birth_date: data.birth_date ? Dayjs(data.birth_date).format('YYYY-MM-DD') : null,
                joining_date: data.joining_date ? Dayjs(data.joining_date).format('YYYY-MM-DD') : null,
            });
            reset();
            navigate('/members', { state: { success: true } });
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
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

    return (
        <Container maxWidth="lg">
            <Box sx={{ maxWidth: 1000, margin: '0 auto' }}>
                {/* Header */}
                <HeaderContainer>
                    <PersonIcon sx={{ mr: 1 }} />
                    <Box>
                        <Typography variant="h6" component="h1">
                            Create New Member
                        </Typography>
                        <Typography variant="subtitle2">
                            Add a new member to your organization
                        </Typography>
                    </Box>
                </HeaderContainer>

                <FormContainer elevation={0}>
                    <form onSubmit={handleSubmit(submission)}>
                        <Grid container spacing={3}>
                            {/* Personal Information Row */}
                            <Grid item xs={12} md={6}>
                                <FormBox>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <PersonIcon color="primary" sx={{ mr: 1, color: '#00897B' }} />
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
                                        <EmailIcon color="primary" sx={{ mr: 1, color: '#00897B' }} />
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
                                        <HomeIcon color="primary" sx={{ mr: 1, color: '#00897B' }} />
                                        <Typography variant="subtitle2">Address</Typography>
                                    </Box>
                                    <MyTextField
                                        name="address"
                                        control={control}
                                        placeholder="Enter address"
                                        error={!!errors.address}
                                        helperText={errors.address?.message}
                                    />
                                </FormBox>
                            </Grid>

                            {/* Work Information Row */}
                            <Grid item xs={12} sm={6}>
                                <FormBox>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <PublicIcon color="primary" sx={{ mr: 1, color: '#00897B' }} />
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

                            <Grid item xs={12} sm={6}>
                                <FormBox>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <WorkIcon color="primary" sx={{ mr: 1, color: '#00897B' }} />
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

                            <Grid item xs={12} sm={6}>
                                <FormBox>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <AdminPanelSettingsIcon color="primary" sx={{ mr: 1, color: '#00897B' }} />
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

                            {/* Date Information Row */}
                            <Grid item xs={12} sm={6}>
                                <FormBox>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <CakeIcon color="primary" sx={{ mr: 1, color: '#00897B' }} />
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

                            <Grid item xs={12} sm={6}>
                                <FormBox>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <EventIcon color="primary" sx={{ mr: 1, color: '#00897B' }} />
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

                            {/* Action Buttons */}
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                                    <ResetButton
                                        onClick={() => reset()}
                                        variant="outlined"
                                    >
                                        Reset
                                    </ResetButton>
                                    <SubmitButton
                                        variant="contained"
                                        type="submit"
                                        disabled={loading || !isValid}
                                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                                    >
                                        {loading ? 'Creating...' : 'Create Member'}
                                    </SubmitButton>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </FormContainer>
            </Box>

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
                    sx={{ width: '100%' }}
                >
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default CreateMember;