// src/routes/index.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
// import LoginPage from '../pages/LoginPage';
// import GamePage from '../pages/GamePage';
// import ProfilePage from '../pages/ProfilePage';
// import LeaderboardPage from '../pages/LeaderboardPage';
// import NotFoundPage from '../pages/NotFoundPage';
// import MainLayout from '../components/layout/MainLayout';
// import { AuthProvider } from '../contexts/AuthContext';
// import { GameProvider } from '../contexts/GameContext';
// import ProtectedRoute from './ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    // element: <MainLayout />,
    // errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
    //   {
    //     path: 'login',
    //     element: <LoginPage />,
    //   },
    //   {
    //     path: 'game',
    //     element: (
    //       <ProtectedRoute>
    //         <GamePage />
    //       </ProtectedRoute>
    //     ),
    //   },
    //   {
    //     path: 'profile',
    //     element: (
    //       <ProtectedRoute>
    //         <ProfilePage />
    //       </ProtectedRoute>
    //     ),
    //   },
    //   {
    //     path: 'leaderboard',
    //     element: <LeaderboardPage />,
    //   },
    ],
  },
]);

export function AppRoutes() {
  return (
    <AuthProvider>
      <GameProvider>
        <RouterProvider router={router} />
      </GameProvider>
    </AuthProvider>
  );
}

