import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Invoice5 = lazy(() => import("../../Components/Sale/Invoice/5"));
const Invoice5Page = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Invoice5 />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default Invoice5Page;
