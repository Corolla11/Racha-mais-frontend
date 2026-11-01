export enum TipoChave {
    telefone,
    cpf,
    email,
    aleatoria
}

export class chavePix {
    private _idUser: number;
    private _tipoChave: TipoChave;
    private _chave: string


    constructor(idUser: number, tipoChave: TipoChave, chave: string) {
        this._idUser = idUser;
        this._tipoChave = tipoChave;
        this._chave = chave;
    }


    get idUser(): number {
        return this._idUser;
    }

    set idUser(value: number) {
        this._idUser = value;
    }

    get tipoChave(): TipoChave {
        return this._tipoChave;
    }

    set tipoChave(value: TipoChave) {
        this._tipoChave = value;
    }

    get chave(): string {
        return this._chave;
    }

    set chave(value: string) {
        this._chave = value;
    }
}