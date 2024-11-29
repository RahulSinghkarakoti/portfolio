import React from "react";
import sampleVideo from "../assets/planmaster.mp4";
import Button from "./Button";

function Card(props) {
  const { className, project } = props;

  const {
    title,
    description,
    image = "",
    Live_link = "",
    code_link = "",
    tag,
    timeline,
  } = project;

  // console.log(project);
  return (
    <div
      className={`${className}   flex flex-row-reverse items-center p-2 gap-2  w-full  overflow-hidden  rounded-xl  h-full     bg-gray-100 bg-opacity-100  `}
    >
      <div className="w-1/2 h-auto   rounded-xl">
        <img src={image} alt="" />
      </div>
      <div className="space-y-1 w-1/2">
        <h1 className="font-semibold text-2xl">{title}</h1>
        <h3 className="text-sm">{timeline}</h3>
        <p className="text-sm text-gray-500">{description}</p>
        <div className="flex gap-1 flex-wrap">
          {tag.map((item, index) => {
            return (
              <span
                key={index}
                className="bg-[#f5f5f6]  dark:bg-[#3F4347] text-black dark:text-white  text-sm  font-semibold px-2 py-1 rounded-md
                "
              >
                {item}
              </span>
            );
          })}
        </div>
        <div className="flex gap-1 pt-2">
          <Button>Live</Button>
          <Button>Source</Button>
        </div>
      </div>
    </div>
  );
}

export default Card;
