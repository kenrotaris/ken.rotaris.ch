'use client';

import { useState, useEffect } from 'react';
import { Mail, FileText } from 'lucide-react';
import { formatGreeting, formatDateTime } from '@/lib/utils';

interface HeaderProps {
  email?: string;
  resumeUrl?: string;
  hidden: boolean;
  timezone?: string;
}

export default function Header({ email, resumeUrl, hidden, timezone = 'UTC' }: HeaderProps) {
  const [greeting, setGreeting] = useState('Hello');
  const [time, setTime] = useState('');

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setGreeting(formatGreeting(now));
      setTime(formatDateTime(now, timezone));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 py-4 px-4 md:px-6 glass-dark glass-border border-b transition-all duration-500 transform ${hidden ? 'opacity-0 -translate-y-full pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex flex-col">
          <div className="text-gray-200 text-xs font-bold tracking-[0.2em] uppercase truncate hidden sm:block" suppressHydrationWarning>
            {greeting}
          </div>
          <div className="text-[10px] theme-transition font-mono text-gray-500 font-medium tracking-widest mt-0.5 opacity-60 hidden sm:block" suppressHydrationWarning>
            {time}
          </div>
        </div>
        <div className="flex gap-6 md:gap-8 items-center">
          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-xs md:text-sm font-medium text-gray-400 hover:text-teal-accent transition-colors tracking-wide uppercase"
            >
              <FileText className="w-4 h-4" />
              <span>Resume</span>
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="group flex items-center gap-2 text-xs md:text-sm font-medium text-gray-400 hover:text-teal-accent transition-colors tracking-wide uppercase"
            >
              <Mail className="w-4 h-4" />
              <span>Contact</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
