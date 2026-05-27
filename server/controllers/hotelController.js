import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

export const registerHotel = async (req, res) => {
  try {
    const { name, address, contact, city } = req.body;
    const owner = req.user._id;

    const hotel = await Hotel.findOne({ owner });

    if (hotel) {
      await User.findByIdAndUpdate(owner, { role: "hotelOwner" });
      return res.json({
        success: true,
        message: "Hotel already registered — you can use the Dashboard",
      });
    }

    await Hotel.create({ name, address, contact, city, owner: String(owner) });

    await User.findByIdAndUpdate(owner, { role: "hotelOwner" });

    res.json({ success: true, message: "Hotel Registered Successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};