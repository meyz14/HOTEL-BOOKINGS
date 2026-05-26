import React, { useState } from "react";
import { assets, cities } from "../assets/assets";
import { useAppContext } from "../conext/AppContext";
import { toast } from "react-hot-toast";

const HotelReg = () => {
  const {
    setShowHotelReg,
    axios,
    getAuthHeaders,
    fetchUser,
  } = useAppContext();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (event) => {
    try {
      event.preventDefault();
      setLoading(true);

      const headers = await getAuthHeaders();
      if (!headers) {
        toast.error("Please sign in first, wait a few seconds, then try again");
        setLoading(false);
        return;
      }

      const { data } = await axios.post(
        "/api/hotels",
        { name, contact, address, city },
        { headers }
      );

      if (data.success) {
        toast.success(data.message);
        setShowHotelReg(false);
        await fetchUser();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Could not reach the server. Is it running on port 3000?";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => setShowHotelReg(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
    >
      <form
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        className="flex max-w-4xl rounded-xl bg-white max-md:mx-2"
      >
        {/* Image */}
        <img
          src={assets.regImage}
          alt="reg-image"
          className="hidden w-1/2 rounded-xl md:block"
        />

        {/* Form Content */}
        <div className="relative flex flex-col items-center p-8 md:w-1/2 md:p-10">
          
          {/* Close Button */}
          <img
            src={assets.closeIcon}
            alt="close-icon"
            onClick={() => setShowHotelReg(false)}
            className="absolute top-4 right-4 h-4 w-4 cursor-pointer"
          />

          <p className="mt-6 text-2xl font-semibold">
            Register Your Hotel
          </p>

          {/* Hotel Name */}
          <div className="mt-4 w-full">
            <label
              htmlFor="name"
              className="font-medium text-gray-500"
            >
              Hotel Name
            </label>

            <input
              id="name"
              type="text"
              placeholder="Type here"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-gray-200 px-3 py-2.5 font-light outline-indigo-500"
              required
            />
          </div>

          {/* Phone */}
          <div className="mt-4 w-full">
            <label
              htmlFor="contact"
              className="font-medium text-gray-500"
            >
              Phone
            </label>

            <input
              id="contact"
              type="text"
              placeholder="Type here"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="mt-1 w-full rounded border border-gray-200 px-3 py-2.5 font-light outline-indigo-500"
              required
            />
          </div>

          {/* Address */}
          <div className="mt-4 w-full">
            <label
              htmlFor="address"
              className="font-medium text-gray-500"
            >
              Address
            </label>

            <input
              id="address"
              type="text"
              placeholder="Type here"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full rounded border border-gray-200 px-3 py-2.5 font-light outline-indigo-500"
              required
            />
          </div>

          {/* City */}
          <div className="mt-4 mr-auto w-full max-w-60">
            <label
              htmlFor="city"
              className="font-medium text-gray-500"
            >
              City
            </label>

            <select
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 w-full rounded border border-gray-200 px-3 py-2.5 font-light outline-indigo-500"
              required
            >
              <option value="">Select City</option>

              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 mr-auto cursor-pointer rounded bg-indigo-500 px-6 py-2 text-white transition-all hover:bg-indigo-600 disabled:opacity-60"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HotelReg;