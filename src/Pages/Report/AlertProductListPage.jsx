import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";

const AlertProductList = lazy(() =>
  import("../../Components/Report/AlertProductList")
);

const AlertProductListPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <AlertProductList />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default AlertProductListPage;
