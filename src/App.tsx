import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PaymentPage from './pages/PaymentPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pay/:id" element={<PaymentPage />} />
      </Routes>
    </BrowserRouter>
  );
}
