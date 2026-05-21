import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
import OneB from "../../Components/Sale/Invoice/1b";
const Invoice6 = lazy(() => import("../../Components/Sale/Invoice/6"));
const OneBPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
        <OneB/>
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default OneBPage;
