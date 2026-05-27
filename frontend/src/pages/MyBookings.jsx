import React, { useEffect, useState } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import { useAppContext } from '../conext/AppContext'
import toast from 'react-hot-toast'

const MyBookings = () => {
  const { axios, getToken, user } = useAppContext()

  const [bookings, setBookings] = useState([])

  const fetchUserBookings = async () => {
    try {
      const { data } = await axios.get(
        '/api/bookings/user',
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      )

      if (data.success) {
        setBookings(data.bookings)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handlePayment = async (bookingId) => {
    try {
      const { data } = await axios.post(
        '/api/bookings/stripe-payment',
        { bookingId },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      )

      if (data.success) {
        window.location.href = data.url
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (user) {
      fetchUserBookings()
    }
  }, [user])

  return (
    <div className='py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32'>
      
      <Title
        title='My Bookings'
        subTitle='Easily manage your past, current, and upcoming hotel reservations in one place. Plan your trips seamlessly with just a few clicks'
        align='left'
      />

      <div className='max-w-6xl mt-8 w-full text-gray-800'>

        {/* Table Header */}
        <div className='hidden w-full border-b border-gray-300 py-3 text-base font-medium md:grid md:grid-cols-[3fr_2fr_1fr]'>
          <div>Hotels</div>
          <div>Date & Timings</div>
          <div>Payment</div>
        </div>

        {bookings.map((booking) => (
          <div
            key={booking._id}
            className='grid w-full grid-cols-1 border-b border-gray-300 py-6 first:border-t md:grid-cols-[3fr_2fr_1fr]'
          >

            {/* Hotel Details */}
            <div className='flex flex-col md:flex-row'>

              <img
                src={booking.room.images[0]}
                alt='hotel-img'
                className='rounded object-cover shadow md:w-44'
              />

              <div className='flex flex-col gap-1.5 max-md:mt-3 md:ml-4'>

                <p className='font-playfair text-2xl'>
                  {booking.hotel.name}
                  <span className='font-inter text-sm'>
                    ({booking.room.roomType})
                  </span>
                </p>

                <div className='flex items-center gap-1 text-sm text-gray-500'>
                  <img src={assets.locationIcon} alt='location-icon' />
                  <span>{booking.hotel.address}</span>
                </div>

                <div className='flex items-center gap-1 text-sm text-gray-500'>
                  <img src={assets.guestsIcon} alt='guests-icon' />
                  <span>Guests: {booking.guests}</span>
                </div>

                <p className='text-base'>
                  Total: ₱{booking.totalPrice}
                </p>

              </div>
            </div>

            {/* Date & Timings */}
            <div className='mt-3 flex flex-row gap-8 md:items-center md:gap-12'>

              <div>
                <p>Check-In:</p>
                <p className='text-sm text-gray-500'>
                  {new Date(booking.checkInDate).toDateString()}
                </p>
              </div>

              <div>
                <p>Check-Out:</p>
                <p className='text-sm text-gray-500'>
                  {new Date(booking.checkOutDate).toDateString()}
                </p>
              </div>

            </div>

            {/* Payment Status */}
            <div className='flex flex-col items-start pt-3'>

              <div className='flex items-center gap-2'>

                <div
                  className={`h-3 w-3 rounded-full ${
                    booking.isPaid ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />

                <p
                  className={`text-sm ${
                    booking.isPaid ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {booking.isPaid ? 'Paid' : 'Unpaid'}
                </p>

              </div>

              {!booking.isPaid && (
                <button
                  onClick={() => handlePayment(booking._id)}
                  className='mt-4 cursor-pointer rounded-full border border-gray-400 px-4 py-1.5 text-xs transition-all hover:bg-gray-50'
                >
                  Pay Now
                </button>
              )}

            </div>

          </div>
        ))}

      </div>

    </div>
  )
}

export default MyBookings