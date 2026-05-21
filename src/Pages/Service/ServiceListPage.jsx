import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const ServiceList = lazy(() =>
  import("../../Components/Service/ServiceList")
);
const ServiceListPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <ServiceList />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default ServiceListPage;
