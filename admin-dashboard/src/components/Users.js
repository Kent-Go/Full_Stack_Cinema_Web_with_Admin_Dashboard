import React, { useEffect, useState, useContext } from 'react';
import { gqlGetUsers, gqlBlockUser, gqlUnblockUser } from "../data/repository";
import MessageContext from "../context/MessageContext";

function Users() {
    const [users, setUsers] = useState(null);
    const { setMessage } = useContext(MessageContext);

    // Load posts.
    useEffect(() => {
      loadUsers();
    }, []);

    const loadUsers = async () => {
        const currentUser = await gqlGetUsers();

        setUsers(currentUser);
    };

  const handleBlock = async (username) => {
        if(!window.confirm(`Are you sure you want to block?`))
        return;
        
        const isBlocked = await gqlBlockUser(username);

        if(isBlocked) {
        // Could remove the owner that was deleted or refresh the owners.
        // Here the owners are refreshed.
        await loadUsers();

        setMessage(<>User: (<strong>{username}</strong>) has been blocked successfully.</>);
        }
    };

    const handleUnblock = async (username) => {
      if(!window.confirm(`Are you sure you want to block?`))
      return;
      
      const isBlocked = await gqlUnblockUser(username);

      if(isBlocked) {
      // Could remove the owner that was deleted or refresh the owners.
      // Here the owners are refreshed.
      await loadUsers();

      setMessage(<>User: (<strong>{username}</strong>) has been unblocked successfully.</>);
      }
  };

    if(users === null)
        return null;

    return (
        <div className='dashboard-content'>
          <div className="header">
            <h1>All Users</h1>
          </div>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Hashed Password</th>
                <th>Sign Up Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
                {users.map(user =>
                <tr >
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.password_hash}</td>
                    <td>{user.signUpDate}</td>
                    
                    <td>
                        {user.blocked === 0 ? (<button className="btn btn-danger" onClick={() => handleBlock(user.username)}>Block</button>) 
                        : (<button className="btn btn-danger" onClick={() => handleUnblock(user.username)}>UnBlock</button>)}
                    </td>
                </tr>
                )}
            </tbody>
          </table>
        </div>
      );
}


export default Users;