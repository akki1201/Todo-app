import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Search from "./pages/Search";
import AllTasks from "./pages/AllTasks";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/all-tasks" element={<AllTasks />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;