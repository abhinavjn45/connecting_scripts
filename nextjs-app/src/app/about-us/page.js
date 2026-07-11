import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function About() {
  return (
    <>
      <Header />
      
      {/*===== HERO AREA STARTS =======*/}
      <div className="about-header-area" style={{ backgroundImage: 'url(/assets/img/bg/inner-header.png)', backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <img src="/assets/img/elements/elements1.png" alt="" className="elements1 aniamtion-key-1" />
          <img src="/assets/img/elements/star2.png" alt="" className="star2 keyframe5" />
          <div className="container">
              <div className="row">
                  <div className="col-lg-3 m-auto">
                      <div className="about-inner-header heading9 text-center">
                          <h1>About Us</h1>
                          <Link href="/">Home <i className="fa-solid fa-angle-right"></i> <span>About Us</span></Link>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      {/*===== HERO AREA ENDS =======*/}

      {/*===== ABOUT AREA STARTS =======*/}
      <div className="about1-section-area sp6 bg-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-4">
              <div className="about-images">
               <figure className="image-anime">
                <img src="/assets/img/all-images/about-img1.png" alt="" />
               </figure>
                <img src="/assets/img/elements/star1.png" alt="" className="star1 keyframe5" />
              </div>
            </div>
            <div className="col-lg-5">
              <div className="about-content-area heading2">
                <div className="arrow-circle">
                  <Link href="/about-us">
                    <img src="/assets/img/elements/elements4.png" alt="" className="elements4 keyframe5" />
                    <img src="/assets/img/icons/arrow.svg" alt="" className="arrow" />
                  </Link>
                </div>
                <h2>Comprehensive SEO &amp; Digital Marketing Solutions.</h2>
                <p>Welcome to SEOC your trusted partner for comprehensive SEO and digital marketing solutions. With our proven expertise and innovative strategies the digital landscape.</p>
                <div className="btn-area">
                  <Link href="/about-us" className="header-btn1">Learn More <span><i className="fa-solid fa-arrow-right"></i></span></Link>
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="about-auhtor-images">
                <img src="/assets/img/elements/elements5.png" alt="" className="elements5 keyframe5" />
                <figure className="image-anime">
                  <img src="/assets/img/all-images/about-img2.png" alt="" />
                 </figure>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*===== ABOUT AREA ENDS =======*/}

      <div className="space60"></div>

      {/*===== BRAND SLIDER AREA STARTS =======*/}
      <div className="slider-section-area slider-inner sp5">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-2">
                <div className="sldier-head">
                  <p>Trusted by <br className="d-lg-block d-none" /> Top Companies</p>
                </div>
              </div>
              <div className="col-lg-10">
                <div className="slider-images-area owl-carousel">
                  <div className="img1">
                    <img src="/assets/img/elements/brand-img1.png" alt="" />
                  </div>
                  <div className="img1">
                    <img src="/assets/img/elements/brand-img2.png" alt="" />
                  </div>
                  <div className="img1">
                    <img src="/assets/img/elements/brand-img3.png" alt="" />
                  </div>
                  <div className="img1">
                    <img src="/assets/img/elements/brand-img4.png" alt="" />
                  </div>
                  <div className="img1">
                    <img src="/assets/img/elements/brand-img5.png" alt="" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/*===== BRAND SLIDER AREA ENDS =======*/}

      {/*===== WHY CHOOSE US AREA STARTS =======*/}
      <div className="works-inner-section-area sp1">
          <div className="container">
              <div className="row">
                  <div className="col-lg-6">
                      <div className="works-header-area heading2">
                          <h5>Why Choose Us</h5>
                          <h2>Experience the Advantage Why We're the Right Choice</h2>
                          <p>At SEOC we understand that you have many options when it comes to digital marketing services. So why should you choose us? Here are a few reasons</p>
                          <div className="space32"></div>
                          <div className="works-content-box">
                              <div className="icons">
                                  <img src="/assets/img/icons/works-icons7.svg" alt="" />
                              </div>
                              <div className="content">
                                  <a href="#">Proven Result</a>
                                  <p>We have a track record of delivering tangible results for our clients. From increasing website traffic and improving search. </p>
                              </div>
                          </div>
                          <div className="space20"></div>
                          <div className="works-content-box">
                              <div className="icons">
                                  <img src="/assets/img/icons/works-icons8.svg" alt="" />
                              </div>
                              <div className="content">
                                  <a href="#">Customized Solutions</a>
                                  <p>We believe that one size does not fit all when it comes to digital marketing. That's why we take the time to understand your SEO. </p>
                              </div>
                          </div>
                          <div className="space20"></div>
                          <div className="works-content-box">
                              <div className="icons">
                                  <img src="/assets/img/icons/works-icons9.svg" alt="" />
                              </div>
                              <div className="content">
                                  <a href="#">Dedicated Support</a>
                                  <p>Your success is our top priority. That's why provide dedicated support and guidance every step of the way to running seo.</p>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="col-lg-6">
                      <div className="about-all-images-area">
                          <img src="/assets/img/elements/elements14.png" alt="" className="elements12 keyframe5" />
                          <img src="/assets/img/elements/elements15.png" alt="" className="elements13 keyframe5" />
                          <div className="row">
                            <div className="col-lg-6 col-md-6">
                              <div className="img1 image-anime">
                                  <div className="space100"></div>
                                <img src="/assets/img/all-images/about-img6.png" alt="" />
                              </div>
                            </div>
                            <div className="col-lg-6 col-md-6">
                              <div className="img2 image-anime">
                                <img src="/assets/img/all-images/about-img5.png" alt="" />
                              </div>
                            </div>
                          </div>
                        </div>
                  </div>
              </div>
          </div>
      </div>
      {/*===== WHY CHOOSE US AREA ENDS =======*/}

      {/*===== VALUE/MISSION/VISION AREA STARTS =======*/}
      <div className="service2-section-area sp1 bg2">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 m-auto">
              <div className="service2-header heading2 text-center">
                <img src="/assets/img/elements/star7.png" alt="" className="star2 keyframe5" />
                <img src="/assets/img/elements/star7.png" alt="" className="star3 keyframe5" />
                <h5>Our Value</h5>
                <h2>Tailored Solutions, Proven Results, <br className="d-md-block d-none" /> And Exceptional Service</h2>
                <p>We pride ourselves on delivering a value proposition that goes beyond expectations. Our <br className="d-md-block d-none" /> approach is centered on understanding your business inside</p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-7">
              <div className="images-content-area">
                <div className="img1">
                  <img src="/assets/img/all-images/service-img1.png" alt="" />
                </div>
                <div className="content-area">
                  <h5>Our Value</h5>
                  <a href="#" className="text">Explore Our Unique Value Proposition &amp; How We Drive Business Growth</a>
                  <p>we're committed to delivering exceptional value to our clients. We understand that every business is unique, personalized approach to every project we undertake.</p>
                  <div className="btn-area">
                    <a href="#" className="header-btn1">Learn More <span><i className="fa-solid fa-arrow-right"></i></span></a>
                  </div>
                </div>
                <div className="arrow-area">
                  <a href="#"><i className="fa-solid fa-arrow-right"></i></a>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="service-all-boxes">
                <div className="row">
                  <div className="col-lg-12 col-md-6">
                    <div className="service2-auhtor-boxarea">
                      <div className="arrow">
                        <a href="#"><i className="fa-solid fa-arrow-right"></i></a>
                      </div>
                      <div className="content-area">
                        <h5>Our Mission</h5>
                        <a href="#">We strive to be more than just a service provider; we aim to be trusted SEOC </a>
                        <p>By staying true to our mission and values, we are committed to helping businesses of all sizes achieve their goals, realize their potential shape.</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-12 col-md-6">
                    <div className="service2-auhtor2-boxarea">
                      <div className="arrow">
                        <a href="#"><i className="fa-solid fa-arrow-right"></i></a>
                      </div>
                      <div className="content-area">
                        <h5>Our Vision</h5>
                        <a href="#">We aspire to create a world where every business owner feels empowered</a>
                        <p>By staying true to our vision and values, we are committed to driving positive change and shaping a brighter future for businesses and communities.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*===== VALUE/MISSION/VISION AREA ENDS =======*/}

      {/*===== HISTORY AREA STARTS =======*/}
      <div className="history-inner-section-area">
          <div className="container">
              <div className="row">
                  <div className="col-lg-8 m-auto">
                      <div className="history-header-area text-center heading2">
                          <img src="/assets/img/elements/star7.png" alt="" className="star2 keyframe5" />
                          <img src="/assets/img/elements/star7.png" alt="" className="star3 keyframe5" />
                          <h5>Our History</h5>
                          <h2>Our Journey: Charting the <br className="d-lg-block d-none" /> Evolution of SEOC</h2>
                      </div>
                  </div>
              </div>
              <div className="row align-items-center">
                  <div className="col-lg-6">
                      <div className="about-all-images-area">
                          <img src="/assets/img/elements/elements14.png" alt="" className="elements12 keyframe5" />
                          <img src="/assets/img/elements/elements15.png" alt="" className="elements13 keyframe5" />
                          <div className="row">
                            <div className="col-lg-6 col-md-6">
                              <div className="img1 image-anime">
                                  <div className="space100"></div>
                                <img src="/assets/img/all-images/history-img1.png" alt="" />
                              </div>
                            </div>
                            <div className="col-lg-6 col-md-6">
                              <div className="img2 image-anime">
                                <img src="/assets/img/all-images/history-img2.png" alt="" />
                              </div>
                            </div>
                          </div>
                        </div>
                  </div>

                  <div className="col-lg-6">
                      <div className="history-content-area">
                          <div className="row">
                              <div className="col-lg-6 col-md-6">
                                  <div className="history-box-content">
                                      <h5>2015</h5>
                                      <a href="#">Inception and Founding</a>
                                      <p>SEOC was founded with a vision to revolutionize the digital marketing industry and provide innovation.</p>
                                      <a href="#" className="readmore">Read More <i className="fa-solid fa-arrow-right"></i></a>
                                  </div>
                              </div>

                              <div className="col-lg-6 col-md-6">
                                  <div className="history-box-content">
                                      <h5>2016</h5>
                                      <a href="#">Expansion and Growth</a>
                                      <p>The team expanded to include additional members with diverse skill sets and expertise allowing us.</p>
                                      <a href="#" className="readmore">Read More <i className="fa-solid fa-arrow-right"></i></a>
                                  </div>
                              </div>

                              <div className="col-lg-6 col-md-6">
                                  <div className="history-box-content">
                                      <h5>2017</h5>
                                      <a href="#">Recognition and Awards</a>
                                      <p>We were honored to recognized as a leader in the digital marketing space and received accolades customer.</p>
                                      <a href="#" className="readmore">Read More <i className="fa-solid fa-arrow-right"></i></a>
                                  </div>
                              </div>

                              <div className="col-lg-6 col-md-6">
                                  <div className="history-box-content">
                                      <h5>2018</h5>
                                      <a href="#">Launch of New Services</a>
                                      <p>Building on our success, SEOC expanded our service offerings to better meet the evolving needs. </p>
                                      <a href="#" className="readmore">Read More <i className="fa-solid fa-arrow-right"></i></a>
                                  </div>
                              </div>

                              <div className="col-lg-6 col-md-6">
                                  <div className="history-box-content">
                                      <h5>2019</h5>
                                      <a href="#">Strategic Partnerships </a>
                                      <p>SEOC formed strategic partnerships and collaborations with industry leaders and technology providers. </p>
                                      <a href="#" className="readmore">Read More <i className="fa-solid fa-arrow-right"></i></a>
                                  </div>
                              </div>

                              <div className="col-lg-6 col-md-6">
                                  <div className="history-box-content">
                                      <h5>2020</h5>
                                      <a href="#">Continued Growth Success</a>
                                      <p>2020 continued to experience steady growth and success, despite ongoing challenges in external environment.</p>
                                      <a href="#" className="readmore">Read More <i className="fa-solid fa-arrow-right"></i></a>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      {/*===== HISTORY AREA ENDS =======*/}

      {/*===== SKILLS AREA STARTS =======*/}
      <div className="skills-section-area sp2">
          <img src="/assets/img/bg/cta-bg1.png" alt="" className="cta-bg1 aniamtion-key-2" />
          <img src="/assets/img/bg/cta-bg2.png" alt="" className="cta-bg2 aniamtion-key-1" />
          <div className="container">
              <div className="row">
                  <div className="col-lg-3 m-auto">
                      <div className="skills-header text-center heading2">
                          <h5>Skills</h5>
                          <h2>Our Skills</h2>
                      </div>
                  </div>
              </div>
              <div className="col-lg-10 m-auto">
                <div className="circle-progress-area">
                  <div className="row">
                    <div className="col-lg-3 col-md-6">
                      <div className="progresbar">
                        <div className="progressbar">
                           <div className="circle" data-percent="82">
                            <canvas></canvas>
                               <div>82%</div>
                          </div>
                        </div>
                        <p>S M M</p>
                      </div>
                    </div>

                    <div className="col-lg-3 col-md-6">
                      <div className="progresbar">
                        <div className="progressbar">
                          <div className="circle two" data-percent="49">
                            <canvas></canvas>
                              <div>49%</div>
                         </div>
                       </div>
                       <p>P P C</p>
                      </div>
                    </div>

                    <div className="col-lg-3 col-md-6">
                      <div className="progresbar">
                        <div className="progressbar">
                          <div className="circle three" data-percent="99">
                            <canvas></canvas>
                             <div>99%</div>
                          </div>
                         </div>
                         <p>SEO</p>
                      </div>
                    </div>

                    <div className="col-lg-3 col-md-6">
                      <div className="progresbar">
                        <div className="progressbar">
                          <div className="circle four" data-percent="95">
                            <canvas></canvas>
                             <div>95%</div>
                          </div>
                         </div>
                         <p>Digital Marketing</p>
                      </div>
                    </div>
                </div>
                </div>
              </div>
          </div>
      </div>
      {/*===== SKILLS AREA ENDS =======*/}

      {/*===== TEAM AREA STARTS =======*/}
      <div className="team-inner-section-area sp2">
          <div className="container">
            <div className="row">
              <div className="col-lg-6 m-auto">
                <div className="team2-header-area text-center heading2">
                  <h5>Our Team</h5>
                  <h2>Meet With Our Expert Team</h2>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-3 col-md-6">
                <div className="team-boxarea">
                  <div className="img1">
                    <img src="/assets/img/all-images/team-img1.png" alt="" />
                  </div>
                  <ul>
                    <li><a href="#"><img src="/assets/img/icons/facebook.svg" alt="Facebook" /></a></li>
                    <li><a href="#"><img src="/assets/img/icons/instagram.svg" alt="Instagram" /></a></li>
                    <li><a href="#"><img src="/assets/img/icons/linkedin.svg" alt="LinkedIn" /></a></li>
                    <li><a href="#" className="m-0"><img src="/assets/img/icons/youtube.svg" alt="YouTube" /></a></li>
                  </ul>
                  <div className="content">
                    <a href="#">John Doe</a>
                    <p>CEO &amp; Founder</p>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="team-boxarea">
                  <div className="img1">
                    <img src="/assets/img/all-images/team-img2.png" alt="" />
                  </div>
                  <ul>
                      <li><a href="#"><img src="/assets/img/icons/facebook.svg" alt="Facebook" /></a></li>
                      <li><a href="#"><img src="/assets/img/icons/instagram.svg" alt="Instagram" /></a></li>
                      <li><a href="#"><img src="/assets/img/icons/linkedin.svg" alt="LinkedIn" /></a></li>
                      <li><a href="#" className="m-0"><img src="/assets/img/icons/youtube.svg" alt="YouTube" /></a></li>
                  </ul>
                  <div className="content">
                    <a href="#">Jane Smith</a>
                    <p>Digital Marketing Officer</p>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="team-boxarea">
                  <div className="img1">
                    <img src="/assets/img/all-images/team-img3.png" alt="" />
                  </div>
                  <ul>
                      <li><a href="#"><img src="/assets/img/icons/facebook.svg" alt="Facebook" /></a></li>
                      <li><a href="#"><img src="/assets/img/icons/instagram.svg" alt="Instagram" /></a></li>
                      <li><a href="/assets/img/icons/linkedin.svg" alt="LinkedIn" /></li>
                      <li><a href="#" className="m-0"><img src="/assets/img/icons/youtube.svg" alt="YouTube" /></a></li>
                  </ul>
                  <div className="content">
                    <a href="#">Sarah Thompson </a>
                    <p>Web Designer</p>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="team-boxarea m-0">
                  <div className="img1">
                    <img src="/assets/img/all-images/team-img4.png" alt="" />
                  </div>
                  <ul>
                      <li><a href="#"><img src="/assets/img/icons/facebook.svg" alt="Facebook" /></a></li>
                      <li><a href="#"><img src="/assets/img/icons/instagram.svg" alt="Instagram" /></a></li>
                      <li><a href="/assets/img/icons/linkedin.svg" alt="LinkedIn" /></li>
                      <li><a href="#" className="m-0"><img src="/assets/img/icons/youtube.svg" alt="YouTube" /></a></li>
                  </ul>
                  <div className="content">
                    <a href="#">David Garcia</a>
                    <p>Content Writer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/*===== TEAM AREA ENDS =======*/}

      {/*===== TESTIMONIAL AREA STARTS =======*/}
      <div className="testimonial1-section-area sp1 bg2">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 m-auto">
              <div className="testimonial-header heading2 text-center">
                <img src="/assets/img/elements/star7.png" alt="" className="star2 keyframe5" />
                <img src="/assets/img/elements/star7.png" alt="" className="star3 keyframe5" />
                <h5>Testimonials</h5>
                <h2>What Our Client Say <br className="d-md-block d-none" /> On Google Reviews</h2>
                <p>Don't just take our word for it. Hear what our satisfied clients <br className="d-md-block d-none" /> have to say about their experience partnering with SEOC</p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-8 m-auto">
              <div className="testimonials-slider-area owl-carousel">
                <div className="testimonial-boxarea">
                  <div className="row">
                    <div className="col-lg-5">
                      <div className="pera">
                        <p>"Working with SEOC has been a game-changer for our business. Their expertise in SEO and digital marketing has helped us achieve remarkable results and significantly increase our online visibility.</p>
                        <div className="space100"></div>
                        <div className="space30"></div>
                        <div className="list-area">
                          <div className="list">
                            <ul>
                              <li><i className="fa-solid fa-star"></i></li>
                              <li><i className="fa-solid fa-star"></i></li>
                              <li><i className="fa-solid fa-star"></i></li>
                              <li><i className="fa-solid fa-star"></i></li>
                              <li><i className="fa-solid fa-star"></i></li>
                            </ul>
                            <a href="#">John Doe</a>
                          </div>
                          <img src="/assets/img/icons/google.svg" alt="Google Review" />
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-7">
                      <div className="images">
                        <img src="/assets/img/all-images/testimonial-img1.png" alt="" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="testimonial-boxarea">
                  <div className="row">
                    <div className="col-lg-5">
                      <div className="pera">
                        <p>"Working with SEOC has been a game-changer for our business. Their expertise in SEO and digital marketing has helped us achieve remarkable results and significantly increase our online visibility.</p>
                        <div className="space100"></div>
                        <div className="space30"></div>
                        <div className="list-area">
                          <div className="list">
                            <ul>
                              <li><i className="fa-solid fa-star"></i></li>
                              <li><i className="fa-solid fa-star"></i></li>
                              <li><i className="fa-solid fa-star"></i></li>
                              <li><i className="fa-solid fa-star"></i></li>
                              <li><i className="fa-solid fa-star"></i></li>
                            </ul>
                            <a href="#">John Doe</a>
                          </div>
                          <img src="/assets/img/icons/google.svg" alt="Google Review" />
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-7">
                      <div className="images">
                        <img src="/assets/img/all-images/testimonial-img2.png" alt="" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="testimonial-boxarea">
                  <div className="row">
                    <div className="col-lg-5">
                      <div className="pera">
                        <p>"Working with SEOC has been a game-changer for our business. Their expertise in SEO and digital marketing has helped us achieve remarkable results and significantly increase our online visibility.</p>
                        <div className="space100"></div>
                        <div className="space30"></div>
                        <div className="list-area">
                          <div className="list">
                            <ul>
                              <li><i className="fa-solid fa-star"></i></li>
                              <li><i className="fa-solid fa-star"></i></li>
                              <li><i className="fa-solid fa-star"></i></li>
                              <li><i className="fa-solid fa-star"></i></li>
                              <li><i className="fa-solid fa-star"></i></li>
                            </ul>
                            <a href="#">John Doe</a>
                          </div>
                          <img src="/assets/img/icons/google.svg" alt="Google Review" />
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-7">
                      <div className="images">
                        <img src="/assets/img/all-images/testimonial-img2.png" alt="" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*===== TESTIMONIAL AREA ENDS =======*/}

      {/*===== CTA AREA STARTS =======*/}
      <div className="cta-section-area">
        <img src="/assets/img/bg/cta-bg1.png" alt="" className="cta-bg1 aniamtion-key-2" />
        <img src="/assets/img/bg/cta-bg2.png" alt="" className="cta-bg2 aniamtion-key-1" />
        <div className="container">
          <div className="row">
            <div className="col-lg-12 m-auto">
              <div className="cta-header-area text-center sp4 heading2">
                <h2>Ready To Take Your SEO To <br className="d-md-block d-none" /> The Next Level</h2>
                <p>Effective SEO strategies not only elevate a website's visibility but also drive <br className="d-md-block d-none" /> targeted traffic, enhance user experience,</p>
                <div className="btn-area text-center">
                  <Link href="/contact-us" className="header-btn1">Free Consultation <span><i className="fa-solid fa-arrow-right"></i></span></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*===== CTA AREA ENDS =======*/}
      
      <Footer />
    </>
  );
}
