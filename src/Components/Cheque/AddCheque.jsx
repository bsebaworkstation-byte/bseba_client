import React, { useEffect, useState } from "react";
import api from "../../Helper/axios_resonse_interceptor";
import loadingStore from "../../Zustand/LoadingStore";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { useNavigate } from "react-router-dom";

export default function AddCheque() {

  const { setGlobalLoader } = loadingStore();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [formData, setFormData] = useState({
    accountID: "",
    contactsID: "",
    chequeNo: "",
    amount: "",
    issueDate: new Date(),
    chequeDate: new Date(),
    type: "Receive",
    note: ""
  });

  // fetch accounts
  const fetchAccounts = async () => {
    try {

      const res = await api.get("/AllAccount");

      if (res.data.status === "Success") {
        setAccounts(res.data.data);
      }

    } catch (err) {
      console.error(err);
    }
  };

  // fetch contacts
  const fetchContacts = async () => {

    setGlobalLoader(true);

    try {

      const res = await api.get(`/ContactList/1/20/${search || 0}`);

      if (res.data.status === "Success") {

        setContacts(
          res.data.data.map((s) => ({
            value: s._id,
            label: `${s.name}  | ${s.contactPerson} |  ${s.address} | ${s.mobile} | Balance: ${s.balance}`,
            ...s,
          }))
        );

      } else {
        ErrorToast("Failed to fetch contacts");
      }

    } catch (error) {

      ErrorToast("Something went wrong");
      console.error(error);

    } finally {

      setGlobalLoader(false);

    }

  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [search]);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!formData.contactsID) {
      ErrorToast("Please select a contact");
      return;
    }

    if (!formData.accountID) {
      ErrorToast("Please select an account");
      return;
    }

    try {

      setGlobalLoader(true);

      const res = await api.post("/AddCheque", formData);

      if (res.data.status === "success") {

        SuccessToast("Cheque Added Successfully");


        setFormData({
          accountID: "",
          contactsID: "",
          chequeNo: "",
          amount: "",
          issueDate: new Date(),
          chequeDate: new Date(),
          type: "Receive",
          note: ""
        });

        setSelectedCustomer(null);
        navigate("/Cheque");
      } else {

        ErrorToast(res.data.message || "Failed to add cheque");

      }

    } catch (err) {

      console.error(err);
      ErrorToast("Something went wrong");

    } finally {

      setGlobalLoader(false);

    }

  };

  return (

    <div className="global_sub_container max-w-xl mx-auto">

      <h1 className="text-xl font-semibold mb-4">Add Cheque</h1>

      <form onSubmit={handleSubmit} className="space-y-3">

        {/* Account */}
        <div>

          <label className="block text-sm mb-1">Account</label>

          <select
            name="accountID"
            value={formData.accountID}
            onChange={handleChange}
            className="global_input w-full"
            required
          >

            <option value="">Select Account</option>

            {accounts.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name} ({a.balance})
              </option>
            ))}

          </select>

        </div>

        {/* Contact Search */}

        <div>

          <label className="block text-sm mb-1">Contact</label>

          <Select
            options={contacts}
            value={selectedCustomer}
            placeholder="Search Contact..."
            classNamePrefix="react-select"
            styles={getReactSelectStyles()}
            onInputChange={(value) => setSearch(value)}
            isClearable
            onChange={(selected) => {

              setSelectedCustomer(selected);

              setFormData({
                ...formData,
                contactsID: selected ? selected.value : ""
              });

            }}
          />

        </div>

        {/* Cheque No */}

        <div>

          <label className="block text-sm mb-1">Cheque No</label>

          <input
            type="text"
            name="chequeNo"
            value={formData.chequeNo}
            onChange={handleChange}
            className="global_input w-full"
            required
          />

        </div>

        {/* Amount */}

        <div>

          <label className="block text-sm mb-1">Amount</label>

          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="global_input w-full"
            required
          />

        </div>

        {/* Issue Date */}

        <div>

          <label className="block text-sm mb-1">Issue Date</label>

          <DatePicker
            selected={formData.issueDate}
            onChange={(date) =>
              setFormData({ ...formData, issueDate: date })
            }
            className="global_input w-full"
            dateFormat="dd-MM-yyyy"
          />

        </div>

        {/* Cheque Date */}

        <div>

          <label className="block text-sm mb-1">Cheque Date</label>

          <DatePicker
            selected={formData.chequeDate}
            onChange={(date) =>
              setFormData({ ...formData, chequeDate: date })
            }
            className="global_input w-full"
            dateFormat="dd-MM-yyyy"
          />

        </div>

        {/* Type */}

        <div>

          <label className="block text-sm mb-1">Type</label>

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="global_input w-full"
          >

            <option value="Receive">Receive</option>
            <option value="Payment">Payment</option>

          </select>

        </div>

        {/* Note */}

        <div>

          <label className="block text-sm mb-1">Note</label>

          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            className="global_input w-full"
          />

        </div>

        <button
          type="submit"
          className="global_button w-full"
        >
          Add Cheque
        </button>

      </form>

    </div>

  );

}