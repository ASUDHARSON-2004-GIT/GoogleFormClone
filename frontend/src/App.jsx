import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import FormBuilder from './pages/FormBuilder';
import FormView from './pages/FormView';
import FormResponses from './pages/FormResponses';
import Settings from './pages/Settings';
import ResponsesOverview from './pages/ResponsesOverview';

// Placeholders for now
// const FormBuilderPlaceholder = () => <div>Form Builder (Coming Soon)</div>;
// const FormViewPlaceholder = () => <div>Form View (Coming Soon)</div>;
// const FormResponsesPlaceholder = () => <div>Form Responses (Coming Soon)</div>;

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Navbar />
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/responses" element={<ProtectedRoute><ResponsesOverview /></ProtectedRoute>} />
          <Route path="/form/:id/edit" element={<ProtectedRoute><FormBuilder /></ProtectedRoute>} />
          <Route path="/form/:id" element={<FormView />} />
          <Route path="/form/:id/responses" element={<ProtectedRoute><FormResponses /></ProtectedRoute>} />
        </Routes>
      </div>
    </AuthProvider>

  );
}

export default App;
