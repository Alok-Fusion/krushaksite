import React from "react";
import { useSelector } from "react-redux";
import EventCard from "../components/Events/EventCard";
import Header from "../components/Layout/Header";
import Loader from "../components/Layout/Loader";
import Footer from "../components/Layout/Footer";

const EventsPage = () => {
  const { allEvents, isLoading } = useSelector((state) => state.events || {});
  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <Header activeHeading={4} />
          <div className="w-full py-10">
            {allEvents && allEvents.length > 0 ? (
              <EventCard active={true} data={allEvents[0]} />
            ) : (
              <div className="w-full text-center py-16 bg-white max-w-[900px] mx-auto rounded-lg shadow-sm border border-gray-100">
                <h4 className="text-[20px] text-gray-600 font-medium pb-2">
                  No active events available right now
                </h4>
                <p className="text-gray-400 text-sm">
                  Stay tuned! Seasonal farming offers and events will be announced here soon.
                </p>
              </div>
            )}
          </div>
          <Footer />
        </div>
      )}
    </>
  );
};

export default EventsPage;
