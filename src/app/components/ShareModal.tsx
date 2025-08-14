import React, { useState } from 'react';

interface ShareModalProps {
  open: boolean;
  url: string;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ open, url, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-xs mx-4 p-6 flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-2">اشتراک‌گذاری</h3>
        <input
          type="text"
          value={url}
          readOnly
          className="w-full mb-4 px-3 py-2 border rounded text-center text-gray-700 bg-gray-100 focus:outline-none"
        />
        <button
          onClick={handleCopy}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors w-full mb-2"
        >
          {copied ? 'کپی شد!' : 'کپی لینک'}
        </button>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-sm mt-2"
        >
          بستن
        </button>
      </div>
    </div>
  );
};

export default ShareModal;
