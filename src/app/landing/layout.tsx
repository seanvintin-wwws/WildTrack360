import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WildTrack360 | Wildlife rehabilitation management software',
  description:
    'Wildlife management software for Australian care organisations. Track animals from intake to release with a wildlife tracking system built for rehabilitation teams.',
  keywords: [
    'wildlife management software',
    'wildlife tracking',
    'wildlife tracking system',
    'rehabilitation management software',
    'animal tracking australia',
    'wildtrack',
    'wild track',
    'wildlife tracker',
    'wild tracker',
    'wildlife rehabilitation',
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://wildtrack360.com.au/landing' },
  openGraph: {
    title: 'WildTrack360 | Wildlife rehabilitation management software',
    description:
      'Wildlife management software for Australian wildlife rehabilitation. Animal tracking from intake to release.',
    url: 'https://wildtrack360.com.au/landing',
    siteName: 'WildTrack360',
    locale: 'en_AU',
    type: 'website',
  },
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
