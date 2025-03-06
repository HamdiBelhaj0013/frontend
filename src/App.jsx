import './App.css';
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./components/Home";
import About from "./components/About";
import CreateProject from "./components/CreateProject.jsx";
import Members from "./components/Members";
import Projects from "./components/Projects";
import Finance from "./components/Finance";
import NavBar from "./components/NavBar";
import EditProject from "./components/EditProject.jsx";
import DeleteProject from "./components/DeleteProject.jsx";
import DeleteMember from "./components/DeleteMember.jsx";
import CreateMember from "./components/CreateMember.jsx";
import EditMember from "./components/EditMember.jsx";
import Register from "./components/Register";
import Login from "./components/Login";
import PasswordResetRequest from "./components/PasswordResetRequest";
import PasswordReset from "./components/PasswordReset";
import AuthGuard from "./components/AuthGuard"; // Import the AuthGuard

function App() {
    const myWidth = 220;  // Drawer width
    const location = useLocation();
    const noNavbar = location.pathname === "/" || location.pathname === "/register" || location.pathname.includes("password");

    return (
        <div className="App">
            {noNavbar ? (
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/request/password_reset" element={<PasswordResetRequest />} />
                    <Route path="/password-reset/:token" element={<PasswordReset />} />
                </Routes>
            ) : (
                <NavBar
                    drawerWidth={myWidth}
                    content={
                        <Routes>
                            <Route path="/home" element={<AuthGuard><Home /></AuthGuard>} />
                            <Route path="/about" element={<AuthGuard><About /></AuthGuard>} />
                            <Route path="/CreateProject" element={<AuthGuard><CreateProject /></AuthGuard>} />
                            <Route path="/CreateMember" element={<AuthGuard><CreateMember /></AuthGuard>} />
                            <Route path="/members" element={<AuthGuard><Members /></AuthGuard>} />
                            <Route path="/projects" element={<AuthGuard><Projects /></AuthGuard>} />
                            <Route path="/finance" element={<AuthGuard><Finance /></AuthGuard>} />
                            <Route path="/projects/edit/:id" element={<AuthGuard><EditProject /></AuthGuard>} />
                            <Route path="/projects/delete/:id" element={<AuthGuard><DeleteProject /></AuthGuard>} />
                            <Route path="/member/edit/:id" element={<AuthGuard><EditProject /></AuthGuard>} />
                            <Route path="/member/delete/:id" element={<AuthGuard><DeleteMember /></AuthGuard>} />
                            <Route path="/member/editmember/:id" element={<AuthGuard><EditMember /></AuthGuard>} />
                        </Routes>
                    }
                />
            )}
        </div>
    );
}

export default App;
