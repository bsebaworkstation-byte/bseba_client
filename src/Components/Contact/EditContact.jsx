import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";

const EditContact = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setGlobalLoader } = loadingStore();

  const heading = useTextTranslate(HeadingTranslate);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const formTrans = useTextTranslate(GlobalFormTranslator);

  const [form, setForm] = useState({
    supplier: "",
    mobile: "",
    email: "",
    address: "",
    contactType: "",
    contactPerson: "",
    businessName: "", // hidden থাকবে
  });

  //  Business Name anar jonno API call
  const fetchBusinessName = async (businessID) => {
    try {
      const res = await api.get(`/GetBusinessById/${businessID}`);

      if (res.data.status === "Success") {
        return res.data.data?.businessName || "";
      } else {
        return "";
      }
    } catch {
      return "";
    }
  };

  //  Contact আনো
  const fetchContact = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/GetContactDetailsById/${id}`);

      if (res.data.status === "Success") {
        const data = res.data.data;

        // BusinessName alada kore neya holo
        const businessName = await fetchBusinessName(data.businessID);

        setForm({
          supplier: data.name || "",
          mobile: data.mobile || "",
          email: data.email || "",
          address: data.address || "",
          contactType: data.type || "",
          contactPerson: data.contactPerson || "",
          businessName: businessName,
        });
      } else {
        ErrorToast("Failed to load contact");
      }
    } catch (error) {
      ErrorToast("Something went wrong");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalLoader(true);
    try {
      const payload = {
        id: id, // Update API এর জন্য দরকার
        name: form.supplier,
        mobile: form.mobile,
        email: form.email,
        address: form.address,
        type: form.contactType,
        contactPerson: form.contactPerson,
        businessName: form.businessName, //  hidden theke jabe
      };

      const res = await api.post(`/UpdateContactById`, payload);

      if (res.data.status === "Success") {
        SuccessToast("Contact updated successfully");
        if (form.contactType === "Customer") {
          navigate("/Customer");
        } else if (form.contactType === "Supplier") {
          navigate("/Supplier");
        } else {
          navigate(-1); // যদি Both বা অন্য কিছু হয়, আগের পেজে ফিরে যাবে
        }
      } else {
        ErrorToast("Update failed");
      }
    } catch (error) {
      ErrorToast("Something went wrong");
    } finally {
      setGlobalLoader(false);
    }
  };

  return (
    <div className="global_container">
      <div className="global_sub_container">
        <h1 className="text-2xl font-bold mb-4">{heading("editContact")}</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-8 gap-4">
          <div className="col-span-8 lg:col-span-2">
            <label className="global_label">{formTrans("name")}</label>
            <input
              type="text"
              name="supplier"
              value={form.supplier}
              onChange={handleChange}
              className="global_input"
              required
            />
          </div>

          <div className="col-span-8 lg:col-span-2">
            <label className="global_label">{formTrans("mobile")}</label>
            <input
              type="text"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="global_input"
              required
            />
          </div>

          <div className="col-span-8 lg:col-span-2">
            <label className="global_label">{formTrans("email")}</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="global_input"
            />
          </div>
          <div className="col-span-8 lg:col-span-2">
            <label className="global_label">{formTrans("ContactPerson")}</label>
            <input
              type="text"
              name="contactPerson"
              value={form.contactPerson}
              onChange={handleChange}
              className="global_input"
              placeholder="Enter contact person name"
            />
          </div>
          <div className="col-span-8 lg:col-span-2">
            <label className="global_label">{formTrans("address")}</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="global_input"
              required
            />
          </div>

          <div className="col-span-8 lg:col-span-2">
            <label className="global_label">{formTrans("contactType")}</label>
            <select
              name="contactType"
              value={form.contactType}
              onChange={handleChange}
              className="global_input"
              required
            >
              <option value="">Select Type</option>
              <option value="Supplier">Supplier</option>
              <option value="Customer">Customer</option>
              <option value="Both">Both</option>
            </select>
          </div>

          <div className="col-span-8 flex gap-2">
            <button type="submit" className="global_button">
              {btn("update")}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="global_button_red"
            >
              {btn("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContact;
