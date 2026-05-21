import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Cheque = lazy(() => import("../../Components/Cheque/Cheque"));

const ChequePage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Cheque />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default ChequePage;
