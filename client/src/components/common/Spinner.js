import React from "react";
import Spinner from "../common/spinner.gif";

export default () => {
  return (
    <div>
      <img
        src={Spinner}
        alt="Loading...."
        style={{ margin: "auto", display: "block", width: "150px" }}
      />
    </div>
  );
};
