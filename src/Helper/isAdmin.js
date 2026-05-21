const isAdmin = () => {
 
    const user = JSON.parse(localStorage.getItem("admin")); // it will return 1 or 0 as number
    return user == 1; // return true if user is admin (1), otherwise false (0)  
};

export default isAdmin;
