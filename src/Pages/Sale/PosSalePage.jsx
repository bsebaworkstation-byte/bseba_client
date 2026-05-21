import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const PosSale = lazy(() => import("../../Components/Sale/PosSale"));
const PosSalePage = () => {
  return (
    <Fragment>
      <Suspense fallback={<LazyLoader />}>
        <PosSale />
      </Suspense>
    </Fragment>
  );
};

export default PosSalePage;
