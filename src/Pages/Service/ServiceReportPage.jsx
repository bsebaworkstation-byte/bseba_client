import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";

const ServiceReport = lazy(() =>
  import("../../Components/Service/ServiceReport"),
);

const ServiceReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <ServiceReport />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default ServiceReportPage;
