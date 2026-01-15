import { ArrowRight, Sparkles } from 'lucide-react';
import {
  getCosmicConnections,
  CosmicConnectionSection,
  EntityType,
} from '@/lib/cosmicConnectionsConfig';
import { NavParamLink } from '@/components/NavParamLink';

export interface CosmicConnectionsProps {
  entityType: EntityType;
  entityKey: string;
  title?: string;
  maxSections?: number;
  extraParams?: { planet1?: string; aspect?: string; planet2?: string };
  sections?: CosmicConnectionSection[];
}

export function CosmicConnections({
  entityType,
  entityKey,
  title = 'Cosmic Connections',
  maxSections = 3,
  extraParams,
  sections: propSections,
}: CosmicConnectionsProps) {
  const sections =
    propSections ||
    getCosmicConnections(entityType, entityKey, extraParams).slice(
      0,
      maxSections,
    );

  if (sections.length === 0) return null;

  return (
    <section className='mt-8 pt-8 border-t border-zinc-800'>
      <h2 className='text-xl font-medium text-zinc-100 mb-2 flex items-center gap-2'>
        <Sparkles className='h-5 w-5 text-lunary-primary-400' />
        {title}
      </h2>
      <p className='text-zinc-500 text-sm mb-6'>
        Explore related cosmic connections
      </p>
      <div className='space-y-6'>
        {sections.map((section, sectionIndex) => (
          <div key={`${section.title}-${sectionIndex}`}>
            <h3 className='text-sm font-medium text-zinc-400 mb-3'>
              {section.title}
            </h3>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
              {section.links.map((link, linkIndex) => (
                <NavParamLink
                  key={`${link.href}-${linkIndex}`}
                  href={link.href}
                  className='flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50 hover:border-lunary-primary-600 hover:bg-zinc-800/50 transition-colors text-sm'
                >
                  <span className='text-zinc-300 truncate'>{link.label}</span>
                  <ArrowRight className='h-3 w-3 text-zinc-500 flex-shrink-0' />
                </NavParamLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CosmicConnections;
