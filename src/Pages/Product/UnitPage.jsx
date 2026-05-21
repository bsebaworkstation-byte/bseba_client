import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Unit = lazy(() => import("../../Components/Product/Unit"));
const UnitPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Unit />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default UnitPage;
