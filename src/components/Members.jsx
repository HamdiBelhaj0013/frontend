import { React, useEffect, useMemo, useState } from 'react';
import AxiosInstance from './Axios.jsx';
import { MaterialReactTable } from 'material-react-table';
import Dayjs from "dayjs";
import { Box, IconButton, Typography, Button, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';

const Members = () => {
    // State initialization
    const [myData, setMyData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Function to fetch data
    const GetData = () => {
        AxiosInstance.get('api/member/')  // Updated the API endpoint to fetch members
            .then((res) => {
                setTimeout(() => { // Adding a delay of 1 second
                    setMyData(res.data);
                    console.log(res.data);
                    setLoading(false);
                }, 1000);
            })
            .catch((err) => {
                console.error(err);
                setTimeout(() => setLoading(false), 1500); // Ensure error state also waits before stopping the spinner
            });
    };

    // Fetch data on component mount
    useEffect(() => {
        GetData();
    }, []);

    // Columns configuration for the table
    const columns = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: 'Name',
                size: 150,
            },
            {
                accessorKey: 'address',
                header: 'Address',
                size: 200,
            },
            {
                accessorKey: 'email',  // Email field for members
                header: 'Email',
                size: 200,
            },
            {
                accessorKey: 'job',  // Job field for members
                header: 'Job',
                size: 150,
            },
            {
                accessorKey: 'nationality',  // Nationality field for members
                header: 'Nationality',
                size: 150,
            },
            {
                accessorFn: (row) => Dayjs(row.birth_date).format('DD-MM-YYYY'),  // Birth Date
                header: 'Birth Date',
                size: 150,
            },
            {
                accessorFn: (row) => Dayjs(row.joining_date).format('DD-MM-YYYY'),  // Joining Date
                header: 'Joining Date',
                size: 150,
            },
            {
                accessorKey: 'role',
                header: 'Role',
                size: 150,
            },
        ],
        []
    );

    // Render the component
    return (
        <div>
            {/* Enhanced Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h2" fontWeight="bold">
                    Members Management
                </Typography>
                <Button variant="contained" color="primary" component={Link} to="/CreateMember">
                    + Add New Member
                </Button>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress size={50} color="primary" />
                </Box>
            ) : (
                <MaterialReactTable
                    columns={columns}
                    data={myData}
                    enableRowActions
                    renderRowActions={({ row }) => (
                        <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
                            <IconButton color="secondary" component={Link} to={`/member/editmember/${row.original.id}`} title="EditProject Member">
                                <EditIcon />
                            </IconButton>
                            <IconButton color="error" component={Link} to={`/member/delete/${row.original.id}`} title="DeleteProject Member">
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    )}
                />
            )}
        </div>
    );
};

export default Members;
