import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";

const SaleDetails = lazy(() => import("../../Components/Sale/SaleDetails"));
const SaleDetailsPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <SaleDetails />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default SaleDetailsPage;
