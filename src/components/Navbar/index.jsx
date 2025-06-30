import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div>
      <ul>
        <Link to="/videochat">Start Chat</Link>
      </ul>
    </div>
  );
}

export default Navbar;
