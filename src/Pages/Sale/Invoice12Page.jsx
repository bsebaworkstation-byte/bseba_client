import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";

const Invoice12 = lazy(() => import("../../Components/Sale/Invoice/12"));

const Invoice12Page = () => {
    return (
        <Fragment>
            <MasterLayout>
                <Suspense fallback={<LazyLoader />}>
                    <Invoice12 />
                </Suspense>
            </MasterLayout>
        </Fragment>
    );
};

export default Invoice12Page;
