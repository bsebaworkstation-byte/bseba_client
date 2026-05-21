import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Invoice8 = lazy(() => import("../../Components/Sale/Invoice/8"));
const Invoice8Page = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Invoice8 />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default Invoice8Page;
