lanet_tv.Menu = (function () {
    var instance;

    function init () {
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
                var hint, item;
                menu.id = 'menu';
                menu.classList.add('hidden');
                root.className = 'root';
                list.className = 'list';
                footer.className = 'footer';
                root.addEventListener('click', function () {
                    if (!menu.classList.contains('expanded')) {
                        expandRoot();
                    }
                });
                renderRoot();
                for (hint in hints) {
                    if (hints.hasOwnProperty(hint)) {
                        item = document.createElement('div');
                        item.classList.add('hint');
                        item.classList.add('icon');
                        item.classList.add(hints[hint].color);
                        item.classList.add(hints[hint].icon);
                        item.innerHTML = hints[hint].name;
                        footer.appendChild(item);
                    }
                }
                menu.appendChild(root);
                menu.appendChild(list);
                menu.appendChild(footer);
                return menu;
            },
            renderRoot = function () {
                var cat_id, category_element, category,
                    item_id, category_item;
                current_root_menu_item = 0;
                root_menu_items = [];
                current_root_menu_category = Object.keys(categories)[0];
                Helpers.removeChildren(root);
                for (cat_id in categories) {
                    if (categories.hasOwnProperty(cat_id)) {
                        category_element = document.createElement('div');
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
                                var n;
                                if (expanded) {
                                    for (n in root_menu_items) {
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
                        for (item_id in categories[cat_id].children) {
                            if (categories[cat_id].children.hasOwnProperty(item_id)) {
                                category_item = document.createElement('div');
                                category_item.classList.add('item');
                                if (cat_id == 'lists' && categories[cat_id].children[item_id].id == 'all')
                                    category_item.classList.add('current');
                                category_item.classList.add('hidden');
                                category_item.innerHTML = categories[cat_id].children[item_id].name;
                                (function (element) {
                                    element.addEventListener("click", function () {
                                        var n;
                                        if (expanded) {
                                            for (n in root_menu_items) {
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
            expandRoot = function () {
                menu.classList.add('expanded');
                expanded = true;
                selectCurrentRootItem();
            },
            selectCurrentRootItem = function () {
                var item, category;
                for (item in root_menu_items)
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
                        for (category in categories)
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
                var children = [], child;
                if (Object.keys(category.children).length > 0 && !category.element.classList.contains('expanded')) {
                    children = [];
                    for (child in category.children) {
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
            selectNextRootItem = function () {
                if (current_root_menu_item + 1 < root_menu_items.length) {
                    current_root_menu_item++;
                    selectCurrentRootItem();
                    if (root_menu_items[current_root_menu_item + 1] && root.scrollTop + root.offsetHeight <= root_menu_items[current_root_menu_item + 1].element.offsetTop)
                        root.scrollTop = root_menu_items[current_root_menu_item + 1].element.offsetTop + root_menu_items[current_root_menu_item + 1].element.offsetHeight - root.offsetHeight;
                }
            },
            selectPreviousRootItem = function () {
                if (current_root_menu_item - 1 >= 0) {
                    current_root_menu_item--;
                    selectCurrentRootItem();
                    if (root_menu_items[current_root_menu_item - 1] && root.scrollTop >= root_menu_items[current_root_menu_item - 1].element.offsetTop)
                        root.scrollTop = root_menu_items[current_root_menu_item - 1].element.offsetTop;
                }
            },
            collapseCurrentRootCategory = function () {
                if (categories[current_root_menu_category]) {
                    if (categories[current_root_menu_category].element.classList.contains('expanded')) {
                        collapseRootCategory(categories[current_root_menu_category]);
                    }
                }
            },
            collapseRootCategory = function (category) {
                var children = [], child;
                if (Object.keys(category.children).length > 0 && category.element.classList.contains('expanded')) {
                    for (child in category.children) {
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
            renderFullList = function () {
                var index, counter;
                Helpers.removeChildren(list);
                index = full_channel_list.indexOf(full_channel_list.filter(function (channel) {
                    return channel.element.classList.contains('active');
                })[0]);
                index = index > -1 ? index : 0;
                current_channel_list = [];
                selected_channel = index;
                current_limits.min = 0;
                current_limits.max = full_channel_list.length - 1;
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
            },
            selectCurrentListItem = function () {
                var channel = full_channel_list.filter(function (channel) {
                        return channel.element.classList.contains('current');
                    })[0],
                    index = full_channel_list.indexOf(channel);
                index = index > -1 ? index : 0;
                selected_channel = index;
                list.scrollTop = full_channel_list[selected_channel].element.offsetTop + 104 / 2 - list.getBoundingClientRect().height / 2;
            },
            selectNextChannel = function () { },
            selectPreviousChannel = function () { };
        body.appendChild(createElement());
        return {
            show: function () {
                menu.classList.remove('hidden');
                menu.classList.add('visible');
                selectCurrentListItem();
                //update();
            },
            hide: function () {
                this.collapse();
                menu.classList.remove('visible');
            },
            expand: expandRoot,
            collapse: function () {
                var item;
                for (item in root_menu_items)
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
            selectNextRootItem: selectNextRootItem,
            selectPreviousRootItem: selectPreviousRootItem,
            collapseCurrentRootCategory: collapseCurrentRootCategory,
            setGenres: function (genres) {
                var g;
                if (genres.length != Object.keys(categories.genres.children).length) {
                    categories.genres.children = {};
                    for (g in genres) {
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
                var t;
                if (tags.length != Object.keys(categories.tags.children).length) {
                    categories.tags.children = {};
                    for (t in tags) {
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
                var c;
                //if (full_channel_list.length != Object.keys(channels).length) {
                full_channel_list = [];
                for (c in channels)
                    if (channels.hasOwnProperty(c))
                        full_channel_list.push(channels[c]);
                renderFullList();
                //}
            },
            selectNextChannel: selectNextChannel,
            selectPreviousChannel: selectPreviousChannel,
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
