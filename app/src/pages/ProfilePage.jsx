import React from "react";
import ProfileHeader from "../components/ProfileHeader";
import ProfileCategory from "../components/ProfileCategory";

const ProfilePage = () => {
  return (
    <div className="min-h-screen font-display bg-[#F8F3F3] pt-12 px-6 mb-16">
      <ProfileHeader />
      <br />
      <ProfileCategory />
    </div>
  );
};

export default ProfilePage;
