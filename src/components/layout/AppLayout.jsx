import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const AppLayout = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
    <Navbar />
    <main className="container mx-auto px-4 py-6">
      <Outlet />
    </main>
  </div>
);

export default AppLayout;
