'use client';

import { useState, useEffect } from 'react';

export default function Header() {
  const [greeting, setGreeting] = useState('Hello');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  return (
    <header className="w-full py-4 px-6 border-b border-gray-800">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="text-gray-400 text-sm">
          {greeting}
        </div>
        <div className="flex gap-6 text-sm">
          <a
            href="https://docs.google.com/document/d/1VBj8NdGKL5xHQkESfxWHW6E-rZwVoWP9QrnUXFfTYXs/edit?usp=sharing"
            className="text-gray-300 hover:text-teal-accent transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Resume
          </a>
          <a
            href="mailto:info@kenrotaris.dev"
            className="text-gray-300 hover:text-teal-accent transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact
          </a>
        </div>
      </div>
    </header>
  );
}
