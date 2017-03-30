var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var Library;
(function (Library) {
    var diagram;
    (function (diagram) {
        class DiagramClass {
            constructor(config, callback) {
                let that = this;
                that.config = config || {};
                that.callback = callback;
                that.config.classes = config.classes || {};
                that.config.relations = config.relations || [];
                that.config.notes = config.notes || [];
                let size = that.resize(config.containerId);
                that.config.w = config.w || size.w;
                that.config.h = config.h || size.h;
                that.graph = new joint.dia.Graph();
                that.uml = joint.shapes.uml;
                that.paper = new joint.dia.Paper({
                    el: $("#" + config.containerId),
                    width: config.w,
                    height: config.h,
                    gridSize: 1,
                    model: that.graph
                });
                that.model = {};
                that.notes = [];
                that.addEvents();
            }
            addInterface(name, title, position, size, style) {
                let that = this;
                if (!style) {
                    style = {
                        classNameRec: {
                            bg: '#feb662',
                            color: '#ffffff',
                            fontSize: 0.5
                        },
                        classAttrsRec: {
                            bg: '#fdc886',
                            color: '#fff',
                            fontSize: 0.5
                        },
                        classMethodsRec: {
                            bg: '#fdc886',
                            color: '#fff',
                            fontSize: 0.5
                        },
                        classAttrsText: {
                            ref: ".uml-class-attrs-rect",
                            refY: 0.5,
                            yAlign: 'middle'
                        },
                        classMethodsText: {
                            ref: ".uml-class-methods-rect",
                            refY: 0.5,
                            yAlign: 'middle'
                        }
                    };
                }
                that.addType(name, title, position, size, that.uml.Interface, style);
            }
            removeInterface(name) {
                this.removeType(name);
            }
            addAbstract(name, title, position, size, style) {
                let that = this;
                if (!style) {
                    style = {
                        classNameRec: {
                            bg: '#68ddd5',
                            color: '#ffffff',
                            fontSize: 0.5
                        },
                        classAttrsRec: {
                            bg: '#9687fe',
                            color: '#fff',
                            fontSize: 0.5
                        },
                        classMethodsRec: {
                            bg: '#9687fe',
                            color: '#fff',
                            fontSize: 0.5
                        },
                        classAttrsText: {
                            color: '#fff'
                        },
                        classMethodsText: {
                            color: '#fff'
                        }
                    };
                }
                that.addType(name, title, position, size, that.uml.Abstract, style);
            }
            removeAbstract(name) {
                this.removeType(name);
            }
            addClass(name, title, position, size, style) {
                let that = this;
                that.addType(name, title, position, size, that.uml.Class, style);
            }
            removeClass(name) {
                this.removeType(name);
            }
            addNote(content, position, size, style) {
                let that = this;
                size = size || { w: 0, h: 0 };
                position = position || { x: 0, y: 0 };
                style = style || {};
                let note = new that.uml.Note({
                    position: {
                        x: position.x,
                        y: position.y
                    },
                    size: {
                        width: size.w,
                        height: size.h
                    },
                    note: content
                });
                that.graph.addCell(note);
                that.notes.push(note);
            }
            addAttribute(className, attr) {
                let that = this;
                let classe = that.config.classes[className];
                if (!classe)
                    return;
                if (typeof attr === "string")
                    classe.params.attributes.push(attr);
                else
                    attr.forEach((v) => {
                        classe.params.attributes.push(v);
                    });
                that.fixeClassSize(classe);
                that.updateModel(className);
            }
            addMethod(className, method) {
                let that = this;
                let classe = that.config.classes[className];
                if (!classe)
                    return;
                if (typeof method === "string")
                    classe.params.methods.push(method);
                else
                    method.forEach((v) => {
                        classe.params.methods.push(v);
                    });
                that.fixeClassSize(classe);
                that.updateModel(className);
            }
            addGeneralization(src, target) {
                let that = this;
                that.addRelation(src, target, that.uml.Generalization);
            }
            addImplementation(src, target) {
                let that = this;
                that.addRelation(src, target, that.uml.Implementation);
            }
            addAssociation(src, target) {
                let that = this;
                that.addRelation(src, target, that.uml.Association);
            }
            addAggregation(src, target) {
                let that = this;
                that.addRelation(src, target, that.uml.Aggregation);
            }
            addComposition(src, target) {
                let that = this;
                that.addRelation(src, target, that.uml.Composition);
            }
            getDiagramData() {
                let that = this;
                return {
                    entities: Object.keys(that.model).map(key => { return { name: key, position: that.getClass(key).attributes.position }; }),
                    notes: that.notes.map(note => { return { content: note.attributes.note, position: note.attributes.position }; })
                };
            }
            clear() {
                let that = this;
                this.graph.clear();
                that.model = {};
                that.notes = [];
            }
            addEvents() {
                let that = this;
                let types = {
                    interface: "uml.Interface",
                    abstract: "uml.Abstract",
                    class: "uml.Class"
                };
                let noteType = "uml.Note";
                that.graph.on('add', function (cell) {
                    let isEntity = false;
                    Object.keys(types).every((k) => {
                        if (types[k] == cell.attributes.type) {
                            isEntity = true;
                            return false;
                        }
                        return true;
                    });
                    if (isEntity) {
                        if (that.callback)
                            that.callback({ event: "click", action: "add", target: "dc", id: cell.attributes.name });
                    }
                });
                that.graph.on('remove', function (cell) {
                    let isEntity = false;
                    Object.keys(types).every((k) => {
                        if (types[k] == cell.attributes.type) {
                            isEntity = true;
                            return false;
                        }
                        return true;
                    });
                    if (isEntity) {
                        let name = cell.attributes.name;
                        delete that.config.classes[name];
                        delete that.model[name];
                        if (that.callback)
                            that.callback({ event: "click", action: "remove", target: "dc", id: cell.attributes.name });
                    }
                    else if (cell.attributes.type == noteType) {
                        let index = -1;
                        that.notes.every((n, i) => {
                            if (n.attributes.note == cell.attributes.note) {
                                index = i;
                                return false;
                            }
                            return true;
                        });
                        if (index > -1)
                            that.notes.splice(index, 1);
                    }
                });
                window.addEventListener("resize", function (e) {
                    let size = that.resize(that.config.containerId);
                    that.paper.setDimensions(size.w, size.h);
                });
            }
            addType(name, title, position, size, type, style) {
                let that = this;
                type = type || that.uml.Class;
                size = size || {};
                position = position || {};
                style = style || {};
                let sizeFixed = { w: size.w && size.w > 0, h: size.h && size.h > 0 };
                that.config.classes[name] = {
                    type: type,
                    sizeFixed: sizeFixed,
                    params: {
                        position: {
                            x: position.x || 20,
                            y: position.y || 20
                        },
                        size: {
                            width: size.w || 0,
                            height: size.h || 0
                        },
                        name: name || title,
                        attributes: [],
                        methods: [],
                        attrs: {
                            '.uml-class-name-rect': that.parseStyle(style.classNameRec) || {
                                fill: '#ff8450',
                                stroke: '#fff',
                                'stroke-width': 0.5,
                            },
                            '.uml-class-attrs-rect': that.parseStyle(style.classAttrsRec) || {
                                fill: '#fe976a',
                                stroke: '#fff',
                                'stroke-width': 0.5
                            },
                            '.uml-class-methods-rect': that.parseStyle(style.classMethodsRec) || {
                                fill: '#fe976a',
                                stroke: '#fff',
                                'stroke-width': 0.5
                            },
                            '.uml-class-attrs-text': that.parseStyle(style.classAttrsText) || {
                                ref: '.uml-class-attrs-rect',
                                'ref-y': 0.5,
                                'y-alignment': 'middle'
                            },
                            '.uml-class-methods-text': that.parseStyle(style.classMethodsText) || {
                                ref: '.uml-class-methods-rect',
                                'ref-y': 0.5,
                                'y-alignment': 'middle'
                            }
                        }
                    }
                };
                that.fixeClassSize(that.config.classes[name]);
                let conf = that.config.classes[name];
                that.model[name] = new conf.type(conf.params);
                that.graph.addCell(that.model[name]);
            }
            removeType(name) {
                let that = this;
                let classe = that.getClass(name);
                if (classe) {
                    classe.remove();
                }
            }
            addRelation(src, target, type) {
                let that = this;
                type = type || that.uml.Generalization;
                let relation = { type: type, params: { src: src, dest: target } };
                let srcClass = that.getClass(relation.params.src);
                let destClass = that.getClass(relation.params.dest);
                if (srcClass && destClass) {
                    that.graph.addCell(new relation.type({ source: { id: srcClass.id }, target: { id: destClass.id } }));
                    that.config.relations.push(relation);
                }
            }
            fixeClassSize(conf) {
                let that = this;
                let params = conf.params;
                let nbLine = params.attributes.length + params.methods.length;
                let lineHeight = nbLine <= 10 ? 20 : (nbLine <= 50 ? 15 : 13);
                let caracWidth = 6;
                let minWidth = 150;
                let minHeight = 100;
                if (!conf.sizeFixed.w) {
                    let w = minWidth;
                    params.attributes.forEach((v) => {
                        w = v.length * caracWidth > w ? v.length * caracWidth : w;
                    });
                    params.methods.forEach((v) => {
                        w = v.length * caracWidth > w ? v.length * caracWidth : w;
                    });
                    params.size.width = w;
                }
                if (!conf.sizeFixed.h) {
                    let h = (params.attributes.length + params.methods.length) * lineHeight;
                    params.size.height = h < minHeight ? minHeight : h;
                }
            }
            parseStyle(style) {
                let that = this;
                style = style || {};
                let lstyle = {};
                if (style.bg)
                    lstyle.fill = style.bg;
                if (style.color)
                    lstyle.stroke = style.color;
                if (style.fontSize)
                    lstyle["stroke-width"] = style.fontSize;
                if (style.yAlign)
                    lstyle["y-alignment"] = style.yAlign;
                if (style.ref)
                    lstyle["ref"] = style.ref;
                if (style.refY)
                    lstyle["ref-y"] = style.refY;
                return Object.keys(lstyle).length ? lstyle : null;
            }
            getClass(name) {
                return this.model[name];
            }
            updateModel(name) {
                let that = this;
                let classe = that.config.classes[name];
                let modele = that.getClass(name);
                let params = classe.params;
                modele.attributes.attributes = params.attributes;
                modele.attributes.methods = params.methods;
                modele.attributes.position = params.position;
                modele.attributes.size = params.size;
                modele.trigger('change:attributes');
            }
            resize(id) {
                let that = this;
                let container = $("#" + id).get(0);
                let w = 800;
                let h = 600;
                if (container) {
                    w = container.offsetWidth || w;
                    h = container.offsetHeight || h;
                }
                return { w: w, h: h };
            }
        }
        diagram.DiagramClass = DiagramClass;
        class DiagramMeta {
            constructor(config, callback, entities, positions) {
                let that = this;
                that.config = config || {};
                that.entities = entities || [];
                that.positions = positions || [];
                that.composedEntities = {};
                that.relationEntities = {};
                that.callback = callback;
                that.init();
            }
            addEntities(entities, positions) {
                let that = this;
                entities = entities || [];
                that.positions = positions || [];
                entities.forEach(entity => {
                    that.addEntity(entity);
                });
            }
            addEntity(meta) {
                let that = this;
                let e = null;
                that.entities.every((v) => {
                    if (v == meta.name) {
                        e = v;
                        return false;
                    }
                    return true;
                });
                if (!e) {
                    that.entity(meta, meta.definitions);
                    that.entities.push(meta);
                }
            }
            addNotes(notes) {
                let that = this;
                notes.forEach(note => {
                    that.addNote(note.content, note.position);
                });
            }
            addNote(note, position, size, style) {
                let that = this;
                that.dc.addNote(note, position, size, style);
            }
            removeEntity(name) {
                let that = this;
                that.dc.removeClass(name);
            }
            getDiagramData() {
                return this.dc.getDiagramData();
            }
            clear() {
                let that = this;
                that.entities = [];
                that.positions = [];
                that.composedEntities = {};
                that.relationEntities = {};
                that.dc.clear();
            }
            init() {
                let that = this;
                that.dc = new Library.diagram.DiagramClass({ containerId: that.config.containerId }, that.onModelChanged.bind(that));
                that.entities.forEach(entity => {
                    that.entity(entity, entity.definitions);
                });
            }
            entity(entity, definitions) {
                let that = this;
                entity = entity || {};
                let position = that.getEntity(that.positions, entity.name);
                if (position)
                    position = position.value.position;
                that.dc.addClass(entity.name, entity.title || entity.name, position);
                that.properties(entity.name, entity.properties, definitions);
                that.relations(entity.name, entity.relations);
            }
            properties(entity, properties, definitions) {
                let that = this;
                properties = properties || {};
                definitions = definitions || {};
                Object.keys(properties).forEach(key => {
                    let prop = properties[key];
                    if (prop.$ref) {
                        let defName = that.getDefinitionName(prop.$ref);
                        prop = definitions[defName];
                    }
                    if (that.isSimpleProperty(prop.type))
                        that.property(entity, key, prop, definitions);
                    else if (that.isArrayProperty(prop.type))
                        that.propertyArray(entity, key, prop, definitions);
                    else
                        that.propertyObject(entity, key, prop, definitions);
                });
            }
            property(entity, property, data, definitions) {
                let that = this;
                that.dc.addAttribute(entity, property + " : " + (data.format || data.type));
            }
            propertyObject(entity, property, data, definitions) {
                let that = this;
                data = data || {};
                data.name = data.name || property;
                that.entity(data, definitions);
                that.dc.addComposition(data.name, entity);
                that.composedEntities[entity] = that.composedEntities[entity] || [];
                that.composedEntities[entity].push(data.name);
            }
            propertyArray(entity, property, data, definitions) {
                let that = this;
                data.items = data.items || {};
                let $ref = data.items.$ref;
                data = data || {};
                if ($ref) {
                    let defName = that.getDefinitionName($ref);
                    data = definitions[defName];
                }
                data.name = data.name || property;
                that.entity(data, definitions);
                that.dc.addComposition(data.name, entity);
                that.composedEntities[entity] = that.composedEntities[entity] || [];
                that.composedEntities[entity].push(data.name);
            }
            relations(entity, relations) {
                let that = this;
                relations = relations || {};
                Object.keys(relations).forEach(key => {
                    let rel = relations[key];
                    let fE = that.getEntity(that.entities, rel.foreignEntity);
                    if (fE)
                        that.dc.addAssociation(entity, rel.foreignEntity);
                    that.relationEntities[rel.foreignEntity] = that.relationEntities[rel.foreignEntity] || [];
                    that.relationEntities[rel.foreignEntity].push(entity);
                    that.relationEntities[entity] = that.relationEntities[entity] || [];
                    that.relationEntities[entity].push(rel.foreignEntity);
                });
                if (that.relationEntities[entity]) {
                    that.relationEntities[entity].forEach((v, i) => {
                        let e = that.getEntity(that.entities, v);
                        if (e)
                            that.dc.addAssociation(entity, v);
                    });
                }
            }
            isSimpleProperty(type) {
                return (type && type.toLowerCase() !== "object" && type.toLowerCase() !== "array");
            }
            isArrayProperty(type) {
                return type.toLowerCase() === "array";
            }
            getDefinitionName(path) {
                return path.replace("#/definitions/", "");
            }
            getEntity(collection, name) {
                let that = this;
                let res = null;
                collection.every((v, i) => {
                    if (name == v.name) {
                        res = { index: i, value: v };
                        return false;
                    }
                    return true;
                });
                return res;
            }
            hasRelation(src, dest) {
                let that = this;
                let ok = false;
                that.relationEntities[src].every(v => {
                    if (v == dest) {
                        ok = true;
                        return false;
                    }
                    return true;
                });
                return ok;
            }
            onModelChanged(data) {
                let that = this;
                if (data.action == "remove") {
                    let index = -1;
                    that.entities.every((v, i) => {
                        if (v.name == data.id) {
                            index = i;
                            return false;
                        }
                        return true;
                    });
                    if (index > -1)
                        that.entities.splice(index, 1);
                    if (that.composedEntities[data.id]) {
                        that.composedEntities[data.id].forEach(v => {
                            that.removeEntity(v);
                        });
                        delete that.composedEntities[data.id];
                    }
                    if (that.callback)
                        that.callback(data);
                }
            }
        }
        diagram.DiagramMeta = DiagramMeta;
    })(diagram = Library.diagram || (Library.diagram = {}));
    var http;
    (function (http) {
        class Client {
            static get(uri, options) {
                return new Promise((resolve, reject) => {
                    options = options || {};
                    options.dataType = options.dataType || "json";
                    let xhr = new XMLHttpRequest();
                    xhr.open("GET", uri, true);
                    xhr.send();
                    xhr.onreadystatechange = processRequest;
                    function processRequest(e) {
                        if (xhr.readyState == 4) {
                            if (xhr.status == 200) {
                                let res = xhr.responseText;
                                if (options.dataType === "json")
                                    res = JSON.parse(res);
                                resolve(res);
                            }
                            else
                                reject("resource not found");
                        }
                    }
                });
            }
        }
        http.Client = Client;
    })(http = Library.http || (Library.http = {}));
    var ui;
    (function (ui) {
        class Main {
            constructor() {
                let that = this;
                that.entities = [];
                that.reserve = [];
                that.initMenu("container-menu");
                that.initEntities("container-loader-entities");
                that.initNote("container-note");
                that.initFileLoader("container-loader");
                that.initFileSave("container-save");
                that.initDC("paper");
            }
            initMenu(id) {
                return __awaiter(this, void 0, void 0, function* () {
                    let that = this;
                    that.menu = new Menu(id, that.onChange.bind(that));
                });
            }
            initDC(id) {
                let that = this;
                that.dc = new Library.diagram.DiagramMeta({ containerId: id }, that.onChange.bind(that));
            }
            initEntities(id) {
                let that = this;
                that.loaderEntities = new LoaderEntities(id, that.onChange.bind(that));
            }
            initNote(id) {
                let that = this;
                that.note = new Note(id, that.onChange.bind(that));
            }
            initFileLoader(id) {
                let that = this;
                that.fileLoader = new FileLoader(id, that.onChange.bind(that));
            }
            initFileSave(id) {
                let that = this;
                that.fileSave = new FileSave(id, that.onChange.bind(that));
            }
            onChange(e) {
                return __awaiter(this, void 0, void 0, function* () {
                    let that = this;
                    if (e.target == "menu" || e.target == "dc") {
                        if (e.target == "menu") {
                            if (e.action == "add")
                                that.dc.addEntity(that.getEntity(that.reserve, e.id).value);
                            else
                                that.dc.removeEntity(e.id);
                        }
                        else if (e.target == "dc") {
                            if (e.action == "remove") {
                                that.menu.uncheck(e.id);
                            }
                        }
                        if (e.action == "add") {
                            let entity = that.getEntity(that.reserve, e.id);
                            if (entity) {
                                that.entities.push(entity.value);
                                that.reserve.splice(entity.index, 1);
                            }
                        }
                        else if (e.action == "remove") {
                            let entity = that.getEntity(that.entities, e.id);
                            if (entity) {
                                that.reserve.push(entity.value);
                                that.entities.splice(entity.index, 1);
                            }
                        }
                    }
                    else if (e.target == "loader-entities") {
                        that.uri = e.data;
                        let res = yield Library.http.Client.get(that.uri);
                        that.reserve = res.value || [];
                        that.menu.addItems(that.reserve.map(item => { return { name: item.name, title: item.title || item.name }; }));
                    }
                    else if (e.target == "note") {
                        that.dc.addNote(e.data);
                    }
                    else if (e.target == "file-save") {
                        let data = that.dc.getDiagramData();
                        data.url = that.uri;
                        let saveAsBlob = new Blob([JSON.stringify(data)], { type: "text/plain" });
                        let saveToSaveAsURL = window.URL.createObjectURL(saveAsBlob);
                        let downloadLink = document.createElement("a");
                        downloadLink.download = e.data;
                        downloadLink.innerHTML = "Download File";
                        downloadLink.href = saveToSaveAsURL;
                        downloadLink.onclick = (e) => { document.body.removeChild(e.target); };
                        downloadLink.style.display = "none";
                        document.body.appendChild(downloadLink);
                        downloadLink.click();
                    }
                    else if (e.target == "file-load") {
                        let data = JSON.parse(e.data);
                        let res = yield Library.http.Client.get(data.url);
                        let entities = res.value || [];
                        that.uri = data.url;
                        that.entities = [];
                        that.reserve = [];
                        that.dc.clear();
                        entities.forEach(entity => {
                            let pos = that.getEntity(data.entities, entity.name);
                            if (pos) {
                                that.entities.push(entity);
                            }
                            else {
                                that.reserve.push(entity);
                            }
                        });
                        that.dc.addEntities(that.entities, data.entities);
                        that.dc.addNotes(data.notes);
                        that.menu.addItems(entities.map(item => {
                            return { name: item.name, title: item.title || item.name, checked: that.getEntity(that.entities, item.name) != null };
                        }));
                    }
                });
            }
            getEntity(collection, entity) {
                let res = null;
                collection.every((v, i) => {
                    if (entity == v.name) {
                        res = { index: i, value: v };
                        return false;
                    }
                    return true;
                });
                return res;
            }
        }
        ui.Main = Main;
        class Menu {
            constructor(containerId, callback) {
                let that = this;
                that.options = {
                    check: "glyphicon-check",
                    unchecked: "glyphicon-unchecked"
                };
                that.containerId = containerId;
                that.data = [];
                that.callback = callback;
                that.container = $("#" + containerId).get(0);
                that.addEvents();
            }
            addItems(items) {
                let that = this;
                items = items || [];
                that.container.innerHTML = "";
                items.forEach(item => {
                    let name = item.name;
                    let title = item.title || item.name;
                    let icon = item.checked ? that.options.check : that.options.unchecked;
                    that.container.appendChild($(`<li class="list-group-item" data-id="${name}"><span class="glyphicon ${icon}"></span> ${title}</li>`).get(0));
                });
            }
            check(name) {
                let that = this;
                let target = that.container.querySelector("li[data-id='" + name + "'] > span");
                if (target) {
                    target.classList.remove(that.options.unchecked);
                    target.classList.add(that.options.check);
                }
            }
            uncheck(name) {
                let that = this;
                let target = that.container.querySelector("li[data-id='" + name + "'] > span");
                if (target) {
                    target.classList.remove(that.options.check);
                    target.classList.add(that.options.unchecked);
                }
            }
            addEvents() {
                let that = this;
                that.container.addEventListener("click", e => {
                    let target = e.target;
                    let id = target.parentElement.getAttribute("data-id");
                    if (id) {
                        let isChecked = target.classList.contains(that.options.check);
                        if (isChecked) {
                            that.uncheck(id);
                            that.callback({ event: "click", action: "remove", target: "menu", id: id });
                        }
                        else {
                            that.check(id);
                            that.callback({ event: "click", action: "add", target: "menu", id: id });
                        }
                    }
                });
            }
        }
        ui.Menu = Menu;
        class LoaderEntities {
            constructor(containerId, callback) {
                let that = this;
                that.containerId = containerId;
                that.callback = callback;
                that.container = $("#" + containerId).get(0);
                that.container.innerHTML = "";
                let html = [
                    '<div class="input-group">',
                    '<input type="text" class="form-control" placeholder="Entities meta repository url">',
                    '<span class="input-group-btn">',
                    '<button class="btn btn-default" type="button">',
                    '<span class="glyphicon glyphicon-ok"></span>',
                    '</button>',
                    '</span>',
                    '</div>'
                ];
                that.container.appendChild($(html.join("")).get(0));
                that.addEvents();
            }
            addEvents() {
                let that = this;
                let btn = that.container.querySelector("button");
                btn.addEventListener("click", e => {
                    let input = that.container.querySelector("input");
                    if (input.value) {
                        if (that.callback)
                            that.callback({ event: "click", action: "search", target: "loader-entities", data: input.value });
                    }
                }, true);
            }
        }
        ui.LoaderEntities = LoaderEntities;
        class Note {
            constructor(containerId, callback) {
                let that = this;
                that.containerId = containerId;
                that.callback = callback;
                that.container = $("#" + containerId).get(0);
                that.container.innerHTML = "";
                let html = [
                    '<div class="input-group">',
                    '<input type="text" class="form-control" placeholder="Note text">',
                    '<span class="input-group-btn">',
                    '<button class="btn btn-default" type="button">',
                    '<span class="glyphicon glyphicon-ok"></span>',
                    '</button>',
                    '</span>',
                    '</div>'
                ];
                that.container.appendChild($(html.join("")).get(0));
                that.addEvents();
            }
            addEvents() {
                let that = this;
                let btn = that.container.querySelector("button");
                btn.addEventListener("click", e => {
                    let input = that.container.querySelector("input");
                    if (input.value) {
                        if (that.callback)
                            that.callback({ event: "click", action: "add", target: "note", data: input.value });
                        input.value = "";
                    }
                }, true);
            }
        }
        ui.Note = Note;
        class FileSave {
            constructor(containerId, callback) {
                let that = this;
                that.containerId = containerId;
                that.callback = callback;
                that.container = $("#" + containerId).get(0);
                that.container.innerHTML = "";
                let html = [
                    '<div class="input-group">',
                    '<input type="text" class="form-control" placeholder="file name">',
                    '<span class="input-group-btn">',
                    '<button class="btn btn-default" type="button">',
                    '<span class="glyphicon glyphicon-save"></span>',
                    '</button>',
                    '</span>',
                    '</div>'
                ];
                that.container.appendChild($(html.join("")).get(0));
                that.addEvents();
            }
            addEvents() {
                let that = this;
                let btn = that.container.querySelector("button");
                btn.addEventListener("click", e => {
                    let input = that.container.querySelector("input");
                    if (input.value) {
                        if (that.callback)
                            that.callback({ event: "click", action: "save", target: "file-save", data: input.value });
                    }
                }, true);
            }
        }
        ui.FileSave = FileSave;
        class FileLoader {
            constructor(containerId, callback) {
                let that = this;
                that.containerId = containerId;
                that.callback = callback;
                that.container = $("#" + containerId).get(0);
                that.container.innerHTML = "";
                let html = [
                    '<div class="form-group">',
                    '<input type="file">',
                    '</div>'
                ];
                that.container.appendChild($(html.join("")).get(0));
                that.addEvents();
            }
            addEvents() {
                let that = this;
                let input = that.container.querySelector("input");
                input.addEventListener("change", e => {
                    let file = input.files[0];
                    let fileReader = new FileReader();
                    fileReader.onload = function (event) {
                        if (that.callback)
                            that.callback({ event: "click", action: "load", target: "file-load", data: event.target.result });
                    };
                    fileReader.readAsText(file, "UTF-8");
                }, true);
            }
        }
        ui.FileLoader = FileLoader;
    })(ui = Library.ui || (Library.ui = {}));
})(Library || (Library = {}));
