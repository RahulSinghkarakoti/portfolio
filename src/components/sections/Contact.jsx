import React from "react";
import { Linkedin, Github, Twitter, Mail, FileUser } from "lucide-react";
import RESUMEDATA from "../../constant/data";
function Contact() {
  const {social}=RESUMEDATA
  return (
    <div className="border-t-2 p-10 border-slate-300 dark:border-gray-600/40 flex flex-col gap-4 items-center justify-center">
      <div className="flex gap-4 ">
        <a  
          href="../../assets/Rahul_SDE.pdf"  
              download="Rahul_SDE.pdf"
        >
          <FileUser />
        </a>
        <a href={social.github} target="_blank">
          <Github />
        </a>
        <a href={social.twitter} target="_blank">
          <Twitter />
        </a>
        <a href={social.linkedin} target="_blank">
          <Linkedin />
        </a>
        <a href="mailto:rahulkarakoti28@gmail.com">
          <Mail />
        </a>
      </div>
      <div>
        <p>© 2024 All Rights Reserved</p>
      </div>
    </div>
  );
}

export default Contact;
