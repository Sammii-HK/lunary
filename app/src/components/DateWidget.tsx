import { months } from "../../utils/months";

export const DateWidget = () => {
  const getWrittenDate = () => {
    const date = new Date().toLocaleDateString();
    const nth = (n: number) => n>3&&n<21?"th":n%10==1?"st":n%10==2?"nd":n%10==3?"rd":"th";
    
    const dateArray = date.split("/");
    const writtenDate = `${parseInt(dateArray[1])}${nth(parseInt(dateArray[1]))} ${months[parseInt(dateArray[0]) - 1]}`;
    
    return writtenDate;
  }
  
  return (
    <p className="w-full flex justify-center">{getWrittenDate()}</p>
  )
};
