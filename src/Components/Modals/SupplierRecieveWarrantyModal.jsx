import { useEffect, useState } from "react";
import { ErrorToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import Select from "react-select";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import { IoMdCloseCircle } from "react-icons/io";

const SupplierRecieveWarrantyModal = ({ open, setOpen, id, reload }) => {
  const { setGlobalLoader } = loadingStore();
  const [note, setNote] = useState("");
  const [createdDate, setCreatedDate] = useState(new Date());

  useEffect(() => {
    (async () => {
      if (open) {
        document.body.classList.add("overflow-hidden");
      } else {
        document.body.classList.remove("overflow-hidden");
      }
    })();
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      Note: note,
      SupplierReceivedDate: createdDate,
      ID: id,
    };

    try {
      setGlobalLoader(true);
      const res = await api.post(`/SupplierReceivedWarranty`, payload);

      if (res.data.status === "Success") {
        toast.success(res.data.message);
        reload();
        setOpen(false);
      } else {
        ErrorToast(res.data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");

      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  if (!open) return null;
  return (
    <div
      onClick={() => {
        setOpen(false);
      }}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center overflow-y-auto pt-10 px-3"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white text-black dark:text-white dark:bg-[#1E2939] p-6 rounded-lg w-full sm:w-[90%] max-w-2xl max-h-[90vh] min-h-[70vh] overflow-y-auto shadow-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <button className="global_button_red" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-3"
        >
          <div className="col-span-1 flex items-center">
            {/* Date */}
            <div className="">
              <label className="block text-sm font-medium mt-1 mb-1">
                Select Date
              </label>
              <div className="relative w-full">
                {/* <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendarAlt />
                      </div> */}
                <DatePicker
                  selected={createdDate}
                  onChange={(date) => setCreatedDate(date)}
                  dateFormat="dd-MM-yyyy"
                  className="global_input w-full"
                  popperPlacement="bottom-start"
                  popperClassName="z-[9999]"
                  calendarClassName="react-datepicker-custom"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 col-span-2">
            <label className="block mb-2 font-medium">Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="global_input min-h-[150px] w-full"
            />
          </div>

          <button type="submit" className="global_button col-span-2 w-full">
            Supplier Received
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupplierRecieveWarrantyModal;
