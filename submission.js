
const { useState } = React;

function SubmissionApp() {

    const [formData, setFormData] = useState({
        name: "",
        title: "",
        category: "",
        content: ""
    });

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [submittedData, setSubmittedData] = useState(null);

    // Update form information
    function handleChange(event) {
        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value
        });
    }

    // Submit community post
    function handleSubmit(event) {
        event.preventDefault();

        if (!formData.name.trim() ||
            !formData.title.trim() ||
            !formData.category ||
            !formData.content.trim()) {

            setMessage("Please complete all required fields.");
            setMessageType("danger");
            return;
        }

        const submission = {
            name: formData.name.trim(),
            title: formData.title.trim(),
            category: formData.category,
            content: formData.content.trim(),
            status: "Pending"
        };

        // Send JSON to Node.js
        $.ajax({
            url: "/api/submissions",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(submission),

            success: function() {
                setSubmittedData(submission);
                setMessage("Content submitted successfully!");
                setMessageType("success");

                setFormData({
                    name: "",
                    title: "",
                    category: "",
                    content: ""
                });
            },

            error: function() {
                setMessage("Could not submit content.");
                setMessageType("danger");
            }
        });
    }

    return (
        <div className="row g-4">

            <div className="col-md-7">
                <div className="card p-4 shadow-sm">

                    <h3>Submit Community Post</h3>

                    <form onSubmit={handleSubmit}>

                        <div className="mb-3">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Post Title</label>
                            <input
                                type="text"
                                className="form-control"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Category</label>
                            <select
                                className="form-select"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="">Choose a category</option>
                                <option>Club News</option>
                                <option>Events</option>
                                <option>Announcements</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Post Content</label>
                            <textarea
                                className="form-control"
                                name="content"
                                rows="5"
                                value={formData.content}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <button type="submit" className="btn btn-primary">
                            Submit Post
                        </button>

                    </form>

                    {message && (
                        <div className={`alert alert-${messageType} mt-3`}>
                            {message}
                        </div>
                    )}

                </div>
            </div>

            <div className="col-md-5">
                <div className="card p-4 shadow-sm">

                    <h3>Submission JSON</h3>
                    <p className="text-muted">
                        Your submitted post will appear here.
                    </p>

                    <pre className="json-display">
                        {submittedData
                            ? JSON.stringify(submittedData, null, 2)
                            : "No post submitted yet."}
                    </pre>

                </div>
            </div>

        </div>
    );
}

const root = ReactDOM.createRoot(
    document.getElementById("submissionApp")
);

root.render(<SubmissionApp />);
