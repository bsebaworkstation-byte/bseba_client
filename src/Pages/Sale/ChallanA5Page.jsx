import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const ChallanA5 = lazy(() => import("../../Components/Sale/ChallanA5"));
const ChallanA5Page = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <ChallanA5 />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default ChallanA5Page;
