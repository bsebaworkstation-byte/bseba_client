import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const SaleList = lazy(() => import("../../Components/Sale/SaleList"));
const SaleListPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <SaleList />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default SaleListPage;
