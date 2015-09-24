# LG OTT NetCast

## Как все работает

Приложение построено на модели MVC (MVVP) [Мантры](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#detailmvcmvp).
Есть модели (**App.components**), есть отображение (**App.widgets**). Общаются они с помощью паттерна *PubSub* : **widgets** изменяют модели и подписаны на их изменения. Когда приходит евент про изменение, изменяют вид.

В зависимости от экрана (фул скрин видео/меню/ квик меню) наш депад должен реагировать по разному. 
Каждый екран вынесен на отдельный **location.hash**. Когда срабатывает событие *window.onhashchange* , управление берет на себя другой контроллер (**App.controllers**), который и определяет, каким образом изменить экран, какие задействовать виджеты, как обрабатывать нажание кнопок.


Все сущности определены в *App.components*. Все наследуют *Model*, который имеет базовые функции. 

### App.controllers:

Каждый контроллер может иметь виджеты(один или несколько).Каждый контроллер либо использует стандартное поведение с виждетами (передает событие в активный виджет), или переопределяет свое. Если у контроллера есть виджеты, только один активный. 

1. **LoadingController** - включает в себя получение  асинхроно всех данных, необходимых для запуска приложения ( например получение плейлиста если телек уже привязан к учетке)
2. **ListController** - Singleton. Алгоритм хождения по матрице. Кажый виджет должен иметь *grid.x*, что б знать, сколько елементов в ширину (пока у нас нету матричных блоков, это задел на будущее). Если при нажатии ВПРАВО нет больше елементов этого виждета, фокусируется соседний виждет.
3. **DefaultController** -  прототип для остальных контроллеров. Определяет стандартное поведение - передачу обработку события 
4. **PlaylistController** - контроллер меню. Использует стандартую обработку событий.
5. **QuickMenuController** - контроллер квик меню. Отличается тем что реагирует на нажатие сразу, а не перемещает фокус. По сути у него таким образом 4 действия (вверх вниз влево вправо)
6. **FSPlayerController** - контроллер фулл скрин видео. Имеет обработчик только на нажания *pg_up* *pg_down*  - переключение каналов.

### App.widgets

Каждый виджет связан с какой-то моделью. Для каждого нужно указывать сетку отображения ( по х и у: *grid*). У каждого есть контроллер, который подписываем на себя события через *PubSub*. Метод **notify()** срабатывает, когда виджет становится (не)/активным, и меняет свое отображение (например растет в размере). Каждый виджет может переопределить свое поведение на обработку события нажатия на клавишу.




**App.db** - localStorage

**App.helpers** - Clock и другие вспомогательные елементы

## Links

1. LG Developer http://developer.lge.com/main/Intro.dev
2. NetCast platform spec http://developer.lge.com/resource/tv/RetrieveDocDevLibrary.dev
3. JS http://addyosmani.com/resources/essentialjsdesignpatterns/book/
4. Для следующего стабильного релиза я бы уже посмотрел в сторону enyo.js

## Testing on real TV

1. Создать архив zip из следующих файлов: index.html, css/* js/* assets/*
2. http://developer.lge.com/apptest/retrieveApptestNCList.dev Зарегистрировать и отправить на подпись архив
3. Скачаный ответ разархивировать и залить на флешку в /lgapps/installed
4. Запустить на телевизоре с флешки





## Distribution and Contribution

Distributed under terms and conditions of GNU GPL v3 (only).
The following people are involved in development:

Sashyn Vitalii <sashyn.v@gmail.com>
Mail them any suggestions, bugreports and comments.