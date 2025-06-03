document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('.main-nav a, .logo a, .btn-primary');
    const pageTitle = document.querySelector('title');

    // Define o caminho base do seu repositório no GitHub Pages
    // Condicional: para Live Server, use '', para GitHub Pages, use '/NomeDoSeuRepositorio/'
    const REPO_PATH = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' ? '' : '/ProjetoWebDesign/'; 
    // Adapte 'ProjetoWebDesign' se o nome do seu repositório no GitHub for diferente.
    // Adapte '127.0.0.1' ou 'localhost' se você usa outro IP/hostname para o Live Server.

    // Função para carregar o conteúdo via AJAX
    async function loadContent(url, pushState = true) {
        try {
            mainContent.classList.add('loading');

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} ao carregar ${url}`);
            }
            const html = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const newContent = doc.body.innerHTML;
            mainContent.innerHTML = newContent;

            mainContent.classList.remove('loading');

            const newH1 = mainContent.querySelector('h1');
            if (newH1) {
                pageTitle.textContent = `Igreja Evangélica dos Irmãos - ${newH1.textContent}`;
            } else {
                const urlParts = url.split('/');
                const fileName = urlParts[urlParts.length - 1].replace('.html', '');
                pageTitle.textContent = `Igreja Evangélica dos Irmãos - ${fileName.charAt(0).toUpperCase() + fileName.slice(1)}`;
            }

            if (pushState) {
                const urlParts = url.split('/');
                const fileName = urlParts[urlParts.length - 1].replace('.html', '');
                const newHash = fileName === 'home' ? '' : `#${fileName}`;
                // A URL no pushState agora usará o REPO_PATH correto para cada ambiente
                history.pushState({ path: url }, '', `${REPO_PATH}index.html${newHash}`); 
            }

            window.scrollTo(0, 0);

        } catch (error) {
            console.error("Erro ao carregar o conteúdo:", error);
            mainContent.innerHTML = '<section class="error-page" style="text-align: center; padding-top: 100px;"><h2>Erro ao carregar a página.</h2><p>Por favor, tente novamente mais tarde.</p></section>';
            mainContent.classList.remove('loading');
        }
    }

    // Gerencia o clique nos links de navegação
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const targetUrl = link.getAttribute('data-target');
            if (targetUrl) {
                loadContent(targetUrl);
            }
        });
    });

    // MUDANÇA MAIOR AQUI: Refinamento da lógica de popstate e carga inicial
    window.addEventListener('popstate', handleUrlChange);

    function handleUrlChange() {
        let pageToLoad = 'home';

        if (window.location.hash) {
            const hashPage = window.location.hash.substring(1);
            if (hashPage) {
                pageToLoad = hashPage;
            }
        } 
        else {
            let currentPathname = window.location.pathname;

            // Remove o REPO_PATH se estiver presente (importante para GitHub Pages)
            if (currentPathname.startsWith(REPO_PATH)) { // Usa o REPO_PATH condicional aqui também
                currentPathname = currentPathname.substring(REPO_PATH.length);
            }
            
            currentPathname = currentPathname.replace(/^\/|\/$/g, '');
            currentPathname = currentPathname.replace(/\.html$/i, '');

            if (currentPathname !== '' && currentPathname.toLowerCase() !== 'index') {
                pageToLoad = currentPathname;
            }
        }
        
        loadContent(`content/${pageToLoad}.html`, false);
    }

    handleUrlChange();
});