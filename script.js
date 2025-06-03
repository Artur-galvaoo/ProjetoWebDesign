document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    // Seleciona todos os links da nav, logo e o botão primário, e também os links que são carregados via AJAX
    const navLinks = document.querySelectorAll('.main-nav a, .logo a, .btn-primary');
    const pageTitle = document.querySelector('title');

    // Elementos do menu hambúrguer
    const mobileMenuToggle = document.getElementById('mobile-menu');
    const navList = document.querySelector('.main-nav .nav-list'); // Seleciona a ul com a classe nav-list


    // Define o caminho base do seu repositório no GitHub Pages
    const REPO_PATH = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' ? '' : '/ProjetoWebDesign/';
    // Adapte 'ProjetoWebDesign' se o nome do seu repositório no GitHub for diferente.

    // Função para carregar o conteúdo via AJAX
    async function loadContent(url, pushState = true) {
        // Fecha o menu mobile se estiver aberto
        if (navList.classList.contains('active')) {
            navList.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        }

        try {
            mainContent.classList.add('loading'); // Adiciona classe para possíveis animações de carregamento

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} ao carregar ${url}`);
            }
            const html = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Importante: Você precisa pegar o HTML específico da seção que deseja carregar
            // Em vez de doc.body.innerHTML, que pode trazer scripts indesejados,
            // podemos pegar a seção principal de cada arquivo de conteúdo se eles forem estruturados com um ID
            // ou garantir que o doc.body.innerHTML contenha apenas o conteúdo relevante.
            // Para simplificar agora, manteremos doc.body.innerHTML, mas tenha em mente para projetos maiores.
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
                // Ajuste para URLs limpas (sem .html e com # para as "páginas" internas)
                let newBrowserUrl = REPO_PATH;
                if (fileName !== 'home') {
                    newBrowserUrl += `#${fileName}`;
                } else if (REPO_PATH !== '') { // Se não for home e for um repositório, use index.html
                    newBrowserUrl += 'index.html'; // Para que a URL seja /repositorio/index.html e não apenas /repositorio/
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
        navList.classList.toggle('active'); // Adiciona/remove a classe 'active' na lista de navegação
        mobileMenuToggle.classList.toggle('active'); // Adiciona/remove a classe 'active' no ícone (para animação)
    });

    // MUDANÇA MAIOR AQUI: Refinamento da lógica de popstate e carga inicial
    window.addEventListener('popstate', handleUrlChange);

    function handleUrlChange() {
        let pageToLoad = 'home'; // Default para a página inicial

        // Verifica o hash (ex: #contact, #about) para navegação interna de SPA
        if (window.location.hash) {
            const hashPage = window.location.hash.substring(1); // Remove o '#'
            if (hashPage) {
                pageToLoad = hashPage;
            }
        } 
        // Se não houver hash, tenta inferir a página do pathname (útil para primeira carga ou se for um MPA)
        else {
            let currentPathname = window.location.pathname;

            // Remove o REPO_PATH se estiver presente (importante para GitHub Pages)
            if (currentPathname.startsWith(REPO_PATH)) {
                currentPathname = currentPathname.substring(REPO_PATH.length);
            }
            
            // Remove barras iniciais/finais e a extensão .html
            currentPathname = currentPathname.replace(/^\/|\/$/g, '');
            currentPathname = currentPathname.replace(/\.html$/i, '');

            if (currentPathname !== '' && currentPathname.toLowerCase() !== 'index') {
                pageToLoad = currentPathname;
            }
        }
        
        // Carrega o conteúdo correspondente
        loadContent(`content/${pageToLoad}.html`, false);
    }

    // Dispara o carregamento inicial da página com base na URL
    handleUrlChange();
});