import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const WithVat = lazy(() => import("../../Components/Sale/Invoice/WithVat"));
const InvocieWithVatPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <WithVat />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default InvocieWithVatPage;