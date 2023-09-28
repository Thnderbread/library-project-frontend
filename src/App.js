import Home from './components/Home';
import Login from './components/Login';
import Layout from './components/Layout';
import Welcome from './components/Welcome';
import NotFound from './components/NotFound';
import Register from './components/Register';
import Search from './components/Search/Search';
import RequireAuth from './context/RequireAuth';
import { Routes, Route } from 'react-router-dom';
import PersistLogin from './components/PersistLogin';
import UserWaitlist from './components/UserWaitlist';
import UserCheckouts from './components/UserCheckouts';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<Welcome />} />

        <Route path='register' element={<Register />} />
        <Route path='login' element={<Login />} />
        {/* <Route path='forgot' element={<Forgot />} /> */}

        <Route element={<PersistLogin />}>
          <Route element={<RequireAuth />}>

            <Route path='home' index element={<Home />} />
            <Route path='/books' >
              <Route path='search' element={<Search />} /> {/* Searching for books */}
            </Route>

            <Route path='/users' >
              <Route path='waitlist' element={<UserWaitlist />} /> {/* Displaying user's current waitlist. */}
              <Route path='checkouts' element={<UserCheckouts />} /> {/* Displaying user checkouts */}
            </Route>

          </Route>
        </Route>
      </Route>

      {/* Catch all - not found */}
      <Route path='*' element={<NotFound />} />
    </Routes>
  );
}

export default App;