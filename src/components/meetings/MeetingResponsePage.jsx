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
                console.log(`Chargement des données pour le participant: ${attendeeId}, token: ${token}`);

                // Get meeting and attendee details
                const response = await AxiosInstance.get(`/meetings/attendees/${attendeeId}/response/${token}/`);

                console.log('Données de réponse:', response.data);
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
                console.error('Erreur lors de la récupération des données de réunion:', error);
                setError(`Impossible de charger les informations de la réunion. Le lien peut être invalide ou expiré. 
                          Détails: ${error.response?.data?.error || error.message}`);
                setLoading(false);
            }
        };

        fetchData();
    }, [attendeeId, token, responseType]);

    // Submit response
    const handleSubmit = async () => {
        if (!status) {
            setError('Veuillez sélectionner votre statut de présence.');
            return;
        }

        try {
            setLoading(true);
            console.log(`Soumission de la réponse pour le participant: ${attendeeId}, token: ${token}, statut: ${status}`);

            const response = await AxiosInstance.post(
                `/meetings/attendees/${attendeeId}/response/${token}/`,
                {
                    status: status,
                    notes: note
                }
            );

            console.log('Réponse soumise avec succès:', response.data);
            setSubmitted(true);
            setLoading(false);
        } catch (error) {
            console.error('Erreur lors de la soumission de la réponse:', error);
            setError(`Échec de la soumission de votre réponse. Veuillez réessayer plus tard. 
                      Détails: ${error.response?.data?.error || error.message}`);
            setLoading(false);
        }
    };

    // Handle direct response buttons
    useEffect(() => {
        if (responseType && !loading && !error && attendee && !submitted) {
            console.log(`Soumission automatique de la réponse: ${responseType} (${status})`);
            // Auto-submit if response type is provided in URL
            handleSubmit();
        }
    }, [loading, responseType, status, attendee]);

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Traitement de votre réponse...
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
                        Erreur
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Un problème est survenu lors du traitement de votre réponse à la réunion.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/')}
                    >
                        Retour au Tableau de Bord
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
                        Réponse Soumise
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Merci d'avoir répondu à l'invitation à la réunion.
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Votre statut a été mis à jour en: <strong>
                        {status === 'present' ? 'Présent' :
                            status === 'absent' ? 'Absent' : 'Excusé'}
                    </strong>
                    </Typography>
                    {meeting && (
                        <Box sx={{ mt: 2, mb: 3 }}>
                            <Typography variant="subtitle1">
                                <strong>{meeting.title}</strong>
                            </Typography>
                            <Typography variant="body2">
                                {new Date(meeting.start_date).toLocaleString('fr-FR', {
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
                        Retour au Tableau de Bord
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Réponse à la Réunion
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
                                {new Date(meeting.start_date).toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2">Heure:</Typography>
                            <Typography variant="body1" gutterBottom>
                                {new Date(meeting.start_date).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })} -
                                {new Date(meeting.end_date).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle2">Lieu:</Typography>
                            <Typography variant="body1" gutterBottom>
                                {meeting.is_virtual ?
                                    (meeting.meeting_link || 'Réunion Virtuelle') :
                                    (meeting.location || 'Lieu à déterminer')}
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
                    Votre Réponse
                </Typography>

                <Typography variant="body1" paragraph>
                    Participerez-vous à cette réunion ?
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item>
                        <Button
                            variant={status === 'present' ? 'contained' : 'outlined'}
                            color="success"
                            onClick={() => setStatus('present')}
                        >
                            Oui, je participerai
                        </Button>
                    </Grid>

                    <Grid item>
                        <Button
                            variant={status === 'absent' ? 'contained' : 'outlined'}
                            color="error"
                            onClick={() => setStatus('absent')}
                        >
                            Non, je ne peux pas participer
                        </Button>
                    </Grid>

                    <Grid item>
                        <Button
                            variant={status === 'excused' ? 'contained' : 'outlined'}
                            color="warning"
                            onClick={() => setStatus('excused')}
                        >
                            Demande d'absence excusée
                        </Button>
                    </Grid>
                </Grid>

                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Notes Supplémentaires (Optionnel)"
                    variant="outlined"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ajoutez des commentaires ou des raisons pour votre réponse"
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
                        Soumettre la Réponse
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default MeetingResponse;