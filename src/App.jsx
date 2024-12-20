import {
  About,
  Contact,
  Education,
  Experience,
  Github,
  Home,
  Projects,
  Skill,
} from "./components/sections";
import ScrollProgressBar  from "./components/ScrollProgressBar"; 
import Darkmodebtn from "./components/Darkmodebtn";
import React, { useEffect, useState } from "react";

 
 

export default function App() {
  const [dark, setDark] = useState(true);

  const darkModeHandler = () => {
    setDark((prevMode) => {
      const newMode = !prevMode;
      document.body.classList.toggle("dark", newMode);
      localStorage.setItem("darkMode" , newMode ?"true":"false") 

      return newMode;
    });
  };

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDark(savedDarkMode);
    document.body.classList.toggle("dark", savedDarkMode);
  }, []);

  return (
    <div className="relative bg-white  dark:bg-black   dark:text-white  w-full h-full sm:flex block items-center justify-center   font-newPopins  ">
      <div className=" sm:w-full md:w-full lg:w-2/3  w-full border-l-2 border-r-2  border-slate-300 dark:border-gray-600/40    ">
      <ScrollProgressBar/>
        <Home />
        <About />
        <Skill />
        <Github/>
        <Education />
        <Experience />
        <Projects />
        <Contact />
      </div>
      <Darkmodebtn darkModeHandler={darkModeHandler} dark={dark} classname="absolute z-20 top-8 right-5"/> 
     
    </div>
  );
}
