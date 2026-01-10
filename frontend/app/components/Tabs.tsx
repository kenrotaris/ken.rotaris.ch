'use client';

import { useState } from 'react';
import { TimelineItem } from '@/lib/types';
import Projects from './Projects';
import Experience from './Experience';
import Education from './Education';

interface TabsProps {
  projects: TimelineItem[];
  experience: TimelineItem[];
  education: TimelineItem[];
}

export default function Tabs({ projects, experience, education }: TabsProps) {
  const [active, setActive] = useState<'projects' | 'experience' | 'education'>('projects');

  const tabClass = (isActive: boolean) =>
    `px-6 py-2 text-sm font-medium uppercase tracking-wide transition-all ${
      isActive ? 'bg-teal-accent text-dark-bg' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
    }`;

  return (
    <div className="py-8 px-6 max-w-6xl mx-auto">
      <div className="flex gap-2 mb-10 justify-center">
        <button className={tabClass(active === 'projects')} onClick={() => setActive('projects')}>
          Projects
        </button>
        <button className={tabClass(active === 'experience')} onClick={() => setActive('experience')}>
          Experience
        </button>
        <button className={tabClass(active === 'education')} onClick={() => setActive('education')}>
          Education
        </button>
      </div>

      <div>
        {active === 'projects' && <Projects items={projects} />}
        {active === 'experience' && <Experience items={experience} />}
        {active === 'education' && <Education items={education} />}
      </div>
    </div>
  );
}
