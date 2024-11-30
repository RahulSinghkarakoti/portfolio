import blog from "../assets/blog.png"
import internship from "../assets/internship.png"
import planmaster from "../assets/planmaster.png"
import videotube from "../assets/videotube.png"
import mstryMsg from "../assets/mstryMsg.png"


const RESUMEDATA = {
  name: "Rahul Singh  ",
  desc: "Crafting impactful tech projects with a focus on front-end design and full-stack development, while constantly expanding my skillset",
  about:
    "I’m currently pursuing my **BCA** and will be completing it in 2025. At the moment, I’m focusing on **Next.js** and working on various projects to enhance my skills. I enjoy contributing to **open-source projects** and learning new technologies to stay updated in the ever-evolving tech world.",
  tags: [
    {
      tag: "Full-Stack Developer in Progress",
      color: "#22c55e", // Bright Green
    },
    {
      tag: "Open to Remote Opportunities",
      color: "#3b82f6", // Bright Blue
    },
    {
      tag: "Frontend Developer @Creative Visionary",
      color: "#f97316", // Bright Orange
    }, 
  ],
  work_Experience: [
    {
      title: "Frontend Developer Intern @ IBM Summer Internship",
      duration: "June 2022 - August 2022",
      description:
        "Focused on building and designing a responsive website using ReactJS, enhancing UI/UX, and integrating dynamic features.",
    },
  ],
  education: [
    {
      Degree: "Bachelor of Computer Application",
      Collage: "Vivekananda Institute of Professional Studies",
      Duration: "2022 - 2025",
    },
  ],
  skills: [
    "NextJs",
    "ReactJs",
    "TS/JS",
    "TailwindCSS",
    "MongoDB",
    "C++",
    "MySql",
    "NodeJs/ExpressJs",
    "Git/Github",
  ],
  social: {
    linkedin: "https://www.linkedin.com/in/rahul-singh-9b2251304/",
    github: "https://github.com/rahulSinghkarakoti",
    twitter: "https://x.com/Rahulkarakoti28",
  },
  projects: [
    {
      title: "Planmaster",
      description:
        "A web application for creating, managing, and tracking personalized learning plans, featuring real-time progress updates and user-friendly interfaces.",
      image: planmaster,
      Live_link: "https://planmaster-alpha.vercel.app/",
      code_link: "https://github.com/RahulSinghkarakoti/planmaster",
      tag: ["Next.js", "TypeScript", "Gemini API", "MongoDB", "Tailwind","Shadcn"],
      timeline: "Sep 2024 - Oct 2024",
    },
    {
      title: "VideoTube",
      description:
        "A full-stack web application replicating core YouTube features, including video uploads, likes, comments, user authentication, and responsive design.",
      image: videotube,
      Live_link: "https://frontend-video-tube.vercel.app/",
      code_link: "https://github.com/RahulSinghkarakoti/frontend-VideoTube",
      tag: ["ReactJS", "Node.js", "MongoDB", "Express","Axios", "JWT"],
      timeline: "Aug 2024 - July 2024",
    },
    {
      title: "mstryMessage",
      description:
        "A platform that allows users to generate and share custom links to gather anonymous feedback and opinions from others securely.",
      image: mstryMsg,
      Live_link: "https://mstry-message-tau.vercel.app/",
      code_link: "https://github.com/RahulSinghkarakoti/mstryMessage",
      tag: ["NextJs", "TypeScript", "Tailwind", "zod", "groq","Resend"],
      timeline: "June 2024 - May 2024",
    },
    {
      title: "IBM Summer Internship Project",
      description:
        "Developed a responsive website front end for an internal project, focusing on enhancing UI/UX using ReactJS and modern design principles.",
      image: internship,
      Live_link: "https://ibm-zerohunger-project.vercel.app/",
      code_link: "https://github.com/Princekashish/IBM-Client",
      tag: ["ReactJS", "CSS", "JavaScript", "Figma", "Axios","Git"],
      timeline: "June 2024 - Aug 2024",
    },
    // {
    //   title: "Blog",
    //   description:
    //     "A blogging platform built with Appwrite for backend services, allowing users to create, edit, and delete blog posts with secure user authentication and real-time updates.",
    //   image: blog,
    //   Live_link: "https://appwrite-blog-two-rose.vercel.app/",
    //   code_link: "https://github.com/RahulSinghkarakoti/AppwriteBlog",
    //   tag: ["ReactJS", "AppWrite", "TailwindCSS", "JavaScript", " Git"],
    //   timeline: "Sep 2024 - Oct 2024",
    // }, 
  ],
};

export default RESUMEDATA;
