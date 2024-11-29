import React from "react";
import RESUMEDATA from "../../constant/data";
import { motion, useInView } from "framer-motion";
import RevealOnScroll from "../RevealOnScroll";

function Skill() {
  const { skills } = RESUMEDATA;
  return (
    <div className="mt-8 mb-8">
      <h1 className=" overflow-hidden  text-xl text-black dark:text-gray-100  font-semibold border-l-8 border-black dark:border-white  pl-3 py-2 dark:bg-gradient-to-r dark:from-[#141418] dark:to-black bg-gradient-to-r from-[#f5f5f6] to-white">
        <RevealOnScroll>Skills</RevealOnScroll>
      </h1>

      

      <motion.div
        initial="hidden"
         whileInView="visible"
         viewport={{ once: true, amount: 0.5 }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.5,  
            },
          },
        }}
        className="h-full flex flex-wrap justify-start items-center p-4 gap-2 overflow-hidden"
      >
        {skills.map((skill, index) => (
          <motion.span
            key={index}
            variants={{
              hidden: { opacity: 0, x: -100 },
              visible: {
                opacity: 1,
                x: 0,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                },
              },
            }}
            className="bg-[#27272a] dark:bg-[#f5f5f6] text-white dark:text-black text-sm px-3 py-2 rounded-lg block"
          >
            {skill}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}

export default Skill;
