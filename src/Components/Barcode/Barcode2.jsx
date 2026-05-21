import React, { useState, useEffect, useRef } from "react";
import Barcode from "react-barcode";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import api from "../../Helper/axios_resonse_interceptor";
import Select from "react-select";
import loadingStore from "../../Zustand/LoadingStore";
import PriceRangeSlider from "../../Helper/UI/RangeSlider/PriceRangeSlider";
import SizeSlider from "../../Helper/UI/RangeSlider/PriceRangeSlider";

import { getBusinessDetails } from "../../Helper/SessionHelper";
import { printBarcode } from "../../Helper/printBarcode";


const BarcodePrint = () => {
  const printRef = useRef();
  const { setGlobalLoader } = loadingStore();
  const [barcodeWidth, setBarcodeWidth] = useState(2);
  const [barcodeHeight, setBarcodeHeight] = useState(30);
  const [barcodeFontSize, setBarcodeFontSize] = useState(5);
  const [barcodeQuantity, setBarcodeQuantity] = useState(1);
  const [priceFontSize, setPriceFontSize] = useState(5);
  const [priceFontWeight, setPriceFontWeight] = useState("normal");
  const [barcodeFontPosition, setBarcodeFontPosition] = useState(false);
  const [barcodeLabel, setBarcodeLabel] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [productNameFontSize, setProductNameFontSize] = useState(5);
  const [companyNameFontSize, setCompanyNameFontSize] = useState(5);
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
        // const availableProducts = raowProducts.filter((p) => p.qty > 0);
        setProducts(
          raowProducts.map((p) => ({
            value: p._id,
            label: `${p.name} (${p.Brands.name}) (${p.Categories.name}) (Barcode ${p.barcode})`,
            ...p,
          }))
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
    printBarcode(printRef, barcodeQuantity);
  };


  return (
    <div className="flex gap-5 flex-col lg:flex-row px-2 lg:px-0">
      {/* Barcode Mobile */}
      {!!selectedProduct && (
        <div className="flex flex-col w-full h-auto justify-center items-center lg:hidden my-5 ">
          <div
            className="flex flex-col items-center bg-white "
            ref={printRef}
            style={{ width: "58mm", padding: "4px" }}
          >
            {" "}
            {!!showCompanyName && (
              <h1
                className="text-black"
                style={{ fontSize: `${companyNameFontSize}px` }}
              >
                {getBusinessDetails()?.businessName}
              </h1>
            )}
            {!!showProductName && (
              <h1
                className={`text-black`}
                style={{ fontSize: `${productNameFontSize}px` }}
              >
                {selectedProduct?.name}
              </h1>
            )}
            {!!showProductPrice && (
              <h1
                className={`text-black`}
                style={{ fontSize: `${productNameFontSize}px` }}
              >
                {selectedProduct?.mrp}
              </h1>
            )}
            <Barcode
              value={selectedProduct?.barcode}
              width={barcodeWidth}
              height={barcodeHeight}
              fontSize={barcodeFontSize}
              displayValue={barcodeLabel}
              margin={5}
              textPosition={barcodeFontPosition ? "top" : "bottom"}
            />
          </div>
        </div>
      )}
      <div className="lg:w-1/2 w-full">
        {/* Product*/}
        <div className="w-full">
          <label className="block text-sm font-medium mb-1">
            Product <span className="text-red-500"> *</span>
          </label>

          <Select
            options={products}
            value={null}
            onChange={setSelectedProduct}
            placeholder="Select Product"
            classNamePrefix="react-select"
            onInputChange={(val) => setProductKeyword(val)}
            styles={getReactSelectStyles()}
            isClearable
          />
        </div>
        {selectedProduct && (
          <>
            {/* Quantity */}
            <div className="flex justify-center my-5">
              <div className="flex flex-col gap-2">
                <h1 className="text-center">Print Quantity</h1>
                <input
                  type="number"
                  value={barcodeQuantity}
                  onChange={(e) => {
                    setBarcodeQuantity(e.target.value);
                  }}
                  className="global_input w-fit text-center"
                  placeholder="Print Quantity"
                  min={1}
                />
              </div>
            </div>
            {/* Toogle Buttons */}
            <div className="flex gap-5 flex-wrap justify-between">
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
              !!showPriceFontSize && <SizeSlider
                label="Price Font Size"
                min={5}
                max={20}
                value={priceFontSize}
                setValue={setPriceFontSize}
              /> 
            )}

        
            <SizeSlider
              label="Barcode height"
              min={10}
              max={300}
              value={barcodeHeight}
              setValue={setBarcodeHeight}
            />
            <SizeSlider
              label="Barcode Width"
              min={0.5}
              max={5}
              value={barcodeWidth}
              setValue={setBarcodeWidth}
            />
          </>
        )}

        <button onClick={handlePrint} className="global_button w-full my-5">
          Print - {barcodeQuantity} Copy
        </button>
      </div>
      {/* Barcode */}
      {!!selectedProduct && (
        <div className="lg:flex flex-col w-full h-auto justify-center items-center hidden">
          <div
            className="flex flex-col items-center bg-white border border-gray-300"
            ref={printRef}
            style={{ width: "58mm", padding: "4px" }}
          >
            {" "}
            {!!showCompanyName && (
              <h1
                className="text-black"
                style={{ fontSize: `${companyNameFontSize}px` }}
              >
                {getBusinessDetails()?.businessName}
              </h1>
            )}
            {!!showProductName && (
              <h1
                className={`text-black`}
                style={{ fontSize: `${productNameFontSize}px` }}
              >
                {selectedProduct?.name}
              </h1>
            )}
            {!!showProductPrice && (
              <h1
                className={`text-black`}
                style={{ fontSize: `${priceFontSize}px`, fontWeight: priceFontWeight }}
              >
                {selectedProduct?.mrp} Tk
              </h1>
            )}
            <Barcode
              value={selectedProduct?.barcode}
              width={barcodeWidth}
              height={barcodeHeight}
              fontSize={barcodeFontSize}
              
              displayValue={barcodeLabel}
              margin={5}
              textPosition={barcodeFontPosition ? "top" : "bottom"}
            />
          </div>
        </div>
      )}
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
