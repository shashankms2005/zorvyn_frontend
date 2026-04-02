import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const PermissionDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-base-950 text-center">
      <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
        <ShieldAlert size={40} className="text-red-500" />
      </div>
      
      <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
      <p className="text-gray-400 max-w-md mb-8">
        You do not have the required permissions to access this task or page. Please contact your administrator if you believe this is an error.
      </p>

      <button
        onClick={() => navigate('/')}
        className="btn-primary !w-auto px-6 inline-flex items-center space-x-2"
      >
        <ArrowLeft size={18} />
        <span>Back to Dashboard</span>
      </button>
    </div>
  );
};

export default PermissionDenied;
