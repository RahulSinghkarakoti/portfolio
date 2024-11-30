import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Globe } from "lucide-react";
import { useState } from "react";
import Button from "../Button";
// import { Link } from "react-router-dom";

export const HoverEffect = ({ items, className }) => {
  let [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2  lg:grid-cols-2  py-5",
        className
      )}
    >
      {items.map((item, idx) => (
        <a
          href={item?.link}
          key={item?.link}
          className="relative group  block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-gray-200 dark:bg-slate-800/[0.8] block  rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <Card className={" "}>
            <div className="space-y-1 ">
              <img src={item.image} alt="image" className="rounded-xl z-0" />
              <div>
                <CardTitle className={"px-2"}>{item.title}</CardTitle>
                <CardTimeline className={"px-2"}>{item.timeline}</CardTimeline>
                <CardTags>{item.tag}</CardTags>
              </div>
            </div>
            <div className={"px-2 pb-2 space-y-2 "}>
              <CardDescription>{item.description}</CardDescription>
              <ButtonGrp items={item} />
            </div>
          </Card>
        </a>
      ))}
    </div>
  );
};

export const Card = ({ className, children }) => {
  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full overflow-hidden    bg-white dark:bg-black border border-slate-300 dark:border-gray-600/40 group-hover:border-slate-300 relative z-20",

        className
      )}
    >
      <div className="p-2   h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
};
export const CardTitle = ({ className, children }) => {
  return (
    <h4
      className={cn(
        "text-black dark:text-zinc-100 text-3xl  font-bold tracking-wide mt-4",
        className
      )}
    >
      {children}
    </h4>
  );
};
export const CardDescription = ({ className, children }) => {
  return (
    <p
      className={cn(
        "mt-2 text-zinc-400 tracking-wide leading-relaxed text-sm",
        className
      )}
    >
      {children}
    </p>
  );
};

export const CardTimeline = ({ className, children }) => {
  return <div className={cn("text-xs", className)}>{children}</div>;
};

export const CardTags = ({ className, children }) => {
  return (
    <div className={cn("flex flex-wrap gap-2 p-2", className)}>
      {children.map((item, index) => {
        return (
          <span
            key={index}
            className="bg-[#d8d8da]  dark:bg-[#3F4347] text-black dark:text-white  text-xs  font-semibold px-2 py-1 rounded-md"
          >
            {item}
          </span>
        );
      })}
    </div>
  );
};

export const ButtonGrp = ({ items }) => {
  const { code_link, Live_link } = items;

  return (
    <div className=" flex gap-2 ">
      <Button
        link={code_link}
        className={"flex gap-2 items-center justify-center "}
      >
        <p>Source</p>
        <Github size={20} />
      </Button>

      <Button
        link={Live_link}
        className={"flex gap-2 items-center justify-center  "}
      >
        <p>Live</p>
        <Globe size={20} />
      </Button>
    </div>
  );
};
