import React from "react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

const CalibrationHeader = () => {
  return (
    <div className="w-full flex flex-col gap-1 mb-4 sm:mb-6">
      <Title
        variant="small"
        className="!text-dark-black/80"
      >
        Calibration Overview
      </Title>
      <Text
        variant="small"
      >
        Calibration helps PitchProX understand your speaking pace, delivery, pauses, tone, and response timing so live teleprompting can better match how you naturally communicate.
      </Text>
    </div>
  );
};

export default CalibrationHeader;