import Image from 'next/image';
import { About as AboutType } from '@/lib/types';

interface AboutProps {
  data: AboutType;
}

export default function About({ data }: AboutProps) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1 bg-gray-800 text-gray-300 text-xs uppercase tracking-wider rounded">
            About Me
          </span>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-3 text-teal-accent tracking-wide">
            {data.name}
          </h1>
          <p className="text-xl text-gray-400">{data.title}</p>
        </div>

        <div className="flex flex-col items-center gap-10">
          <div className="w-56 h-56 rounded-full overflow-hidden ring-4 ring-teal-accent ring-offset-4 ring-offset-dark-bg">
            <Image
              src={data.profileImage}
              alt={data.name}
              width={224}
              height={224}
              className="object-cover"
              priority
            />
          </div>

          <div className="max-w-2xl text-center">
            <p className="text-base leading-relaxed text-gray-300 mb-8">
              {data.bio}
            </p>

            <div className="flex gap-4 justify-center">
              <a
                href={data.resumeUrl}
                className="px-6 py-2.5 border-2 border-teal-accent text-teal-accent hover:bg-teal-accent hover:text-dark-bg transition-all rounded text-sm font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                My Resume
              </a>
              <a
                href={`mailto:${data.email}`}
                className="px-6 py-2.5 bg-teal-accent text-dark-bg hover:bg-teal-500 transition-all rounded text-sm font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                Drop Me an Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
