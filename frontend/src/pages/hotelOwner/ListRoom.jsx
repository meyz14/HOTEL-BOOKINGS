import { useCallback, useEffect, useState } from 'react'
import Title from '../../components/Title'
import { useAppContext } from '../../conext/AppContext'
import toast from 'react-hot-toast'

const ListRoom = () => {
  const { axios, getAuthHeaders } = useAppContext()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOwnerRooms = useCallback(async () => {
    try {
      setLoading(true)
      const headers = await getAuthHeaders()
      if (!headers) {
        toast.error('Please sign in first')
        return
      }

      const { data } = await axios.get('/api/rooms/owner', { headers })

      if (data.success) {
        setRooms(data.rooms || [])
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }, [axios, getAuthHeaders])

  useEffect(() => {
    fetchOwnerRooms()
  }, [fetchOwnerRooms])

  const handleToggle = async (roomId) => {
    try {
      const headers = await getAuthHeaders()
      if (!headers) return

      const { data } = await axios.post(
        '/api/rooms/toggle-availability',
        { roomId },
        { headers }
      )

      if (data.success) {
        toast.success(data.message)
        fetchOwnerRooms()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update room')
    }
  }

  return (
    <div>
      <Title
        align='left'
        font='outfit'
        title='Room Listings'
        subTitle='View, edit, or manage all listed rooms. Keep the information up-to-date to provide the best experience for users.'
      />

      <p className='text-gray-500 mt-8'>All Rooms</p>

      {loading ? (
        <p className='text-gray-500 mt-4'>Loading rooms...</p>
      ) : rooms.length === 0 ? (
        <p className='text-gray-500 mt-4'>
          No rooms yet. Add a room from the Add Room page.
        </p>
      ) : (
        <div className='w-full max-w-3xl text-left border border-gray-300 rounded-lg max-h-80 overflow-y-scroll'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='py-3 px-4 text-gray-800 font-medium'>Name</th>
                <th className='py-3 px-4 text-gray-800 font-medium max-sm:hidden'>
                  Facility
                </th>
                <th className='py-3 px-4 text-gray-800 font-medium'>
                  Price / night
                </th>
                <th className='py-3 px-4 text-gray-800 font-medium text-center'>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className='text-sm'>
              {rooms.map((item) => (
                <tr key={item._id}>
                  <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>
                    {item.roomType}
                  </td>

                  <td className='py-3 px-4 text-gray-700 border-t border-gray-300 max-sm:hidden'>
                    {item.amenities.join(', ')}
                  </td>

                  <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>
                    {item.pricePerNight}
                  </td>

                  <td className='py-3 px-4 border-t border-gray-300 text-center'>
                    <label className='relative inline-flex items-center cursor-pointer text-gray-900 gap-3'>
                      <input
                        type='checkbox'
                        className='sr-only peer'
                        checked={item.isAvailable}
                        onChange={() => handleToggle(item._id)}
                      />

                      <div className='w-12 h-7 bg-slate-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-200'></div>

                      <span className='absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5'></span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ListRoom
