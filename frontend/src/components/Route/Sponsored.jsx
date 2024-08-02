import React from "react";
import styles from "../../styles/styles";

const Sponsored = () => {
  return (
    <div
      className={`${styles.section} hidden sm:block bg-white py-6 px-10 mb-12 cursor-pointer rounded-xl`}
    >
      <div className="flex justify-between w-full">
        <div className="flex items-start">
          <img
            src="https://images.ctfassets.net/uwf0n1j71a7j/7BOkRtAHBD7LVHEbI36jyz/079537817625b8f9647ee7da26e2b6a4/pmfby-pradhan-mantri-fasal-bima-yojana.png"
            alt=""
            style={{width:"150px", objectFit:"contain"}}
          />
        </div>
        <div className="flex items-start">
          <img
            src="https://images.squarespace-cdn.com/content/v1/5c585e697a1fbd1e959119b5/b78108a6-2bd3-4092-a0d0-372d528de869/Farming+Help+logo+dark+blue+background.png"
            style={{width:"150px", objectFit:"contain"}}
            alt=""
          />
        </div>
        <div className="flex items-start">
          <img
            src="https://images.squarespace-cdn.com/content/v1/5c585e697a1fbd1e959119b5/1584540605415-AP85QDMIJ1VJXIGOS8ZA/Forage+Aid+Logo.jpg"
            style={{width:"150px", objectFit:"contain"}}
            alt=""
          />
        </div>
        <div className="flex items-start">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpfRcNqchxoKvLzRlPd2J2C7SVCWfjUGUn0uIaStLbKF-gT_EydVPCSrhYmrjSo_GuSg&usqp=CAU"
            style={{width:"150px", objectFit:"contain"}}
            alt=""
          />
        </div>
        <div className="flex items-start">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeBAaOT0sSjhlsw9dULY9FLNBAHRzkb-EcKg&usqp=CAU"
            style={{width:"150px", objectFit:"contain"}}
            alt=""
          />
        </div>
      </div>
    </div>
  );
};

export default Sponsored;
