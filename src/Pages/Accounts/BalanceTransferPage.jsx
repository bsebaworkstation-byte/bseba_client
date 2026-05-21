import React, { Fragment, Suspense, lazy } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const BalanceTransfer = lazy(() =>
  import("../../Components/Accounts/BalanceTransfer")
);

const BalanceTransferPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <BalanceTransfer />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default BalanceTransferPage;
