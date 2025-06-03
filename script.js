document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('.main-nav a, .logo a, .btn-primary');
    const pageTitle = document.querySelector('title');

    const mobileMenuToggle = document.getElementById('mobile-menu');
    const mainNav = document.querySelector('.main-nav');

    // Define o caminho base do seu repositório no GitHub Pages
    // AGORA ESTÁ COM O NOME EXATO DO SEU REPOSITÓRIO: /ProjetoWebDesign/
    const REPO_PATH = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' ? '' : '/ProjetoWebDesign/'; 

    // Função para carregar o conteúdo via AJAX
    async function loadContent(url, pushState = true) {
        if (mainNav.classList.contains('active')) {
            mainNav.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        }

        try {
            mainContent.classList.add('loading');

            // Constrói a URL completa para o fetch
            // Se a URL do 'data-target' já começar com o REPO_PATH (ex: se você usasse /ProjetoWebDesign/content/home.html),
            // não adiciona novamente. Caso contrário, ele adiciona o REPO_PATH no início.
            const fetchUrl = REPO_PATH + url; // Simplificado: sempre adiciona REPO_PATH no início das URLs relativas do data-target
            
            const response = await fetch(fetchUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} ao carregar ${fetchUrl}`);
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
                
                let newBrowserUrl = REPO_PATH; 
                if (fileName === 'home') {
                    // Para a página inicial, a URL deve ser a raiz do repositório (ex: seuusuario.github.io/ProjetoWebDesign/)
                    newBrowserUrl = REPO_PATH; 
                } else {
                    // Para outras páginas, use o hash (ex: seuusuario.github.io/ProjetoWebDesign/#contato)
                    newBrowserUrl += `index.html#${fileName}`; 
                }
                
                history.pushState({ path: url }, '', newBrowserUrl);
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

    // Lógica do menu hambúrguer
    mobileMenuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });

    // Lógica de popstate e carga inicial da página
    window.addEventListener('popstate', handleUrlChange);

    function handleUrlChange() {
        let pageToLoad = 'home'; 
        let currentPathname = window.location.pathname;

        // Remove o REPO_PATH se estiver presente do pathname
        if (currentPathname.startsWith(REPO_PATH)) {
            currentPathname = currentPathname.substring(REPO_PATH.length);
        }
        
        // Limpa barras e extensão .html
        currentPathname = currentPathname.replace(/^\/|\/$/g, '');
        currentPathname = currentPathname.replace(/\.html$/i, '');

        // Determina a página com base no hash ou pathname
        if (window.location.hash) {
            const hashPage = window.location.hash.substring(1);
            if (hashPage) {
                pageToLoad = hashPage;
            }
        } else if (currentPathname !== '' && currentPathname.toLowerCase() !== 'index') {
            pageToLoad = currentPathname;
        }
        
        loadContent(`content/${pageToLoad}.html`, false);
    }

    // Dispara o carregamento inicial da página
    handleUrlChange(); // Chama handleUrlChange para carregar a página inicial ou a página com base na URL atual
});