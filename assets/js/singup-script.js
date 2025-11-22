const nameEl = document.getElementById("name");
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");

function formSubmit() {
    try {
        const obj = {
            name: nameEl.value.trim(),
            email: emailEl.value.trim(),
            password: passwordEl.value.trim()
        }
        console.log(obj);
        if (obj.name.length > 6) {
            if (obj.password.length > 7) {
                if (localStorage.getItem("users")) {
                    const getLocalStorageData = JSON.parse(localStorage.getItem("users"));
                    if (!getLocalStorageData.find((item) => item.email == obj.email)) {
                        getLocalStorageData.push(obj);
                        localStorage.setItem("users", JSON.stringify(getLocalStorageData));
                        localStorage.setItem("user",JSON.stringify(obj));
                        Swal.fire({
                            icon: "success",
                            title: "Let's Go...",
                        }).then((result) => { if (result.isConfirmed) { location.href = "./" } });
                    } else {
                        throw "this email is already existed !"
                    }
                } else {
                    localStorage.setItem("users", JSON.stringify([obj]));
                    localStorage.setItem("user",JSON.stringify(obj));
                }
            } else {
                throw "please enter the 8 character in password..."
            }
        } else {
            throw "please enter the full name..."
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
