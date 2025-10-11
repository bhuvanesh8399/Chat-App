import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Chat from "./pages/Chat.jsx";
import { api } from "./services/api.js";
import { getClient, disconnectClient } from "./services/websocket.js";
import { saveToken, getToken, clearToken } from "./services/storage.js";

export const AuthContext = React.createContext({ user: null });

function Protected({ children }) {
  const { user } = React.useContext(AuthContext);
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const ctx = useMemo(() => ({ user, setUser }), [user]);

  useEffect(() => {
    const jwt = getToken();
    if (!jwt) return;
    api.setJwt(jwt);
    api.me()
      .then((u) => { setUser(u); getClient(jwt); })
      .catch(() => { clearToken(); setUser(null); navigate("/login", { replace: true }); });
    return () => disconnectClient();
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { initMessaging } = await import("./services/firebase.js");
        await initMessaging();
      } catch {}
    })();
  }, [user]);

  return (
    <AuthContext.Provider value={ctx}>
      <Routes>
        <Route path="/" element={<Protected><Chat /></Protected>} />
        <Route path="/login" element={
          <Login onLogin={(u, jwt) => {
            saveToken(jwt); api.setJwt(jwt); setUser(u); getClient(jwt); navigate("/", { replace: true });
          }}/>
        }/>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthContext.Provider>
  );
}
