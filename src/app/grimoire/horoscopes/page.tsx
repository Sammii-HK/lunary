import { redirect } from 'next/navigation';

// Redirect /grimoire/horoscopes to /horoscope
// This keeps grimoire navigation working while avoiding duplicate content
export default function GrimoireHoroscopesPage() {
  redirect('/horoscope');
}
