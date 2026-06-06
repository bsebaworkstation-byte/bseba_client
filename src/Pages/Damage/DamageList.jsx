import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";

const DamageList = lazy(() => import("../../Components/Damage/DamageList"));

const DamageListPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <DamageList />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default DamageListPage;
