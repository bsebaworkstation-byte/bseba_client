import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const ChallanBangla = lazy(() => import("../../Components/Sale/ChallanBangla"));
const ChallanBanglaPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <ChallanBangla />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default ChallanBanglaPage;
