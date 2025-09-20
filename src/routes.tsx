import { createBrowserRouter } from 'react-router-dom';
import MainApp from '@/components/MainApp';
import TripPlanner from '@/components/TripPlanner';
import UserDashboard from '@/components/UserDashboard';

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainApp />,
    children: [
      {
        path: "",
        element: null, // This will render the home content from MainApp
      },
      {
        path: "planner",
        element: <TripPlanner />,
      },
      {
        path: "planner/:id",
        element: <TripPlanner />,
      },
      {
        path: "dashboard",
        element: <UserDashboard />,
      },
    ],
  },
]);

export default router;
