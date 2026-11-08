
const { useState, useEffect } = React;

function ApprovalApp() {

    const [submissions, setSubmissions] = useState([]);
    const [message, setMessage] = useState("");

    // Load submitted posts
    function loadSubmissions() {
        $.ajax({
            url: "/api/submissions",
            method: "GET",

            success: function(data) {
                setSubmissions(data);
            },

            error: function() {
                setMessage("Could not load submissions.");
            }
        });
    }

    // Load posts when the page opens
    useEffect(function() {
        loadSubmissions();
    }, []);

    // Approve or reject a post
    function updateStatus(id, status) {
        $.ajax({
            url: "/api/submissions/" + id,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify({ status: status }),

            success: function() {
                setMessage("Post " + status.toLowerCase() + " successfully!");
                loadSubmissions();
            },

            error: function() {
                setMessage("Could not update post.");
            }
        });
    }

    return (
        <div>

            {message && (
                <div className="alert alert-info">
                    {message}
                </div>
            )}

            <div className="card p-4 shadow-sm">
                <h3>Pending Posts</h3>

                {submissions.filter(function(post) {
                    return post.status === "Pending";
                }).length === 0 && (
                    <p>No pending posts.</p>
                )}

                {submissions.filter(function(post) {
                    return post.status === "Pending";
                }).map(function(post) {
                    return (
                        <div className="border-bottom py-3" key={post.id}>

                            <h4>{post.title}</h4>
                            <p><strong>Student:</strong> {post.name}</p>
                            <p><strong>Category:</strong> {post.category}</p>
                            <p>{post.content}</p>

                            <button
                                className="btn btn-success me-2"
                                onClick={function() {
                                    updateStatus(post.id, "Approved");
                                }}>
                                Approve
                            </button>

                            <button
                                className="btn btn-danger"
                                onClick={function() {
                                    updateStatus(post.id, "Rejected");
                                }}>
                                Reject
                            </button>

                        </div>
                    );
                })}
            </div>

            <div className="card p-4 shadow-sm mt-4">
                <h3>Reviewed Posts</h3>

                {submissions.filter(function(post) {
                    return post.status !== "Pending";
                }).map(function(post) {
                    return (
                        <div className="border-bottom py-2" key={post.id}>
                            <strong>{post.title}</strong>
                            <span className="ms-3">{post.status}</span>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}

const root = ReactDOM.createRoot(
    document.getElementById("approvalApp")
);

root.render(<ApprovalApp />);
