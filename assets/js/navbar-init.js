// Initialize navbar user avatar on all pages
(function () {
	const user = JSON.parse(localStorage.getItem("user")) || { name: 'User' };
	const navUserNameEl = document.getElementById("user_name");
	if (navUserNameEl) {
		const initials = (user?.name || 'U').toUpperCase().split(" ").map((i) => i.slice(0, 1)).join("");
		navUserNameEl.innerHTML = `<span>${initials}</span>`;
	}
})();
