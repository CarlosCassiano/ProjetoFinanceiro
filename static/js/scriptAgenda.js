let calendar = null;
let currentCityFilter = null; // Variável para armazenar o filtro atual
let eventSource = null;


// Cores padrão (15 cores variadas)
const defaultColors = [
    '#3788d8', '#4CAF50', '#FF5722', '#9C27B0', 
    '#FFC107', '#607D8B', '#795548', '#E91E63',
    '#3F51B5', '#00BCD4', '#8BC34A', '#FF9800',
    '#673AB7', '#009688', '#F44336'
];

// Configura o seletor de cores
function setupColorSelector() {
    const defaultColorsContainer = document.querySelector('.default-colors');
    const colorInput = document.getElementById('event-color');
    
    defaultColors.forEach(color => {
        const colorOption = document.createElement('div');
        colorOption.className = 'color-option';
        colorOption.style.backgroundColor = color;
        colorOption.dataset.color = color;
        
        colorOption.addEventListener('click', function() {
            // Define a cor selecionada no input
            colorInput.value = color;
            
            // Atualiza a seleção visual
            document.querySelectorAll('.color-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
        });
        
        defaultColorsContainer.appendChild(colorOption);
    });
    
    // Atualiza a seleção quando a cor é alterada no input
    colorInput.addEventListener('input', function() {
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.color === this.value);
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        locale: 'pt-br',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        buttonText: {
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia',
            list: 'Lista'
        },
        dayHeaderFormat: { weekday: 'long' },
        titleFormat: { year: 'numeric', month: 'long' },
        allDayText: 'Dia inteiro',
        noEventsText: 'Nenhum evento para mostrar',
        initialView: 'dayGridMonth',
        views: {
            timeGridWeek: {
                type: 'timeGrid',
                duration: { weeks: 1 },
                buttonText: 'Semana'
            },
            timeGridDay: {
                type: 'timeGrid',
                duration: { days: 1 },
                buttonText: 'Dia'
            }
        },
        selectable: true,
        editable: true,
        eventDrop: function(info) {
            atualizarEventoDragDrop(info.event);
        },
        eventResize: function(info) {
            atualizarEventoDragDrop(info.event);
        },
        eventSources: [],
        eventDisplay: 'block',
        nowIndicator: true,
        allDaySlot: false,
        slotMinTime: '00:00:00',
        slotMaxTime: '23:00:00',
        eventDidMount: function(info) {
            if (info.event.extendedProps.color) {
                info.el.style.backgroundColor = info.event.extendedProps.color;
                info.el.style.borderColor = info.event.extendedProps.color;
            }
        },
        dateClick: function(info) {
            abrirModal(info.dateStr);
        },
        eventClick: function(info) {
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
    carregarCidades();
    setupColorSelector();
    
    const cidadeFilter = document.getElementById('cidade');
    cidadeFilter.addEventListener('change', function() {
        currentCityFilter = this.value;
        refreshCalendarEvents();
    });
});

// Função principal para atualizar eventos
async function refreshCalendarEvents() {
    try {
        // Mostra estado de carregamento
        document.getElementById('calendar').style.opacity = '0.5';
        
        // 1. Remove todas as fontes de eventos existentes
        calendar.getEventSources().forEach(source => source.remove());
        
        // 2. Se há filtro ativo, carrega apenas os eventos daquela cidade
        if (currentCityFilter) {
            await loadCityEvents(currentCityFilter);
        } 
        // 3. Se não há filtro, carrega todos os eventos
        else {
            await loadAllEvents();
        }
        
    } catch (error) {
        console.error("Erro ao atualizar eventos:", error);
        alert("Erro ao carregar eventos: " + error.message);
    } finally {
        // Restaura opacidade
        document.getElementById('calendar').style.opacity = '1';
    }
}

// Carrega eventos de uma cidade específica
async function loadCityEvents(cidadeId) {
    return new Promise((resolve, reject) => {
        const eventSource = {
            id: 'city-' + cidadeId,
            events: function(fetchInfo, successCallback, failureCallback) {
                fetch(`/api/eventos/cidade/${cidadeId}?start=${fetchInfo.start.toISOString()}&end=${fetchInfo.end.toISOString()}`)
                    .then(response => {
                        if (!response.ok) throw new Error('Erro ao buscar eventos');
                        return response.json();
                    })
                    .then(eventos => {
                        successCallback(eventos);
                        resolve();
                    })
                    .catch(error => {
                        failureCallback(error);
                        reject(error);
                    });
            }
        };
        
        calendar.addEventSource(eventSource);
        currentEventSource = eventSource;
    });
}

// Carrega todos os eventos (sem filtro)
async function loadAllEvents() {
    return new Promise((resolve, reject) => {
        const eventSource = {
            id: 'all-events',
            events: function(fetchInfo, successCallback, failureCallback) {
                fetch(`/api/eventos?start=${fetchInfo.start.toISOString()}&end=${fetchInfo.end.toISOString()}`)
                    .then(response => {
                        if (!response.ok) throw new Error('Erro ao buscar eventos');
                        return response.json();
                    })
                    .then(eventos => {
                        successCallback(eventos);
                        resolve();
                    })
                    .catch(error => {
                        failureCallback(error);
                        reject(error);
                    });
            }
        };
        
        calendar.addEventSource(eventSource);
        currentEventSource = eventSource;
    });
}

// Funções do modal (mantidas como estão)
let selectedDate = null;
let eventId = null;

function abrirModal(dateStr, title = '', end = '', id = null, cidadeId = null, description = '', color = '#3788d8') {
    selectedDate = dateStr;
    eventId = id;

    // Mostrar botão de excluir apenas se for uma edição (tem ID)
    const btnExcluir = document.getElementById('btn-excluir');
    btnExcluir.style.display = id ? 'block' : 'none';

    document.getElementById('event-title').value = title;
    document.getElementById('start-time').value = dateStr.slice(11, 16);
    document.getElementById('end-time').value = end ? end.slice(11, 16) : dateStr.slice(11, 16);
    document.getElementById('event-description').value = description || '';
    document.getElementById('event-color').value = color;
    
    // Seleciona a cor padrão correspondente
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.color === color);
    });

    if (cidadeId) {
        document.getElementById('event-city').value = cidadeId;
    }
    
    document.getElementById('modal').style.display = 'block';
}

// Função para excluir evento
async function excluirEvento() {
    if (!eventId || !confirm('Tem certeza que deseja excluir este evento?')) {
        return;
    }

    try {
        const response = await fetch(`/api/eventos/${eventId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir evento');
        }

        const result = await response.json();
        alert(result.message);
        refreshCalendarEvents();
        fecharModal();
        
    } catch (error) {
        console.error('Erro ao excluir evento:', error);
        alert('Erro ao excluir evento: ' + error.message);
    }
}

function fecharModal() {
    document.getElementById('event-form').reset();
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    document.getElementById('modal').style.display = 'none';
}
window.fecharModal = fecharModal;

function carregarCidades() {
    fetch('/cidades')
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar cidades');
            return response.json();
        })
        .then(cidades => {
            const cidadeFilter = document.getElementById('cidade');
            cidadeFilter.innerHTML = '<option value="">Selecione uma cidade</option>';
            
            const cidadeModal = document.getElementById('event-city');
            cidadeModal.innerHTML = '<option value="">Selecione uma cidade</option>';
            
            cidades.forEach(cidade => {
                const option = document.createElement('option');
                option.value = cidade.id;
                option.textContent = cidade.cidade;
                
                cidadeFilter.appendChild(option);
                cidadeModal.appendChild(option.cloneNode(true));
            });
        })
        .catch(error => {
            console.error('Erro ao buscar cidades:', error);
        });
}

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

    const url = eventId ? `/api/eventos/${eventId}` : '/api/eventos';
    const method = eventId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
    })
    .then(response => {
        if (!response.ok) throw new Error('Erro ao salvar evento');
        return response.json();
    })
    .then(() => {
        // Substitua applyCityFilter por refreshCalendarEvents
        refreshCalendarEvents();
        fecharModal();
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao salvar evento: ' + error.message);
    });
});


// Função para atualizar evento quando arrastado ou redimensionado
async function atualizarEventoDragDrop(evento) {
    try {
        const eventData = {
            title: evento.title,
            start: evento.startStr,
            end: evento.endStr,
            description: evento.extendedProps.description,
            color: evento.extendedProps.color,
            cidade_id: evento.extendedProps.cidade_id
        };

        const response = await fetch(`/api/eventos/${evento.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar evento');
        }

        const result = await response.json();
        console.log('Evento atualizado:', result.message);
        
    } catch (error) {
        console.error('Erro ao atualizar evento:', error);
        
        // Reverte a mudança visual no calendário se a atualização falhar
        evento.refetch();
        
        alert('Erro ao atualizar evento: ' + error.message);
    }
}