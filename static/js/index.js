document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar')

    const events = getEvents()

    let currentEventIndex = undefined;

    const calendar = new FullCalendar.Calendar(calendarEl, {
        customButtons: {
            addTask: {
                text: 'Добавить событие', click: onAddEventClicked
            }
        },
        headerToolbar: {
            left: 'listWeek,multiMonthYear,dayGridMonth today',
            center: 'title,addTask',
            right: 'prev,next',
        },
        eventClick: function (info) {
            const currentBorderColor = info.el.style.borderColor
            const currentBackgroundColor = info.el.style.backgroundColor

            info.el.style.borderColor = '#2828ba';
            info.el.style.backgroundColor = '#4545ca';

            modalEventInfo._element.addEventListener('hidden.bs.modal', function () {
                info.el.style.borderColor = currentBorderColor;
                info.el.style.backgroundColor = currentBackgroundColor;
            })

            modalEventInfoTitleValue.value = info.event.title
            modalEventInfoDescriptionValue.value = info.event.extendedProps.description
            modalEventInfo.show()
        },

        multiMonthMaxColumns: 2,
        timeZone: 'Europe/Moscow',
        locale: "ru",
        initialView: 'dayGridMonth',
        events: events,
        selectable: true,
        dateClick: function (e) {
            console.log(e)
        },
        eventDidMount: (arg) => {
            arg.el.addEventListener("contextmenu", (e) => {
                e.preventDefault()

                const selectedEvent = arg.event
                currentEventIndex = events.findIndex((event) => event.id === selectedEvent.id);

            })
            arg.el.className = arg.el.className + " context-menu"
        },

    })

    calendar.render()

    const modalEventInfo = new bootstrap.Modal(document.getElementById('modal-event-info'));
    const modalEventInfoTitleValue = document.querySelector('#event-info-title-value');
    const modalEventInfoDescriptionValue = document.querySelector('#event-info-description-value');

    const modalAddEvent = new bootstrap.Modal(document.getElementById('add-event-modal'));

    const modalAddEventCloseButton = document.querySelector('.btn-close');
    const modalAddEventSubmitButton = document.getElementById('submit-button');

    const modalAddEventTitle = document.getElementById('modal-title');

    const modalAddEventEventTitleInput = document.getElementById('event-title');
    const modalAddEventEventDescriptionInput = document.getElementById('event-description');
    const modalAddEventEventCategorySelect = document.getElementById('event-category');
    const modalAddEventEventPrioritySelect = document.getElementById('event-priority');
    const modalAddEventEventRepeatableCheckbox = document.getElementById('event-repeatable');
    const modalAddEventEventRepeatableSelect = document.getElementById('event-repeatable');
    const modalAddEventEventRepeatableIntervalSpinbox = document.getElementById('event-repeat-interval');
    const modalAddEventEventRepeatableUnitSelect = document.getElementById('event-repeat-unit');
    const modalAddEventStartDateInput = document.getElementById('event-start-date');
    const modalAddEventEndDateInput = document.getElementById('event-end-date');
    const modalAddEventUntilDateInput = document.getElementById('event-until-date');
    const modalAddEventColorInput = document.getElementById('event-color');

    const repeatEventGroup = document.getElementById('repeat-event-group');

    $(function () {
        $.contextMenu({
            selector: '.context-menu',
            callback: onEventContextMenuClicked,
            items: {
                "edit_by_id": {name: "Изменить текущее", icon: "edit"},
                "edit_by_parent": {name: "Изменить все связанные", icon: "edit"},
                "delete_by_id": {name: "Удалить текущее", icon: "delete"},
                "delete_by_parent_id": {name: "Удалить все связанные", icon: "delete"},
            }
        });

        $('.context-menu-one').on('click', function (e) {
            console.log('clicked', this);
        })
    });

    function onEventContextMenuClicked(key, options, e) {
        if (key === "edit_by_id") {
            onEditEventClicked(key, options, e)
        } else if (key === "edit_by_parent") {
            onEditAllEventClicked(key, options, e)
        } else if (key === "delete_by_parent_id") {
            onDeleteEventByParentIDClicked(key, options, e)
        } else if (key === "delete_by_id") {
            onDeleteEventByIDClicked(key, options, e)
        }
    }

    function getEvents() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/events', false); // Синхронный запрос
        xhr.send();

        if (xhr.status === 200) {
            return JSON.parse(xhr.responseText);
        } else {
            console.log(xhr);
        }
    }

    function clearModal() {
        modalAddEventEventTitleInput.value = ""
        modalAddEventEventDescriptionInput.value = ""
        modalAddEventEventCategorySelect.selectedIndex = 0
        modalAddEventEventPrioritySelect.selectedIndex = 0
        modalAddEventEventRepeatableSelect.checked = false
        modalAddEventEventRepeatableIntervalSpinbox.value = ""
        modalAddEventEventRepeatableUnitSelect.selectedIndex = 0
        modalAddEventStartDateInput.value = "дд.мм.гггг"
        modalAddEventEndDateInput.value = "дд.мм.гггг"
        modalAddEventUntilDateInput.value = "дд.мм.гггг"
        modalAddEventColorInput.value = "#3788d8"
        repeatEventGroup.style.display = 'none'
    }

    function fillModal(event) {
        modalAddEventEventTitleInput.value = event.title
        modalAddEventEventDescriptionInput.value = event.extendedProps.description
        modalAddEventEventCategorySelect.selectedIndex = indexMatchingText(modalAddEventEventCategorySelect, event.extendedProps.category)
        modalAddEventEventPrioritySelect.selectedIndex = indexMatchingText(modalAddEventEventPrioritySelect, event.extendedProps.priority)
        modalAddEventEventRepeatableSelect.checked = event.extendedProps.repeatable
        if (event.extendedProps.repeatable) {
            repeatEventGroup.style.display = 'block';
        } else {
            repeatEventGroup.style.display = 'none';
        }
        modalAddEventEventRepeatableIntervalSpinbox.value = event.extendedProps.interval
        modalAddEventEventRepeatableUnitSelect.selectedIndex = indexMatchingText(modalAddEventEventRepeatableUnitSelect, event.extendedProps.freq)
        modalAddEventStartDateInput.value = event.start
        modalAddEventEndDateInput.value = event.end
        modalAddEventUntilDateInput.value = event.extendedProps.until
        modalAddEventColorInput.value = event.backgroundColor
    }

    function indexMatchingText(ele, text) {
        for (var i = 0; i < ele.length; i++) {
            console.log(ele[i].innerText)
            console.log(ele[i].value)
            if (ele[i].innerText === text || ele[i].value === text) {
                return i;
            }
        }
        return 0;
    }

    function onAddEventClicked(e) {
        e.preventDefault()

        clearModal()

        modalAddEventTitle.innerHTML = 'Новое событие'
        modalAddEventSubmitButton.innerHTML = 'Добавить'
        modalAddEventSubmitButton.classList.remove('btn-primary');
        modalAddEventSubmitButton.classList.add('btn-success');

        modalAddEvent.show();
    }

    function onEditEventClicked(key, options, e) {
        e.preventDefault()

        clearModal()

        const event = events[currentEventIndex]
        modalAddEventTitle.innerHTML = 'Изменить событие'
        modalAddEventSubmitButton.innerHTML = 'Сохранить'
        modalAddEventSubmitButton.classList.remove('btn-primary');
        modalAddEventSubmitButton.classList.add('btn-success');

        fillModal(event)

        modalAddEvent.show()
    }

    function onEditAllEventClicked(key, options, e) {
        e.preventDefault()

        clearModal()

        const event = events[currentEventIndex]
        modalAddEventTitle.innerHTML = 'Изменить событие'
        modalAddEventSubmitButton.innerHTML = 'Сохранить все'
        modalAddEventSubmitButton.classList.remove('btn-primary');
        modalAddEventSubmitButton.classList.add('btn-success');

        fillModal(event)

        modalAddEvent.show()
    }

    function onDeleteEventByIDClicked(key, options, e) {
        e.preventDefault()

        const event = events[currentEventIndex]

        $.ajax({
            url: '/events/delete_by_id',
            method: 'delete',
            data: JSON.stringify(event),
            contentType: 'application/json',
            success: function (data) {
                location.reload();
            },
            error: function (data) {
                console.log("ERROR: \n" + JSON.stringify(data))
                alert("ERROR: \n" + JSON.stringify(data));
            },
        });

    }

    function onDeleteEventByParentIDClicked(key, options, e) {
        e.preventDefault()

        const event = events[currentEventIndex]

        $.ajax({
            url: '/events/delete_by_parent',
            method: 'delete',
            data: JSON.stringify(event),
            contentType: 'application/json',
            success: function (data) {
                location.reload();
            },
            error: function (data) {
                console.log("ERROR: \n" + JSON.stringify(data))
                alert("ERROR: \n" + JSON.stringify(data));
            },
        });

    }

    function validateModal() {
        if (modalAddEventEventTitleInput.value.replaceAll(" ", "") === "") {
            modalAddEventEventTitleInput.classList.add('is-invalid')
            setTimeout(
                () => modalAddEventEventTitleInput.classList.remove('is-invalid'),
                5000
            );
            alert("Укажите название события")
            return false
        }

        if (modalAddEventStartDateInput.value === "") {
            modalAddEventStartDateInput.classList.add('is-invalid')
            setTimeout(
                () => modalAddEventStartDateInput.classList.remove('is-invalid'),
                5000
            );
            alert("Не выбрана дата начала события")
            return false
        }

        if (modalAddEventEndDateInput.value === "") {
            modalAddEventEndDateInput.classList.add('is-invalid')
            setTimeout(
                () => modalAddEventEndDateInput.classList.remove('is-invalid'),
                5000
            );
            alert("Не выбрана дата завершения события")
            return false
        }

        const startDate = new Date(modalAddEventStartDateInput.value)
        const endDate = new Date(modalAddEventEndDateInput.value)

        if (!(startDate <= endDate)) {

            modalAddEventStartDateInput.classList.add('is-invalid')
            setTimeout(
                () => modalAddEventStartDateInput.classList.remove('is-invalid'),
                5000
            );

            modalAddEventEndDateInput.classList.add('is-invalid')
            setTimeout(
                () => modalAddEventEndDateInput.classList.remove('is-invalid'),
                5000
            );

            alert("Дата начала события не может быть больше даты завершения")
            return false
        }

        if (modalAddEventEventRepeatableSelect.checked) {
            if (!Number.parseInt(modalAddEventEventRepeatableIntervalSpinbox.value)) {
                modalAddEventEventRepeatableIntervalSpinbox.classList.add('is-invalid')
                setTimeout(
                    () => modalAddEventEventRepeatableIntervalSpinbox.classList.remove('is-invalid'),
                    5000
                );
                alert("Не указана частота повторения события")
                return false
            }

            if (modalAddEventUntilDateInput.value === "") {
                modalAddEventUntilDateInput.classList.add('is-invalid')
                setTimeout(
                    () => modalAddEventUntilDateInput.classList.remove('is-invalid'),
                    5000
                );
                alert("Не выбрана дата до которой необходимо повторять событие")
                return false
            }
        }

        return true
    }

    function getEvent() {
        const event = {
            id: crypto.randomUUID(),
            title: modalAddEventEventTitleInput.value,
            backgroundColor: modalAddEventColorInput.value,
            start: modalAddEventStartDateInput.value,
            end: modalAddEventEndDateInput.value,

            extendedProps: {
                parentID: crypto.randomUUID(),
                description: modalAddEventEventDescriptionInput.value,
                category: modalAddEventEventCategorySelect.value,
                priority: modalAddEventEventPrioritySelect.value,
                interval: Number.parseInt(modalAddEventEventRepeatableIntervalSpinbox.value),
                freq: modalAddEventEventRepeatableUnitSelect.value,
                until: modalAddEventUntilDateInput.value,
                repeatable: modalAddEventEventRepeatableSelect.checked,
            },
        }

        if (!modalAddEventEventRepeatableSelect.checked) {
            event.extendedProps.interval = 1;
            event.extendedProps.until = event.end;
        }

        return event
    }

    modalAddEventCloseButton.addEventListener('click', () => {
        modalAddEvent.hide()
    });

    modalAddEventEventRepeatableCheckbox.addEventListener('change', function () {
        if (this.checked) {
            repeatEventGroup.style.display = 'block';
        } else {
            repeatEventGroup.style.display = 'none';
        }
    });

    modalAddEventSubmitButton.addEventListener('click', function (e) {
        e.preventDefault()

        if (!validateModal()) {
            return
        }

        const event = getEvent()
        const currentEvent = events[currentEventIndex]
        if (modalAddEventSubmitButton.innerHTML === "Добавить") {
            $.ajax({
                url: '/events/add',
                method: 'post',
                data: JSON.stringify(event),
                contentType: 'application/json',
                success: function (data) {
                    location.reload();
                },
                error: function (data) {
                    console.log("ERROR: \n" + JSON.stringify(data))
                    alert("ERROR: \n" + JSON.stringify(data));
                },
            });
        } else if (modalAddEventSubmitButton.innerHTML === "Сохранить") {
            event.id = currentEvent.id
            event.extendedProps.parentID = currentEvent.extendedProps.parentID

            $.ajax({
                url: '/events/edit_by_id',
                method: 'put',
                data: JSON.stringify(event),
                contentType: 'application/json',
                success: function (data) {
                    location.reload();
                },
                error: function (data) {
                    console.log("ERROR: \n" + JSON.stringify(data))
                    alert("ERROR: \n" + JSON.stringify(data));
                },
            });
        } else if (modalAddEventSubmitButton.innerHTML === "Сохранить все") {
            event.id = currentEvent.id
            event.extendedProps.parentID = currentEvent.extendedProps.parentID

            $.ajax({
                url: '/events/edit_by_parent',
                method: 'put',
                data: JSON.stringify(event),
                contentType: 'application/json',
                success: function (data) {
                    location.reload();
                },
                error: function (data) {
                    console.log("ERROR: \n" + JSON.stringify(data))
                    alert("ERROR: \n" + JSON.stringify(data));
                },
            });
        }

        modalAddEvent.hide();
    })
})