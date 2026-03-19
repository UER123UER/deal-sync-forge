import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import Transactions from "@/pages/Transactions";
import NewDeal from "@/pages/NewDeal";
import DealDetail from "@/pages/DealDetail";
import FormEditor from "@/pages/FormEditor";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/transactions" replace />} />
          <Route element={<AppLayout />}>
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transactions/new" element={<NewDeal />} />
            <Route path="/transactions/:id" element={<DealDetail />} />
            <Route path="/transactions/:id/form/:formId" element={<FormEditor />} />
            <Route path="/listings" element={<div className="flex-1 flex items-center justify-center text-muted-foreground">Listings — Coming soon</div>} />
            <Route path="/open-house" element={<div className="flex-1 flex items-center justify-center text-muted-foreground">Open House — Coming soon</div>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
