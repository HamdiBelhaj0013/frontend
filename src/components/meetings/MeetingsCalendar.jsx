import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import 'moment/locale/fr';
import { Box, Typography, Button, Paper, Container, Chip, Alert, CircularProgress } from '@mui/material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import { Add, EventAvailable, EventBusy, Refresh, ArrowForward } from '@mui/icons-material';
import AxiosInstance from '../Axios.jsx';
import { usePermissions } from '/src/contexts/PermissionsContext.jsx';

// Configuration de la locale française
moment.locale('fr');
const localizer = momentLocalizer(moment);

// Composants stylisés
const ConteneurCalendrierStyled = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    height: 700,
    '& .rbc-calendar': {
        height: '100%',
    },
}));

const CalendrierReunions = () => {
    const { can, RESOURCES, ACTIONS } = usePermissions();
    const [reunions, setReunions] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(null);
    const theme = useTheme();
    const navigate = useNavigate();

    // Messages du calendrier pour la localisation française
    const messages = {
        allDay: 'Journée entière',
        previous: 'Précédent',
        next: 'Suivant',
        today: 'Aujourd\'hui',
        month: 'Mois',
        week: 'Semaine',
        day: 'Jour',
        agenda: 'Agenda',
        date: 'Date',
        time: 'Heure',
        event: 'Événement',
        noEventsInRange: 'Aucune réunion dans cette période',
    };

    useEffect(() => {
        const recupererReunions = async () => {
            try {
                setChargement(true);
                console.log("Récupération des réunions depuis l'API...");

                // Utilisation du bon point de terminaison: /meetings/meetings/ au lieu de /meetings/
                const reponse = await AxiosInstance.get('/meetings/meetings/');
                console.log("Réponse de l'API:", reponse);

                // Vérifier si les données de réponse sont un tableau
                if (!Array.isArray(reponse.data)) {
                    // Si ce n'est pas un tableau, c'est peut-être paginé
                    const donneesReunions = reponse.data.results || [];
                    console.log("Données de réunions extraites de la pagination:", donneesReunions);

                    const reunionsFormatees = donneesReunions.map(reunion => ({
                        id: reunion.id,
                        title: reunion.title,
                        start: new Date(reunion.start_date),
                        end: new Date(reunion.end_date),
                        status: reunion.status,
                        meeting_type: reunion.meeting_type,
                        location: reunion.location,
                        is_virtual: reunion.is_virtual,
                        meeting_link: reunion.meeting_link,
                        resource: reunion
                    }));

                    setReunions(reunionsFormatees);
                } else {
                    // Si c'est un tableau, l'utiliser directement
                    const reunionsFormatees = reponse.data.map(reunion => ({
                        id: reunion.id,
                        title: reunion.title,
                        start: new Date(reunion.start_date),
                        end: new Date(reunion.end_date),
                        status: reunion.status,
                        meeting_type: reunion.meeting_type,
                        location: reunion.location,
                        is_virtual: reunion.is_virtual,
                        meeting_link: reunion.meeting_link,
                        resource: reunion
                    }));

                    setReunions(reunionsFormatees);
                }

                setChargement(false);
            } catch (err) {
                console.error('Erreur lors de la récupération des réunions:', err);

                let messageErreur = 'Échec du chargement des réunions. Veuillez réessayer.';
                if (err.response) {
                    messageErreur = `Erreur du serveur (${err.response.status}): ${
                        err.response.data.detail ||
                        err.response.data.message ||
                        'Erreur serveur inconnue'
                    }`;
                } else if (err.request) {
                    messageErreur = 'Aucune réponse du serveur. Veuillez vérifier votre connexion.';
                } else {
                    messageErreur = `Erreur de requête: ${err.message}`;
                }

                setErreur(messageErreur);
                setChargement(false);
            }
        };

        recupererReunions();
    }, []);

    // Style des types de réunions
    const typesReunions = {
        regular: { label: 'Réunion Régulière', color: theme.palette.primary.main },
        board: { label: 'Réunion du Conseil', color: theme.palette.success.main },
        extraordinary: { label: 'Réunion Extraordinaire', color: theme.palette.error.main },
        general_assembly: { label: 'Assemblée Générale', color: theme.palette.warning.main },
        committee: { label: 'Réunion de Comité', color: theme.palette.info.main },
        other: { label: 'Autre', color: theme.palette.grey[600] }
    };

    // Gestion du style des événements
    const obtenirStyleEvenement = (evenement) => {
        const typeReunion = evenement.meeting_type || 'other';
        const infoType = typesReunions[typeReunion] || typesReunions.other;
        let couleur = infoType.color;

        if (evenement.status === 'cancelled') {
            couleur = theme.palette.error.main;
        } else if (evenement.status === 'completed') {
            couleur = theme.palette.grey[500];
        }

        return {
            style: {
                backgroundColor: couleur,
                color: '#fff',
                borderRadius: '4px',
                border: 'none',
                opacity: evenement.status === 'cancelled' ? 0.7 : 1
            }
        };
    };

    // Gestion du clic sur une réunion
    const gererSelectionEvenement = (evenement) => {
        navigate(`/meetings/${evenement.id}`);
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Calendrier des Réunions
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        {can(ACTIONS.CREATE, RESOURCES.MEETINGS) && (
                            <Button
                                variant="contained"
                                component={Link}
                                to="/meetings/create"
                                startIcon={<Add />}
                                sx={{ mr: 1 }}
                            >
                                Nouvelle Réunion
                            </Button>
                        )}
                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={() => window.location.reload()}
                        >
                            Actualiser
                        </Button>
                    </Box>

                    <Box>
                        {Object.entries(typesReunions).map(([key, value]) => (
                            <Chip
                                key={key}
                                label={value.label}
                                size="small"
                                sx={{
                                    bgcolor: alpha(value.color, 0.1),
                                    color: value.color,
                                    mr: 1
                                }}
                            />
                        ))}
                    </Box>
                </Box>
            </Box>

            {erreur && <Alert severity="error" sx={{ mb: 3 }}>{erreur}</Alert>}

            <ConteneurCalendrierStyled>
                {chargement ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Calendar
                        localizer={localizer}
                        events={reunions}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 650 }}
                        onSelectEvent={gererSelectionEvenement}
                        eventPropGetter={obtenirStyleEvenement}
                        views={['month', 'week', 'day', 'agenda']}
                        messages={messages}
                        culture="fr"
                        formats={{
                            monthHeaderFormat: 'MMMM YYYY',
                            dayHeaderFormat: 'dddd D MMMM',
                            dayRangeHeaderFormat: ({ start, end }) =>
                                `${moment(start).format('D MMMM')} - ${moment(end).format('D MMMM')}`
                        }}
                    />
                )}
            </ConteneurCalendrierStyled>
        </Container>
    );
};

export default CalendrierReunions;