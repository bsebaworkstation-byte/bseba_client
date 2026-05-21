import React, { Fragment, Suspense, lazy } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Barcode2 = lazy(() => import("../../Components/Barcode/Barcode2"));

const Barcode2Page = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Barcode2 />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default Barcode2Page;
