import React from "react";
import styles from "../../styles/styles";

const AboutUs = () => {
  return (
    <>
      <div className="font-Poppins text-blue-900 font-semibold text-[4vw] w-11/12 mx-auto text-center">
        About Us
      </div>
      <div className={`${styles.section} bg-yellow-100 p-4 sm:p-6 md:p-8`}>
        <h2 className="text-3xl sm:text-4xl font-bold text-center font-Poppins underline decoration-wavy">
          Our Team
        </h2>
        <br />
        <div className="flex justify-center">
          <img
            src={require("../../Assests/h.jpg")}
            alt="Our Team"
            className="w-full max-w-xs md:max-w-md rounded-md object-cover border-[3px] shadow-lg shadow-slate-600"
          />
        </div>
        <br />
        <div className="text-center">
          <p className="font-Poppins font-medium text-[16px] sm:text-[19px] text-[#3b3a3a] mx-auto leading-[1.8rem] px-4 sm:px-6 md:px-8">
            Welcome to Krushak! We're thrilled to have you here and excited to
            introduce the incredible team behind the scenes. At Krushak, we
            believe in the power of collaboration, creativity, and innovation.
            Our dedicated team is composed of talented individuals who share a
            passion for the purpose of the website.
          </p>
        </div>
        <br />
        <br />
        <p className="text-center font-Poppins font-semibold text-2xl sm:text-3xl">
          Meet the minds that bring Krushak to life:
        </p>
        <br />
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center justify-center md:w-1/2 mb-4 md:mb-0">
            <img
              src={require("../../Assests/g.jpg")}
              className="w-[150px] h-[150px] md:w-[200px] md:h-[200px] rounded-full shadow-lg shadow-slate-600"
              alt="Team Member"
            />
            <h5
              className={`w-full md:w-[60%] text-[16px] sm:text-[19px] font-Poppins font-medium text-[#3b3a3a] leading-[1.8rem] px-4 md:px-6`}
            >
              The coding virtuoso who brings lines of logic to life. With a flair
              for programming languages, she is the architect of our digital
              landscape. Every pixel and line of code is meticulously crafted
              under her watchful eye.
            </h5>
          </div>
          <div className="flex items-center justify-center md:w-1/2">
            <h5
              className={`w-full md:w-[60%] text-[16px] sm:text-[19px] font-Poppins font-medium text-[#3b3a3a] leading-[1.8rem] px-4 md:px-6`}
            >
              The tech problem solver who ensures that Krushak not only looks
              fantastic but operates flawlessly. With a deep understanding of
              relevant technologies and frameworks, he is the wizard who turns
              complex challenges into seamless solutions.
            </h5>
            <img
              src={require("../../Assests/j.jpg")}
              className="w-[150px] h-[150px] md:w-[200px] md:h-[200px] rounded-full shadow-lg shadow-slate-600"
              alt="Team Member"
            />
          </div>
        </div>
        <div className={`${styles.section} bg-[#dcebafc2] p-4 sm:p-6 md:p-8`}>
          <br />
          <p className="text-center font-Poppins font-semibold text-2xl sm:text-3xl">
            Our Goals
          </p>
          <br />
          <div className="flex justify-center">
            <img
              src={require("../../Assests/i.jpg")}
              className="w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] rounded-full border-[3px] shadow-sm shadow-black"
              alt="Goals"
            />
          </div>
          <br />
          <p className="text-center font-Poppins font-medium text-[18px] sm:text-[22px] text-[#3b3a3a] mx-auto leading-[1.8rem] px-4 sm:px-6 md:px-8">
            Provide the Farmers right price for their products.
          </p>
          <p className="font-Poppins font-semibold text-[18px] sm:text-[22px] text-[#3b3a3a] mx-auto px-4 sm:px-6 md:px-8">
            Objectives:
          </p>
          <p className="font-Poppins font-medium text-[16px] sm:text-[19px] text-[#3b3a3a] mx-auto px-4 sm:px-6 md:px-8 leading-[1.8rem]">
            ◎ Provide right price for farmers products.
          </p>
          <p className="font-Poppins font-medium text-[16px] sm:text-[19px] text-[#3b3a3a] mx-auto px-4 sm:px-6 md:px-8 leading-[1.8rem]">
            ◎ Provide buyers good quality products.
          </p>
          <p className="font-Poppins font-medium text-[16px] sm:text-[19px] text-[#3b3a3a] mx-auto px-4 sm:px-6 md:px-8 leading-[1.8rem]">
            ◎ Help farmers to learn new farming technologies.
          </p>
          <p className="font-Poppins font-medium text-[16px] sm:text-[19px] text-[#3b3a3a] mx-auto px-4 sm:px-6 md:px-8 leading-[1.8rem]">
            ◎ User friendly Interface.
          </p>
        </div>
      </div>
    </>
  );
};

export default AboutUs;
