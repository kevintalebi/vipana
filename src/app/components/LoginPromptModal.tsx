import React from 'react';

interface LoginPromptModalProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

const LoginPromptModal: React.FC<LoginPromptModalProps> = ({ open, onClose, message }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-xs mx-4 p-6 flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-2">ابتدا وارد شوید</h3>
        <p className="text-gray-600 mb-4 text-center">{message || 'برای ادامه، ابتدا وارد حساب کاربری خود شوید.'}</p>
        <button
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors w-full"
        >
          بستن
        </button>
      </div>
    </div>
  );
};

export default LoginPromptModal;
