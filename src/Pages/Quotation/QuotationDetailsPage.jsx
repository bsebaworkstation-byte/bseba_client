import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const QuotationDetails = lazy(() =>
  import("../../Components/Quotation/QuotationDetails")
);
const QuotationDetailsPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <QuotationDetails />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default QuotationDetailsPage;
