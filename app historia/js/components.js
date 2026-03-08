/**
 * SHCV - Componentes Reutilizables
 * Funciones para generar HTML de componentes
 */

const Components = {
    /**
     * Genera una Stat Card
     */
    statCard(label, value, variant = 'primary') {
        return `
            <div class="stat-card ${variant}">
                <div class="stat-card-label">${label}</div>
                <div class="stat-card-value">${value}</div>
            </div>
        `;
    },

    /**
     * Genera un Counter Card
     */
    counterCard(label, value, trend, icon, variant = 'primary') {
        return `
            <div class="counter-card">
                <div class="counter-icon ${variant}">${icon}</div>
                <div class="counter-info">
                    <div class="counter-label">${label}</div>
                    <div class="counter-value">${value}</div>
                    ${trend ? `<div class="counter-trend">${trend}</div>` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Genera un item de notificación
     */
    notificationItem(notification) {
        return `
            <div class="notification-item">
                <div class="notification-icon ${notification.type === 'info' ? 'blue' : 'green'}">
                    ${notification.icon}
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-text">${notification.message}</div>
                </div>
                <div class="notification-time">${notification.time}</div>
            </div>
        `;
    },

    /**
     * Genera un item de mensaje
     */
    messageItem(msg) {
        return `
            <div class="message-item">
                <div class="avatar" style="background-color: ${msg.color}; color: white;">
                    ${msg.avatar}
                </div>
                <div class="notification-content">
                    <div class="notification-title">${msg.sender}</div>
                    <div class="notification-text">${msg.message}</div>
                </div>
                <div class="notification-time">${msg.time}</div>
            </div>
        `;
    },

    /**
     * Genera un item de horario
     */
    scheduleItem(schedule) {
        return `
            <div class="schedule-item ${schedule.active ? 'active' : ''}">
                <span class="schedule-day">${schedule.day}</span>
                ${schedule.time ?
                `<span class="schedule-time">${schedule.time}</span>` :
                '<span class="schedule-time" style="opacity: 0.5;">--</span>'
            }
            </div>
        `;
    },

    /**
     * Genera un item de paciente para la lista
     */
    patientItem(patient, owner) {
        const age = DataService.calculateAge(patient.birthDate);
        const emoji = DataService.getSpeciesEmoji(patient.species);

        return `
            <div class="patient-item" data-patient-id="${patient.id}">
                <div class="patient-avatar">${emoji}</div>
                <div class="patient-info">
                    <div class="patient-name">${patient.name}</div>
                    <div class="patient-details">
                        ${patient.breed} • ${patient.sex === 'male' ? '♂ Macho' : '♀ Hembra'} • ${age} • ${patient.weight} kg
                    </div>
                    <div class="patient-owner">👤 ${owner ? owner.fullName : 'Sin propietario'}</div>
                </div>
                <div class="patient-status">
                    <span class="badge badge-primary">${patient.medicalRecordNumber}</span>
                </div>
            </div>
        `;
    },

    /**
     * Genera un badge
     */
    badge(text, variant = 'primary') {
        return `<span class="badge badge-${variant}">${text}</span>`;
    },

    /**
     * Genera un item de timeline
     */
    timelineItem(date, title, content) {
        return `
            <div class="timeline-item">
                <div class="timeline-date">${date}</div>
                <div class="timeline-content">
                    <div class="timeline-title">${title}</div>
                    <div class="timeline-text">${content}</div>
                </div>
            </div>
        `;
    },

    /**
     * Genera una tabla
     */
    table(headers, rows, emptyMessage = 'No hay datos disponibles') {
        if (rows.length === 0) {
            return this.emptyState('📋', 'Sin registros', emptyMessage);
        }

        const headerHtml = headers.map(h => `<th>${h}</th>`).join('');
        const rowsHtml = rows.map(row => {
            const cells = row.map(cell => `<td>${cell}</td>`).join('');
            return `<tr>${cells}</tr>`;
        }).join('');

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>${headerHtml}</tr>
                    </thead>
                    <tbody>${rowsHtml}</tbody>
                </table>
            </div>
        `;
    },

    /**
     * Genera un estado vacío
     */
    emptyState(icon, title, text) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">${icon}</div>
                <div class="empty-state-title">${title}</div>
                <div class="empty-state-text">${text}</div>
            </div>
        `;
    },

    /**
     * Genera un loading spinner
     */
    loading() {
        return `
            <div class="empty-state">
                <div class="spinner"></div>
                <div class="empty-state-title" style="margin-top: 16px;">Cargando...</div>
            </div>
        `;
    },

    /**
     * Genera un Card container
     */
    card(content, className = '') {
        return `<div class="card ${className}">${content}</div>`;
    },

    /**
     * Genera un panel con header
     */
    panel(title, actionText, actionHref, content) {
        return `
            <div class="card">
                <div class="panel-header">
                    <span class="panel-title">${title}</span>
                    ${actionText ? `<a href="${actionHref || '#'}" class="panel-action">${actionText}</a>` : ''}
                </div>
                ${content}
            </div>
        `;
    },

    /**
     * Genera el gráfico de barras (versión simple con CSS)
     */
    barChart(data) {
        const maxValue = Math.max(...data.datasets.flatMap(d => d.data));

        const barsHtml = data.labels.map((label, i) => {
            const bars = data.datasets.map(dataset => {
                const value = dataset.data[i];
                const height = (value / maxValue) * 100;
                return `<div class="bar" style="height: ${height}%; background-color: ${dataset.color};" title="${dataset.label}: ${value}"></div>`;
            }).join('');

            return `
                <div class="chart-bar-group">
                    <div class="chart-bars">${bars}</div>
                    <div class="chart-label">${label}</div>
                </div>
            `;
        }).join('');

        return `
            <div class="simple-bar-chart">
                <div class="chart-y-axis">
                    <span>100</span>
                    <span>80</span>
                    <span>60</span>
                    <span>40</span>
                    <span>20</span>
                    <span>0</span>
                </div>
                <div class="chart-bars-container">
                    ${barsHtml}
                </div>
            </div>
            <style>
                .simple-bar-chart {
                    display: flex;
                    gap: 16px;
                    height: 250px;
                }
                .chart-y-axis {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    font-size: 12px;
                    color: var(--color-text-muted);
                    padding-bottom: 24px;
                }
                .chart-bars-container {
                    flex: 1;
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    gap: 8px;
                    border-bottom: 1px solid var(--color-border);
                    padding-bottom: 24px;
                    position: relative;
                }
                .chart-bar-group {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    height: 100%;
                }
                .chart-bars {
                    flex: 1;
                    display: flex;
                    gap: 4px;
                    align-items: flex-end;
                    width: 100%;
                }
                .bar {
                    flex: 1;
                    min-width: 8px;
                    max-width: 20px;
                    border-radius: 4px 4px 0 0;
                    transition: height 0.3s ease;
                }
                .bar:hover {
                    opacity: 0.8;
                }
                .chart-label {
                    font-size: 11px;
                    color: var(--color-text-muted);
                    margin-top: 8px;
                    white-space: nowrap;
                }
            </style>
        `;
    },

    /**
     * Genera un formulario de búsqueda
     */
    searchInput(placeholder, id) {
        return `
            <div class="search-input">
                <span>🔍</span>
                <input type="text" id="${id}" placeholder="${placeholder}">
            </div>
        `;
    },

    /**
     * Genera un botón
     */
    button(text, variant = 'primary', icon = '', className = '', id = '') {
        return `
            <button class="btn btn-${variant} ${className}" ${id ? `id="${id}"` : ''}>
                ${icon ? `<span>${icon}</span>` : ''}
                ${text}
            </button>
        `;
    },

    /**
     * Genera un item de información
     */
    infoItem(label, value) {
        return `
            <div class="info-item">
                <div class="info-label">${label}</div>
                <div class="info-value">${value || '-'}</div>
            </div>
        `;
    }
};
