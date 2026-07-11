"use client";

import Link from 'next/link';

export default function Footer() {
  return (
    <>
      {/*===== FOOTER AREA STARTS =======*/}
      <div className="footer1-section-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-md-6">
              <div className="footer-logo-area">
                <img src="/assets/img/logo/logo1.png" alt="SEOC Logo" />
                <p>By optimizing content, leveraging relevant keywords, and adhering to best practices, businesses can secure prominent position (SEO)</p>
                <ul>
                  <li><a href="#"><img src="/assets/img/icons/facebook.svg" alt="Facebook" /></a></li>
                  <li><a href="#"><img src="/assets/img/icons/instagram.svg" alt="Instagram" /></a></li>
                  <li><a href="#"><img src="/assets/img/icons/linkedin.svg" alt="LinkedIn" /></a></li>
                  <li><a href="#"><img src="/assets/img/icons/youtube.svg" alt="YouTube" /></a></li>
                </ul>
              </div>
            </div>

            <div className="col-lg-2 col-md-6">
              <div className="footer-logo-area1">
                <h3>About Link</h3>
                <ul>
                  <li><Link href="/blogs">Our Blog</Link></li>
                  <li><Link href="/about-us">About Us</Link></li>
                  <li><Link href="/services">Services</Link></li>
                  <li><a href="#">Marketing</a></li>
                  <li><a href="#">Testimonials</a></li>
                  <li><Link href="/contact-us">Contact Us</Link></li>
                </ul>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="footer-logo-area2">
                <h3>Get in touch</h3>
                <ul>
                  <li><a href="mailto:Infoseoc@gmail.com"><img src="/assets/img/icons/email.svg" alt="Email" /><span>Infoseoc@gmail.com</span></a></li>
                  <li><a href="#"><img src="/assets/img/icons/location.svg" alt="Location" /><span>8708 Technology Forest <br className="d-lg-block d-none" /> Pl Suite 125 -G, The <br className="d-lg-block d-none" /> Woodlands, TX 773</span></a></li>
                  <li><a href="tel:123-456-7890"><img src="/assets/img/icons/phone.svg" alt="Phone" /><span>123-456-7890</span></a></li>
                </ul>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="footer-logo-area3">
                <h3>Subscribe Our Newsletter</h3>
                <form action="#" onSubmit={(e) => e.preventDefault()}>
                  <input type="text" placeholder="Enter Your email" />
                  <button className="header-btn1"> Subscribe <span><i className="fa-solid fa-arrow-right"></i></span></button>
                </form>
              </div>
            </div>
          </div>
          <div className="space80 d-lg-block d-none"></div>
          <div className="space40 d-lg-none d-block"></div>
          <div className="row">
            <div className="col-lg-12">
              <div className="copyright-area">
                <div className="pera">
                  <p>&#9426;Copyright 2024 SEOC . All rights reserved</p>
                </div>
                <ul>
                  <li><a href="#">Terms &amp; Conditions</a></li>
                  <li><a href="#" className="m-0"> Privacy Policy </a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*===== FOOTER AREA ENDS =======*/}
    </>
  );
}
