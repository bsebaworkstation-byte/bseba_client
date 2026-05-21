import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Brand = lazy(() => import("../../Components/Product/Brand"));

const BrandPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Brand />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default BrandPage;
