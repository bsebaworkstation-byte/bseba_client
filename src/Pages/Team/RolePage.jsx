import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Role = lazy(() => import("../../Components/Team/Role"));
const RolePage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Role />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default RolePage;
