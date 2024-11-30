import React from "react";
import GitHubCalendar from "react-github-calendar";
import RevealOnScroll from "../RevealOnScroll";

const selectLastHalfYear = (contributions) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const shownMonths = 6;

  return contributions.filter((activity) => {
    const date = new Date(activity.date);
    const monthOfDay = date.getMonth();

    return (
      date.getFullYear() === currentYear &&
      monthOfDay > currentMonth - shownMonths &&
      monthOfDay <= currentMonth
    );
  });
};

function Github() {
  const [mounted, setMounted] = React.useState(false);

  const theme = localStorage.getItem("darkMode") === "true" ? "dark" : "light";

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[160px] rounded-xl bg-muted animate-pulse" />
    );
  }

  return (
    <div className="mb-6">
      <h1 className="overflow-hidden  text-xl text-black dark:text-gray-100  font-semibold  border-l-8 border-black dark:border-white  pl-3 py-2 dark:bg-gradient-to-r dark:from-[#141418] dark:to-black bg-gradient-to-r from-[#f5f5f6] to-white">
        <RevealOnScroll>GitHub Contributions</RevealOnScroll>
      </h1>
      <div className="p-4  ">
        <GitHubCalendar
          username="rahulSinghkarakoti"
          transformData={selectLastHalfYear}
          colorScheme={theme}
          fontSize={12}
          blockSize={15}
          blockMargin={4}
        />
      </div>
    </div>
  );
}

export default Github;
