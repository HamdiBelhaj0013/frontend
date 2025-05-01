import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Paper,
    Card,
    CardContent,
    CardActionArea,
    Divider,
    Chip,
    Badge,
    Avatar,
    IconButton,
    Modal,
    CircularProgress,
    Alert,
    Tooltip,
    Container
} from '@mui/material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import 'moment/locale/fr'; // Importation de la locale française pour moment
import {
    Event as EventIcon,
    EventAvailable,
    EventBusy,
    Close,
    Add,
    Groups,
    Description,
    AccessTime,
    Place,
    VideocamOutlined,
    ArrowForward,
    Refresh
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import AxiosInstance from '../Axios.jsx';
import { motion } from 'framer-motion';

// Import permission components
import { PermissionRequired } from '../../contexts/ConditionalUI.jsx';
import { usePermissions } from '../../contexts/PermissionsContext.jsx';

// Configuration de la locale française pour moment.js
moment.locale('fr');

// Setup the localizer with French locale
const localizer = momentLocalizer(moment);

// Styled components
const HeaderContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #4a6bd8, #3949AB)',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
}));

const StyledCalendarContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    height: 700,
    '& .rbc-calendar': {
        height: '100%',
    },
    '& .rbc-header': {
        padding: '10px 0',
        fontWeight: 600,
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
    '& .rbc-event': {
        borderRadius: '4px',
        padding: '2px 5px',
    },
    '& .rbc-today': {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
    '& .rbc-toolbar button': {
        borderRadius: '8px',
        color: theme.palette.text.primary,
        '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            color: theme.palette.primary.main,
        },
        '&.rbc-active': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white,
        }
    },
    '& .rbc-toolbar': {
        marginBottom: '15px',
    },
    '& .rbc-month-view, & .rbc-time-view, & .rbc-agenda-view': {
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '8px',
    },
    '& .rbc-day-bg + .rbc-day-bg, & .rbc-month-row + .rbc-month-row': {
        borderColor: theme.palette.divider,
    },
    '& .rbc-time-content, & .rbc-time-header-content': {
        borderColor: theme.palette.divider,
    },
    '& .rbc-date-cell': {
        padding: '5px 10px',
        textAlign: 'right',
    },
    '& .rbc-off-range-bg': {
        backgroundColor: alpha(theme.palette.action.disabled, 0.1),
    }
}));

const StyledModal = styled(Modal)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& .MuiPaper-root': {
        borderRadius: '12px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
    }
}));

const QuickActionCard = styled(Card)(({ theme }) => ({
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    height: '100%',
    transition: 'all 0.2s ease',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.12)',
    }
}));

const StatusChip = ({ status }) => {
    const theme = useTheme();

    let color, icon, label;

    switch (status) {
        case 'scheduled':
            color = theme.palette.success.main;
            icon = <EventAvailable fontSize="small" />;
            label = 'Planifiée';
            break;
        case 'cancelled':
            color = theme.palette.error.main;
            icon = <EventBusy fontSize="small" />;
            label = 'Annulée';
            break;
        case 'completed':
            color = theme.palette.text.secondary;
            icon = <EventIcon fontSize="small" />;
            label = 'Terminée';
            break;
        case 'postponed':
            color = theme.palette.warning.main;
            icon = <EventIcon fontSize="small" />;
            label = 'Reportée';
            break;
        case 'in_progress':
            color = theme.palette.info.main;
            icon = <EventIcon fontSize="small" />;
            label = 'En Cours';
            break;
        default:
            color = theme.palette.primary.main;
            icon = <EventIcon fontSize="small" />;
            label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Inconnu';
    }

    return (
        <Chip
            size="small"
            label={label}
            icon={icon}
            sx={{
                color: color,
                bgcolor: alpha(color, 0.1),
                fontWeight: 500,
                '& .MuiChip-icon': {
                    color,
                }
            }}
        />
    );
};

const MeetingsCalendar = () => {
    // Get permission context
    const { can, RESOURCES, ACTIONS, userRole } = usePermissions();
    const canCreateMeetings = can(ACTIONS.CREATE, RESOURCES.MEETINGS);
    const canEditMeetings = can(ACTIONS.EDIT, RESOURCES.MEETINGS);

    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        severity: 'error'
    });

    const navigate = useNavigate();
    const theme = useTheme();

    // For demo purposes - normally this would come from your API
    const meetingTypes = {
        regular: { label: 'Réunion Ordinaire', color: theme.palette.primary.main },
        board: { label: 'Réunion du Conseil', color: theme.palette.success.main },
        extraordinary: { label: 'Réunion Extraordinaire', color: theme.palette.error.main },
        general_assembly: { label: 'Assemblée Générale', color: theme.palette.warning.main },
        committee: { label: 'Réunion de Comité', color: theme.palette.info.main },
        other: { label: 'Autre', color: theme.palette.grey[600] }
    };

    // Traductions pour le calendrier
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
        showMore: total => `+ ${total} de plus`,
        work_week: 'Semaine de travail',
    };

    // Fetch meetings from the API
    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                setLoading(true);
                const response = await AxiosInstance.get('/meetings/meetings/');

                // Transform meetings for the calendar
                const formattedMeetings = response.data.map(meeting => ({
                    id: meeting.id,
                    title: meeting.title,
                    start: new Date(meeting.start_date),
                    end: new Date(meeting.end_date),
                    status: meeting.status,
                    meeting_type: meeting.meeting_type,
                    location: meeting.location,
                    is_virtual: meeting.is_virtual,
                    meeting_link: meeting.meeting_link,
                    resource: meeting
                }));

                setMeetings(formattedMeetings);
                setLoading(false);
            } catch (err) {
                console.error('Erreur lors de la récupération des réunions:', err);
                setError('Échec du chargement des réunions. Veuillez réessayer.');
                setLoading(false);
            }
        };

        fetchMeetings();
    }, []);

    // Handle meeting selection
    const handleSelectEvent = (event) => {
        setSelectedMeeting(event.resource);
        setShowModal(true);
    };

    // Handle navigation to create meeting
    const handleCreateMeeting = () => {
        if (!canCreateMeetings) {
            setNotification({
                show: true,
                message: 'Vous n\'avez pas la permission de créer des réunions.',
                severity: 'error'
            });

            setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
            }, 3000);
            return;
        }

        navigate('/meetings/create');
    };

    // Event styling
    const eventStyleGetter = (event) => {
        const meetingType = event.meeting_type || 'other';
        const typeInfo = meetingTypes[meetingType] || meetingTypes.other;

        // Adjust color based on status
        let color = typeInfo.color;
        let textColor = '#fff';

        if (event.status === 'cancelled') {
            color = theme.palette.error.main;
        } else if (event.status === 'completed') {
            color = theme.palette.grey[500];
        } else if (event.status === 'postponed') {
            color = theme.palette.warning.main;
        }

        return {
            style: {
                backgroundColor: color,
                color: textColor,
                borderRadius: '4px',
                border: 'none',
                opacity: event.status === 'cancelled' ? 0.7 : 1
            }
        };
    };

    // Format date for display
    const formatDate = (date) => {
        return moment(date).format('dddd D MMMM YYYY');
    };

    // Format time for display
    const formatTime = (date) => {
        return moment(date).format('HH:mm');
    };

    // Motion animation variants
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

    const handleRefresh = () => {
        window.location.reload();
    };

    // Navigate to meeting details or edit based on permissions
    const handleViewDetails = (meetingId) => {
        setShowModal(false);
        navigate(`/meetings/${meetingId}`);
    };

    return (
        <Container maxWidth="xl">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div variants={itemVariants}>
                    <HeaderContainer elevation={0}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                            <Box>
                                <Typography variant="h4" fontWeight="bold" gutterBottom>
                                    Calendrier des Réunions
                                </Typography>
                                <Typography variant="body1">
                                    Planifiez, gérez et suivez toutes vos réunions d'association en un seul endroit
                                </Typography>

                                <Box sx={{ display: 'flex', mt: 2, gap: 2 }}>
                                    {/* Only show New Meeting button if user has create permission */}
                                    {canCreateMeetings && (
                                        <Button
                                            variant="contained"
                                            component={Link}
                                            to="/meetings/create"
                                            startIcon={<Add />}
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.2)',
                                                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                                            }}
                                        >
                                            Nouvelle Réunion
                                        </Button>
                                    )}

                                    <Button
                                        variant="outlined"
                                        onClick={handleRefresh}
                                        startIcon={<Refresh />}
                                        sx={{
                                            bgcolor: 'rgba(255,255,255,0.1)',
                                            borderColor: 'rgba(255,255,255,0.3)',
                                            color: 'white',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                                        }}
                                    >
                                        Actualiser
                                    </Button>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '40%' }}>
                                {Object.entries(meetingTypes).map(([key, value]) => (
                                    <Chip
                                        key={key}
                                        label={value.label}
                                        size="small"
                                        sx={{
                                            bgcolor: alpha(value.color, 0.2),
                                            color: 'white',
                                            border: `1px solid ${alpha(value.color, 0.3)}`,
                                            fontWeight: 500,
                                            mb: 1
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        {/* Decorative circles */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: -50,
                                right: -50,
                                width: 200,
                                height: 200,
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
                                width: 100,
                                height: 100,
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                zIndex: 0
                            }}
                        />
                    </HeaderContainer>
                </motion.div>

                {/* Quick Actions - Only show appropriate actions based on permissions */}
                <motion.div variants={itemVariants}>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        {/* Create Meeting Card - Only shown if user has permission */}
                        {canCreateMeetings && (
                            <Grid item xs={12} sm={4}>
                                <QuickActionCard>
                                    <CardActionArea
                                        component={Link}
                                        to="/meetings/create"
                                        sx={{ height: '100%', p: 2 }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, mr: 2 }}>
                                                <Add />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h6" fontWeight="medium">Créer une Réunion</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Planifier une nouvelle réunion
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardActionArea>
                                </QuickActionCard>
                            </Grid>
                        )}

                        {/* Always show Upcoming Meetings card */}
                        <Grid item xs={12} sm={canCreateMeetings ? 4 : 6}>
                            <QuickActionCard>
                                <CardActionArea
                                    component={Link}
                                    to="/meetings?filter=upcoming"
                                    sx={{ height: '100%', p: 2 }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, mr: 2 }}>
                                            <EventAvailable />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" fontWeight="medium">Réunions à Venir</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Voir toutes les réunions planifiées
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardActionArea>
                            </QuickActionCard>
                        </Grid>

                        {/* Report-related card - Adjust width based on permissions */}
                        <Grid item xs={12} sm={canCreateMeetings ? 4 : 6}>
                            <QuickActionCard>
                                <CardActionArea
                                    component={Link}
                                    to="/meetings?filter=needs_report"
                                    sx={{ height: '100%', p: 2 }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, mr: 2 }}>
                                            <Description />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" fontWeight="medium">Rapports en Attente</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Réunions nécessitant des rapports
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardActionArea>
                            </QuickActionCard>
                        </Grid>
                    </Grid>
                </motion.div>

                {/* Error Alert */}
                {error && (
                    <motion.div variants={itemVariants}>
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    </motion.div>
                )}

                {/* Permission notification */}
                {notification.show && (
                    <motion.div variants={itemVariants}>
                        <Alert severity={notification.severity} sx={{ mb: 3 }}>
                            {notification.message}
                        </Alert>
                    </motion.div>
                )}

                {/* Calendar */}
                <motion.div variants={itemVariants}>
                    <StyledCalendarContainer elevation={0}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <CircularProgress size={60} thickness={4} />
                                <Typography variant="h6" sx={{ ml: 2 }}>
                                    Chargement des réunions...
                                </Typography>
                            </Box>
                        ) : (
                            <Calendar
                                localizer={localizer}
                                events={meetings}
                                startAccessor="start"
                                endAccessor="end"
                                style={{ height: 650 }}
                                onSelectEvent={handleSelectEvent}
                                eventPropGetter={eventStyleGetter}
                                views={['month', 'week', 'day', 'agenda']}
                                defaultView="month"
                                defaultDate={new Date()}
                                components={{
                                    toolbar: CalendarToolbar
                                }}
                                messages={messages}
                                culture="fr"
                                formats={{
                                    monthHeaderFormat: 'MMMM YYYY',
                                    weekdayFormat: 'dddd',
                                    dayHeaderFormat: 'dddd D MMMM',
                                    dayRangeHeaderFormat: ({ start, end }) =>
                                        `${moment(start).format('D MMMM YYYY')} - ${moment(end).format('D MMMM YYYY')}`
                                }}
                            />
                        )}
                    </StyledCalendarContainer>
                </motion.div>

                {/* Meeting Details Modal */}
                <StyledModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    aria-labelledby="meeting-details-modal"
                >
                    <Paper sx={{ p: 3, position: 'relative', maxWidth: 500, width: '100%', mx: 2 }}>
                        {selectedMeeting && (
                            <>
                                <IconButton
                                    aria-label="close"
                                    onClick={() => setShowModal(false)}
                                    sx={{
                                        position: 'absolute',
                                        right: 8,
                                        top: 8,
                                        color: theme.palette.grey[500],
                                    }}
                                >
                                    <Close />
                                </IconButton>

                                <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                                    {selectedMeeting.title}
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                    <StatusChip status={selectedMeeting.status} />
                                    <Chip
                                        size="small"
                                        label={meetingTypes[selectedMeeting.meeting_type]?.label || 'Autre'}
                                        sx={{
                                            bgcolor: alpha(meetingTypes[selectedMeeting.meeting_type]?.color || theme.palette.grey[600], 0.1),
                                            color: meetingTypes[selectedMeeting.meeting_type]?.color || theme.palette.grey[600],
                                            fontWeight: 500,
                                        }}
                                    />
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                                        <EventIcon sx={{ color: theme.palette.primary.main, mr: 1.5, mt: 0.5 }} />
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold">Date</Typography>
                                            <Typography variant="body2">
                                                {formatDate(selectedMeeting.start_date)}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                                        <AccessTime sx={{ color: theme.palette.primary.main, mr: 1.5, mt: 0.5 }} />
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold">Heure</Typography>
                                            <Typography variant="body2">
                                                {formatTime(selectedMeeting.start_date)} - {formatTime(selectedMeeting.end_date)}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                                        {selectedMeeting.is_virtual ? (
                                            <VideocamOutlined sx={{ color: theme.palette.primary.main, mr: 1.5, mt: 0.5 }} />
                                        ) : (
                                            <Place sx={{ color: theme.palette.primary.main, mr: 1.5, mt: 0.5 }} />
                                        )}
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {selectedMeeting.is_virtual ? 'Réunion Virtuelle' : 'Lieu'}
                                            </Typography>
                                            <Typography variant="body2">
                                                {selectedMeeting.is_virtual ?
                                                    (selectedMeeting.meeting_link || 'Le lien sera fourni') :
                                                    (selectedMeeting.location || 'Lieu non spécifié')}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                        <Groups sx={{ color: theme.palette.primary.main, mr: 1.5, mt: 0.5 }} />
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold">Participants</Typography>
                                            <Typography variant="body2">
                                                {selectedMeeting.attendees_count || 0} attendus
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {selectedMeeting.description && (
                                    <Box sx={{ mt: 3 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                            Description
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            {selectedMeeting.description}
                                        </Typography>
                                    </Box>
                                )}

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setShowModal(false)}
                                        sx={{ mr: 1 }}
                                    >
                                        Fermer
                                    </Button>

                                    {/* View Details button - label changes based on permissions */}
                                    <Button
                                        variant="contained"
                                        onClick={() => handleViewDetails(selectedMeeting.id)}
                                        endIcon={<ArrowForward />}
                                    >
                                        {canEditMeetings ? 'Voir & Modifier les Détails' : 'Voir les Détails'}
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Paper>
                </StyledModal>
            </motion.div>
        </Container>
    );
};

// Custom toolbar component
const CalendarToolbar = (toolbar) => {
    const goToBack = () => {
        toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
        toolbar.onNavigate('NEXT');
    };

    const goToToday = () => {
        toolbar.onNavigate('TODAY');
    };

    const theme = useTheme();

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            flexWrap: 'wrap',
            gap: 1
        }}>
            <Box>
                <Typography variant="h6" fontWeight="bold">
                    {toolbar.label}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                    onClick={goToToday}
                    variant="outlined"
                    size="small"
                    sx={{
                        borderRadius: '8px',
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                        fontWeight: 500
                    }}
                >
                    Aujourd'hui
                </Button>

                <Button
                    onClick={goToBack}
                    variant="outlined"
                    size="small"
                    sx={{
                        borderRadius: '8px',
                        borderColor: theme.palette.divider,
                        color: theme.palette.text.secondary
                    }}
                >
                    Précédent
                </Button>

                <Button
                    onClick={goToNext}
                    variant="outlined"
                    size="small"
                    sx={{
                        borderRadius: '8px',
                        borderColor: theme.palette.divider,
                        color: theme.palette.text.secondary
                    }}
                >
                    Suivant
                </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                    onClick={() => toolbar.onView('month')}
                    variant={toolbar.view === 'month' ? 'contained' : 'outlined'}
                    size="small"
                    sx={{
                        borderRadius: '8px',
                        ...(toolbar.view !== 'month' && {
                            borderColor: theme.palette.divider,
                            color: theme.palette.text.secondary
                        })
                    }}
                >
                    Mois
                </Button>

                <Button
                    onClick={() => toolbar.onView('week')}
                    variant={toolbar.view === 'week' ? 'contained' : 'outlined'}
                    size="small"
                    sx={{
                        borderRadius: '8px',
                        ...(toolbar.view !== 'week' && {
                            borderColor: theme.palette.divider,
                            color: theme.palette.text.secondary
                        })
                    }}
                >
                    Semaine
                </Button>

                <Button
                    onClick={() => toolbar.onView('day')}
                    variant={toolbar.view === 'day' ? 'contained' : 'outlined'}
                    size="small"
                    sx={{
                        borderRadius: '8px',
                        ...(toolbar.view !== 'day' && {
                            borderColor: theme.palette.divider,
                            color: theme.palette.text.secondary
                        })
                    }}
                >
                    Jour
                </Button>

                <Button
                    onClick={() => toolbar.onView('agenda')}
                    variant={toolbar.view === 'agenda' ? 'contained' : 'outlined'}
                    size="small"
                    sx={{
                        borderRadius: '8px',
                        ...(toolbar.view !== 'agenda' && {
                            borderColor: theme.palette.divider,
                            color: theme.palette.text.secondary
                        })
                    }}
                >
                    Agenda
                </Button>
            </Box>
        </Box>
    );
};

export default MeetingsCalendar;