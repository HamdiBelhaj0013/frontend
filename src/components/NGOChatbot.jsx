import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Typography,
    IconButton,
    TextField,
    Button,
    CircularProgress,
    Paper,
    Link,
    Divider,
    Chip,
    Avatar,
    Tooltip,
    Zoom,
} from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ReplayIcon from '@mui/icons-material/Replay';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Axios from './Axios.jsx';

// Styled components to match Home dashboard style
const GlassHeader = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #00897B, #00695C)',
    color: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    position: 'relative',
    overflow: 'hidden',
}));

const MessageBubble = styled(Box)(({ isUser, theme }) => ({
    maxWidth: '70%',
    padding: theme.spacing(2),
    borderRadius: isUser ? '12px 12px 0 12px' : '12px 12px 12px 0',
    backgroundColor: isUser ? theme.palette.primary.main : theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.8) : 'white',
    color: isUser ? 'white' : theme.palette.text.primary,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    whiteSpace: 'pre-wrap',
    position: 'relative',
    '&:hover': {
        boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
    },
    transition: 'box-shadow 0.2s ease',
}));

const SuggestedQuestionButton = styled(Button)(({ theme }) => ({
    borderRadius: '16px',
    background: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.6) : 'white',
    marginBottom: '4px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
}));

const CircleDecoration = styled(Box)({
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    zIndex: 0,
});

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 500,
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
}));

const SendMessageButton = styled(IconButton)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    },
    '&.Mui-disabled': {
        backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.15) : '#e0e0e0',
        color: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.3) : '#9e9e9e'
    },
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    borderRadius: '12px',
}));

const NGOChatbot = () => {
    const theme = useTheme();
    const [messages, setMessages] = useState([
        {
            id: 'greeting',
            role: 'assistant',
            content: 'Bonjour! Je suis un assistant virtuel spécialisé dans la législation tunisienne sur les associations. Comment puis-je vous aider?'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [showSources, setShowSources] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const isDarkMode = theme.palette.mode === 'dark';

    useEffect(() => {
        createNewConversation();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const createNewConversation = async () => {
        try {
            console.log("Creating new conversation...");
            let conversationIdValue = null;

            try {
                const response = await Axios.post('/chatbot/conversations/');
                console.log("Conversation created:", response.data);
                conversationIdValue = response.data.id;
                setConversationId(conversationIdValue);
            } catch (convError) {
                console.warn("Could not create conversation, will use direct-chat mode:", convError);
                conversationIdValue = "direct-chat";
                setConversationId(conversationIdValue);
            }

            // Reset messages to just the greeting
            setMessages([
                {
                    id: 'greeting',
                    role: 'assistant',
                    content: 'Bonjour! Je suis un assistant virtuel spécialisé dans la législation tunisienne sur les associations. Comment puis-je vous aider?'
                }
            ]);

            return conversationIdValue;
        } catch (error) {
            console.error('Error in conversation initialization:', error);
            setConversationId("fallback-mode");
            return "fallback-mode";
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        const currentInput = input.trim();
        if (!currentInput || !conversationId) return;

        const userMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: currentInput
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            console.log(`Sending message to conversation ${conversationId}: ${currentInput}`);
            let response;

            if (conversationId && conversationId !== "direct-chat" && conversationId !== "fallback-mode") {
                try {
                    response = await Axios.post(`/chatbot/conversations/${conversationId}/chat/`, {
                        message: currentInput
                    });
                } catch (convError) {
                    console.warn("Error with conversation endpoint, falling back to direct-chat:", convError);
                    response = await Axios.post('/chatbot/direct-chat/', {
                        query: currentInput
                    });
                }
            } else {
                response = await Axios.post('/chatbot/direct-chat/', {
                    query: currentInput
                });
            }

            let content, sources, messageId;

            if (response.data.content) {
                // Conversation endpoint format
                content = response.data.content;
                sources = response.data.relevant_documents || [];
                messageId = response.data.message_id;
            } else if (response.data.response) {
                // Direct-chat endpoint format
                content = response.data.response;
                sources = response.data.relevant_chunks ?
                    response.data.relevant_chunks.map(chunk => ({
                        title: "Document",
                        excerpt: chunk.content
                    })) : [];
                messageId = `direct-${Date.now()}`;
            } else {
                throw new Error("Unexpected response format");
            }

            const assistantMessage = {
                id: messageId || `assistant-${Date.now()}`,
                role: 'assistant',
                content: content,
                sources: sources
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error querying chatbot:', error);
            const errorMessage = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: "Désolé, j'ai rencontré un problème de communication. Veuillez réessayer."
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const provideFeedback = async (messageId, isPositive) => {
        if (!messageId) return;

        try {
            if (conversationId && conversationId !== "direct-chat" && conversationId !== "fallback-mode") {
                try {
                    await Axios.post(`/chatbot/conversations/${conversationId}/feedback/`, {
                        message_id: messageId,
                        rating: isPositive ? 5 : 1
                    });
                    console.log("Feedback submitted successfully");
                } catch (error) {
                    console.warn("Could not submit feedback to server:", error);
                }
            }

            // Update UI to show feedback was received
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === messageId
                        ? {...msg, feedbackGiven: true, feedbackPositive: isPositive}
                        : msg
                )
            );
        } catch (error) {
            console.error('Error handling feedback:', error);
        }
    };

    const clearConversation = () => {
        createNewConversation();
    };

    const suggestedQuestions = [
        "Comment créer une association en Tunisie?",
        "Quels documents sont requis pour les statuts?",
        "Comment financer une association?",
        "Conditions pour être membre d'une association?",
        "Comment dissoudre une association?"
    ];

    const handleSuggestedQuestion = (question) => {
        setInput(question);
        setTimeout(() => {
            const userMessage = {
                id: `user-${Date.now()}`,
                role: 'user',
                content: question
            };

            setMessages(prev => [...prev, userMessage]);
            setIsLoading(true);

            const sendRequest = async () => {
                try {
                    let response;
                    if (conversationId && conversationId !== "direct-chat" && conversationId !== "fallback-mode") {
                        try {
                            response = await Axios.post(`/chatbot/conversations/${conversationId}/chat/`, {
                                message: question
                            });
                        } catch (convError) {
                            response = await Axios.post('/chatbot/direct-chat/', {
                                query: question
                            });
                        }
                    } else {
                        response = await Axios.post('/chatbot/direct-chat/', {
                            query: question
                        });
                    }

                    let content, sources, messageId;
                    if (response.data.content) {
                        content = response.data.content;
                        sources = response.data.relevant_documents || [];
                        messageId = response.data.message_id;
                    } else if (response.data.response) {
                        content = response.data.response;
                        sources = response.data.relevant_chunks ?
                            response.data.relevant_chunks.map(chunk => ({
                                title: "Document",
                                excerpt: chunk.content
                            })) : [];
                        messageId = `direct-${Date.now()}`;
                    } else {
                        throw new Error("Unexpected response format");
                    }

                    const assistantMessage = {
                        id: messageId || `assistant-${Date.now()}`,
                        role: 'assistant',
                        content: content,
                        sources: sources
                    };

                    setMessages(prev => [...prev, assistantMessage]);
                } catch (error) {
                    console.error('Error with suggested question:', error);
                    const errorMessage = {
                        id: `error-${Date.now()}`,
                        role: 'assistant',
                        content: "Désolé, j'ai rencontré un problème de communication. Veuillez réessayer."
                    };
                    setMessages(prev => [...prev, errorMessage]);
                } finally {
                    setIsLoading(false);
                    setInput('');
                }
            };

            sendRequest();
        }, 100);
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            maxWidth: '1200px',
            margin: '0 auto',
            p: 2
        }}>
            {/* Header with back button - styled like the dashboard */}
            <GlassHeader elevation={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative', zIndex: 1 }}>
                    <IconButton
                        sx={{ color: 'white', mr: 1 }}
                        onClick={() => navigate('/home')}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <SmartToyIcon sx={{ mr: 2 }} />
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            Assistant Juridique pour les ONG
                        </Typography>
                        <Typography variant="body2">
                            Basé sur le Décret-loi n° 2011-88 du 24 septembre 2011
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip
                            title={showSources ? "Masquer les sources" : "Afficher les sources"}
                            TransitionComponent={Zoom}
                        >
                            <IconButton
                                sx={{ color: 'white' }}
                                onClick={() => setShowSources(!showSources)}
                            >
                                <InfoOutlinedIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Nouvelle conversation" TransitionComponent={Zoom}>
                            <IconButton
                                sx={{ color: 'white' }}
                                onClick={clearConversation}
                            >
                                <DeleteOutlineIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Decorative circles */}
                <CircleDecoration sx={{ top: -50, right: -50, width: 200, height: 200 }} />
                <CircleDecoration sx={{ bottom: -30, right: 100, width: 100, height: 100 }} />
            </GlassHeader>

            {/* Suggested questions - shown at start */}
            {messages.length <= 1 && (
                <Paper
                    elevation={2}
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: '12px',
                        background: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : '#f5f5f5'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <HelpOutlineIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                            Questions suggérées:
                        </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {suggestedQuestions.map((question, index) => (
                            <SuggestedQuestionButton
                                key={index}
                                variant="outlined"
                                size="small"
                                onClick={() => handleSuggestedQuestion(question)}
                                component={motion.button}
                                whileHover={{ scale: 1.03 }}
                            >
                                {question}
                            </SuggestedQuestionButton>
                        ))}
                    </Box>
                </Paper>
            )}

            {/* Chat container */}
            <Paper
                elevation={2}
                sx={{
                    flexGrow: 1,
                    p: 2,
                    mb: 2,
                    overflowY: 'auto',
                    borderRadius: '12px',
                    background: isDarkMode ? alpha(theme.palette.background.default, 0.6) : '#f9f9f9',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}
            >
                {messages.map((message, index) => (
                    <Box
                        key={message.id}
                        component={motion.div}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * (index % 3) }}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                            mb: 2
                        }}
                    >
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            mb: 0.5,
                            ml: message.role === 'user' ? 0 : 1,
                            mr: message.role === 'user' ? 1 : 0
                        }}>
                            {message.role !== 'user' && (
                                <Avatar
                                    sx={{
                                        width: 28,
                                        height: 28,
                                        mr: 1,
                                        bgcolor: 'primary.main',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    <SmartToyIcon sx={{ fontSize: 16 }} />
                                </Avatar>
                            )}

                            <MessageBubble isUser={message.role === 'user'}>
                                {message.content}

                                {/* Show sources if available and showSources is true */}
                                {showSources && message.sources && message.sources.length > 0 && (
                                    <Box sx={{
                                        mt: 1,
                                        fontSize: '0.8rem',
                                        color: message.role === 'user'
                                            ? alpha(theme.palette.common.white, 0.8)
                                            : theme.palette.text.secondary
                                    }}>
                                        <details>
                                            <summary style={{ cursor: 'pointer', fontWeight: 500 }}>Sources</summary>
                                            <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                                                {message.sources.map((source, index) => (
                                                    <li key={index}>
                                                        <strong>{source.title}</strong>: {source.excerpt}
                                                    </li>
                                                ))}
                                            </ul>
                                        </details>
                                    </Box>
                                )}
                            </MessageBubble>

                            {message.role === 'user' && (
                                <Avatar
                                    sx={{
                                        width: 28,
                                        height: 28,
                                        ml: 1,
                                        bgcolor: theme.palette.primary.dark,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    <PersonIcon sx={{ fontSize: 16 }} />
                                </Avatar>
                            )}
                        </Box>

                        {/* Feedback buttons - only show for assistant messages that aren't the greeting */}
                        {message.role === 'assistant' && message.id !== 'greeting' && (
                            <Box sx={{ mt: 0.5, display: 'flex', gap: 1, alignSelf: 'flex-start', ml: 4 }}>
                                {message.feedbackGiven ? (
                                    <Chip
                                        size="small"
                                        color={message.feedbackPositive ? "success" : "default"}
                                        label={message.feedbackPositive
                                            ? 'Merci pour votre évaluation positive!'
                                            : 'Merci pour votre retour.'}
                                        variant="outlined"
                                    />
                                ) : (
                                    <>
                                        <Tooltip title="Réponse utile" TransitionComponent={Zoom}>
                                            <IconButton
                                                size="small"
                                                onClick={() => provideFeedback(message.id, true)}
                                                sx={{ color: 'success.main' }}
                                            >
                                                <ThumbUpIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Réponse peu utile" TransitionComponent={Zoom}>
                                            <IconButton
                                                size="small"
                                                onClick={() => provideFeedback(message.id, false)}
                                                sx={{ color: 'error.main' }}
                                            >
                                                <ThumbDownIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                )}
                            </Box>
                        )}
                    </Box>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <Box
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', mb: 2 }}
                        component={motion.div}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: '12px 12px 12px 0',
                                bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : 'white',
                                display: 'flex',
                                alignItems: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                        >
                            <CircularProgress size={20} thickness={5} sx={{ mr: 1 }} />
                            <Typography variant="body2" color="textSecondary">
                                Assistant est en train d'écrire...
                            </Typography>
                        </Box>
                    </Box>
                )}

                <div ref={messagesEndRef} />
            </Paper>

            {/* Input form */}
            <Paper
                component="form"
                onSubmit={handleSubmit}
                elevation={3}
                sx={{
                    display: 'flex',
                    p: 1.5,
                    borderRadius: '12px',
                    background: isDarkMode ? alpha(theme.palette.background.paper, 0.8) : 'white',
                    boxShadow: inputFocused
                        ? '0 4px 20px rgba(0,0,0,0.15)'
                        : '0 2px 10px rgba(0,0,0,0.1)',
                    transition: 'box-shadow 0.3s ease',
                }}
            >
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="Posez une question sur les associations en Tunisie..."
                    disabled={isLoading || !conversationId}
                    sx={{
                        mr: 1,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                        }
                    }}
                />
                <SendMessageButton
                    type="submit"
                    disabled={isLoading || !input.trim() || !conversationId}
                >
                    <SendIcon />
                </SendMessageButton>
            </Paper>

            {/* Help & Reset Panel */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 2,
                    mt: 1,
                    mb: 2,
                }}
            >
                <ActionButton
                    startIcon={<ReplayIcon />}
                    variant="text"
                    size="small"
                    onClick={clearConversation}
                >
                    Nouvelle conversation
                </ActionButton>
                <ActionButton
                    startIcon={<HelpOutlineIcon />}
                    variant="text"
                    size="small"
                    onClick={() => handleSuggestedQuestion("Qu'est-ce que cet assistant peut faire?")}
                >
                    Aide
                </ActionButton>
            </Box>

            {/* Footer with login link */}
            <Box sx={{ textAlign: 'center', mt: 'auto', mb: 1 }}>
                <Typography variant="body2" color="textSecondary">
                    Vous êtes administrateur d'une association?
                    <Link
                        href="/home"
                        sx={{
                            ml: 1,
                            color: theme.palette.primary.main,
                            textDecoration: 'none',
                            '&:hover': {
                                textDecoration: 'underline'
                            }
                        }}
                    >
                        Connectez-vous
                    </Link>
                </Typography>
            </Box>
        </Box>
    );
};

export default NGOChatbot;