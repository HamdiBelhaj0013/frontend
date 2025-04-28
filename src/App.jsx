import './App.css';
import { Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense } from 'react';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { PermissionsProvider } from './contexts/PermissionsContext.jsx';
import NavBar from "./components/NavBar";
import AuthGuard from "./components/AuthGuard";
import PermissionGuard from "./Contexts/PermissionGuard";
import { BrowserRouter as Router } from 'react-router-dom';
import MeetingResponse from './components/meetings/MeetingResponse.jsx';

const PendingUsers = lazy(() => import("./components/PendingUsers"));
const Home = lazy(() => import("./components/Home"));
const About = lazy(() => import("./components/About"));
const CreateProject = lazy(() => import("./components/CreateProject"));
const Members = lazy(() => import("./components/Members"));
const Projects = lazy(() => import("./components/Projects"));
const Finance = lazy(() => import("./components/Finance"));
const EditProject = lazy(() => import("./components/EditProject"));
const DeleteProject = lazy(() => import("./components/DeleteProject"));
const DeleteMember = lazy(() => import("./components/DeleteMember"));
const CreateMember = lazy(() => import("./components/CreateMember"));
const EditMember = lazy(() => import("./components/EditMember"));
const Register = lazy(() => import("./components/Register"));
const Login = lazy(() => import("./components/Login"));
const PasswordResetRequest = lazy(() => import("./components/PasswordResetRequest"));
const PasswordReset = lazy(() => import("./components/PasswordReset"));
const AssociationRegister = lazy(() => import("./components/AssociationRegister.jsx"));
const AssociationStatusCheck = lazy(() => import("./components/AssociationStatusCheck"));
const NGOChatbot = lazy(() => import("./components/NGOChatbot"));
import MeetingsCalendar from './components/meetings/MeetingsCalendar';
import MeetingDetail from './components/meetings/MeetingDetail';
import MeetingCreateForm from './components/meetings/MeetingCreateForm';

// Loading fallback component
const LoadingFallback = () => (
    <div className="loading-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
    }}>
        <div className="loading-spinner"></div>
    </div>
);

function App() {
    const location = useLocation();
    const isAuthRoute = [
            "/",
            "/associationregister",
            "/association-status",
            "/login",
            "/register",
            "/request/password_reset",
        ].includes(location.pathname) ||
        location.pathname.includes("password-reset") ||
        location.pathname.includes("meetings/response"); // Added for meeting response pages

    return (
        <ThemeContextProvider>
            <PermissionsProvider>
                <div className="App">
                    <Suspense fallback={<LoadingFallback />}>
                        {isAuthRoute ? (
                            <Routes>
                                {/* Authentication routes and public chatbot without navbar */}
                                <Route path="/" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/associationregister" element={<AssociationRegister />} />
                                <Route path="/association-status" element={<AssociationStatusCheck />} />
                                <Route path="/request/password_reset" element={<PasswordResetRequest />} />
                                <Route path="/password-reset/:token" element={<PasswordReset />} />

                                {/* Meeting response routes - no auth needed */}
                                <Route path="/meetings/response/:attendeeId/:token" element={<MeetingResponse />} />
                                <Route path="/meetings/response/:attendeeId/:token/:responseType" element={<MeetingResponse />} />

                                {/* Public chatbot route that doesn't require authentication */}
                                <Route path="/chatbot" element={<NGOChatbot />} />
                            </Routes>
                        ) : (
                            <NavBar
                                content={
                                    <Routes>
                                        {/* Protected routes with navbar - with permission guards */}
                                        <Route path="/home" element={<AuthGuard><Home /></AuthGuard>} />
                                        <Route path="/about" element={<AuthGuard><About /></AuthGuard>} />

                                        {/* Projects routes with permissions */}
                                        <Route path="/CreateProject" element={
                                            <AuthGuard>
                                                <PermissionGuard resource="projects" action="create">
                                                    <CreateProject />
                                                </PermissionGuard>
                                            </AuthGuard>
                                        } />
                                        <Route path="/projects" element={
                                            <AuthGuard>
                                                <PermissionGuard resource="projects" action="view">
                                                    <Projects />
                                                </PermissionGuard>
                                            </AuthGuard>
                                        } />
                                        <Route path="/projects/edit/:id" element={
                                            <AuthGuard>
                                                <PermissionGuard resource="projects" action="edit">
                                                    <EditProject />
                                                </PermissionGuard>
                                            </AuthGuard>
                                        } />
                                        <Route path="/projects/delete/:id" element={
                                            <AuthGuard>
                                                <PermissionGuard resource="projects" action="delete">
                                                    <DeleteProject />
                                                </PermissionGuard>
                                            </AuthGuard>
                                        } />

                                        {/* Members routes with permissions */}
                                        <Route path="/CreateMember" element={
                                            <AuthGuard>
                                                <PermissionGuard resource="members" action="create">
                                                    <CreateMember />
                                                </PermissionGuard>
                                            </AuthGuard>
                                        } />
                                        <Route path="/members" element={
                                            <AuthGuard>
                                                <PermissionGuard resource="members" action="view">
                                                    <Members />
                                                </PermissionGuard>
                                            </AuthGuard>
                                        } />
                                        <Route path="/member/edit/:id" element={
                                            <AuthGuard>
                                                <PermissionGuard resource="members" action="edit">
                                                    <EditMember />
                                                </PermissionGuard>
                                            </AuthGuard>
                                        } />
                                        <Route path="/member/delete/:id" element={
                                            <AuthGuard>
                                                <PermissionGuard resource="members" action="delete">
                                                    <DeleteMember />
                                                </PermissionGuard>
                                            </AuthGuard>
                                        } />
                                        <Route path="/member/editmember/:id" element={
                                            <AuthGuard>
                                                <PermissionGuard resource="members" action="edit">
                                                    <EditMember />
                                                </PermissionGuard>
                                            </AuthGuard>
                                        } />

                                        {/* Finance route with permission */}
                                        <Route path="/finance" element={
                                            <AuthGuard>
                                                <PermissionGuard resource="finance" action="view">
                                                    <Finance />
                                                </PermissionGuard>
                                            </AuthGuard>
                                        } />

                                        {/* Chatbot route with permission */}
                                        <Route path="/chatbot" element={
                                            <AuthGuard>
                                                <PermissionGuard resource="chatbot" action="view">
                                                    <NGOChatbot />
                                                </PermissionGuard>
                                            </AuthGuard>
                                        } />

                                        {/* Pending Users route with special validate_user permission */}
                                        <Route path="/pending-users" element={
                                            <AuthGuard>
                                                <PermissionGuard resource="members" action="validate_user">
                                                    <PendingUsers />
                                                </PermissionGuard>
                                            </AuthGuard>
                                        } />

                                        {/* Meeting routes with permissions */}
                                        <Route path="/meetings" element={
                                            <AuthGuard>
                                                <PermissionGuard resource="meetings" action="view">
                                                    <MeetingsCalendar />
                                                </PermissionGuard>
                                            </AuthGuard>
                                        } />
                                        <Route path="/meetings/create" element={
                                            <AuthGuard>
                                                <PermissionGuard resource="meetings" action="create">
                                                    <MeetingCreateForm />
                                                </PermissionGuard>
                                            </AuthGuard>
                                        } />
                                        <Route path="/meetings/:id" element={
                                            <AuthGuard>
                                                <PermissionGuard resource="meetings" action="view">
                                                    <MeetingDetail />
                                                </PermissionGuard>
                                            </AuthGuard>
                                        } />
                                    </Routes>
                                }
                            />
                        )}
                    </Suspense>
                </div>
            </PermissionsProvider>
        </ThemeContextProvider>
    );
}

export default App;