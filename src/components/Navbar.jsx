import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HomeNav from "../assets/HomeNav.png";
import CalNav from "../assets/CalNav.png";
import ProfileNav from "../assets/ProfileNav.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const images = {
    "/homescreen": HomeNav,
    "/calendar": CalNav,
    "/profile": ProfileNav,
  };

  return (
    <div className="fixed bottom-0 left-0 w-full">
      <img src={images[location.pathname]} alt="Navbar" className="w-full" />

      <div className="absolute bottom-2 left-0 right-0 flex justify-around">
        <button
          onClick={() => navigate("/homescreen")}
          className="p-8 bg-transparent"
        ></button>
        <button
          onClick={() => navigate("/calendar")}
          className="p-8 bg-transparent"
        ></button>
        <button
          onClick={() => navigate("/profile")}
          className="p-8 bg-transparent"
        ></button>
      </div>
    </div>
  );
};

export default Navbar;
