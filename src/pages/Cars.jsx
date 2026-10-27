
import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CarCard from "../components/CarCard";
import { useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { motion } from "motion/react";

const Cars = () => {
  const [searchParams] = useSearchParams();

  const pickupLocation = searchParams.get("pickupLocation");
  const pickupDate = searchParams.get("pickupDate");
  const returnDate = searchParams.get("returnDate");

  const { cars, axios } = useAppContext();

  const [input, setInput] = useState("");
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(false);

  const isSearchData = Boolean(
    pickupLocation && pickupDate && returnDate
  );

  useEffect(() => {
    let cancelled = false;

    const loadCars = async () => {
      if (!isSearchData) {
        setFilteredCars(cars || []);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const { data } = await axios.post(
          "/api/bookings/check-availability",
          {
            location: pickupLocation,
            pickupDate,
            returnDate,
          }
        );

        if (cancelled) return;

        if (data.success) {
          const availableCars = data.availableCars || [];
          setFilteredCars(availableCars);

          if (availableCars.length === 0) {
            toast("No cars available for these dates and location.");
          }
        } else {
          setFilteredCars([]);
          toast.error(
            data.message || "Could not find available cars"
          );
        }
      } catch (error) {
        if (cancelled) return;

        setFilteredCars([]);

        console.error(
          "Availability search error:",
          error.response?.data || error.message
        );

        toast.error(
          error.response?.data?.message ||
            "Failed to load available cars"
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCars();

    return () => {
      cancelled = true;
    };
  }, [
    cars,
    axios,
    isSearchData,
    pickupLocation,
    pickupDate,
    returnDate,
  ]);

  // Filter the currently available cars using the search input
  const carsToDisplay = (filteredCars || []).filter((car) => {
    const searchText = input.toLowerCase().trim();

    return (
      (car.brand || "").toLowerCase().includes(searchText) ||
      (car.model || "").toLowerCase().includes(searchText) ||
      (car.category || "").toLowerCase().includes(searchText) ||
      (car.transmission || "").toLowerCase().includes(searchText) ||
      (car.fuel_type || "").toLowerCase().includes(searchText)
    );
  });

  return (
    <div>
      <motion.div
      initial={{ opacity:0, y: 30}}
      animate={{ opacity:1, y: 0}}
      transition={{ duration:0.6, ease: 'easeOut'}}
       className="flex flex-col items-center py-20 bg-light max-md:px-4">
        <Title
          title="Available Cars"
          subTitle="Browse our selection of premium vehicles available for your next adventure"
        />

        <motion.div

        initial={{ opacity:0, y: 20}}
      animate={{ opacity:1, y: 0}}
      transition={{ delay:0.3, duration: 0.5}}

         className="flex items-center bg-white px-4 mt-6 max-w-140 w-full h-12 rounded-full shadow">
          <img
            src={assets.search_icon}
            alt=""
            className="w-4.5 h-4.5 mr-2"
          />

          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            placeholder="Search by make, model, or features"
            className="w-full h-full outline-none text-gray-500"
          />

          <img
            src={assets.filter_icon}
            alt=""
            className="w-4.5 h-4.5 ml-2"
          />
        </motion.div>
      </motion.div>

      <motion.div 
      initial={{ opacity: 0}}
      animate={{ opacity: 1}}
      transition={{delay:0.6, duration: 0.5}}
      className="px-6 md:px-16 lg:px-24 xl:px-32 mt-10">
        <p className="text-gray-500 xl:px-20 max-w-7xl mx-auto">
          {loading
            ? "Checking car availability..."
            : `Showing ${carsToDisplay.length} Cars`}
        </p>

        {!loading && carsToDisplay.length === 0 && (
          <p className="text-gray-500 text-center mt-8">
            {input
              ? "No cars match your search."
              : isSearchData
                ? "No cars available for the selected dates and location."
                : "No cars available at the moment."}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto">
          {carsToDisplay.map((car) => (
            <motion.div key={car._id}
            

             initial={{ opacity: 1, y: 0}}
      animate={{ opacity: 1, y:0}}
      transition={{delay: 0.1  ,duration: 0.4}}


            >
              <CarCard car={car} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Cars;
