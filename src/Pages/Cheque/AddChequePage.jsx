import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const AddCheque = lazy(() => import("../../Components/Cheque/AddCheque"));

const AddChequePage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <AddCheque />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default AddChequePage;
