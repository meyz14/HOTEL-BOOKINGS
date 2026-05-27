import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import { v2 as cloudinary } from "cloudinary";

// API to create a new room for a hotel
export const createRoom = async (req, res) => {
  try {
    const { roomType, pricePerNight, amenities } = req.body;
    const ownerId = req.user._id;

    const hotel = await Hotel.findOne({ owner: ownerId });

    if (!hotel) {
      return res.json({
        success: false,
        message: "No Hotel found — register your hotel first",
      });
    }

    if (!req.files?.length) {
      return res.json({
        success: false,
        message: "Please upload at least one room image",
      });
    }

    const uploadImages = req.files.map(async (file) => {
      const response = await cloudinary.uploader.upload(file.path);
      return response.secure_url;
    });

    const images = await Promise.all(uploadImages);

    await Room.create({
      hotel: String(hotel._id),
      roomType,
      pricePerNight: +pricePerNight,
      amenities: JSON.parse(amenities),
      images,
    });

    res.json({
      success: true,
      message: "Room created successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// API to get all rooms
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isAvailable: true })
      .populate({
        path: "hotel",
        populate: {
          path: "owner",
          select: "image",
        },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, rooms });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to get all rooms for a specific hotel
export const getOwnerRooms = async (req, res) => {
  try {
    const ownerId = req.user._id;

    const hotelData = await Hotel.findOne({
      owner: ownerId,
    });

    if (!hotelData) {
      return res.json({
        success: false,
        message: "No Hotel found",
      });
    }

    const rooms = await Room.find({
      hotel: String(hotelData._id),
    }).populate("hotel");

    res.json({ success: true, rooms });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to get a single room by id
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate({
      path: "hotel",
      populate: { path: "owner", select: "image username" },
    });

    if (!room) {
      return res.json({ success: false, message: "Room not found" });
    }

    res.json({ success: true, room });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to toggle availability of a room
export const toggleRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.body;

    const roomData = await Room.findById(roomId);

    if (!roomData) {
      return res.json({ success: false, message: "Room not found" });
    }

    roomData.isAvailable = !roomData.isAvailable;

    await roomData.save();

    res.json({
      success: true,
      message: "Room availability Updated",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};