import { BlogTracker } from './BlogTracker';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BlogTracker />
      {children}
    </>
  );
}
