let calendar = null;

document.addEventListener('DOMContentLoaded', function () {
    // Inicializa o calendário
    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        selectable: true,
        editable: true,
        events: '/api/eventos', // Carrega todos os eventos inicialmente
        eventDisplay: 'block',
        eventDidMount: function(info) {
            if (info.event.extendedProps.color) {
                info.el.style.backgroundColor = info.event.extendedProps.color;
            }
        },
        dateClick: function (info) {
            abrirModal(info.dateStr);
        },
        eventClick: function (info) {
            abrirModal(
                info.event.startStr, 
                info.event.title, 
                info.event.endStr, 
                info.event.id, 
                info.event.extendedProps.cidade_id,
                info.event.extendedProps.description,
                info.event.extendedProps.color
            );
        }
    });

    calendar.render();
    
    // Carrega as cidades para ambos os selects
    carregarCidades();
    
    const cidadeFilter = document.getElementById('cidade');
    cidadeFilter.addEventListener('change', async function() {
      const cidadeId = this.value;
    
      try {
        if (cidadeId) {
            // Mostra loading (opcional)
            document.getElementById('calendar').style.opacity = '0.5';
            
            const response = await fetch(`/api/eventos/cidade/${cidadeId}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao buscar eventos');
            }
            
            const eventos = await response.json();
            calendar.removeAllEvents();
            
            if (eventos.length > 0) {
                calendar.addEventSource(eventos);
            } else {
                alert('Nenhum evento encontrado para esta cidade');
                calendar.refetchEvents(); // Mostra todos os eventos novamente
            }
        } else {
            calendar.refetchEvents();
        }
    } catch (error) {
        console.error("Erro ao filtrar eventos:", error);
        alert(error.message);
    } finally {
        // Esconde loading (opcional)
        document.getElementById('calendar').style.opacity = '1';
    }
  });
});

// Funções do modal (mantenha as que você já tem)
let selectedDate = null;
let eventId = null;

function abrirModal(dateStr, title = '', end = '', id = null, cidadeId = null, description = '', color = '#3788d8') {
    selectedDate = dateStr;
    eventId = id;

    // Preenche os campos do modal
    document.getElementById('event-title').value = title;
    document.getElementById('start-time').value = dateStr.slice(11, 16);
    document.getElementById('end-time').value = end ? end.slice(11, 16) : dateStr.slice(11, 16);
    document.getElementById('event-description').value = description || '';
    document.getElementById('event-color').value = color;
    
    // Seleciona a cidade se estiver editando
    if (cidadeId) {
        document.getElementById('event-city').value = cidadeId;
    }
    
    document.getElementById('modal').style.display = 'block';
}

function fecharModal() {
    document.getElementById('event-form').reset();
    document.getElementById('modal').style.display = 'none';
}
window.fecharModal = fecharModal;

// Carrega as cidades para os selects
function carregarCidades() {
    fetch('/cidades')
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar cidades');
            return response.json();
        })
        .then(cidades => {
            // Preenche o select do filtro
            const cidadeFilter = document.getElementById('cidade');
            cidadeFilter.innerHTML = '<option value="">Selecione uma cidade</option>';
            
            // Preenche o select do modal
            const cidadeModal = document.getElementById('event-city');
            cidadeModal.innerHTML = '<option value="">Selecione uma cidade</option>';
            
            // Adiciona as cidades a ambos os selects
            cidades.forEach(cidade => {
                const option = document.createElement('option');
                option.value = cidade.id;
                option.textContent = cidade.cidade;
                
                // Clona a opção para ambos os selects
                cidadeFilter.appendChild(option);
                cidadeModal.appendChild(option.cloneNode(true));
            });
        })
        .catch(error => {
            console.error('Erro ao buscar cidades:', error);
        });
}

// Manipulador do formulário (mantenha o que você já tem)
document.getElementById('event-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const title = document.getElementById('event-title').value;
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    const description = document.getElementById('event-description').value;
    const color = document.getElementById('event-color').value;
    const cidadeId = document.getElementById('event-city').value;
    
    if (!cidadeId) {
        alert('Selecione uma cidade!');
        return;
    }

    const dateOnly = selectedDate.split('T')[0];
    const start = `${dateOnly}T${startTime}:00`;
    const end = `${dateOnly}T${endTime}:00`;

    const eventData = {
        title: title,
        start: start,
        end: end,
        description: description,
        color: color,
        cidade_id: cidadeId
    };

    if (eventId) {
        // Atualizar evento
        fetch(`/api/eventos/${eventId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        })
        .then(() => {
            calendar.refetchEvents();
            fecharModal();
        });
    } else {
        // Criar evento
        fetch('/api/eventos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        })
        .then(() => {
            calendar.refetchEvents();
            fecharModal();
        });
    }
});