import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";

const ServiceListByStatus = lazy(() =>
  import("../../Components/Service/ServiceListByStatus"),
);

const ServiceListByStatusPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <ServiceListByStatus />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default ServiceListByStatusPage;
