'use strict'
import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";

import "simplelightbox/dist/simple-lightbox.min.css";
import SimpleLightbox from "simplelightbox";

import axios from "axios";

const form = document.querySelector("form");
const imagesContainer = document.querySelector(".images");
const loader = document.querySelector(".loader");
const loadMoreBtn = document.querySelector(".load-more");

// create axios instance
const instance = axios.create({
    method: 'get',
    baseURL: 'https://pixabay.com/api/',
    params: {
        key: '41610080-031e2cebad3f84a1c0bee486b',
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 40,
    }
});

// pages
let page = 1;
const pageOfQuery = () => {
    page++;

}

// make gallery for SimpleLightbox
let gallery = new SimpleLightbox(".images a", {
    captionsData: 'alt',
    captionDelay: 250
});

// create value for search
let value;

form.addEventListener('submit', async event => {
    event.preventDefault();

    // reset pages
    page = 1;

    // reset imagesContainer
    imagesContainer.innerHTML = '';

    // show loader
    loader.style.display = 'block';

    // set query parametrs
    value = event.target.elements.search.value;

    // render images or show error
    try {
        const images = await instance({
            params: {
                q: value,
                page,
            }
        });
        console.log(images.data.total);
        innerImages(images.data);
    } catch (error) {
        showUnfindError();
    }

    // reset form and loader
    loader.style.display = 'none';
    form.reset();
});



loadMoreBtn.addEventListener('click', async () => {
    // next page
    pageOfQuery();

    // inner more images
    try {
        const images = await instance({
            params: {
                q: value,
                page,
            }
        });

        addImages(images.data);

        // scroll page 
        scrollPage();
    } catch (error) {
        showEmptyError();

        // scroll page 
        scrollPage();
    }


});

const makeHTMLToInner = images => {
    return images.hits.map(({ largeImageURL, webformatURL, tags, likes, views, comments, downloads }) => `
    <li class="img">
       <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}"></a>
      <ul class="img-info">
        <li class="img-info-item"><span>Likes</span> ${likes}</li>
        <li class="img-info-item"><span>Views</span> ${views}</li>
        <li class="img-info-item"><span>Comments</span> ${comments}</li>
        <li class="img-info-item"><span>Downloads</span> ${downloads}</li>
      </ul>
    </li>`).join('');
}

// inner HTML

const innerImages = images => {
    if (images.hits.length === 0) throw new Error(images.status);

    imagesContainer.innerHTML = makeHTMLToInner(images);

    // show btn Load more
    loadMoreBtn.style.display = "block";

    // check if the server isn't empty
    if (Math.ceil(images.total / 40) <= page) {
        showEmptyError();
    }

    // refresh gallery for simpleLightBox
    gallery.refresh();
}

const addImages = images => {
    if (Math.ceil(images.total / 40) <= page) {
        // check if the server isn't empty
        imagesContainer.insertAdjacentHTML('beforeend', makeHTMLToInner(images));
        // refresh gallery for simpleLightBox
        gallery.refresh();

        throw new Error(images.status);
    }

    imagesContainer.insertAdjacentHTML('beforeend', makeHTMLToInner(images));

    // refresh gallery for simpleLightBox
    gallery.refresh();
}

// errors

const showUnfindError = () => {
    iziToast.show({
        message: `Sorry, there are no images matching your search query. Please try again!`,
        maxWidth: 432,
        iconUrl: './images/error-icon.svg',
        iconColor: '#FFFFFF',
        backgroundColor: '#EF4040',
        messageColor: '#FFFFFF',
        position: 'topRight'
    });

    // hide btn Load more
    loadMoreBtn.style.display = "none";

    // reset container
    imagesContainer.innerHTML = '';
}

const showEmptyError = () => {
    iziToast.show({
        message: `We're sorry, but you've reached the end of search results.`,
        maxWidth: 432,
        iconUrl: './images/error-icon.svg',
        iconColor: '#FFFFFF',
        backgroundColor: '#87CEEB',
        messageColor: '#FFFFFF',
        position: 'topRight'
    });
    // hide btn Load more
    loadMoreBtn.style.display = "none";
}

// scroll

const scrollPage = () => {
    const height = document.querySelector(".img").getBoundingClientRect().height * 2
    window.scrollBy({
        top: height,
        behavior: "smooth",
    });
}

