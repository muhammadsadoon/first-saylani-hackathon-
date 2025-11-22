// Render posts feed from localStorage (key: 'posts')
function timeAgo(iso) {
	const d = new Date(iso);
	const now = new Date();
	const sec = Math.floor((now - d) / 1000);
	if (sec < 60) return sec + 's';
	const min = Math.floor(sec / 60);
	if (min < 60) return min + 'm';
	const hr = Math.floor(min / 60);
	if (hr < 24) return hr + 'h';
	const days = Math.floor(hr / 24);
	return days + 'd';
}

function renderPosts(filters = {}) {
	const container = document.getElementById('postsFeed');
	if (!container) return;

	// read stored posts (may be empty)
	const storedPosts = JSON.parse(localStorage.getItem('posts') || '[]');
	let posts = storedPosts && storedPosts.length ? storedPosts.slice() : [];

	// If no posts, create a sample post for demo (do not overwrite storage)
	if (!posts || posts.length === 0) {
		posts = [
			{
				id: 'sample-1',
				user: 'Social Book',
				content: 'Welcome to Social Book! Create a post using the Create Post page. This is a sample post to show the feed layout.',
				hashtags: '#welcome #social',
				image: 'https://picsum.photos/600/300',
				createdAt: new Date().toISOString(),
				likes: 0,
				liked: false,
				comments: []
			}
		];
	}

	// populate user filter from actual stored posts (not sample)
	populateUserFilter(storedPosts || []);

	// Apply filters (search text and user)
	let sortOrder = (filters && filters.sort) || 'newest';
	if (filters) {
		const search = (filters.search || '').toString().trim().toLowerCase();
		const userFilter = (filters.user || 'all').toString();
		if (search) {
			posts = posts.filter(p => {
				const content = (p.content || '').toString().toLowerCase();
				const user = (p.user || '').toString().toLowerCase();
				const tags = (p.hashtags || '').toString().toLowerCase();
				return content.includes(search) || user.includes(search) || tags.includes(search);
			});
		}
		if (userFilter && userFilter !== 'all') {
			posts = posts.filter(p => String(p.user) === String(userFilter));
		}
		// allow explicit sort override via filters.sort
		sortOrder = (filters.sort || sortOrder).toString();
	}

	// Sort posts by createdAt (newest/oldest)
	posts.sort((a, b) => {
		const ta = a && a.createdAt ? Date.parse(a.createdAt) : 0;
		const tb = b && b.createdAt ? Date.parse(b.createdAt) : 0;
		if (sortOrder === 'oldest') return ta - tb;
		return tb - ta; // newest first default
	});

	container.innerHTML = '';

	posts.forEach(post => {
		const card = document.createElement('div');
		card.className = 'card shadow-sm';

		const body = document.createElement('div');
		body.className = 'card-body';

		// header: avatar, name, time
		const header = document.createElement('div');
		header.className = 'd-flex align-items-center mb-3';

		const avatar = document.createElement('div');
		avatar.className = 'bg-light-subtle text-dark align-items-center rounded-circle d-flex align-items-center justify-content-center me-3';
		avatar.style.width = '48px';
		avatar.style.height = '48px';
		const initials = (post.user || 'U').split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase();
		avatar.textContent = initials;

		const meta = document.createElement('div');
		const nameEl = document.createElement('div');
		nameEl.className = 'fw-bold';
		nameEl.textContent = post.user || 'User';
		const timeEl = document.createElement('small');
		timeEl.className = 'text-muted d-block';
		timeEl.textContent = timeAgo(post.createdAt) + ' • ' + (post.hashtags || '');

		meta.appendChild(nameEl);
		meta.appendChild(timeEl);

		header.appendChild(avatar);
		header.appendChild(meta);

		body.appendChild(header);

		// content
		const contentEl = document.createElement('p');
		contentEl.className = 'card-text';
		contentEl.textContent = post.content || '';
		body.appendChild(contentEl);

		// image (if any)
		if (post.image) {
			const imgWrap = document.createElement('div');
			imgWrap.className = 'mb-3';
			const img = document.createElement('img');
			img.src = post.image;
			img.alt = 'post image';
			img.className = 'img-fluid rounded';
			imgWrap.appendChild(img);
			body.appendChild(imgWrap);
		}

		// actions
		const actions = document.createElement('div');
		actions.className = 'd-flex gap-3';
		const like = document.createElement('button');
		like.type = 'button';
		const likesCount = post.likes || 0;
		const isLiked = !!post.liked;
		like.className = isLiked ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-outline-primary';
		like.innerHTML = `<i class="bi ${isLiked ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'}"></i> ${likesCount}`;
		// Toggle like: update localStorage and re-render
		like.onclick = function () {
			const stored = JSON.parse(localStorage.getItem('posts') || '[]');
			const idx = stored.findIndex(p => String(p.id) === String(post.id));
			if (idx === -1) return;
			if (stored[idx].liked) {
				stored[idx].likes = Math.max(0, (stored[idx].likes || 0) - 1);
				stored[idx].liked = false;
			} else {
				stored[idx].likes = (stored[idx].likes || 0) + 1;
				stored[idx].liked = true;
			}
			localStorage.setItem('posts', JSON.stringify(stored));
			renderPosts();
		};
		const comment = document.createElement('button');
		comment.type = 'button';
		const commentsCount = (post.comments || []).length;
		comment.className = 'btn btn-sm btn-outline-secondary';
		comment.innerHTML = `<i class="bi bi-chat"></i> ${commentsCount}`;

		const share = document.createElement('button');
		share.type = 'button';
		share.className = 'btn btn-sm btn-outline-success';
		share.innerHTML = '<i class="bi bi-share"></i> Share';

		// Delete button (only visible to post owner)
		const deleteBtn = document.createElement('button');
		deleteBtn.type = 'button';
		deleteBtn.className = 'btn btn-sm btn-outline-danger';
		deleteBtn.innerHTML = '<i class="bi bi-trash"></i> Delete';

		// determine current user (name) to control delete visibility
		const currentUser = (JSON.parse(localStorage.getItem('user') || 'null') || { name: '' }).name;
		if (currentUser && String(currentUser) !== String(post.user)) {
			// Not the owner -> hide delete button
			deleteBtn.style.display = 'none';
		}

		// Delete handler: confirm and remove from localStorage
		deleteBtn.onclick = function () {
			if (!confirm('Are you sure you want to delete this post?')) return;
			const stored = JSON.parse(localStorage.getItem('posts') || '[]');
			const filtered = stored.filter(p => String(p.id) !== String(post.id));
			localStorage.setItem('posts', JSON.stringify(filtered));
			// re-render feed after deletion
			renderPosts();
		};

		actions.appendChild(like);
		actions.appendChild(comment);
		actions.appendChild(share);
		actions.appendChild(deleteBtn);

		body.appendChild(actions);

		// Comments section (hidden by default)
		const commentsSection = document.createElement('div');
		commentsSection.className = 'mt-3';
		commentsSection.style.display = 'none';

		const commentsList = document.createElement('div');
		commentsList.className = 'list-group mb-2';
		(post.comments || []).forEach(c => {
			const item = document.createElement('div');
			item.className = 'list-group-item p-2';
			const who = document.createElement('div');
			who.className = 'fw-bold small mb-1';
			who.textContent = c.user || 'User';
			const text = document.createElement('div');
			text.className = 'small';
			text.textContent = c.text;
			item.appendChild(who);
			item.appendChild(text);
			commentsList.appendChild(item);
		});

		// Comment input
		const inputGroup = document.createElement('div');
		inputGroup.className = 'input-group input-group-sm';
		const commentInput = document.createElement('input');
		commentInput.type = 'text';
		commentInput.className = 'form-control';
		commentInput.placeholder = 'Write a comment...';
		const commentBtnWrap = document.createElement('button');
		commentBtnWrap.type = 'button';
		commentBtnWrap.className = 'btn btn-primary';
		commentBtnWrap.innerHTML = 'Post';

		inputGroup.appendChild(commentInput);
		inputGroup.appendChild(commentBtnWrap);

		commentsSection.appendChild(commentsList);
		commentsSection.appendChild(inputGroup);

		body.appendChild(commentsSection);

		// Toggle comments visibility
		comment.onclick = function () {
			const open = commentsSection.style.display === 'block';
			commentsSection.style.display = open ? 'none' : 'block';
			comment.className = open ? 'btn btn-sm btn-outline-secondary' : 'btn btn-sm btn-secondary';
		};

		// Post a comment: persist to localStorage and re-render
		commentBtnWrap.onclick = function () {
			const text = (commentInput.value || '').trim();
			if (!text) {
				Swal.fire({ icon: 'warning', text: 'Please enter a comment' });
				return;
			}
			const stored = JSON.parse(localStorage.getItem('posts') || '[]');
			const idx = stored.findIndex(p => String(p.id) === String(post.id));
			if (idx === -1) {
				Swal.fire({ icon: 'error', text: 'Post not found' });
				return;
			}
			stored[idx].comments = stored[idx].comments || [];
			stored[idx].comments.push({ id: Date.now(), text, user: (JSON.parse(localStorage.getItem('user') || 'null') || { name: 'User' }).name, createdAt: new Date().toISOString() });
			localStorage.setItem('posts', JSON.stringify(stored));
			// re-render the feed to show the new comment
			renderPosts();
		};

		card.appendChild(body);
		container.appendChild(card);
	});
}

// Render on load
function populateHero() {
	const heroName = document.getElementById('heroUserName');
	const heroAvatar = document.getElementById('heroAvatar');
	const user = JSON.parse(localStorage.getItem('user')) || { name: 'User' };
	const displayName = (user.name || 'User').split(' ')[0];
	const initials = (user.name || 'User').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();
	if (heroName) heroName.textContent = displayName;
	if (heroAvatar) heroAvatar.textContent = initials;
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', function () {
		populateHero();
		renderPosts();
	});
} else {
	populateHero();
	renderPosts();
}

// expose renderPosts so other scripts can trigger a refresh (used by create-post.js)
window.renderPosts = renderPosts;

// Populate user filter select with unique users
function populateUserFilter(postsArray) {
	const sel = document.getElementById('filterUser');
	if (!sel) return;
	const users = Array.from(new Set((postsArray || []).map(p => p.user).filter(Boolean)));
	// Keep current selection
	const cur = sel.value || 'all';
	sel.innerHTML = '<option value="all">All users</option>';
	users.forEach(u => {
		const opt = document.createElement('option');
		opt.value = u;
		opt.textContent = u;
		sel.appendChild(opt);
	});
	if ([...sel.options].some(o => o.value === cur)) sel.value = cur; else sel.value = 'all';
}

// Read filter UI and call renderPosts with filters
function applyPostFilter() {
	const search = (document.getElementById('postSearchInput') || {}).value || '';
	const user = (document.getElementById('filterUser') || {}).value || 'all';
	const sort = (document.getElementById('sortOrder') || {}).value || 'newest';
	renderPosts({ search, user, sort });
}

window.applyPostFilter = applyPostFilter;
