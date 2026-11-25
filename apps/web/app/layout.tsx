import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-sans",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const gscVerification = process.env.NEXT_PUBLIC_GSC_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Rental Mobil Jakarta | TJ Rentcar",
    template: "%s | TJ Rentcar",
  },
  description:
    "Butuh rental mobil di Jakarta? Pilih layanan dengan sopir, lepas kunci, harian, mingguan, atau bulanan dari TJ Rentcar. Cek armada dan ajukan booking.",
  applicationName: "TJ Rentcar",
  authors: [{ name: "TJ Rentcar" }],
  generator: "Next.js",
  keywords: [
    "rental mobil Jakarta",
    "sewa mobil Jakarta",
    "rental mobil dengan sopir Jakarta",
    "rental mobil lepas kunci Jakarta",
    "sewa mobil harian Jakarta",
    "antar jemput bandara Jakarta",
    "TJ Rentcar",
  ],
  creator: "TJ Rentcar",
  publisher: "TJ Rentcar",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/brand/tj-rentcar-logo.jpeg",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    title: "Rental Mobil Jakarta | TJ Rentcar",
    description:
      "Layanan rental mobil terpercaya di Jakarta. Pilihan sewa dengan sopir, lepas kunci, harian, dan antar jemput bandara dengan armada prima.",
    siteName: "TJ Rentcar",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rental Mobil Jakarta | TJ Rentcar",
    description:
      "Layanan rental mobil terpercaya di Jakarta. Pilihan sewa dengan sopir, lepas kunci, harian, dan antar jemput bandara.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: gscVerification ? { google: gscVerification } : undefined,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <body className="font-sans antialiased bg-white text-brand-950 selection:bg-gold-500 selection:text-brand-950">
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        {children}
      </body>
    </html>
  );
}
