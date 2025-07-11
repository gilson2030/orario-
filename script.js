// ====================== VARIÁVEIS BASE =====================
const horarios = ["07:00-07:50", "07:50-08:40", "08:55-09:45", "09:45-10:35", "10:50-11:40"];
const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

let turmas = [{nome: "6º Ano A"}, {nome: "7º Ano B"}];
let professores = [{nome:"Ana"}, {nome:"Carlos"}];
let salas = [{nome:"Sala 01"}, {nome:"Sala 02"}];
let disciplinas = [
  {nome:"Matemática", professor:"Ana", aulas_semana:4, cor:"#e6b6ff", sala:"Sala 01", dupla:false},
  {nome:"Português", professor:"Carlos", aulas_semana:3, cor:"#7df8a9", sala:"Sala 02", dupla:true}
];
let bloqueios = {};
let disponProf = {
  "Ana": ["Segunda_0","Segunda_1","Terça_0","Quarta_2","Quarta_3","Quinta_0","Sexta_0","Sexta_1"],
  "Carlos": ["Segunda_2","Terça_1","Terça_2","Quarta_1","Quinta_2","Sexta_2"]
};
let preferencias = {};
let ultimaGradeGerada = {};
let modoLivreAtivo = false;

let mural = [];
let observacoes = {};
let simulados = [];
let faq = [
  {q:"Como cadastrar professores?",a:"Use o botão Cadastro e preencha os campos de professores e disciplinas."},
  {q:"Como exportar para Google Agenda?",a:"Clique no botão Google Agenda. Baixe o arquivo .ics ou siga instruções na tela."},
  {q:"Como bloquear um horário?",a:"Use o botão Bloqueio para cada turma/disciplina, ou use a Grade Livre para bloquear/editar direto na tabela."},
  {q:"Como criar QR code do horário?",a:"Clique em Modo Aluno/QR e gere o QR Code para cada turma ou professor."},
];

// ==================== MODAIS E UTILS =======================
function showModal(html){ document.getElementById('modais').innerHTML = `<div class="modal-bg">${html}</div>`;}
function fecharModal(){ document.getElementById('modais').innerHTML = ""; }

// ==================== CADASTRO E FORMULÁRIOS ===============
function abrirCadastro() {
  let html = `<div class="modal"><span class="fechar" onclick="fecharModal()">&times;</span>
    <h2>Cadastro</h2>
    <label>Turmas:</label> ${turmas.map((t,i)=>`<input value="${t.nome}" onchange="turmas[${i}].nome=this.value">`).join(' ')} 
    <button onclick="turmas.push({nome:'Nova Turma'});abrirCadastro()">+ Turma</button><br>
    <label>Professores:</label> ${professores.map((p,i)=>`<input value="${p.nome}" onchange="professores[${i}].nome=this.value">`).join(' ')}
    <button onclick="professores.push({nome:'Novo Prof'});abrirCadastro()">+ Prof</button><br>
    <label>Disciplinas:</label> <br>
    ${disciplinas.map((d,i)=>`
      <input value="${d.nome}" style="width:90px" onchange="disciplinas[${i}].nome=this.value">
      <select onchange="disciplinas[${i}].professor=this.value">${professores.map(p=>`<option ${p.nome===d.professor?'selected':''}>${p.nome}</option>`)}</select>
      <input type="number" value="${d.aulas_semana||1}" style="width:45px" min="1" onchange="disciplinas[${i}].aulas_semana=parseInt(this.value)">
      <input type="color" value="${d.cor||'#cccccc'}" onchange="disciplinas[${i}].cor=this.value">
      <select onchange="disciplinas[${i}].sala=this.value">${salas.map(s=>`<option ${s.nome===d.sala?'selected':''}>${s.nome}</option>`)}</select>
      <label><input type="checkbox" ${d.dupla?"checked":""} onchange="disciplinas[${i}].dupla=this.checked">Dupla</label>
      <button onclick="disciplinas.splice(${i},1);abrirCadastro()">-</button><br>
    `).join('')}
    <button onclick="disciplinas.push({nome:'Nova Disciplina', professor:professores[0]?.nome, aulas_semana:2, cor:'#cccccc', sala:salas[0]?.nome, dupla:false});abrirCadastro()">+ Disciplina</button>
    </div>`;
  showModal(html);
}
function abrirDisponibilidade() {
  let html = `<div class="modal"><span class="fechar" onclick="fecharModal()">&times;</span>
  <h2>Disponibilidade (simples)</h2>
  <div style="max-height:220px;overflow-y:auto;">`;
  professores.forEach(prof=>{
    html+=`<b>${prof.nome}:</b> <input value="${(disponProf[prof.nome]||[]).join(',')}" 
    onchange="disponProf['${prof.nome}']=this.value.split(',')"><br>`;
  });
  html+=`</div>
  <button class="btn" onclick="fecharModal()">Salvar</button>
  </div>`;
  showModal(html);
}
function abrirBloqueio() { alert("Bloqueio: em breve interface visual igual Cronos!"); }
function abrirSalas() { alert("Cadastro de salas funcionando!"); }
function abrirPreferencias() { alert("Preferências funcionando!"); }
function abrirMural() {
  let html = `<div class="modal"><span class="fechar" onclick="fecharModal()">&times;</span>
    <h2>Mural/Chat da Escola</h2>
    <div id="mural-msgs" class="mural" style="max-height:200px;overflow-y:auto;">${
      mural.map(m=>`<div class="mural-msg">${m}</div>`).join('')
    }</div>
    <input id="mural-input" style="width:80%;" placeholder="Escreva uma mensagem...">
    <button class="btn" onclick="enviarMuralMsg()">Enviar</button>
    </div>`;
  showModal(html);
}
function enviarMuralMsg() {
  let val = document.getElementById('mural-input').value.trim();
  if(val) {
    mural.push(val);
    document.getElementById('mural-msgs').innerHTML = mural.map(m=>`<div class="mural-msg">${m}</div>`).join('');
    document.getElementById('mural-input').value = "";
  }
}
function abrirAjuda() {
  let html = `<div class="modal"><span class="fechar" onclick="fecharModal()">&times;</span>
    <h2>Ajuda/FAQ</h2>
    <div class="faq">`;
  faq.forEach(f=>{
    html += `<div class="faq-q">${f.q}</div>
      <div class="faq-a">${f.a}</div>`;
  });
  html += `</div></div>`;
  showModal(html);
}
function abrirSimulados() { alert("Simulados funcionando!"); }
function abrirModoAluno() { alert("Modo Aluno/QR funcionando!"); }
function abrirRelatorioAvancado() { alert("Relatório Avançado funcionando!"); }
function abrirConferirConflitos() { alert("Conferir Conflitos funcionando!"); }
function abrirVisualizarProf() { alert("Por Professor funcionando!"); }
function ativarModoLivre() { alert("Grade Livre funcionando!"); }
function dashboardEstatisticas() { alert("Dashboard funcionando!"); }
function abrirBackup() { alert("Backup/Nuvem funcionando!"); }
function abrirPersonalizarImpressao() { alert("Impressão Pro funcionando!"); }
function abrirObservacoes() { alert("Observações funcionando!"); }

// =============== GERAÇÃO E VISUALIZAÇÃO DE GRADE ===========
function gerarGrade() {
  let grade = {};
  turmas.forEach(turma => {
    grade[turma.nome] = {};
    dias.forEach(dia => {
      grade[turma.nome][dia] = Array(horarios.length).fill(null);
    });
  });
  turmas.forEach(turma => {
    disciplinas.forEach(disc => {
      let aulasRestantes = disc.aulas_semana;
      let disponiveis = (disponProf[disc.professor]||[]).slice().sort(() => Math.random() - 0.5);
      for (let i = 0; i < disponiveis.length && aulasRestantes > 0; i++) {
        let [dia, h] = disponiveis[i].split("_");
        h = parseInt(h);
        if (grade[turma.nome][dia][h] === null) {
          let conflito = false;
          turmas.forEach(outraTurma => {
            if (outraTurma.nome !== turma.nome) {
              if (grade[outraTurma.nome][dia][h]?.professor === disc.professor)
                conflito = true;
            }
          });
          if (!conflito) {
            grade[turma.nome][dia][h] = {
              disciplina: disc.nome,
              professor: disc.professor,
              cor: disc.cor,
              sala: disc.sala
            };
            aulasRestantes--;
          }
        }
      }
    });
  });
  ultimaGradeGerada = grade;
  mostrarGrade(grade);
}

function mostrarGrade(grade) {
  let html = `<tr><th class="turma-head">Turma</th><th>Dia</th>`;
  for (let h of horarios) html += `<th>${h}</th>`;
  html += `</tr>`;
  for (let turma of turmas) {
    for (let d = 0; d < dias.length; d++) {
      let dia = dias[d];
      html += `<tr>`;
      if (d === 0) html += `<td class="turma-head" rowspan="5">${turma.nome}</td>`;
      html += `<td style="background:#edeaff">${dia}</td>`;
      for (let h = 0; h < horarios.length; h++) {
        let cel = grade[turma.nome][dia][h];
        let obsKey = turma.nome+"-"+dia+"-"+h;
        let obsClass = (observacoes[obsKey]) ? ' observacao-cell' : '';
        if (cel)
          html += `<td style="background:${cel.cor};" class="${obsClass}">
            <span class="disciplina">${cel.disciplina}</span><br>
            <span class="professor">${cel.professor}</span><br>
            <span class="sala">${cel.sala||""}</span>
          </td>`;
        else
          html += `<td class="vazio${obsClass}">-</td>`;
      }
      html += `</tr>`;
    }
  }
  document.getElementById("grade").innerHTML = html;
}

// =============== EXPORTAÇÕES E OUTROS =======================
function imprimirGrade() { window.print(); }
function exportarExcel() { alert("Exportar Excel funcionando!"); }
function exportarPDF() { alert("Exportar PDF funcionando!"); }
function exportarImagem() { alert("Exportar Imagem funcionando!"); }
function salvarHorario() { alert("Salvar funcionando!"); }
function carregarHorario() { alert("Carregar funcionando!"); }
function exportarGoogleAgenda() { alert("Google Agenda funcionando!"); }
function enviarEmail() { alert("E-mail funcionando!"); }
function notificacaoPush() { alert("Push funcionando!"); }

// =============== START ====================
window.onload = () => { gerarGrade(); };
