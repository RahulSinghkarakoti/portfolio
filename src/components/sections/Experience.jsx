import React from "react";
import RESUMEDATA from "../../constant/data";
import { BriefcaseBusiness } from "lucide-react";
import RevealOnScroll from "../RevealOnScroll";

function Experience() {
  const { work_Experience } = RESUMEDATA;
  return (
    <div className="mt-8 mb-8">
                  <h1 className="text-xl text-black dark:text-gray-100  overflow-hidden  font-semibold  border-l-8 border-black dark:border-white  pl-3 py-2 dark:bg-gradient-to-r dark:from-[#141418] dark:to-black bg-gradient-to-r from-[#f5f5f6] to-white">
                  <RevealOnScroll>
                  Work Experience
              </RevealOnScroll>
      </h1>
      <div className="px-3 gap-2 w-full h-full py-2 ">

        {work_Experience.map((item, index) => {
          return (
            <div key={index} className="flex gap-3 items-start">
              <div className="w-20 h-16 bg-gray-200  dark:bg-[#27272a]   rounded-xl  flex items-center justify-center">
                <BriefcaseBusiness size={25} />
              </div>
              <div className="  w-full flex justify-between sm:flex-row flex-col  ">
                <div className=" sm:w-2/3 w-full ">
                  <p className="text-md font-semibold">{item.title}</p>
                  <p className="text-sm sm:block hidden">{item.description}</p>
                </div>
                <div className=" ">
                  <p className="text-sm text-gray-500 dark:text-gray-200">{item.duration}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Experience;
