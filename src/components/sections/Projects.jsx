import React from "react";
import Card from "../Card";
import RESUMEDATA from "../../constant/data";
import {  HoverEffect } from "../ui/card-hover-effect";
import RevealOnScroll from "../RevealOnScroll";
function Projects() {
  const { projects } = RESUMEDATA;
  return (
    <div className="mb-6 ">
           <h1 className="overflow-hidden  text-xl text-black dark:text-gray-100   font-semibold border-l-8 border-black dark:border-white  pl-3 py-2 dark:bg-gradient-to-r dark:from-[#141418] dark:to-black bg-gradient-to-r from-[#f5f5f6] to-white">
           <RevealOnScroll>
           GitHub Contributions
              </RevealOnScroll>
      </h1>

      <div className="max-w-5xl mx-auto px-5 ">
        <HoverEffect items={projects} />
      </div>
    </div>
  );
}

export default Projects;
