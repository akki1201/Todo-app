import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const navigate = useNavigate();
  return (
    <div className="max-w-sm mx-auto h-screen flex flex-col bg-white">
      <div className="flex-1 bg-brand relative overflow-hidden flex items-end">
        <div className="absolute top-6 right-6 w-16 h-16 border-8 border-white/20 rounded-full" />
        <div className="absolute bottom-40 right-4 opacity-20 text-white text-4xl">〰️〰️</div>
      </div>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Manage What To Do</h1>
        <p className="text-sm text-gray-500 mb-6">
          The best way to manage what you have to do, don't forget your plans
        </p>
        <button
          onClick={() => navigate("/home")}
          className="w-full bg-brand text-white rounded-xl py-3 font-medium"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}