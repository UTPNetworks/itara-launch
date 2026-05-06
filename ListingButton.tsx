import React from 'react';

interface ListingButtonProps {
  onClick: () => void;
}

export default function ListingButton({ onClick }: ListingButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative px-4 py-2 text-white font-medium text-sm overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50"
    >
      {/* Animated Gradient Border */}
      <div className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 rounded-lg p-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-0 animate-pulse" />
      </div>

      {/* Background */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600/30 to-cyan-600/30 group-hover:from-purple-600/50 group-hover:to-cyan-600/50 transition-all" />

      {/* Content */}
      <div className="relative flex items-center gap-2">
        <span className="text-lg">✨</span>
        <span>+ Post a Listing</span>
      </div>

      {/* Hover Glow */}
      <div className="absolute inset-0 rounded-lg opacity-0 hover:opacity-20 transition-opacity duration-300 bg-gradient-to-r from-purple-400 to-cyan-400 blur-lg" />
    </button>
  );
}
