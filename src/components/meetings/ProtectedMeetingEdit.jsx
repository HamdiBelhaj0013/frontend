import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CircularProgress,
    Box,
    Typography,
    Container,
    Alert
} from '@mui/material';
import { usePermissions } from '/src/contexts/PermissionsContext.jsx';
import MeetingCreateForm from './MeetingCreateForm'; // Reuse the existing form for editing

const ProtectedMeetingEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { can, RESOURCES, ACTIONS } = usePermissions();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if user has permission to edit meetings
        const hasPermission = can(ACTIONS.EDIT, RESOURCES.MEETINGS);

        if (!hasPermission) {
            setError("You don't have permission to edit meetings");
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [can, ACTIONS, RESOURCES]);

    // If still loading, show loading indicator
    if (loading) {
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
                        Checking permissions...
                    </Typography>
                </Box>
            </Container>
        );
    }

    // If user doesn't have permission, show error
    if (error) {
        return (
            <Container maxWidth="md">
                <Box sx={{ mt: 4 }}>
                    <Alert
                        severity="error"
                        sx={{
                            mb: 3,
                            fontSize: '1rem',
                            '& .MuiAlert-icon': {
                                fontSize: '2rem'
                            }
                        }}
                    >
                        {error}
                    </Alert>
                    <Typography variant="body1" paragraph>
                        You don't have permission to edit this meeting. Please contact an administrator if you believe this is an error.
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Redirecting to the meetings page in 5 seconds...
                        </Typography>
                    </Box>
                </Box>
            </Container>
        );
    }

    // Log the ID being passed to MeetingCreateForm (for debugging)
    console.log('Meeting ID being passed to MeetingCreateForm:', id);

    // If user has permission, render the form
    return (
        <MeetingCreateForm
            isEditMode={true}
            meetingId={id}
        />
    );
};

export default ProtectedMeetingEdit;