import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Category = lazy(() => import("../../Components/Product/Category"));

const CategoryPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Category />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default CategoryPage;
