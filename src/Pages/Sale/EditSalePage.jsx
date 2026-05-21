import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const EditSale = lazy(() => import("../../Components/Sale/EditSale"));
const EditSalePage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <EditSale />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default EditSalePage;
