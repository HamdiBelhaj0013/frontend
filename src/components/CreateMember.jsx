import { React, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Snackbar, Alert } from "@mui/material";
import { useForm } from 'react-hook-form';
import AxiosInstance from './Axios.jsx';
import Dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MyDatePickerField from "./forms/MyDatePickerField.jsx";
import MyTextField from "./forms/MyTextField.jsx";
import MySelectField from "./forms/MySelectField.jsx";
import './CreateMember.css';
import { Person, Email, Home, Work, Public, Cake, Event } from '@mui/icons-material';

const CreateMember = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const schema = yup.object({
        name: yup.string().required('Name is required'),
        address: yup.string().required('Address is required'),
        email: yup.string().email('Invalid email').required('Email is required'),
        nationality: yup.string().required('Nationality is required'),
        birth_date: yup.date().nullable().required('Birth date is required'),
        job: yup.string().required('Job is required'),
        joining_date: yup.date().nullable().required('Joining date is required'),
        role: yup.string().required('Role is required'),
    });

    const { handleSubmit, control, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: '',
            address: '',
            email: '',
            nationality: '',
            birth_date: null,
            job: '',
            joining_date: null,
            role: '',
        },
    });

    const submission = async (data) => {
        setLoading(true);
        setError(null);
        try {
            await AxiosInstance.post('/api/member/', {
                ...data,
                birth_date: data.birth_date ? Dayjs(data.birth_date).format('YYYY-MM-DD') : null,
                joining_date: data.joining_date ? Dayjs(data.joining_date).format('YYYY-MM-DD') : null,
            });
            reset();
            navigate('/members', { state: { success: true } });
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const roleOptions = [
        { value: "Président", label: "Président" },
        { value: "Secrétaire générale", label: "Secrétaire générale" },
        { value: "Trésorier", label: "Trésorier" },
        { value: "Membre", label: "Membre" },
        { value: "Autre", label: "Autre" },
    ];

    const countries = [
        { value: "Afghanistan", label: "Afghanistan" },
        { value: "Albania", label: "Albania" },
        { value: "Algeria", label: "Algeria" },
        { value: "Andorra", label: "Andorra" },
        { value: "Angola", label: "Angola" },
        { value: "Antigua and Barbuda", label: "Antigua and Barbuda" },
        { value: "Argentina", label: "Argentina" },
        { value: "Armenia", label: "Armenia" },
        { value: "Australia", label: "Australia" },
        { value: "Austria", label: "Austria" },
        { value: "Azerbaijan", label: "Azerbaijan" },
        { value: "Bahamas", label: "Bahamas" },
        { value: "Bahrain", label: "Bahrain" },
        { value: "Bangladesh", label: "Bangladesh" },
        { value: "Barbados", label: "Barbados" },
        { value: "Belarus", label: "Belarus" },
        { value: "Belgium", label: "Belgium" },
        { value: "Belize", label: "Belize" },
        { value: "Benin", label: "Benin" },
        { value: "Bhutan", label: "Bhutan" },
        { value: "Bolivia", label: "Bolivia" },
        { value: "Bosnia and Herzegovina", label: "Bosnia and Herzegovina" },
        { value: "Botswana", label: "Botswana" },
        { value: "Brazil", label: "Brazil" },
        { value: "Brunei", label: "Brunei" },
        { value: "Bulgaria", label: "Bulgaria" },
        { value: "Burkina Faso", label: "Burkina Faso" },
        { value: "Burundi", label: "Burundi" },
        { value: "Cabo Verde", label: "Cabo Verde" },
        { value: "Cambodia", label: "Cambodia" },
        { value: "Cameroon", label: "Cameroon" },
        { value: "Canada", label: "Canada" },
        { value: "Central African Republic", label: "Central African Republic" },
        { value: "Chad", label: "Chad" },
        { value: "Chile", label: "Chile" },
        { value: "China", label: "China" },
        { value: "Colombia", label: "Colombia" },
        { value: "Comoros", label: "Comoros" },
        { value: "Congo", label: "Congo" },
        { value: "Congo (Democratic Republic)", label: "Congo (Democratic Republic)" },
        { value: "Costa Rica", label: "Costa Rica" },
        { value: "Croatia", label: "Croatia" },
        { value: "Cuba", label: "Cuba" },
        { value: "Cyprus", label: "Cyprus" },
        { value: "Czech Republic", label: "Czech Republic" },
        { value: "Denmark", label: "Denmark" },
        { value: "Djibouti", label: "Djibouti" },
        { value: "Dominica", label: "Dominica" },
        { value: "Dominican Republic", label: "Dominican Republic" },
        { value: "Ecuador", label: "Ecuador" },
        { value: "Egypt", label: "Egypt" },
        { value: "El Salvador", label: "El Salvador" },
        { value: "Equatorial Guinea", label: "Equatorial Guinea" },
        { value: "Eritrea", label: "Eritrea" },
        { value: "Estonia", label: "Estonia" },
        { value: "Eswatini", label: "Eswatini" },
        { value: "Ethiopia", label: "Ethiopia" },
        { value: "Fiji", label: "Fiji" },
        { value: "Finland", label: "Finland" },
        { value: "France", label: "France" },
        { value: "Gabon", label: "Gabon" },
        { value: "Gambia", label: "Gambia" },
        { value: "Georgia", label: "Georgia" },
        { value: "Germany", label: "Germany" },
        { value: "Ghana", label: "Ghana" },
        { value: "Greece", label: "Greece" },
        { value: "Grenada", label: "Grenada" },
        { value: "Guatemala", label: "Guatemala" },
        { value: "Guinea", label: "Guinea" },
        { value: "Guinea-Bissau", label: "Guinea-Bissau" },
        { value: "Guyana", label: "Guyana" },
        { value: "Haiti", label: "Haiti" },
        { value: "Honduras", label: "Honduras" },
        { value: "Hungary", label: "Hungary" },
        { value: "Iceland", label: "Iceland" },
        { value: "India", label: "India" },
        { value: "Indonesia", label: "Indonesia" },
        { value: "Iran", label: "Iran" },
        { value: "Iraq", label: "Iraq" },
        { value: "Ireland", label: "Ireland" },
        { value: "Palestine", label: "Palestine" },
        { value: "Italy", label: "Italy" },
        { value: "Jamaica", label: "Jamaica" },
        { value: "Japan", label: "Japan" },
        { value: "Jordan", label: "Jordan" },
        { value: "Kazakhstan", label: "Kazakhstan" },
        { value: "Kenya", label: "Kenya" },
        { value: "Kiribati", label: "Kiribati" },
        { value: "Korea (North)", label: "Korea (North)" },
        { value: "Korea (South)", label: "Korea (South)" },
        { value: "Kuwait", label: "Kuwait" },
        { value: "Kyrgyzstan", label: "Kyrgyzstan" },
        { value: "Laos", label: "Laos" },
        { value: "Latvia", label: "Latvia" },
        { value: "Lebanon", label: "Lebanon" },
        { value: "Lesotho", label: "Lesotho" },
        { value: "Liberia", label: "Liberia" },
        { value: "Libya", label: "Libya" },
        { value: "Liechtenstein", label: "Liechtenstein" },
        { value: "Lithuania", label: "Lithuania" },
        { value: "Luxembourg", label: "Luxembourg" },
        { value: "Madagascar", label: "Madagascar" },
        { value: "Malawi", label: "Malawi" },
        { value: "Malaysia", label: "Malaysia" },
        { value: "Maldives", label: "Maldives" },
        { value: "Mali", label: "Mali" },
        { value: "Malta", label: "Malta" },
        { value: "Marshall Islands", label: "Marshall Islands" },
        { value: "Mauritania", label: "Mauritania" },
        { value: "Mauritius", label: "Mauritius" },
        { value: "Mexico", label: "Mexico" },
        { value: "Micronesia", label: "Micronesia" },
        { value: "Moldova", label: "Moldova" },
        { value: "Monaco", label: "Monaco" },
        { value: "Mongolia", label: "Mongolia" },
        { value: "Montenegro", label: "Montenegro" },
        { value: "Morocco", label: "Morocco" },
        { value: "Mozambique", label: "Mozambique" },
        { value: "Myanmar", label: "Myanmar" },
        { value: "Namibia", label: "Namibia" },
        { value: "Nauru", label: "Nauru" },
        { value: "Nepal", label: "Nepal" },
        { value: "Netherlands", label: "Netherlands" },
        { value: "New Zealand", label: "New Zealand" },
        { value: "Nicaragua", label: "Nicaragua" },
        { value: "Niger", label: "Niger" },
        { value: "Nigeria", label: "Nigeria" },
        { value: "North Macedonia", label: "North Macedonia" },
        { value: "Norway", label: "Norway" },
        { value: "Oman", label: "Oman" },
        { value: "Pakistan", label: "Pakistan" },
        { value: "Palau", label: "Palau" },
        { value: "Panama", label: "Panama" },
        { value: "Papua New Guinea", label: "Papua New Guinea" },
        { value: "Paraguay", label: "Paraguay" },
        { value: "Peru", label: "Peru" },
        { value: "Philippines", label: "Philippines" },
        { value: "Poland", label: "Poland" },
        { value: "Portugal", label: "Portugal" },
        { value: "Qatar", label: "Qatar" },
        { value: "Romania", label: "Romania" },
        { value: "Russia", label: "Russia" },
        { value: "Rwanda", label: "Rwanda" },
        { value: "Saint Kitts and Nevis", label: "Saint Kitts and Nevis" },
        { value: "Saint Lucia", label: "Saint Lucia" },
        { value: "Saint Vincent and the Grenadines", label: "Saint Vincent and the Grenadines" },
        { value: "Samoa", label: "Samoa" },
        { value: "San Marino", label: "San Marino" },
        { value: "Sao Tome and Principe", label: "Sao Tome and Principe" },
        { value: "Saudi Arabia", label: "Saudi Arabia" },
        { value: "Senegal", label: "Senegal" },
        { value: "Serbia", label: "Serbia" },
        { value: "Seychelles", label: "Seychelles" },
        { value: "Sierra Leone", label: "Sierra Leone" },
        { value: "Singapore", label: "Singapore" },
        { value: "Slovakia", label: "Slovakia" },
        { value: "Slovenia", label: "Slovenia" },
        { value: "Solomon Islands", label: "Solomon Islands" },
        { value: "Somalia", label: "Somalia" },
        { value: "South Africa", label: "South Africa" },
        { value: "South Sudan", label: "South Sudan" },
        { value: "Spain", label: "Spain" },
        { value: "Sri Lanka", label: "Sri Lanka" },
        { value: "Sudan", label: "Sudan" },
        { value: "Suriname", label: "Suriname" },
        { value: "Sweden", label: "Sweden" },
        { value: "Switzerland", label: "Switzerland" },
        { value: "Syria", label: "Syria" },
        { value: "Taiwan", label: "Taiwan" },
        { value: "Tajikistan", label: "Tajikistan" },
        { value: "Tanzania", label: "Tanzania" },
        { value: "Thailand", label: "Thailand" },
        { value: "Timor-Leste", label: "Timor-Leste" },
        { value: "Togo", label: "Togo" },
        { value: "Tonga", label: "Tonga" },
        { value: "Trinidad and Tobago", label: "Trinidad and Tobago" },
        { value: "Tunisia", label: "Tunisia" },
        { value: "Turkey", label: "Turkey" },
        { value: "Turkmenistan", label: "Turkmenistan" },
        { value: "Tuvalu", label: "Tuvalu" },
        { value: "Uganda", label: "Uganda" },
        { value: "Ukraine", label: "Ukraine" },
        { value: "United Arab Emirates", label: "United Arab Emirates" },
        { value: "United Kingdom", label: "United Kingdom" },
        { value: "United States", label: "United States" },
        { value: "Uruguay", label: "Uruguay" },
        { value: "Uzbekistan", label: "Uzbekistan" },
        { value: "Vanuatu", label: "Vanuatu" },
        { value: "Vatican City", label: "Vatican City" },
        { value: "Venezuela", label: "Venezuela" },
        { value: "Vietnam", label: "Vietnam" },
        { value: "Yemen", label: "Yemen" },
        { value: "Zambia", label: "Zambia" },
        { value: "Zimbabwe", label: "Zimbabwe" }
    ];


    const formFields = [
        [
            { label: "Full Name", name: "name", width: '30%', component: MyTextField },
            { label: "Address", name: "address", width: '30%', component: MyTextField },
            { label: "Email", name: "email", width: '30%', component: MyTextField },
        ],
        [
            { label: "Nationality", name: "nationality", width: '30%', component: MySelectField, options: countries },
            { label: "Job", name: "job", width: '30%', component: MyTextField },
            { label: "Role", name: "role", width: '30%', component: MySelectField, options: roleOptions },
        ],
        [
            { label: "Birth Date", name: "birth_date", width: '30%', component: MyDatePickerField },
            { label: "Joining Date", name: "joining_date", width: '30%', component: MyDatePickerField },
        ]
    ];
    const fieldIcons = {
        name: <Person sx={{ color: '#1a237e', fontSize: 28 }} />,
        email: <Email sx={{ color: '#1a237e', fontSize: 28 }} />,
        address: <Home sx={{ color: '#1a237e', fontSize: 28 }} />,
        job: <Work sx={{ color: '#1a237e', fontSize: 28 }} />,
        nationality: <Public sx={{ color: '#1a237e', fontSize: 28 }} />,
        birth_date: <Cake sx={{ color: '#1a237e', fontSize: 28 }} />,
        joining_date: <Event sx={{ color: '#1a237e', fontSize: 28 }} />,
        role: <Work sx={{ color: '#1a237e', fontSize: 28 }} />,
    };


    return (
        <form onSubmit={handleSubmit(submission)}>
            <Box sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                padding: 10,
            }}>
                <Box sx={{
                    maxWidth: 1500,
                    margin: '0 auto',
                    transform: 'translateY(50px)',
                    animation: 'slideUp 0.6s ease-out forwards',
                    '@keyframes slideUp': {
                        from: { transform: 'translateY(50px)', opacity: 0 },
                        to: { transform: 'translateY(0)', opacity: 1 }
                    }
                }}>
                    {/* Enhanced Header */}
                    <Box className="header-animation" sx={{
                        display: "flex",
                        alignItems: 'center',
                        background: 'linear-gradient(135deg, #1a237e 0%, #303f9f 100%)',
                        marginBottom: 4,
                        padding: 3,
                        borderRadius: 3,
                        boxShadow: 6,
                        position: 'relative',
                        overflow: 'hidden',
                        '&:before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%)'
                        }
                    }}>
                        <Typography variant="h4" sx={{
                            color: "white",
                            fontWeight: 800,
                            letterSpacing: 1.2,
                            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                        }}>
                            <Person sx={{ fontSize: 36, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                            Create New Member
                        </Typography>
                    </Box>

                    {/* Enhanced Form Container */}
                    <Box className="form-container" sx={{
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        padding: { xs: 3, md: 4 },
                        position: 'relative',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        '&:before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '4px',
                            height: '100%',
                            background: 'linear-gradient(180deg, #1a237e 0%, #303f9f 100%)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                        },
                        '&:hover:before': {
                            width: '6px',
                            boxShadow: '2px 0 8px rgba(26, 35, 126, 0.3)'
                        }
                    }}>
                        {formFields.map((row, rowIndex) => (
                            <Box key={rowIndex} sx={{
                                display: "flex",
                                gap: 3,
                                flexWrap: 'wrap',
                                marginBottom: 4,
                                '&:last-child': { marginBottom: 0 }
                            }}>
                                {row.map((field) => (
                                    <Box key={field.name} sx={{
                                        width: { xs: '100%', md: field.width },
                                        transition: 'all 0.3s ease',
                                        position: 'relative',
                                        '&:hover': {
                                            transform: 'translateX(8px)',
                                            '& .field-icon': {
                                                transform: 'scale(1.1) rotate(-5deg)'
                                            }
                                        }
                                    }}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            mb: 1,
                                            paddingLeft: 1
                                        }}>
                                            <Box className="field-icon" sx={{
                                                transition: 'transform 0.3s ease',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>
                                                {fieldIcons[field.name]}
                                            </Box>
                                            <Typography variant="subtitle1" sx={{
                                                color: '#1a237e',
                                                fontWeight: 600,
                                                letterSpacing: 0.5
                                            }}>
                                                {field.label}
                                            </Typography>
                                        </Box>
                                        <field.component
                                            name={field.name}
                                            control={control}
                                            placeholder={`Enter ${field.label.toLowerCase()}`}
                                            options={field.options || []}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
                                                    },
                                                    '&.Mui-focused': {
                                                        boxShadow: '0 4px 12px rgba(26, 35, 126, 0.2)',
                                                        transform: 'scale(1.02)'
                                                    }
                                                }
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        ))}

                        {/* Enhanced Submit Button */}
                        <Box sx={{
                            textAlign: "right",
                            marginTop: 6,
                            position: 'relative'
                        }}>
                            <Button
                                variant="contained"
                                type="submit"
                                disabled={loading}
                                sx={{
                                    minWidth: 180,
                                    padding: '14px 40px',
                                    fontSize: 16,
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, #1a237e 0%, #303f9f 100%)',
                                    boxShadow: '0 4px 12px rgba(26, 35, 126, 0.3)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        transform: 'translateY(-2px) scale(1.05)',
                                        boxShadow: '0 6px 16px rgba(26, 35, 126, 0.4)'
                                    },
                                    '&:active': {
                                        transform: 'translateY(0) scale(0.98)'
                                    },
                                    '&.Mui-disabled': {
                                        background: 'linear-gradient(135deg, #7986cb 0%, #9fa8da 100%)'
                                    }
                                }}
                            >
                                {loading ? (
                                    <CircularProgress
                                        size={24}
                                        sx={{
                                            color: 'white',
                                            animation: 'pulse 1.5s infinite'
                                        }}
                                    />
                                ) : (
                                    'Create Member'
                                )}
                            </Button>
                        </Box>
                    </Box>

                    {/* Enhanced Success/Error Notification */}
                    <Snackbar
                        open={!!error}
                        autoHideDuration={6000}
                        onClose={() => setError(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                        TransitionProps={{
                            direction: 'up',
                            timeout: { enter: 500, exit: 300 }
                        }}
                    >
                        <Alert
                            severity="error"
                            sx={{
                                width: '100%',
                                borderRadius: 2,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                animation: 'slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                '@keyframes slideIn': {
                                    from: { transform: 'translateY(100%)', opacity: 0 },
                                    to: { transform: 'translateY(0)', opacity: 1 }
                                }
                            }}
                            icon={false}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{
                                    background: 'rgba(255,255,255,0.2)',
                                    borderRadius: '50%',
                                    padding: 1,
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <Person sx={{ fontSize: 24 }} />
                                </Box>
                                {error}
                            </Box>
                        </Alert>
                    </Snackbar>
                </Box>
            </Box>
        </form>
    );
};

export default CreateMember;