import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const ProductList = lazy(() => import("../../Components/Product/ProductList"));

const ProductListPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <ProductList />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default ProductListPage;
