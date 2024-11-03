import dayjs from "dayjs";
import { getTarotCard } from "../../../utils/tarot/tarot";

const TarotReadings = () => {
  const currentDate = dayjs();
  const previousWeek = () => {
    let week = [];
    for (let i = 0; i < 7; i++) {
      week.push(currentDate.subtract(i, "day"))
    }
    return week
  }
  const week = previousWeek();

  const previousReadings = week.map((day) => {
    return {
      day: day.format('dddd'),
      date: day.format('MMM D'),
      card: getTarotCard(dayjs(day).toDate().toDateString())
    }
  })

  return (
    <div className='h-[91vh]'>
      <h1 className="py-4 text-lg">Tarot Readings</h1>
      {previousReadings.map((reading) => (
        <div key={reading.date} className='mb-3'>
          <h2 className='pb-1'><span className="font-bold">{reading.day}</span> {reading.date}</h2>
          <p>{reading.card.name}</p>
        </div>
      ))}
    </div>
  );
};

export default TarotReadings;
