import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Intro1 from "../assets/Intro1.svg";
import Intro3 from "../assets/Intro3.svg";
import Intro4 from "../assets/Intro4.svg";
import Auth from "./Auth";

export default function ImageSlider() {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  const settings = {
    dots: true,
    arrows: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    afterChange: (current) => {
      if (current === 2) {
        navigate("/auth");
      }
    },
    dotsClass: "slick-dots custom-dots", // Custom class for dots
  };

  return (
    <div className="fixed inset-0 w-screen h-screen">
      <style>
        {`
          .slick-slider, .slick-list, .slick-track {
            height: 100vh;
          }
          .slick-slide > div {
            height: 100%;
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
        `}
      </style>
      <Slider {...settings}>
        <div className="h-full">
          <img
            src={Intro1}
            alt="Intro 1"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="h-full">
          <img
            src={Intro4}
            alt="Intro 4"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="h-full">
            <Auth />
        </div>
      </Slider>
    </div>
  );
}