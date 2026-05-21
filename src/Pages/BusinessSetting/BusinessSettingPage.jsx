import React, { Fragment, Suspense, lazy } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const BusinessSetting = lazy(() =>
  import("../../Components/BusinessSetting/BusinessSetting")
);

const BusinessSettingPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <BusinessSetting />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default BusinessSettingPage;
