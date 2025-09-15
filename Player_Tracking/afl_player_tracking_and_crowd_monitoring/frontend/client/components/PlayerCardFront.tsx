import React from "react";
import cardFront from "@/assets/Card_Front.png";

export default function PlayerCardFront() {
  return (
    <div className="flex justify-center items-center p-4">
      <img
        src={cardFront}
        alt="Player Card Front"
        className="w-[300px] rounded-xl shadow-lg"
      />
    </div>
  );
}


