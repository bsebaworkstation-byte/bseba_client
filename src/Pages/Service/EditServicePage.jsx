import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const EditService = lazy(() =>
  import("../../Components/Service/EditService")
);
const EditServicePage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <EditService />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default EditServicePage;
