interface SectionHeaderProps {
  title: string;
  description?: string;
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div>
      <h2 className='text-sm font-medium text-zinc-200'>{title}</h2>
      {description && <p className='text-xs text-zinc-500'>{description}</p>}
    </div>
  );
}
