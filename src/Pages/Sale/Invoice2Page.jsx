import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Invoice2 = lazy(() => import("../../Components/Sale/Invoice/2"));

const InvoicePage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Invoice2 />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default InvoicePage;
