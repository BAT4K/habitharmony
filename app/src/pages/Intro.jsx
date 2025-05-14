// Intro.jsx
// Add useLocation to your imports
import React, { useEffect, useState, useRef, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Auth from "./Auth";
import { Capacitor } from '@capacitor/core';

// Import images
import Intro1 from "../assets/Intro1.webp";
import Intro4 from "../assets/Intro4.webp";

// Memoized slide component for performance
const Slide = memo(({ src, alt, eager }) => (
  <div className="w-screen h-screen">
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      loading={eager ? "eager" : "lazy"}
      draggable={false}
      decoding="async"
      style={{ willChange: 'transform' }}
    />
  </div>
));

export default function ImageSlider() {
  const navigate = useNavigate();
  const location = useLocation(); // Get location object
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const sliderRef = useRef(null);
  
  // Preload only the first image eagerly
  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    const img = new window.Image();
    img.src = Intro1;
    img.onload = () => setImagesLoaded(true);
    img.onerror = () => setImagesLoaded(true);
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  // Slide navigation based on location state
  useEffect(() => {
    if (imagesLoaded && sliderRef.current && location.state && typeof location.state.slide === 'number') {
      if (typeof sliderRef.current.slickGoTo === 'function') {
        sliderRef.current.slickGoTo(location.state.slide);
      }
    }
  }, [imagesLoaded, location.state, sliderRef]);

  const settings = {
    dots: true,
    arrows: false,
    infinite: false,
    speed: 250,
    slidesToShow: 1,
    slidesToScroll: 1,
    dotsClass: "slick-dots custom-dots",
    adaptiveHeight: false,
    swipeToSlide: true,
    touchThreshold: 10,
    cssEase: "linear",
    lazyLoad: "ondemand"
  };

  useEffect(() => {
    import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
      if (Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
        StatusBar.setBackgroundColor({ color: '#FDEAC6' });
        StatusBar.setStyle({ style: Style.Dark });
        StatusBar.setOverlaysWebView({ overlay: false });
        StatusBar.setNavigationBarColor({ color: '#F7B23D' });
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#FDEAC6');
      }
    });
  }, []);

  if (!imagesLoaded) {
    return (
      <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-white overflow-hidden">
      <Slider ref={sliderRef} {...settings}>
        <Slide src={Intro1} alt="Intro 1" eager={true} />
        <Slide src={Intro4} alt="Intro 4" eager={false} />
        <div className="w-screen h-screen">
          <Auth />
        </div>
      </Slider>
      <style>{`
        .custom-dots {
          position: absolute;
          bottom: 24px;
          left: 0;
          width: 100%;
          display: flex !important;
          justify-content: center;
          z-index: 10;
          padding: 0;
          margin: 0;
        }
        .custom-dots li {
          margin: 0 6px;
          padding: 0;
        }
        .custom-dots li button {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #bbb;
          border: none;
          padding: 0;
          outline: none;
          box-shadow: none;
          position: relative;
          transition: background-color 0.3s ease;
        }
        .custom-dots li.slick-active button {
          background: #914938;
        }
        .custom-dots li button:before {
          display: none !important;
        }
        .slick-slide {
          height: 100vh !important;
        }
        .slick-list, .slick-track {
          height: 100% !important;
        }
        .slick-slide > div {
          height: 100% !important;
        }
      `}</style>
    </div>
  );
}