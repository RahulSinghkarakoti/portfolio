import React from "react";
import RESUMEDATA from "../../constant/data";
import profile from "../../assets/profilepic.png";
import profile2 from "../../assets/pic.png";
import Button from "../Button.jsx";
import { easeInOut, motion } from "framer-motion";
import { Download } from "lucide-react";

function Home() {
  const { name, desc, tags } = RESUMEDATA;
  console.log(tags);
  return (
    <>
      <div className="text-gray-700/60 dark:text-gray-400/60 text-lg font-normal  py-16   px-3  flex sm:flex-row flex-col-reverse    items-stretch sm:gap-1 gap-4 sm:space-x-1 space-y-2   h-full w-full  ">
        <div className="w-full flex-1 space-y-0  ">
          <div className=" p-0  ">
            <p className="sm:text-lg text-sm">Hi there ! This is</p>
            <motion.h1
              initial={{
                y: 40,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
                transition: {
                  duration: 1,
                  delay: 0.2,
                },
              }}
              className="sm:text-5xl text-3xl text-black dark:text-white font-newPopins font-bold  py-1  overflow-hidden inline-block "
            >
              {name + "👨🏻‍💻"}
            </motion.h1>
          </div>
          <p className="sm:text-lg text-sm">{desc}</p>
          {/* tags */}
          <div className=" flex flex-wrap gap-2 py-2 ">
            {tags.map((item, index) => {
              return (
                <div
                  key={index}
                  className="rounded-lg px-2 py-1 flex gap-2 items-center text-black dark:text-white font-semibold sm:text-sm text-xs bg-opacity-75"
                  style={{ backgroundColor: `${item.color}60` }}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  {item.tag}
                </div>
              );
            })}
          </div>
          <div className="py-3 ">
           
              <Button link="../../assets/Rahul_SDE.pdf" variant="dark"  className="flex items-center  sm:gap-2 gap-0 sm:w-[35%] w-[50%]">
                <p>Downlode Resume</p>
                <Download />
              </Button>
          </div>
        </div>
        <div className=" sm:block flex  items-center justify-center">
          <div className=" shadow-lg shadow-yellow-300  bg-gradient-to-r dark:bg-gradient-to-l from-yellow-300 to-orange-400   rounded-full  h-[254px] w-[255px] p-2  ">
            <img
              src={profile2}
              alt="image"
              className=" object-contain   h-full w-full  rounded-full bg-white dark:bg-black    "
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
