"use client";

import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      
      {/*===== HERO AREA STARTS =======*/}
      <div className="hero1-section-area" style={{ backgroundImage: 'url(/assets/img/bg/header-bg1.png)' }}>
        <img src="/assets/img/elements/elements1.png" alt="" className="elements1 aniamtion-key-1" />
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="header-main-content heading1">
                <h5><img src="/assets/img/icons/logo-icons.svg" alt="" />Full-Service Digital Marketing Partner</h5>
                <h1 className="text-anime-style-3">Grow Your Brand With Websites, Apps &amp; Digital Marketing</h1>
                <p data-aos="fade-left" data-aos-duration="1000">Welcome to Connecting Scripts — we build websites, apps and campaigns that turn <br className="d-lg-block d-none" /> your online presence into real, measurable business growth.</p>
                <div className="btn-area" data-aos="fade-left" data-aos-duration="1200">
                  <a href="#" className="header-btn1">Get Free Strategy Call <span><i className="fa-solid fa-arrow-right"></i></span></a>
                  <a href="#" className="header-btn2">See Our Work <span><i className="fa-solid fa-arrow-right"></i></span></a>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="header-images-area">
                <div className="main-images-area">
                  <div className="img1">
                    <img src="/assets/img/all-images/header-img1.png" alt="" data-aos="zoom-in" data-aos-duration="1000" />
                  </div>
                  <div className="img2">
                    <img src="/assets/img/bg/header-imgbg.png" alt="" />
                  </div>
                  <div className="icons-area">
                    <img src="/assets/img/icons/sound-icons1.svg" alt="" className="sound-icons1 aniamtion-key-1" />
                    <img src="/assets/img/icons/lite-icons1.svg" alt="" className="lite-icons1 aniamtion-key-1" />
                  </div>
                  <div className="auhtor-icons">
                    <img src="/assets/img/elements/elements2.png" alt="" className="elements2" />
                    <img src="/assets/img/elements/elements3.png" alt="" className="elements3" />
                  </div>
                  <div className="auhtor-images">
                    <img src="/assets/img/all-images/header-author-img1.png" alt="" className="header-author-img1 aniamtion-key-2" />
                    <img src="/assets/img/all-images/header-author-img2.png" alt="" className="header-author-img2 aniamtion-key-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*===== HERO AREA ENDS =======*/}

      {/*===== BRAND SLIDER AREA STARTS =======*/}
      <div className="slider-section-area sp5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-2">
              <div className="sldier-head">
                <p>Trusted by <br className="d-lg-block d-none" /> Growing Brands</p>
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

      <div className="all-section-bg" style={{ backgroundImage: 'url(/assets/img/bg/pages-bg1.png)', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}>
        {/*===== ABOUT AREA STARTS =======*/}
        <div className="about1-section-area sp6">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-4">
                <div className="about-images">
                 <figure className="image-anime reveal">
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
                  <h2 className="text-anime-style-3">Full-Stack Digital Marketing Under One Roof.</h2>
                  <p data-aos="fade-left" data-aos-duration="1000">Welcome to Connecting Scripts, your trusted partner for websites, apps, SEO, ads and design. With 5+ years of proven expertise, we help brands win the digital landscape.</p>
                  <div className="btn-area" data-aos="fade-left" data-aos-duration="1200">
                    <Link href="/about-us" className="header-btn1">Learn More <span><i className="fa-solid fa-arrow-right"></i></span></Link>
                  </div>
                </div>
              </div>
              <div className="col-lg-3">
                <div className="about-auhtor-images">
                  <img src="/assets/img/elements/elements5.png" alt="" className="elements5 keyframe5" />
                  <figure className="image-anime reveal">
                    <img src="/assets/img/all-images/about-img2.png" alt="" />
                   </figure>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*===== ABOUT AREA ENDS =======*/}

        {/*===== SERVICE AREA STARTS =======*/}
        <div className="service1-section-area sp9">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 m-auto">
                <div className="service-header-area heading2 text-center">
                  <img src="/assets/img/elements/star2.png" alt="" className="star2 keyframe5" />
                  <img src="/assets/img/elements/star2.png" alt="" className="star3 keyframe5" />
                  <h2 className="text-anime-style-3">Popular Digital Marketing Services <br className="d-md-block d-none" /> To Build Your Business</h2>
                  <p data-aos="fade-up" data-aos-duration="1000">Our expert team specializes in delivering tailored solutions designed to elevate <br className="d-md-block d-none" /> your brand and drive measurable, trackable results. </p>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="service-all-boxes-area">
                  <div className="service-boxarea" data-aos="zoom-in" data-aos-duration="800">
                    <Link href="/services">Search Engine Optimization (SEO)</Link>
                    <div className="space40"></div>
                    <img src="/assets/img/icons/service-icon1.svg" alt="" />
                    <div className="space40"></div>
                    <p>Enhance your online visibility &amp; drive organic traffic with our proven SEO techniques. We optimize your site to rank higher, faster.</p>
                  </div>

                  <div className="service-boxarea box2" data-aos="zoom-in" data-aos-duration="1000">
                    <Link href="/services">Google &amp; Meta Ads Management</Link>
                    <div className="space40"></div>
                    <img src="/assets/img/icons/service-icon2.svg" alt="" />
                    <div className="space40"></div>
                    <p>Reach your audience instantly and drive qualified leads with targeted Google &amp; Meta ad campaigns built, tracked and optimized by us.</p>
                  </div>

                  <div className="service-boxarea box3" data-aos="zoom-in" data-aos-duration="1200">
                    <Link href="/services">Social Media Management</Link>
                    <div className="space66"></div>
                    <img src="/assets/img/icons/service-icon3.svg" alt="" />
                    <div className="space40"></div>
                    <p>Build a strong brand presence and engage your audience across every platform. We plan, design and post strategic content that grows your brand.</p>
                  </div>

                  <div className="service-boxarea box4" data-aos="zoom-in" data-aos-duration="1400">
                    <Link href="/services">Website &amp; App Development</Link>
                    <div className="space40"></div>
                    <img src="/assets/img/icons/service-icon4.svg" alt="" />
                    <div className="space40"></div>
                    <p>Make a lasting impression with a professionally designed website or app. Our development team ensures your product is fast and reliable.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*===== SERVICE AREA ENDS =======*/}

        {/*===== SERVICE AREA 2 STARTS =======*/}
        <div className="service2-section-area sp6">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 m-auto">
                <div className="service2-header heading2 text-center">
                  <img src="/assets/img/elements/star2.png" alt="" className="star2 keyframe5" />
                  <img src="/assets/img/elements/star2.png" alt="" className="star3 keyframe5" />
                  <h2 className="text-anime-style-3">Tailored Solutions, Proven Results, <br className="d-md-block d-none" /> And Exceptional Service</h2>
                  <p data-aos="fade-up" data-aos-duration="1000">We pride ourselves on delivering a value proposition that goes beyond expectations. Our <br className="d-md-block d-none" /> approach starts with truly understanding your business inside</p>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-7">
                <div className="images-content-area" data-aos="zoom-in" data-aos-duration="1000">
                  <div className="img1">
                    <img src="/assets/img/all-images/service-img1.png" alt="" />
                  </div>
                  <div className="content-area">
                    <h5>Our Value</h5>
                    <Link href="/services" className="text text-anime-style-3">Explore Our Unique Approach &amp; How We Drive Real Business Growth</Link>
                    <p data-aos="fade-up" data-aos-duration="1000">we're committed to delivering exceptional value to every client. We know every business is unique, so Connecting Scripts builds a personalized plan for every project we take on.</p>
                    <div className="btn-area" data-aos="fade-up" data-aos-duration="1200">
                      <Link href="/services" className="header-btn1">Learn More <span><i className="fa-solid fa-arrow-right"></i></span></Link>
                    </div>
                  </div>
                  <div className="arrow-area">
                    <Link href="/services"><i className="fa-solid fa-arrow-right"></i></Link>
                  </div>
                </div>
              </div>
              <div className="col-lg-5">
                <div className="service-all-boxes">
                  <div className="row">
                    <div className="col-lg-12 col-md-6">
                      <div className="service2-auhtor-boxarea" data-aos="zoom-out" data-aos-duration="1000">
                        <div className="arrow">
                          <Link href="/services"><i className="fa-solid fa-arrow-right"></i></Link>
                        </div>
                        <div className="content-area">
                          <h5>Our Mission</h5>
                          <Link href="/services">We strive to be more than just a vendor; we aim to be your trusted growth partner</Link>
                          <p>By staying true to our mission and values, we are committed to helping businesses of every size hit their goals and unlock their full potential.</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-12 col-md-6">
                      <div className="service2-auhtor2-boxarea" data-aos="zoom-out" data-aos-duration="1200">
                        <div className="arrow">
                          <Link href="/services"><i className="fa-solid fa-arrow-right"></i></Link>
                        </div>
                        <div className="content-area">
                          <h5>Our Vision</h5>
                          <Link href="/services">We aspire to create a world where every business owner feels empowered</Link>
                          <p>By staying true to our vision and values, we are committed to driving real growth and shaping a brighter digital future for brands and communities.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*===== SERVICE AREA 2 ENDS =======*/}

        {/*===== CASE AREA STARTS =======*/}
        <div className="case1-section-area">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 m-auto">
                <div className="case-header-area heading2 text-center">
                  <img src="/assets/img/elements/star2.png" alt="" className="star2 keyframe5" />
                  <img src="/assets/img/elements/star2.png" alt="" className="star3 keyframe5" />
                  <h2 className="text-anime-style-3">Benefits of Working With a Full-Service Agency</h2>
                  <p data-aos="fade-up" data-aos-duration="1000">By investing in strategic website, SEO and marketing initiatives, businesses can <br className="d-md-block d-none" /> unlock a wide range of measurable benefits.</p>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12" data-aos="zoom-out" data-aos-duration="1200">
                  <div className="cs_case_study_1_list">
                    <div className="cs_case_study cs_style_1 cs_hover_active active" data-aos="fade-up" data-aos-duration="800">
                      <a href="#" className="cs_case_study_thumb cs_bg_filed" style={{ backgroundImage: 'url(/assets/img/all-images/case-img1.png)' }}></a>
                      <div className="content-area1">
                        <a href="#">Website &amp; Mobile App Development</a>
                      </div>
                      <div className="content-area">
                        <a href="#">Website &amp; Mobile App Development </a>
                        <p>We build fast, mobile-friendly websites and apps that turn visitors into leads, so your online presence works as hard as your sales team.</p>
                      </div>
                    </div>
                    <div className="cs_case_study cs_style_1 cs_hover_active" data-aos="fade-up" data-aos-duration="900">
                      <a href="#" className="cs_case_study_thumb cs_case_study_thumb2 cs_bg_filed" style={{ backgroundImage: 'url(/assets/img/all-images/case-img2.png)' }}></a>
                      <div className="content-area1">
                        <a href="#">Search Engine Optimization</a>
                      </div>
                      <div className="content-area">
                        <a href="#">Search Engine Optimization</a>
                        <p>We understand the critical role that consistent SEO plays in shaping your visibility, helping your business get found before competitors do.</p>
                      </div>
                    </div>
                    <div className="cs_case_study cs_style_1 cs_hover_active" data-aos="fade-up" data-aos-duration="1000">
                      <a href="#" className="cs_case_study_thumb cs_case_study_thumb3 cs_bg_filed" style={{ backgroundImage: 'url(/assets/img/all-images/case-img3.png)' }}></a>
                      <div className="content-area1">
                        <a href="#">Google &amp; Meta Ads</a>
                      </div>
                      <div className="content-area">
                        <a href="#">Google &amp; Meta Ads</a>
                        <p>We understand the critical role that targeted Google and Meta ad campaigns play in shaping instant visibility and driving qualified leads.</p>
                      </div>
                    </div>
                    <div className="cs_case_study cs_style_1 cs_hover_active" data-aos="fade-up" data-aos-duration="1100">
                      <a href="#" className="cs_case_study_thumb cs_case_study_thumb4 cs_bg_filed" style={{ backgroundImage: 'url(/assets/img/all-images/case-img4.png)' }}></a>
                      <div className="content-area1">
                        <a href="#">Social Media Management</a>
                      </div>
                      <div className="content-area">
                        <a href="#">Social Media Management</a>
                        <p>We understand the critical role that consistent, on-brand social content plays in shaping your community and keeping your audience engaged.</p>
                      </div>
                    </div>
                    <div className="cs_case_study cs_style_1 cs_hover_active" data-aos="fade-up" data-aos-duration="1200">
                      <a href="#" className="cs_case_study_thumb cs_case_study_thumb5 cs_bg_filed" style={{ backgroundImage: 'url(/assets/img/all-images/case-img5.png)' }}></a>
                      <div className="content-area1">
                        <a href="#">Graphic Designing</a>
                      </div>
                      <div className="content-area">
                        <a href="#">Graphic Designing</a>
                        <p>We understand the critical role that sharp, on-brand visual design plays in shaping first impressions across your website and social channels.</p>
                      </div>
                    </div>
                    <div className="cs_case_study cs_style_1 cs_hover_active" data-aos="fade-up" data-aos-duration="1300">
                      <a href="#" className="cs_case_study_thumb cs_case_study_thumb6 cs_bg_filed" style={{ backgroundImage: 'url(/assets/img/all-images/case-img6.png)' }}></a>
                      <div className="content-area1">
                        <a href="#">Video Editing</a>
                      </div>
                      <div className="content-area">
                        <a href="#">Video Editing</a>
                        <p>We understand the critical role that polished, scroll-stopping video editing plays in shaping how long people actually watch your content.</p>
                      </div>
                    </div>
                    <div className="cs_case_study cs_style_1 cs_hover_active " style={{ margin: '0 !important' }} data-aos="fade-up" data-aos-duration="1400">
                      <a href="#" className="cs_case_study_thumb cs_case_study_thumb7 cs_bg_filed" style={{ backgroundImage: 'url(/assets/img/all-images/case-img7.png)' }}></a>
                      <div className="content-area1">
                        <a href="#">Custom Software Development</a>
                      </div>
                      <div className="content-area">
                        <a href="#">Custom Software Development</a>
                        <p>We understand the critical role that custom-built software plays in shaping efficient workflows once you outgrow generic, off-the-shelf tools.</p>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
        {/*===== CASE AREA ENDS =======*/}

        {/*===== TESTIMONIAL AREA STARTS =======*/}
        <div className="testimonial1-section-area sp6">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 m-auto">
                <div className="testimonial-header heading2 text-center">
                  <img src="/assets/img/elements/star2.png" alt="" className="star2 keyframe5" />
                  <img src="/assets/img/elements/star2.png" alt="" className="star3 keyframe5" />
                  <h2 className="text-anime-style-3">What Our Clients Say <br className="d-md-block d-none" /> On Google Reviews</h2>
                  <p data-aos="fade-up" data-aos-duration="1000">Don't just take our word for it. Hear what our satisfied clients <br className="d-md-block d-none" /> have to say about their experience partnering with Connecting Scripts</p>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-8 m-auto" data-aos="fade-up" data-aos-duration="1000">
                <div className="testimonials-slider-area owl-carousel">
                  <div className="testimonial-boxarea">
                    <div className="row">
                      <div className="col-lg-5">
                        <div className="pera">
                          <p>"Working with Connecting Scripts has been a game-changer for our business. Their SEO and website work helped us rank higher and finally convert visitors into paying customers.</p>
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
                              <a href="#">Mr. Ankur Verma</a>
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
                          <p>"Connecting Scripts completely rebuilt our social presence. Their content and ad strategy took us from a handful of inquiries a month to a full booking calendar.</p>
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
                              <a href="#">Mr. Ashish Vyas</a>
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
                          <p>"From our website to our ad campaigns, Connecting Scripts handled everything with real strategy behind it. Our leads tripled within the first two months.</p>
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
                              <a href="#">Mr. Hamza</a>
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

        {/*===== BLOG AREA STARTS =======*/}
        <div className="blog1-scetion-area">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 m-auto">
                <div className="blog-hedaer-area heading2 text-center">
                  <img src="/assets/img/elements/star2.png" alt="" className="star2 keyframe5" />
                  <img src="/assets/img/elements/star2.png" alt="" className="star3 keyframe5" />
                  <h2 className="text-anime-style-3">Insights &amp; Strategy: <br className="d-md-block d-none" /> Our Latest Blog Posts</h2>
                  <p data-aos="fade-up" data-aos-duration="1000">Explore our blog to discover actionable insights, success stories, and <br className="d-md-block d-none" /> expert advice that can help drive real growth for your business.</p>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-4 col-md-6">
                <div className="blog-author-boxarea" data-aos="fade-right" data-aos-duration="800">
                  <div className="img1">
                    <img src="/assets/img/all-images/blog-img1.png" alt="" />
                  </div>
                  <div className="content-area">
                    <div className="tags-area">
                      <ul>
                        <li><a href="#"><img src="/assets/img/icons/contact1.svg" alt="" />Abhinav Jain</a></li>
                        <li><a href="#"><img src="/assets/img/icons/calender1.svg" alt="" />14 Jul 2026</a></li>
                      </ul>
                    </div>
                    <Link href="/blogs/blog-single">10 Essential SEO Tips to Boost Your Website's Ranking</Link>
                    <p>Looking to improve your website's visibility and attract more organic traffic this year?</p>
                    <Link href="/blogs/blog-single" className="readmore">Read More <i className="fa-solid fa-arrow-right"></i></Link>
                  </div>
                </div>
                <div className="space30 d-lg-none d-block"></div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="blog-author-boxarea" data-aos="fade-up" data-aos-duration="1000">
                  <div className="img1">
                    <img src="/assets/img/all-images/blog-img2.png" alt="" />
                  </div>
                  <div className="content-area">
                    <div className="tags-area">
                      <ul>
                        <li><a href="#"><img src="/assets/img/icons/contact1.svg" alt="" />Abhinav Jain</a></li>
                        <li><a href="#"><img src="/assets/img/icons/calender1.svg" alt="" />11 Jul 2026</a></li>
                      </ul>
                    </div>
                    <Link href="/blogs/blog-single">Google Ads vs Meta Ads: How to Maximize Your ROI</Link>
                    <p>Unlock the full potential of your ad budget with the right paid marketing strategy.</p>
                    <Link href="/blogs/blog-single" className="readmore">Read More <i className="fa-solid fa-arrow-right"></i></Link>
                  </div>
                </div>
                <div className="space30 d-lg-none d-block"></div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="blog-author-boxarea" data-aos="fade-left" data-aos-duration="1200">
                  <div className="img1">
                    <img src="/assets/img/all-images/blog-img3.png" alt="" />
                  </div>
                  <div className="content-area">
                    <div className="tags-area">
                      <ul>
                        <li><a href="#"><img src="/assets/img/icons/contact1.svg" alt="" />Abhinav Jain</a></li>
                        <li><a href="#"><img src="/assets/img/icons/calender1.svg" alt="" />06 Jul 2026</a></li>
                      </ul>
                    </div>
                    <Link href="/blogs/blog-single">Why Responsive Web Design Still Matters in the App Age</Link>
                    <p>With mobile devices dominating internet usage, responsive design is more crucial than ever.</p>
                    <Link href="/blogs/blog-single" className="readmore">Read More <i className="fa-solid fa-arrow-right"></i></Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*===== BLOG AREA ENDS =======*/}

        {/*===== CONTACT AREA STARTS =======*/}
        <div className="contact1-section-area sp6">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 m-auto">
                <div className="contact-header-area text-center heading2">
                  <img src="/assets/img/elements/star2.png" alt="" className="star2 keyframe5" />
                  <img src="/assets/img/elements/star2.png" alt="" className="star3 keyframe5" />
                  <h2 className="text-anime-style-3">Get In Touch With Us Today</h2>
                  <p>We're here to help! If you have any questions or would like to discuss <br className="d-md-block d-none" /> how our digital marketing services can grow your business,</p>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-5" data-aos="zoom-out" data-aos-duration="1000">
                <div className="contact-info-area">
                  <h3>Contact Info</h3>
                  <p>We're here to help! If you have any questions or would like to discuss how our digital marketing services can benefit your business,</p>
                  <div className="space32"></div>
                  <div className="contact-auhtor-box">
                    <div className="icons">
                      <img src="/assets/img/icons/location2.svg" alt="" />
                    </div>
                    <div className="content">
                      <h4>Our Location</h4>
                      <a href="#">Bangalore, India</a>
                    </div>
                  </div>
                  <div className="space40"></div>
                  <div className="contact-auhtor-box">
                    <div className="icons">
                      <img src="/assets/img/icons/phone2.svg" alt="" />
                    </div>
                    <div className="content">
                      <h4>Phone Number</h4>
                      <a href="tel:+919214544078">+91 92145 44078</a>
                    </div>
                  </div>
                  <div className="space40"></div>
                  <div className="contact-auhtor-box">
                    <div className="icons">
                      <img src="/assets/img/icons/email2.svg" alt="" />
                    </div>
                    <div className="content">
                      <h4>Email Address</h4>
                      <a href="mailto:sales@connectingscripts.co.in">sales@connectingscripts.co.in</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-7" data-aos="zoom-out" data-aos-duration="1200">
                <div className="contact-boxarea">
                   <h3>Get In Touch</h3>
                   <p>We're here to help! If you have any questions or would like to discuss <br className="d-lg-block d-none" /> how our digital marketing services can benefit your business,</p>
                   <form action="https://api.web3forms.com/submit" method="POST">
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="input-area">
                          <input type="text" placeholder="First Name" required />
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="input-area">
                          <input type="text" placeholder="Last Name" required />
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="input-area">
                          <input type="email" placeholder="Email Address" required />
                        </div>
                      </div>

                      <div className="col-lg-6">
                        <div className="input-area">
                          <input type="number" placeholder="Phone Number" required />
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="input-area">
                          <select name="country" id="country" className="country-area nice-select6" defaultValue="1">
                            <option value="1" data-display="Service Type">Service Type</option>
                            <option value="Website Development">Website Development</option>
                            <option value="Mobile App Development">Mobile App Development</option>
                            <option value="SEO">SEO</option>
                            <option value="Google & Meta Ads">Google &amp; Meta Ads</option>
                            <option value="Social Media Management">Social Media Management</option>
                            <option value="Graphic Design">Graphic Design</option>
                            <option value="Video Editing">Video Editing</option>
                            <option value="Custom Software Development">Custom Software Development</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="input-area">
                          <textarea placeholder="Your Message" required defaultValue=""></textarea>
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="input-area">
                          <button className="header-btn1">Get My Free Consultation <span><i className="fa-solid fa-arrow-right"></i></span></button>
                        </div>
                      </div>
                     </div>
                   </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*===== CONTACT AREA ENDS =======*/}

        {/*===== CTA AREA STARTS =======*/}
        <div className="cta-section-area">
          <img src="/assets/img/bg/cta-bg1.png" alt="" className="cta-bg1 aniamtion-key-2" />
          <img src="/assets/img/bg/cta-bg2.png" alt="" className="cta-bg2 aniamtion-key-1" />
          <div className="container">
            <div className="row">
              <div className="col-lg-12 m-auto">  
                <div className="cta-header-area text-center sp4 heading2">
                  <h2 className="text-anime-style-3">Ready To Take Your Brand To <br className="d-md-block d-none" /> The Next Level</h2>
                  <p data-aos="fade-up" data-aos-duration="1000">A complete digital strategy doesn't just boost visibility — it drives <br className="d-md-block d-none" /> targeted traffic, converts visitors, and grows revenue,</p>
                  <div className="btn-area text-center" data-aos="fade-up" data-aos-duration="1200">
                    <Link href="/contact-us" className="header-btn1">Free Consultation <span><i className="fa-solid fa-arrow-right"></i></span></Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*===== CTA AREA ENDS =======*/}
      </div>
      
      <Footer />
    </>
  );
}
