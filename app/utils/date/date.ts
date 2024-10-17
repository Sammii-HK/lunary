import { months } from "../months";

export const getWrittenDate = (date: Date) => {  
  console.log("🧐 date", date);
  
  const currentDate = date.toLocaleDateString("en-uk");
  const nth = (n: number) => n>3&&n<21?"th":n%10==1?"st":n%10==2?"nd":n%10==3?"rd":"th";
  
  const dateArray = currentDate.split("/");  
  const writtenDate = `${parseInt(dateArray[0])}${nth(parseInt(dateArray[1]))} ${months[parseInt(dateArray[1]) - 1]}`;
  console.log("writtenDate", writtenDate);
  
  
  return writtenDate;
}
