import React from "react";
import api from "../../Helper/axios_resonse_interceptor";

export default function ExpenseReport() {
  // 🔹 Format date safely (DD-MM-YYYY)
  const formatDisplayDate = (date) => {
    try {
      return format(new Date(date), "dd-MM-yyyy");
    } catch {
      return date;
    }
  };

  //  Group expenses by type
  const getExpenseSummaryByType = (expenses) => {
    const summary = {};
    expenses.forEach((item) => {
      const type = item.typeName || "Unknown";
      const amount = parseFloat(item.amount) || 0;
      if (!summary[type]) summary[type] = 0;
      summary[type] += amount;
    });
    return Object.entries(summary).map(([type, total]) => ({
      type,
      total,
    }));
  };

  //  Period change handler
  const handlePeriodChange = (selected) => {
    setSelectedPeriod(selected);
    const today = new Date();
    let newStart, newEnd;

    switch (selected.value) {
      case "thisWeek":
        newStart = startOfWeek(today, { weekStartsOn: 0 });
        newEnd = endOfWeek(today, { weekStartsOn: 0 });
        break;
      case "lastWeek":
        newStart = startOfWeek(subWeeks(today, 1), { weekStartsOn: 0 });
        newEnd = endOfWeek(subWeeks(today, 1), { weekStartsOn: 0 });
        break;
      case "thisMonth":
        newStart = startOfMonth(today);
        newEnd = endOfMonth(today);
        break;
      case "lastMonth":
        newStart = startOfMonth(subMonths(today, 1));
        newEnd = endOfMonth(subMonths(today, 1));
        break;
      case "thisYear":
        newStart = startOfYear(today);
        newEnd = endOfYear(today);
        break;
      case "lastYear":
        newStart = startOfYear(subYears(today, 1));
        newEnd = endOfYear(subYears(today, 1));
        break;
      default:
        newStart = startDate;
        newEnd = endDate;
    }

    setStartDate(newStart);
    setEndDate(newEnd);
    fetchExpenseReport(newStart, newEnd);
  };

  //  Delete Handler
  const handleDelete = async (id) => {
    Swal.fire({
      title: '<span class="text-gray-900 dark:text-white">Are you sure?</span>',
      html: '<p class="text-gray-600 dark:text-gray-300">This action cannot be undone!</p>',
      icon: "warning",
      showCancelButton: true,
      background: "rgba(255, 255, 255, 0.2)",
      backdrop: `rgba(0,0,0,0.4)`,
      customClass: {
        popup:
          "rounded-lg border border-white/20 dark:border-gray-700/50 shadow-xl backdrop-blur-lg bg-white/80 dark:bg-gray-800/80",
        confirmButton:
          "px-4 py-2 bg-red-600/90 hover:bg-red-700/90 text-white rounded-md font-medium transition-colors backdrop-blur-sm ml-3",
        cancelButton:
          "px-4 py-2 bg-white/90 dark:bg-gray-700/90 hover:bg-gray-100/90 dark:hover:bg-gray-600/90 text-gray-800 dark:text-gray-200 border border-white/20 dark:border-gray-600/50 rounded-md font-medium transition-colors ml-2 backdrop-blur-sm",
        title: "text-lg font-semibold",
        htmlContainer: "mt-2",
      },
      buttonsStyling: false,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setGlobalLoader(true);
          const res = await api.get(`/DeleteExpense/${id}`);
          if (res.data.status === "Success") {
            SuccessToast(res.data.message);
            fetchExpenseReport(startDate, endDate);
          } else {
            ErrorToast(res.data.message);
          }
        } catch {
          ErrorToast("Failed to delete expense");
        } finally {
          setGlobalLoader(false);
        }
      }
    });
  };
  return (
    <div>
      {" "}
      {/* === Expense Report Section === */}
      <div className="global_sub_container">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold mb-3">Expense Report</h1>
          <span className="font-medium">Total: {totalAmount.toFixed(2)}</span>
        </div>

        {/* === Filters === */}
        <div className="lg:p-4 rounded-2xl shadow-md mb-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm mb-1">Select Period</label>
            <Select
              value={selectedPeriod}
              onChange={handlePeriodChange}
              options={periodOptions}
              classNamePrefix="react-select"
              className="w-full"
              menuPortalTarget={document.body}
              styles={getReactSelectStyles()}
            />
          </div>

          <div>
            <label className="block text-sm">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd-MM-yyyy"
              className="global_input w-full"
              popperContainer={(props) =>
                createPortal(<div {...props} />, document.body)
              }
            />
          </div>

          <div>
            <label className="block text-sm">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd-MM-yyyy"
              className="global_input w-full"
              popperContainer={(props) =>
                createPortal(<div {...props} />, document.body)
              }
            />
          </div>
        </div>

        {/* === Table === */}
        <div className="overflow-x-auto" ref={componentRef}>
          {expenseReport.length > 0 ? (
            <>
              <table className="global_table">
                <thead className="global_thead">
                  <tr>
                    <th className="global_th">#</th>
                    <th className="global_th">Type</th>
                    <th className="global_th">Amount</th>
                    <th className="global_th">Note</th>
                    <th className="global_th">Date</th>
                    <th className="global_th">Action</th>
                  </tr>
                </thead>
                <tbody className="global_tbody">
                  {expenseReport.map((item, i) => (
                    <tr key={i} className="global_tr">
                      <td className="global_td">{i + 1}</td>
                      <td className="global_td">{item.typeName || "-"}</td>
                      <td className="global_td text-red-600 font-semibold">
                        {parseFloat(item.amount).toFixed(2)}
                      </td>
                      <td className="global_td truncate max-w-[150px]">
                        {item.note || "-"}
                      </td>
                      <td className="global_td">
                        {formatDisplayDate(item.CreatedDate)}
                      </td>
                      <td className="global_td">
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="global_button_red"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* === Summary by Type === */}
              <div className="mt-5 border-t pt-4">
                <h2 className="text-lg font-semibold mb-3 text-center">
                  Expense Summary by Type
                </h2>
                <div className="overflow-x-auto">
                  <table className="global_table w-full text-center">
                    <thead className="global_thead">
                      <tr>
                        <th className="global_th">Expense Type</th>
                        <th className="global_th">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className="global_tbody">
                      {getExpenseSummaryByType(expenseReport).map(
                        (summary, i) => (
                          <tr key={i} className="global_tr">
                            <td className="global_td font-medium">
                              {summary.type}
                            </td>
                            <td className="global_td text-green-600 font-semibold">
                              {summary.total.toFixed(2)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                    <tfoot className="global_tfoot">
                      <tr>
                        <td className="global_td font-semibold text-right pr-3">
                          Grand Total:
                        </td>
                        <td className="global_td text-green-700 font-bold">
                          {totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <FaSearchDollar className="mx-auto text-4xl mb-3" />
              <p className="text-gray-500">No expenses found.</p>
            </div>
          )}
        </div>

        {/* Print Button */}
        <div className="text-center mt-5">
          <button
            className="global_button w-full lg:w-fit"
            onClick={handlePrint}
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
