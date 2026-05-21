import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";

const RecievedWarranty = lazy(() =>
  import("../../Components/Warranty/RecievedWarranty")
);
const RecievedWarrantyPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <RecievedWarranty />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default RecievedWarrantyPage;
