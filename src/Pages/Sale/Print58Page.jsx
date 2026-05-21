import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Print58 = lazy(() => import("../../Components/Sale/Print58"));
const Print58Page = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Print58 />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default Print58Page;
