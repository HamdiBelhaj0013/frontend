import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Snackbar, Alert } from "@mui/material";
import { useForm } from 'react-hook-form';
import AxiosInstance from './Axios.jsx';
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MyDatePickerField from "./forms/MyDatePickerField.jsx";
import MyTextField from "./forms/MyTextField.jsx";
import MySelectField from "./forms/MySelectField.jsx";
import '../assets/Styles/CreateMember.css';

const EditMember = () => {
    const { id: MyId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

    useEffect(() => {
        const GetData = async () => {
            setLoading(true);
            try {
                const response = await AxiosInstance.get(`api/member/${MyId}/`);
                const data = response.data;
                reset({
                    ...data,
                    birth_date: data.birth_date ? dayjs(data.birth_date) : null,
                    joining_date: data.joining_date ? dayjs(data.joining_date) : null,
                });
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching member data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        GetData();
    }, [MyId, reset]);

    const submission = async (data) => {
        setLoading(true);
        setError(null);
        try {
            await AxiosInstance.put(`api/member/${MyId}/`, {
                ...data,
                birth_date: data.birth_date ? dayjs(data.birth_date).format('YYYY-MM-DD') : null,
                joining_date: data.joining_date ? dayjs(data.joining_date).format('YYYY-MM-DD') : null,
            });
            navigate('/members', { state: { success: true } });
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating member data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(submission)}>
            <Box sx={{
                maxWidth: 1200,
                margin: '0 auto',
                padding: 3,
            }}>
                {/* Header */}
                <Box className="header-animation" sx={{
                    display: "flex",
                    backgroundColor: '#1a237e',
                    marginBottom: 3,
                    padding: 3,
                    borderRadius: 2,
                    boxShadow: 4,
                    position: 'relative',
                    '&:after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -8,
                        left: '5%',
                        width: '90%',
                        height: 8,
                        backgroundColor: 'rgba(25, 118, 210, 0.2)',
                        borderRadius: '0 0 4px 4px'
                    }
                }}>
                    <Typography variant="h5" sx={{
                        color: "white",
                        fontWeight: 'bold',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                        Edit Member
                    </Typography>
                </Box>

                {/* Form Container */}
                <Box className="form-container" sx={{
                    backgroundColor: 'background.paper',
                    borderRadius: 4,
                    boxShadow: 3,
                    padding: { xs: 2, md: 4 },
                    position: 'relative',
                    overflow: 'hidden',
                    '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '4px',
                        height: '100%',
                        backgroundColor: '#1976d2',
                        transition: 'all 0.3s ease'
                    },
                    '&:hover:before': {
                        width: '6px',
                        backgroundColor: '#1565c0'
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
                                    transition: 'transform 0.3s ease',
                                    '&:hover': { transform: 'translateX(8px)' }
                                }}>
                                    <field.component
                                        label={field.label}
                                        name={field.name}
                                        control={control}
                                        placeholder={`Enter ${field.label.toLowerCase()}`}
                                        options={field.options || []}
                                        sx={{
                                            '& .Mui-focused': {
                                                transform: 'scale(1.02)',
                                                transition: 'transform 0.3s ease'
                                            }
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    ))}

                    {/* Submit Button */}
                    <Box sx={{
                        textAlign: "right",
                        marginTop: 4,
                        position: 'relative'
                    }}>
                        <Button
                            variant="contained"
                            type="submit"
                            disabled={loading}
                            className="transition-all"
                            sx={{
                                minWidth: 140,
                                padding: '12px 30px',
                                fontSize: 16,
                                backgroundColor: '#1976d2',
                                transformOrigin: 'center',
                                '&:hover': {
                                    backgroundColor: '#1565c0',
                                    transform: 'translateY(-2px) scale(1.05)',
                                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                                },
                                '&:active': {
                                    transform: 'translateY(0) scale(0.98)'
                                },
                                '&.Mui-disabled': {
                                    backgroundColor: '#90caf9',
                                    color: 'white'
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
                            ) : 'Save Changes'}
                        </Button>
                    </Box>
                </Box>

                {/* Error Notification */}
                <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          TransitionProps={{
                              direction: 'left',
                              timeout: { enter: 500, exit: 300 }
                          }}
                >
                    <Alert
                        severity="error"
                        sx={{
                            width: '100%',
                            boxShadow: 3,
                            transform: 'translateX(100%)',
                            animation: 'slideIn 0.5s forwards',
                            '@keyframes slideIn': {
                                from: { transform: 'translateX(100%)' },
                                to: { transform: 'translateX(0)' }
                            }
                        }}
                        variant="filled"
                    >
                        {error}
                    </Alert>
                </Snackbar>
            </Box>
        </form>
    );
};

export default EditMember;