import React, { useEffect, useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../Helper/axios_resonse_interceptor";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import {
  FaUser,
  FaTools,
  FaDollarSign,
  FaBarcode,
  FaExclamationTriangle,
  FaStickyNote,
  FaCalendarAlt,
  FaCreditCard,
  FaSave,
  FaSearch,
  FaTrash,
  FaUserPlus,
  FaPhone,
  FaMapMarkerAlt,
  FaWallet,
  FaClock,
  FaCheckCircle,
  FaInfoCircle,
  FaArrowRight,
  FaLock,
} from "react-icons/fa";
import { TbCurrencyTaka } from "react-icons/tb";
import { MdDelete, MdWarning, MdOutlinePayment } from "react-icons/md";
import { HiOutlineChip } from "react-icons/hi";
import CreateCustomerModalImmediate from "../Modals/CreateCustomerModalImmediate";
import { useNavigate, useParams } from "react-router-dom";

// Debounce utility
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// ✅ InputField — component এর বাইরে রাখা হয়েছে (focus হারানোর সমস্যা ঠিক)
const InputField = ({
  icon: Icon,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  helper,
}) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon className="text-gray-500 dark:text-gray-400 shrink-0" size={16} />
        )}
        <span>{label}</span>
        {required && <span className="text-red-500 text-xs">*</span>}
      </div>
    </label>
    <div className="relative group">
      <input
        type={type}
        className="global_input py-2 text-black dark:text-white"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
      {helper && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
          <FaInfoCircle size={16} />
        </div>
      )}
    </div>
  </div>
);

const CreateService = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [customers, setCustomers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [selectedAccounts, setSelectedAccounts] = useState([]);

  const [serviceName, setServiceName] = useState("");
  const [cost, setCost] = useState(0);
  const [note, setNote] = useState("");
  const [problem, setProblem] = useState("");
  const [serial, setSerial] = useState("");
  const [password, setPassword] = useState("");
  const [condition, setCondition] = useState("");
  const [tNote, setTNote] = useState("");
  const [status, setStatus] = useState("Pending");
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [existingPaid, setExistingPaid] = useState(0);

  // Modal state
  const [customerModal, setCustomerModal] = useState(false);

  // Loading states
  const [customerLoading, setCustomerLoading] = useState(false);
  const [searchCustomerKeyword, setSearchCustomerKeyword] = useState("");

  const navigate = useNavigate();

  // 🔥 Fetch Customers (fixed 20 results; no pagination)
  const fetchCustomers = async (searchTerm = "") => {
    setCustomerLoading(true);

    try {
      const searchKeyword =
        searchTerm && searchTerm.trim() !== ""
          ? encodeURIComponent(searchTerm.trim())
          : "0";

      const res = await api.get(`/CustomersList/1/20/${searchKeyword}`);

      if (res.data.status === "Success") {
        const formattedCustomers = res.data.data.map((customer) => ({
          value: customer._id,
          label: `${customer.name || "Unknown"} ${customer.address ? `(${customer.address})` : ""} ${customer.mobile ? `(${customer.mobile})` : ""} (${customer.balance || 0})`,
          shortLabel: `${customer.name || "Unknown"} (${customer.mobile || "No Phone"})`,
          balance: customer.balance || 0,
          ...customer,
        }));

        setCustomers(formattedCustomers);
      } else {
        ErrorToast(res.data.message || "Failed to fetch customers");
      }
    } catch (error) {
      console.error("Customer fetch error:", error);
      ErrorToast(error.response?.data?.message || "Failed to load customers");
    } finally {
      setCustomerLoading(false);
    }
  };

  // Debounced search
  const debouncedCustomerSearch = useCallback(
    debounce((value) => {
      fetchCustomers(value);
    }, 500),
    []
  );

  const selectStyles = useMemo(() => getReactSelectStyles(), []);

  // Handle customer search input
  const handleCustomerSearch = (inputValue) => {
    setSearchCustomerKeyword(inputValue);
    debouncedCustomerSearch(inputValue);
  };

  // 🔥 Fetch Technicians
  const fetchTechnicians = async () => {
    try {
      const res = await api.get(`/UserList`);
      if (res.data.status === "Success") {
        setTechnicians(
          res.data.data.map((u) => ({
            value: u._id,
            label: u.name,
            ...u,
          }))
        );
      }
    } catch (error) {
      console.error("Tenavigatechnician fetch error:", error);
    }
  };

  // 🔥 Fetch Accounts
  const fetchAccounts = async () => {
    try {
      const res = await api.get(`/AllAccount`);
      if (res.data.status === "Success") {
        const formatted = res.data.data.map((a) => ({
          value: a._id,
          label: a.name,
          amount: 0,
          ...a,
        }));

        const defaultAccount = formatted.find((a) => a.default === 1);
        if (defaultAccount) {
          setSelectedAccounts([{ ...defaultAccount, amount: 0 }]);
          setAccounts(formatted.filter((a) => a.value !== defaultAccount.value));
        } else {
          setAccounts(formatted);
        }
      }
    } catch (error) {
      console.error("Account fetch error:", error);
      ErrorToast("Failed to load accounts");
    }
  };

  useEffect(() => {
    fetchCustomers("");
    fetchTechnicians();
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (!isEditMode || !id) return;

    const fetchServiceForEdit = async () => {
      try {
        const res = await api.get(`/ServicDetails/${id}`);
        const data = res?.data?.data;

        if (!data) {
          ErrorToast("Failed to load service data");
          return;
        }

        const customer = data.Customer
          ? {
              value: data.Customer._id,
              label: `${data.Customer.name || "Unknown"} ${
                data.Customer.address ? `(${data.Customer.address})` : ""
              } ${data.Customer.mobile ? `(${data.Customer.mobile})` : ""} (${data.Customer.balance || 0})`,
              shortLabel: `${data.Customer.name || "Unknown"} (${data.Customer.mobile || "No Phone"})`,
              balance: data.Customer.balance || 0,
              ...data.Customer,
            }
          : null;

        setSelectedCustomer(customer);
        setSelectedTechnician(null);
        setServiceName(data.Name || "");
        setCost(Number(data.Cost) || 0);
        setNote(data.note || "");
        setProblem(data.Problem || "");
        setSerial(data.Serial || "");
        setPassword(data.Password || "");
        setCondition(data.Condition || "");
        setTNote(data.TNote || "");
        setStatus(data.Status || "Pending");
        setDeliveryDate(data.DeliveryDate ? new Date(data.DeliveryDate) : new Date());
        setExistingPaid(Number(data.Paid) || 0);
      } catch (error) {
        console.error("Service fetch error:", error);
        ErrorToast("Failed to load service data");
      }
    };

    fetchServiceForEdit();
  }, [id, isEditMode]);

  // ✅ Paid & Due calculate
  const paidAmount = useMemo(
    () =>
      isEditMode
        ? existingPaid
        : selectedAccounts.reduce((acc, a) => acc + (a.amount || 0), 0),
    [existingPaid, isEditMode, selectedAccounts]
  );
  const dueAmount = useMemo(() => cost - paidAmount, [cost, paidAmount]);

  // Account handlers
  const selectAccount = (acc) => {
    if (!acc) return;
    setSelectedAccounts((prev) => [...prev, { ...acc, amount: 0 }]);
    setAccounts((prev) => prev.filter((a) => a.value !== acc.value));
  };

  const removeAccount = (acc) => {
    setSelectedAccounts((prev) => prev.filter((a) => a.value !== acc.value));
    setAccounts((prev) => [...prev, acc]);
  };

  const handleAmountChange = (id, value) => {
    const amount = value === "" ? 0 : Number(value);
    setSelectedAccounts((prev) =>
      prev.map((a) => (a.value === id ? { ...a, amount } : a))
    );
  };

  // Handle customer change
  const handleCustomerChange = (customer) => {
    setSelectedCustomer(customer);
    if (customer) {
      setSelectedAccounts((prev) => prev.map((a) => ({ ...a, amount: 0 })));
    }
  };

  // Handle new customer created from modal
  const handleNewCustomerCreated = (newCustomer) => {
    fetchCustomers("");
    setSelectedCustomer({
      value: newCustomer._id,
      label: `${newCustomer.name} (${newCustomer.mobile})`,
      balance: newCustomer.balance || 0,
      ...newCustomer,
    });
  };

  // 🚀 Submit
  const handleSubmit = async () => {
    if (!selectedCustomer) return ErrorToast("Select Customer");
    if (!serviceName) return ErrorToast("Service Name required");
    if (cost <= 0) return ErrorToast("Invalid Cost");
    if (paidAmount > cost) return ErrorToast("Paid cannot be greater than Cost");

    const payload = {
      Service: {
        contactID: selectedCustomer.value,
        technicianID: selectedTechnician?.value || null,
        Name: serviceName,
        Cost: cost,
        Paid: paidAmount,
        Due: dueAmount,
        Status: status,
        Serial: serial || "",
        Password: password || "",
        Problem: problem || "",
        Condition: condition || "",
        TNote: tNote || "",
        note: note || "",
        DeliveryDate: deliveryDate.toISOString(),
      },
      payment: selectedAccounts.map((a) => ({
        accountID: a.value,
        accountName: a.label,
        amount: a.amount,
      })),
    };

    try {
      const res = isEditMode
        ? await api.post(`/EditService/${id}`, { Service: payload.Service })
        : await api.post(`/AddService`, payload);

      if (res.data.status === "Success") {
        SuccessToast(
          isEditMode
            ? "Service Updated Successfully!"
            : "Service Created Successfully!",
        );

        if (isEditMode) {
          navigate(`/ServiceDetails/${id}`);
        } else {
          // Reset form
          setSelectedCustomer(null);
          setSelectedTechnician(null);
          setServiceName("");
          setCost(0);
          setNote("");
          setProblem("");
          setSerial("");
          setPassword("");
          setCondition("");
          setTNote("");
          setStatus("Pending");
          setDeliveryDate(new Date());
          setSelectedAccounts([]);

          fetchCustomers("");
          navigate(`/ServiceDetails/${res.data.ServiceID}`);
        }
      } else {
        ErrorToast(res.data.message);
      }
    } catch (err) {
      console.error(err);
      ErrorToast("Something went wrong");
    }
  };

  return (
    <div className="global_container">
      <div className="mb-4">
        <h2 className="global_heading flex items-center gap-2">
          <FaTools className="text-gray-600 dark:text-gray-400 shrink-0" />
          {isEditMode ? "Update Service" : "Create New Service"}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isEditMode
            ? "Update the service information."
            : "Fill in the details to create a new service request."}
        </p>
      </div>

      <div className="global_sub_container">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white flex items-center gap-2">
          <FaUser className="text-gray-500 dark:text-gray-400 shrink-0" />
          Customer & technician
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-zinc-300">
              <span className="inline-flex items-center gap-2">
                <FaSearch className="text-gray-500 dark:text-gray-400" size={14} />
                Select customer <span className="text-red-500">*</span>
              </span>
            </label>
            <div className="flex items-end gap-2">
              <div className="flex-1 min-w-0">
                <Select
                  options={customers}
                  value={
                    customers.find((c) => c.value === selectedCustomer?.value) ||
                    null
                  }
                  onChange={handleCustomerChange}
                  onInputChange={handleCustomerSearch}
                  isLoading={customerLoading}
                  placeholder="Search by name, phone, or address..."
                  isClearable
                  classNamePrefix="react-select"
                  filterOption={() => true}
                  getOptionValue={(option) => option.value}
                  getOptionLabel={(option) => option.label}
                  styles={selectStyles}
                  menuPortalTarget={document.body}
                />
              </div>
              <button
                type="button"
                onClick={() => setCustomerModal(true)}
                className="global_button shrink-0 py-2 px-2 flex items-center gap-1"
              >
                <FaUserPlus size={16} />
                <span className="hidden md:inline">New</span>
              </button>
            </div>

            {selectedCustomer && (
              <div className="mt-3 rounded-2xl border border-gray-200 dark:border-gray-600 p-3 bg-white/40 dark:bg-gray-800/40 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                      {selectedCustomer.name?.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {selectedCustomer.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(null)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                    title="Clear customer"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-600 px-3 py-2 bg-white/30 dark:bg-gray-900/30">
                    <FaPhone className="text-gray-500 shrink-0" size={12} />
                    <span className="text-gray-800 dark:text-gray-200 truncate">
                      {selectedCustomer?.mobile || "N/A"}
                    </span>
                  </div>

                  <div
                    className={`flex items-center gap-2 p-2 rounded-2xl border text-sm ${
                      (selectedCustomer?.balance || 0) > 0
                        ? "border-red-200 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                        : (selectedCustomer?.balance || 0) < 0
                          ? "border-red-200 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                          : "border-green-200 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                    }`}
                  >
                    <FaWallet className="shrink-0" size={12} />
                    {(() => {
                      const balance = selectedCustomer?.balance || 0;
                      return (
                        <span className="font-medium">
                          {balance < 0
                            ? "Receivable"
                            : balance > 0
                              ? "Payable"
                              : "Settled"}
                          : ৳{Math.abs(balance)}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="col-span-2 flex items-start gap-2 rounded-2xl border border-gray-200 dark:border-gray-600 px-3 py-2 bg-white/30 dark:bg-gray-900/30">
                    <FaMapMarkerAlt className="text-gray-500 shrink-0 mt-0.5" size={12} />
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {selectedCustomer?.address || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            {/* <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-zinc-300">
              <span className="inline-flex items-center gap-2">
                <FaTools className="text-gray-500 dark:text-gray-400" size={14} />
                Assign technician
              </span>
            </label>
            <Select
              options={technicians}
              value={selectedTechnician}
              onChange={setSelectedTechnician}
              placeholder="Select technician..."
              classNamePrefix="react-select"
              isClearable
              styles={selectStyles}
              menuPortalTarget={document.body}
              formatOptionLabel={(option) => (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-800 dark:text-white text-sm font-bold">
                    {option.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {option.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Technician
                    </div>
                  </div>
                </div>
              )}
            /> */}

            {selectedTechnician && (
              <div className="mt-3 rounded-2xl border border-gray-200 dark:border-gray-600 p-3 bg-white/40 dark:bg-gray-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-900 dark:text-white font-bold">
                    {selectedTechnician.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {selectedTechnician.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Assigned technician
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="global_sub_container mt-4 p-2 lg:p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white flex items-center gap-2 flex-wrap">
          <FaTools className="text-gray-500 dark:text-gray-400 shrink-0" />
          Service details
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            (required fields marked *)
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Service Name - 2 columns */}
              <div className="lg:col-span-2">
                <InputField
                  icon={FaTools}
                  label="Service Name / Device Name"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g., Screen Replacement, Battery Change"
                  required
                  helper="Enter the type of service"
                />
              </div>

              {/* Cost - 1 column */}
              <div className="lg:col-span-1">
                <InputField
                  icon={TbCurrencyTaka}
                  label="Estimated Service Cost"
                  type="number"
                  value={cost}
              
                  onChange={(e) => {
                    const value = e.target.value;
                    setCost(value === "" ? "" : parseInt(value, 10));
                  }}
                  placeholder=""
                  helper="Total service charge"
                />
              </div>

              <InputField
                icon={FaBarcode}
                label="Serial Number / IMEI Number"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                placeholder="Device serial number (optional)"
                helper="If applicable"
              />

              <InputField
                icon={FaExclamationTriangle}
                label="Problem Description"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Describe the issue briefly"
                helper="Customer's complaint"
              />

          {/* Date Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              <span className="inline-flex items-center gap-2">
                <FaCalendarAlt className="text-gray-500 dark:text-gray-400" size={16} />
                Estimated delivery date
              </span>
            </label>
            <div className="relative w-full">
              <DatePicker
                selected={deliveryDate}
                onChange={(date) => setDeliveryDate(date)}
                className="global_input w-full py-2"
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
                popperPlacement="bottom-start"
                popperClassName="z-[9999]"
                popperContainer={(props) =>
                  createPortal(<div {...props} />, document.body)
                }
              />
            </div>
          </div>

          {/* Status Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              <span className="inline-flex items-center gap-2">
                <FaClock className="text-gray-500 dark:text-gray-400" size={16} />
                Service status
              </span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="global_dropdown cursor-pointer"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

              <InputField
                icon={FaLock}
                label="Device Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="If device has password"
                helper="For testing purposes"
              />

              <InputField
                icon={HiOutlineChip}
                label="Device Condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="e.g., Good, Scratched, Broken"
                helper="Physical condition"
              />

              <InputField
                icon={FaTools}
                label="Technician Notes"
                value={tNote}
                onChange={(e) => setTNote(e.target.value)}
                placeholder="Internal notes for technician"
                helper="Private notes"
              />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
            <span className="inline-flex items-center gap-2">
              <FaStickyNote className="text-gray-500 dark:text-gray-400" size={16} />
              Additional notes
            </span>
          </label>
          <textarea
            className="global_input min-h-[120px] py-2 w-full text-black dark:text-white resize-y"
            rows={4}
            placeholder="Add any additional information about the service request..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>

      {!isEditMode && (
        <div className="global_sub_container mt-4 p-2 lg:p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white flex items-center gap-2">
          <MdOutlinePayment className="text-gray-500 dark:text-gray-400 shrink-0" />
          Payment details
        </h3>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-600 p-4 mb-4 bg-white/30 dark:bg-gray-900/20">
          {selectedAccounts.length > 0 && (
            <div className="space-y-3 mb-4">
              <h4 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-sm">
                <FaCreditCard className="text-green-600 dark:text-green-400 shrink-0" />
                Selected payment methods
              </h4>
              {selectedAccounts.map((a, i) => (
                <div
                  key={i}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-600 px-3 py-3 bg-white/30 dark:bg-gray-900/30"
                >
                  <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-800 dark:text-white font-bold text-sm shrink-0">
                    {a.label?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium min-w-[120px] text-gray-800 dark:text-gray-200">
                    {a.label}
                  </span>
                  <div className="flex-1 min-w-[140px] relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                      ৳
                    </span>
                    <input
                      type="number"
                      value={a.amount || ""}
                      onChange={(e) =>
                        handleAmountChange(a.value, e.target.value)
                      }
                      className="global_input pl-8 py-2 w-full text-black dark:text-white"
                      placeholder="Amount"
                      min="0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAccount(a)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                  >
                    <MdDelete size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative">
            <Select
              options={accounts}
              onChange={selectAccount}
              placeholder="Add payment method..."
              classNamePrefix="react-select"
              className="mb-1"
              value={null}
              isClearable
              styles={selectStyles}
              menuPortalTarget={document.body}
              formatOptionLabel={(option) => (
                <div className="flex items-center gap-3 py-1">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-800 dark:text-white text-sm">
                    {option.label?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </span>
                </div>
              )}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Select a payment method and enter the amount above.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-600 border-l-4 border-l-blue-500 p-4 bg-white/40 dark:bg-gray-800/40 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Total cost
              </p>
              <FaDollarSign className="text-gray-400" size={18} />
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              ৳{Number(cost) || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Service charge
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-600 border-l-4 border-l-green-500 p-4 bg-white/40 dark:bg-gray-800/40 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Paid amount
              </p>
              <FaCheckCircle className="text-green-600 dark:text-green-400" size={18} />
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              ৳{paidAmount.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Total paid
            </p>
          </div>

          <div
            className={`rounded-2xl border border-gray-200 dark:border-gray-600 p-4 shadow-sm border-l-4 ${
              dueAmount > 0
                ? "border-l-orange-500 bg-orange-50/80 dark:bg-orange-950/30"
                : "border-l-green-500 bg-green-50/50 dark:bg-green-950/20"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Due amount
              </p>
              {dueAmount > 0 ? (
                <MdWarning className="text-orange-600 dark:text-orange-400" size={18} />
              ) : (
                <FaCheckCircle className="text-green-600 dark:text-green-400" size={18} />
              )}
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              ৳{dueAmount.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {dueAmount > 0 ? "Pending payment" : "Fully paid"}
            </p>
          </div>
        </div>
        </div>
      )}

      <div className="mt-6 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          className="global_button w-full lg:w-fit flex items-center justify-center gap-2 py-2 px-6"
        >
          <FaSave size={18} />
          {isEditMode ? "Update service request" : "Create service request"}
        </button>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {isEditMode
            ? "By updating this service, you confirm that the information is accurate."
            : "By creating this service, you confirm that the information is accurate."}
        </p>
      </div>

      <CreateCustomerModalImmediate
        open={customerModal}
        setOpen={setCustomerModal}
        setSelectedCustomer={handleNewCustomerCreated}
      />
    </div>
  );
};

export default CreateService;