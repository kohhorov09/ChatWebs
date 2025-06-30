import Button from "@mui/material/Button";
import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button variant="outlined">
        <Link to="/videochat" style={{ textDecoration: "none" }}>
          Start Chat
        </Link>
      </Button>
    </div>
  );
}

export default Navbar;
