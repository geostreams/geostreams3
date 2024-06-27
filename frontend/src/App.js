import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import UserProfile from './pages/UserProfile';

function App() {
    const [user, setUser] = useState(null); // null when not logged in

    const isAuthenticated = !!user;

    return (
        <Router>
            <Navbar isAuthenticated={isAuthenticated} user={user} />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login setUser={setUser} />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/profile" element={isAuthenticated ? <UserProfile user={user} /> : <Home />} />
            </Routes>
        </Router>
    );
}

export default App;
