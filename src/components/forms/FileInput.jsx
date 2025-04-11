import React from 'react';
import {
    Box,
    Typography,
    Chip,
    Alert
} from '@mui/material';
import {
    CheckCircle,
    CloudUpload,
    ErrorOutline
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Controller } from 'react-hook-form';

/**
 * Enhanced file input component with validation and file preview
 *
 * @param {Object} props - Component props
 * @param {string} props.name - Field name
 * @param {string} props.label - Field label
 * @param {string} props.description - Help text description
 * @param {Object} props.control - React Hook Form control instance
 * @param {Object} props.errors - Form errors object
 * @param {React.ReactNode} props.icon - Custom icon to display (defaults to CloudUpload)
 * @param {string} props.acceptedFormats - Comma-separated list of accepted file formats
 * @param {number} props.maxSize - Maximum file size in bytes
 * @param {boolean} props.important - Whether to show this field as particularly important
 */
const FileInput = ({
                       name,
                       label,
                       description,
                       control,
                       errors,
                       icon = <CloudUpload />,
                       acceptedFormats = "application/pdf",
                       maxSize = 5 * 1024 * 1024, // 5MB default
                       important = false
                   }) => {
    // Format the file size to be human-readable
    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        else return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    // Format error messages more clearly
    const getErrorMessage = (error) => {
        if (!error) return null;
        if (error.type === 'fileType') return 'Format de fichier non supporté. Utilisez un fichier PDF.';
        if (error.type === 'fileSize') return `Fichier trop volumineux. Taille maximum: ${formatFileSize(maxSize)}.`;
        return error.message;
    };

    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                {label}
                {important && <span style={{ color: '#f44336', marginLeft: '4px' }}>*</span>}
            </Typography>

            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                {description}
            </Typography>

            {important && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Ce document est essentiel pour la vérification automatique de l'association.
                </Alert>
            )}

            <Controller
                name={name}
                control={control}
                defaultValue={null}
                render={({ field: { onChange, value } }) => (
                    <Box
                        sx={{
                            border: '2px dashed',
                            borderColor: errors[name] ? '#f44336' : (value ? '#4caf50' : '#0d47a1'),
                            borderRadius: 2,
                            p: 3,
                            textAlign: 'center',
                            transition: 'all 0.3s ease',
                            backgroundColor: value ? 'rgba(76, 175, 80, 0.05)' : 'transparent',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {value ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <CheckCircle sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                                <Typography sx={{ fontWeight: 'medium' }}>{value.name}</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                    {formatFileSize(value.size)} • {value.type.split('/')[1].toUpperCase()}
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Chip
                                        label="Changer le fichier"
                                        onClick={() => document.getElementById(`file-input-${name}`).click()}
                                        icon={<CloudUpload />}
                                        color="primary"
                                        variant="outlined"
                                    />
                                </Box>
                            </motion.div>
                        ) : (
                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                transition={{ duration: 0.2 }}
                            >
                                {React.cloneElement(icon, {
                                    sx: { fontSize: 40, color: '#0d47a1', mb: 1 }
                                })}
                                <Typography>Déposez votre fichier ici ou cliquez pour parcourir</Typography>
                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                                    Format accepté: PDF • Taille maximale: {formatFileSize(maxSize)}
                                </Typography>
                            </motion.div>
                        )}

                        <input
                            id={`file-input-${name}`}
                            type="file"
                            accept={acceptedFormats}
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    // Reset input if validation fails
                                    if (file.size > maxSize) {
                                        alert(`Le fichier est trop volumineux. Maximum: ${formatFileSize(maxSize)}`);
                                        e.target.value = null;
                                        return;
                                    }

                                    if (!file.type.match(acceptedFormats)) {
                                        alert("Format de fichier non supporté. Utilisez un fichier PDF.");
                                        e.target.value = null;
                                        return;
                                    }

                                    onChange(file);
                                }
                            }}
                            style={{
                                opacity: 0,
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                cursor: 'pointer'
                            }}
                        />
                    </Box>
                )}
            />

            {errors[name] && (
                <Box
                    sx={{
                        mt: 1,
                        display: 'flex',
                        alignItems: 'flex-start',
                        color: '#f44336'
                    }}
                >
                    <ErrorOutline sx={{ fontSize: 16, mr: 0.5, mt: 0.3 }} />
                    <Typography color="error" variant="caption">
                        {getErrorMessage(errors[name])}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default FileInput;