import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Invoice1 = lazy(() => import("../../Components/Sale/Invoice/1"));
const Invoice1Page = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Invoice1 />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default Invoice1Page;
