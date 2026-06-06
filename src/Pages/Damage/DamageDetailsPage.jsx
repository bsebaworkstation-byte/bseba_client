import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";

const DamageDetails = lazy(
  () => import("../../Components/Damage/DamageDetails"),
);

const DamageDetailsPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <DamageDetails />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default DamageDetailsPage;
