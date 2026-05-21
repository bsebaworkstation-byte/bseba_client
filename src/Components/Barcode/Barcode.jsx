import React, { useState, useEffect, useRef } from "react";
import Barcode from "react-barcode";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import api from "../../Helper/axios_resonse_interceptor";
import Select from "react-select";
import loadingStore from "../../Zustand/LoadingStore";
import SizeSlider from "../../Helper/UI/RangeSlider/PriceRangeSlider";

import { getBusinessDetails } from "../../Helper/SessionHelper";
import { printBarcode } from "../../Helper/printBarcode";

const BarcodePrint = () => {
  const printRef = useRef();
  const { setGlobalLoader } = loadingStore();

  const [barcodeWidth, setBarcodeWidth] = useState(1.5);
  const [barcodeHeight, setBarcodeHeight] = useState(30);
  const [barcodeFontSize, setBarcodeFontSize] = useState(12);
  const [barcodeFontPosition, setBarcodeFontPosition] = useState(false);
  const [barcodeLabel, setBarcodeLabel] = useState(true);

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [products, setProducts] = useState([]);

  const [productNameFontSize, setProductNameFontSize] = useState(10);
  const [companyNameFontSize, setCompanyNameFontSize] = useState(12);
  const [priceFontSize, setPriceFontSize] = useState(10);
  const [priceFontWeight, setPriceFontWeight] = useState("bold");
  const [productKeyword, setProductKeyword] = useState("");
  const [showCompanyName, setShowCompanyName] = useState(true);
  const [showProductName, setShowProductName] = useState(true);
  const [showProductPrice, setShowProductPrice] = useState(true);
  const [showPriceFontSize, setShowPriceFontSize] = useState(true);
  const [showPriceFontWeight, setShowPriceFontWeight] = useState(true);

  // Fetch products
  const fetchProducts = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/ProductList/1/20/${productKeyword || 0}`);
      if (res.data.status === "Success") {
        const raowProducts = res.data.data;
        setProducts(
          raowProducts.map((p) => ({
            value: p._id,
            label: `${p.name} (${p.Brands?.name}) (${p.Categories?.name}) - ${p.barcode}`,
            ...p,
          })),
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [productKeyword]);

  const handlePrint = () => {
    printBarcode(printRef);
  };

  const handleSelectChange = (selectedOptions) => {
    if (!selectedOptions) {
      setSelectedProducts([]);
      return;
    }

    const updatedList = selectedOptions.map((option) => {
      const existingItem = selectedProducts.find(
        (p) => p.value === option.value,
      );
      if (existingItem) {
        return existingItem;
      } else {
        return { ...option, printQty: 1 };
      }
    });

    setSelectedProducts(updatedList);
  };

  const handleQuantityChange = (id, newQty) => {
    const qty = parseInt(newQty);
    if (qty < 1) return;

    const updated = selectedProducts.map((p) =>
      p.value === id ? { ...p, printQty: qty } : p,
    );
    setSelectedProducts(updated);
  };

  const getPrintableItems = () => {
    let items = [];
    selectedProducts.forEach((p) => {
      for (let i = 0; i < (p.printQty || 1); i++) {
        items.push(p);
      }
    });
    return items;
  };

  const printableItems = getPrintableItems();

  return (
    <div className="flex gap-5 flex-col lg:flex-row px-2 lg:px-0">
      <div className="lg:w-1/2 w-full">
        <div className="w-full">
          <label className="block text-sm font-medium mb-1">
            Select Products <span className="text-red-500"> *</span>
          </label>

          <Select
            isMulti
            options={products}
            value={selectedProducts}
            onChange={handleSelectChange}
            placeholder="Select Products..."
            classNamePrefix="react-select"
            onInputChange={(val) => setProductKeyword(val)}
            styles={getReactSelectStyles()}
            isClearable
          />
        </div>

        {selectedProducts.length > 0 && (
          <div className="mt-4 border p-2 rounded bg-gray-50 max-h-64 overflow-y-auto">
            <h3 className="text-sm font-bold mb-2">Set Quantities:</h3>
            {selectedProducts.map((item) => (
              <div
                key={item.value}
                className="flex justify-between items-center mb-2 bg-white p-2 shadow-sm rounded"
              >
                <span className="text-xs w-2/3 truncate font-medium">
                  {item.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs">Qty:</span>
                  <input
                    type="number"
                    value={item.printQty}
                    onChange={(e) =>
                      handleQuantityChange(item.value, e.target.value)
                    }
                    className="border rounded w-16 text-center p-1 text-sm"
                    min={1}
                  />
                </div>
              </div>
            ))}
            <div className="text-right text-xs text-blue-600 font-bold mt-2">
              Total Stickers: {printableItems.length}
            </div>
          </div>
        )}

        {selectedProducts.length > 0 && (
          <>
            <div className="flex gap-5 flex-wrap justify-between mt-5">
              <ToggleSwitch
                label={"Company Name"}
                onChange={setShowCompanyName}
                value={showCompanyName}
              />
              <ToggleSwitch
                label={"Product Name"}
                onChange={setShowProductName}
                value={showProductName}
              />
              <ToggleSwitch
                label={"Product Price"}
                onChange={setShowProductPrice}
                value={showProductPrice}
              />
              <ToggleSwitch
                label={"Barcode Label"}
                onChange={setBarcodeLabel}
                value={barcodeLabel}
              />
              <ToggleSwitch
                label={`Position ${barcodeFontPosition ? "Top" : "Bottom"}`}
                onChange={setBarcodeFontPosition}
                value={barcodeFontPosition}
              />
              <ToggleSwitch
                label={"Price Font Size"}
                onChange={setShowPriceFontSize}
                value={showPriceFontSize}
              />
              <ToggleSwitch
                label={"Price Font Bold"}
                onChange={() => {
                  setShowPriceFontWeight(!showPriceFontWeight);
                  setPriceFontWeight(showPriceFontWeight ? "normal" : "bold");
                }}
                value={showPriceFontWeight}
              />
            </div>

            {/* Sliders */}
            {!!showCompanyName && (
              <SizeSlider
                label="Company Name Font Size"
                min={5}
                max={20}
                value={companyNameFontSize}
                setValue={setCompanyNameFontSize}
              />
            )}
            {!!showProductName && (
              <SizeSlider
                label="Product Font Size"
                min={5}
                max={20}
                value={productNameFontSize}
                setValue={setProductNameFontSize}
              />
            )}
            {!!barcodeLabel && (
              <SizeSlider
                label="Barcode Font Size"
                min={5}
                max={20}
                value={barcodeFontSize}
                setValue={setBarcodeFontSize}
              />
            )}

            {!!showProductPrice && (
              !!showPriceFontSize && (
                <SizeSlider
                  label="Price Font Size"
                  min={5}
                  max={20}
                  value={priceFontSize}
                  setValue={setPriceFontSize}
                />
              )
            )}
            <SizeSlider
              label="Barcode height"
              min={10}
              max={150}
              value={barcodeHeight}
              setValue={setBarcodeHeight}
            />
            <SizeSlider
              label="Barcode Width"
              min={0.5}
              max={4}
              value={barcodeWidth}
              setValue={setBarcodeWidth}
            />

            <button onClick={handlePrint} className="global_button w-full my-5">
              Print - {printableItems.length} Copies
            </button>
          </>
        )}
      </div>

      {/* Print Preview */}
      <div className="lg:w-1/2 w-full flex justify-center p-4 rounded">
        <div
          className={`${
            selectedProducts.length > 0 ? "block" : "hidden"
          } w-full`}
        >
          <div ref={printRef} className="w-full bg-white p-2">
            <style>
              {`
          @media print {
            @page { size: A4; margin: 5mm; }
            body { -webkit-print-color-adjust: exact; }
          }
        `}
            </style>

            <div className="grid grid-cols-4 gap-2 w-full">
              {printableItems.map((item, idx) => (
                <div
                  key={`${item.value}-${idx}`}
                  className="flex flex-col items-center justify-center border border-gray-200 p-1 break-inside-avoid page-break-inside-avoid"
                >
                  {!!showCompanyName && (
                    <h1
                      className="text-black text-center leading-none font-bold"
                      style={{ fontSize: `${companyNameFontSize}px` }}
                    >
                      {getBusinessDetails()?.businessName}
                    </h1>
                  )}

                  {!!showProductName && (
                    <h1
                      className="text-black text-center leading-tight mt-1"
                      style={{ fontSize: `${productNameFontSize}px` }}
                    >
                      {item.name.length > 25
                        ? item.name.substring(0, 25) + "..."
                        : item.name}
                    </h1>
                  )}

                  {!!showProductPrice && (
                    <h1
                      className="text-black text-center leading-none"
                      style={{
                        fontSize: `${priceFontSize}px`,
                        fontWeight: priceFontWeight,
                      }}
                    >
                      {item.mrp} Tk
                    </h1>
                  )}

                  <div className="mt-1">
                    <Barcode
                      value={item.barcode}
                      width={barcodeWidth}
                      height={barcodeHeight}
                      fontSize={barcodeFontSize}
                      displayValue={barcodeLabel}
                      margin={2}
                      textPosition={barcodeFontPosition ? "top" : "bottom"}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodePrint;

const ToggleSwitch = ({ label, value, onChange }) => {
  return (
    <div className="flex mt-5 items-center gap-3">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-12 h-6 flex items-center rounded-full px-1 transition ${
          value ? "bg-green-500 justify-end" : "bg-gray-300 justify-start"
        }`}
      >
        <div className="w-4 h-4 bg-white rounded-full shadow"></div>
      </button>
      <span className="text-xs">{value ? "Yes" : "No"}</span>
    </div>
  );
};
