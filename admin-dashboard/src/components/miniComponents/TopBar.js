import React, {useContext} from 'react';
import { Link } from "react-router-dom";
import '../componentCSS/TopBar.css';
import MessageContext from "../MessageContext";

const TopBar = () => {
  const { message, setMessage } = useContext(MessageContext);

  return (
    <>
      <div className="top-bar">
        <h1 className="admin">Admin Dashboard</h1>
        <h1><Link className="other-link" to="/">Home</Link></h1>
        <h1><Link className="other-link" to="/users">Users</Link></h1>
        <h1><Link className="other-link" to="/reviews">Reviews</Link></h1>
      </div>
      {message && <div style={{margin: 'auto', marginTop: "1rem", padding: '1rem', borderRadius: "5px", color: "white", backgroundColor: "#83D475", width: "fit-content", alignContent:"center"}}>{message}</div>}
    </>
  );
};

export default TopBar;