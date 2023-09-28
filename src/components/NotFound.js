import { Link, useNavigate } from "react-router-dom"

const NotFound = () => {
    const navigate = useNavigate();
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            margin: "0",
            textAlign: "center",
        }}>
            <div style={{ marginBottom: "20px" }}>
                Oops! Whatever you requested, it's not here.
            </div>
            <Link to={navigate(-1)} style={{ textDecoration: "none" }}>
                <button style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px" }}>
                    Go back
                </button>
            </Link>
        </div>
    )

}

export default NotFound