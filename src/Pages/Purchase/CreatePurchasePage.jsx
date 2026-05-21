import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const CreatePurchase = lazy(() =>
  import("../../Components/Purchase/CreatePurchase")
);
const CreatePurchasePage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <CreatePurchase />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default CreatePurchasePage;
