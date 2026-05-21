import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const NewSale = lazy(() => import("../../Components/Sale/NewSale"));
const NewSalePage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <NewSale />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default NewSalePage;
