import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Print80 = lazy(() => import("../../Components/Sale/Print80"));
const Print80Page = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Print80 />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default Print80Page;
