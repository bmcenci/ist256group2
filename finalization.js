
const { useState, useEffect } = React;

function RegistrationApp() {

    // Store form information using React state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        event: "",
        participation: "In-person",
        attending: "",
        notes: ""
    });

    const [events, setEvents] = useState([]);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [submittedData, setSubmittedData] = useState(null);

    // Use jQuery AJAX to load available events from products.json
    useEffect(function() {

        $.getJSON("products.json", function(products) {

            const eventProducts = products.filter(function(product) {
                return product.category === "Event";
            });

            setEvents(eventProducts);

        }).fail(function() {
            setMessage("Unable to load event options.");
            setMessageType("danger");
        });

    }, []);

    // Update React state when a form field changes
    function handleChange(event) {

        const { name, value } = event.target;

        setFormData(function(previousData) {
            return {
                ...previousData,
                [name]: value
            };
        });
    }

    // Submit registration
    function handleSubmit(event) {

        event.preventDefault();

        // Check required fields
        if (
            !formData.name.trim() ||
            !formData.email.trim() ||
            !formData.event ||
            !formData.attending
        ) {
            setMessage("Please complete all required fields.");
            setMessageType("danger");
            return;
        }

        // Validate email format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(formData.email)) {
            setMessage("Please enter a valid email address.");
            setMessageType("danger");
            return;
        }

        // Create registration JSON object
        const registration = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            event: formData.event,
            participation: formData.participation,
            attending: formData.attending,
            notes: formData.notes.trim(),
            registrationDate: new Date().toISOString()
        };

        // Display JSON data
        setSubmittedData(registration);

        // Send JSON to REST API using jQuery AJAX
        $.ajax({
            url: "/api/registrations",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(registration),

            success: function(response) {
                setMessage("Registration submitted successfully!");
                setMessageType("success");
            },

            error: function() {
                setMessage(
                    "Unable to submit registration. Please try again."
                );
                setMessageType("danger");
            }
        });
    }

    return (
        <div className="row g-4">

            <div className="col-lg-7">
                <div className="card shadow-sm">
                    <div className="card-body p-4">

                        <h3 className="mb-4">Registration Details</h3>

                        <form onSubmit={handleSubmit}>

                            <div className="mb-3">
                                <label className="form-label">
                                    Full Name *
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Email Address *
                                </label>

                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Select Event *
                                </label>

                                <select
                                    className="form-select"
                                    name="event"
                                    value={formData.event}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Choose an event</option>

                                    {events.map(function(event) {
                                        return (
                                            <option
                                                key={event.id}
                                                value={event.description}
                                            >
                                                {event.description}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Participation Type
                                </label>

                                <select
                                    className="form-select"
                                    name="participation"
                                    value={formData.participation}
                                    onChange={handleChange}
                                >
                                    <option value="In-person">In-person</option>
                                    <option value="Virtual">Virtual</option>
                                    <option value="VIP">VIP</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Will you attend? *
                                </label>

                                <select
                                    className="form-select"
                                    name="attending"
                                    value={formData.attending}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select an option</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Additional Notes
                                </label>

                                <textarea
                                    className="form-control"
                                    name="notes"
                                    rows="3"
                                    value={formData.notes}
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary">
                                Submit Registration
                            </button>

                        </form>

                        {message && (
                            <div className={`alert alert-${messageType} mt-3`}>
                                {message}
                            </div>
                        )}

                    </div>
                </div>
            </div>

            <div className="col-lg-5">
                <div className="card shadow-sm">
                    <div className="card-body">

                        <h3>Registration JSON</h3>

                        <p className="text-muted">
                            Your submitted registration information will
                            appear here.
                        </p>

                        <pre className="json-display">
                            {submittedData
                                ? JSON.stringify(submittedData, null, 2)
                                : "No registration submitted yet."}
                        </pre>

                    </div>
                </div>
            </div>

        </div>
    );
}

// Render the React application
const root = ReactDOM.createRoot(
    document.getElementById("registrationApp")
);

root.render(<RegistrationApp />);
