import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const SaleReturnList = lazy(() =>
  import("../../Components/Sale/SaleReturnList")
);
const SaleReturnListPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <SaleReturnList />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default SaleReturnListPage;
