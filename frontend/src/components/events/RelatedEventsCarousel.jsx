import EventCard from "./EventCard";

const RelatedEventsCarousel = ({ events = [] }) => {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

export default RelatedEventsCarousel;
