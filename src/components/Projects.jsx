import { React, useEffect, useMemo, useState } from 'react';
import AxiosInstance from './Axios.jsx';
import { MaterialReactTable } from 'material-react-table';
import Dayjs from "dayjs";
import { Box, IconButton, Typography, Button, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';

const Projects = () => {
    // State initialization
    const [myData, setMyData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Function to fetch data
    const GetData = () => {
        AxiosInstance.get('api/project/')
            .then((res) => {
                setTimeout(() => { // Adding a delay of 1 seconds
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
                accessorKey: 'status',
                header: 'Status',
                size: 150,
            },
            {
                accessorKey: 'description',
                header: 'Description',
                size: 200,
            },
            {
                accessorKey: 'budget',
                header: 'Budget',
                size: 150,
            },
            {
                accessorFn: (row) => Dayjs(row.start_date).format('DD-MM-YYYY'),
                header: 'Start Date',
                size: 150,
            },
            {
                accessorFn: (row) => Dayjs(row.end_date).format('DD-MM-YYYY'),
                header: 'End Date',
                size: 150,
            }
        ],
        []
    );

    // Render the component
    return (
        <div>
            {/* Enhanced Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h2" fontWeight="bold">
                    Projects Management
                </Typography>
                <Button variant="contained" color="primary" component={Link} to="/CreateProject">
                    + Add New Project
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
                            <IconButton color="secondary" component={Link} to={`/projects/edit/${row.original.id}`} title="EditProject Project">
                                <EditIcon />
                            </IconButton>
                            <IconButton color="error" component={Link} to={`/projects/delete/${row.original.id}`} title="DeleteProject Project">
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    )}
                />
            )}
        </div>
    );
};

export default Projects;
