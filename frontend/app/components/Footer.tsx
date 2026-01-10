import { Social } from '@/lib/types';

interface FooterProps {
  social: Social;
}

export default function Footer({ social }: FooterProps) {
  return (
    <footer className="py-12 px-6 border-t border-gray-800 mt-16">
      <div className="max-w-6xl mx-auto text-center">
        <nav className="flex gap-8 justify-center mb-6">
          <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-teal-accent transition-colors text-sm">
            LinkedIn
          </a>
          <a href={social.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-teal-accent transition-colors text-sm">
            GitHub
          </a>
          <a href={`mailto:${social.email}`} className="text-gray-400 hover:text-teal-accent transition-colors text-sm">
            Email
          </a>
        </nav>
        <p className="text-gray-500 text-xs">
          Copyright © {new Date().getFullYear()} - Ken Rotaris
        </p>
      </div>
    </footer>
  );
}
