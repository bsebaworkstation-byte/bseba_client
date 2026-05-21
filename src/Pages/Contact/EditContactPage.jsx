import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const EditContact = lazy(() => import("../../Components/Contact/EditContact"));

const EditContactPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <EditContact />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default EditContactPage;
