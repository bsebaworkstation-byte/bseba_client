import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Invoice3 = lazy(() => import("../../Components/Sale/Invoice/3"));
const Invoice3Page = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Invoice3 />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default Invoice3Page;
