import { useState } from 'react'
import axios from "axios";
import { jwtDecode } from "jwt-decode";

function App() {

  const [name,setname] = useState('');
  const [password,setPassword] = useState('');
  const [username,setusername] = useState('');
  // const [passworddisplay,setPasswordDisplay] = useState('');
  const [loggedIn,setLoggedin] = useState(false);
  const [admin,setAdmin] = useState(false);
  const [id,setId] = useState('');
  const [user,setUser] = useState(null);
  const [deleted,setDelete] = useState(false);
  const [deleteError,setDeleteError] = useState(false);

  const refreshToken = async() => {
    try {
      const response = await axios.post("http://localhost:5000/api/refresh",{
        token:user.refreshToken
      });
      setUser({
        ...user,
        accessToken:response.data.accessToken,
        refreshToken:response.data.refreshToken,
      });
      return response.data;
    } catch (error) {
      console.log(err);
    }
  }
  const axiosJWT = axios.create();

  axiosJWT.interceptors.request.use(
    async(config)=>{
      let currentDate = new Date();
      const decodedToken = jwtDecode(user.accessToken);
      if(decodedToken.exp*1000 < currentDate.getTime()){
        const data = await refreshToken();
        config.headers["authorization"] = "Bearer" +  data.accessToken;
      }
      return config;

    },(error)=>{
      return Promise.reject(error);
    })


  const handleDelete = async(userId) =>{

    setDelete(false);
    setDeleteError(false);
    try {
      const response = await axiosJWT.delete(`http://localhost:5000/api/users/${userId}`,{
        headers : {authorization : "Bearer "+ user.accessToken}
      })
      setDelete(true)
    } catch (error) {
      if(!admin){
        setDeleteError(true);
      }
    }
  }

  const handleSubmit = async (e)=>{
    // setusername(name);
    // setPasswordDisplay(password);
    e.preventDefault();
    if(name){
      try {
        const response = await axios.post("http://localhost:5000/api/login",{
          username : name,
          password : password
        })
        const {username} = response.data ;
        const {isAdmin} = response.data ; 
        // console.log(isAdmin);
        // console.log(response.data) 
        const {id} = response.data;
        let user ={};
        user = response.data;
        setUser(user);
        setId(id);
        setAdmin(isAdmin);
        setusername(username);
        setLoggedin(true);
      } catch (error) {
        console.error("Login Failed",error);
      }
    }
  } 

  // {!loggedIn ? ( ... ) : ( ... )}
  // !loggedIn: If the user is not logged in, the form will be displayed. If the user is logged in, a greeting message will be displayed.


  return(
    <div className='flex flex-col justify-center items-center min-h-screen'>
      {!loggedIn ? (
      <>
      <label className="input input-bordered flex items-center gap-2 w-96">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" /></svg>
        <input 
        type="text"
         className="grow" 
         placeholder="Username"
         value = {name}
         onChange={(event)=> setname(event.target.value)} 
        />
      </label>
      <label className="input input-bordered flex items-center gap-2 w-96">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path fillRule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clipRule="evenodd" /></svg>
        <input 
        type="password"
        className="grow"
        placeholder='Password'
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <button className="btn btn-ghost" onClick={handleSubmit}>LogIN</button>
      </>) : (
      <div className='flex flex-col gap-5'>
        {admin ? <h1>Hi Admin {username}</h1> : <h1>Hi User {username}</h1>}
        <button className="btn btn-outline " onClick={()=>handleDelete(1)}>Delete Ash</button> 
        <button className="btn btn-outline"  onClick={()=>handleDelete(2)}>Delete harsh</button>
        {deleted && !deleteError &&( <h1>User Deleted successfully </h1>) }
        {deleteError && deleteError && (<h1>You are not allowed to Delete Account </h1>)}
      </div>
      )}
    </div>
  )

}

export default App






