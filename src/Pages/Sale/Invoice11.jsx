import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";

const Invoice11 = lazy(() => import("../../Components/Sale/Invoice/11"));

const Invoice11Page = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Invoice11 />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default Invoice11Page;
