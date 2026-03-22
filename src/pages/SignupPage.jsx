import { Zap } from 'lucide-react';
import SignupForm from '../components/auth/SignupForm';

const SignupPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-600/20">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Create your account
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Get started with Zestora in seconds
          </p>
        </div>

        {/* Form Card */}
        <div className="card p-6 sm:p-8">
          <SignupForm />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          Zestora — Workflow Automation Platform
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
