import { Navigate, Route, Routes } from "react-router-dom";
import { RegistrationPortal } from "./registration-portal/RegistrationPortal";

export function App() {
  return (
    <Routes>
      <Route path="/registration-portal/*" element={<RegistrationPortal />} />
      <Route path="/" element={<Navigate to="/registration-portal/start" replace />} />
      <Route path="*" element={<Navigate to="/registration-portal/start" replace />} />
    </Routes>
  );
}
