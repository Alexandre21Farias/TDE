// Lógica de Geração de Relatórios e Exportação

document.addEventListener('DOMContentLoaded', () => {
    carregarDadosRelatorio();

    const btnExportarPacientes = document.getElementById('btn-export-pacientes');
    if (btnExportarPacientes) {
        btnExportarPacientes.addEventListener('click', exportarPacientesCSV);
    }

    const btnExportarMedicos = document.getElementById('btn-export-medicos');
    if (btnExportarMedicos) {
        btnExportarMedicos.addEventListener('click', exportarMedicosCSV);
    }
});

async function carregarDadosRelatorio() {
    try {
        const stats = await API.get('/api/dashboard-stats');
        const pacientes = await API.get('/api/pacientes');
        const internacoes = await API.get('/api/internacoes');

        popularIndicadores(stats);
        popularTabelaResumo(pacientes);
        popularAuditoriaInternacoes(internacoes);
    } catch (e) {
        console.error("Falha ao inicializar relatórios.", e);
    }
}

function popularIndicadores(stats) {
    const kpiPac = document.getElementById('rep-total-pacientes');
    const kpiLeito = document.getElementById('rep-leitos-ocupados');
    const kpiMed = document.getElementById('rep-total-medicos');
    const kpiInt = document.getElementById('rep-total-internacoes');

    if (kpiPac) kpiPac.textContent = stats.totalPacientes;
    if (kpiLeito) kpiLeito.textContent = `${stats.leitosOcupados} / ${stats.maxLeitos} (${Math.round((stats.leitosOcupados / stats.maxLeitos) * 100)}%)`;
    if (kpiMed) kpiMed.textContent = stats.totalMedicos;
    if (kpiInt) kpiInt.textContent = stats.totalInternacoes;
}

function popularTabelaResumo(pacientes) {
    const tableBody = document.getElementById('table-resumo-pacientes');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    // Agrupar estatísticas
    const somaIdades = pacientes.filter(p => p.ativo).reduce((sum, p) => sum + p.idade, 0);
    const totalInternados = pacientes.filter(p => p.ativo).length;
    const mediaIdade = totalInternados > 0 ? (somaIdades / totalInternados).toFixed(1) : 'N/A';

    const maisIdoso = totalInternados > 0 
        ? pacientes.filter(p => p.ativo).reduce((max, p) => p.idade > max.idade ? p : max, { idade: 0 }) 
        : null;

    const rowMedia = document.createElement('tr');
    rowMedia.innerHTML = `
        <td><strong>Média de Idade dos Internados</strong></td>
        <td>${mediaIdade} anos</td>
    `;
    tableBody.appendChild(rowMedia);

    if (maisIdoso && maisIdoso.idade > 0) {
        const rowIdoso = document.createElement('tr');
        rowIdoso.innerHTML = `
            <td><strong>Paciente Mais Idoso Internado</strong></td>
            <td>${maisIdoso.nome} (${maisIdoso.idade} anos)</td>
        `;
        tableBody.appendChild(rowIdoso);
    }

    // Contagem de prioridades
    const criticos = pacientes.filter(p => p.ativo && p.prioridade === 'Vermelho').length;
    const urgentes = pacientes.filter(p => p.ativo && p.prioridade === 'Amarelo').length;
    const leves = pacientes.filter(p => p.ativo && p.prioridade === 'Verde').length;

    const rowCritico = document.createElement('tr');
    rowCritico.innerHTML = `
        <td><strong>Pacientes Críticos (Emergência - Vermelho)</strong></td>
        <td><span class="badge badge-red">${criticos}</span></td>
    `;
    tableBody.appendChild(rowCritico);

    const rowUrgente = document.createElement('tr');
    rowUrgente.innerHTML = `
        <td><strong>Pacientes Urgentes (Amarelo)</strong></td>
        <td><span class="badge badge-yellow">${urgentes}</span></td>
    `;
    tableBody.appendChild(rowUrgente);

    const rowLeve = document.createElement('tr');
    rowLeve.innerHTML = `
        <td><strong>Pacientes Pouco Urgentes (Verde)</strong></td>
        <td><span class="badge badge-green">${leves}</span></td>
    `;
    tableBody.appendChild(rowLeve);
}

function popularAuditoriaInternacoes(internacoes) {
    const tableBody = document.getElementById('table-auditoria-internacoes');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    // Mostrar as últimas 10 internações
    const ultimas = internacoes.slice(-10).reverse();

    if (ultimas.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhuma internação registrada no histórico.</td></tr>';
        return;
    }

    ultimas.forEach(i => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${i.id}</td>
            <td><strong>${i.paciente_nome}</strong></td>
            <td>${i.medico_nome}</td>
            <td>Leito ${i.leito}</td>
            <td><code>${i.data_entrada}</code></td>
            <td><span class="badge ${i.status === 1 ? 'badge-blue' : 'badge-green'}">${i.status === 1 ? 'Em Andamento' : `Alta em ${i.data_saida}`}</span></td>
        `;
        tableBody.appendChild(tr);
    });
}

// --- EXPORTADORES CSV ---
async function exportarPacientesCSV() {
    try {
        const pacientes = await API.get('/api/pacientes');
        if (pacientes.length === 0) {
            alert('Não há pacientes cadastrados para exportar.');
            return;
        }

        let csv = 'ID;Nome;Idade;Diagnostico;Leito;Status;Prioridade;Data Cadastro\n';
        pacientes.forEach(p => {
            csv += `${p.id};${p.nome};${p.idade};${p.diagnostico};${p.leito};${p.ativo ? 'Internado' : 'Alta'};${p.prioridade};${p.data_cadastro}\n`;
        });

        baixarCSVFile(csv, 'relatorio_pacientes.csv');
    } catch (e) {
        console.error("Falha ao exportar pacientes", e);
    }
}

async function exportarMedicosCSV() {
    try {
        const medicos = await API.get('/api/medicos');
        if (medicos.length === 0) {
            alert('Não há médicos cadastrados para exportar.');
            return;
        }

        let csv = 'ID;Nome;Especialidade;CRM;Escala;Ativo\n';
        medicos.forEach(m => {
            csv += `${m.id};${m.nome};${m.especialidade};${m.crm};${m.escala};${m.ativo ? 'Ativo' : 'Inativo'}\n`;
        });

        baixarCSVFile(csv, 'relatorio_medicos.csv');
    } catch (e) {
        console.error("Falha ao exportar médicos", e);
    }
}

function baixarCSVFile(csvContent, filename) {
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
