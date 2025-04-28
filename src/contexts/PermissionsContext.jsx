import React, { createContext, useContext, useState, useEffect } from 'react';
import Axios from '../components/Axios.jsx';

// This maps frontend resource names to backend permission resource types
const RESOURCE_MAPPING = {
    'projects': 'projects',
    'members': 'members',
    'finance': 'finance',
    'tasks': 'tasks',
    'meetings': 'meetings',
    'reports': 'reports',
    'pendingUsers': 'members', // Maps to members with VALIDATE_USER permission
    'chatbot': 'chatbot'
};

// Create the permissions context
const PermissionsContext = createContext({
    userRole: null,
    isSuperuser: false,
    permissions: {},
    can: () => false,
    canValidateUsers: false,
    isLoading: true
});

export const usePermissions = () => useContext(PermissionsContext);

export const PermissionsProvider = ({ children }) => {
    const [userRole, setUserRole] = useState(null);
    const [isSuperuser, setIsSuperuser] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [permissions, setPermissions] = useState({});
    const [canValidateUsers, setCanValidateUsers] = useState(false);

    // Fetch user profile and set permissions
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('Token') || localStorage.getItem('token');
                if (!token) {
                    setIsLoading(false);
                    return;
                }

                const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
                Axios.defaults.headers.common['Authorization'] = authHeader;

                const response = await Axios.get('/users/profile/');
                const userData = response.data;

                // Set user role and superuser status
                setUserRole(userData.role?.name?.toLowerCase() || null);
                setIsSuperuser(userData.is_superuser || false);

                // Build permissions object based on role
                const userPermissions = {};

                // For superusers, grant all permissions
                if (userData.is_superuser) {
                    Object.keys(RESOURCE_MAPPING).forEach(resource => {
                        userPermissions[resource] = ['view', 'create', 'edit', 'delete'];
                    });
                    setCanValidateUsers(true);
                }
                // For regular users, fetch their role-based permissions
                else if (userData.role) {
                    const roleName = userData.role.name.toLowerCase();

                    // This could be optionally replaced with an API endpoint that returns permissions
                    // For now, we're using the static permissions mapping based on role
                    setCanValidateUsers(['president', 'treasurer', 'secretary'].includes(roleName));

                    // Map permissions based on your backend structure
                    for (const [frontendResource, backendResource] of Object.entries(RESOURCE_MAPPING)) {
                        userPermissions[frontendResource] = [];

                        // Add view permission based on role - follow your backend ROLE_PERMISSIONS logic
                        if (['president', 'treasurer', 'secretary', 'member'].includes(roleName)) {
                            if (backendResource !== 'reports' || roleName !== 'member') {
                                userPermissions[frontendResource].push('view');
                            }
                        }

                        // Add create, edit, delete permissions based on role
                        if (roleName === 'president') {
                            userPermissions[frontendResource].push('create', 'edit', 'delete');
                        } else if (roleName === 'treasurer' && ['finance', 'reports'].includes(backendResource)) {
                            userPermissions[frontendResource].push('create', 'edit', 'delete');
                        } else if (roleName === 'secretary' && ['tasks', 'meetings', 'reports'].includes(backendResource)) {
                            userPermissions[frontendResource].push('create', 'edit', 'delete');
                        }

                        // Special case for meetings creation
                        if (roleName === 'treasurer' && backendResource === 'meetings') {
                            userPermissions[frontendResource].push('create');
                        }
                    }
                }

                setPermissions(userPermissions);
            } catch (error) {
                console.error('Error fetching user permissions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    // Helper function to check if a user has a specific permission
    const can = (action, resource) => {
        if (isLoading) return false;
        if (isSuperuser) return true;

        // Special case for validating users
        if (action === 'validate_user' && resource === 'members') {
            return canValidateUsers;
        }

        return permissions[resource]?.includes(action) || false;
    };

    return (
        <PermissionsContext.Provider
            value={{
                userRole,
                isSuperuser,
                permissions,
                can,
                canValidateUsers,
                isLoading
            }}
        >
            {children}
        </PermissionsContext.Provider>
    );
};

export default PermissionsContext;