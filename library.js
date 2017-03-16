var Library;
(function (Library) {
    var diagram;
    (function (diagram) {
        class DiagramClass {
            constructor(config, callback) {
                let that = this;
                that.config = config || {};
                that.callback = callback;
                that.config.classes = that.config.classes || {};
                that.config.relations = that.config.relations || [];
                that.config.w = that.config.w || 800;
                that.config.h = that.config.h || 600;
                that.graph = new joint.dia.Graph();
                that.uml = joint.shapes.uml;
                that.paper = new joint.dia.Paper({
                    el: $("#" + config.containerId),
                    width: that.config.w,
                    height: that.config.h,
                    gridSize: 1,
                    model: that.graph
                });
                that.model = {};
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
            addEvents() {
                let that = this;
                let types = {
                    interface: "uml.Interface",
                    abstract: "uml.Abstract",
                    class: "uml.Class"
                };
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
                            that.callback({ event: "click", action: "add", id: cell.attributes.name });
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
                        if (that.callback)
                            that.callback({ event: "click", action: "remove", id: cell.attributes.name });
                    }
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
                        name: title || name,
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
                let lineHeight = 20;
                let caracWidth = 6;
                let minWidth = 150;
                let minHeight = 100;
                let params = conf.params;
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
        }
        diagram.DiagramClass = DiagramClass;
        class DiagramMeta {
            constructor(config, callback, entities) {
                let that = this;
                that.config = config || {};
                that.entities = entities || [];
                that.composedEntities = {};
                that.relationEntities = {};
                that.callback = callback;
                that.init();
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
            removeEntity(name) {
                let that = this;
                that.dc.removeClass(name);
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
                that.dc.addClass(entity.name, entity.title || entity.name);
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
                    let fE = that.getEntity(rel.foreignEntity);
                    if (fE)
                        that.dc.addAssociation(entity, rel.foreignEntity);
                    that.relationEntities[rel.foreignEntity] = that.relationEntities[rel.foreignEntity] || [];
                    that.relationEntities[rel.foreignEntity].push(entity);
                    that.relationEntities[entity] = that.relationEntities[entity] || [];
                    that.relationEntities[entity].push(rel.foreignEntity);
                });
                if (that.relationEntities[entity]) {
                    that.relationEntities[entity].forEach((v, i) => {
                        let e = that.getEntity(v);
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
            getEntity(name) {
                let that = this;
                let res = null;
                that.entities.every((v, i) => {
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
                        if (v == data.id) {
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
                }
                if (that.callback)
                    that.callback(data);
            }
        }
        diagram.DiagramMeta = DiagramMeta;
    })(diagram = Library.diagram || (Library.diagram = {}));
    var Test;
    (function (Test) {
        function testLibraryDiagramClass() {
            let dc = new Library.diagram.DiagramClass({ containerId: "paper" }, data => {
            });
            dc.addInterface("IMammal", "IPerson", { x: 300, y: 50 });
            dc.addAttribute("IMammal", 'age: Number');
            dc.addMethod("IMammal", ['+ setAge(value: Number): Void', '+ getAge(): Number']);
            dc.addAbstract("Person", "Person", { x: 300, y: 200 });
            dc.addAttribute("Person", ['firstname: String', 'lastname: String']);
            dc.addMethod("Person", ['+ setFirstname(value: String): Void', '+ getFirstname(): String']);
            dc.addMethod("Person", ['+ setLastname(value: String): Void', '+ getLastname(): String']);
            dc.addClass("Man", "Man", { x: 150, y: 400 });
            dc.addClass("Woman", "Woman", { x: 480, y: 400 });
            dc.addClass("Address", "Address", { x: 40, y: 200 });
            dc.addAttribute("Address", ['street: String', 'city: String']);
            dc.addClass("E-mail", "E-mail", { x: 600, y: 200 });
            dc.addGeneralization("Person", "IMammal");
            dc.addAggregation("Address", "Person");
            dc.addComposition("E-mail", "Person");
            dc.addGeneralization("Man", "Person");
            dc.addGeneralization("Woman", "Person");
        }
        function testLibraryDiagramMeta() {
            let entities = [
                {
                    "name": "Person",
                    "type": "object",
                    "title": "Person",
                    "properties": {
                        "id": { "type": "integer", "format": "int64" },
                        "matricule": { "type": "string", "format": "code", "title": "Matricule" },
                        "nom": { "type": "string", "title": "Nom" },
                        "prenom": { "type": "string", "title": "Prénom" },
                        "age": { "type": "integer", "title": "Age" },
                        "salaire": { "type": "number", "format": "money", "title": "Salaire" },
                        "gender": { "$ref": "#/definitions/GenderDef" },
                        "address": {
                            "title": "address",
                            "type": "array",
                            "expand": true,
                            "items": { "$ref": "#/definitions/Adress" }
                        }
                    },
                    "primaryKey": "matricule",
                    "relations": {
                        "comptes": {
                            "foreignEntity": "Compte",
                            "foreignKey": "refUser",
                            "key": "matricule",
                            "multiplicity": "many"
                        }
                    },
                    "definitions": {
                        "Adress": {
                            "type": "object",
                            "title": "Adress",
                            "name": "Adress",
                            "properties": {
                                "country": {
                                    "title": "country",
                                    "type": "string"
                                },
                                "street": {
                                    "title": "street",
                                    "type": "string"
                                },
                                "zip": {
                                    "title": "zip",
                                    "type": "string"
                                }
                            }
                        },
                        "GenderDef": {
                            "title": "Genre",
                            "type": "string",
                            "enum": ["m", "f"],
                            "enumNames": ["Masculin", "Féminin"]
                        }
                    }
                },
                {
                    "name": "Compte",
                    "type": "object",
                    "title": "Compte",
                    "properties": {
                        "numero": {
                            "type": "integer",
                            "title": "Numéro"
                        },
                        "solde": {
                            "type": "number",
                            "format": "money",
                            "title": "Solde"
                        },
                        "libelle": {
                            "type": "string",
                            "title": "Libellé"
                        },
                        "refUser": {
                            "type": "string",
                            "format": "code"
                        }
                    },
                    "primaryKey": "numero"
                }
            ];
            let reserve = {
                Other: {
                    name: "Other",
                    properties: {
                        lol: {
                            type: "string"
                        },
                        refUser: {
                            type: "string",
                            format: "code"
                        }
                    },
                    relations: {
                        person: {
                            foreignEntity: "Person",
                            foreignKey: "refUser",
                            key: "matricule",
                            multiplicity: "many"
                        }
                    }
                }
            };
            let dc = new Library.diagram.DiagramMeta({ containerId: "paper2" }, onModelChanged, entities);
            var checked = "glyphicon-check";
            var unchecked = "glyphicon-unchecked";
            $("#menu-container").get(0).addEventListener("click", e => {
                let target = e.target;
                let id = target.parentElement.getAttribute("data-id");
                if (id) {
                    let isChecked = target.classList.contains(checked);
                    if (isChecked)
                        dc.removeEntity(id);
                    else {
                        if (reserve[id])
                            dc.addEntity(reserve[id]);
                    }
                }
            });
            function getEntity(entity) {
                let res = null;
                entities.every((v, i) => {
                    if (entity == v.name) {
                        res = { index: i, value: v };
                        return false;
                    }
                    return true;
                });
                return res;
            }
            function onModelChanged(data) {
                let target = document.querySelector("#menu-container  > li[data-id='" + data.id + "'] > span");
                if (target && data.action == "add") {
                    target.classList.remove(unchecked);
                    target.classList.add(checked);
                    let e = reserve[data.id];
                    if (e) {
                        entities.push(e);
                        delete reserve[data.id];
                    }
                }
                else if (target && data.action == "remove") {
                    target.classList.remove(checked);
                    target.classList.add(unchecked);
                    let e = getEntity(data.id);
                    if (e) {
                        reserve[data.id] = e.value;
                        entities.splice(e.index, 1);
                    }
                }
            }
        }
        function testInit() {
            var graph = new joint.dia.Graph();
            var paper = new joint.dia.Paper({
                el: $('#paper'),
                width: 800,
                height: 600,
                gridSize: 1,
                model: graph
            });
            var uml = joint.shapes.uml;
            var classes = {
                mammal: new uml.Interface({
                    position: { x: 300, y: 50 },
                    size: { width: 240, height: 100 },
                    name: 'Mammal',
                    attributes: ['dob: Date'],
                    methods: ['+ setDateOfBirth(dob: Date): Void', '+ getAgeAsDays(): Numeric'],
                    attrs: {
                        '.uml-class-name-rect': {
                            fill: '#feb662',
                            stroke: '#ffffff',
                            'stroke-width': 0.5
                        },
                        '.uml-class-attrs-rect, .uml-class-methods-rect': {
                            fill: '#fdc886',
                            stroke: '#fff',
                            'stroke-width': 0.5
                        },
                        '.uml-class-attrs-text': {
                            ref: '.uml-class-attrs-rect',
                            'ref-y': 0.5,
                            'y-alignment': 'middle'
                        },
                        '.uml-class-methods-text': {
                            ref: '.uml-class-methods-rect',
                            'ref-y': 0.5,
                            'y-alignment': 'middle'
                        }
                    }
                }),
                person: new uml.Abstract({
                    position: { x: 300, y: 300 },
                    size: { width: 260, height: 100 },
                    name: 'Person',
                    attributes: ['firstName: String', 'lastName: String'],
                    methods: ['+ setName(first: String, last: String): Void', '+ getName(): String'],
                    attrs: {
                        '.uml-class-name-rect': {
                            fill: '#68ddd5',
                            stroke: '#ffffff',
                            'stroke-width': 0.5
                        },
                        '.uml-class-attrs-rect, .uml-class-methods-rect': {
                            fill: '#9687fe',
                            stroke: '#fff',
                            'stroke-width': 0.5
                        },
                        '.uml-class-methods-text, .uml-class-attrs-text': {
                            fill: '#fff'
                        }
                    }
                }),
                bloodgroup: new uml.Class({
                    position: { x: 20, y: 190 },
                    size: { width: 220, height: 100 },
                    name: 'BloodGroup',
                    attributes: ['bloodGroup: String'],
                    methods: ['+ isCompatible(bG: String): Boolean'],
                    attrs: {
                        '.uml-class-name-rect': {
                            fill: '#ff8450',
                            stroke: '#fff',
                            'stroke-width': 0.5,
                        },
                        '.uml-class-attrs-rect, .uml-class-methods-rect': {
                            fill: '#fe976a',
                            stroke: '#fff',
                            'stroke-width': 0.5
                        },
                        '.uml-class-attrs-text': {
                            ref: '.uml-class-attrs-rect',
                            'ref-y': 0.5,
                            'y-alignment': 'middle'
                        },
                        '.uml-class-methods-text': {
                            ref: '.uml-class-methods-rect',
                            'ref-y': 0.5,
                            'y-alignment': 'middle'
                        }
                    }
                }),
                address: new uml.Class({
                    position: { x: 630, y: 190 },
                    size: { width: 160, height: 100 },
                    name: 'Address',
                    attributes: ['houseNumber: Integer', 'streetName: String', 'town: String', 'postcode: String'],
                    methods: [],
                    attrs: {
                        '.uml-class-name-rect': {
                            fill: '#ff8450',
                            stroke: '#fff',
                            'stroke-width': 0.5
                        },
                        '.uml-class-attrs-rect, .uml-class-methods-rect': {
                            fill: '#fe976a',
                            stroke: '#fff',
                            'stroke-width': 0.5
                        },
                        '.uml-class-attrs-text': {
                            'ref-y': 0.5,
                            'y-alignment': 'middle'
                        }
                    }
                }),
                man: new uml.Class({
                    position: { x: 200, y: 500 },
                    size: { width: 180, height: 50 },
                    name: 'Man',
                    attrs: {
                        '.uml-class-name-rect': {
                            fill: '#ff8450',
                            stroke: '#fff',
                            'stroke-width': 0.5
                        },
                        '.uml-class-attrs-rect, .uml-class-methods-rect': {
                            fill: '#fe976a',
                            stroke: '#fff',
                            'stroke-width': 0.5
                        }
                    }
                }),
                woman: new uml.Class({
                    position: { x: 450, y: 500 },
                    size: { width: 180, height: 50 },
                    name: 'Woman',
                    methods: ['+ giveABrith(): Person []'],
                    attrs: {
                        '.uml-class-name-rect': {
                            fill: '#ff8450',
                            stroke: '#fff',
                            'stroke-width': 0.5
                        },
                        '.uml-class-attrs-rect, .uml-class-methods-rect': {
                            fill: '#fe976a',
                            stroke: '#fff',
                            'stroke-width': 0.5
                        },
                        '.uml-class-methods-text': {
                            'ref-y': 0.5,
                            'y-alignment': 'middle'
                        }
                    }
                })
            };
            _.each(classes, function (c) {
                graph.addCell(c);
            });
            var relations = [
                new uml.Generalization({ source: { id: classes.man.id }, target: { id: classes.person.id } }),
                new uml.Generalization({ source: { id: classes.woman.id }, target: { id: classes.person.id } }),
                new uml.Implementation({ source: { id: classes.person.id }, target: { id: classes.mammal.id } }),
                new uml.Aggregation({ source: { id: classes.person.id }, target: { id: classes.address.id } }),
                new uml.Composition({ source: { id: classes.person.id }, target: { id: classes.bloodgroup.id } })
            ];
            _.each(relations, function (r) { graph.addCell(r); });
            graph.on('remove', function (cell) {
                let types = {
                    interface: "uml.Interface",
                    abstract: "uml.Abstract",
                    class: "uml.Class"
                };
                let isEntity = false;
                Object.keys(types).every((k) => {
                    if (types[k] == cell.attributes.type) {
                        isEntity = true;
                        return false;
                    }
                    return true;
                });
                if (isEntity) {
                    console.log(cell.attributes.name);
                }
            });
        }
        testLibraryDiagramMeta();
    })(Test || (Test = {}));
})(Library || (Library = {}));
