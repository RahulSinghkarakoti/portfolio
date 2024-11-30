import { WineOff } from "lucide-react";
import React, { useEffect, useState } from "react";

 const ScrollProgressBar = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
 

useEffect(()=>{
    const updateScrollProgress = () => {
        // console.log(window.scrollY)
        const scrollTop=window.scrollY
        const docHeight=document.documentElement.scrollHeight-window.innerHeight
        const scrollPercent=(scrollTop/docHeight)*100
        setScrollProgress(scrollPercent)

    }

    window.addEventListener("scroll", updateScrollProgress)

    return ()=>{
        window.removeEventListener("scroll",updateScrollProgress)
    }

},[])


  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-50">
      <div
        className="h-full rounded-2xl bg-gradient-to-r from-blue-400 to-purple-500"
        style={{ width: `${scrollProgress}%` }}
      ></div>
    </div>
  );
};

export default ScrollProgressBar;