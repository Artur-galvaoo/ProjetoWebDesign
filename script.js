document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('.main-nav a, .logo a, .btn-primary');
    const pageTitle = document.querySelector('title');

    // Define o caminho base do seu repositório no GitHub Pages
    const REPO_PATH = '/ProjetoWebDesign/'; // **Ajuste se o nome do seu repositório mudar**

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

            // MUDANÇA CRÍTICA AQUI: Atualiza a URL no histórico do navegador para o formato COM HASH
            if (pushState) {
                const urlParts = url.split('/');
                const fileName = urlParts[urlParts.length - 1].replace('.html', '');
                
                // Construa a URL com hash para a navegação interna
                // Se for home, a URL será /ProjetoWebDesign/index.html
                // Senão, será /ProjetoWebDesign/index.html#nome_da_pagina
                const newHash = fileName === 'home' ? '' : `#${fileName}`;
                
                // history.pushState só muda o path e o hash, não o base (o index.html é fixo)
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

            // O data-target ainda aponta para o caminho real do arquivo (ex: content/home.html)
            const targetUrl = link.getAttribute('data-target');
            if (targetUrl) {
                loadContent(targetUrl);
            }
        });
    });

    // Gerencia o botão "Voltar" do navegador e a carga inicial
    window.addEventListener('popstate', handlePopStateAndInitialLoad);

    // Função separada para lidar com popstate e carga inicial para evitar duplicação
    function handlePopStateAndInitialLoad() {
        let pageToLoad = 'home'; // Padrão: carregar home.html

        // Prioriza o hash para o roteamento de SPA
        if (window.location.hash) {
            // Remove o '#' do início
            const hashPage = window.location.hash.substring(1); 
            if (hashPage && hashPage.toLowerCase() !== 'index') { // Garante que '#index' não tente carregar content/index.html
                pageToLoad = hashPage;
            }
        } 
        // Se não houver hash, tenta a URL limpa (para carga inicial sem hash ou 404 redirecionado)
        else {
            let currentPathname = window.location.pathname;

            // Remove o REPO_PATH se estiver presente
            if (currentPathname.startsWith(REPO_PATH)) {
                currentPathname = currentPathname.substring(REPO_PATH.length);
            }
            
            // Remove barras iniciais/finais e '.html' se existirem
            currentPathname = currentPathname.replace(/^\/|\/$/g, '');
            currentPathname = currentPathname.replace(/\.html$/i, '');

            // Se o caminho resultante não for vazio e não for 'index' (pois 'index' significa home)
            if (currentPathname !== '' && currentPathname.toLowerCase() !== 'index') {
                pageToLoad = currentPathname;
            }
        }
        
        loadContent(`content/${pageToLoad}.html`, false);
    }

    // Chamada inicial para carregar o conteúdo correto
    handlePopStateAndInitialLoad();
});