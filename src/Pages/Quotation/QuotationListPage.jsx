import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const QuotationList = lazy(() =>
  import("../../Components/Quotation/QuotationList")
);
const QuotationListPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <QuotationList />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default QuotationListPage;
