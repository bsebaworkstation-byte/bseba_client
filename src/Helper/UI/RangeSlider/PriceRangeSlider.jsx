import React, { useRef } from "react";
import "./PriceRangeSlider.css";

const SizeSlider = ({
  label = "Size",
  min = 0,
  max = 100,
  value,
  setValue,
}) => {
  const trackRef = useRef(null);
  const percentage = ((value - min) / (max - min)) * 100;

  // Track click handler
  const handleTrackClick = (e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    const percent = clickX / width;
    const newValue = min + percent * (max - min);

    setValue(Number(newValue.toFixed(2)));
  };

  

  return (
    <div className="slider-wrapper">
      <div className="slider-header">
        <span className="font-bold">{label}</span>
        <span className="slider-value">{value}</span>
      </div>

      <div
        className="slider-container"
        ref={trackRef}
        onClick={handleTrackClick}
      >
        {/* এই ট্র্যাকটি এখন ইনপুটের নিচে সুন্দরভাবে বসে থাকবে */}
        <div className="slider-track">
          <div
            className="slider-progress"
            style={{ width: `${percentage > 100 ? 100 : percentage}%` }}
          />
        </div>

        <input
          type="range"
          className="slider-input"
          min={min}
          max={max}
          step="0.01"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
        />
      </div>
    </div>
  );
};

export default SizeSlider;
