import React from 'react'
import { Link } from 'react-router-dom'

const Welcome = () => {
    return (
        <div>
            Hello!
            <br />
            <Link to='login'>Login</Link>
            <br />
            <Link to='register'>Register</Link>
        </div>
    )
}

export default Welcome