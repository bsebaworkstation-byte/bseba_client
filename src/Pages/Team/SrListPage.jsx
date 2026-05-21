import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const HrList = lazy(() => import("../../Components/Team/SrList"));
const HrListPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <HrList />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default HrListPage;
