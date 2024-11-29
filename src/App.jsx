import { useEffect, useState } from "react";
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
import { Sun, Moon } from "lucide-react";
import ScrollProgressBar  from "./components/ScrollProgressBar"; 

 
 

export default function App() {
  const [dark, setDark] = useState(true);

  const darkModeHandler = () => {
    console.log("toggle dark ")
    setDark((prevMode) => {
      const newMode = !prevMode;
      document.body.classList.toggle("dark", newMode);
      localStorage.setItem("darkMode", newMode ? "true" : "false");

      return newMode;
    });
  };

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDark(savedDarkMode);
    document.body.classList.toggle("dark", savedDarkMode);
  }, []);


  

  return (
    <div className="relative bg-white dark:bg-black   dark:text-white  w-full h-full sm:flex block items-center justify-center   font-newPopins  ">
      <div className=" sm:w-2/3 w-full border-l-2 border-r-2  border-slate-300 dark:border-gray-600/40    ">
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
      <div
        className="absolute z-20 top-8 right-5 dark:text-white shadow-md dark:shadow-white shadow-black p-2  border-2 border-black dark:border-white rounded-full "
        onClick={() => darkModeHandler()}
      >
        {dark ? <Sun size={30} /> : <Moon size={30} />}
      </div>
    </div>
  );
}
