// Lógica Global do Front-end - Controle de Sessão e Configurações

document.addEventListener('DOMContentLoaded', () => {
    // 1. Controle de Acesso Seguro (Auth Guard)
    const token = localStorage.getItem('adminToken');
    const isLoginPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('login.html');

    if (!token && !isLoginPage) {
        // Se tentar acessar página interna sem token, joga para login
        window.location.href = 'index.html';
        return;
    }

    if (token && isLoginPage) {
        // Se já está logado, redireciona para a dashboard
        window.location.href = 'dashboard.html';
        return;
    }

    // 2. Definir Item de Menu Ativo baseada no nome do arquivo
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-menu .nav-item');
    navItems.forEach(item => {
        const link = item.querySelector('a');
        if (link && currentPath.includes(link.getAttribute('href'))) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // 3. Gerenciamento do Tema Escuro/Claro
    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
        // Restaurar preferência anterior
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeBtn.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';

        themeBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeBtn.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
        });
    }

    // 4. Logout do Sistema
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Deseja realmente sair do sistema?')) {
                localStorage.removeItem('adminToken');
                window.location.href = 'index.html';
            }
        });
    }

    // 5. Exibir data e hora do sistema
    const timeDisplay = document.getElementById('system-time');
    if (timeDisplay) {
        const atualizarRelogio = () => {
            const agora = new Date();
            timeDisplay.textContent = agora.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        };
        atualizarRelogio();
        setInterval(atualizarRelogio, 1000);
    }
});

// Funções Helpers para Requisições
const API = {
    async get(endpoint) {
        try {
            const res = await fetch(endpoint);
            if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
            return await res.json();
        } catch (error) {
            console.error(`Erro ao carregar de ${endpoint}:`, error);
            alert('Falha na comunicação com o servidor backend.');
            throw error;
        }
    },
    async post(endpoint, body) {
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Erro na requisição');
            return data;
        } catch (error) {
            console.error(`Erro ao enviar para ${endpoint}:`, error);
            alert(error.message || 'Falha ao registrar dados.');
            throw error;
        }
    },
    async put(endpoint, body) {
        try {
            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Erro na alteração');
            return data;
        } catch (error) {
            console.error(`Erro ao editar em ${endpoint}:`, error);
            alert(error.message || 'Falha ao atualizar registros.');
            throw error;
        }
    },
    async delete(endpoint) {
        try {
            const res = await fetch(endpoint, { method: 'DELETE' });
            if (!res.ok) throw new Error('Erro ao excluir');
            return await res.json();
        } catch (error) {
            console.error(`Erro ao remover em ${endpoint}:`, error);
            alert('Falha ao excluir o registro.');
            throw error;
        }
    }
};
