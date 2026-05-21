import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Challan = lazy(() => import("../../Components/Sale/Challan"));
const ChallanPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Challan />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default ChallanPage;
