import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const CreateQuotation = lazy(() =>
  import("../../Components/Quotation/CreateQuotation")
);
const CreateQuotationPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <CreateQuotation />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default CreateQuotationPage;
