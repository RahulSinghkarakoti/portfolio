import { Sun, Moon } from "lucide-react";

function Darkmodebtn({ classname = "" , darkModeHandler,dark}) {
   
  
  return (
    <div
      className=  {` ${classname}  dark:text-white shadow-md dark:shadow-white shadow-black p-2  border-2 border-black dark:border-white rounded-full `}
      onClick={darkModeHandler}
    >
      {dark ? <Sun size={30} /> : <Moon size={30} />}
    </div>
  );
}

export default Darkmodebtn;
