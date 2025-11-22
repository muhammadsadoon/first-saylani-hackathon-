const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");

function formSubmit() {
    try {
        const obj = {
            email: emailEl.value.trim(),
            password: passwordEl.value.trim()
        }
        if (obj.password.length > 7) {
            if (localStorage.getItem("users")) {
                const getLocalStorageData = JSON.parse(localStorage.getItem("users"));
                const findData = getLocalStorageData.find((item) => item.email == obj.email && item.password == obj.password);
                if (findData) {
                    localStorage.setItem("user", JSON.stringify(findData));
                    Swal.fire({
                        icon: "success",
                        title: "Let's Go...",
                    }).then((result) => { if (result.isConfirmed) { location.href = "http://127.0.0.1:3000/" } });
                } else {
                    throw "email and password is in valid..."
                }
            }
        } else {
            throw "please enter the 8 character in password..."
        }
    } catch (err) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            theme: 'bootstrap-5',
            text: err
        })
    }

}