import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function CaseStudies() {
  return (
    <>
      <Header />
      
      {/*===== HERO AREA STARTS =======*/}
      <div className="about-header-area" style={{ backgroundImage: 'url(/assets/img/bg/inner-header.png)', backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <img src="/assets/img/elements/elements1.png" alt="" className="elements1 aniamtion-key-1" />
          <img src="/assets/img/elements/star2.png" alt="" className="star2 keyframe5" />
          <div className="container">
              <div className="row">
                  <div className="col-lg-8 m-auto">
                      <div className="about-inner-header heading9 text-center">
                          <h1>Our Case Studies</h1>
                          <Link href="/">Home <i className="fa-solid fa-angle-right"></i> <span>Case Studies</span></Link>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      {/*===== HERO AREA ENDS =======*/}

      {/*===== CASE AREA STARTS =======*/}
      <div className="case-inner-section-area sp1">
          <div className="container">
              <div className="row">
                  <div className="col-lg-4 m-auto">
                      <div className="case-header text-center heading2">
                          <h5>Case Study</h5>
                          <h2>Our Case Studies</h2>
                      </div>
                      <div className="space50 d-lg-block d-none"></div>
                      <div className="space30 d-lg-none d-block"></div>
                  </div>
              </div>

              <div className="row">
                  <div className="col-lg-7 m-auto">
                      <div className="tabs-area text-center">
                          <ul className="nav nav-pills" id="pills-tab" role="tablist" >
                            <li className="nav-item" role="presentation" >
                              <button className="nav-link active" id="pills-email-tab" data-bs-toggle="pill" data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home" aria-selected="false">All</button>
                            </li>
                            <li className="nav-item" role="presentation" >
                              <button className="nav-link" id="pills-hyper-tab" data-bs-toggle="pill" data-bs-target="#pills-profile" type="button" role="tab" aria-controls="pills-profile" aria-selected="false">Branding</button>
                            </li>
                            <li className="nav-item" role="presentation" >
                              <button className="nav-link" id="pills-delivary-tab" data-bs-toggle="pill" data-bs-target="#pills-contact" type="button" role="tab" aria-controls="pills-contact" aria-selected="false">Digital PR</button>
                            </li>
                            <li className="nav-item" role="presentation" >
                              <button className="nav-link" id="pills-inbox-tab" data-bs-toggle="pill" data-bs-target="#pills-inbox" type="button" role="tab" aria-controls="pills-inbox" aria-selected="true">PPC</button>
                            </li>
                            <li className="nav-item" role="presentation" >
                              <button className="nav-link" id="pills-marketing-tab" data-bs-toggle="pill" data-bs-target="#pills-marketing" type="button" role="tab" aria-controls="pills-marketing" aria-selected="true">Marketing</button>
                            </li>
                            <li className="nav-item" role="presentation" >
                              <button className="nav-link " id="pills-seo-tab" data-bs-toggle="pill" data-bs-target="#pills-seo" type="button" role="tab" aria-controls="pills-seo" aria-selected="true">SEO</button>
                            </li>
                            <li className="nav-item" role="presentation" >
                              <button className="nav-link m-0" id="pills-web-tab" data-bs-toggle="pill" data-bs-target="#pills-web" type="button" role="tab" aria-controls="pills-web" aria-selected="true">Web</button>
                            </li>
                          </ul>
                        </div>
                  </div>
                  <div className="col-lg-12">
                      <div className="tabs-content-area">
                          <div className="tab-content" id="pills-tabContent" >
                            <div className="tab-pane fade active show" id="pills-home" role="tabpanel"  >
                              <div className="tabs-contents">
                                <div className="row align-items-center">
                                  <div className="col-lg-4 col-md-6">
                                      <div className="case-inner-box">
                                          <div className="img1 image-anime">
                                              <img src="/assets/img/all-images/case-img9.png" alt="" />
                                          </div>
                                          <div className="content-area">
                                            <div className="link-area">
                                                <a href="#" className="tags">#SEO</a>
                                                <a href="#" className="head">Comprehensive SEO Audit</a>
                                            </div>
                                            <div className="arrow">
                                              <a href="#"><i className="fa-solid fa-arrow-right"></i></a>
                                            </div>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="col-lg-4 col-md-6">
                                    <div className="case-inner-box">
                                      <div className="img1 image-anime">
                                          <img src="/assets/img/all-images/case-img10.png" alt="" />
                                      </div>
                                      <div className="content-area">
                                        <div className="link-area">
                                            <Link href="/case-study/case-single" className="tags">#Web</Link>
                                            <Link href="/case-study/case-single" className="head">Keyword Research &amp; Analysis</Link>
                                        </div>
                                        <div className="arrow">
                                          <Link href="/case-study/case-single"><i className="fa-solid fa-arrow-right"></i></Link>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="col-lg-4 col-md-6">
                                    <div className="case-inner-box">
                                      <div className="img1 image-anime">
                                          <img src="/assets/img/all-images/case-img11.png" alt="" />
                                      </div>
                                      <div className="content-area">
                                        <div className="link-area">
                                            <a href="#" className="tags">#PPC</a>
                                            <a href="#" className="head">One Page Optimization</a>
                                        </div>
                                        <div className="arrow">
                                          <a href="#"><i className="fa-solid fa-arrow-right"></i></a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="col-lg-4 col-md-6">
                                    <div className="case-inner-box">
                                      <div className="img1 image-anime">
                                          <img src="/assets/img/all-images/case-img12.png" alt="" />
                                      </div>
                                      <div className="content-area">
                                        <div className="link-area">
                                            <a href="#" className="tags">#Branding Marketing</a>
                                            <a href="#" className="head">Online Media Management</a>
                                        </div>
                                        <div className="arrow">
                                          <a href="#"><i className="fa-solid fa-arrow-right"></i></a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="col-lg-4 col-md-6">
                                    <div className="case-inner-box">
                                      <div className="img1 image-anime">
                                          <img src="/assets/img/all-images/case-img13.png" alt="" />
                                      </div>
                                      <div className="content-area">
                                        <div className="link-area">
                                            <a href="#" className="tags">#Web </a>
                                            <a href="#" className="head">Online Management</a>
                                        </div>
                                        <div className="arrow">
                                          <a href="#"><i className="fa-solid fa-arrow-right"></i></a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="col-lg-4 col-md-6">
                                    <div className="case-inner-box">
                                      <div className="img1 image-anime">
                                          <img src="/assets/img/all-images/case-img14.png" alt="" />
                                      </div>
                                      <div className="content-area">
                                        <div className="link-area">
                                            <a href="#" className="tags">#Branding, Marketing</a>
                                            <a href="#" className="head">Online Media Management</a>
                                        </div>
                                        <div className="arrow">
                                          <a href="#"><i className="fa-solid fa-arrow-right"></i></a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="col-lg-4 col-md-6">
                                    <div className="case-inner-box">
                                      <div className="img1 image-anime">
                                          <img src="/assets/img/all-images/case-img15.png" alt="" />
                                      </div>
                                      <div className="content-area">
                                        <div className="link-area">
                                            <a href="#" className="tags"># Branding, SEO</a>
                                            <a href="#" className="head">Domain Migration</a>
                                        </div>
                                        <div className="arrow">
                                          <a href="#"><i className="fa-solid fa-arrow-right"></i></a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="col-lg-4 col-md-6">
                                    <div className="case-inner-box">
                                      <div className="img1 image-anime">
                                          <img src="/assets/img/all-images/case-img16.png" alt="" />
                                      </div>
                                      <div className="content-area">
                                        <div className="link-area">
                                            <a href="#" className="tags">#Marketing, Web</a>
                                            <a href="#" className="head">Content Marketing</a>
                                        </div>
                                        <div className="arrow">
                                          <a href="#"><i className="fa-solid fa-arrow-right"></i></a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="col-lg-4 col-md-6">
                                    <div className="case-inner-box">
                                      <div className="img1 image-anime">
                                          <img src="/assets/img/all-images/case-img17.png" alt="" />
                                      </div>
                                      <div className="content-area">
                                        <div className="link-area">
                                            <a href="#" className="tags">#Digital, PR</a>
                                            <a href="#" className="head">Content Strategy</a>
                                        </div>
                                        <div className="arrow">
                                          <a href="#"><i className="fa-solid fa-arrow-right"></i></a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="tab-pane fade" id="pills-profile" role="tabpanel" >
                              <div className="tabs-contents" >
                                <div className="row align-items-center" >
                                  <div className="col-lg-4 col-md-6">
                                    <div className="case-inner-box">
                                      <div className="img1 image-anime">
                                          <img src="/assets/img/all-images/case-img12.png" alt="" />
                                      </div>
                                      <div className="content-area">
                                        <div className="link-area">
                                            <a href="#" className="tags">#Branding Marketing</a>
                                            <a href="#" className="head">Online Media Management</a>
                                        </div>
                                        <div className="arrow">
                                          <a href="#"><i className="fa-solid fa-arrow-right"></i></a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="col-lg-4 col-md-6">
                                    <div className="case-inner-box">
                                      <div className="img1 image-anime">
                                          <img src="/assets/img/all-images/case-img14.png" alt="" />
                                      </div>
                                      <div className="content-area">
                                        <div className="link-area">
                                            <a href="#" className="tags">#Branding, Marketing</a>
                                            <a href="#" className="head">Online Media Management</a>
                                        </div>
                                        <div className="arrow">
                                          <a href="#"><i className="fa-solid fa-arrow-right"></i></a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="col-lg-4 col-md-6">
                                    <div className="case-inner-box">
                                      <div className="img1 image-anime">
                                          <img src="/assets/img/all-images/case-img15.png" alt="" />
                                      </div>
                                      <div className="content-area">
                                        <div className="link-area">
                                            <a href="#" className="tags"># Branding, SEO</a>
                                            <a href="#" className="head">Domain Migration</a>
                                        </div>
                                        <div className="arrow">
                                          <a href="#"><i className="fa-solid fa-arrow-right"></i></a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                </div>
                              </div>
                            </div>
                            <div className="tab-pane fade" id="pills-contact" role="tabpanel"  >
                              <div className="tabs-contents" >
                                <div className="row align-items-center" >
                                  <div className="col-lg-4 col-md-6">
                                    <div className="case-inner-box">
                                      <div className="img1 image-anime">
                                          <img src="/assets/img/all-images/case-img17.png" alt="" />
                                      </div>
                                      <div className="content-area">
                                        <div className="link-area">
                                            <a href="#" className="tags">#Digital, PR</a>
                                            <a href="#" className="head">Content Strategy</a>
                                        </div>
                                        <div className="arrow">
                                          <a href="#"><i className="fa-solid fa-arrow-right"></i></a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="col-lg-4 col-md-6">
                                    <div className="case-inner-box">
                                      <div className="img1 image-anime">
                                          <img src="/assets/img/all-images/case-img15.png" alt="" />
                                      </div>
                                      <div className="content-area">
                                        <div className="link-area">
                                            <a href="#" className="tags"># Branding, SEO</a>
                                            <a href="#" className="head">Domain Migration</a>
                                        </div>
                                        <div className="arrow">
                                          <a href="#"><i className="fa-solid fa-arrow-right"></i></a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="tab-pane fade" id="pills-inbox" role="tabpanel" aria-labelledby="pills-inbox-tab" >
                              <div className="tabs-contents" >
                                <div className="row align-items-center" >
                                  <div className="col-lg-4 col-md-6">
                                    <div className="case-inner-box">
                                      <div className="img1 image-anime">
                                          <img src="/assets/img/all-images/case-img11.png" alt="" />
                                      </div>
                                      <div className="content-area">
                                        <div className="link-area">
                                            <a href="#" className="tags">#PPC</a>
                                            <a href="#" className="head">One Page Optimization</a>
                                        </div>
                                        <div className="arrow">
                                          <a href="#"><i className="fa-solid fa-arrow-right"></i></a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="tab-pane fade" id="pills-marketing" role="tabpanel" aria-labelledby="pills-marketing-tab" >
                              <div className="tabs-contents" >
                                <div className="row align-items-center" >
                                  <div className="col-lg-4 col-md-6">
                                    <div className="case-inner-box">
                                      <div className="img1 image-anime">
                                          <img src="/assets/img/all-images/case-img12.png" alt="" />
                                      </div>
                                      <div className="content-area">
                                        <div className="link-area">
                                            <a href="#" className="tags">#Branding Marketing</a>
                                            <a href="#" className="head">Online Media Management</a>
                                        </div>
                                        <div className="arrow">
                                          <a href="#"><i className="fa-solid fa-arrow-right"></i></a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="col-lg-4 col-md-6">
                                    <div className="case-inner-box">
                                      <div className="img1 image-anime">
                                          <img src="/assets/img/all-images/case-img14.png" alt="" />
                                      </div>
                                      <div className="content-area">
                                        <div className="link-area">
                                            <a href="#" className="tags">#Branding, Marketing</a>
                                            <a href="#" className="head">Online Media Management</a>
                                        </div>
                                        <div className="arrow">
                                          <a href="#"><i className="fa-solid fa-arrow-right"></i></a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="col-lg-4 col-md-6">
                                    <div className="case-inner-box">
                                      <div className="img1 image-anime">
                                          <img src="/assets/img/all-images/case-img16.png" alt="" />
                                      </div>
                                      <div className="content-area">
                                        <div className="link-area">
                                            <a href="#" className="tags">#Marketing, Web</a>
                                            <a href="#" className="head">Content Marketing</a>
                                        </div>
                                        <div className="arrow">
                                          <a href="#"><i className="fa-solid fa-arrow-right"></i></a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="tab-pane fade" id="pills-seo" role="tabpanel" aria-labelledby="pills-seo-tab" >
                              <div className="tabs-contents" >
                                <div className="row align-items-center" >
                                  <div className="col-lg-4 col-md-6">
                                    <div className="case-inner-box">
                                        <div className="img1 image-anime">
                                            <img src="/assets/img/all-images/case-img9.png" alt="" />
                                        </div>
                                        <div className="content-area">
                                          <div className="link-area">
                                              <a href="#" className="tags">#SEO</a>
                                              <a href="#" className="head">Comprehensive SEO Audit</a>
                                          </div>
                                          <div className="arrow">
                                            <a href="#"><i className="fa-solid fa-arrow-right"></i></a>
                                          </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6">
                                  <div className="case-inner-box">
                                    <div className="img1 image-anime">
                                        <img src="/assets/img/all-images/case-img15.png" alt="" />
                                    </div>
                                    <div className="content-area">
                                      <div className="link-area">
                                          <a href="#" className="tags"># Branding, SEO</a>
                                          <a href="#" className="head">Domain Migration</a>
                                      </div>
                                      <div className="arrow">
                                        <a href="#"><i className="fa-solid fa-arrow-right"></i></a>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                </div>
                              </div>
                            </div>

                            <div className="tab-pane fade" id="pills-web" role="tabpanel" aria-labelledby="pills-web-tab" >
                              <div className="tabs-contents" >
                                <div className="row align-items-center" >
                                  <div className="col-lg-4 col-md-6">
                                    <div className="case-inner-box">
                                      <div className="img1 image-anime">
                                          <img src="/assets/img/all-images/case-img10.png" alt="" />
                                      </div>
                                      <div className="content-area">
                                        <div className="link-area">
                                            <Link href="/case-study/case-single" className="tags">#Web</Link>
                                            <Link href="/case-study/case-single" className="head">Keyword Research &amp; Analysis</Link>
                                        </div>
                                        <div className="arrow">
                                          <Link href="/case-study/case-single"><i className="fa-solid fa-arrow-right"></i></Link>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="col-lg-4 col-md-6">
                                    <div className="case-inner-box">
                                      <div className="img1 image-anime">
                                          <img src="/assets/img/all-images/case-img13.png" alt="" />
                                      </div>
                                      <div className="content-area">
                                        <div className="link-area">
                                            <a href="#" className="tags">#Web </a>
                                            <a href="#" className="head">Online Management</a>
                                        </div>
                                        <div className="arrow">
                                          <a href="#"><i className="fa-solid fa-arrow-right"></i></a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="col-lg-4 col-md-6">
                                    <div className="case-inner-box">
                                      <div className="img1 image-anime">
                                          <img src="/assets/img/all-images/case-img16.png" alt="" />
                                      </div>
                                      <div className="content-area">
                                        <div className="link-area">
                                            <a href="#" className="tags">#Marketing, Web</a>
                                            <a href="#" className="head">Content Marketing</a>
                                        </div>
                                        <div className="arrow">
                                          <a href="#"><i className="fa-solid fa-arrow-right"></i></a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                </div>
                              </div>
                            </div>
                          </div>
                         </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="pagination-area">
                      <nav aria-label="Page navigation example">
                        <ul className="pagination justify-content-center">
                          <li className="page-item">
                            <a className="page-link" href="#"><i className="fa-solid fa-angle-left"></i></a>
                          </li>
                          <li className="page-item"><a className="page-link active" href="#">1</a></li>
                          <li className="page-item"><a className="page-link" href="#">2</a></li>
                          <li className="page-item"><a className="page-link" href="#">3</a></li>
                          <li className="page-item">
                            <a className="page-link" href="#"><i className="fa-solid fa-angle-right"></i></a>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  </div>
              </div>
          </div>
      </div>
      {/*===== CASE AREA ENDS =======*/}

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
