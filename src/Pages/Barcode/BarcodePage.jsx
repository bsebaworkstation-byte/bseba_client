import React, { Fragment, Suspense, lazy } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Barcode = lazy(() => import("../../Components/Barcode/Barcode"));

const BarcodePage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Barcode />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default BarcodePage;
