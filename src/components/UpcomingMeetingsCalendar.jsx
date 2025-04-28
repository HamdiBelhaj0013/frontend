import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Chip,
    CircularProgress,
    Paper,
    Divider
} from '@mui/material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import {
    Event,
    CalendarToday,
    VideoCall,
    LocationOn,
    ArrowForward,
    Add
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import AxiosInstance from './Axios';
import dayjs from 'dayjs';

// Styled components
const MeetingItem = styled(ListItem)(({ theme }) => ({
    borderRadius: '8px',
    marginBottom: theme.spacing(1),
    transition: 'background-color 0.2s',
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.05),
    }
}));

// Status chip based on meeting status
const StatusChip = ({ status }) => {
    const theme = useTheme();

    let color, label;

    switch (status) {
        case 'scheduled':
            color = theme.palette.success.main;
            label = 'Scheduled';
            break;
        case 'cancelled':
            color = theme.palette.error.main;
            label = 'Cancelled';
            break;
        case 'completed':
            color = theme.palette.text.secondary;
            label = 'Completed';
            break;
        case 'postponed':
            color = theme.palette.warning.main;
            label = 'Postponed';
            break;
        case 'in_progress':
            color = theme.palette.info.main;
            label = 'In Progress';
            break;
        default:
            color = theme.palette.primary.main;
            label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    }

    return (
        <Chip
            size="small"
            label={label}
            sx={{
                color: color,
                bgcolor: alpha(color, 0.1),
                fontWeight: 500
            }}
        />
    );
};

const UpcomingMeetingsCalendar = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch upcoming meetings from the API
    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                setLoading(true);
                const response = await AxiosInstance.get('/meetings/meetings/?filter=upcoming');

                // Get only the next 5 meetings
                const upcomingMeetings = response.data.slice(0, 5);
                setMeetings(upcomingMeetings);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching meetings:', err);
                setError('Failed to load upcoming meetings');
                setLoading(false);
            }
        };

        fetchMeetings();
    }, []);

    // Format time for display
    const formatTime = (date) => {
        return dayjs(date).format('h:mm A');
    };

    // Format date for display
    const formatDate = (date) => {
        return dayjs(date).format('DD MMM, YYYY');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <CircularProgress size={40} thickness={4} />
            </Box>
        );
    }

    if (error) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: '1px dashed',
                    borderColor: 'divider',
                    textAlign: 'center'
                }}
            >
                <Typography color="error.main" sx={{ mb: 1 }}>
                    {error}
                </Typography>
                <Button
                    size="small"
                    onClick={() => window.location.reload()}
                    variant="outlined"
                >
                    Retry
                </Button>
            </Paper>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="600" sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarToday sx={{ mr: 1 }} /> Calendrier des Événements
                </Typography>
                <Box>
                    <Button
                        component={Link}
                        to="/meetings/create"
                        startIcon={<Add />}
                        size="small"
                        sx={{ mr: 1 }}
                    >
                        Nouveau
                    </Button>
                    <Button
                        component={Link}
                        to="/meetings"
                        endIcon={<ArrowForward />}
                        size="small"
                    >
                        Voir Tout
                    </Button>
                </Box>
            </Box>

            {meetings.length === 0 ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 3,
                        bgcolor: 'background.paper',
                        border: '1px dashed',
                        borderColor: 'divider',
                        textAlign: 'center'
                    }}
                >
                    <Typography color="text.secondary" sx={{ mb: 1 }}>
                        Aucun événement à venir
                    </Typography>
                    <Button
                        variant="contained"
                        component={Link}
                        to="/meetings/create"
                        startIcon={<Add />}
                        size="small"
                    >
                        Planifier une Réunion
                    </Button>
                </Paper>
            ) : (
                <List sx={{ bgcolor: 'background.paper', borderRadius: 2, mb: 0 }}>
                    {meetings.map((meeting) => (
                        <MeetingItem
                            key={meeting.id}
                            divider
                            button
                            onClick={() => navigate(`/meetings/${meeting.id}`)}
                        >
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                                    <Event />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body1" fontWeight="medium" noWrap>
                                            {meeting.title}
                                        </Typography>
                                        <StatusChip status={meeting.status} sx={{ ml: 1 }} />
                                    </Box>
                                }
                                secondary={
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatDate(meeting.start_date)} • {formatTime(meeting.start_date)} - {formatTime(meeting.end_date)}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                            {meeting.is_virtual ? (
                                                <VideoCall fontSize="small" color="action" sx={{ mr: 0.5 }} />
                                            ) : (
                                                <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
                                            )}
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {meeting.is_virtual ? 'Réunion virtuelle' : meeting.location}
                                            </Typography>
                                        </Box>
                                    </Box>
                                }
                            />
                        </MeetingItem>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default UpcomingMeetingsCalendar;