import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const CreateService = lazy(() =>
  import("../../Components/Service/CreateService")
);
const CreateServicePage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <CreateService />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default CreateServicePage;
