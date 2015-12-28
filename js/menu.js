lanet_tv.Menu = (function () {
    var instance;

    function init() {
        var body = document.getElementsByTagName('body')[0],
            menu = document.createElement('div'),
            root = document.createElement('div'),
            list = document.createElement('div'),
            footer = document.createElement('div'),
            clock = document.createElement('div'),
            menu_items = [],
            full_channel_list = [],
            current_channel_list = [],
            selected_channel,
            selected_menu_item,
            current_limits = {min: 0, max: 0},
            clock_update_interval = 0,
            hints = [
                {
                    icon: 'like',
                    color: 'red',
                    name: 'Лайк'
                },
                {
                    icon: 'pip',
                    color: 'green',
                    name: 'Картинка в картинке'
                },
                {
                    icon: 'star',
                    color: 'yellow',
                    name: 'В избранное'
                },
                {
                    icon: 'bookmark',
                    color: 'blue',
                    name: 'Смотреть позже'
                }
            ], categories = [
                {
                    icon: 'selection',
                    name: 'Мой выбор',
                    items: []
                },
                {
                    icon: 'view_list',
                    name: 'Списки',
                    items: [{
                        name: 'Избранное'
                    }, {
                        name: 'Все'
                    }]
                },
                {
                    icon: 'genres',
                    name: 'Жанры',
                    items: []
                },
                {
                    icon: 'tags',
                    name: 'Теги',
                    items: []
                },
                {
                    icon: 'settings',
                    name: 'Настройки',
                    items: []
                }
            ],
            createElement = function () {
                menu.id = 'menu';
                root.className = 'root';
                list.className = 'list';
                footer.className = 'footer';
                clock.className = 'clock';
                categories.forEach(function (category) {
                    var category_element = document.createElement('div'),
                        category_content = document.createElement('div');
                    // IE does not support class list multi-add
                    category_element.classList.add('category');
                    category_element.classList.add('icon');
                    category_element.classList.add(category.icon);
                    category_element.innerHTML = category.name;
                    category_content.classList.add('content');
                    root.appendChild(category_element);
                    var children = [];
                    category.items.forEach(function (item) {
                        var category_item = document.createElement('div');
                        category_item.classList.add('item');
                        category_item.classList.add('hidden');
                        category_item.innerHTML = item.name;
                        root.appendChild(category_item);
                        children.push(category_item);
                    });
                    menu_items.push({
                        element: category_element,
                        children: children
                    });
                });
                hints.forEach(function (hint) {
                    var item = document.createElement('div');
                    // IE does not support class list multi-add
                    item.classList.add('hint');
                    item.classList.add('icon');
                    item.classList.add(hint.color);
                    item.classList.add(hint.icon);
                    item.innerHTML = hint.name;
                    footer.appendChild(item)
                });
                menu.appendChild(root);
                menu.appendChild(list);
                footer.appendChild(clock);
                menu.appendChild(footer);
                return menu;
            },
            setClock = function (time) {
                clock.innerHTML = time;
            },
            visibleItems = function () {
                var result = list.getBoundingClientRect().height / 104;
                return {
                    visible: Math.floor(result),
                    extra: result % 1 !== 0
                }
            },
            renderCurrentPage = function () {
                resetSelection();
                Helpers.removeChildren(list);
                var index = full_channel_list.indexOf(full_channel_list.filter(function (channel) {
                    return channel.element.classList.contains('current')
                })[0]), counter, visible = visibleItems(), page = Math.floor(index / visible.visible);
                current_channel_list = [];
                selected_channel = index - page * visibleItems().visible;
                current_limits.min = visible.visible * page;
                current_limits.max = current_limits.min + visible.visible;
                for (counter = current_limits.min; counter < current_limits.max + (visible.extra ? 1 : 0) && full_channel_list[counter]; counter++) {
                    current_channel_list.push(full_channel_list[counter]);
                    list.appendChild(full_channel_list[counter].element);
                }
                current_channel_list[selected_channel].element.classList.add('selected');
            },
            renderNextPage = function () {
                resetSelection();
                selected_channel = 0;
                Helpers.removeChildren(list);
                current_channel_list = [];
                var counter, visible = visibleItems();
                current_limits.min = current_limits.max;
                current_limits.max = current_limits.min + visible.visible;
                for (counter = current_limits.min; counter < current_limits.max + (visible.extra ? 1 : 0) && full_channel_list[counter]; counter++) {
                    current_channel_list.push(full_channel_list[counter]);
                    list.appendChild(full_channel_list[counter].element);
                }
                current_channel_list[selected_channel].element.classList.add('selected');
            },
            renderPreviousPage = function () {
                resetSelection();
                Helpers.removeChildren(list);
                current_channel_list = [];
                var counter, visible = visibleItems();
                current_limits.min = current_limits.min - visible.visible;
                current_limits.max = current_limits.min + visible.visible;
                for (counter = current_limits.min; counter < current_limits.max + (visible.extra ? 1 : 0) && full_channel_list[counter]; counter++) {
                    current_channel_list.push(full_channel_list[counter]);
                    list.appendChild(full_channel_list[counter].element);
                }
                selected_channel = current_channel_list.length - (visible.extra ? 2 : 1);
                current_channel_list[selected_channel].element.classList.add('selected');
            },
            resetSelection = function () {
                if (current_channel_list[selected_channel])
                    current_channel_list[selected_channel].element.classList.remove('selected');
            };
        body.appendChild(createElement());
        return {
            show: function () {
                renderCurrentPage();
                setClock(Time.asObject().getHhMm());
                menu.style.visibility = 'visible';
                update();
                clock_update_interval = setInterval(function () {
                    setClock(Time.asObject().getHhMm());
                }, 1000);
                //Helpers.showNode(menu);
            },
            hide: function () {
                menu.style.visibility = 'hidden';
                clearInterval(clock_update_interval);
                //Helpers.hideNode(menu);
            },
            expand: function () {
                menu.classList.add('expanded');
                selected_menu_item = -1;
                this.selectNextItem();
            },
            collapse: function () {
                menu.classList.remove('expanded');
                if (menu_items[selected_menu_item])
                    menu_items[selected_menu_item].element.classList.remove('selected');
            },
            setChannels: function (channels) {
                full_channel_list = channels;
            },
            selectNextChannel: function () {
                if (current_limits.max > full_channel_list.length - 1) {
                    if (selected_channel + 1 < visibleItems().visible - (current_limits.max - full_channel_list.length)) {
                        current_channel_list[selected_channel].element.classList.remove('selected');
                        selected_channel++;
                        current_channel_list[selected_channel].element.classList.add('selected');
                    }
                } else {
                    current_channel_list[selected_channel].element.classList.remove('selected');
                    if (selected_channel < current_channel_list.length - (visibleItems().extra ? 2 : 1)) {
                        selected_channel++;
                        current_channel_list[selected_channel].element.classList.add('selected');
                    } else {
                        renderNextPage()
                    }
                }
            },
            selectPreviousChannel: function () {
                if (current_limits.min > 0 || selected_channel > 0)
                    current_channel_list[selected_channel].element.classList.remove('selected');
                if (selected_channel > 0) {
                    selected_channel--;
                    current_channel_list[selected_channel].element.classList.add('selected');
                } else if (current_limits.min > 0) {
                    renderPreviousPage()
                }
            },
            getSelectedChannel: function () {
                return current_channel_list[selected_channel]
            },
            selectNextItem: function () {
                if (selected_menu_item + 1 < menu_items.length) {
                    if (menu_items[selected_menu_item])
                        menu_items[selected_menu_item].element.classList.remove('selected');
                    selected_menu_item++;
                    menu_items[selected_menu_item].element.classList.add('selected');
                }
            },
            selectPreviousItem: function () {
                if (selected_menu_item - 1 >= 0) {
                    if (menu_items[selected_menu_item])
                        menu_items[selected_menu_item].element.classList.remove('selected');
                    selected_menu_item--;
                    menu_items[selected_menu_item].element.classList.add('selected');
                }
            },
            toggleSelectedCategory: function () {
                if (menu_items[selected_menu_item]) {
                    var children = [];
                    menu_items[selected_menu_item].children.forEach(function (item) {
                        item.classList.toggle('hidden');
                        children.push({
                            element: item,
                            children: []
                        });
                    });
                    if (menu_items[selected_menu_item].element.classList.contains('expanded')) {
                        menu_items.splice(selected_menu_item + 1, menu_items[selected_menu_item].children.length);
                    } else {
                        menu_items.splice.apply(menu_items, [selected_menu_item + 1, 0].concat(children));
                    }
                    menu_items[selected_menu_item].element.classList.toggle('expanded');
                }
            }
        };
    }

    return {
        getInstance: function () {
            if (!instance)
                instance = init();
            return instance;
        }
    }
})();
