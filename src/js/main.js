'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const copyrElem = document.getElementById('copyr');
    if (copyrElem) {
        copyrElem.textContent = new Date().getFullYear();
    }
    const container = document.querySelector('#cont');
    const themeSwitch = document.getElementById('themeSwitch');

    const JSON_BASE = './src/js/pages/libros_';  // Base path to paginated JSON
    const ITEMS_PER_PAGE = 5;                    // Number of items per batch
    const TOTAL_JSON_PAGES = 9;                  // Total JSON files available

    let page = 0;              // Current offset inside loaded data
    let loading = false;       // Loading flag
    let finished = false;      // Whether all items were loaded
    let observer;              // Observer for infinite scroll
    let libros = [];           // Loaded books
    let jsonPage = 1;          // JSON page currently being fetched
    const loaderElem = document.getElementById('loader');

    // Fetch a JSON chunk
    const fetchLibros = async () => {
        if (jsonPage > TOTAL_JSON_PAGES) { finished = true; return; }
        loaderElem?.classList.add('active');
        try {
            const res = await fetch(`${JSON_BASE}${jsonPage}.json`);
            if (!res.ok) { finished = true; return; }
            const data = await res.json();
            libros = libros.concat(data.articulos ?? data);
            jsonPage++;
        } catch (err) {
            Logger.error('Error loading data:', err);
        } finally {
            loaderElem?.classList.remove('active');
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
        image.src = portada_libro && portada_libro.trim() !== '' ? portada_libro : './src/assets/def_img.jpg';
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
        // The download attribute is omitted because many links
        // point to cross-origin resources where it is ignored.

        article.append(title, description, image, link);
        return article;
    };

    // Load more items onto the page
    const loadMore = async () => {
        if (loading || finished) return;
        loading = true;

        // If we have consumed loaded books, fetch the next JSON chunk
        if (page * ITEMS_PER_PAGE >= libros.length && !finished) {
            await fetchLibros();
        }

        const start = page * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const fragment = document.createDocumentFragment();

        libros.slice(start, end).forEach(libro => {
            fragment.append(createArticle(libro));
        });

        if (fragment.childElementCount) {
            container.appendChild(fragment);
            page++;
        }

        finished = page * ITEMS_PER_PAGE >= libros.length && jsonPage > TOTAL_JSON_PAGES;
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

    // Kick things off by loading the first batch
    fetchLibros().then(loadMore);
});
