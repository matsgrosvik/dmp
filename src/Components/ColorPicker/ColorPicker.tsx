import { BlockPicker } from "react-color";
import { useState } from "react";

interface Props {
  color: string;
  setColor: React.Dispatch<React.SetStateAction<string>>;
}

const ColorPicker: React.FC<Props> = ({ color, setColor }) => {
  return (
    <BlockPicker
      triangle="hide"
      colors={["#CCF9C2", "#2C301D"]}
      color={color}
      onChange={(color) => {
        setColor(color.hex);
      }}
    />
  );
};

export default ColorPicker;
