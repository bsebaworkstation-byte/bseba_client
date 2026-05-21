import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const QuotationEdit = lazy(() =>
  import("../../Components/Quotation/QuotationEdit")
);
const QuatationEditPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <QuotationEdit />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default QuatationEditPage;
