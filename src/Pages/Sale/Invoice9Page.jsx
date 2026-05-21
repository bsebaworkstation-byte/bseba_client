import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";

const Invoice9 = lazy(() => import("../../Components/Sale/Invoice/9"));
const Invoice9Page = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Invoice9 />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default Invoice9Page;
