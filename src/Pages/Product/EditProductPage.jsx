import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
import EditProduct from "../../Components/Product/EditProduct";
// const Brand = lazy(() => import("../../Components/Product/Brand"));

const EditProductPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <EditProduct />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default EditProductPage;
