'use client';

import { useEffect, useState } from 'react';

interface TutorialModalProps {
  onClose: () => void;
}

export function TutorialModal({ onClose }: TutorialModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-puzzle-card border border-puzzle-border rounded-2xl p-6 max-w-xs w-full text-center">
        <h2 className="font-display text-xl text-white mb-4">How to Play</h2>
        
        {/* ゴールの図 */}
        <div className="flex justify-center mb-4">
          <div className="grid grid-cols-3 gap-1 p-2 bg-puzzle-border rounded-lg">
            {[1, 2, 3, 4, 5, 6, 7, 8, 0].map((num, i) => (
              <div
                key={i}
                className={`w-10 h-10 flex items-center justify-center rounded font-bold text-sm ${
                  num === 0
                    ? 'bg-black/30'
                    : 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white'
                }`}
              >
                {num !== 0 && num}
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-sm text-gray-300 mb-2">
          ↑ Goal
        </div>
        
        <p className="text-gray-400 text-sm mb-6">
          Swipe tiles to arrange<br />
          numbers in order (1→8)
        </p>
        
        <button
          onClick={onClose}
          className="btn-primary w-full"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}

// チュートリアル表示を管理するフック
export function useTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('slidepuzzle_tutorial_seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const closeTutorial = () => {
    localStorage.setItem('slidepuzzle_tutorial_seen', 'true');
    setShowTutorial(false);
  };

  const openTutorial = () => {
    setShowTutorial(true);
  };

  return { showTutorial, closeTutorial, openTutorial };
}
