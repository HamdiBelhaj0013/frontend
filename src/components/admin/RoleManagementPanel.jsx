import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, Check, AlertCircle, ChevronUp, UserPlus } from 'lucide-react';

const RoleManagementPanel = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAssociation, setSelectedAssociation] = useState(null);
    const [associations, setAssociations] = useState([]);
    const [sortBy, setSortBy] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Fetch users, roles, and associations
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token'); // Get authentication token
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                };

                // Fetch all required data
                const [usersRes, rolesRes, associationsRes] = await Promise.all([
                    fetch('/api/users/', { headers }).then(res => {
                        if (!res.ok) throw new Error('Failed to fetch users');
                        return res.json();
                    }),
                    fetch('/api/roles/', { headers }).then(res => {
                        if (!res.ok) throw new Error('Failed to fetch roles');
                        return res.json();
                    }),
                    fetch('/api/associations/', { headers }).then(res => {
                        if (!res.ok) throw new Error('Failed to fetch associations');
                        return res.json();
                    })
                ]);

                setUsers(usersRes);
                setRoles(rolesRes);
                setAssociations(associationsRes);
                setLoading(false);
            } catch (err) {
                setError('Failed to load data. Please try again.');
                setLoading(false);
                console.error('Error fetching data:', err);
            }
        };

        fetchData();
    }, []);

    // Filter and sort users
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAssociation = selectedAssociation ?
            user.association?.id === selectedAssociation :
            true;
        return matchesSearch && matchesAssociation;
    });

    // Sort users
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        let aValue, bValue;

        if (sortBy === 'name') {
            aValue = a.full_name || a.email || '';
            bValue = b.full_name || b.email || '';
        } else if (sortBy === 'email') {
            aValue = a.email || '';
            bValue = b.email || '';
        } else if (sortBy === 'role') {
            aValue = a.role?.name || '';
            bValue = b.role?.name || '';
        } else if (sortBy === 'association') {
            aValue = a.association?.name || '';
            bValue = b.association?.name || '';
        }

        // Handle sort direction
        return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
    });

    // Handle sort change
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDirection('asc');
        }
    };

    // Handle role assignment
    const handleRoleChange = async (userId, roleId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/users/${userId}/assign_role/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify({ role_id: roleId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to assign role');
            }

            // Update the user in state
            setUsers(prev =>
                prev.map(user =>
                    user.id === userId
                        ? { ...user, role: roles.find(r => r.id === roleId) }
                        : user
                )
            );

            showNotification('Role assigned successfully!', 'success');
        } catch (err) {
            showNotification(err.message || 'Failed to assign role', 'error');
            console.error('Error assigning role:', err);
        }
    };

    // Show notification
    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    // Render loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-blue-600 text-lg">Loading...</div>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-600 text-lg flex items-center">
                    <AlertCircle className="mr-2" size={24} />
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">User Role Management</h1>

            {/* Filter Controls */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="w-full md:w-64">
                    <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={selectedAssociation || ''}
                        onChange={(e) => setSelectedAssociation(e.target.value ? parseInt(e.target.value) : null)}
                    >
                        <option value="">All Associations</option>
                        {associations.map(assoc => (
                            <option key={assoc.id} value={assoc.id}>{assoc.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                    <tr>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('name')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Full Name</span>
                                {sortBy === 'name' && (
                                    sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                )}
                            </div>
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('email')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Email</span>
                                {sortBy === 'email' && (
                                    sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                )}
                            </div>
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('association')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Association</span>
                                {sortBy === 'association' && (
                                    sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                )}
                            </div>
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('role')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Current Role</span>
                                {sortBy === 'role' && (
                                    sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                )}
                            </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Assign Role
                        </th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {sortedUsers.length > 0 ? (
                        sortedUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {user.full_name || 'N/A'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {user.association?.name || 'N/A'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium">
                                        {user.role ? (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user.role.name.charAt(0).toUpperCase() + user.role.name.slice(1)}
                        </span>
                                        ) : (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          No Role
                        </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        className="text-sm rounded border border-gray-300 p-1"
                                        value={user.role?.id || ''}
                                        onChange={(e) => handleRoleChange(user.id, parseInt(e.target.value))}
                                    >
                                        <option value="">No Role</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>
                                                {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                No users found
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Statistics */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-blue-800">Total Users</h3>
                    <p className="text-3xl font-bold text-blue-600">{users.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-green-800">Role Distribution</h3>
                    <div className="text-sm text-green-600 space-y-1 mt-2">
                        {roles.map(role => {
                            const count = users.filter(user => user.role?.id === role.id).length;
                            return (
                                <div key={role.id} className="flex justify-between">
                                    <span>{role.name.charAt(0).toUpperCase() + role.name.slice(1)}:</span>
                                    <span>{count}</span>
                                </div>
                            );
                        })}
                        <div className="flex justify-between">
                            <span>No Role:</span>
                            <span>{users.filter(user => !user.role).length}</span>
                        </div>
                    </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-purple-800">Associations</h3>
                    <p className="text-3xl font-bold text-purple-600">{associations.length}</p>
                </div>
            </div>

            {/* Notification */}
            {notification.show && (
                <div
                    className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg flex items-center ${
                        notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                >
                    {notification.type === 'success' ? (
                        <Check className="mr-2 flex-shrink-0" size={18} />
                    ) : (
                        <AlertCircle className="mr-2 flex-shrink-0" size={18} />
                    )}
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default RoleManagementPanel;