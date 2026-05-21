import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";

const CreateSaleOrder = lazy(() =>
  import("../../Components/SaleOrder/CreateSaleOrder")
);
const CreateSaleOrderPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <CreateSaleOrder />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default CreateSaleOrderPage;
