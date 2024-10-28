"use client";

import { useState } from "react";
import { useAstronomyContext } from "@/context/AstronomyContext";

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs, { Dayjs } from "dayjs";
import { createTheme, ThemeProvider } from "@mui/material";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export const DateWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState<Dayjs | null>(dayjs());
  const { writtenDate, setCurrentDateTime } = useAstronomyContext();
  
  return (
    <>
      <p className="w-full flex justify-center" onClick={() => setIsOpen(true)}>{writtenDate}</p>
      {isOpen && <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ThemeProvider theme={darkTheme}>
          <DateCalendar views={['day']} value={value} onChange={(newValue) => {
            setValue(newValue)
            setCurrentDateTime(newValue.toDate())
            setIsOpen(false)
          }} />
        </ThemeProvider>
      </LocalizationProvider>
      }
    </>
  )
};
