'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const copyrElem = document.getElementById('copyr');
    if (copyrElem) {
        copyrElem.textContent = new Date().getFullYear();
    }
    const container = document.querySelector('#cont');
    const themeSwitch = document.getElementById('themeSwitch');

    const JSON_PATH = './src/js/libros.json'; // Path to the JSON data
    const ITEMS_PER_PAGE = 5;                   // Number of items per page

    let page = 0;         // Current page
    let loading = false;  // Loading flag
    let finished = false; // Whether all items were loaded
    let observer;         // Observer for infinite scroll
    let libros = [];      // Books data

    // Fetch JSON data once
    const fetchLibros = async () => {
        try {
            const res = await fetch(JSON_PATH);
            const data = await res.json();
            libros = data.articulos;
            loadMore(); // Initial load after fetching data
        } catch (err) {
            console.error('Error loading data:', err);
        }
    };

    // Build the HTML card for a book
    const createArticle = ({ nombre, isbn, portada_libro, url }) => {
        const article = document.createElement('article');
        article.classList.add('caja_art');

        const title = document.createElement('h2');
        title.classList.add('h2_art');
        title.textContent = nombre;

        const description = document.createElement('p');
        description.classList.add('p_arts');
        description.textContent = `ISBN: ${isbn}`;

        const image = document.createElement('img');
        image.classList.add('imagen_art');
        image.alt = nombre;
        image.src = portada_libro;
        image.onerror = () => {
            if (!image.dataset.error) {
                image.src = './src/assets/def_img.jpg';
                image.dataset.error = 'true';
            }
        };

        const link = document.createElement('a');
        link.classList.add('links');
        applyTheme(link);
        link.href = url;
        link.textContent = 'Download';
        link.setAttribute('download', '');

        article.append(title, description, image, link);
        return article;
    };

    // Load more items onto the page
    const loadMore = () => {
        if (loading || finished) return;
        loading = true;

        const start = page * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const fragment = document.createDocumentFragment();

        libros.slice(start, end).forEach(libro => {
            fragment.append(createArticle(libro));
        });
        container.appendChild(fragment);

        page++;
        finished = end >= libros.length;
        if (!finished) observeLast();
        loading = false;
    };

    // Observe the last element to implement infinite scroll
    const observeLast = () => {
        const articles = container.querySelectorAll('.caja_art');
        const last = articles[articles.length - 1];

        if (observer) observer.disconnect();
        observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !loading && !finished) {
                loadMore();
            }
        }, { rootMargin: '100px' });

        if (last) observer.observe(last);
    };

    // Apply the proper theme class to links
    const applyTheme = link => {
        if (themeSwitch?.checked) {
            link.classList.add('links_noche');
        } else {
            link.classList.add('links_dia');
        }
    };

    // Switch page theme
    themeSwitch?.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode', themeSwitch.checked);
        document.querySelectorAll('.links').forEach(link => {
            link.classList.remove('links_dia', 'links_noche');
            applyTheme(link);
        });
    });

    // Kick things off
    fetchLibros();
});
