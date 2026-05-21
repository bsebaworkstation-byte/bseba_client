import { create } from "zustand";

const openCloseStore = create((set) => ({
  dealerModal: false,
  supplierModal: false,
  categoryModal: false,
  businessSetupModal: false,
  modalOpen: false,
  modalType: "",
  modalCallback: null,
  openSidePanel: false,
  transictionModal: false,
  assignPermissionModal: false,

  // openModal now accepts callback
  openModal: (type, callback = null, setData = null) =>
    set({ modalOpen: true, modalType: type, modalCallback: callback }),

  closeModal: () =>
    set({ modalOpen: false, modalType: "", modalCallback: null }),

  setDealerModal: (val) => set({ dealerModal: val }),
  setSupplierModal: (val) => set({ supplierModal: val }),
  setCategoryModal: (val) => set({ categoryModal: val }),
  setBusinessSetupModal: (val) => set({ businessSetupModal: val }),
  // Add this for expense type modal
  expenseTypeModal: false,
  setExpenseTypeModal: (val) => set({ expenseTypeModal: val }),

  // Add this for expense type modal
  editTransactionModal: false,
  setEditTransactionModal: (val) => set({ editTransactionModal: val }),
  setOpenSidePanel: (val) => set({ openSidePanel: val }),
  setTransictionModal: (val) => set({ transictionModal: val }),
  setAssignPermissionModal: (val) => set({ assignPermissionModal: val }),
}));

export default openCloseStore;
