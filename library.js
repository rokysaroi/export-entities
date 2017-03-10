var Library;
(function (Library) {
    var diagram;
    (function (diagram) {
        class DiagramClass {
            constructor(config) {
                let that = this;
                that.config = config || {};
                that.config.classes = that.config.classes || {};
                that.config.relations = that.config.relations || [];
                that.config.w = that.config.w || 800;
                that.config.h = that.config.h || 600,
                    that.graph = new joint.dia.Graph();
                that.uml = joint.shapes.uml;
            }
            addInterface(name, title, position, size, options) {
                let that = this;
                that.addType(name, title, position, size, that.uml.Interface, options);
            }
            addAbstract(name, title, position, size, options) {
                let that = this;
                that.addType(name, title, position, size, that.uml.Abstract, options);
            }
            addClass(name, title, position, size, options) {
                let that = this;
                that.addType(name, title, position, size, that.uml.Class, options);
            }
            addAttribute(className, attrs) {
                let that = this;
                let classe = that.config.classes[className];
                if (!classe)
                    return;
                if (typeof attrs === "string")
                    classe.params.attributes.push(attrs);
                else
                    attrs.forEach((v) => {
                        classe.params.attributes.push(v);
                    });
                that.fixeClassSize(classe);
            }
            addMethod(className, methods) {
                let that = this;
                let classe = that.config.classes[className];
                if (!classe)
                    return;
                if (typeof methods === "string")
                    classe.params.methods.push(methods);
                else
                    methods.forEach((v) => {
                        classe.params.methods.push(v);
                    });
                that.fixeClassSize(classe);
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
            addStyleClassNameRec(className, style) {
                let that = this;
                let conf = that.config.classes[className] || {};
                this.addStyle(".uml-class-name-rect", style, conf.params);
            }
            addStyleClassAttrsRec(className, style) {
                let that = this;
                let conf = that.config.classes[className] || {};
                this.addStyle(".uml-class-attrs-rect", style, conf.params);
            }
            addStyleClassMethodsRec(className, style) {
                let that = this;
                let conf = that.config.classes[className] || {};
                this.addStyle(".uml-class-methods-rect", style, conf.params);
            }
            addStyleClassAttrsText(className, style) {
                let that = this;
                let conf = that.config.classes[className] || {};
                this.addStyle(".uml-class-attrs-text", style, conf.params);
            }
            addStyleClassMethodsText(className, style) {
                let that = this;
                let conf = that.config.classes[className] || {};
                this.addStyle(".uml-class-methods-text", style, conf.params);
            }
            render(parent) {
                let that = this;
                if (!that.container) {
                    if (!parent)
                        parent = document.createElement("div");
                    var paper = new joint.dia.Paper({
                        el: $(parent),
                        width: that.config.w,
                        height: that.config.h,
                        gridSize: 1,
                        model: that.graph
                    });
                }
                let classes = {};
                Object.keys(that.config.classes).forEach((key) => {
                    let conf = that.config.classes[key];
                    classes[key] = new conf.type(conf.params);
                });
                let relations = [];
                that.config.relations.forEach((conf) => {
                    let srcClass = classes[conf.params.src];
                    let destClass = classes[conf.params.dest];
                    if (srcClass && destClass)
                        relations.push(new conf.type({
                            source: { id: srcClass.id },
                            target: { id: destClass.id }
                        }));
                });
                _.each(classes, function (c) { that.graph.addCell(c); });
                _.each(relations, function (r) { that.graph.addCell(r); });
                return that.container = parent;
            }
            addType(name, title, position, size, type, options) {
                let that = this;
                type = type || that.uml.Class;
                size = size || {};
                position = position || {};
                options = options || {};
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
                        attrs: {}
                    }
                };
                that.fixeClassSize(that.config.classes[name]);
            }
            addRelation(src, target, type) {
                let that = this;
                type = type || that.uml.Generalization;
                that.config.relations.push({ type: type, params: { src: src, dest: target } });
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
            addStyle(name, style, classParams) {
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
                classParams.attrs[name] = lstyle;
            }
        }
        diagram.DiagramClass = DiagramClass;
        class DiagramMeta {
            constructor(entities) {
                let that = this;
                that.entities = entities || [];
                that.init();
            }
            render(parent) {
                let that = this;
                return that.dc.render(parent);
            }
            init() {
                let that = this;
                that.dc = new Library.diagram.DiagramClass();
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
            }
            relations(entity, relations) {
                let that = this;
                relations = relations || {};
                Object.keys(relations).forEach(key => {
                    let rel = relations[key];
                    that.dc.addAssociation(entity, rel.foreignEntity);
                });
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
        }
        diagram.DiagramMeta = DiagramMeta;
    })(diagram = Library.diagram || (Library.diagram = {}));
    var Test;
    (function (Test) {
        function testLibraryDiagramClass() {
            let dc = new Library.diagram.DiagramClass();
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
            dc.addClass("E-mail", "E-mail", { x: 600, y: 200 });
            dc.addGeneralization("Person", "IMammal");
            dc.addAggregation("Address", "Person");
            dc.addComposition("E-mail", "Person");
            dc.addGeneralization("Man", "Person");
            dc.addGeneralization("Woman", "Person");
            dc.render($("#paper").get(0));
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
            let dc = new Library.diagram.DiagramMeta(entities);
            dc.render($("#paper2").get(0));
        }
        testLibraryDiagramClass();
        testLibraryDiagramMeta();
    })(Test || (Test = {}));
})(Library || (Library = {}));
