import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReCaptchaProvider } from "@/components/recaptcha-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://3930paradise.com'),
  title: {
    default: "3930 Paradise | Ainsley at The Collective - Real Resident Experiences & Reviews",
    template: "%s | 3930 Paradise"
  },
  description: "Documented resident experiences at 3930 Paradise Rd (Ainsley at The Collective), Las Vegas, NV 89169. Real maintenance issues, complaints, and incidents - not marketing. See what Elysian Living doesn't tell you.",
  keywords: [
    "3930 Paradise",
    "3930 Paradise Las Vegas",
    "3930 Paradise Rd",
    "Ainsley at The Collective",
    "Ainsley apartments Las Vegas",
    "The Collective Las Vegas",
    "Elysian Living",
    "Elysian Living reviews",
    "Ainsley reviews",
    "Paradise Las Vegas apartments",
    "Las Vegas NV 89169",
    "apartment complaints Las Vegas",
    "resident experiences Las Vegas",
    "Ainsley maintenance issues",
    "The Collective resident reviews",
    "luxury apartments Las Vegas problems",
    "3930 Paradise Road reviews",
    "Elysian Living complaints",
    "Ainsley resident timeline"
  ],
  authors: [{ name: "3930 Paradise Residents" }],
  creator: "Residents of 3930 Paradise",
  publisher: "3930 Paradise Community",
  alternates: {
    canonical: "https://3930paradise.com"
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://3930paradise.com",
    siteName: "3930 Paradise - Real Resident Experiences",
    title: "3930 Paradise | Ainsley at The Collective - Real Resident Experiences",
    description: "Documented incidents at 3930 Paradise Rd (Ainsley at The Collective), Las Vegas. Real maintenance issues, complaints & violations. Truth over marketing.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "3930 Paradise - Real Resident Experiences at Ainsley at The Collective"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "3930 Paradise | Real Resident Experiences at Ainsley at The Collective",
    description: "Documented resident experiences at 3930 Paradise Rd, Las Vegas. Real issues, not marketing.",
    images: ["/og-image.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  verification: {
    // Add when you have these
    // google: "your-google-verification-code",
    // bing: "your-bing-verification-code"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReCaptchaProvider>
          {children}
        </ReCaptchaProvider>
      </body>
    </html>
  );
}
