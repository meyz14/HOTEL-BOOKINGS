import axios from "axios";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "$";
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();

  const [isOwner, setIsOwner] = useState(false);
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [searchedCities, setSearchedCities] = useState([]);
  const [rooms, setRooms] = useState([])
  const fetchUserRequestId = useRef(0);

  const fetchRooms = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/rooms");
      if (data.success) {
        setRooms(data.rooms || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to load rooms");
    }
  }, []);

  const getSessionToken = useCallback(async () => {
    if (!isLoaded || !isSignedIn || !userId) return null;

    for (let attempt = 0; attempt < 10; attempt++) {
      const token = await getToken({ skipCache: true });
      if (token) return token;
      await new Promise((r) => setTimeout(r, 200));
    }
    return null;
  }, [getToken, isLoaded, isSignedIn, userId]);

  const getAuthHeaders = useCallback(async () => {
    const token = await getSessionToken();
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  }, [getSessionToken]);

  const fetchUser = useCallback(async () => {
    const headers = await getAuthHeaders();
    if (!headers) return;

    const requestId = ++fetchUserRequestId.current;

    try {
      const { data } = await axios.get("/api/user", { headers });

      if (requestId !== fetchUserRequestId.current) return;

      if (data.success) {
        setIsOwner(data.role === "hotelOwner");
        setSearchedCities(data.recentSearchedCities || []);
        return;
      }

      if (data.message?.includes("not found")) {
        setTimeout(fetchUser, 3000);
      }
    } catch {
      // silent background sync
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    const interceptor = axios.interceptors.request.use(async (config) => {
      const token = await getSessionToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => axios.interceptors.request.eject(interceptor);
  }, [getSessionToken]);

  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      fetchUser();
    } else if (isLoaded && !isSignedIn) {
      setIsOwner(false);
      setSearchedCities([]);
    }
  }, [user, isLoaded, isSignedIn, userId, fetchUser]);

  useEffect(()=>{
    fetchRooms();
  },[])

  const value = {
    currency,
    navigate,
    user,
    getToken,
    isOwner,
    setIsOwner,
    axios,
    showHotelReg,
    setShowHotelReg,
    searchedCities,
    setSearchedCities,
    fetchUser,
    getAuthHeaders,
    fetchRooms,
    rooms,
    setRooms,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
