const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// Configurações do Banco de Dados em Arquivos
const DATA_DIR = path.join(__dirname, 'data');
const FILE_PACIENTES = path.join(DATA_DIR, 'pacientes.txt');
const FILE_MEDICOS = path.join(DATA_DIR, 'medicos.txt');
const FILE_INTERNACOES = path.join(DATA_DIR, 'internacoes.txt');
const FILE_LOGS = path.join(DATA_DIR, 'logs.txt');

// Garantir que a pasta de dados e arquivos existam
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
const initFile = (filePath) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '', 'utf8');
    }
};
initFile(FILE_PACIENTES);
initFile(FILE_MEDICOS);
initFile(FILE_INTERNACOES);
initFile(FILE_LOGS);

// --- AUXILIARES DE LOGS ---
function registrarLog(mensagem) {
    const timestamp = new Date().toISOString().replace('Z', '-03:00');
    const logLine = `[${timestamp}] ${mensagem}\n`;
    fs.appendFileSync(FILE_LOGS, logLine, 'utf8');
}

// --- PARSERS E SERIALIZERS ---
function lerPacientes() {
    const data = fs.readFileSync(FILE_PACIENTES, 'utf8');
    return data.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            const parts = line.split(';');
            return {
                id: parseInt(parts[0], 10),
                nome: parts[1] || '',
                idade: parseInt(parts[2], 10) || 0,
                diagnostico: parts[3] || '',
                leito: parseInt(parts[4], 10) || 0,
                ativo: parseInt(parts[5], 10) === 1,
                prioridade: parts[6] || 'Verde',
                data_cadastro: parts[7] || 'N/A'
            };
        });
}

function escreverPacientes(pacientes) {
    const lines = pacientes.map(p => 
        `${p.id};${p.nome};${p.idade};${p.diagnostico};${p.leito};${p.ativo ? 1 : 0};${p.prioridade};${p.data_cadastro}`
    );
    fs.writeFileSync(FILE_PACIENTES, lines.join('\n') + (lines.length ? '\n' : ''), 'utf8');
}

function lerMedicos() {
    const data = fs.readFileSync(FILE_MEDICOS, 'utf8');
    return data.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            const parts = line.split(';');
            return {
                id: parseInt(parts[0], 10),
                nome: parts[1] || '',
                especialidade: parts[2] || '',
                crm: parts[3] || '',
                escala: parts[4] || '',
                ativo: parseInt(parts[5], 10) === 1
            };
        });
}

function escreverMedicos(medicos) {
    const lines = medicos.map(m => 
        `${m.id};${m.nome};${m.especialidade};${m.crm};${m.escala};${m.ativo ? 1 : 0}`
    );
    fs.writeFileSync(FILE_MEDICOS, lines.join('\n') + (lines.length ? '\n' : ''), 'utf8');
}

function lerInternacoes() {
    const data = fs.readFileSync(FILE_INTERNACOES, 'utf8');
    return data.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            const parts = line.split(';');
            return {
                id: parseInt(parts[0], 10),
                id_paciente: parseInt(parts[1], 10),
                id_medico: parseInt(parts[2], 10),
                leito: parseInt(parts[3], 10),
                data_entrada: parts[4] || 'N/A',
                data_saida: parts[5] || 'N/A',
                status: parseInt(parts[6], 10) // 1 = ativa, 0 = inativa
            };
        });
}

function escreverInternacoes(internacoes) {
    const lines = internacoes.map(i => 
        `${i.id};${i.id_paciente};${i.id_medico};${i.leito};${i.data_entrada};${i.data_saida};${i.status}`
    );
    fs.writeFileSync(FILE_INTERNACOES, lines.join('\n') + (lines.length ? '\n' : ''), 'utf8');
}

// --- ENDPOINTS ---

// LOGIN ADMINISTRATIVO
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === '1234') {
        registrarLog("Login administrativo realizado com sucesso via Web.");
        res.json({ success: true, token: 'token-admin-hospital-system' });
    } else {
        registrarLog("Tentativa falha de login administrativo via Web.");
        res.status(401).json({ success: false, message: 'Senha incorreta!' });
    }
});

// PACIENTES CRUD
app.get('/api/pacientes', (req, res) => {
    res.json(lerPacientes());
});

app.post('/api/pacientes', (req, res) => {
    const { nome, idade, diagnostico, leito, prioridade } = req.body;
    const pacientes = lerPacientes();
    
    // Validar se leito já está ocupado por paciente ativo
    if (leito > 0) {
        const ocupado = pacientes.some(p => p.ativo && p.leito === parseInt(leito, 10));
        if (ocupado) {
            return res.status(400).json({ message: `Leito ${leito} já está ocupado.` });
        }
    }

    const newId = pacientes.reduce((max, p) => p.id > max ? p.id : max, 0) + 1;
    const data_cadastro = new Date().toISOString().split('T')[0];

    const novoPaciente = {
        id: newId,
        nome: nome || 'Sem Nome',
        idade: parseInt(idade, 10) || 0,
        diagnostico: diagnostico || 'Sem Diagnóstico',
        leito: parseInt(leito, 10) || 0,
        ativo: true,
        prioridade: prioridade || 'Verde',
        data_cadastro
    };

    pacientes.push(novoPaciente);
    escreverPacientes(pacientes);
    registrarLog(`Paciente '${novoPaciente.nome}' (ID ${novoPaciente.id}) cadastrado via Web.`);

    // Criar internação associada automaticamente com médico geral se alocado a um leito
    if (novoPaciente.leito > 0) {
        const internacoes = lerInternacoes();
        const nextIntId = internacoes.reduce((max, i) => i.id > max ? i.id : max, 0) + 1;
        const novaInt = {
            id: nextIntId,
            id_paciente: novoPaciente.id,
            id_medico: 4, // Dra. Juliana Mendes (Clínico Geral default para Web)
            leito: novoPaciente.leito,
            data_entrada: data_cadastro,
            data_saida: 'N/A',
            status: 1
        };
        internacoes.push(novaInt);
        escreverInternacoes(internacoes);
        registrarLog(`Internação automática no leito ${novoPaciente.leito} registrada para o paciente ${novoPaciente.nome}.`);
    }

    res.status(201).json(novoPaciente);
});

app.put('/api/pacientes/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { nome, idade, diagnostico, leito, prioridade, ativo } = req.body;
    let pacientes = lerPacientes();

    const idx = pacientes.findIndex(p => p.id === id);
    if (idx === -1) {
        return res.status(404).json({ message: 'Paciente não encontrado.' });
    }

    // Se mudou de leito ou ativou, valida ocupação
    if (leito && parseInt(leito, 10) !== pacientes[idx].leito && ativo !== false) {
        const ocupado = pacientes.some(p => p.id !== id && p.ativo && p.leito === parseInt(leito, 10));
        if (ocupado) {
            return res.status(400).json({ message: `Leito ${leito} já está ocupado.` });
        }
    }

    // Se está sendo desativado (recebeu alta)
    if (ativo === false && pacientes[idx].ativo === true) {
        pacientes[idx].ativo = false;
        const leitoLiberado = pacientes[idx].leito;
        registrarLog(`Alta médica concedida ao paciente '${pacientes[idx].nome}' (ID ${id}) via Web.`);
        
        // Finalizar internação no histórico
        let internacoes = lerInternacoes();
        const intIdx = internacoes.findIndex(i => i.id_paciente === id && i.status === 1);
        if (intIdx !== -1) {
            internacoes[intIdx].status = 0;
            internacoes[intIdx].data_saida = new Date().toISOString().split('T')[0];
            escreverInternacoes(internacoes);
        }
    } else {
        pacientes[idx].nome = nome !== undefined ? nome : pacientes[idx].nome;
        pacientes[idx].idade = idade !== undefined ? parseInt(idade, 10) : pacientes[idx].idade;
        pacientes[idx].diagnostico = diagnostico !== undefined ? diagnostico : pacientes[idx].diagnostico;
        pacientes[idx].leito = leito !== undefined ? parseInt(leito, 10) : pacientes[idx].leito;
        pacientes[idx].prioridade = prioridade !== undefined ? prioridade : pacientes[idx].prioridade;
        pacientes[idx].ativo = ativo !== undefined ? !!ativo : pacientes[idx].ativo;
        registrarLog(`Cadastro do paciente '${pacientes[idx].nome}' (ID ${id}) atualizado via Web.`);
    }

    escreverPacientes(pacientes);
    res.json(pacientes[idx]);
});

app.delete('/api/pacientes/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    let pacientes = lerPacientes();

    const idx = pacientes.findIndex(p => p.id === id);
    if (idx === -1) {
        return res.status(404).json({ message: 'Paciente não encontrado.' });
    }

    const pNome = pacientes[idx].nome;
    pacientes.splice(idx, 1);
    escreverPacientes(pacientes);
    
    // Remover internações associadas
    let internacoes = lerInternacoes();
    internacoes = internacoes.filter(i => i.id_paciente !== id);
    escreverInternacoes(internacoes);

    registrarLog(`Exclusão definitiva do paciente '${pNome}' (ID ${id}) via Web.`);
    res.json({ success: true });
});

// MEDICOS CRUD
app.get('/api/medicos', (req, res) => {
    res.json(lerMedicos());
});

app.post('/api/medicos', (req, res) => {
    const { nome, especialidade, crm, escala } = req.body;
    const medicos = lerMedicos();

    const newId = medicos.reduce((max, m) => m.id > max ? m.id : max, 0) + 1;
    const novoMedico = {
        id: newId,
        nome: nome || 'Sem Nome',
        especialidade: especialidade || 'Sem Especialidade',
        crm: crm || 'Sem CRM',
        escala: escala || 'Sem Escala',
        ativo: true
    };

    medicos.push(novoMedico);
    escreverMedicos(medicos);
    registrarLog(`Médico '${novoMedico.nome}' (ID ${novoMedico.id}) cadastrado via Web.`);

    res.status(201).json(novoMedico);
});

app.put('/api/medicos/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { nome, especialidade, crm, escala, ativo } = req.body;
    let medicos = lerMedicos();

    const idx = medicos.findIndex(m => m.id === id);
    if (idx === -1) {
        return res.status(404).json({ message: 'Médico não encontrado.' });
    }

    medicos[idx].nome = nome !== undefined ? nome : medicos[idx].nome;
    medicos[idx].especialidade = especialidade !== undefined ? especialidade : medicos[idx].especialidade;
    medicos[idx].crm = crm !== undefined ? crm : medicos[idx].crm;
    medicos[idx].escala = escala !== undefined ? escala : medicos[idx].escala;
    medicos[idx].ativo = ativo !== undefined ? !!ativo : medicos[idx].ativo;

    escreverMedicos(medicos);
    registrarLog(`Cadastro do médico '${medicos[idx].nome}' (ID ${id}) editado via Web.`);
    res.json(medicos[idx]);
});

app.delete('/api/medicos/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    let medicos = lerMedicos();

    const idx = medicos.findIndex(m => m.id === id);
    if (idx === -1) {
        return res.status(404).json({ message: 'Médico não encontrado.' });
    }

    const mNome = medicos[idx].nome;
    medicos.splice(idx, 1);
    escreverMedicos(medicos);

    registrarLog(`Exclusão definitiva do médico '${mNome}' (ID ${id}) via Web.`);
    res.json({ success: true });
});

// INTERNACOES & ALTAS
app.get('/api/internacoes', (req, res) => {
    const internacoes = lerInternacoes();
    const pacientes = lerPacientes();
    const medicos = lerMedicos();

    // Enriquecer dados com nomes
    const enriquecidas = internacoes.map(i => {
        const pac = pacientes.find(p => p.id === i.id_paciente);
        const med = medicos.find(m => m.id === i.id_medico);
        return {
            ...i,
            paciente_nome: pac ? pac.nome : 'Desconhecido',
            medico_nome: med ? med.nome : 'Desconhecido'
        };
    });
    res.json(enriquecidas);
});

app.post('/api/internacoes', (req, res) => {
    const { id_paciente, id_medico, leito } = req.body;
    let pacientes = lerPacientes();
    let medicos = lerMedicos();
    let internacoes = lerInternacoes();

    const pIdx = pacientes.findIndex(p => p.id === parseInt(id_paciente, 10));
    if (pIdx === -1) return res.status(404).json({ message: 'Paciente não localizado.' });

    const mIdx = medicos.findIndex(m => m.id === parseInt(id_medico, 10));
    if (mIdx === -1) return res.status(404).json({ message: 'Médico não localizado.' });

    // Validar se leito está ocupado
    const ocupado = pacientes.some(p => p.ativo && p.leito === parseInt(leito, 10));
    if (ocupado) return res.status(400).json({ message: `Leito ${leito} já está ocupado.` });

    // Atualiza Paciente
    pacientes[pIdx].ativo = true;
    pacientes[pIdx].leito = parseInt(leito, 10);
    escreverPacientes(pacientes);

    // Cria Internação
    const nextIntId = internacoes.reduce((max, i) => i.id > max ? i.id : max, 0) + 1;
    const data_entrada = new Date().toISOString().split('T')[0];
    const novaInt = {
        id: nextIntId,
        id_paciente: parseInt(id_paciente, 10),
        id_medico: parseInt(id_medico, 10),
        leito: parseInt(leito, 10),
        data_entrada,
        data_saida: 'N/A',
        status: 1
    };

    internacoes.push(novaInt);
    escreverInternacoes(internacoes);

    registrarLog(`Paciente '${pacientes[pIdx].nome}' alocado no leito ${leito} sob cuidados do Dr. '${medicos[mIdx].nome}'.`);
    res.status(201).json(novaInt);
});

// LOGS
app.get('/api/logs', (req, res) => {
    const data = fs.readFileSync(FILE_LOGS, 'utf8');
    const logs = data.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .reverse() // Mais recentes primeiro
        .slice(0, 100); // Limite das últimas 100 entradas
    res.json(logs);
});

// DASHBOARD STATS
app.get('/api/dashboard-stats', (req, res) => {
    const pacientes = lerPacientes();
    const internacoes = lerInternacoes();
    const medicos = lerMedicos();

    const totalPacientes = pacientes.length;
    const internados = pacientes.filter(p => p.ativo);
    const leitosOcupados = internados.length;
    const maxLeitos = 100; // Equivalente ao MAX_PACIENTES da CLI
    const leitosLivres = maxLeitos - leitosOcupados;

    const criticos = internados.filter(p => p.prioridade === 'Vermelho').length;
    const urgentes = internados.filter(p => p.prioridade === 'Amarelo').length;
    const leves = internados.filter(p => p.prioridade === 'Verde').length;

    res.json({
        totalPacientes,
        leitosOcupados,
        leitosLivres,
        maxLeitos,
        criticos,
        urgentes,
        leves,
        totalMedicos: medicos.filter(m => m.ativo).length,
        totalInternacoes: internacoes.length
    });
});

app.listen(PORT, () => {
    console.log(`[Broker Server] Servidor executando em http://localhost:${PORT}`);
});
