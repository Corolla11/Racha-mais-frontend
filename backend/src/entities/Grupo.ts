export class Grupo {
    private _id: string;
    private _nome: string;
    private _descricao: string;

    constructor(id: string, nome: string, descricao: string) {
        this._id = id;
        this._nome = nome;
        this._descricao = descricao;
    }


    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get nome(): string {
        return this._nome;
    }

    set nome(value: string) {
        this._nome = value;
    }

    get descricao(): string {
        return this._descricao;
    }

    set descricao(value: string) {
        this._descricao = value;
    }
}