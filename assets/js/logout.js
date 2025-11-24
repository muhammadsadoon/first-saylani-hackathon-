function logout(){
    localStorage.removeItem("user");
    window.location.reload();
}