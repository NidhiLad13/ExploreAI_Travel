// components/auth/AuthModal.tsx
interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
  }

import { useState } from "react";
import LoginForm  from "./LoginForm";
import  SignupForm from "./SignupForm";

 const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 z-10"
          >
            ×
          </button>
          {isLogin ? (
            <LoginForm onToggleMode={() => setIsLogin(false)} />
          ) : (
            <SignupForm onToggleMode={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    );
  };


  export default AuthModal;