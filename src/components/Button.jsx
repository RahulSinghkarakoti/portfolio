import React from "react";
function Button({ variant ="dark", children = "Button" ,link="",className="" }) {
    const baseClasses =
    "rounded-md w-full  px-4 py-2 text-sm font-medium dark:bg-primary-light dark:text-black    disabled:opacity-50 disabled:pointer-events-none" ;
  const variantClasses =
    variant === "dark"
      ? "bg-primary-dark text-white hover:bg-opacity-40  hover:bg-gray-900 hover:text-black "
      : "bg-primary-light text-black  hover:bg-gray-200";

  return (
     <a href={link}   target="_blank" rel="noopener noreferrer" className={`${baseClasses} ${variantClasses}${className}  `}>
      {children}
    </a>
  );
}

export default Button;
