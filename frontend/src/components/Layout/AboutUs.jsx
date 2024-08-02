import React from "react";
import styles from "../../styles/styles";
const AboutUs = () => {
  return (
    <>
      <div className="font-Poppins text-blue-900 font-semibold text-[45px] w-11/12 mx-auto text-center">
        About Us
      </div>
      <div className={`${styles.section} bg-yellow-100`}>
        <h2 className="text-4xl font-bold text-center font-Poppins underline decoration-wavy ">
          Our Team
        </h2>
        <br />
        <div className="flex justify-center">
          <img
            src={require("../../Assests/h.jpg")}
            alt=""
            className="w-auto h-auto rounded-[5px] object-cover border-[3px] shadow-lg shadow-slate-600"
          />
          </div>
          <br />
          <div>
          <p className="text-center font-Poppins font-medium text-[19px] text-[#3b3a3a] mr-32 pl-28 leading-[1.8rem]">
            Welcome to Krushak! We're thrilled to have you here and excited to
            introduce the incredible team behind the scenes. At Krushak, we
            believe in the power of collaboration, creativity, and innovation.
            Our dedicated team is of talented individuals who share a passion
            for purpose of the website.
          </p>
        </div>
        <br />
        <br />
        <p className="pl-[110px] font-Poppins font-semibold text-3xl">
          Meet the minds that bring Krushak to life:
        </p>
        <br />
        <div className="w-full h-[250px] flex justify-between items-center">
          <img
            src={require("../../Assests/g.jpg")}
            className="ml-[140px] w-[200px] h-[200px] rounded-full shadow-lg shadow-slate-600"
            alt=""
          />
          <h5
            className={`w-[60%] pl-2 mr-36 text-[19px] font-Poppins font-medium text-[#3b3a3a] leading-[1.8rem]`}
          >
            The coding virtuoso who brings lines of logic to life. With a flair
            for programming languages, she is the architect of our digital
            landscape. Every pixel and line of code is meticulously crafted
            under her watchful eye.
          </h5>
        </div>
        <div className="w-full h-[250px] flex justify-between items-center">
          <h5
            className={`w-[60%] ml-28 mr-12 text-[19px] font-Poppins font-medium text-[#3b3a3a] leading-[1.8rem]`}
          >
            The tech problem solver who ensures that Krushak not only looks
            fantastic but operates flawlessly. With a deep understanding of
            relevant technologies and frameworks, he is the wizard who turns
            complex challenges into seamless solutions.
          </h5>
          <img
            src={require("../../Assests/j.jpg")}
            className="mr-[180px] w-[200px] h-[200px] rounded-full shadow-lg shadow-slate-600"
            alt=""
          />
        </div>
        <div className={`${styles.section} bg-[#dcebafc2]`}>
          <br />
          <p className="text-center font-Poppins font-semibold text-3xl">
            Our Goals
          </p>
          <br />
          <div className="flex justify-center w-full">
            <img
              src={require("../../Assests/i.jpg")}
              className="w-[250px] h-[250px] rounded-full border-[3px] shadow-sm shadow-black"
              alt=""
            />
          </div>
          <br />
          <p className="text-center font-Poppins font-medium text-[22px] text-[#3b3a3a] mr-32 pl-28 leading-[5rem]">
            Provide the Farmers right price for their products.
          </p>
          <p className="font-Poppins font-semibold text-[22px] text-[#3b3a3a] pl-16">
            Objectives:
          </p>
          <p className="font-Poppins font-medium text-[19px] text-[#3b3a3a] pl-16 leading-[4rem]">
            ◎ Provide right price for farmers products.
          </p>
          <p className="font-Poppins font-medium text-[19px] text-[#3b3a3a] pl-16 leading-[4rem]">
            ◎ Provide buyers good quality products.
          </p>
          <p className="font-Poppins font-medium text-[19px] text-[#3b3a3a] pl-16 leading-[4rem]">
            ◎ Help farmers to learn new farming technologies.
          </p>
          <p className="font-Poppins font-medium text-[19px] text-[#3b3a3a] pl-16 leading-[4rem]">
            ◎ User friendly Interface.
          </p>
        </div>
      </div>
    </>
  );
};

export default AboutUs;