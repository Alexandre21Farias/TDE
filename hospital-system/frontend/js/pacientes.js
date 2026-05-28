// Lógica de Gestão de Pacientes

let todosPacientes = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarPacientes();

    // Eventos de Busca e Filtros
    const searchInput = document.getElementById('search-pacientes');
    if (searchInput) {
        searchInput.addEventListener('input', filtrarPacientes);
    }

    const filterPrioridade = document.getElementById('filter-prioridade');
    if (filterPrioridade) {
        filterPrioridade.addEventListener('change', filtrarPacientes);
    }

    // Modal de Cadastro
    const btnNovo = document.getElementById('btn-novo-paciente');
    const modal = document.getElementById('modal-paciente');
    const form = document.getElementById('form-paciente');
    const modalTitle = document.getElementById('modal-title');
    const btnCancelar = document.getElementById('btn-cancelar');

    if (btnNovo && modal && form) {
        btnNovo.addEventListener('click', () => {
            form.reset();
            document.getElementById('paciente-id').value = '';
            modalTitle.textContent = 'Novo Paciente';
            modal.classList.add('open');
        });

        btnCancelar.addEventListener('click', () => {
            modal.classList.remove('open');
        });

        form.addEventListener('submit', salvarPaciente);
    }
});

async function carregarPacientes() {
    try {
        todosPacientes = await API.get('/api/pacientes');
        renderizarPacientes(todosPacientes);
    } catch (e) {
        console.error("Erro ao carregar pacientes", e);
    }
}

function renderizarPacientes(lista) {
    const tbody = document.getElementById('table-pacientes-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    lista.forEach(p => {
        const tr = document.createElement('tr');
        
        let badgeClass = 'badge-gray';
        if (p.prioridade === 'Vermelho') badgeClass = 'badge-red';
        else if (p.prioridade === 'Amarelo') badgeClass = 'badge-yellow';
        else if (p.prioridade === 'Verde') badgeClass = 'badge-green';

        tr.innerHTML = `
            <td>#${p.id}</td>
            <td><strong>${p.nome}</strong></td>
            <td>${p.idade} anos</td>
            <td>${p.leito > 0 ? `Leito ${p.leito}` : '<span class="text-muted">Sem Leito</span>'}</td>
            <td><span class="badge ${badgeClass}">${p.prioridade}</span></td>
            <td>${p.diagnostico}</td>
            <td><span class="badge ${p.ativo ? 'badge-blue' : 'badge-gray'}">${p.ativo ? 'Internado' : 'Alta'}</span></td>
            <td>
                <div style="display: flex; gap: 5px;">
                    <button class="btn-icon btn-edit" onclick="editarPacienteClick(${p.id})" title="Editar Paciente">✏️</button>
                    ${p.ativo ? `<button class="btn-icon btn-discharge" onclick="darAltaClick(${p.id})" title="Dar Alta">✔️</button>` : ''}
                    <button class="btn-icon btn-delete" onclick="excluirPacienteClick(${p.id})" title="Excluir Permanentemente">❌</button>
                    <button class="btn-icon" onclick="verHistoricoClick(${p.id})" title="Ver Timeline Clínica">⏳</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filtrarPacientes() {
    const query = document.getElementById('search-pacientes').value.toLowerCase();
    const filter = document.getElementById('filter-prioridade').value;

    const filtrados = todosPacientes.filter(p => {
        const bateNome = p.nome.toLowerCase().includes(query) || p.diagnostico.toLowerCase().includes(query);
        const bateFiltro = filter === 'Todos' || p.prioridade === filter || (filter === 'Internados' && p.ativo) || (filter === 'Altas' && !p.ativo);
        return bateNome && bateFiltro;
    });

    renderizarPacientes(filtrados);
}

async function salvarPaciente(e) {
    e.preventDefault();
    
    const id = document.getElementById('paciente-id').value;
    const nome = document.getElementById('paciente-nome').value;
    const idade = document.getElementById('paciente-idade').value;
    const diagnostico = document.getElementById('paciente-diagnostico').value;
    const leito = document.getElementById('paciente-leito').value;
    const prioridade = document.getElementById('paciente-prioridade').value;

    const dados = { nome, idade, diagnostico, leito, prioridade };

    try {
        if (id) {
            // Edição
            await API.put(`/api/pacientes/${id}`, dados);
        } else {
            // Criação
            await API.post('/api/pacientes', dados);
        }
        
        document.getElementById('modal-paciente').classList.remove('open');
        carregarPacientes();
    } catch (err) {
        console.error("Falha ao salvar dados do paciente.", err);
    }
}

function editarPacienteClick(id) {
    const p = todosPacientes.find(item => item.id === id);
    if (!p) return;

    document.getElementById('paciente-id').value = p.id;
    document.getElementById('paciente-nome').value = p.nome;
    document.getElementById('paciente-idade').value = p.idade;
    document.getElementById('paciente-diagnostico').value = p.diagnostico;
    document.getElementById('paciente-leito').value = p.leito;
    document.getElementById('paciente-prioridade').value = p.prioridade;

    document.getElementById('modal-title').textContent = 'Editar Cadastro';
    document.getElementById('modal-paciente').classList.add('open');
}

async function darAltaClick(id) {
    const p = todosPacientes.find(item => item.id === id);
    if (!p) return;

    if (confirm(`Confirmar alta hospitalar para o paciente '${p.nome}'? O leito ${p.leito} será liberado.`)) {
        try {
            await API.put(`/api/pacientes/${id}`, { ativo: false });
            carregarPacientes();
        } catch (err) {
            console.error(err);
        }
    }
}

async function excluirPacienteClick(id) {
    const p = todosPacientes.find(item => item.id === id);
    if (!p) return;

    if (confirm(`ATENÇÃO: Deseja realmente excluir permanentemente '${p.nome}'? Todos os registros históricos vinculados serão removidos.`)) {
        try {
            await API.delete(`/api/pacientes/${id}`);
            carregarPacientes();
        } catch (err) {
            console.error(err);
        }
    }
}

// TIMELINE CLINICA
async function verHistoricoClick(id) {
    const p = todosPacientes.find(item => item.id === id);
    if (!p) return;

    try {
        const internacoes = await API.get('/api/internacoes');
        const historico = internacoes.filter(i => i.id_paciente === id);

        const modalTimeline = document.getElementById('modal-timeline');
        const timelineContent = document.getElementById('timeline-content');
        const timelineTitle = document.getElementById('timeline-paciente-name');

        if (modalTimeline && timelineContent && timelineTitle) {
            timelineTitle.textContent = p.nome;
            timelineContent.innerHTML = '';

            // Adiciona cadastro inicial
            const cadItem = document.createElement('div');
            cadItem.className = 'timeline-item';
            cadItem.innerHTML = `
                <div class="timeline-time">${p.data_cadastro}</div>
                <div class="timeline-title">Ficha Cadastrada no Sistema</div>
                <div class="timeline-desc">Ficha médica aberta. Diagnóstico: ${p.diagnostico}. Prioridade: ${p.prioridade}.</div>
            `;
            timelineContent.appendChild(cadItem);

            // Adiciona histórico de internações
            historico.forEach(h => {
                const itemEntrada = document.createElement('div');
                itemEntrada.className = 'timeline-item';
                itemEntrada.innerHTML = `
                    <div class="timeline-time">${h.data_entrada}</div>
                    <div class="timeline-title">Internação Ativada (Leito ${h.leito})</div>
                    <div class="timeline-desc">Alocado no leito sob cuidados de: ${h.medico_nome}.</div>
                `;
                timelineContent.appendChild(itemEntrada);

                if (h.data_saida !== 'N/A') {
                    const itemSaida = document.createElement('div');
                    itemSaida.className = 'timeline-item';
                    itemSaida.innerHTML = `
                        <div class="timeline-time">${h.data_saida}</div>
                        <div class="timeline-title">Alta Médica Hospitalar</div>
                        <div class="timeline-desc">Paciente recebeu alta e o leito ${h.leito} foi liberado.</div>
                    `;
                    timelineContent.appendChild(itemSaida);
                }
            });

            // Se está atualmente internado
            if (p.ativo) {
                const itemAtual = document.createElement('div');
                itemAtual.className = 'timeline-item';
                itemAtual.innerHTML = `
                    <div class="timeline-time">Atualmente</div>
                    <div class="timeline-title">Internado no Leito ${p.leito}</div>
                    <div class="timeline-desc">Quadro clínico monitorado em tempo real.</div>
                `;
                timelineContent.appendChild(itemAtual);
            }

            modalTimeline.classList.add('open');

            const btnFechar = document.getElementById('btn-fechar-timeline');
            if (btnFechar) {
                btnFechar.onclick = () => modalTimeline.remove('open') || modalTimeline.classList.remove('open');
            }
        }
    } catch (e) {
        console.error("Falha ao recuperar timeline histórica", e);
    }
}
