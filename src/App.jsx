import './App.css';
import { Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense } from 'react';
import { ThemeContextProvider } from './contexts/ThemeContext';
import NavBar from "./components/NavBar";
import AuthGuard from "./components/AuthGuard";

// Lazy load components for better performance
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
const AssociationRegister = lazy(() => import("./components/AssociationRegister"));
const AssociationStatusCheck = lazy(() => import("./components/AssociationStatusCheck"));

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
        "/request/password_reset"
    ].includes(location.pathname) || location.pathname.includes("password-reset");

    return (
        <ThemeContextProvider>
            <div className="App">
                <Suspense fallback={<LoadingFallback />}>
                    {isAuthRoute ? (
                        <Routes>
                            {/* Authentication routes without navbar */}
                            <Route path="/" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/associationregister" element={<AssociationRegister />} />
                            <Route path="/association-status" element={<AssociationStatusCheck />} />
                            <Route path="/request/password_reset" element={<PasswordResetRequest />} />
                            <Route path="/password-reset/:token" element={<PasswordReset />} />
                        </Routes>
                    ) : (
                        <NavBar
                            content={
                                <Routes>
                                    {/* Protected routes with navbar */}
                                    <Route path="/home" element={<AuthGuard><Home /></AuthGuard>} />
                                    <Route path="/about" element={<AuthGuard><About /></AuthGuard>} />
                                    <Route path="/CreateProject" element={<AuthGuard><CreateProject /></AuthGuard>} />
                                    <Route path="/CreateMember" element={<AuthGuard><CreateMember /></AuthGuard>} />
                                    <Route path="/members" element={<AuthGuard><Members /></AuthGuard>} />
                                    <Route path="/projects" element={<AuthGuard><Projects /></AuthGuard>} />
                                    <Route path="/finance" element={<AuthGuard><Finance /></AuthGuard>} />
                                    <Route path="/projects/edit/:id" element={<AuthGuard><EditProject /></AuthGuard>} />
                                    <Route path="/projects/delete/:id" element={<AuthGuard><DeleteProject /></AuthGuard>} />
                                    <Route path="/member/edit/:id" element={<AuthGuard><EditMember /></AuthGuard>} />
                                    <Route path="/member/delete/:id" element={<AuthGuard><DeleteMember /></AuthGuard>} />
                                    <Route path="/member/editmember/:id" element={<AuthGuard><EditMember /></AuthGuard>} />
                                </Routes>
                            }
                        />
                    )}
                </Suspense>
            </div>
        </ThemeContextProvider>
    );
}

export default App;