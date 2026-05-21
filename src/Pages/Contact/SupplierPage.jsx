import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Supplier = lazy(() => import("../../Components/Contact/Supplier"));
const SupplierPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Supplier />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default SupplierPage;
