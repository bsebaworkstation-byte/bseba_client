import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";

const SaleOrderEdit = lazy(() =>
  import("../../Components/SaleOrder/SaleOrderEdit")
);
const SaleOrderEditPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <SaleOrderEdit />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default SaleOrderEditPage;
