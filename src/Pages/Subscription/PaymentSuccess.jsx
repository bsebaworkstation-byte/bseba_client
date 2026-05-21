import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";

const PaymentSuccess = lazy(() =>
  import("../../Components/Payment/PaymentSuccess")
);
const PaymentSuccessPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <PaymentSuccess />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default PaymentSuccessPage;
