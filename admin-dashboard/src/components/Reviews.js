import React, { useEffect, useState, useContext } from 'react';
import { gqlGetPosts, gqlDeletePost } from "../data/repository";
import MessageContext from "./MessageContext";

function Reviews() {
    const [reviews, setReviews] = useState(null);
    const { setMessage } = useContext(MessageContext);

    // Load posts.
    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        const currentReview = await gqlGetPosts();

        setReviews(currentReview);
    };

    const handleDelete = async (post_id) => {
        if(!window.confirm(`Are you sure you want to delete?`))
        return;
        
        const isDeleted = await gqlDeletePost(post_id);

        if(isDeleted) {
        // Could remove the owner that was deleted or refresh the owners.
        // Here the owners are refreshed.
        await loadPosts();

        setMessage(<>Post (ID:<strong>{post_id}</strong>) has been deleted successfully.</>);
        }
    };

    if(reviews === null)
        return null;

    return (
        <div className='dashboard-content'>
          <div className="header">
            <h1>All Reviews</h1>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Title</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
                {reviews.map(review =>
                <tr >
                    <td>{review.post_id}</td>
                    <td>{review.username}</td>
                    <td>{review.title}</td>
                    <td>{review.rating}</td>
                    <td> <div dangerouslySetInnerHTML={{ __html: review.comment }} /></td>
                    
                    <td>
                        {review.rating !== 0  ? (<button className="btn btn-danger" onClick={() => handleDelete(review.post_id)}>Delete</button>) 
                        : (<p>Deleted</p>)}
                    </td>
                </tr>
                )}
            </tbody>
          </table>
        </div>
      );
}

export default Reviews;