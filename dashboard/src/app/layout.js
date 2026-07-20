import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata() {
  let settings = {};
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/settings`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      settings = data.settings || {};
    }
  } catch (err) {
    console.error("Failed to fetch settings for metadata", err);
  }

  const icons = [];
  if (settings.favicon_ico) icons.push({ rel: 'icon', url: settings.favicon_ico, sizes: 'any' });
  if (settings.favicon_16x16) icons.push({ rel: 'icon', url: settings.favicon_16x16, sizes: '16x16', type: 'image/png' });
  if (settings.favicon_32x32) icons.push({ rel: 'icon', url: settings.favicon_32x32, sizes: '32x32', type: 'image/png' });
  if (settings.apple_touch_icon) icons.push({ rel: 'apple-touch-icon', url: settings.apple_touch_icon });
  if (settings.android_chrome_192x192) icons.push({ rel: 'icon', url: settings.android_chrome_192x192, sizes: '192x192', type: 'image/png' });
  if (settings.android_chrome_512x512) icons.push({ rel: 'icon', url: settings.android_chrome_512x512, sizes: '512x512', type: 'image/png' });

  const titlePrefix = settings.site_fullname || "Connecting Scripts";

  return {
    title: `${titlePrefix} - Admin Dashboard`,
    description: "Manage your SEO and digital marketing website data.",
    icons: icons.length > 0 ? icons : undefined
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
