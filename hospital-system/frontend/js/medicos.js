// Lógica de Gestão de Médicos

let todosMedicos = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarMedicos();

    // Filtros e buscas
    const searchInput = document.getElementById('search-medicos');
    if (searchInput) {
        searchInput.addEventListener('input', filtrarMedicos);
    }

    const filterEspecialidade = document.getElementById('filter-especialidade');
    if (filterEspecialidade) {
        filterEspecialidade.addEventListener('change', filtrarMedicos);
    }

    // Modal de Cadastro
    const btnNovo = document.getElementById('btn-novo-medico');
    const modal = document.getElementById('modal-medico');
    const form = document.getElementById('form-medico');
    const modalTitle = document.getElementById('modal-title');
    const btnCancelar = document.getElementById('btn-cancelar');

    if (btnNovo && modal && form) {
        btnNovo.addEventListener('click', () => {
            form.reset();
            document.getElementById('medico-id').value = '';
            modalTitle.textContent = 'Novo Médico';
            modal.classList.add('open');
        });

        btnCancelar.addEventListener('click', () => {
            modal.classList.remove('open');
        });

        form.addEventListener('submit', salvarMedico);
    }
});

async function carregarMedicos() {
    try {
        todosMedicos = await API.get('/api/medicos');
        renderizarMedicos(todosMedicos);
        povoarFiltroEspecialidades(todosMedicos);
    } catch (e) {
        console.error("Erro ao carregar médicos", e);
    }
}

function renderizarMedicos(lista) {
    const tbody = document.getElementById('table-medicos-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    lista.forEach(m => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>#${m.id}</td>
            <td><strong>${m.nome}</strong></td>
            <td>${m.especialidade}</td>
            <td><code>${m.crm}</code></td>
            <td>${m.escala}</td>
            <td><span class="badge ${m.ativo ? 'badge-green' : 'badge-gray'}">${m.ativo ? 'Ativo' : 'Inativo'}</span></td>
            <td>
                <div style="display: flex; gap: 5px;">
                    <button class="btn-icon btn-edit" onclick="editarMedicoClick(${m.id})" title="Editar Médico">✏️</button>
                    <button class="btn-icon btn-delete" onclick="excluirMedicoClick(${m.id})" title="Excluir Permanentemente">❌</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function povoarFiltroEspecialidades(lista) {
    const filter = document.getElementById('filter-especialidade');
    if (!filter) return;

    // Salvar valor atual selecionado
    const selected = filter.value;
    
    // Obter especialidades únicas
    const especialidades = ['Todas', ...new Set(lista.map(m => m.especialidade))];
    
    filter.innerHTML = '';
    especialidades.forEach(esp => {
        const opt = document.createElement('option');
        opt.value = esp;
        opt.textContent = esp;
        if (esp === selected) opt.selected = true;
        filter.appendChild(opt);
    });
}

function filtrarMedicos() {
    const query = document.getElementById('search-medicos').value.toLowerCase();
    const filter = document.getElementById('filter-especialidade').value;

    const filtrados = todosMedicos.filter(m => {
        const bateNome = m.nome.toLowerCase().includes(query) || m.crm.toLowerCase().includes(query);
        const bateEsp = filter === 'Todas' || m.especialidade === filter;
        return bateNome && bateEsp;
    });

    renderizarMedicos(filtrados);
}

async function salvarMedico(e) {
    e.preventDefault();
    
    const id = document.getElementById('medico-id').value;
    const nome = document.getElementById('medico-nome').value;
    const especialidade = document.getElementById('medico-especialidade').value;
    const crm = document.getElementById('medico-crm').value;
    const escala = document.getElementById('medico-escala').value;

    const dados = { nome, especialidade, crm, escala };

    try {
        if (id) {
            // Edição
            await API.put(`/api/medicos/${id}`, dados);
        } else {
            // Criação
            await API.post('/api/medicos', dados);
        }
        
        document.getElementById('modal-medico').classList.remove('open');
        carregarMedicos();
    } catch (err) {
        console.error("Falha ao salvar dados do médico.", err);
    }
}

function editarMedicoClick(id) {
    const m = todosMedicos.find(item => item.id === id);
    if (!m) return;

    document.getElementById('medico-id').value = m.id;
    document.getElementById('medico-nome').value = m.nome;
    document.getElementById('medico-especialidade').value = m.especialidade;
    document.getElementById('medico-crm').value = m.crm;
    document.getElementById('medico-escala').value = m.escala;

    document.getElementById('modal-title').textContent = 'Editar Cadastro';
    document.getElementById('modal-medico').classList.add('open');
}

async function excluirMedicoClick(id) {
    const m = todosMedicos.find(item => item.id === id);
    if (!m) return;

    if (confirm(`ATENÇÃO: Deseja realmente excluir permanentemente '${m.nome}'?`)) {
        try {
            await API.delete(`/api/medicos/${id}`);
            carregarMedicos();
        } catch (err) {
            console.error(err);
        }
    }
}
