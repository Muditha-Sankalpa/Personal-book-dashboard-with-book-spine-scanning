const photoInput = document.getElementById('photo-input');
const titleInput = document.getElementById('title-input');
const authorInput = document.getElementById('author-input');
const startedInput = document.getElementById('started-input');
const finishedInput = document.getElementById('finished-input');
const ratingPicker = document.getElementById('rating-picker');
const ratingStars = ratingPicker.querySelectorAll('.star');
const canvasWrap = document.getElementById('canvas-wrap');
const canvas = document.getElementById('source-canvas');
const ctx = canvas.getContext('2d');
const cropBtn = document.getElementById('crop-btn');
const resetBtn = document.getElementById('reset-btn');
const cropHint = document.getElementById('crop-hint');
const statusMsg = document.getElementById('status-msg');
const shelfTree = document.getElementById('shelf-tree');
const emptyMsg = document.getElementById('empty-msg');
const searchInput = document.getElementById('search-input');
const sortInput = document.getElementById('sort-input');
const genreInput = document.getElementById('genre-input');
const genreChipsEl = document.getElementById('genre-chips');
const shelfCountEl = document.getElementById('shelf-count');

const GENRE_COLORS = {
  'Fiction': '#7f77dd',
  'Non-fiction': '#1d9e75',
  'Sci-Fi': '#378add',
  'Biography': '#ba7517',
  'Mystery': '#d85a30',
  'Other': '#888780'
};

let allBooks = [];
let activeGenre = null;
let selectedRating = 0;
const seenIds = new Set();

const modalOverlay = document.getElementById('book-modal');
const modalClose = document.getElementById('modal-close');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalAuthor = document.getElementById('modal-author');
const modalGenre = document.getElementById('modal-genre');
const modalRating = document.getElementById('modal-rating');
const modalDates = document.getElementById('modal-dates');

// ---------- Shelf geometry constants (tune these to reshape the tree) ----------
const BRANCH_ANGLE_DEG = -22;
const BRANCH_LENGTH = 260;
const ROW_SPACING = 100;
const ROW_START_Y = 115;
const TRUNK_LEFT = 30;
const BOOK_SPACING = 40;
const BOOK_START_OFFSET = 20;
const BOOKS_PER_ROW = Math.floor((BRANCH_LENGTH - BOOK_START_OFFSET - 40) / BOOK_SPACING);

let loadedImage = null;
let selection = null;
let dragging = false;
let dragStart = null;

// ---------- Star rating picker (in the add-book form) ----------

function paintRatingPicker() {
  ratingStars.forEach((star) => {
    const value = Number(star.dataset.value);
    star.classList.toggle('filled', value <= selectedRating);
  });
}

ratingStars.forEach((star) => {
  star.addEventListener('click', () => {
    const value = Number(star.dataset.value);
    selectedRating = (selectedRating === value) ? 0 : value;
    paintRatingPicker();
  });
});

// ---------- Step 1: load the chosen/captured photo onto the canvas ----------

photoInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      loadedImage = img;
      const maxWidth = 640;
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvasWrap.classList.remove('hidden');
      cropHint.classList.remove('hidden');
      cropBtn.classList.remove('hidden');
      resetBtn.classList.remove('hidden');
      selection = null;
      setStatus('', false);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

// ---------- Step 2: let the user drag a crop rectangle on the canvas ----------

function getCanvasPos(evt) {
  const rect = canvas.getBoundingClientRect();
  const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
  const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top) * (canvas.height / rect.height)
  };
}

function redrawWithSelection() {
  ctx.drawImage(loadedImage, 0, 0, canvas.width, canvas.height);
  if (selection) {
    ctx.strokeStyle = '#d85a30';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(selection.x, selection.y, selection.w, selection.h);
    ctx.setLineDash([]);
  }
}

function startDrag(evt) {
  if (!loadedImage) return;
  dragging = true;
  dragStart = getCanvasPos(evt);
}

function moveDrag(evt) {
  if (!dragging) return;
  const pos = getCanvasPos(evt);
  selection = {
    x: Math.min(dragStart.x, pos.x),
    y: Math.min(dragStart.y, pos.y),
    w: Math.abs(pos.x - dragStart.x),
    h: Math.abs(pos.y - dragStart.y)
  };
  redrawWithSelection();
}

function endDrag() {
  dragging = false;
}

canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mousemove', moveDrag);
window.addEventListener('mouseup', endDrag);

canvas.addEventListener('touchstart', startDrag);
canvas.addEventListener('touchmove', moveDrag);
window.addEventListener('touchend', endDrag);

// ---------- Step 3: crop the selected region and submit it ----------

cropBtn.addEventListener('click', async () => {
  if (!loadedImage) {
    setStatus('Choose a photo first.', false);
    return;
  }
  if (!selection || selection.w < 10 || selection.h < 10) {
    setStatus('Drag a rectangle over the spine first.', false);
    return;
  }

  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = selection.w;
  cropCanvas.height = selection.h;
  const cropCtx = cropCanvas.getContext('2d');
  cropCtx.drawImage(
    canvas,
    selection.x, selection.y, selection.w, selection.h,
    0, 0, selection.w, selection.h
  );
  const croppedDataUrl = cropCanvas.toDataURL('image/jpeg', 0.85);

  cropBtn.disabled = true;
  setStatus('Saving to your shelf...', true);

  try {
    const response = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: titleInput.value.trim(),
        author: authorInput.value.trim(),
        genre: genreInput.value,
        startedDate: startedInput.value,
        finishedDate: finishedInput.value,
        rating: selectedRating,
        imageData: croppedDataUrl
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add book');
    }

    setStatus('Added to your shelf.', true);
    resetForm();
    await loadShelf();
  } catch (err) {
    setStatus(err.message, false);
  } finally {
    cropBtn.disabled = false;
  }
});

resetBtn.addEventListener('click', resetForm);

function resetForm() {
  loadedImage = null;
  selection = null;
  photoInput.value = '';
  titleInput.value = '';
  genreInput.value = 'Other';
  authorInput.value = '';
  startedInput.value = '';
  finishedInput.value = '';
  selectedRating = 0;
  paintRatingPicker();
  canvasWrap.classList.add('hidden');
  cropHint.classList.add('hidden');
  cropBtn.classList.add('hidden');
  resetBtn.classList.add('hidden');
}

function setStatus(message, isSuccess) {
  statusMsg.textContent = message;
  statusMsg.classList.toggle('success', isSuccess);
}

// ---------- Step 4: load and render the shelf ----------

async function loadShelf() {
  try {
    const response = await fetch('/api/books');
    allBooks = await response.json();
    renderGenreChips();
    applyFiltersAndRender();
  } catch (err) {
    console.error('Failed to load shelf', err);
  }
}

function renderGenreChips() {
  const genresPresent = [...new Set(allBooks.map((b) => b.genre || 'Other'))];
  genreChipsEl.innerHTML = '';

  if (genresPresent.length === 0) return;

  const allChip = document.createElement('button');
  allChip.type = 'button';
  allChip.className = 'genre-chip' + (activeGenre === null ? ' active' : '');
  allChip.textContent = 'All genres';
  if (activeGenre === null) allChip.style.background = '#3c3489';
  allChip.addEventListener('click', () => {
    activeGenre = null;
    renderGenreChips();
    applyFiltersAndRender();
  });
  genreChipsEl.appendChild(allChip);

  genresPresent.forEach((genre) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    const isActive = activeGenre === genre;
    chip.className = 'genre-chip' + (isActive ? ' active' : '');
    chip.textContent = genre;
    if (isActive) chip.style.background = GENRE_COLORS[genre] || GENRE_COLORS.Other;
    chip.addEventListener('click', () => {
      activeGenre = isActive ? null : genre;
      renderGenreChips();
      applyFiltersAndRender();
    });
    genreChipsEl.appendChild(chip);
  });
}

function applyFiltersAndRender() {
  const query = searchInput.value.trim().toLowerCase();
  const sortMode = sortInput.value;

  let filtered = allBooks.filter((book) => {
    const matchesQuery = !query || book.title.toLowerCase().includes(query);
    const matchesGenre = !activeGenre || book.genre === activeGenre;
    return matchesQuery && matchesGenre;
  });

  if (sortMode === 'az') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortMode === 'oldest') {
    filtered.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
  } else {
    filtered.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
  }
  // filtered is already in the order we want to display, left to right -
  // no extra reversal needed (this used to double-flip "oldest" back to
  // newest-first, which was the actual sort bug).
  const shelfOrder = filtered;

  shelfCountEl.textContent = allBooks.length === 0
    ? ''
    : `Showing ${filtered.length} of ${allBooks.length} book${allBooks.length === 1 ? '' : 's'}`;

  renderShelf(shelfOrder);
}

searchInput.addEventListener('input', applyFiltersAndRender);
sortInput.addEventListener('change', applyFiltersAndRender);

function renderShelf(ordered) {
  emptyMsg.classList.toggle('hidden', allBooks.length > 0);

  shelfTree.innerHTML = '';

  let noResultsMsg = document.getElementById('no-results-msg');
  if (allBooks.length > 0 && ordered.length === 0) {
    if (!noResultsMsg) {
      noResultsMsg = document.createElement('p');
      noResultsMsg.id = 'no-results-msg';
      noResultsMsg.className = 'no-results';
      shelfCountEl.insertAdjacentElement('afterend', noResultsMsg);
    }
    noResultsMsg.textContent = 'No books match your search or filter.';
  } else if (noResultsMsg) {
    noResultsMsg.remove();
  }

  const rowsNeeded = Math.max(3, Math.ceil(ordered.length / BOOKS_PER_ROW) || 3);
  const treeHeight = ROW_START_Y + (rowsNeeded - 1) * ROW_SPACING + 150;
  shelfTree.style.height = treeHeight + 'px';

  const trunk = document.createElement('div');
  trunk.className = 'trunk';
  trunk.style.height = (treeHeight - 40) + 'px';
  shelfTree.appendChild(trunk);

  const base = document.createElement('div');
  base.className = 'base-plank';
  base.style.top = (treeHeight - 30) + 'px';
  shelfTree.appendChild(base);

  const branchEls = [];
  for (let row = 0; row < rowsNeeded; row++) {
    const branch = document.createElement('div');
    branch.className = 'branch';
    branch.style.left = TRUNK_LEFT + 'px';
    branch.style.top = (ROW_START_Y + row * ROW_SPACING) + 'px';
    branch.style.transform = `rotate(${BRANCH_ANGLE_DEG}deg)`;
    shelfTree.appendChild(branch);
    branchEls.push(branch);
  }

  ordered.forEach((book, index) => {
    const row = Math.min(Math.floor(index / BOOKS_PER_ROW), rowsNeeded - 1);
    const posInRow = index % BOOKS_PER_ROW;

    const spine = document.createElement('div');
    spine.className = 'book-spine';
    if (!seenIds.has(book.id)) {
      spine.classList.add('appearing');
      spine.style.animationDelay = (posInRow * 0.05) + 's';
      seenIds.add(book.id);
    }
    spine.style.left = (BOOK_START_OFFSET + posInRow * BOOK_SPACING) + 'px';
    spine.style.backgroundImage = `url(${book.imageData})`;
    spine.title = `${book.title} (${book.genre || 'Other'})`;
    spine.addEventListener('click', () => openModal(book));

    const genreTag = document.createElement('div');
    genreTag.className = 'genre-tag';
    genreTag.style.background = GENRE_COLORS[book.genre] || GENRE_COLORS.Other;
    spine.appendChild(genreTag);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '\u00d7';
    deleteBtn.title = 'Remove book';
    deleteBtn.addEventListener('click', (evt) => {
      evt.stopPropagation();
      removeWithAnimation(spine, book.id);
    });

    spine.appendChild(deleteBtn);
    branchEls[row].appendChild(spine);
  });
}

function removeWithAnimation(spineEl, id) {
  spineEl.classList.add('removing');
  setTimeout(() => deleteBook(id), 220);
}

async function deleteBook(id) {
  try {
    const response = await fetch(`/api/books/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to remove book');
    await loadShelf();
  } catch (err) {
    console.error(err);
  }
}

// ---------- Step 5: full detail modal ----------

function formatDate(isoDate) {
  if (!isoDate) return null;
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function openModal(book) {
  modalImage.src = book.imageData;
  modalImage.alt = book.title;
  modalTitle.textContent = book.title;
  modalAuthor.textContent = book.author ? `by ${book.author}` : 'Author unknown';

  modalGenre.textContent = book.genre || 'Other';
  modalGenre.style.background = GENRE_COLORS[book.genre] || GENRE_COLORS.Other;

  modalRating.innerHTML = '';
  const rating = book.rating || 0;
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.className = 'star' + (i <= rating ? ' filled' : '');
    star.textContent = '\u2605';
    modalRating.appendChild(star);
  }

  const started = formatDate(book.startedDate);
  const finished = formatDate(book.finishedDate);
  if (started && finished) {
    modalDates.textContent = `Read ${started} - ${finished}`;
  } else if (started) {
    modalDates.textContent = `Started ${started} - currently reading`;
  } else {
    modalDates.textContent = 'Reading dates not recorded';
  }

  modalOverlay.classList.remove('hidden');
  requestAnimationFrame(() => modalOverlay.classList.add('open'));
}

function closeModal() {
  modalOverlay.classList.remove('open');
  setTimeout(() => modalOverlay.classList.add('hidden'), 250);
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (evt) => {
  if (evt.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (evt) => {
  if (evt.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal();
});

loadShelf();
