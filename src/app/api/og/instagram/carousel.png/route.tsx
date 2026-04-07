// Proxy route so that fallback carousel URLs ending in .png resolve correctly.
// Postiz requires media URLs to have an image extension; this satisfies that
// requirement while forwarding all params to the real carousel renderer.
export { GET } from '../carousel/route';
