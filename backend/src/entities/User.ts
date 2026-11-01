export class User {
    private _id: string;
    private _nome: string;
    private _email: string;
    private _senha: string;
    private _fotoPerfil: string;


    constructor(id: string, nome: string, email: string, senha: string, fotoPerfil: string = "padrao.webp") {
        this._id = id;
        this._nome = nome;
        this._email = email;
        this._senha = senha;
        this._fotoPerfil = fotoPerfil;
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

    get email(): string {
        return this._email;
    }

    set email(value: string) {
        this._email = value;
    }

    get senha(): string {
        return this._senha;
    }

    set senha(value: string) {
        this._senha = value;
    }

    get fotoPerfil(): string {
        return this._fotoPerfil;
    }

    set fotoPerfil(value: string) {
        this._fotoPerfil = value;
    }
}