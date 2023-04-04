import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { pixabayApi } from './pixabayApi';

const gallery = document.querySelector('.gallery');
const searchForm = document.querySelector('.search-form');
let page = 1;
let total = 40;
let query = '';
const options = {
  root: null,
  rootMargin: '600px',
  threshold: 1.0,
};
const observer = new IntersectionObserver(onLoad, options);
const guard = document.querySelector('.js-guard');

searchForm.addEventListener('submit', onSearch);

function onLoad(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      page += 1;
      pixabayApi(query, page).then(data => {
        let hits = data.hits.length;
        total += hits;
        Loading.standard();
        createMarkup(data);
        observer.observe(guard);
        if (total >= data.totalHits || data.hits.length < 40) {
          observer.unobserve(guard);
          total = 40;
        }
        Loading.remove(1000);
        lightbox.refresh();
      });
    }
  });
}

function onSearch(event) {
  event.preventDefault();

  query = event.currentTarget.elements.searchQuery.value.trim();
  if (!query) {
    Notify.warning('Please enter the query!');
    return;
  }
  fetchingCard(query);
  gallery.innerHTML = '';
  event.target.reset();
  page = 1;
}

function fetchingCard(request = 'cat', page = 1) {
  pixabayApi(request, page)
    .then(data => {
      const { totalHits } = data;
      Loading.standard();
      if (!totalHits) {
        Notify.warning(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        Loading.remove();
        return;
      }
      if (totalHits) {
        Notify.success(`Hooray! We found ${totalHits} images.`);
      }
      createMarkup(data);
      lightbox.refresh();
      if (data.totalHits > 40) {
        observer.observe(guard);
      }
      smoothScroll();
      Loading.remove(1000);
    })
    .catch(error => Notify.failure(error.message));
}

let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 300,
  nav: false,
  showCounter: false,
});

function createMarkup(data) {
  const markup = data.hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<div class="photo-card">
      <div class='photo'>
      <a href="${largeImageURL}"><img src="${webformatURL}" alt="" loading="lazy" /></a></div>
      <div class="info">
        <p class="info-item">
          <b>Likes: ${likes}</b>
        </p>
        <p class="info-item">
          <b>Views: ${views}</b>
        </p>
        <p class="info-item">
          <b>Comments: ${comments}</b>
        </p>
        <p class="info-item">
          <b>Downloads: ${downloads}</b>
        </p>
      </div>
    </div>`
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);
}

function smoothScroll() {
  const { height: cardHeight } =
    gallery.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: 100,
    behavior: 'smooth',
  });
}
