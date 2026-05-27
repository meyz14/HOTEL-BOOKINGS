import { useAppContext } from '../conext/AppContext';
import HotelCard from './HotelCard';
import Title from './Title';
import { useNavigate } from 'react-router-dom';

const FeaturedDestination = () => {
  const navigate = useNavigate();
  const { rooms } = useAppContext();

  return (
    <div className="flex flex-col items-center bg-slate-50 px-6 py-20 md:px-16 lg:px-24">
      <Title
        title="Featured Destination"
        subTitle="Discover our handpicked selection of exceptional properties around the world, offering unparalleled luxury and unforgettable experiences."
      />

      <div className="mt-20 flex flex-wrap items-center justify-center gap-6">
        {rooms.length === 0 ? (
          <p className="text-gray-500 text-center">
            No rooms listed yet. Check back soon!
          </p>
        ) : (
          rooms.slice(0, 4).map((room, index) => (
            <HotelCard key={room._id} room={room} index={index} />
          ))
        )}
      </div>

      <button
        onClick={() => {
          navigate('/rooms');
          scrollTo(0, 0);
        }}
        className="my-16 cursor-pointer rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium transition-all hover:bg-gray-50"
      >
        View All Destinations
      </button>
    </div>
  );
};

export default FeaturedDestination;
