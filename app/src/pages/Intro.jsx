// Intro.jsx
// Add useLocation to your imports
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Auth from "./Auth";

// Import images
import Intro1 from "../assets/Intro1.svg";
import Intro4 from "../assets/Intro4.svg";

export default function ImageSlider() {
  const navigate = useNavigate();
  const location = useLocation(); // Get location object
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const sliderRef = useRef(null);
  
  // Preload images before showing slider
  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    
    const preloadImages = async () => {
      const imagesToLoad = [Intro1, Intro4];
      const promises = imagesToLoad.map(src => {
        return new Promise((resolve, reject) => {
          const img = new window.Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });
      
      try {
        await Promise.all(promises);
        setImagesLoaded(true);
      } catch {
        setImagesLoaded(true);
      }
    };
    
    preloadImages();
    
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  // New useEffect to handle slide navigation based on location state
  useEffect(() => {
    if (imagesLoaded && sliderRef.current && location.state && typeof location.state.slide === 'number') {
      // Ensure slickGoTo method exists on the slider instance
      if (typeof sliderRef.current.slickGoTo === 'function') {
        sliderRef.current.slickGoTo(location.state.slide);
      } else {
        // Fallback or warning if slickGoTo is not available immediately
        // This might happen if the slider is not fully initialized.
        // Consider a small delay or checking readiness if issues persist.
        console.warn("slickGoTo method not available on sliderRef.current yet.");
        // Optionally, clear the state to prevent repeated attempts if it's a one-time navigation
        // navigate(location.pathname, { replace: true, state: {} }); 
      }
    }
  }, [imagesLoaded, location.state, sliderRef, navigate]); // Added navigate to dependency array if using it inside

  const settings = {
    dots: true,
    arrows: false,
    infinite: false,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    dotsClass: "slick-dots custom-dots",
    adaptiveHeight: false,
    swipeToSlide: true,
    touchThreshold: 10,
    cssEase: "linear",
    lazyLoad: "progressive"
  };

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
        <div className="w-screen h-screen">
          <img
            src={Intro1}
            alt="Intro 1"
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
        <div className="w-screen h-screen">
          <img
            src={Intro4}
            alt="Intro 4"
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
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