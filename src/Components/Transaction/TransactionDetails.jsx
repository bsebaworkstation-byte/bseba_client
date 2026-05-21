import { useEffect, useState } from "react";
import { IoMdCall } from "react-icons/io";
import { MdAlternateEmail } from "react-icons/md";
import { useParams, useNavigate } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import openCloseStore from "../../Zustand/OpenCloseStore";
import EditTransactionModal from "../Modals/EditTransactionModal";

import api from "../../Helper/axios_resonse_interceptor";
import { getBusinessDetails } from "../../Helper/SessionHelper";
import { formatDate } from "../../Helper/utils";
import { numberToWords } from "../../Helper/UI/NumberToWord";

function TransactionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setGlobalLoader } = loadingStore();
  const [TDdata, setTData] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAmountInput, setDeleteAmountInput] = useState("");
  const { setEditTransactionModal } = openCloseStore();
  const businessDetails = getBusinessDetails();
  //   for modal
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [printWithClosingBalance, setPrintWithClosingBalance] = useState(true);
  const handleEditClick = (transaction) => {
    setSelectedTransaction(transaction); // pass data to modal
    setEditTransactionModal(true);
  };

  const fetchTransactionDetails = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/ViewTransactionById/${id}`);
      if (res.data.status === "Success") {
        setTData(res.data.data || {});
      } else {
        toast.error("Failed to fetch transaction details!");
      }
    } catch (error) {
      toast.error("Something went wrong!");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchTransactionDetails();
  }, [id]);

  const amount = TDdata?.Credit > 0 ? TDdata?.Credit : TDdata?.Debit || 0;

  const openDeleteModal = () => {
    setDeleteAmountInput("");
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteAmountInput("");
  };

  const handleDeleteTransaction = async () => {
    const expected = Number(amount);
    const entered = parseFloat(String(deleteAmountInput).trim());
    if (!Number.isFinite(entered) || Math.abs(expected - entered) > 0.009) {
      toast.error("Enter the exact transaction amount shown below to confirm deletion.");
      return;
    }

    setGlobalLoader(true);
    try {
      const res = await api.get(`/DeleteTransaction/${id}`);
      if (res.data.status === "Success") {
        toast.success("Transaction deleted successfully");
        closeDeleteModal();
        navigate(`/Customer`);
      }
    } catch (error) {
      toast.error("Something went wrong!");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  return (
    <div className="global_container">
      {/* Header - Logo, MoneyReciept, Company Details */}
      <div className="flex justify-between px-2">
        {/* business name and logo */}
        <div className="flex gap-1 items-center">
          {businessDetails.logo ? (
            <img
              src={businessDetails?.logo}
              alt={businessDetails?.businessName + businessDetails?.email}
              className="w-[56px] rounded-md"
            />
          ) : (
            ""
          )}
          <div>
            {" "}
            <h1 className="font-bold text-lg">
              {businessDetails?.businessName}
            </h1>
            <p className="text-sm">{businessDetails?.address}</p>
          </div>
        </div>
        {/* Money Reicept */}
        <div className="flex flex-col gap-1 items-center">
          <h1 className="text-3xl font-semibold">
            {TDdata?.Credit > 0 ? "Payment Detials" : "Money Reciept"}
          </h1>
          <h1 className="text-xs flex gap-2 items-center">
            <span className="flex items-center">
              {businessDetails?.contactNumber}
            </span>
            <span className="flex items-center"> {businessDetails?.email}</span>
          </h1>
        </div>
        {/* No and Date */}
        <div className="font-bold px-2 text-end">
          {/* No */}

          <h1 className="text-lg">No : {TDdata?.No}</h1>

          {/* Date */}

          <h1 className="">Date : {formatDate(TDdata?.CreatedDate)}</h1>
        </div>
        {/* Comapny Name and Address */}
      </div>

      {/* yellow collor border */}
      <h1 className="h-1 w-full mt-2 bg-[#F8951E]"></h1>
      {/* Form */}
      <div className="flex">
        {" "}
        <div className="space-y-2 p-2 w-5/7">
          {/* Thanks section */}

          <h1 className="text-lg">
            {TDdata?.Debit > 0 ? "Recieve With Thanks from" : "Paid To"} :{" "}
            <span className="font-bold px-2 break-words">
              {TDdata?.contactDetails?.name},
            </span>
            {TDdata?.contactDetails?.address} , {TDdata?.contactDetails?.mobile}
          </h1>
          {/* Amount */}
          <h1>
            <span className="font-bold">Amount : </span>
            <span className="font-bold">
              {TDdata?.Credit > 0 ? TDdata?.Credit : TDdata?.Debit}
            </span>
            {/* Account Payments */}
            {TDdata?.accountpayments?.map((a) => (
              <span key={a._id} className="ml-2">
                ({a.accountName}: {a.Credit > 0 ? a.Credit : a.Debit})
              </span>
            ))}
          </h1>

          <h1 className="">
            {" "}
            <span className="font-bold">In Word : </span>
            <span className="font-bold">{numberToWords(amount)}</span>{" "}
          </h1>
          {!!TDdata?.note && (
            <h1 className="">
              {" "}
              <span className="font-bold">Note : </span>
              <span className="font-bold">{TDdata?.note}</span>{" "}
            </h1>
          )}
        </div>
        <div className="w-2/7 flex flex-col items-end gap-2 py-1">
          {" "}
          <h1
            id={printWithClosingBalance ? "" : "no-print"}
            className="flex flex-col border border-gray-400 p-1 font-bold rounded-md"
          >
            <span className="text-center"> Current Balance </span>
            <span>
              {" "}
              {TDdata?.currentBalance < 0 ? "Recievable" : "Payable"} :{" "}
              {Math.abs(TDdata?.currentBalance).toFixed(2)}
            </span>
          </h1>
          <h1
            id={printWithClosingBalance ? "" : "no-print"}
            className="flex flex-col border border-gray-400 p-1 font-bold rounded-md"
          >
            <span className="text-center"> Closing Balance </span>
            <span>
              {" "}
              {TDdata?.closingBalance < 0 ? "Recievable" : "Payable"} :{" "}
              {Math.abs(TDdata?.closingBalance).toFixed(2)}
            </span>
          </h1>
        </div>
      </div>

      <div className="flex justify-between mt-16">
        <div className="flex gap-16">
          <h1 className="border-t">Authorization Signature</h1>
          <h1 className="border-t">Customer Signature</h1>
        </div>
      </div>
      {/* business Footer */}
      {getBusinessDetails()?.invoiceFooter && (
        <p className="text-center text-sm">
          {getBusinessDetails()?.invoiceFooter}
        </p>
      )}
      <p className="text-center text-sm border-t border-gray-400 mt-3">
        <span className="text-gray-500">Software Developed by</span>{" "}
        <span className="font-semibold">Bseba.com</span>
      </p>

      <div id="no-print" className="flex gap-5 my-4 justify-between">
        {/* Left Side */}
        <div className="flex gap-2">
                 <button
          onClick={() => {
            setPrintWithClosingBalance(true);
            // 500ms delay before print
            setTimeout(() => {
              window.print();
            }, 500);
          }}
          className="global_button w-full md:w-auto"
        >
          Print With Closing Balance
        </button>

        <button
          onClick={() => {
            setPrintWithClosingBalance(false);
            // 500ms delay before print
            setTimeout(() => {
              window.print();
            }, 500);
          }}
          className="global_button w-full md:w-auto"
        >
          Print Without Closing Balance
        </button>
        </div>
        {/* Right Side */}
        <div>
          <button
            type="button"
            className="global_button_red w-full md:w-auto"
            onClick={openDeleteModal}
          >
            Delete Transaction
          </button>
        </div>
      </div>

      <EditTransactionModal
        transactionData={selectedTransaction}
        refreshParent={fetchTransactionDetails}
      />

      {showDeleteModal && (
        <div
          role="presentation"
          onClick={closeDeleteModal}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center overflow-y-auto py-8 px-3"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-transaction-title"
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-gray-900 dark:bg-[#1E2939] dark:text-white p-6 rounded-2xl w-full max-w-lg shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h2
              id="delete-transaction-title"
              className="text-lg font-semibold mb-1 text-red-600 dark:text-red-400"
            >
              Delete this transaction?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              This action cannot be undone. To confirm, type the transaction amount
              exactly as shown below.
            </p>
            <p className="text-sm font-semibold mb-3">
              Amount on this receipt:{" "}
              <span className="tabular-nums">{Number(amount).toFixed(2)}</span>
            </p>
            <label className="block text-sm font-medium mb-1" htmlFor="delete-confirm-amount">
              Type amount to confirm
            </label>
            <input
              id="delete-confirm-amount"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={deleteAmountInput}
              onChange={(e) => setDeleteAmountInput(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 mb-4 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white"
              placeholder="0.00"
            />
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                className="global_button flex-1"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="global_button_red flex-1"
                onClick={handleDeleteTransaction}
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default TransactionDetails;
