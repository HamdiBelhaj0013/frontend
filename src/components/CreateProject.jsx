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
import MyMultilineField from "./forms/MyMultilineField.jsx";
import MySelectField from "./forms/MySelectField.jsx";

// Icons
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventIcon from '@mui/icons-material/Event';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

import '../assets/Styles/CreateProject.css';

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

const CreateProject = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const theme = useTheme();

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

    const { handleSubmit, control, reset, formState: { errors, isValid } } = useForm({
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
            reset();
            navigate('/projects', { state: { success: true } });
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const statusOptions = [
        { value: "Not Started", label: "Not Started" },
        { value: "In Progress", label: "In Progress" },
        { value: "Completed", label: "Completed" },
        { value: "On Hold", label: "On Hold" },
        { value: "Cancelled", label: "Cancelled" },
    ];

    return (
        <Container maxWidth="lg">
            <Box sx={{ maxWidth: 1000, margin: '0 auto' }}>
                {/* Header */}
                <HeaderContainer>
                    <BusinessIcon sx={{ mr: 1 }} />
                    <Box>
                        <Typography variant="h6" component="h1">
                            Create New Project
                        </Typography>
                        <Typography variant="subtitle2">
                            Add a new project to your organization
                        </Typography>
                    </Box>
                </HeaderContainer>

                <FormContainer elevation={0}>
                    <form onSubmit={handleSubmit(submission)}>
                        <Grid container spacing={3}>
                            {/* Project Name */}
                            <Grid item xs={12} md={6}>
                                <FormBox>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <BusinessIcon color="primary" sx={{ mr: 1, color: '#00897B' }} />
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

                            {/* Budget */}
                            <Grid item xs={12} md={6}>
                                <FormBox>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <AttachMoneyIcon color="primary" sx={{ mr: 1, color: '#00897B' }} />
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

                            {/* Project Dates */}
                            <Grid item xs={12} sm={6}>
                                <FormBox>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <CalendarTodayIcon color="primary" sx={{ mr: 1, color: '#00897B' }} />
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
                                        <EventIcon color="primary" sx={{ mr: 1, color: '#00897B' }} />
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

                            {/* Project Status */}
                            <Grid item xs={12} sm={6}>
                                <FormBox>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <TaskAltIcon color="primary" sx={{ mr: 1, color: '#00897B' }} />
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

                            {/* Description */}
                            <Grid item xs={12}>
                                <FormBox>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <DescriptionIcon color="primary" sx={{ mr: 1, color: '#00897B' }} />
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
                                        {loading ? 'Creating...' : 'Create Project'}
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

export default CreateProject;