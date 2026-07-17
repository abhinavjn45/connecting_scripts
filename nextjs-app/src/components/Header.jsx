import Link from 'next/link';

export default function Header() {
  return (
    <>
      {/*=====HEADER START=======*/}
      <header>
        <div className="header-area homepage1 header header-sticky d-none d-lg-block " id="header">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="header-elements">
                  <div className="site-logo">
                    <Link href="/"><img src="/assets/img/logo/logo1.png" alt="Connecting Scripts Logo" /></Link>
                  </div>
                  <div className="main-menu">
                    <ul>
                      <li><Link href="/">Home</Link></li>
                      <li><Link href="/services">Services</Link></li>
                      <li><Link href="/case-study">Case Studies</Link></li>
                      <li><a href="#">Products</a></li>
                      <li><Link href="/blogs">Blogs</Link></li>
                      <li><Link href="/about-us">About</Link></li>
                      <li><Link href="/contact-us">Contact</Link></li>
                    </ul>
                  </div>
                  <div className="btn-area">
                    <div className="search-icon header__search header-search-btn">
                      <a href="#"><img src="/assets/img/icons/search-icons1.svg" alt="" /></a>
                    </div>
                    <Link href="/contact-us" className="header-btn1">Free Consultation <span><i className="fa-solid fa-arrow-right"></i></span></Link>
                  </div>

                  <div className="header-search-form-wrapper">
                    <div className="tx-search-close tx-close"><i className="fa-solid fa-xmark"></i></div>
                    <div className="header-search-container">
                        <form role="search" className="search-form">
                        <input type="search" className="search-field" placeholder="Search …" defaultValue="" name="s" />
                        <button type="submit" className="search-submit"><img src="/assets/img/icons/search-icons1.svg" alt="" /></button>
                        </form>
                    </div>
                  </div>
                  <div className="body-overlay"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/*=====HEADER END =======*/}

      {/*===== MOBILE HEADER STARTS =======*/}
      <div className="mobile-header mobile-haeder1 d-block d-lg-none">
        <div className="container-fluid">
          <div className="col-12">
            <div className="mobile-header-elements">
              <div className="mobile-logo">
                <Link href="/"><img src="/assets/img/logo/logo1.png" alt="Connecting Scripts Logo" /></Link>
              </div>
              <div className="mobile-nav-icon dots-menu">
                <i className="fa-solid fa-bars"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mobile-sidebar mobile-sidebar1">
        <div className="logosicon-area">
          <div className="logos">
            <img src="/assets/img/logo/logo1.png" alt="Connecting Scripts Logo" />
          </div>
          <div className="menu-close">
            <i className="fa-solid fa-xmark"></i>
          </div>
        </div>
        <div className="mobile-nav mobile-nav1">
          <ul className="mobile-nav-list nav-list1">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/case-study">Case Studies</Link></li>
            <li><a href="#">Products</a></li>
            <li><Link href="/blogs">Blogs</Link></li>
            <li><Link href="/about-us">About</Link></li>
            <li><Link href="/contact-us">Contact</Link></li>
          </ul>

          <div className="allmobilesection">
            <Link href="/contact-us" className="header-btn1">Get Started <span><i className="fa-solid fa-arrow-right"></i></span></Link>
            <div className="single-footer">
              <h3>Contact Info</h3>
              <div className="footer1-contact-info">
                <div className="contact-info-single">
                  <div className="contact-info-icon">
                    <i className="fa-solid fa-phone-volume"></i>
                  </div>
                  <div className="contact-info-text">
                    <a href="tel:+919214544078">+91 92145 44078</a>
                  </div>
                </div>

                <div className="contact-info-single">
                  <div className="contact-info-icon">
                    <i className="fa-solid fa-envelope"></i>
                  </div>
                  <div className="contact-info-text">
                    <a href="mailto:sales@connectingscripts.co.in">sales@connectingscripts.co.in</a>
                  </div>
                </div>

                <div className="single-footer">
                  <h3>Our Location</h3>
                  <div className="contact-info-single">
                    <div className="contact-info-icon">
                      <i className="fa-solid fa-location-dot"></i>
                    </div>
                    <div className="contact-info-text">
                      <a href="#">Bangalore, India</a>
                    </div>
                  </div>
                </div>

                <div className="single-footer">
                  <h3>Social Links</h3>
                  <div className="social-links-mobile-menu">
                    <ul>
                      <li><a href="#"><i className="fa-brands fa-facebook-f"></i></a></li>
                      <li><a href="#"><i className="fa-brands fa-instagram"></i></a></li>
                      <li><a href="#"><i className="fa-brands fa-linkedin-in"></i></a></li>
                      <li><a href="#"><i className="fa-brands fa-youtube"></i></a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*===== MOBILE HEADER ENDS =======*/}
    </>
  );
}
