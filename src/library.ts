declare var $: any;
declare var joint: any;
declare var _: any;

namespace Library {
    export module diagram {
        export interface IStyle {
            classNameRec?: { bg?: string, color?: string, fontSize?: number };
            classAttrsRec?: { bg?: string, color?: string, fontSize?: number };
            classAttrsText?: { bg?: string, color?: string, fontSize?: number, yAlign?: "middle", ref?: string, refY?: number };
            classMethodsRec?: { bg?: string, color?: string, fontSize?: number };
            classMethodsText?: { bg?: string, color?: string, fontSize?: number, yAlign?: "middle", ref?: string, refY?: number };
        }
        export interface IPosition {
            x?: number;
            y?: number;
        }
        export interface ISize {
            w?: number;
            h?: number;
        }
        export interface IEntity {
            name: string,
            properties: any;
            relations?: any;
            definitions?: any;
        }
        export class DiagramClass {
            private config: any;
            private callback: Function;
            private container: HTMLElement;
            private paper: any;
            private graph: any;
            private uml: any;
            private model: any;
            private notes: any;

            constructor(config: any, callback: Function) {
                let that = this;
                that.config = config || {};
                that.callback = callback;
                that.config.classes = config.classes || {};
                that.config.relations = config.relations || [];
                that.config.notes = config.notes || [];
                let size = that.getSize(config.containerId);
                that.config.w = config.w || size.w;
                that.config.h = config.h || size.h;
                that.graph = new joint.dia.Graph();
                that.uml = joint.shapes.uml;
                that.paper = new joint.dia.Paper({
                    el: typeof config.containerId === "string" ? $("#" + config.containerId) : $(config.containerId),
                    width: config.w,
                    height: config.h,
                    gridSize: 1,
                    model: that.graph
                });
                that.model = {};
                that.notes = [];
                that.addEvents();
            }
            public addInterface(name: string, title: string, position?: IPosition, size?: ISize, style?: IStyle) {
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
                    }
                }
                that.addType(name, title, position, size, that.uml.Interface, style);
            }
            public removeInterface(name: string) {
                this.removeType(name);
            }
            public addAbstract(name: string, title: string, position?: IPosition, size?: ISize, style?: IStyle) {
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
                    }
                }
                that.addType(name, title, position, size, that.uml.Abstract, style);
            }
            public removeAbstract(name: string) {
                this.removeType(name);
            }
            public addClass(name: string, title: string, position?: IPosition, size?: ISize, style?: IStyle) {
                let that = this;
                that.addType(name, title, position, size, that.uml.Class, style);
            }
            public removeClass(name: string) {
                this.removeType(name);
            }
            public addNote(content: string, position?: IPosition, size?: ISize, style?: IStyle) {
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
            public addAttribute(className: string, attr: string | string[]) {
                let that = this;
                let classe = that.config.classes[className];
                if (!classe) return;
                if (typeof attr === "string")
                    classe.params.attributes.push(attr);
                else
                    attr.forEach((v) => {
                        classe.params.attributes.push(v);
                    });
                that.fixeClassSize(classe);
                that.updateModel(className);
            }
            public addMethod(className: string, method: string | string[]) {
                let that = this;
                let classe = that.config.classes[className];
                if (!classe) return;
                if (typeof method === "string")
                    classe.params.methods.push(method);
                else
                    method.forEach((v) => {
                        classe.params.methods.push(v);
                    });
                that.fixeClassSize(classe);
                that.updateModel(className);
            }
            public addGeneralization(src: string, target: string) {
                let that = this;
                that.addRelation(src, target, that.uml.Generalization);
            }
            public addImplementation(src: string, target: string) {
                let that = this;
                that.addRelation(src, target, that.uml.Implementation);
            }
            public addAssociation(src: string, target: string) {
                let that = this;
                that.addRelation(src, target, that.uml.Association);
            }
            public addAggregation(src: string, target: string) {
                let that = this;
                that.addRelation(src, target, that.uml.Aggregation);
            }
            public addComposition(src: string, target: string) {
                let that = this;
                that.addRelation(src, target, that.uml.Composition);
            }
            public getDiagramData() {
                let that = this;
                return {
                    entities: Object.keys(that.model).map(key => { let position = that.getClass(key).attributes.position; return { name: key, x: position.x, y: position.y}}),
                    notes: that.notes.map(note => { let position = note.attributes.position; return { content: note.attributes.note, x: position.x, y: position.y }})
                };
            }
            public resize(size?: {w?: number, h?: number}) {
                let that = this;
                let lSize = that.getSize(that.config.containerId);
                size = size || lSize;
                that.config.w = size.w || lSize.w || that.config.w;
                that.config.h = size.h || lSize.h || that.config.h;
                this.paper.setDimensions(that.config.w, that.config.h);
            }
            public clear() {
                let that = this;
                this.graph.clear();
                that.model = {};
                that.notes = [];
            }
            private addEvents() {
                let that = this;
                let types: any = {
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
                        if (that.callback) that.callback({ event: "click", action: "add", target: "dc", id: cell.attributes.name });
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
                        if (that.callback) that.callback({ event: "click", action: "remove", target: "dc", id: cell.attributes.name });
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
                        if (index > -1) that.notes.splice(index, 1);
                    }
                });
                window.addEventListener("resize", function(e) {
                    that.resize();
                });
            }
            private addType(name: string, title: string, position?: IPosition, size?: ISize, type?: any, style?: IStyle) {
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
            private removeType(name: string) {
                let that = this;
                let classe = that.getClass(name);
                if (classe) {
                    classe.remove();
                }
            }
            private addRelation(src: string, target: string, type: any) {
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
            private fixeClassSize(conf: any) {
                let that = this;
                let params = conf.params;
                let nbLine = params.attributes.length + params.methods.length;
                let lineHeight =  nbLine <= 10 ? 20 : (nbLine <= 50 ? 15 : 13);
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
            private parseStyle(style: any) {
                let that = this;
                style = style || {};
                let lstyle: any = {};
                if (style.bg) lstyle.fill = style.bg;
                if (style.color) lstyle.stroke = style.color;
                if (style.fontSize) lstyle["stroke-width"] = style.fontSize;
                if (style.yAlign) lstyle["y-alignment"] = style.yAlign;
                if (style.ref) lstyle["ref"] = style.ref;
                if (style.refY) lstyle["ref-y"] = style.refY;
                return Object.keys(lstyle).length ? lstyle : null;
            }
            private getClass(name: string) {
                return this.model[name];
            }
            private updateModel(name: string) {
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
            private getSize(id?: string) {
                let that = this;
                let container = typeof id === "string" ? $("#" + id).get(0) : id;
                let w = 800;
                let h = 600;
                if (container) {
                    w = container.offsetWidth || w;
                    h = container.offsetHeight || h;
                }
                return { w: w, h: h };
            }
        }
        export class DiagramMeta {
            private config: any;
            private entities: any[];
            private positions: any[];
            private callback: Function;
            private composedEntities: any;
            private relationEntities: any;
            private dc: Library.diagram.DiagramClass;

            constructor(config: any, callback?: Function, entities?: any[], positions?: any[]) {
                let that = this;
                that.config = config || {};
                that.entities = entities || [];
                that.positions = positions || [];
                that.composedEntities = {};
                that.relationEntities = {};
                that.callback = callback;
                that.init();
            }
            public addEntities(entities: IEntity[], positions: any[]) {
                let that = this;
                entities = entities || [];
                that.positions = positions || [];
                entities.forEach(entity => {
                    that.addEntity(entity);
                });
            }
            public addEntity(meta: IEntity) {
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
            public addNotes(notes: any) {
                let that = this;
                notes && notes.forEach(note => {
                    let position = {x: note.x, y: note.y};
                    that.addNote(note.content, position);
                });
            }
            public addNote(note: string, position?: IPosition, size?: ISize, style?: IStyle) {
                let that = this;
                that.dc.addNote(note, position, size, style);
            }
            public removeEntity(name: string) {
                let that = this;
                that.dc.removeClass(name);
            }
            public getDiagramData(): any {
                return this.dc.getDiagramData();
            }
            public resize(size?: {w?: number, h?: number}) {
                this.dc.resize(size);
            }
            public clear() {
                let that = this;
                that.entities = [];
                that.positions = [];
                that.composedEntities = {};
                that.relationEntities = {};
                that.dc.clear();
            }
            private init() {
                let that = this;
                that.dc = new Library.diagram.DiagramClass({ containerId: that.config.containerId }, that.onModelChanged.bind(that));
                that.entities.forEach(entity => {
                    that.entity(entity, entity.definitions);
                });
            }
            private entity(entity: any, definitions: any) {
                let that = this;
                entity = entity || {};
                let position = that.getEntity(that.positions, entity.name);
                if (position) position = position.value;
                that.dc.addClass(entity.name, entity.title || entity.name, position);
                that.properties(entity.name, entity.properties, definitions);
                that.relations(entity.name, entity.relations);
            }
            private properties(entity: string, properties: any, definitions?: any) {
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
            private property(entity: string, property: string, data: any, definitions: any) {
                let that = this;
                that.dc.addAttribute(entity, property + " : " + (data.format || data.type));
            }
            private propertyObject(entity: string, property: string, data: any, definitions: any) {
                let that = this;
                data = data || {};
                data.name = data.name || property;
                that.entity(data, definitions);
                that.dc.addComposition(data.name, entity);
                that.composedEntities[entity] = that.composedEntities[entity] || [];
                that.composedEntities[entity].push(data.name);
            }
            private propertyArray(entity: string, property: string, data: any, definitions: any) {
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
            private relations(entity: string, relations: any) {
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
            private isSimpleProperty(type: string) {
                return (type && type.toLowerCase() !== "object" && type.toLowerCase() !== "array");
            }
            private isArrayProperty(type: string) {
                return type.toLowerCase() === "array";
            }
            private getDefinitionName(path: string) {
                return path.replace("#/definitions/", "");
            }
            private getEntity(collection, name: string) {
                let that = this;
                let res = null;
                collection && collection.every((v, i) => {
                    if (name == v.name) {
                        res = { index: i, value: v };
                        return false;
                    }
                    return true;
                });
                return res;
            }
            private hasRelation(src: string, dest: string) {
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
            private onModelChanged(data) {
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
                    if (index > -1) that.entities.splice(index, 1);
                    if (that.composedEntities[data.id]) {
                        that.composedEntities[data.id].forEach(v => {
                            that.removeEntity(v);
                        });
                        delete that.composedEntities[data.id];
                    }
                    if (that.callback) that.callback(data);
                }
            }
        }
    }

    export module http {
        export interface IClient {
            get(uri: string, options?: { dataType?: string }): Promise<any>;
        }
        export class Client implements Library.http.IClient {
            public get(uri: string, options?: { dataType?: string }): Promise<any> {
                return new Promise<any>((resolve, reject) => {
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
                                if (options.dataType === "json") res = JSON.parse(res);
                                resolve(res);
                            }
                            else
                                reject("resource not found");
                        }
                    }
                });
            }
        }
    }

    export module ui {
        export interface MainOptions {
            restClient?: Library.http.IClient;
            paperContainerId?: string;
            menuContainerId?: string;
            restLoaderContainerId?: string;
            fileLoaderContainerId?: string;
            fileSaveContainerId?: string;
            noteContainerId?: string;
        }
        export class Main {
            private name: string;
            private description: string;
            private folder: string;
            private host: string;

            private config: any;
            private entities: any[];
            private reserve: any[];

            private resClient: Library.http.IClient;
            private menu: Menu;
            private dc: Library.diagram.DiagramMeta;
            private loaderEntities: LoaderEntities;
            private note: Note;
            private fileSave: FileSave;
            private fileLoader: FileLoader;
            private options: MainOptions;

            constructor(options: MainOptions) {
                let that = this;
                that.entities = [];
                that.reserve = [];
                that.options = options || {};
                if (that.options.restClient) 
                    that.resClient = that.options.restClient;
                else
                    that.resClient = new Library.http.Client();
                that.init();
            }
            public setDiagram(value) {
                let that = this;
                value = value || {};
                that.loadDiagram(value);
            }
            public getDiagram(value) {
                let that = this;
                return {
                    name: that.name,
                    description: that.description,
                    folder: that.folder,
                    data: JSON.stringify(that.dc.getDiagramData())
                };
            }
            public resize(size?: {w?: number, h?: number}) {
                this.dc.resize(size);
            }
            private async init() {
                let that = this;
                //that.config = await that.resClient.get("config.json");
                //that.host = that.config.server.host;
                that.initMenu(that.options.menuContainerId);
                that.initEntities(that.options.restLoaderContainerId);
                that.initNote(that.options.noteContainerId);
                that.initFileLoader(that.options.fileLoaderContainerId);
                that.initFileSave(that.options.fileSaveContainerId);
                that.initDC(that.options.paperContainerId);
            }
            private async initMenu(id: string) {
                let that = this;
                if (id) 
                    that.menu = new Menu(id, that.onChange.bind(that));
            }
            private initDC(id: string) {
                let that = this;
                if (id) 
                    that.dc = new Library.diagram.DiagramMeta({ containerId: id }, that.onChange.bind(that));
            }
            private initEntities(id: string) {
                let that = this;
                if (id) 
                    that.loaderEntities = new LoaderEntities(id, that.onChange.bind(that));
            }
            private initNote(id: string) {
                let that = this;
                if (id) 
                    that.note = new Note(id, that.onChange.bind(that));
            }
            private initFileLoader(id: string) {
                let that = this;
                if (id) 
                    that.fileLoader = new FileLoader(id, that.onChange.bind(that));
            }
            private initFileSave(id: string) {
                let that = this;
                if (id) 
                    that.fileSave = new FileSave(id, that.onChange.bind(that));
            }
            private async onChange(e: any) {
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
                    that.folder = e.data;
                    let uri = that.host +"/"+ that.folder +"/odata/$entities";
                    let res = await that.resClient.get(uri);
                    that.reserve = res.value || [];
                    that.menu.addItems(that.reserve.map(item => { return { name: item.name, title: item.title || item.name } }));
                }
                else if (e.target == "note") {
                    that.dc.addNote(e.data);
                }
                else if (e.target == "file-save") {
                    let data: any = { data: JSON.stringify(that.dc.getDiagramData()) };
                    data.folder = that.folder;
                    data.name = e.data; // file name
                    let saveAsBlob = new Blob([JSON.stringify(data)], { type: "text/plain" });
                    let saveToSaveAsURL = window.URL.createObjectURL(saveAsBlob);

                    let downloadLink = document.createElement("a");
                    downloadLink.download = e.data;
                    downloadLink.innerHTML = "Download File";
                    downloadLink.href = saveToSaveAsURL;
                    downloadLink.onclick = (e: any) => { document.body.removeChild(e.target) };
                    downloadLink.style.display = "none";
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                }
                else if (e.target == "file-load") {
                    that.loadDiagram(JSON.parse(e.data));
                }
            }
            private getEntity(collection: any[], entity: string) {
                let res = null;
                collection && collection.every((v, i) => {
                    if (entity == v.name) {
                        res = { index: i, value: v };
                        return false;
                    }
                    return true;
                });
                return res;
            }
            private async loadDiagram(data: any) {
                let that = this;
                that.folder = data.folder;
                that.name = data.name;
                that.description = data.description;
                data.data = data.data ? JSON.parse(data.data) : {};
                let uri = data.uri ? data.uri : (that.host ? that.host + "/" : "")+ that.folder +"/odata/$entities";
                let res = await that.resClient.get(uri);
                let entities = res.value || [];
                that.entities = [];
                that.reserve = [];
                that.dc.clear();
                entities.forEach(entity => {
                    let pos = that.getEntity(data.data.entities, entity.name);
                    if (pos) {
                        that.entities.push(entity);
                    }
                    else {
                        that.reserve.push(entity);
                    }
                });
                that.dc.addEntities(that.entities, data.data.entities);
                that.dc.addNotes(data.data.notes);
                that.menu && that.menu.addItems(entities.map(item => { 
                    return { name: item.name, title: item.title || item.name, checked: that.getEntity(that.entities, item.name) != null } 
                }));
            }
        }
        export class Menu {
            private containerId: string;
            private container: HTMLElement;
            private data: { name: string, title: string, checked?: boolean }[];
            private callback: Function;
            private options: any;

            constructor(containerId: string, callback: Function) {
                let that = this;
                that.options = {
                    check: "glyphicon-check",
                    unchecked: "glyphicon-unchecked"
                };
                that.containerId = containerId;
                that.data = [];
                that.callback = callback;
                that.container =  typeof containerId === "string" ? $("#" + containerId).get(0) : containerId;
                that.addEvents();
            }
            public addItems(items: { name: string, title: string, checked?: boolean }[]) {
                let that = this;
                items = items || [];
                that.container.innerHTML = "";
                items.forEach(item => {
                    let name = item.name;
                    let title = item.title || item.name;
                    let icon = item.checked ? that.options.check : that.options.unchecked;
                    that.container.appendChild($(`<li class="list-group-item" data-id="${name}"><span class="glyphicon ${icon}" style="cursor:pointer"></span> ${title}</li>`).get(0));
                });
            }
            public check(name: string) {
                let that = this;
                let target = that.container.querySelector("li[data-id='" + name + "'] > span");
                if (target) {
                    target.classList.remove(that.options.unchecked);
                    target.classList.add(that.options.check);
                }
            }
            public uncheck(name: string) {
                let that = this;
                let target = that.container.querySelector("li[data-id='" + name + "'] > span");
                if (target) {
                    target.classList.remove(that.options.check);
                    target.classList.add(that.options.unchecked);
                }
            }
            private addEvents() {
                let that = this;
                that.container.addEventListener("click", e => {
                    let target = <HTMLElement>e.target;
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

        export class LoaderEntities {
            private containerId: string;
            private container: HTMLElement;
            private callback: Function;

            constructor(containerId: string, callback: Function) {
                let that = this;
                that.containerId = containerId;
                that.callback = callback;
                that.container =  typeof containerId === "string" ? $("#" + containerId).get(0) : containerId;
                that.container.innerHTML = "";
                let html = [
                    '<div class="input-group">',
                    '<input type="text" class="form-control" placeholder="Folder name">',
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
            private addEvents() {
                let that = this;
                let btn = that.container.querySelector("button");
                btn.addEventListener("click", e => {
                    let input: HTMLInputElement = that.container.querySelector("input");
                    if (input.value) {
                        if (that.callback)
                            that.callback({ event: "click", action: "search", target: "loader-entities", data: input.value });
                    }
                }, true);
            }
        }

        export class Note {
            private containerId: string;
            private container: HTMLElement;
            private callback: Function;

            constructor(containerId: string, callback: Function) {
                let that = this;
                that.containerId = containerId;
                that.callback = callback;
                that.container =  typeof containerId === "string" ? $("#" + containerId).get(0) : containerId;
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
            private addEvents() {
                let that = this;
                let btn = that.container.querySelector("button");
                btn.addEventListener("click", e => {
                    let input: HTMLInputElement = that.container.querySelector("input");
                    if (input.value) {
                        if (that.callback)
                            that.callback({ event: "click", action: "add", target: "note", data: input.value });
                        input.value = "";
                    }
                }, true);
            }
        }

        export class FileSave {
            private containerId: string;
            private container: HTMLElement;
            private callback: Function;

            constructor(containerId: string, callback: Function) {
                let that = this;
                that.containerId = containerId;
                that.callback = callback;
                that.container =  typeof containerId === "string" ? $("#" + containerId).get(0) : containerId;
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
            private addEvents() {
                let that = this;
                let btn = that.container.querySelector("button");
                btn.addEventListener("click", e => {
                    let input: HTMLInputElement = that.container.querySelector("input");
                    if (input.value) {
                        if (that.callback)
                            that.callback({ event: "click", action: "save", target: "file-save", data: input.value });
                    }
                }, true);
            }
        }

        export class FileLoader {
            private containerId: string;
            private container: HTMLElement;
            private callback: Function;

            constructor(containerId: string, callback: Function) {
                let that = this;
                that.containerId = containerId;
                that.callback = callback;
                that.container =  typeof containerId === "string" ? $("#" + containerId).get(0) : containerId;
                that.container.innerHTML = "";
                let html = [
                    '<div class="form-group">',
                    '<input type="file">',
                    '</div>'
                ];
                that.container.appendChild($(html.join("")).get(0));
                that.addEvents();
            }
            private addEvents() {
                let that = this;
                let input: HTMLInputElement = that.container.querySelector("input");
                input.addEventListener("change", e => {
                    let file = input.files[0];
                    let fileReader = new FileReader();
                    fileReader.onload = function (event: any) {
                        if (that.callback)
                            that.callback({ event: "click", action: "load", target: "file-load", data: event.target.result });
                    };
                    fileReader.readAsText(file, "UTF-8");
                }, true);
            }
        }
    }
}