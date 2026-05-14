import { getImagesByQuery } from './js/pixabay-api.js';
import { 
  createGallery, 
  clearGallery, 
  showLoader, 
  hideLoader, 
  showLoadMoreButton, 
  hideLoadMoreButton 
} from './js/render-functions.js';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('.form');
const loadMoreBtn = document.querySelector('.load-more-btn');

let currentPage = 1;
let currentQuery = '';
const perPage = 15;

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  currentQuery = event.currentTarget.elements.query.value.trim();

  if (!currentQuery) {
    iziToast.warning({ message: 'Please enter a search query', position: 'topRight' });
    return;
  }

  // Повний скид до дефолту при кожному новому сабміті
  currentPage = 1;
  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    hideLoader();

    if (data.hits.length === 0) {
      iziToast.error({
        message: 'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight'
      });
      return;
    }

    createGallery(data.hits);

    // Логіка кінця колекції (якщо зображень мало і вони вмістилися на 1-у сторінку)
    const totalPages = Math.ceil(data.totalHits / perPage);
    if (currentPage >= totalPages) {
      hideLoadMoreButton();
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight'
      });
    } else {
      showLoadMoreButton();
    }

  } catch (error) {
    hideLoader();
    iziToast.error({ message: 'Something went wrong. Please try again later.', position: 'topRight' });
  } finally {
    form.reset();
  }
});

// Клік по кнопці "Load more"
loadMoreBtn.addEventListener('click', async () => {
  currentPage += 1;
  
  hideLoadMoreButton(); // Ховаємо кнопку на час запиту
  showLoader(); // Індикатор завантаження під галереєю

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    hideLoader();

    createGallery(data.hits);

    // --- ПЛАВНИЙ СКРОЛ ЗА ТЗ МЕНТОРА ---
    const galleryItem = document.querySelector('.gallery-item');
    if (galleryItem) {
      const cardHeight = galleryItem.getBoundingClientRect().height;
      window.scrollBy({
        top: cardHeight * 2, // Строго на дві висоти карточки галереї
        behavior: 'smooth',
      });
    }

    // Перевірка на максимальну кількість сторінок
    const totalPages = Math.ceil(data.totalHits / perPage);
    if (currentPage >= totalPages) {
      hideLoadMoreButton(); // Кнопка повністю зникає
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight'
      });
    } else {
      showLoadMoreButton(); // Якщо є наступна сторінка — повертаємо кнопку
    }

  } catch (error) {
    hideLoader();
    iziToast.error({ message: 'Failed to load more images.', position: 'topRight' });
  }
});
