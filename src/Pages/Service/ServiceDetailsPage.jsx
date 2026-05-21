import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const ServiceDetails = lazy(() =>
  import("../../Components/Service/ServiceDetails")
);
const ServiceDetailsPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <ServiceDetails />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default ServiceDetailsPage;
