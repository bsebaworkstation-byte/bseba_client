import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const SaleWithVat = lazy(() => import("../../Components/Sale/SaleWithVat"));
const SaleWithVatPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <SaleWithVat />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default SaleWithVatPage;