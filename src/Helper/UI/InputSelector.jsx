import React, { useState, useEffect, useRef, Fragment } from "react";
import { FaChevronDown } from "react-icons/fa";
import { RiCheckboxMultipleFill } from "react-icons/ri";
import { createPortal } from "react-dom";
const InputSelector = ({
  label = "",
  onChange,
  onSelect,
  value,
  options,
  placeholder,
  suggetionContainerStyle,
  suggetionContainerClassName,
  multyContainerClassName,
  selectedMultyOptionClassName,
  disabled = false,
  inputClassName,
  optionClassName,
  isMulty = false,
}) => {
  const [showSuggetion, setShowSuggetion] = useState(false);
  const [showMulty, setShowMulty] = useState(false);
  const wrapperRef = useRef(null);
  const [searchText, setSearchText] = useState(""); // 👈 user typing রাখবে
  const [filteredOption, setFilteredOption] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  // বাইরে ক্লিক detect করার জন্য useEffect
  useEffect(() => {
    if (options) {
      setFilteredOption(options);
    }
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggetion(false);
        setShowMulty(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (options) {
      setFilteredOption(options);
    }
  }, [options]);

  useEffect(() => {
    if (searchText) {
      const filtered = options.filter((o) =>
        o.label.toLowerCase().includes(searchText.toLowerCase())
      );

      setFilteredOption(filtered);
    } else {
      setFilteredOption(options);
    }
  }, [searchText]);

  return (
    <Fragment>
      <div
        style={{
          position: "relative",
        }}
        ref={wrapperRef}
      >
        <div>
          <input
            autoComplete="off"
            type="text"
            id="any"
            name="any"
            disabled={disabled}
            onChange={(e) => {
              // if (e.target.value === "") {
              //   onSelect(null);
              // }
              setSearchText(e.target.value); // typing
              onChange(e.target.value); // parent-এ notify
              setShowSuggetion(true); // typing করলে dropdown খোলা থাকবে
            }}
            value={searchText}
            className={`${inputClassName}`}
            style={{
              position: "relative",
            }}
            onClick={() => {
              setShowSuggetion(true);
              setShowMulty(false);
            }}
            placeholder={placeholder}
          />
          {filteredOption.length > 0 && (
            <FaChevronDown
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-sm ${
                showSuggetion
                  ? "text-gray-500"
                  : " dark:text-white text-gray-200"
              }`}
            />
          )}
          {isMulty && selectedOptions.length > 0 && (
            <RiCheckboxMultipleFill
              className="absolute bottom-1/3 right-8"
              onClick={() => {
                setShowSuggetion(false);
                setShowMulty(true);
              }}
            />
          )}
        </div>

        <div
          className={`${
            multyContainerClassName ? multyContainerClassName : "top-full"
          } absolute z-40 left-0 w-full overflow-hidden rounded shadow transform transition-all duration-300 ease-in-out
      ${
        showMulty
          ? "max-h-[40vh] overflow-y-auto opacity-100 translate-y-0"
          : "max-h-0 opacity-0 -translate-y-2"
      }`}
        >
          {/* Multiple selection here */}
          <div>
            {selectedOptions.map((o, i) => {
              return (
                <h1
                  className={`${selectedMultyOptionClassName} cursor-pointer flex gap-1 items-center justify-between ${
                    o.value === value?.value ? "" : ""
                  }`}
                  key={i}
                >
                  {o.label}{" "}
                  <button
                    onClick={() => {
                      setSelectedOptions((prev) =>
                        prev.filter((item) => item.value !== o.value)
                      );
                      setFilteredOption((prev) => [...prev, o]);
                      // REMOVE from filtered
                    }}
                    className="text-sm"
                  >
                    x
                  </button>
                </h1>
              );
            })}
          </div>
        </div>

        <div
          className={`${
            suggetionContainerClassName
              ? suggetionContainerClassName
              : "top-full"
          } z-40 absolute left-0 w-full overflow-hidden rounded shadow transform transition-all duration-300 ease-in-out
      ${
        showSuggetion
          ? "max-h-[40vh] overflow-y-auto opacity-100 translate-y-0"
          : "max-h-0 opacity-0 -translate-y-2"
      }`}
        >
          {/* suggestion items here */}
          <div>
            {filteredOption.length < 1 && (
              <h1
                disabled={true}
                className={`${optionClassName} cursor-pointer`}
              >
                No Item Found
              </h1>
            )}
            {filteredOption.length > 0 &&
              filteredOption.map((o, i) => {
                return (
                  <h1
                    onClick={() => {
                      onSelect(o);
                      if (isMulty) {
                        setSelectedOptions((prev) => [...prev, o]);
                        setFilteredOption((prev) =>
                          prev.filter((i) => i.value !== o.value)
                        );
                        setShowMulty(true);
                      }
                      setShowSuggetion(false);
                    }}
                    className={`${optionClassName} cursor-pointer ${
                      o.value === value?.value ? "" : ""
                    }`}
                    key={i}
                  >
                    {o.label}
                  </h1>
                );
              })}
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default InputSelector;
