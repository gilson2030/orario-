function mostrarGrade(grade) {
  // Exemplo: atualiza a tabela (coloque seu código real aqui)
  document.getElementById("grade").innerHTML = "<tr><td>Grade exibida!</td></tr>";
}
function abrirCadastro() {
  alert("Cadastro funcionando!");
}
function abrirDisponibilidade() {
  alert("Disponibilidade funcionando!");
}
// ============ VARIÁVEIS E BASE DO SISTEMA ============
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

// =========== MODAIS E UTILS ===========
function showModal(html){ document.getElementById('modais').innerHTML = `<div class="modal-bg">${html}</div>`;}
function fecharModal(){ document.getElementById('modais').innerHTML = ""; }

// =========== CADASTRO (MINI) ===========
function abrirCadastro() {
  let html = `<div class="modal"><span class="fechar" onclick="fecharModal()">&times;</span>
    <h2>Cadastro Rápido</h2>
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
function gerarGrade() {
  // Inicializa grade vazia
  let grade = {};
  turmas.forEach(turma => {
    grade[turma.nome] = {};
    dias.forEach(dia => {
      grade[turma.nome][dia] = Array(horarios.length).fill(null);
    });
  });

  // Preenche disciplinas nas turmas, respeitando restrições
  turmas.forEach(turma => {
    disciplinas.forEach(disc => {
      let aulasRestantes = disc.aulas_semana;
      let prof = professores.find(p => p.nome === disc.professor);
      let disponiveis = (disponProf[disc.professor]||[]).slice().sort(() => Math.random() - 0.5);

      for (let i = 0; i < disponiveis.length && aulasRestantes > 0; i++) {
        let [dia, h] = disponiveis[i].split("_");
        h = parseInt(h);

        if (grade[turma.nome][dia][h] === null) {
          // Checa se o professor já está em outro horário
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

// Mostra grade visual
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
// Exemplo inicial dos dados (restante do cadastro e grade como já mostrado antes...)
let mural = []; // mensagens do mural/chat
let observacoes = {}; // observacoes["turma-dia-hora"] = "texto obs"
let simulados = []; // {turma, dia, hora, descricao}
let faq = [
  {q:"Como cadastrar professores?",a:"Use o botão Cadastro e preencha os campos de professores e disciplinas."},
  {q:"Como exportar para Google Agenda?",a:"Clique no botão Google Agenda. Baixe o arquivo .ics ou siga instruções na tela."},
  {q:"Como bloquear um horário?",a:"Use o botão Bloqueio para cada turma/disciplina, ou use a Grade Livre para bloquear/editar direto na tabela."},
  {q:"Como criar QR code do horário?",a:"Clique em Modo Aluno/QR e gere o QR Code para cada turma ou professor."},
];

function exportarGoogleAgenda() {
  // Gera arquivo .ics básico (ICS = formato universal de calendário)
  let eventos = [];
  turmas.forEach(turma=>{
    dias.forEach((dia,dIdx)=>{
      for(let h=0;h<horarios.length;h++) {
        let cel = ultimaGradeGerada[turma.nome]?.[dia]?.[h];
        if(cel && cel.disciplina) {
          let evento = [
            "BEGIN:VEVENT",
            "SUMMARY:"+cel.disciplina + " ("+turma.nome+")",
            "DESCRIPTION:Professor: "+cel.professor+" | Sala: "+(cel.sala||""),
            "DTSTART;TZID=America/Sao_Paulo:2024070"+(dIdx+1)+"T"+horarios[h].replace(":","")+"00",
            "DTEND;TZID=America/Sao_Paulo:2024070"+(dIdx+1)+"T"+(parseInt(horarios[h].split(":")[0])+1)+horarios[h].split(":")[1]+"00",
            "END:VEVENT"
          ];
          eventos.push(evento.join("\n"));
        }
      }
    });
  });
  let ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    ...eventos,
    "END:VCALENDAR"
  ].join("\n");
  let blob = new Blob([ics],{type:"text/calendar"});
  let link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = "grade-horarios.ics";
  link.click();
  alert("Arquivo para Google Agenda baixado!");
}

function enviarEmail() {
  alert("Funcionalidade disponível apenas para integração com backend ou Gmail API. (Aqui, simulação.)");
  // Você pode implementar envio real usando serviço como EmailJS, backend, ou API Google.
}

function notificacaoPush() {
  alert("Notificações push reais exigem backend/PWA, mas aqui pode usar Notification API.\nSe o navegador pedir, autorize!");
  if ("Notification" in window) {
    Notification.requestPermission().then(function(permission) {
      if(permission === "granted") {
        new Notification("Seu quadro de horários foi atualizado!");
      }
    });
  }
}

function abrirModoAluno() {
  let html = <div class="modal"><span class="fechar" onclick="fecharModal()">&times;</span>
    <h2>Modo Aluno/QR Code</h2>
    <p>Escolha a turma ou professor para gerar o QR Code do horário individual.</p>
    <button class="btn" onclick="gerarQRCodeTurma()">Por Turma</button>
    <button class="btn" onclick="gerarQRCodeProf()">Por Professor</button>
    <div id="qrcode-area-modal"></div>
    </div>;
  showModal(html);
}
function gerarQRCodeTurma() {
  let html = <h4>Selecione a Turma:</h4>;
  turmas.forEach(t=>{
    html += <button class="prof-btn" onclick="exibirQRCode('${t.nome}','turma')">${t.nome}</button>;
  });
  document.getElementById('qrcode-area-modal').innerHTML = html;
}
function gerarQRCodeProf() {
  let html = <h4>Selecione o Professor:</h4>;
  professores.forEach(p=>{
    html += <button class="prof-btn" onclick="exibirQRCode('${p.nome}','prof')">${p.nome}</button>;
  });
  document.getElementById('qrcode-area-modal').innerHTML = html;
}
function exibirQRCode(nome,tipo) {
  let dados="";
  if(tipo==="turma") {
    dados = JSON.stringify(ultimaGradeGerada[nome]);
  } else {
    // monta grade só desse professor
    let result = {};
    dias.forEach(dia=>{
      result[dia] = horarios.map((_,h)=>{
        let found=null;
        turmas.forEach(turma=>{
          let cel = ultimaGradeGerada[turma.nome]?.[dia]?.[h];
          if(cel && cel.professor===nome) found={...cel,turma:turma.nome};
        });
        return found;
      });
    });
    dados = JSON.stringify(result);
  }
  document.getElementById('qrcode-area-modal').innerHTML = <div id="qrcode"></div>;
  new QRCode(document.getElementById("qrcode"), {text:dados, width:256, height:256});
}

function dashboardEstatisticas() {
  let html = <div class="dashboard"><h2>Dashboard de Estatísticas</h2>;
  // Exemplo: Ocupação de salas, professores, janelas...
  html += <div class="dashboard-c"><b>Salas Mais Ocupadas:</b><br>;
  salas.forEach(s=>{
    let count=0;
    turmas.forEach(turma=>{
      dias.forEach(dia=>{
        for(let h=0;h<horarios.length;h++){
          let cel = ultimaGradeGerada[turma.nome]?.[dia]?.[h];
          if(cel && cel.sala===s.nome) count++;
        }
      });
    });
    html+=${s.nome}: ${count} aulas<br>;
  });
  html+=</div>;
  html += <div class="dashboard-c"><b>Professores Mais Ativos:</b><br>;
  professores.forEach(p=>{
    let aulas=0;
    turmas.forEach(turma=>{
      dias.forEach(dia=>{
        for(let h=0;h<horarios.length;h++){
          let cel = ultimaGradeGerada[turma.nome]?.[dia]?.[h];
          if(cel && cel.professor===p.nome) aulas++;
        }
      });
    });
    html+=${p.nome}: ${aulas} aulas<br>;
  });
  html+=</div>;
  html += </div>;
  document.getElementById('dashboard-area').innerHTML = html;
  setTimeout(()=>{document.getElementById('dashboard-area').innerHTML='';},9000);
}

function abrirSimulados() {
  let html = <div class="modal"><span class="fechar" onclick="fecharModal()">&times;</span>
    <h2>Calendário de Simulados</h2>
    <p>Adicione simulados/provas para cada turma:</p>;
  simulados.forEach((s,i)=>{
    html+=<div>${s.turma} - ${s.dia} - ${horarios[s.hora]}: ${s.descricao} <button onclick="remSimulado(${i})">Remover</button></div>;
  });
  html+=<br>
    <select id="sim-turma">${turmas.map(t=><option>${t.nome}</option>)}</select>
    <select id="sim-dia">${dias.map(d=><option>${d}</option>)}</select>
    <select id="sim-hora">${horarios.map((h,i)=><option value="${i}">${h}</option>)}</select>
    <input id="sim-desc" placeholder="Descrição do simulado" style="width:180px;">
    <button class="btn" onclick="addSimulado()">Adicionar</button>
    </div>;
  showModal(html);
}
function addSimulado() {
  let turma = document.getElementById("sim-turma").value;
  let dia = document.getElementById("sim-dia").value;
  let hora = +document.getElementById("sim-hora").value;
  let descricao = document.getElementById("sim-desc").value.trim();
  simulados.push({turma, dia, hora, descricao});
  fecharModal(); abrirSimulados();
}
function remSimulado(idx) {
  simulados.splice(idx,1);
  fecharModal(); abrirSimulados();
}

// Observações em células
function abrirObservacoes() {
  let html = <div class="modal"><span class="fechar" onclick="fecharModal()">&times;</span>
    <h2>Observações</h2>
    <p>Clique em qualquer célula da grade para adicionar ou visualizar observações específicas.</p></div>;
  showModal(html);
  setTimeout(()=>{fecharModal();}, 3200);
}
document.addEventListener("click", function(e){
  if(e.target && e.target.tagName==="TD" && document.getElementById("grade").contains(e.target)){
    if(!modoLivreAtivo && !e.target.classList.contains('turma-head')){
      let turma, dia, h;
      let tr = e.target.parentNode;
      let turmaName = tr.querySelector('.turma-head')?.innerText;
      if(!turmaName) {
        let prevTr = tr.previousSibling;
        while(prevTr && !prevTr.querySelector('.turma-head')) prevTr = prevTr.previousSibling;
        turmaName = prevTr?.querySelector('.turma-head')?.innerText;
      }
      dia = tr.children[1]?.innerText;
      h = e.target.cellIndex - 2;
      let key = turmaName+"-"+dia+"-"+h;
      let val = observacoes[key]||"";
      showModal(<div class='modal'><span class='fechar' onclick='fecharModal()'>&times;</span>
        <b>Observação para ${turmaName} / ${dia} / ${horarios[h]}</b><br>
        <textarea id='obs-text' style='width:94%;height:70px;'>${val}</textarea><br>
        <button class='btn' onclick='salvarObs("${key}")'>Salvar</button>
      </div>);
    }
  }
});
function salvarObs(key){
  let v = document.getElementById('obs-text').value.trim();
  if(v) observacoes[key]=v;
  else delete observacoes[key];
  fecharModal();
  mostrarGrade(ultimaGradeGerada);
}

// Exibir observações na tabela (adicione em mostrarGrade)
const oldMostrarGrade = mostrarGrade;
mostrarGrade = function(grade) {
  oldMostrarGrade(grade); // chama função original
  // Destaca células com observação
  setTimeout(()=>{
    Object.keys(observacoes).forEach(key=>{
      let [turma,dia,h] = key.split("-");
      let table = document.getElementById("grade");
      if(table) {
        for(let r=0; r<table.rows.length; r++) {
          let row = table.rows[r];
          if(row.cells[0] && row.cells[0].innerText===turma && row.cells[1] && row.cells[1].innerText===dia) {
            let c = +h + 2;
            if(row.cells[c]) row.cells[c].classList.add("observacao-cell");
          }
        }
      }
    });
  }, 60);
}

// Mural/Chat simples
function abrirMural() {
  let html = <div class="modal"><span class="fechar" onclick="fecharModal()">&times;</span>
    <h2>Mural/Chat da Escola</h2>
    <div id="mural-msgs" class="mural" style="max-height:200px;overflow-y:auto;">${
      mural.map(m=><div class="mural-msg">${m}</div>).join('')
    }</div>
    <input id="mural-input" style="width:80%;" placeholder="Escreva uma mensagem...">
    <button class="btn" onclick="enviarMuralMsg()">Enviar</button>
    </div>;
  showModal(html);
}
function enviarMuralMsg() {
  let val = document.getElementById('mural-input').value.trim();
  if(val) {
    mural.push(val);
    document.getElementById('mural-msgs').innerHTML = mural.map(m=><div class="mural-msg">${m}</div>).join('');
    document.getElementById('mural-input').value = "";
  }
}

// FAQ/Ajuda Interativa
function abrirAjuda() {
  let html = <div class="modal"><span class="fechar" onclick="fecharModal()">&times;</span>
    <h2>Ajuda/FAQ</h2>
    <div class="faq">;
  faq.forEach(f=>{
    html += <div class="faq-q">${f.q}</div>
      <div class="faq-a">${f.a}</div>;
  });
  html += </div></div>;
  showModal(html);
}

// Personalização de impressão (exemplo básico)
function abrirPersonalizarImpressao() {
  let html = <div class="modal"><span class="fechar" onclick="fecharModal()">&times;</span>
    <h2>Personalização de Impressão</h2>
    <label>Logo (URL): <input id="print-logo" style="width:220px"></label><br>
    <label>Cabeçalho: <input id="print-head" style="width:220px"></label><br>
    <label>Rodapé: <input id="print-foot" style="width:220px"></label><br>
    <button class="btn" onclick="aplicarPersonalizacaoPrint()">Aplicar</button>
    </div>;
  showModal(html);
}
function aplicarPersonalizacaoPrint() {
  let logo = document.getElementById("print-logo").value;
  let head = document.getElementById("print-head").value;
  let foot = document.getElementById("print-foot").value;
  localStorage.setItem("printLogo",logo);
  localStorage.setItem("printHead",head);
  localStorage.setItem("printFoot",foot);
  fecharModal();
  alert("Personalização aplicada para próxima impressão/exportação!");
}
function exportarPDF() {
  const doc = new jspdf.jsPDF({orientation:"landscape"});
  doc.setFontSize(16);
  let logo = localStorage.getItem("printLogo");
  let head = localStorage.getItem("printHead") || "Grade de Horários Escolar";
  let foot = localStorage.getItem("printFoot") || "";
  if(logo) {
    let img = new Image();
    img.src = logo;
    img.onload = ()=>{ 
      doc.addImage(img, 'PNG', 10, 6, 36, 16);
      doc.text(head, 50, 16);
      pdfMain();
    };
  } else {
    doc.text(head, 14, 16);
    pdfMain();
  }
  function pdfMain() {
    html2canvas(document.getElementById("grade-container")).then(canvas=>{
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 10, 30, 270, 0);
      if(foot) doc.text(foot, 14, 204);
      doc.save("grade-horarios.pdf");
    });
  }
}
window.onload = () => {
  gerarGrade();
};
