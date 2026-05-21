import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const SerialList = lazy(() => import("../../Components/Warranty/SerialList"));
const SerialListPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <SerialList />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default SerialListPage;
