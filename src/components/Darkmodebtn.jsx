import { Sun, Moon } from "lucide-react";

function Darkmodebtn({ classname = "" , darkModeHandler,dark}) {
   
  
  return (
    <div
      className=  {` ${classname} text-black dark:text-white shadow-md   dark:shadow-gray-300 shadow-black p-2  border-2 border-black dark:border-gray-600  rounded-full`}
      onClick={darkModeHandler}
    >
      {dark ? <Sun size={30} /> : <Moon size={30} />}
    </div>
  );
}

export default Darkmodebtn;
