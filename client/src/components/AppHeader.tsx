import { useState } from "react";

export default function AppHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.328.996.002 1.069c0 .54-.18 1.070-.504 1.5a2.5 2.5 0 01.142.548c.83.339.142.387.255.445l7 3a1 1 0 00.788 0l7-3a1 1 0 000-1.84l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            <h1 className="ml-2 text-xl font-bold text-primary-800">QuizGen</h1>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-primary font-medium">Home</a>
            <a href="#" className="text-gray-600 hover:text-primary font-medium">How it Works</a>
            <a href="#" className="text-gray-600 hover:text-primary font-medium">About</a>
            <a href="#" className="text-gray-600 hover:text-primary font-medium">Contact</a>
          </nav>
          
          <div className="flex items-center">
            <button 
              className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden py-3 pb-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2">
              <a href="#" className="text-primary font-medium px-2 py-1">Home</a>
              <a href="#" className="text-gray-600 hover:text-primary font-medium px-2 py-1">How it Works</a>
              <a href="#" className="text-gray-600 hover:text-primary font-medium px-2 py-1">About</a>
              <a href="#" className="text-gray-600 hover:text-primary font-medium px-2 py-1">Contact</a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
