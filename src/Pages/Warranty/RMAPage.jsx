import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const RMA = lazy(() => import("../../Components/Warranty/RMA"));
const RMAPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <RMA />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default RMAPage;
