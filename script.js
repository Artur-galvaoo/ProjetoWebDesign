document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('.main-nav a, .logo a, .btn-primary'); // Seleciona links da nav, logo e o botão primário
    const pageTitle = document.querySelector('title'); // Referência ao título da página

    // Função para carregar o conteúdo via AJAX
    async function loadContent(url, pushState = true) {
        try {
            // Adiciona uma classe para indicar carregamento (opcional, para animação)
            mainContent.classList.add('loading');

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();

            // Cria um parser para extrair o conteúdo HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Pega o conteúdo da tag <section> ou <div> principal de cada arquivo de conteúdo
            // Ajuste o seletor se o conteúdo principal de cada página não for uma <section> ou <div> com uma classe/ID específica
            const newContent = doc.body.innerHTML; // Pega todo o body do arquivo de conteúdo
            
            // Troca o conteúdo do main
            mainContent.innerHTML = newContent;

            // Remove a classe de carregamento
            mainContent.classList.remove('loading');

            // Atualiza o título da página baseado no conteúdo carregado (se houver um h1 por exemplo)
            const newH1 = mainContent.querySelector('h1');
            if (newH1) {
                pageTitle.textContent = `Igreja Evangélica dos Irmãos - ${newH1.textContent}`;
            } else {
                // Fallback caso não encontre um h1 no conteúdo carregado
                const urlParts = url.split('/');
                const fileName = urlParts[urlParts.length - 1].replace('.html', '');
                pageTitle.textContent = `Igreja Evangélica dos Irmãos - ${fileName.charAt(0).toUpperCase() + fileName.slice(1)}`;
            }

            // Atualiza a URL no histórico do navegador
            if (pushState) {
                history.pushState({ path: url }, '', url.replace('content/', '')); // Remove 'content/' da URL exibida
            }

            // Opcional: Rolar para o topo da página após carregar novo conteúdo
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
            e.preventDefault(); // Previne o comportamento padrão do link

            const targetUrl = link.getAttribute('data-target'); // Pega a URL do data-target
            if (targetUrl) {
                loadContent(targetUrl);
            }
        });
    });

    // Gerencia o botão "Voltar" do navegador
    window.addEventListener('popstate', (event) => {
        // Quando o usuário usa o botão Voltar/Avançar
        // O event.state.path conterá a URL que foi salva com pushState
        if (event.state && event.state.path) {
            loadContent(event.state.path, false); // Carrega sem adicionar novo estado ao histórico
        } else {
            // Caso inicial ou se o estado não tiver path (ex: primeira carga da página)
            // Carrega o conteúdo da URL atual
            // Pega o path da URL atual, remove o '/' inicial se houver
            const currentPath = window.location.pathname.substring(1); 
            // Se o path for vazio ou apenas "/", carregamos a home
            const initialLoadUrl = currentPath === '' || currentPath === '/' ? 'content/home.html' : `content/${currentPath}.html`;
            loadContent(initialLoadUrl, false);
        }
    });

    // Carregar o conteúdo da página inicial ao carregar o site (apenas se não estiver na home ainda)
    // Isso garante que se a pessoa acessar /contato.html diretamente, o conteúdo correto seja carregado
    const initialPath = window.location.pathname.substring(1);
    if (initialPath === '' || initialPath === 'index.html' || initialPath === '/') {
        loadContent('content/home.html', false); // Carrega a home na primeira carga se o path for vazio/index.html
    } else {
        // Se a URL já for de uma "subpágina", carregue o conteúdo correspondente
        loadContent(`content/${initialPath}.html`, false);
    }
});