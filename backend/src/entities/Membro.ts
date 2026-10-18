export enum Funcao {
    dono,
    membro
}

export class Membro {
    private _idUser: string;
    private _idGrupo: string;
    private _funcao: Funcao;


    constructor(idUser: string, idGrupo: string, funcao: Funcao) {
        this._idUser = idUser;
        this._idGrupo = idGrupo;
        this._funcao = funcao;
    }


    get idUser(): string {
        return this._idUser;
    }

    set idUser(value: string) {
        this._idUser = value;
    }

    get idGrupo(): string {
        return this._idGrupo;
    }

    set idGrupo(value: string) {
        this._idGrupo = value;
    }

    get funcao(): Funcao {
        return this._funcao;
    }

    set funcao(value: Funcao) {
        this._funcao = value;
    }
}