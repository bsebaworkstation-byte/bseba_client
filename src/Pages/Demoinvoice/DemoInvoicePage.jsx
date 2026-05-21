import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const DemoInvoice = lazy(() => import("../../Components/Sale/DemoInvoice"));

const DemoInvoicePage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <DemoInvoice />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default DemoInvoicePage;
