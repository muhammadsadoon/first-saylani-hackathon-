const userCreateNameEL = document.getElementById("user-create-name");
const userCreateNameShortEL = document.getElementById("user-create-name-short");

const user = JSON.parse(localStorage.getItem("user")) || { name: 'User' };

if (user?.name) {
	userCreateNameEL.innerHTML = user.name.toUpperCase();
	userCreateNameShortEL.innerHTML = user.name.toUpperCase().split(" ").map((i) => i.slice(0, 1)).join("");
} else {
	userCreateNameEL.innerHTML = 'User';
	userCreateNameShortEL.innerHTML = 'U';
}

// Also set navbar user avatar
const navUserNameEl = document.getElementById("user_name");
if (navUserNameEl) {
	const initials = (user?.name || 'U').toUpperCase().split(" ").map((i) => i.slice(0, 1)).join("");
	navUserNameEl.innerHTML = `<span>${initials}</span>`;
}

// Show a preview for an image URL (called via onchange in the HTML)
function previewImageURL(url) {
	const imagePreview = document.getElementById('imagePreview');
	imagePreview.innerHTML = '';
	if (!url) return;

	const img = document.createElement('img');
	img.src = url;
	img.alt = 'Preview image';
	img.style.maxWidth = '100%';
	img.className = 'rounded';

	const removeBtn = document.createElement('button');
	removeBtn.type = 'button';
	removeBtn.className = 'btn btn-sm btn-danger mt-2';
	removeBtn.innerHTML = '<i class="bi bi-trash"></i> Remove';
	removeBtn.onclick = function () {
		const input = document.getElementById('imageUpload');
		input.value = '';
		imagePreview.innerHTML = '';
	};

	imagePreview.appendChild(img);
	imagePreview.appendChild(document.createElement('br'));
	imagePreview.appendChild(removeBtn);
}

// Clear form fields and UI (called via onclick on the Clear button)
function clearForm() {
	const content = document.getElementById('postContent');
	const hashtags = document.getElementById('postHashtags');
	const imageInput = document.getElementById('imageUpload');

	if (content) content.value = '';
	if (hashtags) hashtags.value = '';
	if (imageInput) imageInput.value = '';
	const counter = document.getElementById('counterPostContent');
	if (counter) counter.innerHTML = '0';
	const imagePreview = document.getElementById('imagePreview');
	if (imagePreview) imagePreview.innerHTML = '';
}

// Create post (called via onclick on the Post button)
function createPost() {
	const contentEl = document.getElementById('postContent');
	const hashtagsEl = document.getElementById('postHashtags');
	const imageEl = document.getElementById('imageUpload');

	const content = contentEl ? contentEl.value.trim() : '';
	const hashtags = hashtagsEl ? hashtagsEl.value.trim() : '';
	const image = imageEl ? imageEl.value.trim() : '';

	if (!content) {
		Swal.fire({ icon: 'warning', text: 'Please enter some content for your post!' });
		return;
	}

	const posts = JSON.parse(localStorage.getItem('posts') || '[]');
	const post = {
		id: Date.now(),
		content,
		hashtags,
		image: image || null,
		user: user?.name || 'User',
		createdAt: new Date().toISOString(),
		likes: 0,
		liked: false
	};

	posts.unshift(post);
	localStorage.setItem('posts', JSON.stringify(posts));

	// Success toast/modal
	Swal.fire({ icon: 'success', title: 'Posted', text: 'Post created successfully!' });
	clearForm();
	// Update feed if available
	if (window.renderPosts) window.renderPosts();
}