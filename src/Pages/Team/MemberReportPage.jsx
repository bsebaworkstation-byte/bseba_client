import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const MemberReport = lazy(() => import("../../Components/Team/MemberReport"));
const MemberReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <MemberReport />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default MemberReportPage;
