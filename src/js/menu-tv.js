lanet_tv.Menu = (function () {
    var instance;

    function init() {
        var body = document.getElementsByTagName('body')[0],
            menu = document.createElement('div'),
            root = document.createElement('div'),
            list = document.createElement('div'),
            footer = document.createElement('div'),
            root_menu_items = [],
            current_root_menu_item,
            current_root_menu_category,
            full_channel_list = [],
            current_channel_list = [],
            selected_channel,
            current_limits = {min: 0, max: 0},
            expanded = false,
            hints = [
                {
                    icon: 'like',
                    color: 'red',
                    name: 'Сетка'
                },
                {
                    icon: 'pip',
                    color: 'green',
                    name: 'Перезагрузка'
                },
                {
                    icon: 'star',
                    color: 'yellow',
                    name: 'В избранное'
                },
                {
                    icon: 'bookmark',
                    color: 'blue',
                    name: 'Отладочная информация'
                }
            ], categories = {
                /*choice: {
                    category: 'choice',
                    icon: 'selection',
                    name: 'Мой выбор',
                    element: null,
                    children: {}
                },*/
                lists: {
                    category: 'lists',
                    icon: 'view_list',
                    name: 'Списки',
                    element: null,
                    children: {
                        /*0: {
                            id: 'favourite',
                            category: 'lists',
                            element: null,
                            name: 'Избранное'
                        },*/
                        1: {
                            id: 'all',
                            category: 'lists',
                            element: null,
                            name: 'Все'
                        }
                    }
                },
                genres: {
                    category: 'genres',
                    icon: 'genres',
                    name: 'Жанры',
                    element: null,
                    children: {}
                },
                tags: {
                    category: 'tags',
                    icon: 'tags',
                    name: 'Темы',
                    element: null,
                    children: {}
                }/*,
                settings: {
                    category: 'settings',
                    icon: 'settings',
                    name: 'Настройки',
                    element: null,
                    children: {}
                }*/
            },
            createElement = function () {
                menu.id = 'menu';
                menu.classList.add('hidden');
                root.className = 'root';
                list.className = 'list';
                footer.className = 'footer';
                renderRoot();
                for (var hint in hints) {
                    if (hints.hasOwnProperty(hint)) {
                        var item = document.createElement('div');
                        item.classList.add('hint');
                        item.classList.add('icon');
                        item.classList.add(hints[hint].color);
                        item.classList.add(hints[hint].icon);
                        item.innerHTML = hints[hint].name;
                        footer.appendChild(item)
                    }
                }
                menu.appendChild(root);
                menu.appendChild(list);
                menu.appendChild(footer);
                return menu;
            },
            renderRoot = function () {
                current_root_menu_item = 0;
                root_menu_items = [];
                current_root_menu_category = Object.keys(categories)[0];
                Helpers.removeChildren(root);
                for (var cat_id in categories) {
                    if (categories.hasOwnProperty(cat_id)) {
                        var category_element = document.createElement('div'),
                            category;
                        category_element.classList.add('category');
                        category_element.classList.add('icon');
                        category_element.classList.add(categories[cat_id].icon);
                        Object.keys(categories[cat_id].children).length > 0 ?
                            category_element.classList.add('expandable') :
                            category_element.classList.remove('expandable');
                        category_element.innerHTML = categories[cat_id].name;
                        root.appendChild(category_element);
                        categories[cat_id].element = category_element;
                        (function (element) {
                            element.addEventListener("click", function () {
                                if (expanded) {
                                    for (var n in root_menu_items) {
                                        if (root_menu_items.hasOwnProperty(n) && root_menu_items[n].element == element) {
                                            current_root_menu_category = n;
                                            current_root_menu_item = n;
                                        }
                                    }
                                    selectCurrentRootItem();
                                    rootMenuItemAction();
                                }
                            })
                        })(category_element);
                        for (var item_id in categories[cat_id].children) {
                            if (categories[cat_id].children.hasOwnProperty(item_id)) {
                                var category_item = document.createElement('div');
                                category_item.classList.add('item');
                                if (cat_id == 'lists' && categories[cat_id].children[item_id].id == 'all')
                                    category_item.classList.add('current');
                                category_item.classList.add('hidden');
                                category_item.innerHTML = categories[cat_id].children[item_id].name;
                                (function (element) {
                                    element.addEventListener("click", function () {
                                        if (expanded) {
                                            for (var n in root_menu_items) {
                                                if (root_menu_items.hasOwnProperty(n) && root_menu_items[n].element == element) {
                                                    current_root_menu_item = n;
                                                }
                                            }
                                            selectCurrentRootItem();
                                            rootMenuItemAction();
                                        }
                                    })
                                })(category_item);
                                root.appendChild(category_item);
                                categories[cat_id].children[item_id].element = category_item;
                            }
                        }
                        root_menu_items.push(categories[cat_id]);
                    }
                }
            },
            selectCurrentRootItem = function () {
                for (var item in root_menu_items)
                    if (root_menu_items.hasOwnProperty(item))
                        root_menu_items[item].element.classList.remove('selected');
                current_root_menu_category = root_menu_items[current_root_menu_item].category;
                root_menu_items[current_root_menu_item].element.classList.add('selected');
                if (root_menu_items[current_root_menu_item].element.classList.contains('category')) {
                    rootMenuItemAction = function () {
                        toggleSelectedRootCategory();
                    }
                } else if (root_menu_items[current_root_menu_item].element.classList.contains('item')) {
                    rootMenuItemAction = function () {
                        for (var category in categories)
                            if (categories.hasOwnProperty(category))
                                for (item in categories[category].children)
                                    if (categories[category].children.hasOwnProperty(item))
                                        categories[category].children[item].element.classList.remove('current');
                        root_menu_items[current_root_menu_item].element.classList.add('current');
                        rootItemSelectFunction(root_menu_items[current_root_menu_item].category, root_menu_items[current_root_menu_item].id);
                    }
                }
            },
            expandRootCategory = function (category) {
                if (Object.keys(category.children).length > 0 && !category.element.classList.contains('expanded')) {
                    var children = [];
                    for (var child in category.children) {
                        if (category.children.hasOwnProperty(child)) {
                            category.children[child].element.classList.remove('hidden');
                            children.push(category.children[child]);
                        }
                    }
                    root_menu_items.splice.apply(root_menu_items, [root_menu_items.indexOf(category) + 1, 0].concat(children));
                    category.element.classList.add('expanded');
                    current_root_menu_item = root_menu_items.indexOf(category);
                }
                selectCurrentRootItem();
            },
            collapseRootCategory = function (category) {
                if (Object.keys(category.children).length > 0 && category.element.classList.contains('expanded')) {
                    var children = [];
                    for (var child in category.children) {
                        if (category.children.hasOwnProperty(child)) {
                            category.children[child].element.classList.add('hidden');
                            children.push(category.children[child]);
                        }
                    }
                    root_menu_items.splice(root_menu_items.indexOf(category) + 1, Object.keys(category.children).length);
                    category.element.classList.remove('expanded');
                    current_root_menu_item = root_menu_items.indexOf(category);
                }
                selectCurrentRootItem();
            },
            toggleSelectedRootCategory = function () {
                if (categories[current_root_menu_category] && root_menu_items.indexOf(categories[current_root_menu_category]) == current_root_menu_item) {
                    if (categories[current_root_menu_category].element.classList.contains('expanded')) {
                        collapseRootCategory(categories[current_root_menu_category]);
                    } else {
                        expandRootCategory(categories[current_root_menu_category]);
                    }
                }
            },
            rootMenuItemAction = function () { },
            rootItemSelectFunction = function () { },
            channelClickFunction = function () { },
            visibleListItems = function () {
                var result = list.getBoundingClientRect().height / 104;
                return {
                    visible: Math.floor(result),
                    extra: result % 1 !== 0
                }
            },
        /*
         renderCurrentListPage = function () {
         resetListSelection();
         Helpers.removeChildren(list);
         var current_channel_id = Object.keys(full_channel_list.filter(function (channel) {
         return channel.element.classList.contains('current')
         }))[0],
         index = Object.keys(full_channel_list).indexOf(current_channel_id),
         visible = visibleListItems(),
         counter, page;
         index = index > -1 ? index : 0;
         page = Math.floor(index / visible.visible);
         current_channel_list = [];
         selected_channel = index - page * visibleListItems().visible;
         current_limits.min = visible.visible * page;
         current_limits.max = current_limits.min + visible.visible;
         for (counter = current_limits.min; counter < current_limits.max + (visible.extra ? 1 : 0) && full_channel_list[Object.keys(full_channel_list)[counter]]; counter++) {
         current_channel_list.push(full_channel_list[Object.keys(full_channel_list)[counter]]);
         list.appendChild(full_channel_list[Object.keys(full_channel_list)[counter]].element);
         }
         if (current_channel_list[selected_channel])
         current_channel_list[selected_channel].element.classList.add('selected');
         },
         */
            renderCurrentListPage = function () {
                resetListSelection();
                Helpers.removeChildren(list);
                var index = full_channel_list.indexOf(full_channel_list.filter(function (channel) {
                        return channel.element.classList.contains('current')
                    })[0]),
                    visible = visibleListItems(),
                    counter, page;
                index = index > -1 ? index : 0;
                page = Math.floor(index / visible.visible);
                current_channel_list = [];
                selected_channel = index - page * visibleListItems().visible;
                current_limits.min = visible.visible * page;
                current_limits.max = current_limits.min + visible.visible;
                for (counter = current_limits.min; counter < current_limits.max + (visible.extra ? 1 : 0) && full_channel_list[counter]; counter++) {
                    current_channel_list.push(full_channel_list[counter]);
                    list.appendChild(full_channel_list[counter].element);
                }
                if (current_channel_list[selected_channel])
                    current_channel_list[selected_channel].element.classList.add('selected');
            },
            renderFullList = function () {
                resetListSelection();
                Helpers.removeChildren(list);
                var index = full_channel_list.indexOf(full_channel_list.filter(function (channel) {
                        return channel.element.classList.contains('current');
                    })[0]),
                    visible = visibleListItems(),
                    counter, page;
                index = index > -1 ? index : 0;
                page = Math.floor(index / visible.visible);
                current_channel_list = [];
                selected_channel = index;
                current_limits.min = visible.visible * page;
                current_limits.max = current_limits.min + visible.visible;
                for (counter = 0; full_channel_list[counter]; counter++) {
                    current_channel_list.push(full_channel_list[counter]);
                    (function (counter) {
                        full_channel_list[counter].element.addEventListener('click', function () {
                            selected_channel = counter;
                            channelClickFunction(full_channel_list[selected_channel]);
                        });
                    })(counter);
                    list.appendChild(full_channel_list[counter].element);
                }
                if (current_channel_list[selected_channel])
                    current_channel_list[selected_channel].element.classList.add('selected');
            },
            renderNextListPage = function () {
                resetListSelection();
                selected_channel = 0;
                Helpers.removeChildren(list);
                current_channel_list = [];
                var counter, visible = visibleListItems();
                current_limits.min = current_limits.max;
                current_limits.max = current_limits.min + visible.visible;
                for (counter = current_limits.min; counter < current_limits.max + (visible.extra ? 1 : 0) && full_channel_list[counter]; counter++) {
                    current_channel_list.push(full_channel_list[counter]);
                    list.appendChild(full_channel_list[counter].element);
                }
                current_channel_list[selected_channel].element.classList.add('selected');
            },
            renderPreviousListPage = function () {
                resetListSelection();
                Helpers.removeChildren(list);
                current_channel_list = [];
                var counter, visible = visibleListItems();
                current_limits.min = current_limits.min - visible.visible;
                current_limits.max = current_limits.min + visible.visible;
                for (counter = current_limits.min; counter < current_limits.max + (visible.extra ? 1 : 0) && full_channel_list[counter]; counter++) {
                    current_channel_list.push(full_channel_list[counter]);
                    list.appendChild(full_channel_list[counter].element);
                }
                selected_channel = current_channel_list.length - (visible.extra ? 2 : 1);
                current_channel_list[selected_channel].element.classList.add('selected');
            },
            scrollToNextListPage = function () {
                //resetListSelection();
                //selected_channel = 0;
                //Helpers.removeChildren(list);
                //current_channel_list = [];
                /*
                 var counter, visible = visibleListItems();
                 current_limits.min = current_limits.max;
                 current_limits.max = current_limits.min + visible.visible;
                 for (counter = current_limits.min; counter < current_limits.max + (visible.extra ? 1 : 0) && full_channel_list[counter]; counter++) {
                 current_channel_list.push(full_channel_list[counter]);
                 list.appendChild(full_channel_list[counter].element);
                 }
                 current_channel_list[selected_channel].element.classList.add('selected');
                 */
            },
            scrollToPreviousListPage = function () {
                //resetListSelection();
                //Helpers.removeChildren(list);
                //current_channel_list = [];
                /*
                 var counter, visible = visibleListItems();
                 current_limits.min = current_limits.min - visible.visible;
                 current_limits.max = current_limits.min + visible.visible;
                 for (counter = current_limits.min; counter < current_limits.max + (visible.extra ? 1 : 0) && full_channel_list[counter]; counter++) {
                 current_channel_list.push(full_channel_list[counter]);
                 list.appendChild(full_channel_list[counter].element);
                 }
                 selected_channel = current_channel_list.length - (visible.extra ? 2 : 1);
                 current_channel_list[selected_channel].element.classList.add('selected');
                 */
            },
            resetListSelection = function () {
                if (current_channel_list[selected_channel])
                    current_channel_list[selected_channel].element.classList.remove('selected');
            };
        body.appendChild(createElement());
        return {
            show: function () {
                renderCurrentListPage();
                menu.classList.remove('hidden');
                menu.classList.add('visible');
                update();
            },
            hide: function () {
                this.collapse();
                menu.classList.remove('visible');
            },
            expand: function () {
                menu.classList.add('expanded');
                expanded = true;
                selectCurrentRootItem();
            },
            collapse: function () {
                for (var item in root_menu_items)
                    if (root_menu_items.hasOwnProperty(item) && root_menu_items[item].element.classList.contains('category'))
                        collapseRootCategory(root_menu_items[item]);
                menu.classList.remove('expanded');
                expanded = false;
                if (root_menu_items[current_root_menu_item])
                    root_menu_items[current_root_menu_item].element.classList.remove('selected');
            },
            mainRootAction: function () {
                rootMenuItemAction();
            },
            selectNextRootItem: function () {
                if (current_root_menu_item + 1 < root_menu_items.length) {
                    current_root_menu_item++;
                    selectCurrentRootItem();
                    if (root_menu_items[current_root_menu_item + 1]) {
                        if (root.scrollTop + root.offsetHeight <= root_menu_items[current_root_menu_item + 1].element.offsetTop)
                            root.scrollTop = root_menu_items[current_root_menu_item + 1].element.offsetTop + root_menu_items[current_root_menu_item + 1].element.offsetHeight - root.offsetHeight;
                    } else {
                        root.scrollTop = root_menu_items[current_root_menu_item].element.offsetTop;
                    }
                }
            },
            selectPreviousRootItem: function () {
                if (current_root_menu_item - 1 >= 0) {
                    current_root_menu_item--;
                    selectCurrentRootItem();
                    if (root_menu_items[current_root_menu_item - 1] && root.scrollTop >= root_menu_items[current_root_menu_item - 1].element.offsetTop)
                        root.scrollTop = root_menu_items[current_root_menu_item - 1].element.offsetTop;
                }
            },
            collapseCurrentRootCategory: function () {
                if (categories[current_root_menu_category]) {
                    if (categories[current_root_menu_category].element.classList.contains('expanded')) {
                        collapseRootCategory(categories[current_root_menu_category]);
                    }
                }
            },
            setGenres: function (genres) {
                if (genres.length != Object.keys(categories.genres.children).length) {
                    categories.genres.children = {};
                    for (var g in genres) {
                        if (genres.hasOwnProperty(g)) {
                            categories.genres.children[g] = {
                                id: genres[g],
                                category: 'genres',
                                name: genres[g],
                                element: null
                            }
                        }
                    }
                    renderRoot();
                }
            },
            setTags: function (tags) {
                if (tags.length != Object.keys(categories.tags.children).length) {
                    categories.tags.children = {};
                    for (var t in tags) {
                        if (tags.hasOwnProperty(t)) {
                            categories.tags.children[t] = {
                                id: tags[t],
                                category: 'tags',
                                name: tags[t],
                                element: null
                            }
                        }
                    }
                    renderRoot();
                }
            },
            setRootItemSelectHandler: function (handler) {
                rootItemSelectFunction = handler;
            },
            setChannelClickHandler: function (handler) {
                channelClickFunction = handler;
            },
            setChannels: function (channels) {
                if (full_channel_list.length != Object.keys(channels).length) {
                    full_channel_list = [];
                    for (var c in channels)
                        if (channels.hasOwnProperty(c))
                            full_channel_list.push(channels[c]);
                    renderCurrentListPage();
                }
            },
            selectNextChannel: function () {
                if (current_limits.max > full_channel_list.length - 1) {
                    if (selected_channel + 1 < visibleListItems().visible - (current_limits.max - full_channel_list.length)) {
                        current_channel_list[selected_channel].element.classList.remove('selected');
                        selected_channel++;
                        current_channel_list[selected_channel].element.classList.add('selected');
                    }
                } else {
                    current_channel_list[selected_channel].element.classList.remove('selected');
                    if (selected_channel < current_channel_list.length - (visibleListItems().extra ? 2 : 1)) {
                        selected_channel++;
                        current_channel_list[selected_channel].element.classList.add('selected');
                    } else {
                        renderNextListPage();
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
                    renderPreviousListPage();
                }
            },
            getSelectedChannel: function () { return current_channel_list[selected_channel] }
        };
    }

    return {
        getInstance: function () {
            if (!instance)
                instance = init();
            return instance;
        }
    };
})();
