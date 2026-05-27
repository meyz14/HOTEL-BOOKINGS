import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  assets,
  facilityIcons,
  roomCommonData,
} from '../assets/assets'
import StarRating from '../components/StarRating'
import hostIcon from '../assets/host.svg'
import { useAppContext } from '../conext/AppContext'
import toast from 'react-hot-toast'

const RoomDetails = () => {
  const { id } = useParams()
  const { axios, rooms, navigate, getAuthHeaders } = useAppContext()

  const [room, setRoom] = useState(null)
  const [mainImage, setMainImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    const loadRoom = async () => {
      try {
        setLoading(true)

        const cached = rooms.find((r) => r._id === id)
        if (cached) {
          setRoom(cached)
          setMainImage(cached.images?.[0])
          return
        }

        const { data } = await axios.get(`/api/rooms/${id}`)
        if (data.success) {
          setRoom(data.room)
          setMainImage(data.room.images?.[0])
        } else {
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message || 'Failed to load room')
      } finally {
        setLoading(false)
      }
    }

    loadRoom()
  }, [id, rooms, axios])

  const handleBooking = async (event) => {
    event.preventDefault()

    const checkInDate = event.target.checkInDate.value
    const checkOutDate = event.target.checkOutDate.value
    const guests = event.target.guests.value

    if (!checkInDate || !checkOutDate || !guests) {
      toast.error('Please fill in all booking fields')
      return
    }

    try {
      setBookingLoading(true)

      const { data: availability } = await axios.post(
        '/api/bookings/check-availability',
        { room: id, checkInDate, checkOutDate }
      )

      if (!availability.success) {
        toast.error(availability.message)
        return
      }

      if (!availability.isAvailable) {
        toast.error('Room is not available for these dates')
        return
      }

      const headers = await getAuthHeaders()
      if (!headers) {
        toast.error('Please sign in to book a room')
        return
      }

      const { data } = await axios.post(
        '/api/bookings/book',
        { room: id, checkInDate, checkOutDate, guests },
        { headers }
      )

      if (data.success) {
        toast.success(data.message)
        navigate('/my-bookings')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || 'Booking failed'
      )
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-primary" />
      </div>
    )
  }

  if (!room) {
    return (
      <div className="py-28 text-center text-gray-500">
        Room not found.
      </div>
    )
  }

  return (
    <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
        <h1 className="text-3xl md:text-4xl font-playfair">
          {room.hotel?.name}
          <span className="font-inter text-sm">({room.roomType})</span>
        </h1>

        <p className="text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full">
          20% OFF
        </p>
      </div>

      <div className="flex items-center gap-1 mt-2">
        <StarRating />
        <p className="ml-2">200+ reviews</p>
      </div>

      <div className="flex items-center gap-1 text-gray-500 mt-2">
        <img src={assets.locationIcon} alt="location-icon" />
        <span>{room.hotel?.address}</span>
      </div>

      <div className="flex flex-col lg:flex-row mt-6 gap-6">
        <div className="lg:w-1/2 w-full">
          <img
            src={mainImage}
            alt="Room"
            className="w-full rounded-xl shadow-lg object-cover"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:w-1/2 w-full">
          {room?.images?.length > 1 &&
            room.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt="Room"
                onClick={() => setMainImage(image)}
                className={`w-full rounded-xl shadow-md object-cover cursor-pointer ${
                  mainImage === image ? 'outline-3 outline-orange-500' : ''
                }`}
              />
            ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between mt-10">
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-4xl font-playfair">
            Experience Luxury Like Never Before
          </h1>

          <div className="flex flex-wrap items-center mt-3 mb-6 gap-4">
            {room.amenities?.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100"
              >
                <img src={facilityIcons[item]} alt={item} className="w-5 h-5" />
                <p className="text-xs">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-2xl font-medium">₱{room.pricePerNight}/night</p>
      </div>

      <form
        onSubmit={handleBooking}
        className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl mx-auto mt-16 max-w-6xl"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10 text-gray-500">
          <div className="flex flex-col">
            <label htmlFor="checkInDate" className="font-medium">
              Check-In
            </label>
            <input
              type="date"
              id="checkInDate"
              name="checkInDate"
              className="w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
              required
            />
          </div>

          <div className="w-px h-10 bg-gray-300/70 max-md:hidden" />

          <div className="flex flex-col">
            <label htmlFor="checkOutDate" className="font-medium">
              Check-Out
            </label>
            <input
              type="date"
              id="checkOutDate"
              name="checkOutDate"
              className="w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
              required
            />
          </div>

          <div className="w-px h-10 bg-gray-300/70 max-md:hidden" />

          <div className="flex flex-col">
            <label htmlFor="guests" className="font-medium">
              Guests
            </label>
            <input
              type="number"
              id="guests"
              name="guests"
              placeholder="0"
              min={1}
              className="max-w-20 rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={bookingLoading}
          className="bg-primary hover:bg-primary-dull active:scale-95 transition-all text-white rounded-md max-md:w-full max-md:mt-6 md:px-25 py-3 md:py-4 text-base cursor-pointer disabled:opacity-60"
        >
          {bookingLoading ? 'Booking...' : 'Book Now'}
        </button>
      </form>

      <div className="mt-25 space-y-4">
        {roomCommonData.map((spec, index) => (
          <div key={index} className="flex items-start gap-2">
            <img src={spec.icon} alt={`${spec.title}-icon`} className="w-6.5" />
            <div>
              <p className="text-base">{spec.title}</p>
              <p className="text-gray-500">{spec.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-3xl border-y border-gray-300 my-15 py-10 text-gray-500">
        <p>
          Guests will be allocated on the ground floor according to availability.
          You get a comfortable two bedroom apartment that has a true city feeling.
        </p>
      </div>

      <div className="flex flex-col items-start gap-4">
        <div className="flex gap-4">
          <img
            src={hostIcon}
            alt="Host"
            className="h-14 w-14 md:h-18 md:w-18 rounded-full"
          />

          <div>
            <p className="text-lg md:text-xl">
              Hosted by {room.hotel?.name}
            </p>

            <div className="flex items-center mt-1">
              <StarRating />
              <p className="ml-2">200+ reviews</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="px-6 py-2.5 mt-4 rounded text-white bg-primary hover:bg-primary-dull transition-all cursor-pointer"
        >
          Contact Now
        </button>
      </div>
    </div>
  )
}

export default RoomDetails
