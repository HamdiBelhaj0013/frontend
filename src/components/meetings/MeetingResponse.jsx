import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AxiosInstance from '../Axios';
import {
    Container, Typography, Paper, TextField, Button, Box,
    Grid, Divider, CircularProgress, Alert
} from '@mui/material';

const MeetingResponse = () => {
    const { attendeeId, token, responseType } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [meeting, setMeeting] = useState(null);
    const [attendee, setAttendee] = useState(null);
    const [status, setStatus] = useState('');
    const [note, setNote] = useState('');
    const [submitted, setSubmitted] = useState(false);

    // Load meeting and attendee data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                console.log(`Loading data for attendee: ${attendeeId}, token: ${token}`);

                // Get meeting and attendee details
                const response = await AxiosInstance.get(`/meetings/attendees/${attendeeId}/response/${token}/`);

                console.log('Response data:', response.data);
                setMeeting(response.data.meeting);
                setAttendee(response.data.attendee);

                // Set initial status based on URL parameter if provided
                if (responseType) {
                    if (responseType === 'yes') setStatus('present');
                    else if (responseType === 'no') setStatus('absent');
                    else if (responseType === 'maybe') setStatus('excused');
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching meeting data:', error);
                setError('Unable to load meeting information. The link may be invalid or expired.');
                setLoading(false);
            }
        };

        fetchData();
    }, [attendeeId, token, responseType]);

    // Submit response
    const handleSubmit = async () => {
        if (!status) {
            setError('Please select your attendance status.');
            return;
        }

        try {
            setLoading(true);

            const response = await AxiosInstance.post(
                `/meetings/attendees/${attendeeId}/response/${token}/`,
                {
                    status: status,
                    notes: note
                }
            );

            console.log('Response submitted successfully:', response.data);
            setSubmitted(true);
            setLoading(false);
        } catch (error) {
            console.error('Error submitting response:', error);
            setError('Failed to submit your response. Please try again later.');
            setLoading(false);
        }
    };

    // Handle direct response buttons
    useEffect(() => {
        if (responseType && !loading && !error && !submitted) {
            // Auto-submit if response type is provided in URL
            handleSubmit();
        }
    }, [loading, responseType, status]);

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Processing your response...
                </Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom>
                        Error
                    </Typography>
                    <Typography variant="body1" paragraph>
                        There was a problem processing your meeting response.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/')}
                    >
                        Return to Dashboard
                    </Button>
                </Paper>
            </Container>
        );
    }

    if (submitted) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{ color: 'success.main', fontSize: 60, mb: 2 }}>
                        ✓
                    </Box>
                    <Typography variant="h5" gutterBottom>
                        Response Submitted
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Thank you for responding to the meeting invitation.
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Your status has been updated to: <strong>
                        {status === 'present' ? 'Attending' :
                            status === 'absent' ? 'Not Attending' : 'Excused'}
                    </strong>
                    </Typography>
                    {meeting && (
                        <Box sx={{ mt: 2, mb: 3 }}>
                            <Typography variant="subtitle1">
                                <strong>{meeting.title}</strong>
                            </Typography>
                            <Typography variant="body2">
                                {new Date(meeting.start_date).toLocaleString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Typography>
                        </Box>
                    )}
                    <Button
                        variant="contained"
                        onClick={() => navigate('/')}
                    >
                        Return to Dashboard
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Meeting Response
            </Typography>

            {meeting && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        {meeting.title}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2">Date:</Typography>
                            <Typography variant="body1" gutterBottom>
                                {new Date(meeting.start_date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2">Time:</Typography>
                            <Typography variant="body1" gutterBottom>
                                {new Date(meeting.start_date).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })} -
                                {new Date(meeting.end_date).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle2">Location:</Typography>
                            <Typography variant="body1" gutterBottom>
                                {meeting.is_virtual ?
                                    (meeting.meeting_link || 'Virtual Meeting') :
                                    (meeting.location || 'Location TBD')}
                            </Typography>
                        </Grid>

                        {meeting.description && (
                            <Grid item xs={12}>
                                <Typography variant="subtitle2">Description:</Typography>
                                <Typography variant="body1" gutterBottom>
                                    {meeting.description}
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </Paper>
            )}

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Your Response
                </Typography>

                <Typography variant="body1" paragraph>
                    Will you attend this meeting?
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item>
                        <Button
                            variant={status === 'present' ? 'contained' : 'outlined'}
                            color="success"
                            onClick={() => setStatus('present')}
                        >
                            Yes, I'll Attend
                        </Button>
                    </Grid>

                    <Grid item>
                        <Button
                            variant={status === 'absent' ? 'contained' : 'outlined'}
                            color="error"
                            onClick={() => setStatus('absent')}
                        >
                            No, I Can't Attend
                        </Button>
                    </Grid>

                    <Grid item>
                        <Button
                            variant={status === 'excused' ? 'contained' : 'outlined'}
                            color="warning"
                            onClick={() => setStatus('excused')}
                        >
                            Request Excused Absence
                        </Button>
                    </Grid>
                </Grid>

                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Additional Notes (Optional)"
                    variant="outlined"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add any comments or reasons for your response"
                    sx={{ mb: 3 }}
                />

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={!status}
                    >
                        Submit Response
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default MeetingResponse;