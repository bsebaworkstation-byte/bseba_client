import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { MdDelete } from "react-icons/md";
import api from "../../Helper/axios_resonse_interceptor";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import loadingStore from "../../Zustand/LoadingStore";

const RefundServicePaymentModal = ({
  open,
  onClose,
  service,
  onSuccess,
}) => {
  const { setGlobalLoader } = loadingStore();
  const [accountsPool, setAccountsPool] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);

  const selectStyles = useMemo(() => getReactSelectStyles(), []);

  useEffect(() => {
    if (!open || !service?._id) return;

    let cancelled = false;
    const loadAccounts = async () => {
      try {
        const res = await api.get(`/AllAccount`);
        if (cancelled) return;
        if (res.data.status === "Success") {
          const formatted = res.data.data.map((a) => ({
            value: a._id,
            label: a.name,
            ...a,
          }));
          setAccountsPool(formatted);
          setSelectedAccounts([]);
        } else {
          ErrorToast(res.data.message || "Failed to load accounts");
        }
      } catch {
        if (!cancelled) ErrorToast("Failed to load accounts");
      }
    };

    loadAccounts();
    return () => {
      cancelled = true;
    };
  }, [open, service?._id]);

  const paidTotal = useMemo(
    () =>
      selectedAccounts.reduce((sum, a) => sum + (Number(a.amount) || 0), 0),
    [selectedAccounts],
  );

  const dueAmount = service?.Due != null ? Number(service.Due) : 0;

  const pickAccount = (opt) => {
    if (!opt) return;
    if (selectedAccounts.some((a) => a.value === opt.value)) return;
    setSelectedAccounts((prev) => [...prev, { ...opt, amount: 0 }]);
    setAccountsPool((prev) => prev.filter((a) => a.value !== opt.value));
  };

  const removeAccount = (acc) => {
    setSelectedAccounts((prev) => prev.filter((a) => a.value !== acc.value));
    setAccountsPool((prev) => [...prev, acc]);
  };

  const handleAmountChange = (id, value) => {
    const amount = value === "" ? 0 : Number(value);
    setSelectedAccounts((prev) =>
      prev.map((a) => (a.value === id ? { ...a, amount } : a)),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!service?._id) return;

    const payment = selectedAccounts
      .filter((a) => (Number(a.amount) || 0) > 0)
      .map((a) => ({
        accountID: a.value,
        accountName: a.label,
        amount: Number(a.amount),
      }));

    if (payment.length === 0) {
      return ErrorToast("Enter at least one payment with an amount greater than zero");
    }

    if (dueAmount > 0 && paidTotal > dueAmount + 0.01) {
      return ErrorToast("Total payment cannot exceed the due amount");
    }

    setGlobalLoader(true);
    
    try {
      const res = await api.post(`/ServicePaymentRefund`, {
        serviceID: service._id,
        payment,
      });

      if (res.data.status === "Success") {
        SuccessToast(res.data.message || "Payment refunded successfully");
        onSuccess?.(res.data);
        onClose();
        
      } else {
        ErrorToast(res.data.message || "Failed to refund payment");
        
      }
    } catch (err) {
      console.error(err);
      ErrorToast(err.response?.data?.message || "Failed to refund payment");
    } finally {
      setGlobalLoader(false);
    }
  };

  if (!open || !service) return null;

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center overflow-y-auto py-8 px-3"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-service-payment-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-white text-gray-900 dark:bg-[#1E2939] dark:text-white p-6 rounded-2xl w-full max-w-lg shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <h2
          id="add-service-payment-title"
          className="text-lg font-semibold mb-1"
        >
          Refund payment
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          <span className="font-medium">{service.Name || "Service"}</span>
          {" · "}
          Cost ৳{service.Cost ?? 0} · Paid ৳{service.Paid ?? 0} · Due{" "}
          <span
            className={
              dueAmount > 0 ? "text-red-600 dark:text-red-400 font-medium" : ""
            }
          >
            ৳{dueAmount}
          </span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {selectedAccounts.length > 0 && (
            <div className="space-y-3">
              {selectedAccounts.map((a) => (
                <div
                  key={a.value}
                  className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-600 px-3 py-2 bg-white/50 dark:bg-gray-800/40"
                >
                  <span className="font-medium text-sm min-w-[100px] flex-1">
                    {a.label}
                  </span>
                  <div className="flex-1 min-w-[120px] relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      ৳
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={a.amount === 0 || a.amount === "" ? "" : a.amount}
                      onChange={(e) =>
                        handleAmountChange(a.value, e.target.value)
                      }
                      className="global_input pl-8 py-2 w-full text-black dark:text-white"
                      placeholder="Amount"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAccount(a)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                    aria-label="Remove account"
                  >
                    <MdDelete size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-zinc-300">
              Add account
            </label>
            <Select
              options={accountsPool}
              onChange={pickAccount}
              placeholder="Choose payment account..."
              value={null}
              isClearable
              classNamePrefix="react-select"
              styles={selectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </div>

          <div className="flex justify-between text-sm border-t border-gray-200 dark:border-gray-600 pt-3">
            <span className="text-gray-600 dark:text-gray-400">This payment</span>
            <span className="font-semibold">৳{paidTotal.toFixed(2)}</span>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              className="global_button_red flex-1"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="global_button flex-1">
              Submit refund
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RefundServicePaymentModal;