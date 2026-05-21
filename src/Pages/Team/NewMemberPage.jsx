import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const NewMember = lazy(() => import("../../Components/Team/NewMember"));
const NewMemberPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <NewMember />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default NewMemberPage;
