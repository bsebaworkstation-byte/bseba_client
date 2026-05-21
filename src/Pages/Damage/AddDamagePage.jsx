import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const AddDamage = lazy(() => import("../../Components/Damage/AddDamage"));

const AddDamagePage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <AddDamage />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default AddDamagePage;
