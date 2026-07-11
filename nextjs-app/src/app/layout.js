import Script from 'next/script';
import "./globals.css";

export const metadata = {
  title: "SEOC - Your trusted partner for comprehensive SEO and digital marketing solutions.",
  description: "We specialize in revolutionizing your online presence through expert SEO and digital marketing strategies.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/assets/img/logo/fav-logo1.png" type="image/x-icon" />
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
