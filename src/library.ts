declare var $: any;
declare var joint: any;
declare var _: any;

namespace Library {
    export module diagram {
        export interface IStyle {
            bg?: string;
            color?: string;
            fontSize?: number;
            yAlign?: { middle }
        }
        export interface IPosition {
            x?: number;
            y?: number;
        }
        export interface ISize {
            w?: number;
            h?: number;
        }
        export class DiagramClass {
            private config: any;
            private container: HTMLElement;
            private graph: any;
            private uml: any;

            constructor(config?: any) {
                let that = this;
                that.config = config || {};
                that.config.classes = that.config.classes || {};
                that.config.relations = that.config.relations || [];
                that.config.w = that.config.w || 800;
                that.config.h = that.config.h || 600,
                    that.graph = new joint.dia.Graph();
                that.uml = joint.shapes.uml;
            }
            public addInterface(name: string, title: string, position?: IPosition, size?: ISize, options?: any) {
                let that = this;
                that.addType(name, title, position, size, that.uml.Interface, options);
            }
            public addAbstract(name: string, title: string, position?: IPosition, size?: ISize, options?: any) {
                let that = this;
                that.addType(name, title, position, size, that.uml.Abstract, options);
            }
            public addClass(name: string, title: string, position?: IPosition, size?: ISize, options?: any) {
                let that = this;
                that.addType(name, title, position, size, that.uml.Class, options);
            }
            public addAttribute(className: string, attrs: string | string[]) {
                let that = this;
                let classe = that.config.classes[className];
                if (!classe) return;
                if (typeof attrs === "string")
                    classe.params.attributes.push(attrs);
                else
                    attrs.forEach((v) => {
                        classe.params.attributes.push(v);
                    });
                that.fixeClassSize(classe);
            }
            public addMethod(className: string, methods: string | string[]) {
                let that = this;
                let classe = that.config.classes[className];
                if (!classe) return;
                if (typeof methods === "string")
                    classe.params.methods.push(methods);
                else
                    methods.forEach((v) => {
                        classe.params.methods.push(v);
                    });
                that.fixeClassSize(classe);
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
            public addStyleClassNameRec(className: string, style: IStyle) {
                let that = this;
                let conf = that.config.classes[className] || {};
                this.addStyle(".uml-class-name-rect", style, conf.params);
            }
            public addStyleClassAttrsRec(className: string, style: IStyle) {
                let that = this;
                let conf = that.config.classes[className] || {};
                this.addStyle(".uml-class-attrs-rect", style, conf.params);
            }
            public addStyleClassMethodsRec(className: string, style: IStyle) {
                let that = this;
                let conf = that.config.classes[className] || {};
                this.addStyle(".uml-class-methods-rect", style, conf.params);
            }
            public addStyleClassAttrsText(className: string, style: IStyle) {
                let that = this;
                let conf = that.config.classes[className] || {};
                this.addStyle(".uml-class-attrs-text", style, conf.params);
            }
            public addStyleClassMethodsText(className: string, style: IStyle) {
                let that = this;
                let conf = that.config.classes[className] || {};
                this.addStyle(".uml-class-methods-text", style, conf.params);
            }
            public render(parent: HTMLElement) {
                let that = this;
                if (!that.container) {
                    if (!parent) parent = document.createElement("div");
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
            private addType(name: string, title: string, position?: IPosition, size?: ISize, type?: any, options?: any) {
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
            private addRelation(src: string, target: string, type: any) {
                let that = this;
                type = type || that.uml.Generalization;
                that.config.relations.push({ type: type, params: { src: src, dest: target } });
            }
            private fixeClassSize(conf: any) {
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
            private addStyle(name: string, style: IStyle, classParams: any) {
                let that = this;
                style = style || {};
                let lstyle: any = {};
                if (style.bg) lstyle.fill = style.bg;
                if (style.color) lstyle.stroke = style.color;
                if (style.fontSize) lstyle["stroke-width"] = style.fontSize;
                if (style.yAlign) lstyle["y-alignment"] = style.yAlign;
                classParams.attrs[name] = lstyle;
            }
        }
        export class DiagramMeta {
            private entities: any;
            private dc: Library.diagram.DiagramClass;

            constructor(entities?: any[]) {
                let that = this;
                that.entities = entities || [];
                that.init();
            }
            public render(parent: HTMLElement) {
                let that = this;
                return that.dc.render(parent);
            }
            private init() {
                let that = this;
                that.dc = new Library.diagram.DiagramClass();
                that.entities.forEach(entity => {
                    that.entity(entity, entity.definitions);
                });
            }
            private entity(entity: any, definitions: any) {
                let that = this;
                entity = entity || {};
                that.dc.addClass(entity.name, entity.title || entity.name);
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
            }
            private relations(entity: string, relations: any) {
                let that = this;
                relations = relations || {};
                Object.keys(relations).forEach(key => {
                    let rel = relations[key];
                    that.dc.addAssociation(entity, rel.foreignEntity);
                });
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
        }
    }

    namespace Test {

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

        // var graph = new joint.dia.Graph();

        // var paper = new joint.dia.Paper({
        //     el: $('#paper'),
        //     width: 800,
        //     height: 600,
        //     gridSize: 1,
        //     model: graph
        // });


        // var uml = joint.shapes.uml;

        // var classes = {

        //     mammal: new uml.Interface({
        //         position: { x: 300, y: 50 },
        //         size: { width: 240, height: 100 },
        //         name: 'Mammal',
        //         attributes: ['dob: Date'],
        //         methods: ['+ setDateOfBirth(dob: Date): Void', '+ getAgeAsDays(): Numeric'],
        //         attrs: {
        //             '.uml-class-name-rect': {
        //                 fill: '#feb662',
        //                 stroke: '#ffffff',
        //                 'stroke-width': 0.5
        //             },
        //             '.uml-class-attrs-rect, .uml-class-methods-rect': {
        //                 fill: '#fdc886',
        //                 stroke: '#fff',
        //                 'stroke-width': 0.5
        //             },
        //             '.uml-class-attrs-text': {
        //                 ref: '.uml-class-attrs-rect',
        //                 'ref-y': 0.5,
        //                 'y-alignment': 'middle'
        //             },
        //             '.uml-class-methods-text': {
        //                 ref: '.uml-class-methods-rect',
        //                 'ref-y': 0.5,
        //                 'y-alignment': 'middle'
        //             }

        //         }
        //     }),

        //     person: new uml.Abstract({
        //         position: { x: 300, y: 300 },
        //         size: { width: 260, height: 100 },
        //         name: 'Person',
        //         attributes: ['firstName: String', 'lastName: String'],
        //         methods: ['+ setName(first: String, last: String): Void', '+ getName(): String'],
        //         attrs: {
        //             '.uml-class-name-rect': {
        //                 fill: '#68ddd5',
        //                 stroke: '#ffffff',
        //                 'stroke-width': 0.5
        //             },
        //             '.uml-class-attrs-rect, .uml-class-methods-rect': {
        //                 fill: '#9687fe',
        //                 stroke: '#fff',
        //                 'stroke-width': 0.5
        //             },
        //             '.uml-class-methods-text, .uml-class-attrs-text': {
        //                 fill: '#fff'
        //             }
        //         }
        //     }),

        //     bloodgroup: new uml.Class({
        //         position: { x: 20, y: 190 },
        //         size: { width: 220, height: 100 },
        //         name: 'BloodGroup',
        //         attributes: ['bloodGroup: String'],
        //         methods: ['+ isCompatible(bG: String): Boolean'],
        //         attrs: {
        //             '.uml-class-name-rect': {
        //                 fill: '#ff8450',
        //                 stroke: '#fff',
        //                 'stroke-width': 0.5,
        //             },
        //             '.uml-class-attrs-rect, .uml-class-methods-rect': {
        //                 fill: '#fe976a',
        //                 stroke: '#fff',
        //                 'stroke-width': 0.5
        //             },
        //             '.uml-class-attrs-text': {
        //                 ref: '.uml-class-attrs-rect',
        //                 'ref-y': 0.5,
        //                 'y-alignment': 'middle'
        //             },
        //             '.uml-class-methods-text': {
        //                 ref: '.uml-class-methods-rect',
        //                 'ref-y': 0.5,
        //                 'y-alignment': 'middle'
        //             }
        //         }
        //     }),

        //     address: new uml.Class({
        //         position: { x: 630, y: 190 },
        //         size: { width: 160, height: 100 },
        //         name: 'Address',
        //         attributes: ['houseNumber: Integer', 'streetName: String', 'town: String', 'postcode: String'],
        //         methods: [],
        //         attrs: {
        //             '.uml-class-name-rect': {
        //                 fill: '#ff8450',
        //                 stroke: '#fff',
        //                 'stroke-width': 0.5
        //             },
        //             '.uml-class-attrs-rect, .uml-class-methods-rect': {
        //                 fill: '#fe976a',
        //                 stroke: '#fff',
        //                 'stroke-width': 0.5
        //             },
        //             '.uml-class-attrs-text': {
        //                 'ref-y': 0.5,
        //                 'y-alignment': 'middle'
        //             }
        //         }

        //     }),

        //     man: new uml.Class({
        //         position: { x: 200, y: 500 },
        //         size: { width: 180, height: 50 },
        //         name: 'Man',
        //         attrs: {
        //             '.uml-class-name-rect': {
        //                 fill: '#ff8450',
        //                 stroke: '#fff',
        //                 'stroke-width': 0.5
        //             },
        //             '.uml-class-attrs-rect, .uml-class-methods-rect': {
        //                 fill: '#fe976a',
        //                 stroke: '#fff',
        //                 'stroke-width': 0.5
        //             }
        //         }
        //     }),

        //     woman: new uml.Class({
        //         position: { x: 450, y: 500 },
        //         size: { width: 180, height: 50 },
        //         name: 'Woman',
        //         methods: ['+ giveABrith(): Person []'],
        //         attrs: {
        //             '.uml-class-name-rect': {
        //                 fill: '#ff8450',
        //                 stroke: '#fff',
        //                 'stroke-width': 0.5
        //             },
        //             '.uml-class-attrs-rect, .uml-class-methods-rect': {
        //                 fill: '#fe976a',
        //                 stroke: '#fff',
        //                 'stroke-width': 0.5
        //             },
        //             '.uml-class-methods-text': {
        //                 'ref-y': 0.5,
        //                 'y-alignment': 'middle'
        //             }
        //         }
        //     })


        // };

        // _.each(classes, function (c) { graph.addCell(c); });

        // var relations = [
        //     new uml.Generalization({ source: { id: classes.man.id }, target: { id: classes.person.id } }),
        //     new uml.Generalization({ source: { id: classes.woman.id }, target: { id: classes.person.id } }),
        //     new uml.Implementation({ source: { id: classes.person.id }, target: { id: classes.mammal.id } }),
        //     new uml.Aggregation({ source: { id: classes.person.id }, target: { id: classes.address.id } }),
        //     new uml.Composition({ source: { id: classes.person.id }, target: { id: classes.bloodgroup.id } })
        // ];

        // _.each(relations, function (r) { graph.addCell(r); });

        // Class
    }
}