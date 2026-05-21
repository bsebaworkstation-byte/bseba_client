import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const NewProduct = lazy(() => import("../../Components/Product/NewProduct"));
const NewProductPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <NewProduct />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default NewProductPage;
