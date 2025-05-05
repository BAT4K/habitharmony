import React from 'react';
import confetti from 'canvas-confetti';
import { Trophy } from 'lucide-react';

const CelebrationPopup = ({ isOpen, onClose }) => {
  if (isOpen) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  return isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 animate-fade-in">
      <div className="bg-white rounded-2xl p-8 mx-4 max-w-sm text-center shadow-xl">
        <div className="bg-[#914938] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Trophy className="text-white w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#914938] mb-2">Congratulations!</h2>
        <p className="text-gray-600 mb-6 break-words">
          Goal completed!
        </p>
        <button
          onClick={onClose}
          className="bg-[#914938] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#813928] transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  ) : null;
};

export default CelebrationPopup;