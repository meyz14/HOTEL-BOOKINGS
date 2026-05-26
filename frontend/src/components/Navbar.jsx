import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useClerk, UserButton } from "@clerk/clerk-react";

import { useAppContext } from "../conext/AppContext";
import { assets } from "../assets/assets";

// Navigation Links
const navLinks = [
  { name: "Home", path: "/" },
  { name: "Hotels", path: "/rooms" },
  { name: "Experience", path: "/" },
  { name: "About", path: "/" },
];

// Booking Icon
const BookIcon = () => (
  <svg
    className="h-4 w-4 text-gray-700"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0 0 4h12M9 3v14m7 0v4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const location = useLocation();

  const { openSignIn } = useClerk();

  const {
    user,
    navigate,
    isOwner,
    setShowHotelReg,
  } = useAppContext();

  useEffect(() => {
    if (location.pathname !== "/") {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [location.pathname]);

  const navTextColor = isScrolled
    ? "text-gray-700"
    : "text-white";

  const navUnderlineColor = isScrolled
    ? "bg-gray-700"
    : "bg-white";

  const loginButtonClass =
    "rounded-full bg-black px-8 py-2.5 text-white transition-all duration-500";

  return (
    <nav
      className={`fixed top-0 left-0 z-50 flex w-full items-center justify-between px-4 transition-all duration-500 md:px-16 lg:px-24 xl:px-32 ${
        isScrolled
          ? "bg-white/80 py-3 text-gray-700 shadow-md backdrop-blur-lg md:py-4"
          : "py-4 md:py-6"
      }`}
    >
      {/* Logo */}
      <Link to="/">
        <img
          src={assets.logo}
          alt="logo"
          className={`h-9 ${
            isScrolled ? "invert opacity-80" : ""
          }`}
        />
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden items-center gap-4 md:flex lg:gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`group flex flex-col gap-0.5 ${navTextColor}`}
          >
            {link.name}

            <span
              className={`h-0.5 w-0 transition-all duration-300 group-hover:w-full ${navUnderlineColor}`}
            />
          </Link>
        ))}

        {user && (
          <button
            className={`rounded-full border px-4 py-1 text-sm font-light cursor-pointer transition-all ${
              isScrolled
                ? "text-black"
                : "text-white"
            }`}
            onClick={() =>
              isOwner
                ? navigate("/owner")
                : setShowHotelReg(true)
            }
          >
            {isOwner
              ? "Dashboard"
              : "List Your Hotel"}
          </button>
        )}
      </div>

      {/* Desktop Right */}
      <div className="hidden items-center gap-4 md:flex">
        <img
          src={assets.searchIcon}
          alt="search"
          className={`h-7 transition-all duration-500 ${
            isScrolled ? "invert" : ""
          }`}
        />

        {user ? (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="My Bookings"
                labelIcon={<BookIcon />}
                onClick={() =>
                  navigate("/my-bookings")
                }
              />
            </UserButton.MenuItems>
          </UserButton>
        ) : (
          <button
            onClick={openSignIn}
            className={loginButtonClass}
          >
            Login
          </button>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="flex items-center gap-3 md:hidden">
        {user && (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="My Bookings"
                labelIcon={<BookIcon />}
                onClick={() =>
                  navigate("/my-bookings")
                }
              />
            </UserButton.MenuItems>
          </UserButton>
        )}

        <img
          src={assets.menuIcon}
          alt="menu"
          onClick={() => setIsMenuOpen(true)}
          className={`h-4 cursor-pointer ${
            isScrolled ? "invert" : ""
          }`}
        />
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 flex h-screen w-full flex-col items-center justify-center gap-6 bg-white text-base font-medium text-gray-800 transition-all duration-500 md:hidden ${
          isMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsMenuOpen(false)}
          className="absolute top-4 right-4"
        >
          <img
            src={assets.closeIcon}
            alt="close"
            className="h-6"
          />
        </button>

        {/* Mobile Links */}
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            onClick={() => setIsMenuOpen(false)}
          >
            {link.name}
          </Link>
        ))}

        {/* Dashboard */}
       {user && (
  <button
    className="rounded-full border px-4 py-1 text-sm font-light cursor-pointer transition-all"
    onClick={() =>
      isOwner
        ? navigate("/owner")
        : setShowHotelReg(true)
    }
  >
    {isOwner ? "Dashboard" : "List Your Hotel"}
  </button>

        )}

        {/* Mobile Auth */}
        {!user && (
          <button
            onClick={openSignIn}
            className={loginButtonClass}
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;