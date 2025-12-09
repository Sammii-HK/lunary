'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MdxLivePreview } from '@/components/MdxLivePreview';

export default function NewPost() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<'draft' | 'publish'>('draft');
  const [tags, setTags] = useState<string>('');
  const [cover, setCover] = useState<string>('');
  const [body, setBody] = useState<string>('');

  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const derivedSlug = useMemo(() => {
    return title
      ? title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .slice(0, 60)
      : '';
  }, [title]);

  async function uploadCover(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('slug', derivedSlug || 'post');
      form.append('folder', 'blog-covers');

      const res = await fetch('/api/blob/upload', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setCover(data.url as string);
    } catch (e: any) {
      alert(e.message || 'Upload error');
    } finally {
      setUploading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title,
          description,
          date,
          status,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          cover,
          body,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to create post');
      } else {
        alert(`Created: ${data.path}`);
        // Reset form
        setTitle('');
        setDescription('');
        setDate(new Date().toISOString().slice(0, 10));
        setStatus('draft');
        setTags('');
        setCover('');
        setBody(editorPlaceholder);
      }
    } catch (e: any) {
      alert(e.message || 'Network error');
    } finally {
      setCreating(false);
    }
  }

  const editorPlaceholder = useMemo(
    () =>
      `Intro paragraph…

## Subheading

Understanding the cosmic energies at play can help you navigate life's challenges with greater wisdom and intention.

### Key Points

- First important point
- Second key insight  
- Third consideration

> "The stars impel, they do not compel." - Ancient wisdom

\`\`\`javascript
// Example code block
const moonPhase = calculateCurrentPhase()
console.log('Current phase:', moonPhase)
\`\`\`

Remember to trust your intuition as you explore these cosmic influences.
`,
    [],
  );

  useEffect(() => {
    if (!body) setBody(editorPlaceholder);
  }, [body, editorPlaceholder]);

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='grid grid-cols-1 lg:grid-cols-2 min-h-screen'>
        {/* Editor Panel */}
        <div className='bg-white border-r border-gray-200'>
          <form onSubmit={handleCreate} className='p-6 space-y-4'>
            <div className='border-b border-gray-200 pb-4'>
              <h1 className='text-2xl font-bold text-gray-900'>
                Create New Post
              </h1>
              <p className='text-sm text-gray-600 mt-1'>
                Write and preview your blog post in real-time
              </p>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Title
                </label>
                <input
                  type='text'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder='How to read your rising sign — and why it matters more than your sun'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lunary-primary focus:border-transparent'
                />
                {derivedSlug && (
                  <p className='text-xs text-gray-500 mt-1'>
                    Slug: {derivedSlug}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Description
                </label>
                <input
                  type='text'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder='Short meta description for SEO'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lunary-primary focus:border-transparent'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Date
                  </label>
                  <input
                    type='date'
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lunary-primary focus:border-transparent'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lunary-primary focus:border-transparent'
                  >
                    <option value='draft'>Draft (schedule)</option>
                    <option value='publish'>Publish now</option>
                  </select>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Tags (comma-separated)
                </label>
                <input
                  type='text'
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder='moon, rising sign, birth chart, astrology'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lunary-primary focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Cover Image
                </label>
                <div className='flex items-center gap-3'>
                  <button
                    type='button'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className='px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm'
                  >
                    {uploading ? 'Uploading…' : 'Upload cover'}
                  </button>
                  {cover && (
                    <a
                      href={cover}
                      target='_blank'
                      rel='noreferrer'
                      className='text-sm text-lunary-secondary hover:text-lunary-secondary-400 underline'
                    >
                      View cover
                    </a>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadCover(f);
                  }}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  MDX Content
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={16}
                  spellCheck={false}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lunary-primary focus:border-transparent font-mono text-sm resize-none'
                />
              </div>
            </div>

            <div className='border-t border-gray-200 pt-4'>
              <button
                type='submit'
                disabled={creating || !title || !description || !body}
                className='w-full bg-lunary-primary text-white py-2 px-4 rounded-md hover:bg-lunary-primary-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium'
              >
                {creating ? 'Creating…' : 'Create Post'}
              </button>

              <p className='text-xs text-gray-500 mt-2'>
                {status === 'draft'
                  ? 'Draft will be auto-published via Vercel Cron when the date is reached.'
                  : 'Post will be published immediately to GitHub and deployed.'}
              </p>
            </div>
          </form>
        </div>

        {/* Preview Panel */}
        <div className='bg-gray-50 lg:block hidden'>
          <div className='sticky top-0 bg-white border-b border-gray-200 p-4'>
            <h2 className='font-medium text-gray-900'>Live Preview</h2>
            <p className='text-sm text-gray-600'>See how your post will look</p>
          </div>
          <MdxLivePreview source={body} />
        </div>
      </div>
    </div>
  );
}
