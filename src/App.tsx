import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import CustomerLogin from "./pages/CustomerLogin.tsx";
import CustomerPortal from "./pages/CustomerPortal.tsx";
import MerchantLogin from "./pages/MerchantLogin.tsx";
import MerchantPortal from "./pages/MerchantPortal.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/customer/login" element={<CustomerLogin />} />
          <Route path="/customer/tickets" element={<CustomerPortal />} />
          <Route path="/customer/queries" element={<CustomerPortal />} />
          <Route path="/customer/plan" element={<CustomerPortal />} />
          <Route path="/merchant/login" element={<MerchantLogin />} />
          <Route path="/merchant/dashboard" element={<MerchantPortal />} />
          <Route path="/merchant/tickets" element={<MerchantPortal />} />
          <Route path="/merchant/knowledge-base" element={<MerchantPortal />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
