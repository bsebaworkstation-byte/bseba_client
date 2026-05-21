import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Quotation2 = lazy(() => import("../../Components/Quotation/Quotation2"));

const Quotation2Page = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Quotation2 />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default Quotation2Page;
