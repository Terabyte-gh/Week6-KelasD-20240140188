'use strict';

const API_URL = 'https://dummyjson.com/products';

// Interaksi visual bertema Persona 3: kilatan diagonal saat tombol ditekan,
// serta transisi sapuan biru ketika navigasi menuju bagian lain halaman.
const uiTransition = document.querySelector('.ui-transition');

document.addEventListener('click', (event) => {
  const control = event.target.closest('button, a[href^="#"]');
  if (!control || control.matches(':disabled')) return;

  control.classList.remove('is-triggered');
  // Memaksa browser mengulang animasi saat kontrol yang sama ditekan lagi.
  void control.offsetWidth;
  control.classList.add('is-triggered');

  if (control.matches('a[href^="#"]') && uiTransition) {
    uiTransition.classList.remove('play');
    void uiTransition.offsetWidth;
    uiTransition.classList.add('play');
  }
});

document.addEventListener('animationend', (event) => {
  if (event.animationName === 'p3-button-sweep') {
    event.target.classList.remove('is-triggered');
  }
  if (event.animationName === 'p3-screen-swipe' && uiTransition) {
    uiTransition.classList.remove('play');
  }
});


// Elemen untuk bagian Fetch API.
const productGrid = document.querySelector('#productGrid');
const productStatus = document.querySelector('#productStatus');
const productCount = document.querySelector('#productCount');
const productSearch = document.querySelector('#productSearch');
const reloadProductsButton = document.querySelector('#reloadProducts');
const retryProductsButton = document.querySelector('#retryProducts');
const productError = document.querySelector('#productError');

let products = [];

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

function setProductLoading(isLoading) {
  productGrid.setAttribute('aria-busy', String(isLoading));
  reloadProductsButton.disabled = isLoading;
  reloadProductsButton.textContent = isLoading ? 'Memuat...' : '↻ Muat ulang';
}

function showProductSkeletons() {
  productGrid.replaceChildren();
  for (let i = 0; i < 8; i += 1) {
    const skeleton = document.createElement('div');
    skeleton.className = 'product-card-skeleton';
    skeleton.setAttribute('aria-hidden', 'true');
    productGrid.append(skeleton);
  }
}

function createProductCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';

  const imageWrap = document.createElement('div');
  imageWrap.className = 'product-image-wrap';

  const image = document.createElement('img');
  image.className = 'product-image';
  image.src = product.thumbnail;
  image.alt = product.title;
  image.loading = 'lazy';
  image.addEventListener('error', () => {
    image.remove();
    const fallback = document.createElement('span');
    fallback.className = 'product-image-fallback';
    fallback.textContent = 'Gambar tidak tersedia';
    imageWrap.append(fallback);
  }, { once: true });
  imageWrap.append(image);

  const body = document.createElement('div');
  body.className = 'product-body';

  const category = document.createElement('p');
  category.className = 'product-category';
  category.textContent = product.category || 'Produk';

  const title = document.createElement('h3');
  title.className = 'product-title';
  title.textContent = product.title;

  const priceRow = document.createElement('div');
  priceRow.className = 'product-price-row';

  const price = document.createElement('span');
  price.className = 'product-price';
  price.textContent = usdFormatter.format(product.price);

  const rating = document.createElement('span');
  rating.className = 'product-rating';
  rating.textContent = `★ ${Number(product.rating || 0).toFixed(1)}`;
  rating.setAttribute('aria-label', `Rating ${Number(product.rating || 0).toFixed(1)} dari 5`);

  priceRow.append(price, rating);
  body.append(category, title, priceRow);
  card.append(imageWrap, body);
  return card;
}

function renderProducts(list) {
  productGrid.replaceChildren();

  if (list.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'status-message';
    emptyMessage.textContent = 'Produk tidak ditemukan. Coba kata kunci lain.';
    productGrid.append(emptyMessage);
    productCount.textContent = '0 produk ditampilkan';
    return;
  }

  const fragment = document.createDocumentFragment();
  list.forEach((product) => fragment.append(createProductCard(product)));
  productGrid.append(fragment);
  productCount.textContent = `${list.length} produk ditampilkan`;
}

function filterProducts() {
  const keyword = productSearch.value.trim().toLocaleLowerCase('id-ID');
  const filteredProducts = products.filter((product) =>
    product.title.toLocaleLowerCase('id-ID').includes(keyword)
  );
  renderProducts(filteredProducts);
}

async function loadProducts() {
  setProductLoading(true);
  productError.hidden = true;
  productStatus.textContent = 'Sedang mengambil data produk dari API...';
  productCount.textContent = 'Memuat data...';
  showProductSkeletons();

  try {
    // Fetch API mengambil response, lalu response diolah menjadi JSON.
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Permintaan gagal dengan status ${response.status}.`);
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.products)) {
      throw new Error('Format data dari API tidak sesuai.');
    }

    products = data.products;
    productStatus.textContent = `Berhasil mengambil ${products.length} produk dari DummyJSON.`;
    filterProducts();
  } catch (error) {
    products = [];
    productGrid.replaceChildren();
    productStatus.textContent = 'Terjadi masalah saat mengambil data produk.';
    productCount.textContent = 'Data belum tersedia';
    productError.hidden = false;
    console.error('Gagal memuat produk:', error);
  } finally {
    setProductLoading(false);
  }
}

productSearch.addEventListener('input', filterProducts);
reloadProductsButton.addEventListener('click', loadProducts);
retryProductsButton.addEventListener('click', loadProducts);

// Mulai mengambil data ketika halaman selesai diproses browser.
loadProducts();

// Elemen untuk bagian DOM dan Event Handling pada form.
const registrationForm = document.querySelector('#registrationForm');
const fullNameInput = document.querySelector('#fullName');
const emailInput = document.querySelector('#email');
const studySessionInput = document.querySelector('#studySession');
const reasonInput = document.querySelector('#reason');
const reasonCount = document.querySelector('#reasonCount');
const formFeedback = document.querySelector('#formFeedback');
const submissionResult = document.querySelector('#submissionResult');
const resultName = document.querySelector('#resultName');
const resultDetails = document.querySelector('#resultDetails');
const resultReason = document.querySelector('#resultReason');
const resetFormButton = document.querySelector('#resetForm');

function showFormFeedback(message, type) {
  formFeedback.textContent = message;
  formFeedback.className = `form-feedback ${type}`;
  formFeedback.hidden = false;
}

function clearFormFeedback() {
  formFeedback.textContent = '';
  formFeedback.className = 'form-feedback';
  formFeedback.hidden = true;
}

function setInvalid(element, isInvalid) {
  if (isInvalid) {
    element.setAttribute('aria-invalid', 'true');
  } else {
    element.removeAttribute('aria-invalid');
  }
}

function validateForm() {
  const fullName = fullNameInput.value.trim();
  const email = emailInput.value.trim();
  const studySession = studySessionInput.value;
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const nameIsValid = fullName.length >= 3;
  setInvalid(fullNameInput, !nameIsValid);
  setInvalid(emailInput, !emailIsValid);
  setInvalid(studySessionInput, !studySession);

  if (!nameIsValid) {
    fullNameInput.focus();
    return 'Nama lengkap wajib diisi minimal 3 karakter.';
  }
  if (!emailIsValid) {
    emailInput.focus();
    return 'Masukkan alamat email dengan format yang benar.';
  }
  if (!studySession) {
    studySessionInput.focus();
    return 'Silakan pilih sesi study group terlebih dahulu.';
  }
  return '';
}

// Event input: update penghitung karakter dan bersihkan tanda validasi.
reasonInput.addEventListener('input', () => {
  reasonCount.textContent = `${reasonInput.value.length}/200`;
});

[fullNameInput, emailInput, studySessionInput].forEach((element) => {
  element.addEventListener('input', () => {
    setInvalid(element, false);
    clearFormFeedback();
  });
  element.addEventListener('change', () => {
    setInvalid(element, false);
    clearFormFeedback();
  });
});

// Event submit: cegah reload halaman, validasi input, lalu tampilkan hasil ke DOM.
registrationForm.addEventListener('submit', (event) => {
  event.preventDefault();
  clearFormFeedback();
  submissionResult.hidden = true;

  const validationMessage = validateForm();
  if (validationMessage) {
    showFormFeedback(validationMessage, 'error');
    return;
  }

  const fullName = fullNameInput.value.trim();
  const email = emailInput.value.trim();
  const studySession = studySessionInput.value;
  const reason = reasonInput.value.trim();

  resultName.textContent = fullName;
  resultDetails.textContent = `${email} · Sesi: ${studySession}`;
  resultReason.textContent = reason ? `Alasan: ${reason}` : 'Tidak ada alasan tambahan yang ditulis.';
  submissionResult.hidden = false;
  showFormFeedback('Validasi berhasil. Data pendaftaran berhasil diproses di browser!', 'success');
});

resetFormButton.addEventListener('click', () => {
  registrationForm.reset();
  submissionResult.hidden = true;
  clearFormFeedback();
  reasonCount.textContent = '0/200';
  [fullNameInput, emailInput, studySessionInput].forEach((element) => setInvalid(element, false));
  fullNameInput.focus();
});
