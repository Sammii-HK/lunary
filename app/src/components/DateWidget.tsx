"use client";

import { useEffect, useMemo, useState } from "react";
import { months } from "../../utils/months";
import { useAstronomyContext } from "@/context/AstronomyContext";

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs, { Dayjs } from "dayjs";

export const DateWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState<Dayjs | null>(dayjs());
  // const [writtenDate, setWrittenDate] = useState(getWrittenDate(dayjs().toDate()));
  const { setCurrentDate, currentDate, writtenDate } = useAstronomyContext();

  console.log("currentDate", currentDate);
  console.log("writtenDate", writtenDate);
  
  return (
    <>
      <p className="w-full flex justify-center" onClick={() => setIsOpen(true)}>{writtenDate}</p>
      {isOpen && <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar value={value} onChange={(newValue) => {
          setValue(newValue)
          setCurrentDate(newValue.toDate())
          // setWrittenDate(getWrittenDate(newValue.toDate()))
          setIsOpen(false)
        }} />
      </LocalizationProvider>
      }
    </>
  )
};
