import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { RoomsPage } from "./pages/RoomsPage";
import { BookingPage } from "./pages/BookingPage";
import { GuestCalendarPage } from "./pages/GuestCalendarPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminLoginPage } from "./pages/admin/LoginPage";
import { CalendarPage } from "./pages/admin/CalendarPage";
import { PaymentsPage } from "./pages/admin/PaymentsPage";
import { KitchenPage } from "./pages/admin/KitchenPage";
import { ReportsPage } from "./pages/admin/ReportsPage";
import { MessagesPage } from "./pages/admin/MessagesPage";

const AdminPlaceholder = ({ title }: { title: string }) => (
  <div className="p-8 text-center">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p className="text-gray-500">This module is under development.</p>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "rooms", Component: RoomsPage },
      { path: "booking", Component: BookingPage },
      { path: "calendar", Component: GuestCalendarPage },
    ],
  },
  {
    path: "/admin",
    children: [
      { index: true, Component: AdminLoginPage },
      { path: "login", Component: AdminLoginPage },
      { 
        path: "dashboard",
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminDashboard },
          { path: "calendar", Component: CalendarPage },
          { path: "payments", Component: PaymentsPage },
          { path: "kitchen", Component: KitchenPage },
          { path: "messages", Component: MessagesPage },
          { path: "reports", Component: ReportsPage },
          { path: "settings", element: <AdminPlaceholder title="System Settings" /> },
        ]
      }
    ],
  },
]);
