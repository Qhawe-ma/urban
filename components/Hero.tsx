import React from 'react';
import { ArrowRight } from 'lucide-react';
import { HeroContent } from '../types';

interface HeroProps {
  content: HeroContent;
  onShopNow: () => void;
}

const Hero: React.FC<HeroProps> = ({ content, onShopNow }) => {
  return (
    <div className="relative bg-stone-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-stone-50 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 flex flex-col justify-center h-full min-h-[60vh] px-4 sm:px-6 lg:px-8">
          
          <main className="mt-10 mx-auto max-w-7xl sm:mt-12 md:mt-16 lg:mt-20 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-serif font-medium text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">{content.headlinePart1}</span>{' '}
                <span className="block text-urban-900 xl:inline">{content.headlinePart2}</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 font-light">
                {content.subheadline}
              </p>
              <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-sm shadow-sm">
                  <button
                    onClick={onShopNow}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-sm text-white bg-urban-900 hover:bg-gray-800 md:py-4 md:text-lg transition-all duration-300"
                  >
                    {content.buttonText} <ArrowRight className="ml-2 opacity-80" size={20} />
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover object-center sm:h-72 md:h-96 lg:w-full lg:h-full"
          src={content.image}
          alt="Hero Fashion"
        />
      </div>
    </div>
  );
};

export default Hero;