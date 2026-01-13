'use client';

import Link from 'next/link';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@/components/ui/modal';
import { NumerologyDetailSection } from '@/lib/numerology/numerologyDetails';

export type NumerologyModalPayload = {
  number: number;
  contextLabel: string;
  contextDetail?: string;
  meaning: string;
  description?: string;
  energy?: string;
  energyLabel?: string;
  keywords?: string[];
  sections?: NumerologyDetailSection[];
  extraNote?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

interface NumerologyInfoModalProps extends NumerologyModalPayload {
  isOpen: boolean;
  onClose: () => void;
}

const MASTER_NUMBERS = [11, 22, 33];

const getDefaultLink = (number: number) => {
  if (MASTER_NUMBERS.includes(number)) {
    return `/grimoire/numerology/master-numbers/${number}`;
  }

  if (number >= 1 && number <= 9) {
    return `/grimoire/numerology/core-numbers/${number}`;
  }

  return '/grimoire/numerology';
};

export function NumerologyInfoModal({
  isOpen,
  onClose,
  number,
  contextLabel,
  contextDetail,
  meaning,
  description: modalDescription,
  energy,
  energyLabel,
  keywords,
  sections,
  extraNote,
  ctaLabel,
  ctaHref,
}: NumerologyInfoModalProps) {
  const href = ctaHref || getDefaultLink(number);
  const label =
    ctaLabel || `Explore Number ${number} in the Numerology Grimoire`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='md'>
      <ModalHeader>
        <div className='space-y-1'>
          <p className='text-xs uppercase tracking-[0.4em] text-zinc-400'>
            {contextLabel}
          </p>
          {contextDetail && (
            <p className='text-[10px] uppercase tracking-[0.5em] text-zinc-500'>
              {contextDetail}
            </p>
          )}
          <div className='text-3xl font-semibold text-white'>
            Number {number}
          </div>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className='space-y-3'>
          <p className='text-sm text-zinc-200 leading-relaxed'>{meaning}</p>
          {modalDescription && (
            <p className='text-sm text-zinc-300 leading-relaxed'>
              {modalDescription}
            </p>
          )}
          {energy && (
            <div>
              <div className='text-xs uppercase tracking-[0.4em] text-zinc-500'>
                {energyLabel ?? 'Daily energy'}
              </div>
              <p className='text-sm text-zinc-300'>{energy}</p>
            </div>
          )}
          {keywords && keywords.length > 0 && (
            <div>
              <div className='text-xs uppercase tracking-[0.4em] text-zinc-500 mb-2'>
                Keywords
              </div>
              <div className='flex flex-wrap gap-2'>
                {keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className='px-3 py-1 rounded-full border border-zinc-700 text-[11px] text-zinc-200'
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
          {sections && sections.length > 0 && (
            <div className='space-y-3'>
              {sections.map((section) => (
                <div key={section.label}>
                  <div className='text-xs uppercase tracking-[0.4em] text-zinc-500 mb-1'>
                    {section.label}
                  </div>
                  <ul className='text-sm text-zinc-300 list-disc list-inside space-y-1'>
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          {extraNote && <p className='text-sm text-zinc-400'>{extraNote}</p>}
        </div>
      </ModalBody>
      <ModalFooter>
        <Link
          href={href}
          className='w-full text-center rounded-lg border border-lunary-primary-600 bg-lunary-primary-950 px-4 py-3 text-sm font-semibold text-lunary-primary-300 transition hover:border-lunary-primary-400 hover:text-white'
        >
          {label}
        </Link>
      </ModalFooter>
    </Modal>
  );
}
