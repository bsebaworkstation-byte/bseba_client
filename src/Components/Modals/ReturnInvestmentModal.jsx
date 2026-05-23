import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import api from "../../Helper/axios_resonse_interceptor";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import loadingStore from "../../Zustand/LoadingStore";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";

const ReturnInvestmentModal = ({ open, onClose, investor, onSuccess }) => {
  const { setGlobalLoader } = loadingStore();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const formTrans = useTextTranslate(GlobalFormTranslator);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const heading = useTextTranslate(HeadingTranslate);
  const selectStyles = useMemo(() => getReactSelectStyles(), []);

  useEffect(() => {
    if (!open || !investor?._id) return;

    setSelectedAccount(null);
    setAmount("");
    setNote("");

    let cancelled = false;
    const loadAccounts = async () => {
      try {
        const res = await api.get("/AllAccount");
        if (cancelled) return;
        if (res.data.status === "Success") {
          const formatted = (res.data.data || []).map((a) => ({
            value: a._id,
            label: a.name,
            ...a,
          }));
          setAccounts(formatted);
          const defaultAccount = formatted.find((a) => a.default === 1);
          if (defaultAccount) setSelectedAccount(defaultAccount);
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
  }, [open, investor?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!investor?._id) return;

    if (!selectedAccount?.value) {
      ErrorToast("Please select an account");
      return;
    }

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      ErrorToast("Enter a valid amount greater than zero");
      return;
    }

    setGlobalLoader(true);
    try {
      const res = await api.post("/ReturnInvestment", {
        investorID: investor._id,
        accountID: selectedAccount.value,
        amount: parsedAmount,
        note: note.trim(),
      });

      if (res.data.status === "success") {
        SuccessToast(res.data.message || "Investment returned successfully");
        onSuccess?.();
        onClose();
      } else {
        ErrorToast(res.data.message || "Failed to return investment");
      }
    } catch (err) {
      ErrorToast(
        err.response?.data?.message || "Failed to return investment",
      );
    } finally {
      setGlobalLoader(false);
    }
  };

  if (!open || !investor) return null;

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center overflow-y-auto py-8 px-3"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="return-investment-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-white text-gray-900 dark:bg-[#1E2939] dark:text-white p-6 rounded-2xl w-full max-w-lg shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <h2
          id="return-investment-title"
          className="text-lg font-semibold mb-1"
        >
          {heading("returnInvestment")}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          <span className="font-medium">{investor.name}</span>
          {investor.mobile ? ` · ${investor.mobile}` : ""}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {formTrans("account")} <span className="text-red-500">*</span>
            </label>
            <Select
              options={accounts}
              value={selectedAccount}
              onChange={setSelectedAccount}
              styles={selectStyles}
              placeholder="Select account"
              isSearchable
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {formTrans("amount")} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="global_input"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {formTrans("note")}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="global_input min-h-[80px]"
              placeholder={formTrans("note")}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="global_button flex-1">
              {btn("add")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="global_edit flex-1"
            >
              {btn("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnInvestmentModal;
