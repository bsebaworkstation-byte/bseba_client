import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Analyze = lazy(() => import("../../Components/Product/Analyze"));

const AnalyzePage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Analyze />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default AnalyzePage;
