import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";

const InvestorList = lazy(
  () => import("../../Components/Investment/InvestorList"),
);

const InvestorListPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <InvestorList />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default InvestorListPage;
