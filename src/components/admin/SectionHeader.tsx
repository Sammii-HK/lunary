interface SectionHeaderProps {
  title: string;
  description?: string;
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div>
      <h2 className='text-sm font-medium text-content-primary'>{title}</h2>
      {description && (
        <p className='text-xs text-content-muted'>{description}</p>
      )}
    </div>
  );
}
