import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import MeetingsCalendar from './MeetingsCalendar';
import MeetingDetail from './MeetingDetail';
import MeetingCreateForm from './MeetingCreateForm';
import MeetingResponse from './MeetingResponse';
import ProtectedMeetingEdit from './ProtectedMeetingEdit';
import { PermissionGuard } from '../contexts/ConditionalUI';
import { RESOURCES, ACTIONS } from '../contexts/PermissionsContext';

/**
 * This component defines the routes for the meetings module
 * with proper permission guards
 */
const MeetingRoutes = () => {
    return (
        <Routes>
            {/* View calendar - All users can view */}
            <Route path="/" element={<MeetingsCalendar />} />

            {/* Create meeting - Only users with create permission */}
            <Route
                path="/create"
                element={
                    <PermissionGuard
                        resource={RESOURCES.MEETINGS}
                        action={ACTIONS.CREATE}
                        redirectTo="/meetings"
                    >
                        <MeetingCreateForm isEditMode={false} />
                    </PermissionGuard>
                }
            />

            {/* Edit meeting - Only users with edit permission */}
            <Route path="/edit/:id" element={<ProtectedMeetingEdit />} />

            {/* Meeting response - Anyone with the link */}
            <Route path="/response/:attendeeId/:token" element={<MeetingResponse />} />
            <Route path="/response/:attendeeId/:token/:responseType" element={<MeetingResponse />} />

            {/* View meeting details - All users can view (place this after other more specific routes) */}
            <Route path="/:id" element={<MeetingDetail />} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/meetings" replace />} />
        </Routes>
    );
};

export default MeetingRoutes;