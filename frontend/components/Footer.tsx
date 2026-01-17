'use client';

import { Social } from '@/lib/types';
import { Github, Linkedin, Mail } from 'lucide-react';

interface FooterProps {
  social?: Social;
}

export default function Footer({ social }: FooterProps) {
  if (!social || (!social.linkedin && !social.github && !social.email)) {
    return null;
  }

  return (
    <footer className="py-12 px-6 border-t border-white/5 glass-dark mt-20">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        <nav className="flex gap-8 mb-8">
          {social.linkedin && (
            <a
              href={social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-teal-accent transition-all duration-300"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          )}
          {social.github && (
            <a
              href={social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-teal-accent transition-all duration-300"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          )}
          {social.email && (
            <a
              href={`mailto:${social.email}`}
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-teal-accent transition-all duration-300"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
          )}
        </nav>
        <p className="text-gray-600 text-xs tracking-widest uppercase">
          © {new Date().getFullYear()} {social.ownerName || 'Portfolio'}
        </p>
      </div>
    </footer>
  );
}
