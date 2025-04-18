import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, IconButton, TextField, Button, CircularProgress, Paper, Link } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useNavigate } from 'react-router-dom';
import Axios from './Axios.jsx'; // Assuming this is your Axios instance

const NGOChatbot = () => {
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
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    // Initialize conversation when component mounts
    useEffect(() => {
        // Create a new conversation immediately
        createNewConversation();

        // Return cleanup function to cancel any pending requests
        return () => {
            // Optional: could abort any pending API requests here
        };
    }, []);

    // Log changes to conversationId for debugging
    useEffect(() => {
        console.log("Conversation ID updated:", conversationId);
    }, [conversationId]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Create a new conversation
    const createNewConversation = async () => {
        try {
            console.log("Creating new conversation...");

            // Try using direct-chat endpoint first if conversation endpoint fails
            let conversationIdValue = null;

            try {
                const response = await Axios.post('/chatbot/conversations/');
                console.log("Conversation created:", response.data);
                conversationIdValue = response.data.id;
                setConversationId(conversationIdValue);
            } catch (convError) {
                console.warn("Could not create conversation, will use direct-chat mode:", convError);
                // Set a placeholder ID for direct chat mode
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
            // Set a fallback ID to allow operation in degraded mode
            setConversationId("fallback-mode");
            return "fallback-mode";
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        // Get current input value - important for the closure in async operations
        const currentInput = input.trim();

        // Check if we have valid input and an active conversation
        if (!currentInput || !conversationId) {
            console.log("Missing input or conversation ID", { input: currentInput, conversationId });
            return;
        }

        // Create user message object with current message
        const userMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: currentInput
        };

        // Update UI first
        setMessages(prev => [...prev, userMessage]);
        setInput(''); // Clear input field
        setIsLoading(true);

        try {
            console.log(`Sending message to conversation ${conversationId}: ${currentInput}`);

            let response;

            // Try the conversation-based endpoint first
            if (conversationId && conversationId !== "direct-chat" && conversationId !== "fallback-mode") {
                try {
                    // Use the conversation-based API endpoint
                    response = await Axios.post(`/chatbot/conversations/${conversationId}/chat/`, {
                        message: currentInput
                    });
                } catch (convError) {
                    console.warn("Error with conversation endpoint, falling back to direct-chat:", convError);
                    // Fall back to direct-chat
                    response = await Axios.post('/chatbot/direct-chat/', {
                        query: currentInput
                    });
                }
            } else {
                // Use direct-chat as fallback
                response = await Axios.post('/chatbot/direct-chat/', {
                    query: currentInput
                });
            }

            console.log("Received response:", response.data);

            // Handle different response formats between direct-chat and conversation endpoints
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

            // Add assistant's response with sources
            const assistantMessage = {
                id: messageId || `assistant-${Date.now()}`,
                role: 'assistant',
                content: content,
                sources: sources
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error querying chatbot:', error);

            // Add error message
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

    // Provide feedback on a message
    const provideFeedback = async (messageId, isPositive) => {
        if (!messageId) return;

        try {
            // Only try to send feedback if we have a real conversation ID
            if (conversationId && conversationId !== "direct-chat" && conversationId !== "fallback-mode") {
                try {
                    await Axios.post(`/chatbot/conversations/${conversationId}/feedback/`, {
                        message_id: messageId,
                        rating: isPositive ? 5 : 1
                    });
                    console.log("Feedback submitted successfully");
                } catch (error) {
                    console.warn("Could not submit feedback to server:", error);
                    // Continue anyway to update UI
                }
            } else {
                console.log("Feedback not submitted (direct-chat mode)");
                // In direct chat mode, we just update the UI but don't submit to server
            }

            // Update UI to show feedback was received (do this regardless of API success)
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

    // Clear conversation
    const clearConversation = () => {
        createNewConversation();
    };

    // Suggested questions to help users
    const suggestedQuestions = [
        "Comment créer une association en Tunisie?",
        "Quels documents sont requis pour les statuts?",
        "Comment financer une association?",
        "Conditions pour être membre d'une association?",
        "Comment dissoudre une association?"
    ];

    const handleSuggestedQuestion = (question) => {
        // Set the question in the input field first
        setInput(question);

        // Then use a callback pattern to ensure the input is set before submitting
        setTimeout(() => {
            // Create a mock form event and pass the question directly
            const mockEvent = { preventDefault: () => {} };

            // Store question for direct use instead of relying on state update
            const currentQuestion = question;

            // Create user message manually
            const userMessage = {
                id: `user-${Date.now()}`,
                role: 'user',
                content: currentQuestion
            };

            // Update UI first
            setMessages(prev => [...prev, userMessage]);
            setIsLoading(true);

            // Send request directly with the question
            const sendRequest = async () => {
                try {
                    let response;

                    // Try conversation endpoint first, fall back to direct-chat
                    if (conversationId && conversationId !== "direct-chat" && conversationId !== "fallback-mode") {
                        try {
                            response = await Axios.post(`/chatbot/conversations/${conversationId}/chat/`, {
                                message: currentQuestion
                            });
                        } catch (convError) {
                            console.warn("Falling back to direct-chat for suggested question:", convError);
                            response = await Axios.post('/chatbot/direct-chat/', {
                                query: currentQuestion
                            });
                        }
                    } else {
                        response = await Axios.post('/chatbot/direct-chat/', {
                            query: currentQuestion
                        });
                    }

                    // Handle different response formats between endpoints
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

                    // Add assistant's response
                    const assistantMessage = {
                        id: messageId || `assistant-${Date.now()}`,
                        role: 'assistant',
                        content: content,
                        sources: sources
                    };

                    setMessages(prev => [...prev, assistantMessage]);
                } catch (error) {
                    console.error('Error with suggested question:', error);
                    // Add error message
                    const errorMessage = {
                        id: `error-${Date.now()}`,
                        role: 'assistant',
                        content: "Désolé, j'ai rencontré un problème de communication. Veuillez réessayer."
                    };
                    setMessages(prev => [...prev, errorMessage]);
                } finally {
                    setIsLoading(false);
                    setInput(''); // Clear input after processing
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
            {/* Header with back button */}
            <Paper elevation={3} sx={{
                p: 2,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #0d47a1, #2196f3)',
                color: 'white',
                borderRadius: '8px'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <IconButton
                        sx={{ color: 'white', mr: 1 }}
                        onClick={() => navigate('/')}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <ChatBubbleOutlineIcon sx={{ mr: 2 }} />
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            Assistant Juridique pour les ONG
                        </Typography>
                        <Typography variant="body2">
                            Basé sur le Décret-loi n° 2011-88 du 24 septembre 2011
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                            sx={{ color: 'white' }}
                            onClick={() => setShowSources(!showSources)}
                            title={showSources ? "Masquer les sources" : "Afficher les sources"}
                        >
                            <InfoOutlinedIcon />
                        </IconButton>
                        <IconButton
                            sx={{ color: 'white' }}
                            onClick={clearConversation}
                            title="Nouvelle conversation"
                        >
                            <DeleteOutlineIcon />
                        </IconButton>
                    </Box>
                </Box>
            </Paper>

            {/* Suggested questions - shown at start */}
            {messages.length <= 1 && (
                <Paper elevation={2} sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: '8px',
                    background: '#f5f5f5'
                }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
                        Questions suggérées:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {suggestedQuestions.map((question, index) => (
                            <Button
                                key={index}
                                variant="outlined"
                                size="small"
                                onClick={() => handleSuggestedQuestion(question)}
                                sx={{
                                    borderRadius: '16px',
                                    background: 'white',
                                    mb: 0.5
                                }}
                            >
                                {question}
                            </Button>
                        ))}
                    </Box>
                </Paper>
            )}

            {/* Chat container */}
            <Paper elevation={2} sx={{
                flexGrow: 1,
                p: 2,
                mb: 2,
                overflowY: 'auto',
                borderRadius: '8px',
                background: '#f9f9f9'
            }}>
                {messages.map(message => (
                    <Box
                        key={message.id}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                            mb: 2
                        }}
                    >
                        <Box
                            sx={{
                                maxWidth: '70%',
                                p: 2,
                                borderRadius: message.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                bgcolor: message.role === 'user' ? '#0d47a1' : 'white',
                                color: message.role === 'user' ? 'white' : 'black',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                whiteSpace: 'pre-wrap'
                            }}
                        >
                            {message.content}

                            {/* Show sources if available and showSources is true */}
                            {showSources && message.sources && message.sources.length > 0 && (
                                <Box sx={{ mt: 1, fontSize: '0.8rem', color: message.role === 'user' ? '#e0e0e0' : '#757575' }}>
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
                        </Box>

                        {/* Feedback buttons - only show for assistant messages that aren't the greeting */}
                        {message.role === 'assistant' && message.id !== 'greeting' && (
                            <Box sx={{ mt: 0.5, display: 'flex', gap: 1, alignSelf: 'flex-start' }}>
                                {message.feedbackGiven ? (
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                        {message.feedbackPositive
                                            ? 'Merci pour votre évaluation positive!'
                                            : 'Merci pour votre retour.'}
                                    </Typography>
                                ) : (
                                    <>
                                        <IconButton
                                            size="small"
                                            onClick={() => provideFeedback(message.id, true)}
                                            title="Réponse utile"
                                            sx={{ color: 'success.main' }}
                                        >
                                            <ThumbUpIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => provideFeedback(message.id, false)}
                                            title="Réponse peu utile"
                                            sx={{ color: 'error.main' }}
                                        >
                                            <ThumbDownIcon fontSize="small" />
                                        </IconButton>
                                    </>
                                )}
                            </Box>
                        )}
                    </Box>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', mb: 2 }}>
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: '12px 12px 12px 0',
                                bgcolor: 'white',
                                display: 'flex',
                                alignItems: 'center'
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
            <Paper component="form" onSubmit={handleSubmit} elevation={3} sx={{
                display: 'flex',
                p: 1,
                borderRadius: '8px',
                background: 'white'
            }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Posez une question sur les associations en Tunisie..."
                    disabled={isLoading || !conversationId}
                    sx={{ mr: 1 }}
                />
                <IconButton
                    type="submit"
                    color="primary"
                    disabled={isLoading || !input.trim() || !conversationId}
                    sx={{
                        bgcolor: '#0d47a1',
                        color: 'white',
                        '&:hover': {
                            bgcolor: '#1565c0',
                        },
                        '&.Mui-disabled': {
                            bgcolor: '#e0e0e0',
                            color: '#9e9e9e'
                        }
                    }}
                >
                    <SendIcon />
                </IconButton>
            </Paper>

            {/* Footer with login link */}
            <Box sx={{ textAlign: 'center', mt: 2, mb: 1 }}>
                <Typography variant="body2" color="textSecondary">
                    Vous êtes administrateur d'une association?
                    <Link
                        href="/"
                        sx={{
                            ml: 1,
                            color: '#0d47a1',
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