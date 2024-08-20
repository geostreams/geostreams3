import { useContext, createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
const AuthContext = createContext();
import axios from "axios";
// Code source - https://dev.to/miracool/how-to-manage-user-authentication-with-react-js-3ic5

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null when not logged in
  const [token, setToken] = useState(
    localStorage.getItem("GeostreamsToken") || "",
  );
  const navigate = useNavigate();

  // Login function
  const loginAction = async (data) => {
    try {
      const response = await axios.post(
        "http://localhost:9007/auth/login/",
        data,
      );
      if (response.status === 200) {
        setUser(response.data.user);
        setToken(response.data.token);
        localStorage.setItem("GeostreamsToken", response.data.token);
        navigate("/profile");
      }
    } catch (err) {
      // console.error("Login error:", err);
      if (err.response.status === 400 && err.response) {
        return `Error- ${err.response.data.non_field_errors[0]}`;
      }
    }
  };

  const logoutAction = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("GeostreamsToken");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ token, user, loginAction, logoutAction }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
