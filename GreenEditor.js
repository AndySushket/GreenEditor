$(function() {
    var GreenEditor = function() {
        var editor = this;
        var currentСounterHistory = -1;
        var history = [];
        this.historyLength = 40;
        this.view = $('#GreenEditor');
        this.view.buttons = {};
        this.view.buttons.items = [];
        this.view.field = null;
        this.selection = null;
        this.init = function() {
            var field = $("#theInputField");
            var buttons = $("#buttons");
            var copiedButtonsItems = editor.view.buttons.items;
            editor.view.buttons = buttons;
            editor.view.buttons.items = copiedButtonsItems;
            editor.view.field = field;
            for (var i = 0; i < editor.view.buttons.items.length; ++i) {
                var item = editor.view.buttons.items[i];
                item.init();
                editor.view.buttons.append(item.view);
            }
            var currentState = editor.view.field.html();
            editor.addСounterHistory(currentState);
        }
        this.getContent = function() {
            var content = editor.view.field.html();
            if (/^[<br\/?>\s&nbsp;?]*$/gi.exec(content)) {
                return null;
            }
            return content;
        }
        this.getButtons = function(name) {
            var items = editor.view.buttons.items;
            for (var i = 0; i < items.length; ++i) {
                if (items[i].name == name) {
                    return items[i];
                }
            }
            return false;
        }
        this.addСounterHistory = function() {
            var state = editor.view.field.html();
            if (state == history[currentСounterHistory]) {
                return;
            }
            if (history.length == editor.historyLength) {
                history = history.slice(1);
            }
            else {
                currentСounterHistory++;
            }
            history[currentСounterHistory] = state;  
            }
        this.backInСounterHistory = function() {
            if (currentСounterHistory > 0) {
                currentСounterHistory--;
                editor.view.field.html(history[currentСounterHistory]);
            }
        }
        
        this.forwardInСounterHistory = function() {
            if (currentСounterHistory < editor.historyLength - 1) {
                currentСounterHistory++;
                editor.view.field.html(history[currentСounterHistory]);
            }
        }
        this.addButtonsItem = function(item) {
            editor.view.buttons.items.push(item);
        }
        
        this.focus = function() {
            editor.view.field.focus();
        }
                
        this.dragenter = function() {
            editor.view.field.addClass('dragenter');
        }
        
        this.unDragenter = function() {
            editor.view.field.removeClass('dragenter');
        }
        this.sizeToWindow = function() {
            var viewportWidth = $(window).width();
            var viewportHeight = $(window).height();

            var newEditorHeight = viewportHeight - 300;
            editor.view.outerHeight(newEditorHeight);

            var newEditorContainerHeight = newEditorHeight - 35;
            editor.view.field.outerHeight(newEditorContainerHeight);
        }
        this.activateButtons = function() {
            var items = editor.view.buttons.items;
            for (var itemName in items) {
                var item = items[itemName];
                if (item instanceof editor.Button) {
                    item.makeUnactive();
                }
            }
            if (editor.getContent()) {
                var nodeThatCursorIsInside = editor.selection.getRangeAt(0).startContainer.parentNode;
                var currentNode = nodeThatCursorIsInside;
                var parentNodesNames = [];
                while (currentNode.id !== GreenEditor.view.field.attr('id')) {
                    parentNodesNames.push(currentNode.nodeName.toLowerCase());
                    currentNode = currentNode.parentNode;
                }
                for (var i = 0; i < parentNodesNames.length; ++i) {
                    if (parentNodesNames[i] === 'b' || parentNodesNames[i] === 'strong') {
                        var button = editor.getButtons('b');
                        button.makeActive();
                    }
                    else if (parentNodesNames[i] === 'i' || parentNodesNames[i] === 'em') {
                        var button = editor.getButtons('i');
                        button.makeActive();
                    }
                    else {
                        var button = editor.getButtons(parentNodesNames[i]);
                        if (button) {
                            button.makeActive();
                        }
                    }
                }
            }
        }
        this.Button = function(name, icon, active, func) {
            var button = this;
            this.name = name;
            this.activeable = active;
            this.active = false;
            this.icon = icon;
            this.func = func;
            this.view = $('<button></button>');
            this.init = function() {
                button.view.attr('id', name);
                button.view.append($('<img src="' + button.icon + '"/>'));
                button.view.on('click', button.func);
                button.view.on('click', function() { 
                    if (button.active) {
                        button.makeUnactive();
                    }
                    else {
                        button.makeActive();
                    }
                    
                    editor.addСounterHistory();
                    
                    editor.view.field.focus();
                });
            }
            this.makeActive = function() {
                if (button.activeable) {
                    button.view.addClass('active');
                    button.active = true;
                }
            }
            this.makeUnactive = function() {
                button.view.removeClass('active');
                button.active = false;
            }
        }
        this.divide = function(width) {
            var divide = this;

            this.width = width || 10;
            this.view = $('<div class="divide"></div>');
            this.init = function() {
                divide.view.css('margin-left', this.width / 2);
                divide.view.css('margin-right', this.width / 2);
            }
        }
    }
    var GreenEditor = new GreenEditor();
    
    var bold = new GreenEditor.Button('b', 'icons/bold.png', true, function() {
        document.execCommand('bold', false, null);
    });
    GreenEditor.addButtonsItem(bold);
    var italic = new GreenEditor.Button('i', 'icons/italics.png', true, function() {
        document.execCommand('italic', false, null);
    });
    GreenEditor.addButtonsItem(italic);
    var underline= new GreenEditor.Button('u', 'icons/undelined.png', true, function() {
        document.execCommand('underline', false, null);
    });
    GreenEditor.addButtonsItem(underline);
    var strike = new GreenEditor.Button('strike', 'icons/strike.png', true, function() {
        document.execCommand('strikeThrough', false, null);
    });
    GreenEditor.addButtonsItem(strike);
    
    GreenEditor.addButtonsItem(new GreenEditor.divide());
    
    var increaseFontSize = new GreenEditor.Button('increaseFontSize', 'icons/plus.png', false, function() {
        var nodeThatCursorIsInside = GreenEditor.selection.getRangeAt(0).endContainer.parentNode;
        var tagName = nodeThatCursorIsInside.tagName.toLowerCase();
        var size = nodeThatCursorIsInside.size || 4;
        if (tagName == 'font') {
            if (size < 7) {
                size++;
                document.execCommand('fontSize', false, size);
                }
            }
            else {
                document.execCommand('fontSize', false, size);
            }
        });
    GreenEditor.addButtonsItem(increaseFontSize);
    
    var decreaseFontSize= new GreenEditor.Button('decreaseFontSize', 'icons/minus.png', false, function() {
        var nodeThatCursorIsInside = GreenEditor.selection.getRangeAt(0).endContainer.parentNode;
        var tagName = nodeThatCursorIsInside.tagName.toLowerCase();
        var size = nodeThatCursorIsInside.size || 3;
        if (tagName == 'font') {
            if (size > 1) {
                size--;
                document.execCommand('fontSize', false, size);
                }
            }
            else {
                document.execCommand('fontSize', false, size);
            }
    });
    GreenEditor.addButtonsItem(decreaseFontSize);

    GreenEditor.addButtonsItem(new GreenEditor.divide());
    
    var unOrderList = new GreenEditor.Button('ul', 'icons/bulleted.png', false, function() {
        document.execCommand('insertUnorderedList', false, null);
    });
    GreenEditor.addButtonsItem(unOrderList);
    
    var orderList = new GreenEditor.Button('ol', 'icons/numbering.png', false, function() {
        document.execCommand('insertOrderedList', false, null);
    });
    GreenEditor.addButtonsItem(orderList);
    
    GreenEditor.addButtonsItem(new GreenEditor.divide());
    
    var removeFormat = new GreenEditor.Button('removeFormat', 'icons/delete.png', false, function() {
        document.execCommand('removeFormat', false, null);
    });
    GreenEditor.addButtonsItem(removeFormat);
    
    GreenEditor.addButtonsItem(new GreenEditor.divide());
    
    var Undo = new GreenEditor.Button('undo', 'icons/undo.png', false, function() {
         GreenEditor.backInСounterHistory();
    });
    GreenEditor.addButtonsItem(Undo);
    
    var Redo = new GreenEditor.Button('redo', 'icons/redo.png', false, function() {
         GreenEditor.forwardInСounterHistory();
    });
    GreenEditor.addButtonsItem(Redo);

    GreenEditor.init();    

    GreenEditor.view.buttons.on('click', GreenEditor.highlight);
    GreenEditor.view.field.on('click', GreenEditor.activateButtons);
    
    GreenEditor.view.field.on('mouseup', function() {
        GreenEditor.selection = window.getSelection();
    });
    
    GreenEditor.view.field.on('keydown', function(e) {
        var keycode = e.which;
        if (keycode >= 33 && keycode <= 40 || keycode == 8 || keycode == 46) { 
            GreenEditor.activateButtons();
        }
            
        GreenEditor.addСounterHistory();
    });
    
    GreenEditor.view.field.on('dragenter', function() {
        GreenEditor.dragenter();   
    });
    
    GreenEditor.view.field.on('dragleave', function() {
        GreenEditor.unDragenter();   
    });
    
    GreenEditor.view.field.on('drop', function(e) {
        e.preventDefault();     
        GreenEditor.unDragenter();
        
        var file = e.originalEvent.dataTransfer.files[0];
        var imageUrl = e.originalEvent.dataTransfer.getData('text/html');
        
        if(/img\/*/.exec(imageUrl)){
            imageUrl.id="img";
            GreenEditor.view.field.append(imageUrl);            
        }

        if (/image\/*/.exec(file.type)) {
            var reader = new FileReader();
            reader.onload = (function(theFile) {
                var src= theFile.target.result;
                var img = document.createElement("img");   
                img.src = src;
                GreenEditor.view.field.append(img);
                GreenEditor.addСounterHistory();
            });
            reader.readAsDataURL(file);
        }
       
        GreenEditor.addСounterHistory();
        
    });
    
    function paste(src) {
        $("#theInputField").append("<img src='" + src + "'>");
        GreenEditor.addСounterHistory();
    }
    $.pasteimage(paste);
    
    GreenEditor.view.on('click', function(e) {
        e.stopPropagation();
    });
    
    $(document).on('ready', function() {
        GreenEditor.sizeToWindow();
        GreenEditor.focus();
    });
    
    $(window).on('resize', function() {
        GreenEditor.sizeToWindow();
    });
});