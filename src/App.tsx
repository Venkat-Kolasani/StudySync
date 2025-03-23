
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Groups from "./pages/Groups";
import CreateGroup from "./pages/CreateGroup";
import NotFound from "./pages/NotFound";
import GroupDetails from "./pages/GroupDetails";
import Resources from "./pages/Resources";
import Sessions from "./pages/Sessions";
import TestGroupCreation from "./pages/TestGroupCreation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/groups/create" element={<CreateGroup />} />
              <Route path="/groups/:id" element={<GroupDetails />} />
              <Route path="/groups/:id/resources" element={<Resources />} />
              <Route path="/groups/:id/sessions" element={<Sessions />} />
              <Route path="/test-group" element={<TestGroupCreation />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
