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

            // ATUALIZAÇÃO AQUI: Atualiza a URL no histórico do navegador para o formato COM HASH
            if (pushState) {
                const urlParts = url.split('/');
                const fileName = urlParts[urlParts.length - 1].replace('.html', '');
                
                // Construa a URL com hash para a navegação interna
                // Se for home, a URL será /ProjetoWebDesign/index.html (sem hash)
                // Senão, será /ProjetoWebDesign/index.html#nome_da_pagina
                const newHash = fileName === 'home' ? '' : `#${fileName}`;
                
                // history.pushState só muda o path e o hash. O path deve ser sempre index.html para o servidor estático.
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

            const targetUrl = link.getAttribute('data-target'); // Pega a URL do data-target (ex: content/home.html)
            if (targetUrl) {
                loadContent(targetUrl); // Chama loadContent com o caminho completo do arquivo
            }
        });
    });

    // MUDANÇA MAIOR AQUI: Refinamento da lógica de popstate e carga inicial
    window.addEventListener('popstate', handleUrlChange); // Usa a mesma função para popstate

    function handleUrlChange() {
        let pageToLoad = 'home'; // Padrão: carregar home.html (content/home.html)

        // Primeiro, verifique se há um hash na URL
        if (window.location.hash) {
            const hashPage = window.location.hash.substring(1); // Remove o '#'
            if (hashPage) { // Se o hash não for vazio
                pageToLoad = hashPage;
            }
        } 
        // Se não houver hash, verifique se a URL limpa (pathname) aponta para alguma rota específica
        // Isso é mais para o caso de o 404.html ter redirecionado sem hash na primeira carga
        // ou para acessos diretos.
        else {
            let currentPathname = window.location.pathname;

            // Remove o REPO_PATH se estiver presente (importante para GitHub Pages)
            if (currentPathname.startsWith(REPO_PATH)) {
                currentPathname = currentPathname.substring(REPO_PATH.length);
            }
            
            // Remove barras iniciais/finais e '.html' se existirem
            currentPathname = currentPathname.replace(/^\/|\/$/g, '');
            currentPathname = currentPathname.replace(/\.html$/i, '');

            // Se o caminho limpo não for vazio e não for 'index', usa-o como nome da página
            // Ex: Se a URL for /ProjetoWebDesign/contact, currentPathname será 'contact'
            // Se for /ProjetoWebDesign/index.html, currentPathname será 'index'
            if (currentPathname !== '' && currentPathname.toLowerCase() !== 'index') {
                pageToLoad = currentPathname;
            }
        }
        
        // Finaliza chamando loadContent com o caminho correto do arquivo HTML
        loadContent(`content/${pageToLoad}.html`, false);
    }

    // Chamada inicial para carregar o conteúdo correto quando a página é acessada pela primeira vez
    handleUrlChange();
});