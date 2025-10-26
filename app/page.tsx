'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import Script from 'next/script';
import { BackgroundVideo } from '@/components/background-video';
import { CountdownTimer } from '@/components/countdown-timer';
import { Timeline } from '@/components/timeline';
import { DashboardGraph } from '@/components/dashboard-graph';

type Attachment = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  isPiiRedacted: boolean;
};

type Event = {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  category: string;
  createdAt: string;
  attachments: Attachment[];
};

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        // Ensure data is an array before setting
        if (Array.isArray(data)) {
          setEvents(data);
        } else {
          console.error('API returned non-array data:', data);
          setEvents([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch events:', err);
        setEvents([]);
        setLoading(false);
      });
  }, []);

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://3930paradise.com/#website",
        "url": "https://3930paradise.com",
        "name": "3930 Paradise - Real Resident Experiences",
        "description": "Documented resident experiences at 3930 Paradise Rd (Ainsley at The Collective), Las Vegas",
        "publisher": {
          "@id": "https://3930paradise.com/#organization"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://3930paradise.com/#organization",
        "name": "3930 Paradise Residents",
        "url": "https://3930paradise.com",
        "description": "Community documentation of resident experiences at 3930 Paradise Road, Las Vegas"
      },
      {
        "@type": "Place",
        "@id": "https://3930paradise.com/#place",
        "name": "3930 Paradise",
        "alternateName": "Ainsley at The Collective",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "3930 Paradise Rd",
          "addressLocality": "Las Vegas",
          "addressRegion": "NV",
          "postalCode": "89169",
          "addressCountry": "US"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 36.1173896,
          "longitude": -115.1546435
        }
      },
      {
        "@type": "ItemList",
        "@id": "https://3930paradise.com/#events",
        "name": "Documented Incidents at 3930 Paradise",
        "description": "Timeline of resident-documented maintenance issues, complaints, and violations",
        "numberOfItems": events.length,
        "itemListElement": events.slice(0, 10).map((event, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Event",
            "name": event.title,
            "description": event.description.substring(0, 200),
            "startDate": event.eventDate,
            "location": {
              "@id": "https://3930paradise.com/#place"
            },
            "eventStatus": "https://schema.org/EventScheduled",
            "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode"
          }
        }))
      },
      {
        "@type": "WebPage",
        "@id": "https://3930paradise.com/#webpage",
        "url": "https://3930paradise.com",
        "name": "3930 Paradise | Ainsley at The Collective - Real Resident Experiences & Reviews",
        "description": "Documented resident experiences at 3930 Paradise Rd (Ainsley at The Collective), Las Vegas, NV 89169. Real maintenance issues, complaints, and incidents - not marketing.",
        "isPartOf": {
          "@id": "https://3930paradise.com/#website"
        },
        "about": {
          "@id": "https://3930paradise.com/#place"
        },
        "primaryImageOfPage": {
          "@type": "ImageObject",
          "url": "https://3930paradise.com/og-image.png"
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Structured Data for SEO */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        strategy="beforeInteractive"
      />

      {/* Background Videos */}
      <BackgroundVideo />

      {/* Countdown Timer */}
      <CountdownTimer />

      {/* Header - Brutalist style */}
      <header className="border-b-4 border-red-500 p-4 bg-black relative z-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            3930 PARADISE ROAD
          </h1>
          <p className="text-xl md:text-2xl text-red-500 mt-2 font-bold">
            AINSLEY AT THE COLLECTIVE // REAL RESIDENT REVIEWS & EXPERIENCES
          </p>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            <strong className="text-white">3930 Paradise Rd, Las Vegas, NV 89169</strong> - Real resident experiences at Elysian Living's Ainsley apartments.
            <br />
            Not Elysian Living marketing. Not "mindfully developed." Not "resort-style community."
            <br />
            Documented maintenance issues, complaints, and resident experiences at The Collective Las Vegas.
          </p>
          <p className="text-xs text-yellow-400 mt-2 italic">
            Real reviews from residents at 3930 Paradise. Elysian Living promises Himalayan Salt Caves. We document actual living conditions.
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-yellow-400 text-black p-2 border-b-4 border-white relative z-10">
        <div className="max-w-6xl mx-auto flex gap-4 font-bold">
          <Link href="/" className="hover:underline">
            TIMELINE
          </Link>
          <Link href="/submit" className="hover:underline">
            SUBMIT EVENT
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-8 relative z-10">
        <div className="mb-8 border-4 border-white p-4 bg-red-900">
          <h2 className="text-2xl font-bold mb-2">RESIDENT INCIDENT TIMELINE - AINSLEY AT THE COLLECTIVE</h2>
          <p className="text-sm mb-3">
            Chronological documentation of maintenance issues, complaints, and resident experiences at <strong>3930 Paradise Road, Las Vegas, NV 89169</strong>.
            <br />
            Real reviews and incidents at Ainsley apartments (Elysian Living property). Personal information redacted. Truth preserved.
          </p>
          <div className="text-xs text-gray-300 border-t border-gray-600 pt-3 mt-3">
            <p className="mb-1"><span className="text-yellow-400">★</span> Ainsley at The Collective resident experiences vs. Elysian Living marketing promises</p>
            <p className="mb-1"><span className="text-yellow-400">★</span> Documented maintenance issues at 3930 Paradise Las Vegas apartments</p>
            <p className="mb-1"><span className="text-yellow-400">★</span> Real complaints and violations - not "resort-style community" propaganda</p>
            <p><span className="text-yellow-400">★</span> The truth about living at The Collective luxury apartments Las Vegas</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-2xl py-16">LOADING...</div>
        ) : events.length === 0 ? (
          <div className="text-center border-4 border-white p-8">
            <p className="text-xl mb-4">NO EVENTS YET</p>
            <Link
              href="/submit"
              className="inline-block bg-yellow-400 text-black px-6 py-3 font-bold border-4 border-white hover:bg-yellow-300"
            >
              SUBMIT FIRST EVENT
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Dashboard Graph */}
            <DashboardGraph events={events} />

            {/* Timeline Component */}
            <Timeline events={events} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-red-500 mt-16 p-8 bg-black relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-6">
            <div className="border-2 border-gray-700 p-4">
              <h3 className="text-yellow-400 font-bold mb-2 text-sm">WHAT THEY PROMISE:</h3>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>✓ "Socially conscious living"</li>
                <li>✓ "Health and wellness" focused</li>
                <li>✓ "Resort-style community"</li>
                <li>✓ "Ultra-modern designer fixtures"</li>
                <li>✓ "Active, highly social lifestyle"</li>
                <li>✓ Yoga, Pilates, Salt Caves, Red-Light Therapy</li>
              </ul>
            </div>
            <div className="border-2 border-red-700 p-4">
              <h3 className="text-red-400 font-bold mb-2 text-sm">WHAT RESIDENTS DOCUMENT:</h3>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>→ Check the timeline above</li>
                <li>→ Maintenance issues and response times</li>
                <li>→ Communication breakdowns</li>
                <li>→ Actual living conditions</li>
                <li>→ Fee discrepancies</li>
                <li>→ Reality vs. marketing promises</li>
              </ul>
            </div>
          </div>

          <div className="text-center border-t border-gray-700 pt-6">
            <p className="text-gray-400 text-sm mb-2">
              This site documents resident experiences at 3930 Paradise (Ainsley at The Collective).
            </p>
            <p className="text-gray-600 text-xs">
              Not affiliated with Elysian Living. Not "mindfully developed." Just resident accountability.
            </p>
            <p className="text-gray-700 text-xs mt-2">
              Built by residents who believe transparency matters more than Himalayan salt caves.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
