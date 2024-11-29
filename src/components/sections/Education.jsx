import React from "react";
import RESUMEDATA from "../../constant/data";
import RevealOnScroll from "../RevealOnScroll";
function Education() {
  const { education } = RESUMEDATA;
  return (
      <div className="mt-8 mb-8">
                     <h1 className="text-xl text-black dark:text-gray-100 overflow-hidden    font-semibold  border-l-8 border-black dark:border-white  pl-3 py-2 dark:bg-gradient-to-r dark:from-[#141418] dark:to-black bg-gradient-to-r from-[#f5f5f6] to-white">
                     <RevealOnScroll>
                     Education
              </RevealOnScroll>
        </h1>
        <div className="px-3  gap-2 w-full h-full p-2 ">
          {education.map((item, index) => {
            return (
              <div key={index} className="flex items-start justify-center gap-3 ">
                <div className="  sm:w-20 w-1/4 h-full  ">
                  <img
                    src="https://vips.edu/logo.png"
                    alt="vips"
                    className="  "
                  />
                </div>
                <div className="w-full flex sm:flex-row flex-col justify-between  ">
                  <div className="">
                    <h2 className=" text-md font-semibold">{item.Collage}</h2>
                    <p className="text-sm"> {item.Degree}</p>
                  </div>
                  <div className="">
                    <p className="text-sm text-gray-500 dark:text-gray-200">{item.Duration}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
  );
}

export default Education;
