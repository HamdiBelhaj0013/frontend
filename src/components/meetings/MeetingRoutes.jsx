import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import MeetingsCalendar from './MeetingsCalendar';
import MeetingDetail from './MeetingDetail';
import MeetingCreateForm from './MeetingCreateForm';
import MeetingResponse from './MeetingResponse';
import ProtectedMeetingEdit from './ProtectedMeetingEdit';
import { PermissionGuard } from '/src/contexts/ConditionalUI.jsx';
import { RESOURCES, ACTIONS } from '/src/contexts/PermissionsContext.jsx';

/**
 * Ce composant définit les routes pour le module de réunions
 * avec des gardes de permission appropriés
 */
const MeetingRoutes = () => {
    return (
        <Routes>
            {/* Voir le calendrier - Tous les utilisateurs peuvent voir */}
            <Route path="/" element={<MeetingsCalendar />} />

            {/* Créer une réunion - Uniquement les utilisateurs avec permission de création */}
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

            {/* Modifier une réunion - Uniquement les utilisateurs avec permission de modification */}
            <Route path="/edit/:id" element={<ProtectedMeetingEdit />} />

            {/* Réponse à une réunion - Quiconque avec le lien */}
            <Route path="/response/:attendeeId/:token" element={<MeetingResponse />} />
            <Route path="/response/:attendeeId/:token/:responseType" element={<MeetingResponse />} />

            {/* Voir les détails d'une réunion - Tous les utilisateurs peuvent voir (placer ceci après d'autres routes plus spécifiques) */}
            <Route path="/:id" element={<MeetingDetail />} />

            {/* Redirection catch-all */}
            <Route path="*" element={<Navigate to="/meetings" replace />} />
        </Routes>
    );
};

export default MeetingRoutes;