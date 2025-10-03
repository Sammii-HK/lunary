export interface PostData {
  content: string;
  imageUrl?: string;
  scheduledDate?: string;
  platforms?: string[];
  alt?: string;
}

/**
 * Generate prefilled URLs for various social media and application platforms
 */
export const socialPrefillUrls = {
  /**
   * Open Twitter/X with prefilled tweet content
   */
  twitter: (postData: PostData): string => {
    const text = encodeURIComponent(postData.content);
    return `https://twitter.com/intent/tweet?text=${text}`;
  },

  /**
   * Open Facebook with prefilled post content
   */
  facebook: (postData: PostData): string => {
    const text = encodeURIComponent(postData.content);
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      window?.location.origin || 'https://lunary.app'
    )}&quote=${text}`;
  },

  /**
   * Open LinkedIn with prefilled post content
   */
  linkedin: (postData: PostData): string => {
    const text = encodeURIComponent(postData.content);
    const url = encodeURIComponent(window?.location.origin || 'https://lunary.app');
    return `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`;
  },

  /**
   * Open Instagram - Note: Instagram doesn't support prefilled content via URL,
   * but we can copy content to clipboard and provide guidance
   */
  instagram: (postData: PostData): void => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(postData.content).then(() => {
        alert(
          '📋 Content copied to clipboard!\n\n' +
          'Instagram doesn\'t support prefilled posts via URL. ' +
          'Please open Instagram manually and paste the content.\n\n' +
          `Image URL: ${postData.imageUrl || 'Check the generated cosmic image'}`
        );
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = postData.content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      alert(
        '📋 Content copied to clipboard!\n\n' +
        'Instagram doesn\'t support prefilled posts via URL. ' +
        'Please open Instagram manually and paste the content.\n\n' +
        `Image URL: ${postData.imageUrl || 'Check the generated cosmic image'}`
      );
    }
  },

  /**
   * Open default email client with prefilled content
   */
  email: (postData: PostData): string => {
    const subject = encodeURIComponent('Daily Cosmic Guidance');
    const body = encodeURIComponent(
      `${postData.content}\n\n` +
      `Generated on: ${new Date().toLocaleDateString()}\n` +
      `${postData.imageUrl ? `Image: ${postData.imageUrl}` : ''}`
    );
    return `mailto:?subject=${subject}&body=${body}`;
  },

  /**
   * Open WhatsApp with prefilled content
   */
  whatsapp: (postData: PostData): string => {
    const text = encodeURIComponent(postData.content);
    return `https://wa.me/?text=${text}`;
  },

  /**
   * Open Telegram with prefilled content
   */
  telegram: (postData: PostData): string => {
    const text = encodeURIComponent(postData.content);
    return `https://t.me/share/url?text=${text}`;
  },

  /**
   * Open Pinterest with prefilled content and image
   */
  pinterest: (postData: PostData): string => {
    const description = encodeURIComponent(postData.content);
    const media = encodeURIComponent(postData.imageUrl || '');
    const url = encodeURIComponent(window?.location.origin || 'https://lunary.app');
    return `https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${description}`;
  },

  /**
   * Open Reddit with prefilled content
   */
  reddit: (postData: PostData): string => {
    const title = encodeURIComponent('Daily Cosmic Guidance');
    const text = encodeURIComponent(postData.content);
    return `https://www.reddit.com/submit?title=${title}&text=${text}`;
  },

  /**
   * Open Tumblr with prefilled content
   */
  tumblr: (postData: PostData): string => {
    const title = encodeURIComponent('Daily Cosmic Guidance');
    const body = encodeURIComponent(postData.content);
    return `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encodeURIComponent(
      window?.location.origin || 'https://lunary.app'
    )}&title=${title}&caption=${body}`;
  },
};

/**
 * Copy content to clipboard with fallback
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

/**
 * Generate a downloadable text file with the post content
 */
export const downloadAsTextFile = (postData: PostData, filename: string = 'cosmic-post.txt'): void => {
  const content = [
    'COSMIC POST CONTENT',
    '===================',
    '',
    postData.content,
    '',
    '---',
    '',
    `Generated: ${new Date().toLocaleString()}`,
    `Scheduled: ${postData.scheduledDate ? new Date(postData.scheduledDate).toLocaleString() : 'Not scheduled'}`,
    `Platforms: ${postData.platforms?.join(', ') || 'Not specified'}`,
    `Image URL: ${postData.imageUrl || 'Not available'}`,
    `Image Alt: ${postData.alt || 'Not available'}`,
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
