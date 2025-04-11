import React from 'react';

const DrawingLogo: React.FC = () => {
  return (
    <h1 className="text-[100px] md:text-[150px] lg:text-[200px] xl:text-[250px] font-bold font-logo tracking-wider text-center">
      <span className="relative inline-block">
        <span className="relative z-10 inline-block px-1 bg-gradient-to-b from-yellow-300 to-orange-500 text-transparent bg-clip-text">D</span>
        <span className="absolute inset-0 z-0 px-1 text-black transform translate-x-[6px] translate-y-[6px]">D</span>
      </span>
      
      <span className="relative inline-block">
        <span className="relative z-10 inline-block px-1 bg-gradient-to-b from-yellow-300 to-orange-500 text-transparent bg-clip-text">R</span>
        <span className="absolute inset-0 z-0 px-1 text-black transform translate-x-[6px] translate-y-[6px]">R</span>
      </span>
      
      <span className="relative inline-block">
        <span className="relative z-10 inline-block px-1 bg-gradient-to-b from-yellow-300 to-orange-500 text-transparent bg-clip-text">A</span>
        <span className="absolute inset-0 z-0 px-1 text-black transform translate-x-[6px] translate-y-[6px]">A</span>
      </span>
      
      <span className="relative inline-block">
        <span className="relative z-10 inline-block px-1 bg-gradient-to-b from-yellow-300 to-orange-500 text-transparent bg-clip-text">W</span>
        <span className="absolute inset-0 z-0 px-1 text-black transform translate-x-[6px] translate-y-[6px]">W</span>
      </span>
      
      <span className="relative inline-block">
        <span className="relative z-10 inline-block px-1 bg-gradient-to-b from-red-400 to-red-700 text-transparent bg-clip-text">A</span>
        <span className="absolute inset-0 z-0 px-1 text-black transform translate-x-[6px] translate-y-[6px]">A</span>
      </span>
      
      <span className="relative inline-block">
        <span className="relative z-10 inline-block px-1 bg-gradient-to-b from-red-400 to-red-700 text-transparent bg-clip-text">I</span>
        <span className="absolute inset-0 z-0 px-1 text-black transform translate-x-[6px] translate-y-[6px]">I</span>
      </span>
      
      <span className="relative inline-block">
        <span className="relative z-10 inline-block px-1 bg-gradient-to-b from-yellow-300 to-orange-500 text-transparent bg-clip-text">N</span>
        <span className="absolute inset-0 z-0 px-1 text-black transform translate-x-[6px] translate-y-[6px]">N</span>
      </span>
      
      <span className="relative inline-block">
        <span className="relative z-10 inline-block px-1 bg-gradient-to-b from-yellow-300 to-orange-500 text-transparent bg-clip-text">G</span>
        <span className="absolute inset-0 z-0 px-1 text-black transform translate-x-[6px] translate-y-[6px]">G</span>
      </span>
    </h1>
  );
};

export default DrawingLogo;