import { Link, useNavigate } from "react-router-dom"
import useLogout from "../hooks/useLogout";

const Home = () => {
    const logout = useLogout();
    const navigate = useNavigate();

    const signOut = async () => {
        await logout();
        navigate('/login');
    }

    return (
        <div>
            Welcome!
            <br />
            <Link className="navLink" to='/users/waitlist'>Your Waitlist</Link>
            <br />
            <Link className="navLink" to='/books/search'>Search</Link>
            <br />
            <Link className="navLink" to='/users/checkouts'>Your Checkouts</Link>
            <br />
            <button onClick={signOut}>Sign Out</button>
        </div>
    )
}

export default Home