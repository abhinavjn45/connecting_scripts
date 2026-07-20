import Script from 'next/script';
import "./globals.css";

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
    title: `${titlePrefix} - Full-Service Digital Marketing Agency for Websites, SEO & Ads`,
    description: "Connecting Scripts builds websites & apps, manages SEO, Google & Meta Ads, and creates content that turns visibility into paying customers.",
    icons: icons.length > 0 ? icons : undefined
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/assets/css/plugins/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/plugins/aos.css" />
        <link rel="stylesheet" href="/assets/css/plugins/fontawesome.css" />
        <link rel="stylesheet" href="/assets/css/plugins/magnific-popup.css" />
        <link rel="stylesheet" href="/assets/css/plugins/mobile.css" />
        <link rel="stylesheet" href="/assets/css/plugins/owlcarousel.min.css" />
        <link rel="stylesheet" href="/assets/css/plugins/sidebar.css" />
        <link rel="stylesheet" href="/assets/css/plugins/slick-slider.css" />
        <link rel="stylesheet" href="/assets/css/plugins/nice-select.css" />
        <link rel="stylesheet" href="/assets/css/main.css" />

        {/* Sequenced script loading */}
        <Script src="/assets/js/plugins/jquery-3-6-0.min.js" strategy="beforeInteractive" />
        <Script src="/assets/js/plugins/bootstrap.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/plugins/fontawesome.js" strategy="afterInteractive" />
        <Script src="/assets/js/plugins/aos.js" strategy="afterInteractive" />
        <Script src="/assets/js/plugins/counter.js" strategy="afterInteractive" />
        <Script src="/assets/js/plugins/gsap.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/plugins/ScrollTrigger.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/plugins/Splitetext.js" strategy="afterInteractive" />
        <Script src="/assets/js/plugins/sidebar.js" strategy="afterInteractive" />
        <Script src="/assets/js/plugins/magnific-popup.js" strategy="afterInteractive" />
        <Script src="/assets/js/plugins/mobilemenu.js" strategy="afterInteractive" />
        <Script src="/assets/js/plugins/owlcarousel.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/plugins/gsap-animation.js" strategy="afterInteractive" />
        <Script src="/assets/js/plugins/nice-select.js" strategy="afterInteractive" />
        <Script src="/assets/js/plugins/waypoints.js" strategy="afterInteractive" />
        <Script src="/assets/js/plugins/slick-slider.js" strategy="afterInteractive" />
        <Script src="/assets/js/plugins/circle-progress.js" strategy="afterInteractive" />
        <Script src="/assets/js/main.js" strategy="afterInteractive" />
      </head>
      <body className="homepage1-body">
        {/*===== PRELOADER STARTS =======*/}
        <div className="preloader">
          <div className="loading-container">
            <div className="loading"></div>
            <div id="loading-icon"><img src="/assets/img/logo/preloader.png" alt="" /></div>
          </div>
        </div>
        {/*===== PRELOADER ENDS =======*/}

        {/*===== PROGRESS STARTS=======*/}
        <div className="paginacontainer">
          <div className="progress-wrap">
            <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
              <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
            </svg>
          </div>
        </div>
        {/*===== PROGRESS ENDS=======*/}

        {children}
      </body>
    </html>
  );
}
