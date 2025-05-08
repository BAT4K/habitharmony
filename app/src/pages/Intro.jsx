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
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });
      
      try {
        await Promise.all(promises);
        setImagesLoaded(true);
      } catch (error) {
        console.error("Failed to load images:", error);
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
    lazyLoad: 'ondemand',
    touchThreshold: 10,
    useCSS: true,
    useTransform: true,
    cssEase: "ease-out",
    swipeToSlide: true,
    adaptiveHeight: false
    // If you want the slide to be set on initial load when navigating directly with state:
    // initialSlide: (location.state && typeof location.state.slide === 'number') ? location.state.slide : 0,
  };

  if (!imagesLoaded) {
    return (
      <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen bg-white">
      {/* styles */}
      <style>
        {`
          .slick-slider, .slick-list, .slick-track {
            height: 100vh;
            touch-action: pan-y;
            -webkit-overflow-scrolling: touch;
          }
          .slick-slide > div {
            height: 100%;
          }
          .slick-slide {
            will-change: transform;
            transform: translate3d(0, 0, 0);
            -webkit-transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
          }
          .slick-dots {
            bottom: 40px;
            z-index: 10;
          }
          .slick-dots li button:before {
            font-size: 12px;
            color: #000;
            opacity: 0.5;
          }
          .slick-dots li.slick-active button:before {
            opacity: 1;
          }
          .slide-content {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          @media (max-width: 768px) {
            .slick-dots {
              bottom: 24px;
            }
            .slick-dots li {
              margin: 0 6px;
            }
          }
        `}
      </style>
      <Slider ref={sliderRef} {...settings}>
        <div className="h-full">
          <div className="slide-content">
            <img
              src={Intro1}
              alt="Intro 1"
              className="w-full h-full object-contain"
              loading="eager"
              width="100%"
              height="100%"
            />
          </div>
        </div>
        <div className="h-full">
          <div className="slide-content">
            <img
              src={Intro4}
              alt="Intro 4"
              className="w-full h-full object-contain"
              loading="eager"
              width="100%"
              height="100%"
            />
          </div>
        </div>
        <div className="h-full">
          <div className="slide-content">
            <Auth />
          </div>
        </div>
      </Slider>
      
      <div className="fixed bottom-16 left-0 right-0 flex justify-between px-6 z-20">
        <button 
          onClick={() => sliderRef.current?.slickPrev()}
          className="bg-white bg-opacity-50 rounded-full p-2 shadow-md focus:outline-none hidden"
        >
          ←
        </button>
        <button 
          onClick={() => sliderRef.current?.slickNext()}
          className="bg-white bg-opacity-50 rounded-full p-2 shadow-md focus:outline-none hidden"
        >
          →
        </button>
      </div>
    </div>
  );
}