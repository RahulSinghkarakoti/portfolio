import React from "react";
import RevealOnScroll from "../RevealOnScroll";
function About() {

  return (
    <div className="mt-8 mb-8">
      <div className="text-xl text-black dark:text-gray-100 overflow-hidden  font-semibold  border-l-8 border-black dark:border-white  pl-3 py-2 dark:bg-gradient-to-r dark:from-[#141418] dark:to-black bg-gradient-to-r from-[#f5f5f6] to-white">
        <RevealOnScroll>About</RevealOnScroll>
      </div>
      <div className="h-full flex justify-center items-center p-2">
        <p className="px-1 mt-1 text-gray-700/80 dark:text-gray-300/80 text-base  ">
        I’m currently pursuing my <strong>BCA</strong> and will be completing it in 2025. At the moment, I’m focusing on <strong>Next.js </strong> and working on various projects to enhance my skills. I enjoy contributing to <strong>open-source projects</strong> and learning new technologies to stay updated in the ever-evolving tech world.
        </p>
      </div>
    </div>
  );
}

export default About;
