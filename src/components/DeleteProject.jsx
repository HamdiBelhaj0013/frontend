import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Typography,
    TextField,
    Container,
    Paper,
    CircularProgress,
    Alert,
    Snackbar,
    Divider,
    IconButton
} from '@mui/material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AxiosInstance from './Axios.jsx';
import { motion } from 'framer-motion';

// Icons
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Styled components
const DeleteContainer = styled(Paper)(({ theme }) => ({
    borderRadius: '12px',
    padding: theme.spacing(4),
    maxWidth: 600,
    margin: '0 auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
    backgroundColor: alpha(theme.palette.error.main, 0.03),
    position: 'relative',
    overflow: 'hidden'
}));

const WarningBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    borderRadius: '8px',
    backgroundColor: alpha(theme.palette.error.main, 0.1),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.error.main,
            borderWidth: 2
        },
        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.error.main,
        }
    },
    '& .MuiFormLabel-root.Mui-focused': {
        color: theme.palette.error.main
    }
}));

const DeleteButton = styled(Button)(({ theme }) => ({
    backgroundColor: theme.palette.error.main,
    color: theme.palette.common.white,
    fontWeight: 600,
    borderRadius: '8px',
    padding: '10px 16px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 10px rgba(211, 47, 47, 0.2)',
    '&:hover': {
        backgroundColor: theme.palette.error.dark,
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 15px rgba(211, 47, 47, 0.3)',
    },
    '&:active': {
        transform: 'translateY(0)',
    },
    '&.Mui-disabled': {
        backgroundColor: alpha(theme.palette.error.main, 0.5),
        color: theme.palette.common.white
    }
}));

const DeleteProject = () => {
    const { id } = useParams();
    const [projectData, setProjectData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();

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

    // Fetch project details
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await AxiosInstance.get(`api/project/${id}`);
                setProjectData(response.data);
            } catch (err) {
                console.error('Error fetching project:', err);
                setError("Failed to load project details.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Handle input change
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    // Handle delete action
    const handleDelete = async () => {
        if (inputValue !== "delete") return;

        setDeleting(true);
        try {
            await AxiosInstance.delete(`api/project/${id}/`);
            setSuccess(true);

            // Redirect after a brief delay to show success state
            setTimeout(() => {
                navigate('/projects', {
                    state: {
                        success: true,
                        message: `Project "${projectData.name}" has been deleted successfully`
                    }
                });
            }, 1500);
        } catch (err) {
            console.error('Error deleting project:', err);
            setError("Failed to delete the project. Please try again.");
            setDeleting(false);
        }
    };

    // Close error notification
    const handleCloseError = () => {
        setError(null);
    };

    return (
        <Container maxWidth="lg">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Back button */}
                <motion.div variants={itemVariants}>
                    <Button
                        onClick={() => navigate('/projects')}
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            mb: 3,
                            fontWeight: 500,
                            color: theme.palette.text.secondary,
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            }
                        }}
                    >
                        Back to Projects
                    </Button>
                </motion.div>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : error && !projectData ? (
                    <Alert
                        severity="error"
                        sx={{ borderRadius: '8px' }}
                        action={
                            <Button color="inherit" size="small" onClick={() => navigate('/projects')}>
                                Go Back
                            </Button>
                        }
                    >
                        {error || "Project not found."}
                    </Alert>
                ) : projectData && (
                    <motion.div variants={itemVariants}>
                        <DeleteContainer>
                            <WarningBox>
                                <WarningAmberIcon sx={{ fontSize: 50, color: theme.palette.error.main, mb: 1 }} />
                                <Typography variant="h5" sx={{ color: theme.palette.error.main, fontWeight: 'bold', textAlign: 'center' }}>
                                    Delete Project
                                </Typography>
                            </WarningBox>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    "{projectData.name}"
                                </Typography>
                                <Typography variant="body1" color="text.secondary" paragraph>
                                    Are you sure you want to delete this project? This action <strong>cannot</strong> be undone and all associated data will be permanently removed.
                                </Typography>

                                <Box sx={{
                                    p: 2,
                                    mt: 3,
                                    mb: 3,
                                    borderRadius: '8px',
                                    backgroundColor: alpha(theme.palette.warning.main, 0.1),
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 1.5
                                }}>
                                    <ErrorOutlineIcon color="warning" sx={{ mt: 0.5 }} />
                                    <Box>
                                        <Typography variant="subtitle2" color="warning.dark" gutterBottom>
                                            Warning: This will delete:
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            • Project details and description<br />
                                            • Timeline and budget information<br />
                                            • Any associated project records
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Divider sx={{ mb: 3 }} />

                            <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                                To confirm deletion, type <strong>delete</strong> below:
                            </Typography>

                            <StyledTextField
                                fullWidth
                                variant="outlined"
                                placeholder="Type 'delete' to confirm"
                                value={inputValue}
                                onChange={handleInputChange}
                                error={inputValue.length > 0 && inputValue !== "delete"}
                                helperText={inputValue.length > 0 && inputValue !== "delete" ?
                                    "You must type 'delete' exactly to confirm" : ""}
                                sx={{ mb: 3 }}
                                inputProps={{
                                    autoComplete: 'off',
                                    sx: {
                                        fontWeight: inputValue === 'delete' ? 500 : 400,
                                        color: inputValue === 'delete' ? theme.palette.error.main : 'inherit'
                                    }
                                }}
                                disabled={deleting || success}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/projects')}
                                    disabled={deleting || success}
                                    sx={{ borderRadius: '8px' }}
                                >
                                    Cancel
                                </Button>

                                <DeleteButton
                                    onClick={handleDelete}
                                    disabled={inputValue !== "delete" || deleting || success}
                                    startIcon={success ? <CheckCircleIcon /> : deleting ?
                                        <CircularProgress size={20} color="inherit" /> : <DeleteForeverIcon />}
                                >
                                    {success ? 'Deleted!' : deleting ? 'Deleting...' : 'Delete Project'}
                                </DeleteButton>
                            </Box>
                        </DeleteContainer>
                    </motion.div>
                )}
            </motion.div>

            {/* Error Notification */}
            <Snackbar
                open={!!error && !!projectData}
                autoHideDuration={6000}
                onClose={handleCloseError}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity="error"
                    onClose={handleCloseError}
                    sx={{ width: '100%', borderRadius: '8px' }}
                    action={
                        <IconButton
                            size="small"
                            aria-label="close"
                            color="inherit"
                            onClick={handleCloseError}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    }
                >
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default DeleteProject;